import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpResponse } from "../../utils/httpResponse";
import {
  ITransactionCreateDTO,
  ITransactionCreateSearchParams,
} from "./interfaces";

export async function createTransaction(
  req: Request<{}, {}, ITransactionCreateDTO>,
  res: Response,
) {
  try {
    const { vehicleId, type, category, amount, description, kmAtTime, status } =
      req.body;

    const userId = req.userId;

    if (!type || !category || !amount) {
      return HttpResponse.badRequest(
        res,
        "Categoria e tipo de transação são obrigatórios",
        "Error",
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        vehicleId,
        type,
        category,
        amount,
        description,
        kmAtTime,
        status,
      },
    });

    return HttpResponse.created(
      res,
      transaction,
      "Success",
      "Transação criada com sucesso",
    );
  } catch (error) {
    console.error(error);
    return HttpResponse.serverError(res, error);
  }
}

//TODO - Implementar paginação e filtro por category
export async function listTransactions(
  req: Request<{}, {}, {}, ITransactionCreateSearchParams>,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return HttpResponse.unauthorized(res);
    }

    const { day, month, year, vehicleId } = req.query;

    let whereClause: Prisma.TransactionWhereInput = {
      userId,
    };

    if (vehicleId) {
      whereClause.vehicleId = vehicleId;
    }

    if (year && month) {
      const y = Number(year);
      const m = Number(month) - 1;

      if (day) {
        const d = Number(day);

        const startOfDay = new Date(y, m, d, 0, 0, 0, 0);
        const endOfDay = new Date(y, m, d, 23, 59, 59, 999);

        whereClause.date = {
          gte: startOfDay,
          lte: endOfDay,
        };
      } else {
        const startOfMonth = new Date(y, m, 1);
        const endOfMonth = new Date(y, m + 1, 0);

        whereClause.date = {
          gte: startOfMonth,
          lte: endOfMonth,
        };
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        vehicle: {
          select: { model: true, plate: true },
        },
      },
    });

    return res.status(200).json(transactions);
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

export async function getTransactionById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return HttpResponse.unauthorized(res);
    }

    if (!id) {
      return HttpResponse.badRequest(res, "Transação não encontrada", "Error");
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        vehicle: true,
      },
    });

    if (!transaction) {
      return HttpResponse.notFound(res, "Transação não encontrada", "Error");
    }

    return HttpResponse.ok(res, transaction, "Success", "Transação encontrada");
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

export async function updateTransaction(
  req: Request<{ id: string }, {}, Partial<ITransactionCreateDTO>>,
  res: Response,
) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      vehicleId,
      type,
      category,
      amount,
      description,
      date,
      kmAtTime,
      status,
    } = req.body;

    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existingTransaction) {
      return HttpResponse.notFound(res, "Transação não encontrada", "Error");
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        vehicleId,
        type,
        category,
        amount,
        description,
        date: date ? new Date(date) : undefined,
        kmAtTime,
        status,
      },
    });

    return HttpResponse.ok(
      res,
      updatedTransaction,
      "Success",
      "Transação atualizada com sucesso",
    );
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

export async function deleteTransaction(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return HttpResponse.unauthorized(res);
    }

    if (!id) {
      return HttpResponse.badRequest(res, "Transação não encontrada", "Error");
    }

    const count = await prisma.transaction.count({
      where: { id, userId },
    });

    if (count === 0) {
      return HttpResponse.notFound(res, "Transação não encontrada", "Error");
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return HttpResponse.ok(res, null, "Success", "Transação deletada");
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}
