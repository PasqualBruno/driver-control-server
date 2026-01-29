import { ShiftStatus } from "@prisma/client";
import { Request, Response } from "express";
import { HttpResponse } from "../../utils/httpResponse";

export async function createShift(
  req: Request<{}, {}, { vehicleId: string }>,
  res: Response,
) {
  const { userId } = req;
  const { vehicleId } = req.body;

  if (!userId) {
    return HttpResponse.unauthorized(res);
  }

  if (!vehicleId) {
    return HttpResponse.badRequest(
      res,
      "Erro",
      "É necessário informar um veículo",
    );
  }

  const isAnotherShiftOpen = await prisma?.shift.findFirst({
    where: {
      userId,
      shiftStatus: "OPEN",
    },
  });

  if (isAnotherShiftOpen) {
    return HttpResponse.conflict(
      res,
      "Erro",
      "Não é possível um turno enquanto outro estiver aberto",
    );
  }

  try {
    const shift = await prisma?.shift.create({
      data: {
        userId,
        vehicleId,
      },
    });
    return HttpResponse.created(
      res,
      shift,
      "Sucesso",
      "Turno iniciado com sucesso",
    );
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

export async function listShiftsByVehicle(
  req: Request<{ vehicleId: string }>,
  res: Response,
) {
  const { userId } = req;
  const { vehicleId } = req.params;

  if (!userId) {
    return HttpResponse.unauthorized(res);
  }

  if (!vehicleId) {
    return HttpResponse.badRequest(res, "Error", "Vehicle ID is required");
  }

  try {
    const shifts = await prisma?.shift.findMany({
      where: {
        userId,
        vehicleId,
      },
      include: { transactions: true },
    });
    return HttpResponse.ok(
      res,
      shifts,
      "Sucesso",
      "Listagem de turnos encontrada",
    );
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

export async function getShiftDetails(
  req: Request<{ shiftId: string }, {}, { id: string }>,
  res: Response,
) {
  const { userId } = req;
  const { shiftId } = req.params;

  if (!userId) {
    return HttpResponse.unauthorized(res);
  }

  if (!shiftId) {
    return HttpResponse.badRequest(res, "Error", "Shift ID is required");
  }

  try {
    const shift = await prisma?.shift?.findFirst({
      where: {
        id: shiftId,
        userId,
      },
      include: { transactions: true },
    });
    return HttpResponse.ok(res, shift, "Success", "Shift details");
  } catch (error) {}
}

export async function updateShift(
  req: Request<{ shiftId: string }, {}, { shiftStatus: ShiftStatus }>,
  res: Response,
) {
  const { userId } = req;
  const { shiftId } = req.params;
  const { shiftStatus } = req.body;

  if (!userId) {
    return HttpResponse.unauthorized(res);
  }

  if (!shiftId) {
    return HttpResponse.badRequest(res, "Error", "Shift ID is required");
  }

  try {
    const shift = await prisma?.shift.update({
      where: {
        id: shiftId,
        userId,
      },

      //TODO - Verificar a lógica de criar períodos dentro de um turno
      // abrir - fechar --> Cria período
      //Abrir - Pausar --> Cria um período completo automaticamente
      //Pausar - abrir --> Inicia um turno que precisará ser fechado
      //Pausar - fechar --> Não cria período

      data: {
        shiftStatus,
      },
    });
    return HttpResponse.ok(res, shift, "Sucesso", "Shift details");
  } catch (error) {}
}

export async function deleteShift(
  req: Request<{ shiftId: string }>,
  res: Response,
) {
  const { userId } = req;
  const { shiftId } = req.params;

  if (!userId) {
    return HttpResponse.unauthorized(res);
  }

  if (!shiftId) {
    return HttpResponse.badRequest(
      res,
      "Erro",
      "É necessário informar um turno",
    );
  }

  //TODO - Testar enquanto usa o app se da para utilizar de forma correta as transactions sem shift.
  await prisma?.transaction.updateMany({
    where: {
      shiftId,
    },
    data: {
      shiftId: null,
    },
  });

  try {
    const shift = await prisma?.shift.delete({
      where: {
        id: shiftId,
        userId,
      },
    });
    return HttpResponse.ok(res, shift, "Sucesso", "O turno foi deletado");
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}
