import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Replit webview detection middleware
app.use((req, res, next) => {
  // Skip for API and asset requests
  if (req.path.startsWith('/api') || 
      req.path.startsWith('/assets') || 
      req.path.includes('.') || 
      req.path.startsWith('/m-direct') ||
      req.path.startsWith('/direct-mobile') ||
      req.path.startsWith('/direct-ip') ||
      req.path !== '/') {
    return next();
  }
  
  // Skip if this is a mobile direct access request
  if (req.query.bypass === 'true' || req.query.mobile === 'true' || req.query.direct === 'true') {
    return next();
  }
  
  // Check if this is the Replit webview
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';
  const isReplitWebview = userAgent.includes('replit') || referer.includes('replit.com');
  
  if (isReplitWebview) {
    return res.sendFile(path.resolve(__dirname, '../public/replit-view.html'));
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000 or fallback to 3000 if needed
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  const host = '0.0.0.0';

  // Enable CORS for development and production - needs to be before route setup
  app.use((req, res, next) => {
    // Allow requests from Replit webview and any origin
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,X-Replit-User-Id,X-Replit-User-Name');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  server.listen(Number(port), () => {
    log(`Server running at http://${host}:${port}`);
  });
})();