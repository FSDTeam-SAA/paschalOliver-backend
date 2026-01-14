import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

/**
 * Generic request validator middleware
 * @param schema - Zod schema to validate req.body, req.params, req.query, req.cookies
 */
const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // If req.body.value is a string, parse it
      if (req.body?.value && typeof req.body.value === 'string') {
        try {
          req.body.value = JSON.parse(req.body.value);
        } catch {
          return res.status(400).json({
            success: false,
            message: 'Invalid JSON in body.value',
          });
        }
      }

      // Validate the full request
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
      });

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          errorSources: err.issues.map((issue) => ({
            path: String(issue?.path[issue.path.length - 1]),
            message: issue.message,
          })),
        });
      }
      next(err); // pass other errors to global error handler
    }
  };
};

export default validateRequest;
