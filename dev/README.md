# Getting started
This template is made by Grunt and Grunt plugins that are installed and managed via npm, the Node.js package manager. It requires stable Node.js version 16

# Install the Grunt CLI for the first time of using
You’ll need to install Grunt’s command line interface (CLI) globally. You may need to use sudo (for OSX, *nix, BSD etc) or run your command shell as Administrator (for Windows) to do this.

```sh
npm install -g grunt-cli
```

# Install npm dependencies
Just simply to use this command
```sh
npm install
```

# Start development mode
Build files, launch your default Web Browser automatically, and watch your changes
```sh
npm run dev
```

# Build files for production
Build files and make them ready for your production, all of HTML/CSS/JS files will be minified
```sh
npm run build
```

# Minify images
We use kraken.io service to minify images, you can update setting to your kraken.io account by updating `configs.krakenApiKey` and `configs.krakenApiSecret` in package.json file. Finally run this command
```sh
npm run imagemin
```

# Lint check
If you only want to do lint check for HTML/CSS/JS files without starting development env., you can use this command:
```sh
npm run lint
```

# Options

## Dev Mode
You can change this setting to `true` in Gruntfile.js if you want to have CSS map files for developing. But it will stop CSS autofix feature, you should turn it off after done developing
```
grunt.config.set('devMode', false);
```

## Use Root Path
If you want to use root path like `http://localhost:3000` instead of `http://localhost:3000/fct000/`, you can change this setting to `true`
```
grunt.config.set('useRootPath', false);
```
