import { transformSync } from 'esbuild';
import { readFileSync } from 'fs';

import { transformComponentDecorators } from './plugin/esbuild-component-decorator';
import { zoneJsTransformer } from './plugin/esbuild-plugin-zonejs';

const rawTsConfig: { [key: string]: string } = {};

export const process = (
  src: string,
  fileName: string,
  options: {
    cacheFS: Map<string, string>;
    transformerConfig: { tsconfig: string };
  }
) => {
  if (options.cacheFS.has(fileName)) {
    return options.cacheFS.get(fileName);
  }

  const { tsconfig } = options.transformerConfig;
  if (!(tsconfig in rawTsConfig)) {
    rawTsConfig[tsconfig] = readFileSync(tsconfig, 'utf-8');
  }

  if (fileName.endsWith('.html')) {
    const contents = transformSync(src, {
      loader: 'text',
    }).code;

    options.cacheFS.set(fileName, contents);

    return contents;
  }
  if (!fileName.includes('node_modules')) {
    src = transformComponentDecorators(src, fileName);
    src = zoneJsTransformer(src, fileName);
  }
  const contents = transformSync(src, {
    loader: 'ts',
    format: 'cjs',
    tsconfigRaw: rawTsConfig[tsconfig],
  }).code;

  options.cacheFS.set(fileName, contents);

  return contents;
};

export default { process };
