<script lang="ts">
	import { getCoinData, type CoinInfo } from '$lib/utils';
	import { selectedCoin, selectedCoinData } from '$lib/stores';
	import { Circle } from 'svelte-loading-spinners';
	import { browser } from '$app/environment';

	export let coin: CoinInfo;
	let isLoading = false;
	let currSelectedCoin = '';

	const fetchCoinData = async () => {
		isLoading = true;
		try {
			const coinData = await getCoinData(coin.id);
			selectedCoin.set(coin.id);
			selectedCoinData.set(coinData);
		} catch (error) {
			alert('Error fetching coin data, Please try again later');
			console.error(error);
		} finally {
			isLoading = false;
		}
	};

	function formatName(name: string) {
		if (browser) {
			if (window.innerWidth < 768) {
				return name.length > 12 ? name.substring(0, 12) + '..' : name;
			} else {
				return name.length > 20 ? name.substring(0, 20) + '..' : name;
			}
		}
	}
</script>

<div class="flex flex-row items-center gap-4 border-b border-gray-400 pb-4">
	<img src={coin.large} alt={coin.name} class="h-16 w-16 rounded-full" />
	<div class="space-y-2 text-left">
		<p title={coin.name} class="text-lg font-medium">{formatName(coin.name)}</p>
		<p class="text-sm font-medium text-gray-300">{coin.symbol}</p>
	</div>
	<button
		type="button"
		on:click={async () => {
			currSelectedCoin = coin.id;
			await fetchCoinData();
		}}
		class="btn gradient-bg"
	>
		{#if isLoading && coin.id === currSelectedCoin}
			<Circle color="#fff" size="20" />
		{:else}
			Select
		{/if}</button
	>
</div>

<style>
	.btn {
		@apply ml-auto mr-5 flex h-9 w-[20%] items-center justify-center rounded-md px-4 py-2 transition-all active:scale-95 md:hover:opacity-75;
	}
</style>
