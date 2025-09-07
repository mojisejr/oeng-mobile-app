"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.withAuth = withAuth;
exports.getUserId = getUserId;
exports.getUserEmail = getUserEmail;
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Missing or invalid authorization header'
            });
        }
        const sessionToken = authHeader.substring(7);
        if (!process.env.CLERK_SECRET_KEY) {
            throw new Error('CLERK_SECRET_KEY environment variable is not set');
        }
        const session = await clerk_sdk_node_1.clerkClient.sessions.verifySession(sessionToken, process.env.CLERK_SECRET_KEY);
        if (!session || session.status !== 'active') {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session'
            });
        }
        const user = await clerk_sdk_node_1.clerkClient.users.getUser(session.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }
        req.user = {
            id: user.id,
            emailAddress: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
}
function withAuth(handler) {
    return async (req, res) => {
        return new Promise((resolve, reject) => {
            authMiddleware(req, res, async () => {
                try {
                    await handler(req, res);
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    };
}
function getUserId(req) {
    return req.user?.id || null;
}
function getUserEmail(req) {
    return req.user?.emailAddress || null;
}
