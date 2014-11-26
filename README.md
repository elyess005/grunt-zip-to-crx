# grunt-zip-to-crx

> Generates [chrome extension](https://developer.chrome.com/extensions) files (.crx) from zipped projects.

Chrome extension is zipped electronically signed file. Signature is distributed along with packed content inside .crx file. Both crx file [specification](https://developer.chrome.com/extensions/crx) and general chrome extension [documentation](https://developer.chrome.com/extensions) are available on developer.chrome.com.

This plugin is not able to generate zip itself, mostly because [grunt-contrib-compress](https://github.com/gruntjs/grunt-contrib-compress#readme) does a good job and is actively maintained by grunt team. Use it to pack you extension files. Once you have .zip with `manifest.json` and everything else inside, you can use this plugin to sign it and generate chrome extension distribution (.crx).

## Dependencies
The project requires [`openssl`](http://www.openssl.org/) installed and available on path. Windows and solaris distributions are available [here](https://www.openssl.org/related/binaries.html). 

Note: I would like to remove this dependency. Unfortunately, that requires me to decode/encode ans1 files. Although decoder is available, I did not found encoder yet.

## Alternatives
There is another project [grunt-crx](https://github.com/oncletom/grunt-crx) able to generate .crx files. Its main advantage is ability to both zip files and sign files, so you probably want to give it a try. Its main disadvantage is speed - it copies everything into temporary directory, then deletes excluded files and packs the result. This is fine on small projects or when you have all extension files in separate directory. However, it may end up copying a lot of files (whole `.git` directory) on some projects and that was very slow.

## Getting Started
Install this plugin with this command:

```shell
npm install grunt-zip-to-crx --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-zip-to-crx');
```

## The "zip_to_crx" task

### Overview
In your project's Gruntfile, add a section named `zip_to_crx` to the data object passed into `grunt.initConfig()`.

Find all .zip files in `tmp/` directory, sign them and place results into the `distribution` directory:
```js
grunt.initConfig({
  zip_to_crx: {
    options: {
      // Location of pem oncoded private key. 
      privateKey: "test/ssl-keys/local.pem"
    },
    your_target: {
        // all zip files in tmp are assumed to be future extentions
        src: "tmp/*.zip", 
        // .crx will be placed in the distribution directory
        dest: "distribution/"
    },
  },
});
```

Convert `tmp/my-supercool-extension-<version>.zip` into `distribution/my-supercool-extension-<version>.crx` file:
```js
grunt.initConfig({
  zip_to_crx: {
    options: {
      // Location of pem oncoded private key. 
      privateKey: "test/ssl-keys/local.pem"
    },
    your_target: {
        // input zip file
        src: "tmp/my-supercool-extension-<version>.zip", 
        // output .crx file
        dest: "distribution/my-supercool-extension-<version>.crx"
    },
  },
});
```

If the `dest` ends with slash `/`, plugin will treat it as a directory. .crx file name is guessed from input .zip file name. This generates output file as the previous configuration:
```js
grunt.initConfig({
  zip_to_crx: {
    options: {
      // Location of pem oncoded private key. 
      privateKey: "test/ssl-keys/local.pem"
    },
    your_target: {
        // input zip file
        src: "tmp/my-supercool-extension-<version>.zip", 
        // output .crx file
        dest: "distribution/"
    },
  },
});
```

### Options

#### options.separator
Type: `String`
Default value: `',  '`

A string value that is used to do something with whatever.

#### options.punctuation
Type: `String`
Default value: `'.'`

A string value that is used to do something else with whatever else.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  zip_to_crx: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  zip_to_crx: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
