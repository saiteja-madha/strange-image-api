import mongoose from "mongoose";
import { log } from "../bot/helpers/webHook";
import Util from "../utils/Util";
import Logger from "../utils/Logger";

interface IUser {
    _id: mongoose.Types.ObjectId;
    discord_id: string;
    username: string;
    token?: string | null;
}

const userSchema = new mongoose.Schema(
    {
        discord_id: { type: String, required: true, unique: true },
        username: { type: String, required: true },
        token: { type: String, required: false },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    },
);

const User = mongoose.model("users", userSchema);
const cache = new Map<string, IUser>();

export default {
    async init() {
        await mongoose.connect(process.env.MONGO_URL as string);
        Logger.info("Connected to MongoDB");

        const users: IUser[] = await User.find({ token: { $ne: null } }).lean();
        for (const user of users) cache.set(user._id.toString(), user);

        Logger.info("Cached all users");
    },

    async createOrRegenerate(discordId: string, username: string, src: "Discord" | "Dashboard"): Promise<string> {
        await mongoose.connect(process.env.MONGO_URL as string);
        const token = Util.generateToken(discordId);
        let created = false;

        let user = await User.findOne({ discord_id: discordId });
        if (user) {
            user.token = token;
            await user.save();
        } else {
            created = true;
            user = new User({
                discord_id: discordId,
                username,
                token,
            });
            await user.save();
        }

        cache.set(user._id.toString(), user.toJSON());
        const EncodedUserID = Buffer.from(user._id.toString()).toString("base64");
        log(
            `Token ${created ? "created" : "regenerated"}`,
            `**Discord ID:** ${discordId}\n**Username:** ${username}\n**Source:** ${src}`,
        );
        return `${EncodedUserID}.${user.token}`;
    },

    get(userId: string): IUser | null {
        return cache.get(userId) ?? null;
    },

    getToken(discordId: string): string | null {
        let user;
        for (const v of cache.values()) if (v.discord_id === discordId) user = v;
        if (!user) return null;
        const EncodedUserID = Buffer.from(user._id.toString()).toString("base64");
        return `${EncodedUserID}.${user.token}`;
    },

    async deleteToken(discordId: string): Promise<void> {
        for (const user of cache.values()) {
            if (user.discord_id === discordId) {
                await User.updateOne({ discord_id: discordId }, { token: null });
                cache.delete(discordId);
                log("Token deleted", `**Discord ID:** ${discordId}\n**Username:** ${user.username}`);
                break;
            }
        }
    },

    getCacheSize(): number {
        return cache.size;
    },

    getAllUsers(): IUser[] {
        return Array.from(cache.values());
    },
};
