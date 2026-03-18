import { Request, Response } from "express";
import { Spotify } from "canvacord";
import ResponseUtil from "../../utils/ResponseUtil";

/**
 * @swagger
 * /utils/spotify-card:
 *   get:
 *     summary: Generates a spotify card
 *     tags: [Utils]
 *     parameters:
 *       - in: query
 *         name: image
 *         description: Song image
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: author
 *         description: Artist name
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: album
 *         description: Album name
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start
 *         description: Start timestamp
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: end
 *         description: End timestamp
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: title
 *         description: Title to set
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The buffer containing the image data
 *         image/png:
 *           schema:
 *             type: binary
 */

export default async (req: Request, res: Response): Promise<any> => {
    try {
        const { image } = req.query || "https://cdn.discordapp.com/embed/avatars/0.png";
        const author = req.query.author;
        const album = req.query.album;
        const start = req.query.start;
        const end = req.query.end;
        const title = req.query.title;

        if (isNaN(Number(start))) return ResponseUtil.badRequest(res, "start must be a number");
        if (isNaN(Number(end))) return ResponseUtil.badRequest(res, "end must be a number");

        if (!image || !author || !album || !start || !end || !title) {
            return ResponseUtil.missingParams(res, "image", "author", "album", "start", "end", "title");
        }

        const buffer = await new Spotify()
            .setAuthor(author as string)
            .setAlbum(album as string)
            .setStartTimestamp(Number(start))
            .setEndTimestamp(Number(end))
            .setImage(image as string)
            .setTitle(title as string)
            .build();

        return ResponseUtil.success(res, buffer);
    } catch (ex) {
        return ResponseUtil.serverError(res, ex as Error);
    }
};
