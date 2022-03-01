import {
  addDependenciesToPackageJson,
  formatFiles,
  getProjects,
  offsetFromRoot,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { EstestGeneratorSchema } from './schema';

export default async function (tree: Tree, options: EstestGeneratorSchema) {
  const projects = getProjects(tree);

  if (!projects.has(options.name)) {
    throw new Error('Could not find project with name ' + options.name);
  }

  const project = projects.get(options.name);

  project.targets['estest'] = {
    executor: '@nrwl/jest:jest',
    outputs: [`coverage/${project.root}`],
    options: {
      jestConfig: `${project.root}/jest.esm.config.js`,
      passWithNoTests: true,
    },
  };

  updateProjectConfiguration(tree, options.name, project);

  const offset = offsetFromRoot(project.root);

  tree.write(
    `${project.root}/jest.esm.config.js`,
    `module.exports = {
    displayName: '${options.name}',
    preset: '${offset}jest.preset.js',
    coverageDirectory: '${offset}coverage/libs/app0/lib0-lib0',
    transform: {
      '^.+\\.(ts|mjs|js)$': ['ng-estest', {tsconfig: '${project.root}/tsconfig.spec.json'}],
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
    snapshotSerializers: [
      'jest-preset-angular/build/serializers/no-ng-attributes',
      'jest-preset-angular/build/serializers/ng-snapshot',
      'jest-preset-angular/build/serializers/html-comment',
    ],
  };
  `
  );

  const installTask = addDependenciesToPackageJson(
    tree,
    {},
    { 'ng-estest': '0.2.2' }
  );

  await formatFiles(tree);

  return installTask;
}
