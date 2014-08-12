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
			messageStack.push(' -> ' + t.file + ': ' + t.line + (t['function'] ? ' (in function "' + t['function'] + '")' : ''));
		});
	}
	console.error(messageStack.join('\n'));

	phantom.exit(ERROR.JS_ERRORS);
};

var config = require('./lib/pj/config/loader');

// page
console.info('[Run] Creating webpage');
var page = require('./lib/pj/page/creator');

// creating the handler for all reporter
console.info('[Run] Creating reporter handler');
var reporterHandler = new (require('./lib/pj/reporter/handler'))(page);

// loading junit reporter
console.info('[Run] Creating reporter: debug');
reporterHandler.add(new (require('./lib/pj/reporter/writer/debug'))());

// loading junit reporter
if (config.log !== undefined && config.log.jUnit !== undefined && config.log.jUnit !== null)
{
	console.info('[Run] Creating jUnit reporter: jUnit');
	reporterHandler.add(new (require('./lib/pj/reporter/writer/jUnit'))(config.log.jUnit));
}

//load the defined reporter
console.info('[Run] Creating reporter: console');
reporterHandler.add(new (require('./lib/pj/reporter/writer/console'))());

// loading reporter for finishing
if (config.exitOnFinish === true)
{
	console.info('[Run] Creating reporter: finished');
	reporterHandler.add(new (require('./lib/pj/reporter/writer/finished'))());
}

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
var injectorBootstrap = new injector(config.bootstrap);

var injectorTests = null;
// create tests from path
if (cliOptions.tests === undefined)
{
	console.info('[Run] creating injector from config file with tests ' + JSON.stringify(config.tests) + ' in path "' + config.pathTests + '"');
	injectorTests = new injector(config.tests, config.pathTests);
}
// use given tests
else
{
	console.info('[Run] creating injector from cli options file with tests ' + JSON.stringify(config.tests) + '.');
	var testFiles = [];
	config.tests.forEach(function(entry, index)
	{
		if (fs.isDirectory(entry) === true)
		{
			var testCollector = new injector(testFiles, entry, 'js');
			testFiles = testCollector.getFiles();
		}
		else
		{
			testFiles.push(entry);
		}
	});
	injectorTests = new injector(testFiles);
}

// open the dummy page
console.info('[Run] Open webpage "' + config.pageFile + '"');
page.open('file:///' + config.pageFile, function()
{
	// inject files
	injectorBootstrap.inject(page);
	injectorTests.inject(page);
});