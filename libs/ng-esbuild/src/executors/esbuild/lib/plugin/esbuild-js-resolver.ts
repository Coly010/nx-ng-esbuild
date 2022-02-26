import { ExecutorContext, joinPathFragments } from '@nrwl/devkit';
import { readFileSync, writeFileSync } from 'fs';
import { EsBuildExecutorSchema } from '../../schema';

let vendorFileCache = '';

export const jsResolver = (
  options: EsBuildExecutorSchema,
  context: ExecutorContext
) => {
  return {
    name: 'angularVendorJSResolver',
    async setup(build) {
      build.onStart(async () => {
        const works = [];
        (options.scripts || []).forEach((item = '') => {
          const itemPath = !/^\//.test(item)
            ? joinPathFragments(context.cwd, item)
            : joinPathFragments(context.cwd, context.root, 'src', item);

          works.push(readFileSync(itemPath, 'utf8'));
        });

        await Promise.all(works).then((files) => {
          vendorFileCache = files.join(`\n\n`);
          return true;
        });
      });

      build.onEnd(async () => {
        const jsOutputPath = joinPathFragments(options.outdir, `vendor.js`);
        writeFileSync(jsOutputPath, vendorFileCache, 'utf8');
      });
    },
  };
};
