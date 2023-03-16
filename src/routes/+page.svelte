<script>
	let ev = 'NONE';
	if (typeof document !== 'undefined') {
		chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
			ev = JSON.stringify(request);
			console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
			if (request.greeting === 'hello') sendResponse({ farewell: 'goodbye' });
		});
	}
</script>

<div>
	{ev}
	<a class="text-3xl font-bold underline" href="/about">About</a>
</div>
