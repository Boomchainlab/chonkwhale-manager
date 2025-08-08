/import express from 'express';
import { resolve } from 'path';

const distPath = resolve(__dirname, '../dist');

function serveStatic(app: express.Express) {
  app.use(
    express.static(distPath, {
      maxAge: "5m",
      setHeaders(res, filePath) {
        if (/\.(?:js|css|woff2?|ico|png|jpg|jpeg|svg|gif|webp)$/.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );
}

// /** rest of code here **/
