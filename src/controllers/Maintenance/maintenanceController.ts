import { addDays } from "date-fns";
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpResponse } from "../../utils/httpResponse";
import { CreateMaintenanceDTO, UpdateMaintenanceDTO } from "./interface";

// --- CREATE ---
export const createMaintenance = async (req: Request, res: Response) => {
  const data = req.body as CreateMaintenanceDTO;

  try {
    const userId = req.userId;

    if (!userId) {
      return HttpResponse.unauthorized(res);
    }

    let calculatedNextDate = data.nextChangeDate
      ? new Date(data.nextChangeDate)
      : null;

    if (
      data.controlBy === "TIME" &&
      data.lastChangedDate &&
      data.controlValue
    ) {
      calculatedNextDate = addDays(
        new Date(data.lastChangedDate),
        data.controlValue,
      );
    }
    // -----------------------------------

    // Lógica do KM (mantida igual)
    let calculatedNextKm = data.nextChangeKm;
    if (data.controlBy === "KM" && data.lastChangedKm && data.controlValue) {
      calculatedNextKm = data.lastChangedKm + data.controlValue;
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        userId,
        vehicleId: data.vehicleId,
        itemName: data.itemName,
        controlBy: data.controlBy,
        controlValue: data.controlValue,
        estimateCost: data.estimateCost,
        status: data.status || "PENDING",

        lastChangedDate: data.lastChangedDate
          ? new Date(data.lastChangedDate)
          : null,
        nextChangeDate: calculatedNextDate,

        lastChangedKm: data.lastChangedKm || null,
        nextChangeKm: calculatedNextKm,
      },
    });

    return HttpResponse.ok(
      res,
      maintenance,
      "Sucesso",
      "Manutenção criada com sucesso",
    );
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
};
export const getMaintenancesByCar = async (
  req: Request<{ vehicleId: string }>,
  res: Response,
) => {
  try {
    const userId = req.userId;
    const { vehicleId } = req.params;

    if (!userId) return HttpResponse.unauthorized(res);

    if (!vehicleId) {
      return HttpResponse.badRequest(
        res,
        "Error",
        "É necessário ter um veículo selecionado",
      );
    }

    const maintenances = await prisma.maintenance.findMany({
      where: {
        userId,
        vehicleId,
      },
      include: {
        vehicle: { select: { model: true, plate: true } },
        history: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(maintenances);
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
};

export const getMaintenanceById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  if (!id) {
    return HttpResponse.badRequest(res, "Error", "Manutenção nao encontrada");
  }

  try {
    const userId = req.userId;
    if (!req.userId) {
      return HttpResponse.unauthorized(res);
    }

    const maintenance = await prisma.maintenance.findFirst({
      where: {
        id,
        userId,
      },
      include: { vehicle: true },
    });

    if (!maintenance) {
      return HttpResponse.notFound(res, "Error", "Manutenção nao encontrada");
    }

    return res.json(maintenance);
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
};

export const updateMaintenance = async (
  req: Request<{ id: string }, {}, UpdateMaintenanceDTO>,
  res: Response,
) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const userId = req.userId;
    if (!userId) return HttpResponse.unauthorized(res);

    // 1. Busca dados atuais
    const existingMaintenance = await prisma.maintenance.findFirst({
      where: { id, userId },
      include: { vehicle: true },
    });

    if (!existingMaintenance) {
      return HttpResponse.notFound(res, "Error", "Manutenção não encontrada");
    }

    // 2. Verifica se houve mudança de TIPO de controle
    const isControlChanged =
      data.controlBy && data.controlBy !== existingMaintenance.controlBy;

    // --- TRAVA DE SEGURANÇA 1: Mudou o tipo? Exige valor novo. ---
    if (isControlChanged && !data.controlValue) {
      return HttpResponse.badRequest(
        res,
        "Dados incompletos",
        `Você alterou o controle para ${data.controlBy}, então OBRIGATORIAMENTE precisa enviar o novo controlValue.`,
      );
    }

    // --- TRAVA DE SEGURANÇA 2: Validação de KM ---
    if (
      data.lastChangedKm &&
      data.lastChangedKm > existingMaintenance.vehicle.currentKm
    ) {
      return HttpResponse.badRequest(
        res,
        "Inconsistência",
        `O KM informado (${data.lastChangedKm}) é maior que o KM atual do veículo.`,
      );
    }

    const updatedMaintenance = await prisma.$transaction(async (tx) => {
      // Deleta histórico se trocou de carro
      if (data.vehicleId && data.vehicleId !== existingMaintenance.vehicleId) {
        await tx.maintenanceHistory.deleteMany({
          where: { maintenanceId: id },
        });
      }

      // --- DEFINIÇÃO DOS VALORES PARA CÁLCULO ---

      // Se mudou o tipo, a regra é: USA O NOVO e ignora o banco.
      // Se NÃO mudou, aí sim podemos usar o do banco se o usuário não mandou nada.
      const finalControlBy = data.controlBy ?? existingMaintenance.controlBy;

      let finalControlValue: number;

      if (isControlChanged) {
        // REGRA DO USUÁRIO: Se mudou, pega o novo e fim de papo.
        // O TS sabe que existe pq validamos no if lá em cima.
        finalControlValue = data.controlValue!;
      } else {
        // Se não mudou o tipo, mantém o valor antigo se não vier novo.
        finalControlValue =
          data.controlValue ?? existingMaintenance.controlValue;
      }

      // Mesma lógica para as datas e KMs de referência
      const finalLastKm =
        data.lastChangedKm ?? existingMaintenance.lastChangedKm;
      const finalLastDate = data.lastChangedDate
        ? new Date(data.lastChangedDate)
        : existingMaintenance.lastChangedDate;

      // --- CÁLCULO DA PREVISÃO ---
      let nextKm: number | null | undefined = data.nextChangeKm;
      let nextDate: Date | null | undefined = data.nextChangeDate
        ? new Date(data.nextChangeDate)
        : undefined;

      // Se temos um valor de intervalo configurado (e sabemos que ele é confiável)
      if (finalControlValue) {
        if (finalControlBy === "KM" && finalLastKm) {
          nextKm = finalLastKm + finalControlValue;

          // Se mudou o tipo, limpamos (null) a previsão de data antiga
          if (isControlChanged) nextDate = null;
        } else if (finalControlBy === "TIME" && finalLastDate) {
          nextDate = addDays(new Date(finalLastDate), finalControlValue);

          // Se mudou o tipo, limpamos (null) a previsão de KM antiga
          if (isControlChanged) nextKm = null;
        }
      }

      const updated = await tx.maintenance.update({
        where: { id },
        data: {
          ...data,
          lastChangedDate: data.lastChangedDate
            ? new Date(data.lastChangedDate)
            : undefined,

          // Aplica os calculados
          nextChangeKm: nextKm,
          nextChangeDate: nextDate,
        },
      });

      return updated;
    });

    return HttpResponse.ok(
      res,
      updatedMaintenance,
      "Sucesso",
      "Manutenção atualizada com sucesso",
    );
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
};

export const deleteMaintenance = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  try {
    const userId = req.userId;
    if (!userId) return HttpResponse.unauthorized(res);

    if (!id) {
      return HttpResponse.badRequest(
        res,
        "Error",
        "É necessário informar uma manutenção",
      );
    }

    const maintenance = await prisma.maintenance.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!maintenance) {
      return HttpResponse.notFound(res, "Error", "Manutenção não encontrada");
    }

    await prisma.$transaction(async (tx) => {
      await tx.maintenanceHistory.deleteMany({
        where: {
          maintenanceId: id,
        },
      });

      await tx.maintenance.delete({
        where: {
          id,
        },
      });
    });

    return HttpResponse.ok(
      res,
      null,
      "Sucesso",
      "Manutenção e histórico deletados com sucesso",
    );
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
};
