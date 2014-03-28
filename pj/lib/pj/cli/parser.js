var system = require('system');
var fs = require('fs');
var lodash = require('./../../lodash/lodash');

// load Options
var configOptions = JSON.parse(fs.read(phantom.libraryPath + '/lib/pj/cli/config.json'));
var configDefault = JSON.parse(fs.read(phantom.libraryPath + '/lib/config-default.json'));

/**
 * creates Options informations from the config
 *
 * @param {Object} config
 * @param {String} prefix
 * @returns {Object}
 */
var getOptionsFromConfig = function(config, prefix)
{
	return lodash.reduce(config, function(acc, value, name)
	{
		var configOptionsName = prefix + '-' + name;

		// arrays are not supported
		if (lodash.isArray(value))
		{
			return acc;
		}

		// deeper for objects
		else if (lodash.isPlainObject(value))
		{
			return lodash.merge(acc, getOptionsFromConfig(value, configOptionsName));
		}

		var option =
		{
			name: configOptionsName,
			type: 'string',
			description: 'config option for the config ' + configOptionsName.replace(/-/gi, '.')
		};

		if (lodash.isBoolean(value))
		{
			option.type = 'boolean';
		}
		else if (lodash.isNumber(value))
		{
			option.type = 'number';
		}

		acc[configOptionsName] = option;

		return acc;
	}, {});
};

// merge configs into options
configOptions = lodash.merge(getOptionsFromConfig(configDefault, 'config'), configOptions, function(a, b)
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

// create the short configs
var configOptionsByShort = lodash.reduce(configOptions, function(acc, value, key)
{
	if (value.short !== undefined)
	{
		acc[value.short] = value;
	}

	return acc;
}, {});

var currentOption = null;

/**
 * returns the correct option settings
 *
 * @param {String} name
 * @returns {Object}
 */
var getOptionSetting = function(name)
{
	if (configOptions[name] !== undefined)
	{
		return configOptions[name];
	}
	else if (configOptionsByShort[name] !== undefined)
	{
		return configOptionsByShort[name];
	}

	return {
		name: name,
		type: "string"
	};
};

/**
 * returns the correct value
 *
 * @param {Object} option
 * @param {String} value
 * @returns {Mixed}
 */
var parseValue = function(option, value)
{
	switch (option.type)
	{
		case 'flag':
			return true;

		case 'boolean':
			if (value === undefined || value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1')
			{
				return true;
			}
			return false;

		case 'number':
			if (value === '')
			{
				return null;
			}
			return Number(value);

		case 'list':
			if (value === undefined || value === null)
			{
				return [];
			}
			return value;

		case 'string':
		default:
			return value;
	}
};

// parse the argv
var parsedOptions = lodash.reduce(system.args, function(acc, value, index)
{
	// running js file
	if (index <= 0)
	{
		return acc;
	}

	// new option
	if (value.match(/^(-){1,2}/i))
	{
		currentOption = getOptionSetting(value.replace(/^(-){1,2}(.+)$/i, '$2'));
		acc[currentOption.name] = parseValue(currentOption, undefined);
	}
	else
	{
		if (currentOption.type === 'list')
		{
			acc[currentOption.name].push(parseValue(currentOption, value));
		}
		else
		{
			acc[currentOption.name] = parseValue(currentOption, value);
		}
	}

	return acc;
}, {});

parsedOptions.printHelp = function()
{
	console.writeLine('Usage:');
	console.writeLine('    phantomjs ' + system.args[0] + ' [options]');
	console.writeLine('');
	console.writeLine('Options');
	lodash.each(configOptions, function(option, key)
	{
		var text = [];
		if (option.short !== undefined)
		{
			text.push('-' + option.short + ',');
		}
		text.push('--' + key);

		switch (option.type)
		{
			case 'flag':
				break;

			case 'boolean':
				text.push(' <true|false>');
				break;

			case 'number':
				text.push(' <NUMBER>');
				break;

			case 'list':
				text.push(' <STRING> <STRING> ...');
				break;

			case 'string':
			default:
				text.push(' <STRING>');
				break;
		}
		text = '    ' + text.join('');
		for (var i = 60 - text.length; i >= 0; i--)
		{
			text += ' ';
		}
		console.writeLine(text + option.description);
	});
};

module.exports = parsedOptions;