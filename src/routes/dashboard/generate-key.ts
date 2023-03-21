import { Request, Response } from "express";
import User from "../../schemas/User";

export default async (req: Request, res: Response): Promise<any> => {
    if (!req.session.user) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "You are not logged in.",
        });
    }

    let reGen = false;
    let apiKey = User.getToken(req.session.user.id);

    if (!apiKey) reGen = true;
    apiKey = await User.createOrRegenerate(
        req.session.user.id,
        req.session.user.username + "#" + req.session.user.discriminator
    );

    return res.json({
        status: reGen ? "regenerated" : "created",
        apiKey,
    });
};
