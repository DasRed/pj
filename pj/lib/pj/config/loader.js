'use strict';

var ERROR = require('./../error');
var fs = require('fs');
var system = require('system');
var lodash = require('./../../lodash/lodash.js');
var cliOptions = require('./../cli/parser');

/**
 * handles path information on config
 *
 * @param {Object} config
 * @param {String} path
 * @returns {Object}
 */
var handlePropertiesToCorrectForPathes = function(config, path)
{
	config.bootstrap = correctToPath(config.bootstrap, path);
	config.tests = correctToPath(config.tests, path);
	config.pathJs = correctToPath(config.pathJs, path);
	config.pathTests = correctToPath(config.pathTests, path);
	config.pathResources = correctToPath(config.pathResources, path);
	config.pathIncludes = correctToPath(config.pathIncludes, path);
	config.pageFile = correctToPath(config.pageFile, path);

	if (config.log !== undefined)
	{
		config.log.jUnit = correctToPath(config.log.jUnit, path);
	}

	return config;
};

/**
 * applies a path to given option
 *
 * @param {Mixed} value
 * @param {String} path
 * @returns {Mixed}
 */
var correctToPath = function(value, path)
{
	switch(true)
	{
		case value === null:
		case value === undefined:
			break;

		case lodash.isArray(value):
			for (var i = 0; i < value.length; i++)
			{
				value[i] = correctToPath(value[i], path);
			}
			break;

		case lodash.isPlainObject(value):
			for (var key in value)
			{
				value[key] = correctToPath(value[key]);
			}
			break;

		default:
			var fileName = path + '/' + value;
			var fileNameAbsolute = fs.absolute(fileName);

			if (fs.exists(fileNameAbsolute) === true)
			{
				value = fileNameAbsolute;
			}
			else if (fs.exists(fileName) === true)
			{
				value = fileName;
			}
			break;
	}

	return value;
};

// default config
var configFiles = [
{
	path: phantom.libraryPath + '/lib/',
	file: 'config-default.json'
}];

// exists config near run.js
if (fs.isFile(phantom.libraryPath + '/config.json') === true)
{
	configFiles.push(
	{
		path: phantom.libraryPath + '/',
		file: 'config.json'
	});
}

// exists config in current working directory
if (fs.isFile(fs.workingDirectory + '/config.json') === true)
{
	configFiles.push(
	{
		path: fs.workingDirectory + '/',
		file: 'config.json'
	});
}

// command line config
if (cliOptions.config !== undefined)
{
	var file = lodash.find(
	[
		fs.workingDirectory + '/' + cliOptions.config,
		cliOptions.config
	], function(file)
	{
		return fs.isFile(file);
	});

	if (file !== undefined)
	{
		var pathParts = file.split('/');
		file = pathParts.pop();

		configFiles.push(
		{
			path: pathParts.join('/') + '/',
			file: file
		});
	}
}

//loads the config
try
{
	var config = {};
	var pathesToTest = [];
	configFiles.forEach(function(fileData)
	{
		try
		{
			pathesToTest.unshift(fileData.path);

			// load the config
			var configFromFile = JSON.parse(fs.read(fileData.path + '/' + fileData.file));

			// correct path
			configFromFile = handlePropertiesToCorrectForPathes(configFromFile, fileData.path);

			// merge into config
			config = lodash.merge(config, configFromFile, function(a, b)
			{
				// callback to merge recursive
				switch(true)
				{
					case lodash.isArray(a) && lodash.isArray(b):
						return a.concat(b);

					case lodash.isPlainObject(a) && lodash.isPlainObject(b):
						return lodash.merge(a, b);

					default:
						return b;
				}
			});
		}
		catch (e)
		{
			throw new Error('[Config Loader] ' + (e.message || e) + ': ' + file);
		}
	});

	// correct path
	for (var i = 0; i < pathesToTest.length; i++)
	{
		config = handlePropertiesToCorrectForPathes(config, pathesToTest[i]);
	}
}
catch (e)
{
	console.log('[Config Loader] Config is invalid.', e.message || e);
	phantom.exit(ERROR.CONFIG);
}

// quick config wrapper
config.log.level = cliOptions.verbose !== true ? config.log.level : 6;
config.log.page.message = cliOptions.pageMessage !== true ? config.log.page.message : true;
config.log.filter.regexp = cliOptions.filter === undefined ? config.log.filter.regexp : cliOptions.filter;
config.log.filter.not = cliOptions.filterNot !== true ? config.log.filter.not : true;

// take cli config options and overwrite existing config values
lodash.each(cliOptions, function(value, name)
{
	if (typeof value === 'function' || name.substr(0, 'config-'.length) !== 'config-')
	{
		return;
	}

	var obj = config;
	name = name.split('-');
	name.shift();

	while(name.length > 1)
	{
		if (obj[name[0]] === undefined)
		{
			obj[name[0]] = {};
		}
		obj = obj[name[0]];
		name.shift();
	}

	obj[name[0]] = value;
});

// export
module.exports = handlePropertiesToCorrectForPathes(config, fs.workingDirectory);
