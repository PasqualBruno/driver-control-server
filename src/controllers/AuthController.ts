import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

// Helper interno (não precisa de try/catch aqui se quem chama já trata)
async function findUserUnique(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function checkEmail(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await findUserUnique(email);

    return res.status(200).json({
      data: {
        isAvailable: !user,
        email: email,
      },
    });
  } catch (error) {
    console.error(error); // Importante para você ver o erro no terminal
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    // Validação básica
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    // Verifica duplicação
    const userExists = await findUserUnique(email);
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash da senha (pode falhar, então fica dentro do try)
    const hashedPassword = await bcrypt.hash(password, 8);

    // Criação no banco
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Falha ao criar conta" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Busca usuário
    const user = await findUserUnique(email);
    if (!user)
      return res.status(400).json({ error: "Email ou senha inválidos" });

    // Compara senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).json({ error: "Email ou senha inválidos" });

    // Gera token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // Isso é um erro de configuração do servidor, logue como erro crítico
      console.error("ERRO CRÍTICO: JWT_SECRET não definido");
      return res.status(500).json({ error: "Erro interno de autenticação" });
    }

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: "7d" });

    const { password: _, ...userWithoutPassword } = user;

    return res.json({ user: userWithoutPassword, token });
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
