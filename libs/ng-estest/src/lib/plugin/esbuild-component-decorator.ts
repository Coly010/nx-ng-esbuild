import { joinPathFragments } from '@nrwl/devkit';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

const getValueByPattern = (regex = new RegExp(''), str = '') => {
  const results = [];

  let array1 = null;

  while ((array1 = regex.exec(str)) !== null) {
    results.push(array1[1]);
  }

  return results.pop();
};

const injectStyle = (filename: string, contents = '') => {
  return contents.replace(
    /^ *styleUrls *: *\[['"]([^'"\]]*)['"]\],*/gm,
    `    styles: [],`
  );
};

const addInjects = (contents: string) => {
  if (/constructor *\(([^)]*)/gm.test(contents)) {
    let requireInjectImport = false;
    const matches = contents.matchAll(/constructor *\(([^)]*)/gm);
    for (const match of matches) {
      if (match[1] && /:/gm.test(match[1])) {
        requireInjectImport = true;
        const flat = match[1].replace(/[\n\r]/gm, '');
        const flatArray = flat.split(',').map((inject) => {
          const parts = inject.split(':');
          return parts.length === 2 && !/@Inject/.test(inject)
            ? `@Inject(${parts[1]}) ${inject}`
            : inject;
        });

        contents = contents.replace(
          /constructor *\([^)]*\)/gm,
          `constructor(${flatArray.join(',')})`
        );
      }
    }

    if (
      requireInjectImport &&
      !/Inject[ ,}\n\r].*'@angular\/core.*;/.test(contents)
    ) {
      contents = `import { Inject } from '@angular/core';\n\r${contents}`;
    }
  }

  return contents;
};

export const transformComponentDecorators = (
  source: string,
  fileName: string
) => {
  try {
    let contents = source;

    // Import compiler.
    if (/module\.ts$/.test(fileName)) {
      contents = `import '@angular/compiler';\n${contents}`;
    }

    if (/^ *templateUrl *: *['"]*([^'"]*)/gm.test(contents)) {
      const templateUrl = getValueByPattern(
        /^ *templateUrl *: *['"]*([^'"]*)/gm,
        source
      );
      const templateSource = readFileSync(
        resolve(joinPathFragments(dirname(fileName), templateUrl)),
        'utf8'
      );
      contents = `
              ${contents}`.replace(
        /^ *templateUrl *: *['"]*([^'"]*)['"]/gm,
        `template: \`${templateSource}\` || ''`
      );
    }

    if (/^ *styleUrls *: *\[['"]([^'"\]]*)/gm.test(contents)) {
      contents = injectStyle(fileName, contents);
    }

    contents = addInjects(contents);

    return contents;
  } catch (e) {
    throw new Error('Failed to transpile decorators' + e.message);
  }
};
