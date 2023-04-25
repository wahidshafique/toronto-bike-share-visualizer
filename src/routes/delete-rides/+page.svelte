<script lang="ts">
	let clearOutPromise;
</script>

<div>
	<h1 class="text-3xl">Are you sure you want to delete all of your rides?</h1>
	<button
		on:click={() => {
			clearOutPromise = chrome.storage.local.set({
				allBikeRidesInPeriod: []
			});
		}}
		class="mt-3 bg-red-500 disabled:pointer-events-none disabled:bg-opacity-50 disabled:text-opacity-50 text-white font-bold py-2 px-4 rounded inline-flex items-center"
		>Yes</button
	>
	{#if clearOutPromise}
		{#await clearOutPromise}
			<p>...waiting</p>
		{:then res}
			<p>Deleted all of your rides!</p>
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	{/if}
</div>
