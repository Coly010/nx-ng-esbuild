import { EsBuildExecutorSchema } from './schema';

import NgcEsbuild from 'ngc-esbuild';

export default async function runExecutor(options: EsBuildExecutorSchema) {
  const esbuild = new NgcEsbuild(options);
  await esbuild.resolve;
}
