export interface EsBuildExecutorSchema {
  port: number;
  open: boolean;
  serve: boolean;
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
