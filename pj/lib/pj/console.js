'use strict';

var system = require('system');
var config = require('./config/loader');
var lodash = require('./../lodash/lodash.js');

// log levels
console.LEVEL_ERROR = 3;
console.LEVEL_WARN = 4;
console.LEVEL_INFO = 6;
console.LEVEL_DEBUG = 7;

var warnText = {}
warnText[console.LEVEL_ERROR]	= 'error';
warnText[console.LEVEL_WARN]	= 'warn ';
warnText[console.LEVEL_INFO]	= 'info ';
warnText[console.LEVEL_DEBUG]	= 'debug';

var filterByRegex = null;
if (config.log.filter.regexp !== null)
{
	var match = config.log.filter.regexp.match(new RegExp('^/(.*?)/(g?i?m?y?)$'));
	if (match !== null && match.length >= 3)
	{
		filterByRegex = new RegExp(match[1], match[2]);
	}
}

/**
 * returns date time for output formated
 *
 * @returns {String}
 */
var getDateTimeFormated = function()
{
	var date = new Date();

	// get primitiv values from date
	var day = String(date.getDate());
	var month = String(date.getMonth() + 1);
	var year = String(date.getFullYear());

	var hours = String(date.getHours());
	var minutes = String(date.getMinutes());
	var seconds = String(date.getSeconds());
	var milliseconds = String(date.getMilliseconds());

	// make it readable for humans. we need more maschines. long live skynet
	day = (day.length < 2 ? '0' : '') + day;
	month = (month.length < 2 ? '0' : '') + month;

	hours = (hours.length < 2 ? '0' : '') + hours;
	minutes = (minutes.length < 2 ? '0' : '') + minutes;
	seconds = (seconds.length < 2 ? '0' : '') + seconds;
	milliseconds = (milliseconds.length < 3 ? '0' : '') + milliseconds;
	milliseconds = (milliseconds.length < 3 ? '0' : '') + milliseconds;

	// make human readable date string
	return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
};

/**
 * wrapper function for console functions
 *
 * @param {String} warnLevel
 * @param {Function} proceed
 * @param {Mixed} ...
 * @param {Mixed} ...
 * ...
 */
var wrapper =  function(warnLevel, proceed)
{
	var parameters = [];

	// with warnlevel
	if (warnLevel !== null)
	{
		// not in config range
		if (warnLevel > config.log.level)
		{
			return;
		}

		// create parameters
		parameters.push('[' + warnText[warnLevel] + '] [' + getDateTimeFormated() + ']');
	}

	// make args to array.
	var args = lodash.toArray(arguments);
	// first in args is warnlevel. must be removed
	// second in args is wrapped function. must be removed
	args.shift();
	args.shift();

	parameters = parameters.concat(args);

	// filter by regex
	if (filterByRegex !== null)
	{
		var stringToTest = lodash.reduce(parameters, function(acc, logValue)
		{
			try
			{
				return acc + ' ' + String(logValue);
			}
			catch (e)
			{
				return acc;
			}
		}, '');
		if (filterByRegex.test(stringToTest) === config.log.filter.not)
		{
			return undefined;
		}
	}

	// run original function for console
	if (proceed.apply)
	{
		return proceed.apply(this, parameters);
	}
	// IE8 does not support .apply on the console functions :(
	else
	{
		return proceed(parameters.join(''));
	}
};

// Backup
var consoleError = console.error;
var consoleWarn = console.warn;
var consoleInfo = console.info;
var consoleLog = console.log;
var consoleDebug = console.debug;

// wraps all log functions
console.error = lodash.partial(wrapper, console.LEVEL_ERROR, consoleError);
console.warn = lodash.partial(wrapper, console.LEVEL_WARN, consoleWarn);
console.info = lodash.partial(wrapper, console.LEVEL_INFO, consoleInfo);
console.log = lodash.partial(wrapper, console.LEVEL_DEBUG, consoleLog);
console.debug = lodash.partial(wrapper, console.LEVEL_DEBUG, consoleDebug);

console.writeLine = lodash.partial(wrapper, null, system.stdout.writeLine);
console.write = lodash.partial(wrapper, null, system.stdout.write);

module.exports = console;