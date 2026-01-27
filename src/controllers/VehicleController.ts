import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpResponse } from "../utils/httpResponse";

interface ICreateDTO {
  model: string;
  plate: string;
  currentKm: number;
}

export async function create(req: Request<{}, {}, ICreateDTO>, res: Response) {
  const { model, plate, currentKm } = req.body;

  if (!req.userId) {
    return HttpResponse.unauthorized(res);
  }

  if (!model || !plate || !currentKm) {
    return HttpResponse.badRequest<ICreateDTO>(
      res,
      "All fields are required",
      "Error",
      { model, plate, currentKm },
    );
  }

  try {
    const vehicle = await prisma?.vehicle.create({
      data: {
        userId: req.userId,
        model,
        plate,
        currentKm,
      },
    });

    return HttpResponse.created(
      res,
      vehicle,
      "Success",
      "Vehicle created successfully",
    );
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

export async function getUserVehicles(req: Request, res: Response) {
  if (!req.userId) {
    return HttpResponse.unauthorized(res);
  }

  try {
    const vehicles = await prisma?.vehicle.findMany({
      where: {
        userId: req.userId,
      },
    });
    return HttpResponse.ok(
      res,
      vehicles,
      "Success",
      "Vehicles found successfully",
    );
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

export async function updateVehicle(
  req: Request<
    { vehicleId: string },
    {},
    Partial<{ model: string; plate: string; currentKm: number }>
  >,
  res: Response,
) {
  const { vehicleId } = req.params;
  const { model, plate, currentKm } = req.body;

  if (!req.userId) {
    return HttpResponse.unauthorized(res);
  }

  if (!vehicleId) {
    return HttpResponse.badRequest(res, "Vehicle ID is required", "Error");
  }

  if (!model && !plate && currentKm === undefined) {
    return HttpResponse.badRequest(
      res,
      "At least one field is required",
      "Error",
    );
  }

  try {
    const vehicle = await prisma?.vehicle.update({
      where: {
        id: vehicleId,
        userId: req.userId,
      },
      data: {
        model,
        plate,
        currentKm,
      },
    });
    return HttpResponse.ok(
      res,
      vehicle,
      "Success",
      "Vehicle updated successfully",
    );
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

export async function removeVehicle(
  req: Request<{ vehicleId: string }>,
  res: Response,
) {
  const { vehicleId } = req.params;

  if (!req.userId) {
    return HttpResponse.unauthorized(res);
  }

  if (!vehicleId) {
    return HttpResponse.badRequest(res, "Vehicle ID is required", "Error");
  }

  try {
    const vehicle = await prisma?.vehicle.delete({
      where: {
        id: vehicleId,
        userId: req.userId,
      },
    });
    return HttpResponse.ok(
      res,
      vehicle,
      "Success",
      "Vehicle deleted successfully",
    );
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}
