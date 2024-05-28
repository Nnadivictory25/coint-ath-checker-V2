<script lang="ts">
	import { formatCurrency, type WalletCoin } from '$lib/utils';
	import { addedWalletCoins, selectedCoin, editWalletCoin, selectedCoinData } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export let coin: WalletCoin;

	function editCoin() {
		goto('/?editing=true');
		selectedCoin.set(coin.id);
		selectedCoinData.set(coin);
		editWalletCoin.set(coin);
	}

	function deleteCoin() {
		if (window.confirm(`Are you sure you want to delete ${coin.name.toUpperCase()} ?`)) {
			const coinId = coin.id;
			addedWalletCoins.update((coins) => coins.filter((coin) => coin.id !== coinId));
			if (browser) {
				localStorage.setItem('walletCoins', JSON.stringify($addedWalletCoins));
			}
		}
	}
</script>

<div class="card">
	<div class="action-btns">
		<button on:click={() => editCoin()}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				aria-describedby="edit-coin-tooltip"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-file-pen-line"
				><path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" /><path
					d="M8 18h1"
				/><path d="M18.4 9.6a2 2 0 1 1 3 3L17 17l-4 1 1-4Z" /></svg
			>
		</button>

		<button on:click={() => deleteCoin()}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-trash-2 !text-red-500 hover:!text-red-400"
				><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
					d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
				/><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg
			>
		</button>
	</div>
	<div class="text-center">
		<img src={coin.image} alt={coin.name} class="mx-auto h-[65px] w-[65px] rounded-full" />
		<p class="text-lg font-medium">{coin.name}</p>
	</div>
	<div class="mt-1 flex w-full justify-between md:mt-0 md:w-[60%]">
		<div class="text-center">
			<p class="header">Quantity</p>
			<p class="font-medium">{coin.quantity.toLocaleString()}</p>
		</div>
		<div class="text-center">
			<p class="header">Value (ATH)</p>
			<p class="font-medium">{@html formatCurrency(coin.ath_value)}</p>
		</div>
	</div>
</div>

<style>
	/* * {
		outline: 1px solid red;
	} */
	.card {
		@apply relative flex !w-full flex-col items-center justify-between rounded-md bg-[var(--ctn-bg)] p-4 px-10 text-white shadow md:flex-row;
	}

	.header {
		@apply text-lg font-semibold text-gray-300;
	}

	svg {
		@apply h-5 w-5 cursor-pointer text-gray-400 transition-all hover:text-gray-200;
	}

	.action-btns {
		@apply absolute right-0 top-0 flex items-center gap-2 px-2 pt-1;
	}
</style>
