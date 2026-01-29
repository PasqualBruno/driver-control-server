import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpResponse } from "../../utils/httpResponse";
import { IMaintenanceHistoryCreateDTO } from "./interfaces";

async function createMaintenanceHistory(
  req: Request<{}, {}, IMaintenanceHistoryCreateDTO>,
  res: Response,
) {
  const { maintenanceId, paidPrice } = req.body;

  if (!req.userId) HttpResponse.unauthorized(res);
  if (!maintenanceId)
    HttpResponse.badRequest(res, "Erro", "A manutenção precisa ser informada");

  //Criar um histórico significa que a pessoa realizou uma manutenção
  //Ela irá refletir um estado de realizado, ou seja, a manutenção foi feita
  //Com isso, alguns dados na maintenance deverão serem atualizados.

  const maintenanceExists = await prisma.maintenance.findFirst({
    where: { id: maintenanceId, userId: req.userId },
  });

  if (!maintenanceExists) {
    return HttpResponse.notFound(res, "Erro", "Manutenção nao encontrada");
  }

  //Vou precisar verificar se o valor do KM informado e maior que o KM do veiculo, caso seja

  await prisma.$transaction(async (tx) => {
    //Preciso verificar o control e atualizar o correspondente atualizando o km do veiculo informado e adicionando o valor de controle sobre ele.

    // Caso seja em dias, devo adicionar o valor do controle a quantidade de dias.
    const maintenance = await prisma.maintenance.findFirst({
      where: { id: maintenanceId },
    });

    if (!maintenance) {
      return HttpResponse.notFound(res, "Erro", "Manutenção nao encontrada");
    }

    await prisma.maintenance.update({
      where: { id: maintenanceId },
      data: {
        status: "OK",
      },
    });
  });

  await prisma?.maintenanceHistory.create({
    data: {
      maintenanceId: req.body.maintenanceId,
      paidPrice: req.body.paidPrice,
    },
  });
}
