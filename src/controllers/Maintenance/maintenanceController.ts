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
        cost: data.cost,
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
export const getMaintenances = async (
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

    const existingMaintenance = await prisma.maintenance.findFirst({
      where: { id, userId },
    });

    if (!existingMaintenance) {
      return HttpResponse.notFound(res, "Error", "Manutenção nao encontrada");
    }

    const updatedMaintenance = await prisma.maintenance.update({
      where: { id },
      data: {
        ...data,

        lastChangedDate: data.lastChangedDate
          ? new Date(data.lastChangedDate)
          : undefined,
        nextChangeDate: data.nextChangeDate
          ? new Date(data.nextChangeDate)
          : undefined,
      },
    });

    return HttpResponse.ok(
      res,
      updatedMaintenance,
      "Sucesso",
      "Manutenção atualizada com sucesso",
    );
  } catch (error) {
    HttpResponse.serverError(res, error);
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

    if (!id)
      return HttpResponse.badRequest(
        res,
        "Error",
        "É necessário informar uma manutenção",
      );

    const result = await prisma.maintenance.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (result.count === 0) {
      return HttpResponse.notFound(res, "Error", "Manutenção nao encontrada");
    }

    return HttpResponse.ok(
      res,
      null,
      "Sucesso",
      "Manutenção deletada com sucesso",
    );
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
};
