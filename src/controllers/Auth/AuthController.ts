import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { HttpResponse } from "../../utils/httpResponse";

async function findUserUnique(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function checkEmail(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return HttpResponse.badRequest(res, "Email is required", "Error");
    }

    const user = await findUserUnique(email);

    return res.status(200).json({
      data: {
        isAvailable: !user,
        email: email,
      },
    });
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return HttpResponse.badRequest(res, "All fields are required", "Error");
    }

    const userExists = await findUserUnique(email);
    if (userExists) {
      return HttpResponse.badRequest(res, "User already exists", "Error");
    }
    const hashedPassword = await bcrypt.hash(password, 8);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return HttpResponse.created(res, "Success", "User created successfully");
  } catch (error) {
    return HttpResponse.serverError(res, error);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return HttpResponse.badRequest(res, "All fields are required", "Error");
    }

    const user = await findUserUnique(email);
    if (!user) return HttpResponse.badRequest(res, "User not found", "Error");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return HttpResponse.badRequest(res, "Invalid password", "Error");
    }

    if (!process.env.JWT_SECRET) {
      return HttpResponse.badRequest(res, "JWT_SECRET not found", "Error");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return HttpResponse.ok<{ token: string; userName: string }>(
      res,
      { token, userName: user.name },
      "Success",
      "Login realizado com sucesso",
    );
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Falha ao realizar login" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    return res.status(200).json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ error: "Falha ao realizar logout" });
  }
}
