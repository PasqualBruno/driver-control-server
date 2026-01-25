import { Response } from "express";

// Interface para garantir a tipagem
export interface ApiResponse<T> {
  title: string;
  message: string;
  data: T | null;
}

export class HttpResponse {
  /**
   * 200 - OK
   */
  static ok<T>(
    res: Response,
    data: T,
    title: string = "Sucesso",
    message: string = "Operação realizada com sucesso",
  ) {
    return res.status(200).json({
      title,
      message,
      data,
    } as ApiResponse<T>);
  }

  /**
   * 201 - Created
   */
  static created<T>(
    res: Response,
    data: T,
    title: string = "Criado",
    message: string = "Registro criado com sucesso",
  ) {
    return res.status(201).json({
      title,
      message,
      data,
    } as ApiResponse<T>);
  }

  /**
   * 400 - Bad Request (Erro de validação)
   */
  static badRequest<T>(
    res: Response,
    message: string = "Dados inválidos",
    title: string = "Atenção",
    data: T | null = null,
  ) {
    return res.status(400).json({
      title,
      message,
      data,
    } as ApiResponse<T>);
  }

  /**
   * 401 - Unauthorized (Token)
   */
  static unauthorized(
    res: Response,
    message: string = "Faça login novamente",
    title: string = "Não autorizado",
  ) {
    return res.status(401).json({
      title,
      message,
      data: null,
    } as ApiResponse<null>);
  }

  static notFound(
    res: Response,
    message: string = "Registro não encontrado",
    title: string = "Não encontrado",
  ) {
    return res.status(404).json({
      title,
      message,
      data: null,
    } as ApiResponse<null>);
  }

  /**
   * 500 - Internal Server Error
   */
  static serverError(res: Response, error?: any) {
    if (error) console.error(error); // Loga o erro no terminal para você ver

    return res.status(500).json({
      title: "Erro interno",
      message: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
      data: null,
    } as ApiResponse<null>);
  }
}
