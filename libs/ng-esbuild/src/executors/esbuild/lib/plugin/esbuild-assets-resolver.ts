import { ExecutorContext, joinPathFragments } from '@nrwl/devkit';
import { existsSync, copyFileSync, mkdirSync, lstatSync } from 'fs';
import { copySync } from 'fs-extra';
import { EsBuildExecutorSchema } from '../../schema';

export const assetResolver = (
  options: EsBuildExecutorSchema,
  context: ExecutorContext
) => {
  return {
    name: 'angularAssetsResolver',
    setup: async () => {
      const pathToBuiltApp = joinPathFragments(context.cwd, options.outdir);
      if (!existsSync(pathToBuiltApp)) {
        mkdirSync(pathToBuiltApp);
      }

      for (const assetResource of options.assets) {
        const assetPath = joinPathFragments(context.cwd, assetResource);
        if (!existsSync(assetPath)) {
          continue;
        }

        if (lstatSync(assetPath).isDirectory()) {
          copySync(
            assetPath,
            joinPathFragments(options.outdir, assetPath.split('/').at(-1))
          );
        } else {
          copyFileSync(
            assetPath,
            joinPathFragments(options.outdir, assetPath.split('/').at(-1))
          );
        }
      }
    },
  };
};
