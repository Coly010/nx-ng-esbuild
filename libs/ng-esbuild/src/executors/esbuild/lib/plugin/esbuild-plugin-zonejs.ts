import { OnLoadArgs, PluginBuild } from 'esbuild';
import { readFileSync } from 'fs';

export const zoneJsPlugin = () => {
  return {
    name: 'zoneJs',
    setup: (build: PluginBuild) => {
      build.onLoad({ filter: /main\.ts$/ }, async (args: OnLoadArgs) => {
        const source = readFileSync(args.path, 'utf8');
        const contents = `import 'zone.js';\n${source}`;

        return { contents, loader: 'ts' };
      });

      // Include test.ts for testing.
      build.onLoad({ filter: /\.spec\.ts$/ }, async (args: OnLoadArgs) => {
        const source = readFileSync(args.path, 'utf8');
        const contents = `
          import 'zone.js';
          import 'zone.js/testing';
          import { getTestBed } from '@angular/core/testing';
          import {
            BrowserDynamicTestingModule,
            platformBrowserDynamicTesting
          } from '@angular/platform-browser-dynamic/testing';

          getTestBed().initTestEnvironment(
            BrowserDynamicTestingModule,
            platformBrowserDynamicTesting(),
          );
          \n${source}`;
        return { contents, loader: 'ts' };
      });
    },
  };
};
