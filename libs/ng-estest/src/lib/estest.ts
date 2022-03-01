import { transformSync } from 'esbuild';

import { transformComponentDecorators } from './plugin/esbuild-component-decorator';
import { zoneJsTransformer } from './plugin/esbuild-plugin-zonejs';

export const process = (src: string, fileName: string) => {
  if (fileName.endsWith('.html')) {
    return transformSync(src, {
      loader: 'text',
    }).code;
  }
  if (!fileName.includes('node_modules')) {
    src = transformComponentDecorators(src, fileName);
    src = zoneJsTransformer(src, fileName);
  }
  const contents = transformSync(src, {
    loader: 'ts',
    format: 'cjs',
  }).code;

  return contents;
};

export default { process };
