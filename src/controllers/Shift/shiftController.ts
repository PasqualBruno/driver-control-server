import { ShiftStatus } from "@prisma/client";
import { Request, Response } from "express";
import { HttpResponse } from "../../utils/httpResponse";

async function create(
  req: Request<{}, {}, { vehicleId: string }>,
  res: Response,
) {
  const { userId } = req;
  const { vehicleId } = req.body;

  if (!userId) {
    return HttpResponse.unauthorized(res);
  }

  if (!vehicleId) {
    return HttpResponse.badRequest(res, "Error", "Vehicle ID is required");
  }

  try {
    const shift = await prisma?.shift.create({
      data: {
        userId,
        vehicleId,
      },
    });
    return HttpResponse.created(res, shift, "Success", "Shift created");
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

async function list(req: Request<{ vehicleId: string }>, res: Response) {
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
    });
    return HttpResponse.ok(res, shifts, "Success", "Shift list");
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

async function getShiftDetails(
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
    });
    return HttpResponse.ok(res, shift, "Success", "Shift details");
  } catch (error) {}
}

async function update(
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
      data: {
        shiftStatus,
      },
    });
    return HttpResponse.ok(res, shift, "Success", "Shift details");
  } catch (error) {}
}

async function deleteShift(req: Request<{ shiftId: string }>, res: Response) {
  const { userId } = req;
  const { shiftId } = req.params;

  if (!userId) {
    return HttpResponse.unauthorized(res);
  }

  if (!shiftId) {
    return HttpResponse.badRequest(
      res,
      "Error",
      "É necessário informar um turno",
    );
  }

  try {
    const shift = await prisma?.shift.delete({
      where: {
        id: shiftId,
        userId,
      },
    });
    return HttpResponse.ok(res, shift, "Success", "O turno foi deletado");
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}
