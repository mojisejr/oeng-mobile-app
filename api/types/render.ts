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
    let resolved = false;
    
    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.log('Request timeout - body received so far:', JSON.stringify(body));
        reject(new Error('Request timeout'));
      }
    }, 30000); // 30 second timeout
    
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
          } else {
            resolve({});
          }
        } catch (error) {
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