"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    if (req.method === "GET") {
        try {
            const userId = req.query?.id;
            return res.status(200).json({
                success: true,
                message: "User profile endpoint ready",
                data: { userId },
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: "Failed to fetch user profile",
            });
        }
    }
    if (req.method === "PUT") {
        try {
            const profileData = req.body;
            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: profileData,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: "Failed to update profile",
            });
        }
    }
    return res.status(405).json({ error: "Method not allowed" });
}
