/*
 * Copyright (c) 2008-2013 Pivotal Labs
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Starting with version 2.0, this file "boots" Jasmine, performing all of the necessary
 * initialization before executing the loaded environment and all of a project's specs. This file
 * should be loaded after `jasmine.js`, but before any project source files or spec files are
 * loaded. Thus this file can also be used to customize Jasmine for a project. If a project is using
 * Jasmine via the standalone distribution, this file can be customized directly. If a project is
 * using Jasmine via the [Ruby gem][jasmine-gem], this file can be copied into the support directory
 * via `jasmine copy_boot_js`. Other environments (e.g., Python) will have different mechanisms. The
 * location of `boot.js` can be specified and/or overridden in `jasmine.yml`. [jasmine-gem]:
 * http://github.com/pivotal/jasmine-gem
 */

(function()
{

	/**
	 * ## Require &amp; Instantiate Require Jasmine's core files. Specifically, this requires and
	 * attaches all of Jasmine's code to the `jasmine` reference.
	 */
	window.jasmine = jasmineRequire.core(jasmineRequire);

	/**
	 * Create the Jasmine environment. This is used to run all specs in a project.
	 */
	var env = jasmine.getEnv();

	/**
	 * ## The Global Interface Build up the functions that will be exposed as the Jasmine public
	 * interface. A project can customize, rename or alias any of these functions as desired,
	 * provided the implementation remains unchanged.
	 */
	var jasmineInterface =
	{
		describe: function(description, specDefinitions)
		{
			return env.describe(description, specDefinitions);
		},

		xdescribe: function(description, specDefinitions)
		{
			return env.xdescribe(description, specDefinitions);
		},

		it: function(desc, func)
		{
			return env.it(desc, func);
		},

		xit: function(desc, func)
		{
			return env.xit(desc, func);
		},

		beforeEach: function(beforeEachFunction)
		{
			return env.beforeEach(beforeEachFunction);
		},

		afterEach: function(afterEachFunction)
		{
			return env.afterEach(afterEachFunction);
		},

		expect: function(actual)
		{
			return env.expect(actual);
		},

		pending: function()
		{
			return env.pending();
		},

		spyOn: function(obj, methodName)
		{
			return env.spyOn(obj, methodName);
		},

		jsApiReporter: new jasmine.JsApiReporter(
		{
			timer: new jasmine.Timer()
		})
	};

	/**
	 * Add all of the Jasmine global/public interface to the proper global, so a project can use the
	 * public interface directly. For example, calling `describe` in specs instead of
	 * `jasmine.getEnv().describe`.
	 */
	if (typeof window == "undefined" && typeof exports == "object")
	{
		extend(exports, jasmineInterface);
	}
	else
	{
		extend(window, jasmineInterface);
	}

	/**
	 * Expose the interface for adding custom equality testers.
	 */
	jasmine.addCustomEqualityTester = function(tester)
	{
		env.addCustomEqualityTester(tester);
	};

	/**
	 * Expose the interface for adding custom expectation matchers
	 */
	jasmine.addMatchers = function(matchers)
	{
		return env.addMatchers(matchers);
	};

	/**
	 * Expose the mock interface for the JavaScript timeout functions
	 */
	jasmine.clock = function()
	{
		return env.clock;
	};

	/**
	 * Setting up timing functions to be able to be overridden. Certain browsers (Safari, IE 8,
	 * phantomjs) require this hack.
	 */
	window.setTimeout = window.setTimeout;
	window.setInterval = window.setInterval;
	window.clearTimeout = window.clearTimeout;
	window.clearInterval = window.clearInterval;

	/**
	 * ## Execution Replace the browser window's `onload`, ensure it's called, and then run all of
	 * the loaded specs. This includes initializing the `HtmlReporter` instance and then executing
	 * the loaded Jasmine environment. All of this will happen after all of the specs are loaded.
	 */
	var currentWindowOnload = window.onload;

	window.onload = function()
	{
		if (currentWindowOnload)
		{
			currentWindowOnload();
		}
		htmlReporter.initialize();
		env.execute();
	};

	/**
	 * Helper function for readability above.
	 */
	function extend(destination, source)
	{
		for (var property in source)
		{
			destination[property] = source[property];
		}
		return destination;
	}

}());
