<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { addedWalletCoins } from '$lib/stores';
	import { toast } from 'svelte-sonner';

	import {
		type CoinMarketData,
		type CoinInfo,
		getMatchingCoins,
		type WalletCoin,
		formatCurrency,
		getCoinData
	} from '$lib/utils';
	import { onMount } from 'svelte';

	import SearchLoadingUI from '$lib/components/SearchLoadingUI.svelte';
	import SearchCoinCard from '$lib/components/SearchCoinCard.svelte';
	import CoinDialog from '$lib/components/CoinDialog.svelte';
	import WalletCoinCard from '$lib/components/WalletCoinCard.svelte';

	$: query = $page.url.searchParams.get('query');
	$: error = $page.url.searchParams.get('error');

	let matchingCoins: CoinInfo[] = [];
	let inputValue = '';
	let loading = false;
	let loadingWallet = true;
	let isRefreshing = false;

	$: if (query) {
		(async () => {
			try {
				loading = true;
				const data = await getMatchingCoins({ query });
				matchingCoins = data;
			} catch (error) {
				goto(`/?error=${error}`);
			}

			loading = false;
		})();
	} else {
		matchingCoins = [];
		inputValue = '';
	}

	$: if (browser) {
		const LSWalletCoins = localStorage.getItem('walletCoins');
		if (LSWalletCoins) {
			addedWalletCoins.set(JSON.parse(LSWalletCoins));
		}

		loadingWallet = false;
	}

	function clearAll() {
		if (
			window.confirm(
				'Are you sure you want to clear all coins? This action will remove every coin in your wallet and this cannot be undone!'
			)
		) {
			addedWalletCoins.set([]);
			if (browser) {
				localStorage.removeItem('walletCoins');
			}
			toast.success('All coins cleared');
		}
	}

	async function refresh() {
		const TEN_HOURS_IN_MS = 10 * 60 * 60 * 1000; // 10 hours in milliseconds

		const lastRefreshed = localStorage.getItem('lastRefreshed');
		const now = new Date().getTime();

		if (lastRefreshed && now - +lastRefreshed < TEN_HOURS_IN_MS) {
			const remainingTime = TEN_HOURS_IN_MS - (now - +lastRefreshed);
			const hours = Math.floor(remainingTime / (60 * 60 * 1000));
			const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
			toast.info(`Please wait ${hours} hours and ${minutes} minutes before refreshing again.`);
			return;
		}

		const promises = $addedWalletCoins.map(async (coin) => {
			const coinData = await getCoinData(coin.id);
			return { id: coin.id, ath_value: coinData.ath };
		});

		try {
			isRefreshing = true;
			// Wait for all promises to resolve
			const updatedCoinsData = await Promise.all(promises);

			// Update the state with the new data
			addedWalletCoins.update((coins) =>
				coins.map((c) => {
					const updatedCoin = updatedCoinsData.find((coin) => coin.id === c.id);
					return updatedCoin ? { ...c, ath_value: updatedCoin.ath_value * c.quantity } : c;
				})
			);

			toast.success('Coins updated with latest info');

			if (browser) {
				localStorage.setItem('walletCoins', JSON.stringify($addedWalletCoins));
				localStorage.setItem('lastRefreshed', now.toString());
			}
		} catch (error) {
			console.error(error);
			toast.error('Error refreshing wallet coins');
		} finally {
			isRefreshing = false;
		}
	}
</script>

<svelte:head>
	<title>Portfolio All Time High Value Checker Tool</title>
	<meta name="description" content="A tool to check the all time high value of your portfolio " />
</svelte:head>

<nav class="gradient-bg z-20 flex flex-col justify-center gap-2 text-xl md:flex-row">
	<p>Bull run balance :</p>
	<span class="font-semibold">
		{formatCurrency($addedWalletCoins.reduce((acc, curr) => acc + curr.ath_value, 0))}</span
	>
</nav>

<section class="text-white">
	<!-- !! SEARCH -->
	<div>
		<p class="flex items-center justify-center gap-2 pt-4 text-center text-xl font-semibold">
			SEARCH <svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-search text-[var(--light-bg)]"
				><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
			>
		</p>
		<form method="get" class="mt-5 h-fit bg-[var(--ctn-bg)] pb-4">
			<p class="text-lg font-medium text-gray-200">
				Enter coin name/index below to search for it and add to wallet
			</p>
			<div class="relative">
				<input
					required
					minlength="2"
					type="search"
					name="query"
					bind:value={inputValue}
					on:input={() => {
						if (!inputValue) {
							goto('/');
							matchingCoins = [];
						}
					}}
					id="coin-name"
					placeholder="Enter coin eg: 'BTC' or 'Bitcoin'"
				/>
				<button type="submit" disabled={!inputValue || query === inputValue} class="gradient-bg"
					>Search</button
				>

				<div
					id="custom-scrollbar"
					class="absolute z-20 mt-4 flex max-h-[300px] w-full flex-col gap-6 {!loading
						? 'overflow-y-auto'
						: ''} rounded-b-lg bg-gray-900 shadow-lg {matchingCoins.length > 0 ? 'p-3' : ''}"
				>
					{#if loading}
						<SearchLoadingUI />
					{:else if error}
						<div
							class="flex flex-row items-center gap-4 border-b border-gray-400 pb-4 text-red-500"
						>
							<p class="text-lg font-medium">Error</p>
							<p class="text-sm font-medium text-gray-300">
								An error occurred while searching... Please try again
							</p>
						</div>
					{:else if matchingCoins.length > 0}
						{#each matchingCoins as coin, i (i)}
							<SearchCoinCard {coin} />
						{/each}
					{/if}
				</div>
			</div>
		</form>
	</div>

	<!-- Selected Coin Dialog -->
	<CoinDialog />

	<div class="relative mx-auto mb-14 w-full md:w-1/2">
		<!-- * ACTION BUTTONS -->
		<div
			class="absolute {$addedWalletCoins.length === 0
				? 'hidden'
				: ''} right-2 top-10 flex items-center gap-5 md:top-3"
		>
			<button
				on:click={() => clearAll()}
				class="flex flex-col items-center text-gray-300 hover:text-white"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-trash-2"
					><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
						d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
					/><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg
				>
				<p class="text-xs">Clear all</p>
			</button>

			<button
				disabled={isRefreshing}
				on:click={() => refresh()}
				class="flex flex-col items-center text-gray-300 hover:text-white"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-rotate-ccw {isRefreshing ? 'animate-spin' : ''}"
					><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg
				>
				<p class="!text-xs">Refresh</p>
			</button>
		</div>

		<!-- * WALLET COINS -->
		<h1 class="mt-7 flex items-center gap-2 pl-2 md:mt-0 md:justify-center md:pl-0">
			WALLET <svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-wallet text-[var(--light-bg)]"
				><path
					d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
				/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg
			>
		</h1>

		{#if loadingWallet}
			<div class="mt-5 flex items-center justify-center">
				<SyncLoader color="var(--light-bg)" size="60" />
			</div>
		{:else if $addedWalletCoins && $addedWalletCoins.length === 0}
			<p class="mt-5 text-center text-lg font-semibold text-gray-400">
				You don't have any coins in your wallet yet
			</p>
		{:else}
			<div class="mt-5 space-y-6">
				{#each $addedWalletCoins as coin, i (i)}
					<WalletCoinCard {coin} />
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	h1 {
		@apply pt-4 text-center text-xl font-semibold text-white;
	}

	nav {
		@apply fixed inset-x-0 top-0 flex h-[70px] flex-col items-center justify-center text-white md:flex-row;
	}

	section {
		@apply flex flex-col pt-20 md:flex-row;
	}

	form {
		@apply rounded-md p-5 text-center;
	}

	input {
		@apply mt-4 w-full rounded-md border-2 border-transparent p-3 pr-24 text-black outline-none transition-all focus:border-[var(--light-bg)] md:pr-28;
	}

	button[type='submit'] {
		@apply absolute right-2 top-[61%] -translate-y-1/2 rounded-md p-2 px-4 font-medium transition-all active:scale-95 md:hover:opacity-75;
	}

	#custom-scrollbar::-webkit-scrollbar {
		width: 5px; /* Custom width */
	}

	#custom-scrollbar::-webkit-scrollbar-track {
		background: #f1f1f1; /* Custom track color */
	}

	#custom-scrollbar::-webkit-scrollbar-thumb {
		background: var(--light-bg);
		border-radius: 5px; /* Optional: rounded corners */
	}
</style>
