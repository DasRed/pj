'use strict';

var ERROR = require('./../error');
var fs = require('fs');
var lodash = require('./../../lodash/lodash.js');

/**
 * collect files for include into the page
 *
 * @param {Array} collection
 * @param {String} path
 * @param {String} extension
 * @returns {Array}
 */
var collectFilesRecursive = function(collection, path, extension)
{
	if (path === undefined || path === null || path === '' || fs.isDirectory(path) === false)
	{
		return collection;
	}

	console.debug('[Injector] Searching files in: ./' + path);

	fs.list(path).forEach(function(entry)
	{
		if (entry == '.' || entry == '..')
		{
			return;
		}

		if (fs.isDirectory(path + '/' + entry) === true)
		{
			collectFilesRecursive(collection, path + '/' + entry, extension);
		}
		else if (entry.substr(-1 * extension.length) == extension)
		{
			collection.push(path + '/' + entry);
		}
	});

	return collection;
};

/**
 * constructor
 *
 * @param {Array} collection
 * @param {String} path
 * @param {String} extension
 * @returns {Injector}
 */
var Injector = function(collection, path, extension)
{
	this.collection = lodash.clone(collection || []);
	this.path = path;
	this.extension = extension || this.extension;

	return this;
};

// prototype
Injector.prototype = Object.create(Object.prototype,
{
	_path:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: null
	},
	collection:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: []
	},
	extension:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: 'js'
	},
	path:
	{
		get: function()
		{
			return this._path;
		},
		set: function(path)
		{
			if (path === undefined || path === null || path === '' || fs.isDirectory(path) === false)
			{
				this._path = null;
			}

			this._path = path;
		}
	}
});

/**
 * returns the collected files
 *
 * @returns {Array}
 */
Injector.prototype.getFiles = function()
{
	return collectFilesRecursive(this.collection, this.path, this.extension);
};

/**
 * inject all files
 *
 * @param {Webpage} page
 * @returns {Injector}
 */
Injector.prototype.inject = function(page)
{
	this.collection = this.getFiles();

	// inject required bootstrap JS Files for the application
	this.collection.forEach(function(file)
	{
		console.debug('[Injector] Injecting file: ./' + file);
		if (page.injectJs(file) === false)
		{
			console.error('[Injector] Can not find file "' + file + '"!');
			phantom.exit(ERROR.FILE)
		}
	});

	return this;
};

module.exports = Injector;