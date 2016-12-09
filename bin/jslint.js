#!/usr/bin/env node

/*jslint
    node
*/

"use strict";

var nopt = require("nopt");
var exit = require("exit");
var glob = require("glob");
var watch = require("glob-watcher");
var when = require("when");
var _ = require("lodash");
var report = require("./../lib/reporter");
var jslinter = require("../lib");
var helpers = require("../lib/helpers");
var packageData = require("../package.json");

function commandOptions() {
    var commandOpts = {};
    var cliFlags = [
        "color", "terse", "version", "quiet", "update", "watch", "fudge", "devel"
    ];
    var allFlags = cliFlags;

    allFlags.forEach(function (option) {
        commandOpts[option] = Boolean;
    });

    return commandOpts;
}

function die(why) {
    var o = commandOptions();
    console.warn(why);
    console.warn("Usage: " + process.argv[1] +
            " [--" + Object.keys(o).sort().join("] [--") +
            "] [--] <scriptfile>...");
    exit(1);
}

function parseArgs(argv) {
    var args = nopt(commandOptions(), {}, argv);
    if (args.filter === undefined) {
        args.filter = true;
    }
    return args;
}

function preprocessScript(script) {
    // Fix UTF8 with BOM
    if (script.charCodeAt(0) === 0xFEFF) {
        script = script.slice(1);
    }
    // remove shebang: replace it with empty line
    script = script.replace(/^#!.*/, "");

    return script;
}

function watchFiles(jslint, files) {
    console.log("Watching files...");
    var watcher = watch(files);
    watcher.on("change", jslint);
    watcher.on("add", jslint);
}

function jslintFiles(jslint, files) {
    return _(files)
        .map(_.ary(glob.sync, 1))
        .concat()
        .flatten()
        .map(jslint)
        .value();
}

function jslintFile(jslint, options, path) {
    return helpers.readFile(path)
        .then(function (program) {
            var result = jslint(preprocessScript(program), options.jslint);
            report(path, result, options);
            return result;
        });
}

function runMain(options) {
    options = parseArgs(options || process.argv);
    options.jslint = {
        fudge: options.fudge !== false,
        devel: options.devel
    };
    if (options.update) {
        console.log("Downloading JSLint from github...");
    }
    jslinter(options.update)
        .then(function (jslinter) {
            var lintFile = _.partial(jslintFile, jslinter.jslint, options);
            if (options.version) {
                var edition = "JSLint: " + jslinter.edition;
                var version = "jslint-watch: " + packageData.version;
                console.log(version, edition);
                return;
            }
            if (!options.argv.remain.length && !options.update) {
                die("No files specified.");
            }
            if (!options.argv.remain.length && options.update) {
                return console.log("JSLint: " + jslinter.edition);
            }

            if (options.watch) {
                watchFiles(_.debounce(lintFile, 200), options.argv.remain);
            } else {
                when
                    .settle(jslintFiles(lintFile, options.argv.remain))
                    .then(function (results) {
                        if (_.find(results.value, _.negate(_.property("ok")))) {
                            exit(1);
                        }
                        exit(0);
                    });
            }
        })
        .catch(console.log.bind(console));
}

runMain();
