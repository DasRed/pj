'use strict';
var lodash = require('./../../lodash/lodash.js');
var config = require('./../config/loader');
var fs = require('fs');

var pathesToTest =
[
	{score: 1, weight: 1, path: fs.workingDirectory},
	{score: 1, weight: 1, path: null},
	{score: 1, weight: 1, path: config.pathResources},
	{score: 1, weight: 1, path: fs.absolute(config.pathResources)},
	{score: 1, weight: 1, path: config.pathJs},
	{score: 1, weight: 1, path: fs.absolute(config.pathJs)},
	{score: 1, weight: 1, path: phantom.libraryPath}
];
lodash.each(config.pathIncludes, function(path)
{
	pathesToTest.push(
	{
		score: 1,
		weight: 1,
		path: path
	});
	pathesToTest.push(
	{
		score: 1,
		weight: 1,
		path: fs.absolute(path)
	});
});

lodash.each(pathesToTest, function(path)
{
	console.debug('[PageResourceWatcher] Using pathes to test for files (score: ' + path.score + '): ' + path.path);
});

var pathesToReplace =
[
	{score: 1, weight: 1, path: null},
	{score: 1, weight: 1, path: phantom.libraryPath},
	{score: 1, weight: 1, path: config.configPath},
	{score: 1, weight: 1, path: fs.absolute(config.configPath)}
];

lodash.each(pathesToReplace, function(path)
{
	console.debug('[PageResourceWatcher] Using pathes to replace for files (score: ' + path.score + '): ' + path.path);
});

/**
 * @param {Object} resource
 * @returns {String}
 */
var findFileForWebRequest = function(resource)
{
	var url = resource.url;
	var urlWithOutProtocol = url.replace('file:///', '');
	var fileAsRequested = urlWithOutProtocol;

	var i = undefined;
	var j = undefined;
	var file = undefined;

	var parameters = '';
	var parameterStartIndex = fileAsRequested.indexOf('?');
	if (parameterStartIndex !== -1)
	{
		parameters = fileAsRequested.substr(parameterStartIndex);
		fileAsRequested = fileAsRequested.substr(0, parameterStartIndex);
	}

	pathesToTest = pathesToTest.sort(function(pathA, pathB)
	{
		if (pathA.score > pathB.score)
		{
			return -1;
		}

		else if (pathA.score < pathB.score)
		{
			return 1;
		}

		return 0;
	});

	pathesToReplace = pathesToReplace.sort(function(pathA, pathB)
	{
		if (pathA.score > pathB.score)
		{
			return -1;
		}

		else if (pathA.score < pathB.score)
		{
			return 1;
		}

		return 0;
	});

	for (j = 0; j < pathesToReplace.length; j++)
	{
		for (i = 0; i < pathesToTest.length; i++)
		{
			file = fileAsRequested;

			if (pathesToReplace[j].path !== null)
			{
				file = file.replace(pathesToReplace[j].path, '');
			}

			if (pathesToTest[i].path !== null)
			{
				file = pathesToTest[i].path + '/' + file;
			}

			file = file.replace('//', '/').replace('\\\\', '\\\\');
			console.debug('[PageResourceWatcher] Request (#' + resource.id + '): Searching file ' + fileAsRequested + ' in "' + file + '"');

			if (fs.exists(file) === true)
			{
				pathesToTest[i].score += pathesToTest[i].weight;
				pathesToReplace[j].score += pathesToReplace[j].weight;

				return 'file:///' + file + parameters;
			}
		}
	}

	return resource.url;
};

/**
 * constructor
 *
 * @param {Webpage} page
 * @param {Function} onComplete
 * @returns {PageResourceWatcher}
 */
var PageResourceWatcher = function(page, onComplete)
{
	var self = this;
	this.onComplete = onComplete || this.onComplete;

	page.onLoadFinished = function()
	{
		self.loadFinished();
	};

	page.onResourceRequested = function(resource, networkRequest)
	{
		self.request(resource, networkRequest);
	};

	page.onResourceReceived = function(resource)
	{
		self.receive(resource);
	};

	page.onResourceError = function(resource)
	{
		self.error(resource);
	};

	return this;
};

// prototype
PageResourceWatcher.prototype = Object.create(Object.prototype,
{
	finished:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: false
	},
	loadFinished:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: false
	},
	onComplete:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: function() {}
	},
	resources:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: {}
	},
	timer:
	{
		writable: true,
		configurable: true,
		enumerable: true,
		value: null
	}
});

/**
 * if a resource is errored
 *
 * @param {Object} resource
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.error = function(resource)
{
	if (config.log.page.resource.error === true)
	{
		console.warn('[PageResourceWatcher] Unable to load resource (#' + resource.id + '): Error: ' + resource.errorCode + ' - ' + resource.errorString);
	}

	this.remove(resource);

	return this;
};

/**
 * if page loading is started
 *
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.loadFinished = function()
{
	console.debug('[PageResourceWatcher] Load finished');
	this.loadFinished = true;

	this.setTimer();

	return this;
};

/**
 * if a resource is received
 *
 * @param {Object} resource
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.receive = function(resource)
{
	if (config.log.page.resource.received === true)
	{
		console.debug('[PageResourceWatcher] Response (#' + resource.id + '): [' + resource.stage + '] ' + resource.url);
	}

	switch (resource.stage)
	{
		case 'start':
			this.set('start', resource);
			break;

		case 'end':
			this.remove(resource);
			break;

		default:
			console.warn('[PageResourceWatcher] Request (#' + resource.id + '): Unkown stage "' + resource.stage + '": ' + resource.url);
			break;
	}

	return this;
};

/**
 * if a resource is requested
 *
 * @param {Object} resource
 * @param {Object} networkRequest
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.request = function(resource, networkRequest)
{
	var url = resource.url;
	if (this.loadFinished === true)
	{
		url = findFileForWebRequest(resource);
	}
	if (resource.url !== url)
	{
		networkRequest.changeUrl(url);
		console.debug('[PageResourceWatcher] Request (#' + resource.id + '): switching ' + resource.url + ' to ' + url);
	}
	else
	{
		console.debug('[PageResourceWatcher] Request (#' + resource.id + '): ' + resource.url);
	}

	this.set('request', resource);

	return this;
};

/**
 * remove a resource
 *
 * @param {Object} resource
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.remove = function(resource)
{
	this.setTimer();

	if (this.resources[resource.id] !== undefined)
	{
		delete this.resources[resource.id];
	}

	return this;
};

/**
 * set a resource
 *
 * @param {Object} resource
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.set = function(status, resource)
{
	this.setTimer();

	if (this.resources[resource.id] === undefined)
	{
		this.resources[resource.id] = status;
	}

	this.resources[resource.id] = status;

	return this;
};

/**
 * timer handling to detecting if all resources loaded
 *
 * @returns {PageResourceWatcher}
 */
PageResourceWatcher.prototype.setTimer = function()
{
	if (this.timer !== null)
	{
		clearTimeout(this.timer);
	}

	if (this.finished === false)
	{
		var self = this;
		this.timer = setTimeout(function()
		{
			clearTimeout(self.timer);
			if (self.finished === false)
			{
				self.finished = true;
				self.onComplete();
			}
		}, config.resourceTimeout);
	}

	return this;
};

module.exports = PageResourceWatcher;