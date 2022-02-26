import { build, BuildOptions } from 'esbuild';

export default (options: Partial<BuildOptions> = {}) => {
  const defaultOptions: Partial<BuildOptions> = {
    entryPoints: ['src/main.ts'],
    bundle: true,
    write: true,
    treeShaking: true,
    loader: {
      '.html': 'text',
      '.css': 'text',
    },
    sourcemap: true,
    minify: true,
    plugins: [],
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return build(mergedOptions);
};
