var tabs = require('sdk/tabs');

exports.init = init;
exports.setUrl = setUrl;
exports.isReady = isReady;

var worker;
var tab;
var script;
var callback;
var ready = false;

function init(scriptFile, emitCallback)
{
	console.log('Worker initializing');
	script = scriptFile;
	callback = emitCallback;
	tabs.open({
		url: 'about:blank',
		onOpen: registerWorker,
	});
}

function registerWorker(workTab)
{
	console.log('Worker registering');
	workTab.on('ready', attach);
	tab = workTab;
}

function attach(w)
{
	console.log('Worker attaching');
	worker = w.attach({
		contentScriptFile: script
	});
	worker.port.on('emit', callback);
	ready = true;
}

function isReady()
{
	return ready;
}

function setUrl(url)
{
	console.log('Worker setting url');
	tab.url = url;
}
