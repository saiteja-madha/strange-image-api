import { Request, Response } from "express";
import ResponseUtil from "../../utils/ResponseUtil";
import { Canvacord } from "canvacord";

/**
 * @swagger
 * /filters/sharpen:
 *   get:
 *     summary: Sharpens an image
 *     tags: [Filters]
 *     parameters:
 *       - in: query
 *         name: image
 *         description: The image url
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: level
 *         description: Sharpness intensity
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: The buffer containing the image data
 *         image/png:
 *           schema:
 *             type: binary
 */

export default async (req: Request, res: Response): Promise<any> => {
    try {
        const { image, level } = req.query;
        if (!image) return ResponseUtil.missingParams(res, "image");
        if (isNaN(Number(level))) return ResponseUtil.badRequest(res, "level must be a number");
        const buffer = await Canvacord.sharpen(image as string, Number(level));
        return ResponseUtil.success(res, buffer);
    } catch (ex) {
        return ResponseUtil.serverError(res, ex as Error);
    }
};
