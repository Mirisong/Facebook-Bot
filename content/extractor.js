
var links = isExtractablePage() ? extractLinks() : [];
browser.runtime.sendMessage({
	to: "extractor",
	body: links
});



function isExtractablePage()
{
	let availability = getAvailability(window.location.search);

	return (
		isValidHost(window.location.hostname) &&
		isValidPathname(window.location.pathname) &&
		isValidAvailability(availability)
	);
}

function getAvailability(query)
{
	if (query === '') {
		return null;
	}

	if (query[0] === '?')
	{
		query = query.slice(1);
	}

	let keyValuePairs = query.split('&');

	for (let keyValuePair of keyValuePairs) {
		if (keyValuePair.startsWith('availability=')) {
			return keyValuePair.split('=')[1];
		}
	}

	return null;
}

function isValidHost(host)
{
	return (host === 'facebook.com' || host === 'www.facebook.com');
}

function isValidPathname(path)
{
	let pattern = /^\/groups\/\d+\/forsaleposts\/$/;
	return pattern.test(path);
}

function isValidAvailability(availability)
{
	return (
		availability === 'available' ||
		availability === 'archived'  ||
		availability === 'sold'
	);
}

function extractLinks()
{
	let elems = getElementsByIds(/mall_post_\d+/i, document.body);
	let links = extractLinksFromPosts(elems);
	return links;
}

function getElementsByIds(pattern, root)
{
	let matches = [];
	let remaining = [root];

	while (remaining.length > 0)
	{
		let elem = remaining.pop();
		if (pattern.test(elem.id))
		{
			matches.push(elem);
		}
		for (let child of elem.children)
		{
			remaining.push(child);
		}
	}

	return matches;
}

function extractLinksFromPosts(elems)
{
	let links = [];

	for (let elem of elems)
	{
		var target = elem.firstChild.children[1].firstChild.firstChild;
		links.push(target.href);
	}

	return links;
}
