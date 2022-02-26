import { scssProcessor } from '../scss-worker';
import { ExecutorContext, joinPathFragments } from '@nrwl/devkit';
import { EsBuildExecutorSchema } from '../../schema';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { PluginBuild } from 'esbuild';

const scssWorkerList = [];

export const cssResolver = (
  options: EsBuildExecutorSchema,
  context: ExecutorContext
) => {
  return {
    name: 'angularCSSProcessor',
    setup: (build: PluginBuild) => {
      (options.styles || []).forEach((item = '') => {
        const itemPath = !/^\//.test(item)
          ? joinPathFragments(context.cwd, item)
          : joinPathFragments(context.cwd, 'src', item);
        scssWorkerList.push(
          scssProcessor(
            JSON.stringify({
              scssPath: itemPath,
              projectDir: context.cwd,
              outDir: joinPathFragments(context.cwd, options.outdir),
            })
          )
        );
      });

      build.onResolve({ filter: /(\.scss|\.css)$/ }, (args) => {
        const pathParts = args.path.split('#|#');
        return {
          path: resolve(args.resolveDir, pathParts[1] || pathParts[0]),
          namespace: 'sass',
          pluginData: pathParts.length === 2 ? pathParts[0] : '',
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'sass' }, (args) => {
        const wrapper = args.pluginData;
        scssWorkerList.push(
          scssProcessor(
            JSON.stringify({
              scssPath: args.path,
              projectDir: context.cwd,
              outDir: joinPathFragments(context.cwd, options.outdir),
              wrapper,
            })
          )
        );
        return { contents: '', loader: 'text' };
      });

      build.onEnd(async () => {
        const results = await Promise.all(scssWorkerList);
        const cssOutputPath = joinPathFragments(options.outdir, `main.css`);
        writeFileSync(cssOutputPath, results.join(''));
        // scssWorker.end();
        scssWorkerList.length = 0;
      });
    },
  };
};
