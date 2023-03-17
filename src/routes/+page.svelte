<script lang="ts">
	import { onMount } from 'svelte';
	import type { allBikeRidesInPeriod, bikeRide } from '../types';
	let isOnBikeShareSite = true;
	let lastSyncedBikeRide: bikeRide;

	onMount(() => {
		chrome.storage.local
			.get(['allBikeRidesInPeriod'])
			.then(({ allBikeRidesInPeriod }: { allBikeRidesInPeriod: allBikeRidesInPeriod }) => {
				lastSyncedBikeRide = allBikeRidesInPeriod.reverse()[0];
			});
		// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		// 	isOnBikeShareSite = true;
		// 	console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
		// 	if (request.greeting === 'hello') sendResponse({ farewell: 'goodbye' });
		// });
	});

	let isProcessing = false;
	const sendContentScriptDownloadMessage = async () => {
		// tells the script on the page to start aggregating historical data
		isProcessing = true;
		const [tab] = await chrome.tabs.query({
			active: true,
			url: 'https://members.bikesharetoronto.com/*',
			status: 'complete'
		});

		isOnBikeShareSite = !!tab;
	};
</script>

<div>
	<section class="mt-3">
		<button
			disabled={isProcessing}
			on:click={sendContentScriptDownloadMessage}
			class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
		>
			{#if isProcessing}
				<svg
					class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
				Processing...
			{:else}
				<svg
					class="fill-current w-4 h-4 mr-2"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" /></svg
				>
				<span>Download Your Bike Share Data</span>
			{/if}
		</button>
		{#if !isOnBikeShareSite}
			<p class="mt-1">
				Please login to: <a class="underline" href="https://members.bikesharetoronto.com/"
					>https://members.bikesharetoronto.com/</a
				> and try again!
			</p>
		{/if}
	</section>

	<footer class="absolute bottom-0">
		{#if lastSyncedBikeRide}
			<p>Last Synced Bike Ride: {lastSyncedBikeRide?.endTime}</p>
		{/if}
	</footer>

	<!-- <a class="text-3xl font-bold underline" href="/about">About</a> -->
</div>
