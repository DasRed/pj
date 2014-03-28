'use strict';

var ERROR = require('./../error');
var fs = require('fs');
var system = require('system');
var lodash = require('./../../lodash/lodash.js');
var cliOptions = require('./../cli/parser');

// default config
var configFiles = ['/lib/config-default.json'];

// exists config near run.js
if (fs.isFile(phantom.libraryPath + '/config.json') === true)
{
	configFiles.push('config.json');
}

// command line config
if (cliOptions.config !== undefined && fs.isFile(phantom.libraryPath + '/' + cliOptions.config) === true)
{
	configFiles.push(cliOptions.config);
}

//loads the config
try
{
	var config = {};
	configFiles.forEach(function(file)
	{
		try
		{
			config = lodash.merge(config, JSON.parse(fs.read(phantom.libraryPath + '/' + file)), function(a, b)
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
	if (typeof value === 'function' ||name.substr(0, 'config-'.length) !== 'config-')
	{
		return;
	}

	var obj = config;
	var name = name.split('-');
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
module.exports = config;
