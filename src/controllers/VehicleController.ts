import { Request, Response } from "express";

export async function create(req: Request, res: Response) {
  const { model, plate, currentKm } = req.body;
  console.log(req.userId);

  if (!req.userId) {
    return res.status(400).json({ error: "Not authenticated" });
  }

  if (!model || !plate || !currentKm) {
    return res.status(400).json({ error: "Missing required fields" });
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
    return res.status(201).json(vehicle);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserVehicles(req: Request, res: Response) {
  if (!req.userId) {
    return res.status(400).json({ error: "Not authenticated" });
  }
  try {
    const vehicles = await prisma?.vehicle.findMany({
      where: {
        userId: req.userId,
      },
    });
    return res.status(200).json(vehicles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
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
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!vehicleId) {
    return res.status(400).json({ error: "Vehicle ID is required" });
  }

  if (!model && !plate && currentKm === undefined) {
    return res.status(400).json({ error: "No data provided to update" });
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
    return res.status(200).json(vehicle);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function removeVehicle(
  req: Request<{ vehicleId: string }>,
  res: Response,
) {
  const { vehicleId } = req.params;
  try {
    if (!req.userId) {
      return res.status(400).json({ error: "Not authenticated" });
    }

    if (!vehicleId) {
      return res.status(400).json({ error: "Vehicle ID is required" });
    }

    const vehicle = await prisma?.vehicle.delete({
      where: {
        id: vehicleId,
        userId: req.userId,
      },
    });
    return res.status(200).json(vehicle);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
