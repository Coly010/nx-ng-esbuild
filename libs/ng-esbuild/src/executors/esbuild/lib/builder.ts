import { joinPathFragments } from '@nrwl/devkit';
import { build, BuildOptions, ServeOptions } from 'esbuild';
import { readFileSync } from 'fs';

import { createServer, ServerResponse } from 'http';
import { WebSocketServer } from 'ws';
import { extname } from 'path';

let serverIsActive = false;
let broadcast = null;

export default (
  options: Partial<BuildOptions> = {},
  serve = false,
  port = 4200
) => {
  const defaultOptions: Partial<BuildOptions> = {
    entryPoints: ['src/main.ts'],
    bundle: true,
    write: true,
    treeShaking: true,
    loader: {
      '.html': 'text',
      '.css': 'text',
    },
    sourcemap: true,
    minify: true,
    plugins: [],
  };

  const mergedOptions: Partial<BuildOptions & ServeOptions> = {
    ...defaultOptions,
    ...options,
  };

  if (mergedOptions.watch === true) {
    mergedOptions.watch = {
      onRebuild: (error) => {
        if (error) {
          console.error('ESBuild failed:', error);
        } else {
          broadcast('location:refresh');
          console.log('ESBuild rebuilt successfully');
        }
      },
    };
  }

  return build(mergedOptions).then((result) => {
    if (serve && !serverIsActive) {
      const wssPort = Number(port) - 4200 + 8800;
      const wsServer = new WebSocketServer({ port: wssPort });
      wsServer.on('connection', function connection(ws) {
        ws.on('message', function message() {
          //do nothing
        });

        ws.send('Esbuild live server started');
      });

      broadcast = (message: string) => {
        wsServer.clients.forEach(function each(client) {
          if (client.readyState === 1) {
            client.send(message);
          }
        });
      };

      const clientScript = `<script>
    const ws = new WebSocket('ws://127.0.0.1:${wssPort}');
    ws.onmessage = m => {
      if (m.data === 'location:refresh') {
        location.reload();
      }
    }
  </script>`;

      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'OPTIONS, POST, GET, PUT, PATCH, DELETE',
        'Access-Control-Max-Age': 0, // No Cache
      };

      const resolveIndexPage = (response: ServerResponse) => {
        const content = readFileSync(
          joinPathFragments(options.outdir, 'index.html'),
          'utf8'
        ).replace(/<\/body>/g, `${clientScript}\n</body>`);
        response.writeHead(200, { ...headers, 'Content-Type': 'text/html' });
        response.end(content);
      };
      createServer(async (request, response) => {
        let filePath = '.' + request.url;
        if (filePath == './') {
          resolveIndexPage(response);
          return;
        } else {
          filePath = joinPathFragments(options.outdir, request.url);
        }
        filePath = filePath.split('?')[0];

        const ext = String(extname(filePath)).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.wav': 'audio/wav',
          '.mp4': 'video/mp4',
          '.woff': 'application/font-woff',
          '.ttf': 'application/font-ttf',
          '.eot': 'application/vnd.ms-fontobject',
          '.otf': 'application/font-otf',
          '.wasm': 'application/wasm',
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const encoding = ['.html', '.js', '.css'].includes(ext) ? 'utf8' : null;

        try {
          const content = readFileSync(filePath, encoding);
          response.writeHead(200, { ...headers, 'Content-Type': contentType });
          response.end(content);
          return;
        } catch (e) {
          if (e.code == 'ENOENT') {
            resolveIndexPage(response);
          } else {
            response.writeHead(500);
            response.end(
              'Sorry, check with the site admin for error: ' + e.code + ', ' + e
            );
          }
        }
      }).listen(port);

      serverIsActive = true;
    }
    return result;
  });
};
