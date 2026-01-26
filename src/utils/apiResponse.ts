import { Response } from "express";

export function sendResponse(
  res: Response,
  statusCode: number,
  title: string,
  message: string,
  data: any = null,
) {
  return res.status(statusCode).json({
    title,
    message,
    data,
  });
}
