import { IncomingMessage, ServerResponse } from 'http';
import { ParsedUrlQuery } from 'querystring';

// Render-compatible request/response types
export interface RenderRequest extends IncomingMessage {
  method?: string;
  url?: string;
  headers: IncomingMessage['headers'];
  body?: any;
  query?: ParsedUrlQuery;
  cookies?: { [key: string]: string };
}

export interface RenderResponse extends ServerResponse {
  status(code: number): this;
  json(obj: any): this;
  send(body: any): this;
  setHeader(name: string, value: string | string[]): this;
  end(chunk?: any): this;
}

// Helper function to parse request body
export async function parseRequestBody(req: RenderRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        if (body) {
          resolve(JSON.parse(body));
        } else {
          resolve({});
        }
      } catch (error) {
        reject(error);
      }
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

// Helper function to parse query parameters
export function parseQuery(url: string): ParsedUrlQuery {
  const urlObj = new URL(url, 'http://localhost');
  const query: ParsedUrlQuery = {};
  
  urlObj.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  
  return query;
}

// Enhanced response helper for Render
export function enhanceResponse(res: ServerResponse): RenderResponse {
  const enhanced = res as unknown as RenderResponse;
  
  enhanced.status = function(code: number) {
    this.statusCode = code;
    return this;
  };
  
  enhanced.json = function(obj: any) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(obj));
    return this;
  };
  
  enhanced.send = function(body: any) {
    if (typeof body === 'object') {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(body));
    } else {
      this.end(body);
    }
    return this;
  };
  
  const originalSetHeader = enhanced.setHeader;
  enhanced.setHeader = function(name: string, value: string | string[]) {
    originalSetHeader.call(this, name, value);
    return this;
  };
  
  return enhanced;
}