var timer = require('sdk/timers');
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var worker = require('./lib/worker');

var links;

var button = require("sdk/ui/button/action").ActionButton({
	id: "style-tab",
	label: "Song's Facebook Admin Tool",
	icon: "./icon-16.png",
	onClick: showMenu
});

var menu = require('sdk/panel').Panel({
	contentURL: self.data.url('menu/menu.html'),
	position: button
});

menu.port.on('menu-delete', handleDelete);
menu.port.on('menu-extract', handleExtract);
menu.port.on('menu-extract-old', handleExtractOld);

function handleDelete()
{
	hideMenu();
	getLinks();
}

function handleExtract()
{
	hideMenu();
	tabs.activeTab.attach({
		contentScriptFile: [
			self.data.url('extract/common.js'),
			self.data.url('extract/special.js')
		]
	});
}

function handleExtractOld(age)
{
	hideMenu();
	tabs.activeTab.attach({
		contentScriptFile: [
			self.data.url('extract/common.js'),
			self.data.url('extract/oldExtractor.js')
		]
	});
}

function handleLinks(gottenLinks)
{
	entry.hide();
	links = gottenLinks.split('\n');
	links = links.filter(isPermalink);

	if (links.length > 0)
	{
		console.log('Starting deleting');

		worker.init(self.data.url('delete.js'), deletePost);
		timer.setTimeout(tryStart, 1000);
	}
	else
	{
		console.log('No links passed the filter.');
	}
}

function tryStart()
{
	if (worker.isReady())
	{
		deletePost();
	}
	else
	{
		console.log('Waiting for worker to get ready');
		timer.setTimeout(tryStart, 1000);
	}
}

function deletePost()
{
	if (links.length > 0)
	{
		console.log('Deleting post: ' + links.length + ' remaining');
		worker.setUrl(links.pop());
	}
	else
	{
		console.log('Out of links');
	}
}
