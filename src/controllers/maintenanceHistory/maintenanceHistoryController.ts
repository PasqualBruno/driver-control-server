import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpResponse } from "../../utils/httpResponse";
import {
  MaintenanceControl,
  MaintenanceStatus,
} from "../Maintenance/interface";
import { IMaintenanceHistoryCreateDTO } from "./interfaces";

async function createHistory(
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
      HttpResponse.badRequest(
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
      where: { id: maintenance.vehicleId },
    });

    if (!vehicle) {
      return HttpResponse.notFound(res, "Erro", "Veiculo nao encontrado");
    }

    await prisma.$transaction(async (tx) => {
      if (maintenance?.controlBy === MaintenanceControl.KM) {
        const isValidKm = vehicle.currentKm >= informedKm;

        if (!isValidKm) {
          return HttpResponse.badRequest(
            res,
            "Erro",
            "O km informado nao pode ser menor que o atual",
          );
        }

        await prisma.maintenance.update({
          where: { id: vehicle.id },
          data: {
            nextChangeKm: informedKm + maintenance.controlValue,
            status: MaintenanceStatus.OK,
          },
        });
      }

      if (maintenance?.controlBy === MaintenanceControl.TIME) {
        await prisma.maintenance.update({
          where: { id: vehicle.id },
          data: {
            nextChangeDate: new Date(
              new Date().getTime() +
                maintenance.controlValue * 24 * 60 * 60 * 1000,
            ),
            status: MaintenanceStatus.OK,
          },
        });
      }

      await prisma?.maintenanceHistory.create({
        data: {
          maintenanceId: req.body.maintenanceId,
          paidPrice: paidPrice,
          mechanicShopName: mechanicShopName,
          informedKm: informedKm,
          observation: observation,
        },
      });
    });
  } catch (error) {
    HttpResponse.serverError(res);
  }
}

async function listHistory(
  req: Request<{}, {}, { maintenanceId: string }>,
  res: Response,
) {
  try {
    const { maintenanceId } = req.body;

    if (!maintenanceId)
      HttpResponse.badRequest(
        res,
        "Erro",
        "A manutenção precisa ser informada",
      );

    const maintenanceHistory = await prisma.maintenanceHistory.findMany({
      where: { maintenanceId },
    });

    return HttpResponse.ok(
      res,
      maintenanceHistory,
      "Sucesso",
      "Histórico da manutenção encontrado",
    );
  } catch (error) {
    HttpResponse.serverError(res);
  }
}

async function historyDetails(req: Request, res: Response) {
  const { historyId } = req.params;
}

async function updateMaintenanceHistory() {}
