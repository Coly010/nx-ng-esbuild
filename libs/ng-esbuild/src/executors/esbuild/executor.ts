import { ExecutorContext, joinPathFragments } from '@nrwl/devkit';
import { EsBuildExecutorSchema } from './schema';
import esbuilder from './lib/builder';
import { assetResolver } from './lib/plugin/esbuild-assets-resolver';
import { indexFileProcessor } from './lib/plugin/esbuild-index-file-processor';
import { zoneJsPlugin } from './lib/plugin/esbuild-plugin-zonejs';
import { angularComponentDecoratorPlugin } from './lib/plugin/esbuild-component-decorator';
import { cssResolver } from './lib/plugin/esbuild-css-resolver';
import { jsResolver } from './lib/plugin/esbuild-js-resolver';
import { existsSync, rmSync } from 'fs';

export default async function runExecutor(
  options: EsBuildExecutorSchema,
  context: ExecutorContext
) {
  console.time('Building app with ESBuild completed in');
  const outputPath = joinPathFragments(context.cwd, options.outdir);
  if (existsSync(outputPath)) {
    rmSync(outputPath, { recursive: true });
  }

  const { index, assets, styles, scripts, ...esbuildOptions } = options;

  const esbuild = esbuilder({
    ...esbuildOptions,
    plugins: [
      indexFileProcessor(options, context),
      zoneJsPlugin(),
      angularComponentDecoratorPlugin(options, context),
      cssResolver(options, context),
      jsResolver(options, context),
      assetResolver(options, context),
    ],
  });
  try {
    await esbuild;
  } catch (e) {
    throw new Error('Building app with ESBuild failed with: ' + e.message);
  }

  console.timeEnd('Building app with ESBuild completed in');

  return { success: true };
}
