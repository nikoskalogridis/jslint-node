/*jslint
    node
*/

"use strict";

var R = require("ramda");

var defaultLogger = {
    log: console.log.bind(console)
};

function color(code, string) {
    return "\u001b[" + code + "m" + string + "\u001b[0m";
}

var chalk = {
    bold: R.partial(color, [1]),
    red: R.partial(color, [31]),
    green: R.partial(color, [32]),
    yellow: R.partial(color, [33]),
    blue: R.partial(color, [34]),
    grey: R.partial(color, [90])
};

function pad(length, s) {
    if (s.length >= length) {
        return s;
    }
    var mask = new Array(length).join(" ");
    return s.concat(mask).slice(0, length);
}

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
                var data = [
                    file,
                    e.line + fudge,
                    e.column + fudge,
                    e.message
                ];
                logger.log(data.join(":"));
            });
        } else {
            logger.log(fileMessage);
            lint.warnings.forEach(function (e, i) {
                var line =
                        " // Line "
                        + (e.line + fudge)
                        + ", Pos "
                        + (e.column + fudge);

                logger.log(
                    pad(3, "#" + String(i + 1)) + " " + c("yellow", e.message)
                );
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
