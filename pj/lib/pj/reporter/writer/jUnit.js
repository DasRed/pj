'use strict';
// taken from https://github.com/larrymyers/jasmine-reporters
var ReporterBase = require('./../base.js');
var fs = require('fs');

function trim(str) { return str.replace(/^\s+/, "" ).replace(/\s+$/, "" ); }
function elapsed(start, end) { return (end - start)/1000; }
function isFailed(obj) { return obj.status === "failed"; }
function isSkipped(obj) { return obj.status === "pending"; }
function pad(n) { return n < 10 ? '0'+n : n; }
function extend(dupe, obj) { // performs a shallow copy of all props of `obj` onto `dupe`
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			dupe[prop] = obj[prop];
		}
	}
	return dupe;
}
function ISODateString(d) {
	return d.getFullYear() + '-' +
		pad(d.getMonth()+1) + '-' +
		pad(d.getDate()) + 'T' +
		pad(d.getHours()) + ':' +
		pad(d.getMinutes()) + ':' +
		pad(d.getSeconds());
}
function escapeInvalidXmlChars(str) {
	return str
		.replace(/\&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/\>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/\'/g, "&apos;");
}
function log(str) {
	console.log('[ReporterJUnit] ' + str);
}


/**
 * Generates JUnit XML for the given spec run. There are various options
 * to control where the results are written, and the default values are
 * set to create as few .xml files as possible. It is possible to save a
 * single XML file, or an XML file for each top-level `describe`, or an
 * XML file for each `describe` regardless of nesting.
 *
 * Usage:
 *
 * jasmine.getEnv().addReporter(new jasmineReporters.ReporterJUnit(options);
 *
 * @param {object} [options]
 * @param {boolean} [useDotNotation] whether to separate suite names with
 *   dots instead of spaces, ie "Class.init" not "Class init" (default: true)
 */

/**
 * constructor
 *
 * @param {String} file
 * @returns {ReporterJUnit}
 */
var ReporterJUnit = function(file)
{
	ReporterBase.call(this);

	var self = this;
	self.started = false;
	self.finished = false;

	// sanitize arguments
	self.useDotNotation = false;
	self.file = file;

	var suites = [];
	var currentSuite = null;
	var totalSpecsExecuted = 0;

	var __suites = {}, __specs = {};
	function getSuite(suite) {
		__suites[suite.id] = extend(__suites[suite.id] || {}, suite);
		return __suites[suite.id];
	}
	function getSpec(spec) {
		__specs[spec.id] = extend(__specs[spec.id] || {}, spec);
		return __specs[spec.id];
	}

	self.jasmineStarted = function(summary) {
		ReporterBase.prototype.jasmineStarted.apply(self, arguments);

		self.started = true;
	};
	self.suiteStarted = function(suite) {
		ReporterBase.prototype.suiteStarted.apply(self, arguments);

		suite = getSuite(suite);
		suite._startTime = new Date();
		suite._specs = [];
		suite._suites = [];
		suite._failures = 0;
		suite._skipped = 0;
		suite._parent = currentSuite;
		if (!currentSuite) {
			suites.push(suite);
		} else {
			currentSuite._suites.push(suite);
		}
		currentSuite = suite;
	};
	self.specStarted = function(spec) {
		ReporterBase.prototype.specStarted.apply(self, arguments);

		spec = getSpec(spec);
		spec._startTime = new Date();
		spec._suite = currentSuite;
		currentSuite._specs.push(spec);
	};
	self.specDone = function(spec) {
		ReporterBase.prototype.specDone.apply(self, arguments);

		spec = getSpec(spec);
		spec._endTime = new Date();
		if (isSkipped(spec)) { spec._suite._skipped++; }
		if (isFailed(spec)) { spec._suite._failures++; }
		totalSpecsExecuted++;
	};
	self.suiteDone = function(suite) {
		ReporterBase.prototype.suiteDone.apply(self, arguments);

		suite = getSuite(suite);
		// disabled suite (xdescribe) -- suiteStarted was never called
		if (suite._parent === undefined) {
			self.suiteStarted(suite);
			suite._disabled = true;
		}
		suite._endTime = new Date();
		currentSuite = suite._parent;
	};
	self.jasmineDone = function() {
		ReporterBase.prototype.jasmineDone.apply(self, arguments);

		var output = '<?xml version="1.0" encoding="UTF-8" ?>\n<testsuites>';
		for (var i = 0; i < suites.length; i++) {
			output += self.getOrWriteNestedOutput(suites[i]);
		}
		output += '\n</testsuites>';
		fs.write(self.file, output, 'w');
		self.finished = true;
	};

	self.getOrWriteNestedOutput = function(suite) {
		var output = suiteAsXml(suite);
		for (var i = 0; i < suite._suites.length; i++) {
			output += self.getOrWriteNestedOutput(suite._suites[i]);
		}

		return output;
	};

	/******** Helper functions with closure access for simplicity ********/
	function getFullyQualifiedSuiteName(suite) {
		var fullName;
		if (self.useDotNotation) {
			fullName = suite.description;
			for (var parent = suite._parent; parent; parent = parent._parent) {
				fullName = parent.description + '.' + fullName;
			}
		} else {
			fullName = suite.fullName;
		}

		return escapeInvalidXmlChars(fullName);
	}

	function suiteAsXml(suite) {
		if (suite._specs.length == 0)
		{
			return '';
		}
		var xml = '\n <testsuite name="' + getFullyQualifiedSuiteName(suite) + '"';
		xml += ' timestamp="' + ISODateString(suite._startTime) + '"';
		xml += ' hostname="localhost"'; // many CI systems like Jenkins don't care about this, but junit spec says it is required
		xml += ' time="' + elapsed(suite._startTime, suite._endTime) + '"';
		xml += ' errors="0"';
		xml += ' tests="' + suite._specs.length + '"';
		xml += ' skipped="' + suite._skipped + '"';
		// Because of JUnit's flat structure, only include directly failed tests (not failures for nested suites)
		xml += ' failures="' + suite._failures + '"';
		xml += '>';

		for (var i = 0; i < suite._specs.length; i++) {
			xml += specAsXml(suite._specs[i]);
		}
		xml += '\n </testsuite>';
		return xml;
	}
	function specAsXml(spec) {
		var xml = '\n  <testcase classname="' + getFullyQualifiedSuiteName(spec._suite) + '"';
		xml += ' name="' + escapeInvalidXmlChars(spec.description) + '"';
		xml += ' time="' + elapsed(spec._startTime, spec._endTime) + '"';
		xml += '>';

		if (isSkipped(spec)) {
			xml += '<skipped />';
		} else if (isFailed(spec)) {
			for (var i = 0, failure; i < spec.failedExpectations.length; i++) {
				failure = spec.failedExpectations[i];
				xml += '\n   <failure type="' + (failure.matcherName || "exception") + '"';
				xml += ' message="' + trim(escapeInvalidXmlChars(failure.message))+ '"';
				xml += '>';
				xml += '<![CDATA[' + trim(failure.stack || failure.message) + ']]>';
				xml += '\n   </failure>';
			}
		}
		xml += '\n  </testcase>';
		return xml;
	}
};

ReporterJUnit.prototype = Object.create(ReporterBase.prototype);

module.exports = ReporterJUnit;