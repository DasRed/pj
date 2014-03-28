'use strict';

var fs = require('fs');
var ERROR = require('./lib/pj/error');
var cliOptions = require('./lib/pj/cli/parser');
var console = require('./lib/pj/console');

// print a help message
if (cliOptions.help === true)
{
	cliOptions.printHelp();
	phantom.exit(0);
}

/**
 * callback for phantom js errors
 *
 * @param {String} message
 * @param {Array} trace
 */
phantom.onError = function(message, trace)
{
	var messageStack =
	[
		'[Phantom Error] ' + message
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

	phantom.exit(ERROR.JS_ERRORS);
};

var config = require('./lib/pj/config/loader');

// page
console.info('[Run] Creating webpage');
var page = require('./lib/pj/page/creator');

//load the defined reporter
console.info('[Run] Creating reporter: ' + config.reporter);
var reporterConfig = new (require('./lib/pj/reporter/lib/factory'))(page, function()
{
	if (config.exitOnFinish === true)
	{
		phantom.exit(0);
	}
});

// resource watcher for waiting of resources are finished
console.info('[Run] Creating resource watcher');
var resourceWatcher = new (require('./lib/pj/page/resourceWatcher'))(page, function()
{
	console.info('[Run] Starting jasmine');
	// execute jasmine
	page.evaluate(function()
	{
		// create and add the reporter
		jasmine.getEnv().addReporter(new jasmine.PhantomJsJasmineReporterBridge());

		// execute
		jasmine.getEnv().execute();
	});
});

//creating injectors
console.info('[Run] Injecting webpage');
var injector = require('./lib/pj/page/injector');
var injectorBootstrap = new injector(config.bootstrap, config.pathJs);

var injectorTests = null;
// create tests from path
if (cliOptions.tests === undefined)
{
	injectorTests = new injector(config.tests, config.pathTests);
}
// use given tests
else
{
	var testFiles = [];
	cliOptions.tests.forEach(function(entry, index)
	{
		if (fs.isDirectory(config.pathTests + '/' + entry) === true)
		{
			var testCollector = new injector(testFiles, config.pathTests + '/' + entry, 'js');
			testFiles = testCollector.getFiles();
		}
		else
		{
			testFiles.push(config.pathTests + '/' + entry);
		}
	});
	injectorTests = new injector(testFiles);
}

// open the dummy page
console.info('[Run] Open webpage');
page.open('file:///' + phantom.libraryPath + '/' + config.pageFile, function()
{
	// inject files
	injectorBootstrap.inject(page);
	injectorTests.inject(page);
});