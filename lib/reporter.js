/*jslint
    node, long
*/

"use strict";

var _ = require("lodash");

var defaultLogger = {
    log: console.log.bind(console)
};

function color(code, string) {
    return "\u001b[" + code + "m" + string + "\u001b[0m";
}

var chalk = {
    bold: _.partial(color, 1),
    red: _.partial(color, 31),
    green: _.partial(color, 32),
    yellow: _.partial(color, 33),
    blue: _.partial(color, 34),
    grey: _.partial(color, 90)
};

module.exports = function report(file, lint, options) {
    var logger = options.logger || defaultLogger;
    var terse = options.terse;
    var fudge = (lint.option && lint.option.fudge) || 0;

    function c(format, str) {
        if (options.color === undefined || options.color) {
            return chalk[format](str);
        }
        return str;
    }

    var fileMessage = "\n" + c("bold", file);

    function evidence(e) {
        return e.evidence || (lint.lines && lint.lines[e.line]) || "";
    }

    if (!lint.ok) {
        if (terse) {
            lint.warnings.forEach(function (e) {
                logger.log(file + ":" + (e.line + fudge) + ":" + (e.column + fudge) + ": " + e.message);
            });
        } else {
            logger.log(fileMessage);
            lint.warnings.forEach(function (e, i) {
                var line = " // Line " + (e.line + fudge) + ", Pos " + (e.column + fudge);

                logger.log(_.pad("#" + String(i + 1), 3) + " " + c("yellow", e.message));
                logger.log("    " + evidence(e).trim() + c("grey", line));
            });
        }
    } else {
        if (!options.quiet) {
            if (terse) {
                logger.log(".");
            } else {
                logger.log(fileMessage + " is " + c("green", "OK") + ".");
            }
        }
    }
};
