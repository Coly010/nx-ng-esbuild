import { createHash } from 'crypto';
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
  const { tsconfig } = options.transformerConfig;
  if (tsconfig && !(tsconfig in rawTsConfig)) {
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
    tsconfigRaw: tsconfig ? rawTsConfig[tsconfig] : undefined,
  }).code;

  options.cacheFS.set(fileName, contents);

  return contents;
};

export const getCacheKey = (fileData: string, filePath: string) => {
  return sha1(fileData + filePath);
};

export const cache: { [key: string]: string } = Object.create(null);

function sha1(data: string): string {
  // caching
  const cacheKey = data;
  if (cacheKey in cache) {
    return cache[cacheKey];
  }

  // we use SHA1 because it's the fastest provided by node
  // and we are not concerned about security here
  const hash = createHash('sha1');
  hash.update(data, 'utf8');
  const res = hash.digest('hex').toString();

  cache[cacheKey] = res;

  return res;
}
