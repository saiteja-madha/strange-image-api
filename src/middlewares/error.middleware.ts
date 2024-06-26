import { Request, Response, NextFunction } from "express";
import Logger from "../utils/Logger";
import HttpException from "../exceptions/HttpException";

export default function errorMiddleware(error: HttpException, _req: Request, res: Response, next: NextFunction) {
    const status = error.status || 500;
    Logger.error("errorMiddleware", error);
    res.status(status).send({
        success: false,
        code: status,
        message:
            "500 Internal Error, Something was error on our side and this should not happen! Please try again later.",
    });
    next();
}
