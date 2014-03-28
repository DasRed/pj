'use strict';

var ERROR = require('./../error');
var config = require('./../config/loader');
var page = require('webpage').create();

/**
 * callback for errors
 *
 * @param {String} message
 * @param {Array} trace
 * @see https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#onerror
 */
page.onError = function(message, trace)
{
	var messageStack =
	[
		'[Page Error] ' + message
	];
	if (trace && trace.length)
	{
		messageStack.push('TRACE:');
		trace.forEach(function(t)
		{
			messageStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
		});
	}
	console.error(messageStack.join('\n'));

	phantom.exit(ERROR.PAGE);
};

/**
 * callback for console messages
 *
 * @param {String} message
 * @see https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#onconsolemessage
 */
page.onConsoleMessage = function(message)
{
	if (config.log.page.message === true)
	{
		console.writeLine('[Page] ' + message);
	}
};

// cookies
phantom.cookiesEnabled = config.cookiesEnabled;
config.cookies.forEach(function(cookie)
{
	phantom.addCookie(cookie);
	page.addCookie(cookie);
});

// configs to copy
[
	'canGoBack',
	'canGoForward',
	'customHeaders',
	'navigationLocked'
].forEach(function(configName)
{
	var value = config[configName];
	if (value !== null)
	{
		page[configName] = value;
	}
});

//configs for settings
var settings = page.settings;
[
	'loadImages',
	'localToRemoteUrlAccessEnabled',
	'userAgent',
	'userName',
	'password',
	'XSSAuditingEnabled',
	'webSecurityEnabled',
].forEach(function(configName)
{
	var value = config[configName];
	if (value !== null)
	{
		settings[configName] = value;
	}
});
page.settings = settings;

module.exports = page;