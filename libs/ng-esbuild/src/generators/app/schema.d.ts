export interface AppGeneratorSchema {
  name: string;
  addTailwind?: boolean;
  skipFormat?: boolean;
  inlineStyle?: boolean;
  inlineTemplate?: boolean;
  viewEncapsulation?: 'Emulated' | 'Native' | 'None';
  routing?: boolean;
  prefix?: string;
  style?: Styles;
  skipTests?: boolean;
  directory?: string;
  tags?: string;
  linter?: AngularLinter;
  unitTestRunner?: UnitTestRunner;
  e2eTestRunner?: E2eTestRunner;
  backendProject?: string;
  strict?: boolean;
  standaloneConfig?: boolean;
  mfe?: boolean;
  mfeType?: 'host' | 'remote';
  remotes?: string[];
  port?: number;
  host?: string;
  setParserOptionsProject?: boolean;
  skipPackageJson?: boolean;
}
