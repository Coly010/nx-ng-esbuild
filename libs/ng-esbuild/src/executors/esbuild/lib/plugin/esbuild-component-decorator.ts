import { ExecutorContext, joinPathFragments } from '@nrwl/devkit';
import { OnLoadArgs, PluginBuild } from 'esbuild';
import { readFileSync } from 'fs';
import { dirname } from 'path';
import { EsBuildExecutorSchema } from '../../schema';

import { scssProcessor } from '../scss-worker';

const getValueByPattern = (regex = new RegExp(''), str = '') => {
  const results = [];

  let array1 = null;

  while ((array1 = regex.exec(str)) !== null) {
    results.push(array1[1]);
  }

  return results.pop();
};

const injectStyle = async (
  options: EsBuildExecutorSchema,
  context: ExecutorContext,
  args: OnLoadArgs,
  contents = ''
) => {
  const outDir = joinPathFragments(context.cwd, options.outdir);

  const styleUrls = getValueByPattern(
    /^ *styleUrls *: *\[['"]([^'"\]]*)/gm,
    contents
  );

  let fileContent = '';
  if (styleUrls) {
    fileContent = await scssProcessor(
      JSON.stringify({
        scssPath: joinPathFragments(dirname(args.path), styleUrls),
        projectDir: context.root,
        outDir,
      })
    );
  }

  return contents.replace(
    /^ *styleUrls *: *\[['"]([^'"\]]*)['"]\],*/gm,
    `    styles: [\`${fileContent}\`],`
  );
};

const addInjects = (contents: string) => {
  if (/constructor *\(([^)]*)/gm.test(contents)) {
    let requireInjectImport = false;
    const matches = contents.matchAll(/constructor *\(([^)]*)/gm);
    for (const match of matches) {
      if (match[1] && /:/gm.test(match[1])) {
        requireInjectImport = true;
        const flat = match[1].replace(/[\n\r]/gm, '');
        const flatArray = flat.split(',').map((inject) => {
          const parts = inject.split(':');
          return parts.length === 2 && !/@Inject/.test(inject)
            ? `@Inject(${parts[1]}) ${inject}`
            : inject;
        });

        contents = contents.replace(
          /constructor *\([^)]*\)/gm,
          `constructor(${flatArray.join(',')})`
        );
      }
    }

    if (
      requireInjectImport &&
      !/Inject[ ,}\n\r].*'@angular\/core.*;/.test(contents)
    ) {
      contents = `import { Inject } from '@angular/core';\n\r${contents}`;
    }
  }

  return contents;
};

export const angularComponentDecoratorPlugin = (
  options: EsBuildExecutorSchema,
  context: ExecutorContext
) => {
  return {
    name: 'angularComponentProcessor',
    setup: (build: PluginBuild) => {
      build.onLoad(
        {
          filter: /src.*\.(component|pipe|service|directive|guard|module)\.ts$/,
        },
        async (args) => {
          const source = readFileSync(args.path, 'utf8');

          try {
            let contents = source;

            // Import compiler.
            if (/module\.ts$/.test(args.path)) {
              contents = `import '@angular/compiler';\n${contents}`;
            }

            if (/^ *templateUrl *: *['"]*([^'"]*)/gm.test(contents)) {
              const templateUrl = getValueByPattern(
                /^ *templateUrl *: *['"]*([^'"]*)/gm,
                source
              );
              contents = `import templateSource from '${templateUrl}';
              ${contents}`.replace(
                /^ *templateUrl *: *['"]*([^'"]*)['"]/gm,
                `template: templateSource || ''`
              );
            }

            if (/^ *styleUrls *: *\[['"]([^'"\]]*)/gm.test(contents)) {
              contents = await injectStyle(options, context, args, contents);
            }

            contents = addInjects(contents);

            return { contents, loader: 'ts' };
          } catch (e) {
            return { errors: [e] };
          }
        }
      );
    },
  };
};
