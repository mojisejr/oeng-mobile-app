"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRequestBody = parseRequestBody;
exports.parseQuery = parseQuery;
exports.enhanceResponse = enhanceResponse;
async function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                if (body) {
                    resolve(JSON.parse(body));
                }
                else {
                    resolve({});
                }
            }
            catch (error) {
                reject(error);
            }
        });
        req.on('error', (error) => {
            reject(error);
        });
    });
}
function parseQuery(url) {
    const urlObj = new URL(url, 'http://localhost');
    const query = {};
    urlObj.searchParams.forEach((value, key) => {
        query[key] = value;
    });
    return query;
}
function enhanceResponse(res) {
    const enhanced = res;
    enhanced.status = function (code) {
        this.statusCode = code;
        return this;
    };
    enhanced.json = function (obj) {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(obj));
        return this;
    };
    enhanced.send = function (body) {
        if (typeof body === 'object') {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(body));
        }
        else {
            this.end(body);
        }
        return this;
    };
    const originalSetHeader = enhanced.setHeader;
    enhanced.setHeader = function (name, value) {
        originalSetHeader.call(this, name, value);
        return this;
    };
    return enhanced;
}
