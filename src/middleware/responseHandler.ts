import { NextFunction, Request, Response } from "express";

export const responseHandler =
  (controller: (...args: any[]) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await controller(req, res, next);
      if (result?.statusCode) res.status(result.statusCode);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
