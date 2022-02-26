import { createReadStream, createWriteStream } from 'fs';
import { readFile } from 'fs/promises';
import { basename, dirname, join } from 'path';
import { compileAsync } from 'sass';
import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';

const cache = Object.create(null);
const scssCache = '';

const copyFile = (source: string, target: string) => {
  return new Promise((resolve) => {
    const rd = createReadStream(source);
    rd.on('error', function (err) {
      resolve(err);
    });
    const wr = createWriteStream(target);
    wr.on('error', function (err) {
      resolve(err);
    });
    wr.on('close', function () {
      resolve(true);
    });
    rd.pipe(wr);
  });
};

const importUrlResolvers = (workDir: string) => {
  return [
    {
      findFileUrl(url: string) {
        if (/\./.test(url)) return null;
        return new URL(
          join(workDir, 'node_modules', url.replace(/^~/, '')).replace(
            /^[^:]*:/,
            'file:'
          )
        );
      },
    },
  ];
};

const prefixIt = (css = '', prefix = '') => {
  return postcss()
    .use(
      prefixer({
        prefix,
        // exclude: ['.c'],
      })
    )
    .process(css).css;
};

const urlUnpacker = (outDir = '', workDir = '', content = '') => {
  if (!/url\(['"]?([^)'"?]*)["?)]?/gm.test(content)) {
    return content;
  }

  const matches = content.matchAll(/url\(['"]?([^)'"?]*)["?)]?/gm);

  for (const match of matches) {
    if (!/data:/.test(match[0]) && !/^(?!\.)\/assets/.test(match[1])) {
      try {
        const sourcePath = join(workDir, match[1]);
        const fileName = basename(sourcePath);
        const targetPath = join(outDir, fileName);
        copyFile(sourcePath, targetPath);
        content = content.replace(match[1], fileName);
      } catch (e) {
        console.error('ERROR: ', e);
      }
    }
  }

  return content;
};

export const scssProcessor = (options = '') => {
  const { scssPath, projectDir, outDir, wrapper } = JSON.parse(options);
  const workDir = dirname(scssPath);

  return (
    /\.css$/.test(scssPath)
      ? readFile(scssPath, 'utf8')
      : compileAsync(scssPath, {
          importers: importUrlResolvers(projectDir),
        })
  )
    .then((result) => {
      const css =
        typeof result.css !== 'undefined' ? result.css.toString() : result;
      if (!css || css === '') {
        return '';
      }

      let content = urlUnpacker(outDir, workDir, css);
      content = wrapper ? prefixIt(content, `[${wrapper}]`) : content;
      return `\n\n/* file: ${scssPath} */\n${content}`;
    })
    .catch((err) => {
      return `\n\n/* file: ${scssPath} */\n/* ${err} */`;
    });
};

export const getCache = () => {
  return Promise.resolve(scssCache);
};
