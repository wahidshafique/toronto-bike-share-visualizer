<script lang="ts">
	import { allRidesStore } from 'stores';
	import moment from 'moment';
	import type { BikeRide, BikeProcessResults, AllBikeRidesInPeriod } from '../types';
	import LoadingSpinner from 'components/LoadingSpinner.svelte';

	let isOnBikeShareSite = true;
	let lastSyncedBikeRide: BikeRide;
	let firstBikeRide: BikeRide;
	let processResults: BikeProcessResults;
	let allRides: AllBikeRidesInPeriod;

	allRidesStore.subscribe((r) => {
		allRides = r;
		lastSyncedBikeRide = r[0];
		firstBikeRide = r.at(-1);
	});
	let isProcessing = false;

	const downloadFileFromText = (filename, content) => {
		var a = document.createElement('a');
		var blob = new Blob([content], { type: 'text/plain;charset=UTF-8' });
		a.href = window.URL.createObjectURL(blob);
		a.download = filename;
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		a.remove();
	};

	const downloadDataLocally = (e) => {
		const start = moment(firstBikeRide.startTime).format('L');
		const end = moment(lastSyncedBikeRide.startTime).format('L');
		downloadFileFromText(`tbs-${start}-${end}.json`, JSON.stringify(allRides));
	};

	const sendContentScriptDownloadMessage = async () => {
		// tells the script on the page to start aggregating historical data
		isProcessing = true;
		const [tab] = await chrome.tabs.query({
			active: true,
			url: 'https://members.bikesharetoronto.com/trips',
			status: 'complete'
		});
		if (tab?.id) {
			isOnBikeShareSite = true;
			const response = await chrome.tabs.sendMessage(tab.id, { startDownload: true });
			if (response.complete) {
				isProcessing = false;
				processResults = response.results;
			}
		} else {
			isOnBikeShareSite = false;
			isProcessing = false;
		}
	};
</script>

<div>
	<h1 class="text-2xl text-primary">
		Bike Share Visualizer <img class="inline" src="favicon-32x32.png" alt="" srcset="" />
	</h1>
	<section class="mt-3">
		<p>
			This extension requires you to login to your account and visit the <a
				href="https://members.bikesharetoronto.com/trips"
				target="_blank"
				rel="noopener noreferrer"
				class="underline text-primary"
			>
				trips page</a
			>. Once there, hit "sync" below. The first time this runs, it might take a while. When
			processing, please do not navigate away from the trips page.
		</p>
		<button
			disabled={isProcessing || processResults?.itemsDownloaded === 0}
			on:click={sendContentScriptDownloadMessage}
			class="mt-3 bg-gray-300 hover:bg-gray-400 disabled:pointer-events-none disabled:bg-opacity-50 disabled:text-opacity-50 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
		>
			{#if isProcessing}
				<LoadingSpinner />
				Processing...
			{:else}
				<span>↻ Sync Latest Data</span>
			{/if}
		</button>
		{#if lastSyncedBikeRide}
			<p class="text-[10px]">Last Synced Bike Ride: {lastSyncedBikeRide?.endTime}</p>
		{/if}
		{#if !isOnBikeShareSite}
			<p class="mt-1 text-red-400">
				Please visit/login to: <a
					target="_blank"
					class="underline"
					href="https://members.bikesharetoronto.com/trips"
					>https://members.bikesharetoronto.com/trips</a
				> and try again!
			</p>
		{/if}
		{#if processResults}
			<p class="mt-1">
				Downloaded {processResults.itemsDownloaded} item(s) {#if processResults.itemsDownloaded === 0}
					<span class="font-bold text-primary"> Get out there and ride! 🚴‍♀️</span>
				{/if}
			</p>
		{/if}
	</section>
	<div class="mt-3">
		{#if lastSyncedBikeRide}
			<p class="mt-1">
				You can download your previously synced data here if you choose, the format is <code
					>JSON</code
				>.
			</p>
			<button
				disabled={isProcessing}
				on:click={downloadDataLocally}
				class="mt-3 bg-gray-300 hover:bg-gray-400 disabled:pointer-events-none disabled:bg-opacity-50 disabled:text-opacity-50 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
				><span>↓ Download your data</span>
			</button>
		{/if}
	</div>
</div>
