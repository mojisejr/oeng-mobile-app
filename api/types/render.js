"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRequestBody = parseRequestBody;
exports.parseQuery = parseQuery;
exports.enhanceResponse = enhanceResponse;
async function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        let resolved = false;
        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                console.log('Request timeout - body received so far:', JSON.stringify(body));
                reject(new Error('Request timeout'));
            }
        }, 30000);
        req.on('data', (chunk) => {
            console.log('Received data chunk:', chunk.toString());
            body += chunk.toString();
        });
        req.on('end', () => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                try {
                    console.log('Raw body received:', JSON.stringify(body));
                    if (body) {
                        const parsed = JSON.parse(body);
                        console.log('Parsed body:', parsed);
                        resolve(parsed);
                    }
                    else {
                        resolve({});
                    }
                }
                catch (error) {
                    console.error('JSON parse error:', error instanceof Error ? error.message : String(error));
                    console.error('Body that failed to parse:', JSON.stringify(body));
                    reject(new Error('Invalid JSON in request body'));
                }
            }
        });
        req.on('error', (error) => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                reject(error);
            }
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
