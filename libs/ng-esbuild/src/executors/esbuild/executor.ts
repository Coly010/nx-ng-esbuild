import { ExecutorContext, joinPathFragments } from '@nrwl/devkit';
import { EsBuildExecutorSchema } from './schema';
import esbuilder from './lib/builder';
import { assetResolver } from './lib/plugin/esbuild-assets-resolver';
import { indexFileProcessor } from './lib/plugin/esbuild-index-file-processor';
import { zoneJsPlugin } from './lib/plugin/esbuild-plugin-zonejs';
import { angularComponentDecoratorPlugin } from './lib/plugin/esbuild-component-decorator';
import { cssResolver } from './lib/plugin/esbuild-css-resolver';
import { jsResolver } from './lib/plugin/esbuild-js-resolver';
import { createAsyncIterable } from './lib/create-async-iteratable';
import { existsSync, rmSync } from 'fs';
import { analyzeMetafileSync } from 'esbuild';

export default async function* runExecutor(
  options: EsBuildExecutorSchema,
  context: ExecutorContext
) {
  console.time('Building app with ESBuild completed in');
  const outputPath = joinPathFragments(context.cwd, options.outdir);
  if (existsSync(outputPath)) {
    rmSync(outputPath, { recursive: true });
  }

  const { index, assets, styles, scripts, serve, port, ...esbuildOptions } =
    options;

  const esbuild = esbuilder(
    {
      ...esbuildOptions,
      watch: serve ? true : esbuildOptions.watch,
      plugins: [
        indexFileProcessor(options, context),
        zoneJsPlugin(),
        angularComponentDecoratorPlugin(options, context),
        cssResolver(options, context),
        jsResolver(options, context),
        assetResolver(options, context),
      ],
    },
    serve,
    port
  );

  if (options.watch || options.serve) {
    return yield* createAsyncIterable<{ success: boolean; outfile: string }>(
      async ({ next, done }) => {
        esbuild.then((result) => {
          console.timeEnd('Building app with ESBuild completed in');
          if (options.serve) {
            console.log(
              `Live server has been started at http://localhost:${port}/`
            );
          }
          console.log('ESBuild is watching for changes...');
          next({ success: result.errors?.length < 1, outfile: outputPath });
        });
      }
    );
  }

  return esbuild
    .then((result) => {
      if (result.errors?.length > 0) {
        throw new Error('ESBuild failed: \n' + result.errors.join('\n'));
      }
      console.timeEnd('Building app with ESBuild completed in');
      result.metafile &&
        console.log(
          analyzeMetafileSync(result.metafile, { verbose: context.isVerbose })
        );
      return { success: true };
    })
    .catch((error) => {
      console.error(error);
      return { success: false, error };
    });
}
