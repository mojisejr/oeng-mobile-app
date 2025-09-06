"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    if (req.method === "POST") {
        try {
            const { amount, currency = "thb", paymentMethodId } = req.body;
            return res.status(200).json({
                success: true,
                message: "Payment endpoint ready for Stripe integration",
                data: {
                    amount,
                    currency,
                    paymentMethodId,
                },
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: "Payment processing failed",
            });
        }
    }
    return res.status(405).json({ error: "Method not allowed" });
}
