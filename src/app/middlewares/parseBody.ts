import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';

const parseBody = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) {
      return next();
    }

    req.body = JSON.parse(req.body.data);
    next();
  },
);

export default parseBody;
