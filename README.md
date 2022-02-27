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

### Add Configuration

If you have an existing application that you would like to use esbuild with, you can run the following command

```bash
nx g nx-ng-esbuild:add-esbuild-config appName
```

Or, alternatively, if you want to generate a new Angular app with esbuild support, you can run the following

```bash
nx g nx-ng-esbuild:app appName
```

### Building

Run the build

```bash
nx run app1:esbuild
```

You can also pass the `--watch=true` flag to have it rebuild on changes.

```bash
nx run app1:esbuild --watch=true
```

### Serving

It also supports serving locally for rapid development

You can also pass the `--serve=true` glag to have it serve the app on a basic http server. By default this was also set `--watch=true`

```bash
nx run app1:esbuild --serve=true
```

You can customise the port to serve on with the `--port` flag:

```bash
nx run app1:esbuild --serve=true --port=4201
```

## Notes

- Not ready for production!!
- Doesn't run type checking!
- Doesn't hash files
- Dry Run likely doesn't work
- Doesn't use a built in cache
- Larger bundle size than Angular Builder

## Contributing

Feel free to! Should be straightforward. The issues above are likely good ones to address.
