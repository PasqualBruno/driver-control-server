import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpResponse } from "../../utils/httpResponse";
import {
  MaintenanceControl,
  MaintenanceStatus,
} from "../Maintenance/interface";
import {
  IMaintenanceHistoryCreateDTO,
  IMaintenanceHistoryUpdateDTO,
} from "./interfaces";

export async function createHistory(
  req: Request<{}, {}, IMaintenanceHistoryCreateDTO>,
  res: Response,
) {
  try {
    const {
      maintenanceId,
      paidPrice,
      mechanicShopName,
      informedKm,
      observation,
    } = req.body;

    if (!maintenanceId)
      return HttpResponse.badRequest(
        res,
        "Erro",
        "A manutenção precisa ser informada",
      );

    //Criar um histórico significa que a pessoa realizou uma manutenção
    //Ela irá refletir um estado de realizado, ou seja, a manutenção foi feita
    //Com isso, alguns dados na maintenance deverão serem atualizados.

    const maintenance = await prisma.maintenance.findFirst({
      where: { id: maintenanceId, userId: req.userId },
    });

    if (!maintenance) {
      return HttpResponse.notFound(res, "Erro", "Manutenção nao encontrada");
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: maintenance.vehicleId, userId: req.userId },
    });

    if (!vehicle) {
      return HttpResponse.notFound(res, "Erro", "Veiculo nao encontrado");
    }

    await prisma.$transaction(async (tx) => {
      if (maintenance?.controlBy === MaintenanceControl.KM) {
        const isInformedKmHigher = informedKm > vehicle.currentKm;

        if (isInformedKmHigher) {
          await tx.vehicle.update({
            where: { id: vehicle.id, userId: req.userId },
            data: { currentKm: informedKm },
          });
        }

        await tx.maintenance.update({
          where: { id: maintenance.id },
          data: {
            nextChangeKm: informedKm + maintenance.controlValue,
            status: MaintenanceStatus.OK,
          },
        });
      }

      if (maintenance?.controlBy === MaintenanceControl.TIME) {
        await tx.maintenance.update({
          where: { id: maintenance.id },
          data: {
            nextChangeDate: new Date(
              new Date().getTime() +
                maintenance.controlValue * 24 * 60 * 60 * 1000,
            ),
            status: MaintenanceStatus.OK,
          },
        });
      }

      await tx?.maintenanceHistory.create({
        data: {
          maintenanceId: req.body.maintenanceId,
          paidPrice: paidPrice,
          mechanicShopName: mechanicShopName,
          informedKm: informedKm,
          observation: observation,
        },
      });
    });

    return HttpResponse.created(res, "Sucesso", "Histórico criado com sucesso");
  } catch (error) {
    HttpResponse.serverError(res);
  }
}

export async function listHistory(
  req: Request<{ maintenanceId: string }, {}, {}>,
  res: Response,
) {
  try {
    const { maintenanceId } = req.params;

    if (!maintenanceId)
      return HttpResponse.badRequest(
        res,
        "Erro",
        "A manutenção precisa ser informada",
      );

    const maintenanceHistory = await prisma.maintenanceHistory.findMany({
      where: { maintenanceId, maintenance: { userId: req.userId } },
    });

    return HttpResponse.ok(
      res,
      maintenanceHistory,
      "Sucesso",
      maintenanceHistory.length > 0
        ? "Histórico da manutenção encontrado"
        : "Nenhum histórico registrado para esta manutenção",
    );
  } catch (error) {
    HttpResponse.serverError(res);
  }
}

export async function historyDetails(
  req: Request<{ historyId: string }, {}, {}>,
  res: Response,
) {
  const { historyId } = req.params;

  if (!historyId)
    return HttpResponse.badRequest(
      res,
      "Erro",
      "O histórico precisa ser informado",
    );

  try {
    const history = await prisma.maintenanceHistory.findFirst({
      where: { id: historyId, maintenance: { userId: req.userId } },
      include: { maintenance: true },
    });

    if (!history) {
      return HttpResponse.notFound(res, "Erro", "Histórico nao encontrado");
    }

    return HttpResponse.ok(
      res,
      history,
      "Sucesso",
      "Histórico da manutenção encontrado",
    );
  } catch (error) {
    HttpResponse.serverError(res);
  }
}

export async function updateMaintenanceHistory(
  req: Request<{ historyId: string }, {}, IMaintenanceHistoryUpdateDTO>,
  res: Response,
) {
  const { historyId } = req.params;

  if (!historyId)
    return HttpResponse.badRequest(
      res,
      "Erro",
      "O histórico precisa ser informado",
    );

  const existingHistory = await prisma.maintenanceHistory.findFirst({
    where: { id: historyId, maintenance: { userId: req.userId } },
  });

  if (!existingHistory) {
    return HttpResponse.notFound(res, "Erro", "Histórico nao encontrado");
  }

  try {
    const history = await prisma.maintenanceHistory.update({
      where: { id: historyId },
      data: {
        paidPrice: req.body.paidPrice,
        mechanicShopName: req.body.mechanicShopName,
        informedKm: req.body.informedKm,
        observation: req.body.observation,
      },
    });

    return HttpResponse.ok(
      res,
      history,
      "Sucesso",
      "Histórico da manutenção atualizado",
    );
  } catch (error) {
    HttpResponse.serverError(res);
  }
}

export async function deleteMaintenanceHistory(
  req: Request<{ historyId: string }, {}, {}>,
  res: Response,
) {
  const { historyId } = req.params;

  if (!historyId)
    return HttpResponse.badRequest(
      res,
      "Erro",
      "O histórico precisa ser informado",
    );

  const history = await prisma.maintenanceHistory.findFirst({
    where: { id: historyId, maintenance: { userId: req.userId } },
  });

  if (!history)
    return HttpResponse.notFound(res, "Erro", "Histórico nao encontrado");

  try {
    await prisma.maintenanceHistory.delete({
      where: {
        id: historyId,
      },
    });

    return HttpResponse.ok(
      res,
      null,
      "Sucesso",
      "Histórico da manutenção deletado",
    );
  } catch (error) {
    HttpResponse.serverError(res);
  }
}
