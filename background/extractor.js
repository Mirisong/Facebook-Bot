function extractPosts() {
	if (browser.runtime.onMessage.hasListener(appendLinks)) {
		// may happen if the user clicks twice too fast
		console.log("skipping duplicate extraction");
		return;
	}

	browser.runtime.onMessage.addListener(appendLinks);

	let response = browser.tabs.executeScript({
		"file": "/content/extractor.js"
	});
	response.then(
		function(){ /* ignore */ },
		function(reason) { console.log("can not inject on this page: " + reason); }
	);
}

function appendLinks(message) {
	if (message.to === "extractor") {
		browser.runtime.onMessage.removeListener(appendLinks);

		let newPermalinks = message.body.filter(isPermalink);
		permalinks = permalinks.concat(newPermalinks);
		console.log("" + permalinks.length + " permalinks extracted");
		deletePosts();
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

