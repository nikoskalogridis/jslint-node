/*jslint
    node
*/

"use strict";

var chalk = require("chalk");
var _ = require("lodash");

var defaultLogger = {
    log: (console.log).bind(console),
    err: (process.stderr.write).bind(process.stderr)
};

exports.report = function (file, lint, options) {
    var fudge = Number(lint.option && lint.option.fudge) || 0;
    var logger = options.logger || defaultLogger;
    var colorize = options.color === undefined
        ? true
        : options.color;
    var terse = options.terse;
    var fileMessage;

    function c(format, str) {
        if (colorize) {
            return chalk[format](str);
        }
        return str;
    }

    fileMessage = "\n" + c("bold", file);

    function row(e) {
        return e.line + fudge;
    }
    function col(e) {
        return (e.character || e.column) + fudge;
    }
    function evidence(e) {
        return e.evidence || (lint.lines && lint.lines[e.line]) || "";
    }

    if (!lint.ok) {
        if (terse) {
            lint.warnings.forEach(function (e) {
                logger.log(file + ":" + row(e) + ":" + col(e) + ": " + e.message);
            });
        } else {
            logger.log(fileMessage);
            lint.warnings.forEach(function (e, i) {
                var line = " // Line " + row(e) + ", Pos " + col(e);

                logger.log(_.pad("#" + String(i + 1), 3) + " " + c("yellow", e.message));
                logger.log("    " + evidence(e).trim() + c("grey", line));
            });
        }
    } else {
        if (!options.quiet) {
            if (terse) {
                logger.err(".");
            } else {
                logger.log(fileMessage + " is " + c("green", "OK") + ".");
            }
        }
    }

    return lint.ok;
};
