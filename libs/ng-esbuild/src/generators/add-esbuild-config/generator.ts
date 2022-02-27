import {
  formatFiles,
  getProjects,
  joinPathFragments,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { AddEsbuildConfigGeneratorSchema } from './schema';

export default async function (
  tree: Tree,
  options: AddEsbuildConfigGeneratorSchema
) {
  const project = getProjects(tree).get(options.appName);
  if (!project) {
    throw new Error(`App with name ${options.appName} does not exist!`);
  }

  if (project.projectType !== 'application') {
    throw new Error(
      `You specified a library. We do not currently support libraries`
    );
  }
  project.targets[options.targetName] = {
    executor: 'nx-ng-esbuild:esbuild',
    options: {
      entryPoints: [joinPathFragments(project.sourceRoot, 'main.ts')],
      outdir: `dist/${project.root}`,
      index: joinPathFragments(project.sourceRoot, 'index.html'),
      assets: [
        joinPathFragments(project.sourceRoot, 'favicon.ico'),
        joinPathFragments(project.sourceRoot, 'assets'),
      ],
      styles: [
        joinPathFragments(
          project.sourceRoot,
          `styles.${project.targets.build.options.inlineStyleLanguage ?? 'css'}`
        ),
      ],
      scripts: [],
      tsconfig: joinPathFragments(project.root, 'tsconfig.app.json'),
    },
  };

  updateProjectConfiguration(tree, options.appName, project);

  await formatFiles(tree);
}
