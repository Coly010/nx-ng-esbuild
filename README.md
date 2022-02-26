# Nx Plugin Repo for ESBuild of Angular

> Note: This uses work from https://github.com/cherryApp/ngc-esbuild
> Go send them love!

Plugin to help you use ESBuild with Angular in an Nx Workspace

## Usage

First install the Nx Plugin

```bash
npm install --save-dev nx-ng-esbuild

yarn add -D nx-ng-esbuild
```

Next, create a new configuration in the `angular.json`/`workspace.json`/`project.json` for your app. (Replace `app1` and other options to match your setup);

```json
"esbuild": {
  "executor": "nx-ng-esbuild:esbuild",
  "options": {
    "entryPoints": ["apps/app1/src/main.ts"],
    "outdir": "dist/apps/app1",
    "index": "apps/app1/src/index.html",
    "assets": ["apps/app1/src/favicon.ico", "apps/app1/src/assets"],
    "styles": ["apps/app1/src/styles.scss"],
    "scripts": [],
    "tsconfig": "apps/app1/tsconfig.app.json"
  }
}
```

Run the build

```bash
nx run app1:esbuild
```

## Notes

- Not ready for production!!
- Doesn't hash files
- Dry Run likely doesn't work
- Doesn't use a built in cache
- Doesn't support watch
- Larger bundle size than Angular Builder

## Contributing

Feel free to! Should be straightforward. The issues above are likely good ones to address.
