import { ExecutorContext, joinPathFragments } from '@nrwl/devkit';
import { copyFileSync, existsSync } from 'fs';
import { EsBuildExecutorSchema } from '../../schema';

export const assetResolver = (
  options: EsBuildExecutorSchema,
  context: ExecutorContext
) => {
  return {
    name: 'angularAssetsResolver',
    setup: async () => {
      for (const assetResource of options.assets) {
        if (typeof assetResolver === 'string') {
          const assetPath = joinPathFragments(context.cwd, assetResource);
          if (!existsSync(assetPath)) {
            continue;
          }

          copyFileSync(assetPath, options.outdir);
        }
      }
    },
  };
};
