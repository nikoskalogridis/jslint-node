## jslint-node

Easily use [JSLint](http://jslint.com/) through the command line or node modules.

## Disclaimer

[JSLint](http://jslint.com/) is a program written by [Douglas Crockford](http://www.crockford.com/) that helps javascript developers write better code.

This module is just a node wrapper for this program. It is not written or supported by the author of JSLint.

## Features

* Automatically fetches the latest version of JSLint from github repository

* Supports glob file patterns

* Programmatically call jslint from your node code

* Supports watching files and lint them on change

## Install

Use npm to install it either globally or project based

```
npm install -g jslint-node
```

## Use

### Terminal

```
jslint [options] file_patterns...
```

Where options can be:

```
    --update - Updated the jslint.js file from github
    --version - print the version of this module and also the current edition of JSLint and exit
    --watch - watch for file changes and run jslint only those changed files. Script never ends
```

If no local copy of the jslint.js file is found the program will attempt to download it from the github repository even without the `--update` flag

*Notice* that there are no command line options that you can pass to the jslint function. You should add all the required flags, globals, etc. on each of the files that you want to jslint. It is the best place for this

Also note that it is your responsibility to call this script with an update flag regulary to benefit from the latest version of JSLint.

### Through your node code

```javascript

var linter = require("jslint-node");
// Executing the jslinter function takes a boolean flag for refreshing the local jslint.js file
// from the github repository or not and returns a promise. If no local jslint.js file is found the
// program will attempt to fetch the jslint.js file from the internet anyway
linter(true)
    .then(function (jslinter) {
        // which when it resolves it returns an object with the following properties:
        //   jslint:Function - the jslint function
        //   edition:string - the edition of the jslint program
        // you can now use the jslint function with the following signature:
        //   jslint(program:string, options:object, globals:[string])
        // and get the result object as described in JSLint program
        var result = jslinter.jslint("");
    });

```

## Security concerns

Since this module executes code fetched from the internet it sandboxes that code inside a plain V8 javascript engine with no access to the native node modules. So even if your internet connection, github gets hacked or in the unlikely event that D. Crockford turns to the dark side of the force your secrets won't be revealed.

But then again you are executing code fetched from NPM with your account priviledges. But that is a different story...

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed change history

## License

See [LICENSE] file.