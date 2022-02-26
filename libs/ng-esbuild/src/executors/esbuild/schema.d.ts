export interface EsBuildExecutorSchema {
  // angular options
  assets: string[];
  index: string;
  styles: string[];
  scripts: string[];
  // esbuild options
  entryPoints: string[];
  bundle: boolean;
  outfile: string;
  outdir: string;
  external: string[];
  format: 'esm' | 'iife' | 'cjs';
  inject: string[];
  minify: boolean;
  platform: 'node' | 'browser' | 'neutral';
  sourcemap: boolean | 'external' | 'inline' | 'both';
  splitting: boolean;
  target: string[];
  watch: boolean;
  write: boolean;
  allowOverwrite: boolean;
  metafile: boolean;
  treeShaking: boolean;
  tsconfig: string;
  tsconfigRaw: string;
  absWorkingDir: string;
}
