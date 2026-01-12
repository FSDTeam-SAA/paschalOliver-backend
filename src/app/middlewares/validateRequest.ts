import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Logic Fix: We wrap everything in an object to match the schema structure
      await schema.parseAsync({
        body: req.body,
        cookies: req.cookies,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default validateRequest;
