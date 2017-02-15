browser.runtime.onConnect.addListener(receiveConnection);

function extractPosts() {
	let response = browser.tabs.executeScript({
		"file": "/content/extractor.js"
	});
	response.then(
		function(){ /* ignore */ },
		function(reason) { console.log("can not inject on this page: " + reason); }
	);
}

function receiveConnection(port) {
	port.onMessage.addListener(receiveMessage);
}

function receiveMessage(message) {
	if (message.to === "extractor") {
		let newPermalinks = message.body.filter(isPermalink);
		permalinks = permalinks.concat(newPermalinks);
	}
}

function isPermalink(href)
{
	return true;

	var link;
	try {
		link = new URL(href);
	}
	catch (exc) {
		return false;
	}

	var protocolPattern = /^https:$/;
	var hostPattern = /^www\.facebook\.com$/;
	var pathPattern = /^\/groups\/\d+\/permalink\/\d+\/$/;
	var queryPattern = /^$|^\?sale_post_id=\d+$/;

	return (
		protocolPattern.test(link.protocol) &&
		hostPattern.test(link.host) &&
		pathPattern.test(link.pathname) &&
		queryPattern.test(link.search)
	);
}

