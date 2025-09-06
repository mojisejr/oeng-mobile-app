"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
exports.setCorsHeaders = setCorsHeaders;
exports.handleOptionsRequest = handleOptionsRequest;
exports.validateRequiredFields = validateRequiredFields;
function createSuccessResponse(res, data, message) {
    res.status(200).json({
        success: true,
        message: message || "Operation successful",
        data,
        timestamp: new Date().toISOString(),
    });
}
function createErrorResponse(res, error, statusCode = 400, data) {
    res.status(statusCode).json({
        success: false,
        error,
        data,
        timestamp: new Date().toISOString(),
    });
}
function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
function handleOptionsRequest(res) {
    setCorsHeaders(res);
    return res.status(200).end();
}
function validateRequiredFields(body, requiredFields) {
    const missingFields = [];
    for (const field of requiredFields) {
        if (!body || !body[field]) {
            missingFields.push(field);
        }
    }
    return {
        isValid: missingFields.length === 0,
        missingFields
    };
}
