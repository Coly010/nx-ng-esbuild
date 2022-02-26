import { ExecutorContext, joinPathFragments } from '@nrwl/devkit';
import { readFileSync, writeFileSync } from 'fs';
import { EsBuildExecutorSchema } from '../../schema';

let indexFileContent = '';

/**
 * Esbuild plugin to process index.html file and place scripts and styles
 * into it.
 * @returns an esbuild plugin to changing the index.html file
 */
export const indexFileProcessor = (
  options: EsBuildExecutorSchema,
  context: ExecutorContext
) => {
  return {
    name: 'indexProcessor',
    setup: async (build) => {
      const indexFilePath = options.index;

      build.onStart(() => {
        indexFileContent = readFileSync(
          joinPathFragments(context.cwd, indexFilePath),
          'utf8'
        );
      });

      build.onEnd(async () => {
        indexFileContent = indexFileContent.replace(
          /<\/body>/gm,
          `<script data-version="0.2" src="vendor.js"></script>
          <script data-version="0.2" type="module" src="main.js"></script>
          </body>`
        );

        indexFileContent = indexFileContent.replace(
          /<\/head>/gm,
          `<link rel="stylesheet" href="main.css">
        </head>`
        );

        writeFileSync(
          joinPathFragments(options.outdir, 'index.html'),
          indexFileContent
        );
      });
    },
  };
};
