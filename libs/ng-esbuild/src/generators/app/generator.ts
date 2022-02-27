import { formatFiles, Tree } from '@nrwl/devkit';
import { AppGeneratorSchema } from './schema';
import { applicationGenerator } from '@nrwl/angular/generators';
import addEsbuildConfig from '../add-esbuild-config/generator';

export default async function (tree: Tree, options: AppGeneratorSchema) {
  await applicationGenerator(tree, options);
  await addEsbuildConfig(tree, {
    appName: options.name,
    targetName: 'esbuild',
  });

  await formatFiles(tree);
}
