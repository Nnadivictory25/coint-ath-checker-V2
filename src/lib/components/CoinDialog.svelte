<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { browser } from '$app/environment';
	import { formatCurrency, type CoinMarketData, type WalletCoin } from '$lib/utils';
	import { selectedCoin, selectedCoinData, addedWalletCoins, editWalletCoin } from '$lib/stores';
	import { Separator } from '$lib/components/ui/separator';
	import { Circle } from 'svelte-loading-spinners';
	import { fade } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	$: isEditing = $page.url.searchParams.get('editing') === 'true';
	let coinId = '';
	let isLoading = false;

	let coinData: CoinMarketData = {
		id: '',
		symbol: '',
		name: '',
		image: '',
		ath: 0,
		current_price: 0,
		ath_date: ''
	};

	selectedCoin.subscribe((value) => {
		coinId = value;
	});

	selectedCoinData.subscribe((value) => {
		coinData = value;
	});

	function resetStores() {
		selectedCoinData.set({} as CoinMarketData);
		selectedCoin.set('');
		coinQuantity = '';
		coinValue = '';
		if (isEditing) {
			goto('/', { invalidateAll: true });
		}
	}

	let coinQuantity = '';
	let coinValue = '';

	editWalletCoin.subscribe(({ quantity, current_value }) => {
		coinQuantity = quantity?.toString() || '';
		coinValue = current_value?.toString() || '';
	});

	function calculateCoinValue() {
		if (!coinQuantity) {
			coinValue = '';
		}
		if (coinQuantity && coinData.current_price) {
			coinValue = String((Number(coinQuantity) * Number(coinData.current_price)).toFixed(2));
		}
	}

	function calculateCoinQuantity() {
		if (!coinValue) {
			coinQuantity = '';
		}
		if (coinValue && coinData.current_price) {
			coinQuantity = String((Number(coinValue) / Number(coinData.current_price)).toFixed(2));
		}
	}

	function addCoinToWallet() {
		if (!coinQuantity && !coinValue) {
			return;
		}
		isLoading = true;

		const walletCoin: WalletCoin = {
			id: coinId,
			symbol: coinData.symbol,
			name: coinData.name,
			image: coinData.image,
			current_price: coinData.current_price,
			ath: coinData.ath,
			ath_date: coinData.ath_date,
			quantity: coinQuantity ? Number(coinQuantity) : 0,
			current_value: coinValue ? Number(coinValue) : 0,
			ath_value: coinQuantity ? Number(coinQuantity) * coinData.ath : 0
		};

		if (browser) {
			const LSWalletCoins = localStorage.getItem('walletCoins');
			const walletCoins = LSWalletCoins ? [...(JSON.parse(LSWalletCoins) as WalletCoin[])] : [];

			if (isEditing) {
				const index = walletCoins.findIndex((coin) => coin.id === coinId);
				if (index !== -1) {
					walletCoins[index] = walletCoin;
				}
			} else {
				walletCoins.push(walletCoin);
			}

			if (!isEditing) {
				addedWalletCoins.update((value) => [...value, walletCoin]);
			} else {
				addedWalletCoins.set(walletCoins);
			}

			localStorage.setItem('walletCoins', JSON.stringify(walletCoins));

			toast.success(
				!isEditing
					? `${coinData.name.toUpperCase()} added to wallet`
					: `${coinData.name.toUpperCase()} updated`
			);
			isLoading = false;
			resetStores();
			goto('/', { invalidateAll: true });
		}
	}
</script>

<Dialog.Root open={!!coinId} onOpenChange={(isOpen) => (!isOpen ? resetStores() : null)}>
	<Dialog.Content class="border-none bg-[var(--dark-bg-main)] text-white">
		<Dialog.Header>
			<Dialog.Title class="mb-4 text-center">{isEditing ? 'Update' : 'Add'} Coin</Dialog.Title>

			<Separator class="!bg-[var(--light-bg)]" />
			<div class="flex items-center justify-between py-1">
				<img src={coinData.image} alt={coinData.name} class="h-16 w-16 rounded-full" />
				<div class="flex flex-col justify-center">
					<p class="text-center font-semibold uppercase text-white">{coinData.name}</p>
					<span class="text-center">{@html formatCurrency(coinData.current_price)}</span>
				</div>
				<div class="text-center">
					<span class="font-semibold">ATH</span>
					<p>{@html formatCurrency(coinData.ath)}</p>
				</div>
			</div>
			<Separator class="!bg-[var(--light-bg)]" />

			<div class="flex gap-2 text-sm text-gray-200">
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
					class="lucide lucide-info self-start"
					><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg
				>

				<p class="pt-1 italic">
					Input how many <span
						class="rounded-md border border-dotted px-2 py-[2px] font-medium uppercase"
						>{coinData.name}</span
					> you have below , then click 'add to wallet' to calculate the value of your holding when it
					goes back to all time high
				</p>
			</div>

			<div class="space-y-4 pt-5">
				<div>
					<label for="coin-quantity">Enter {coinData.name.toUpperCase()} quantity:</label>
					<input
						id="coin-quantity"
						type="number"
						bind:value={coinQuantity}
						on:input={() => calculateCoinValue()}
						placeholder="Enter coin quantity , eg: '20,000'"
						class="w-full"
					/>
				</div>
				<p class="mx-auto w-fit text-xl font-bold">OR</p>
				<div class="relative">
					<label for="coin-value">Enter {coinData.name.toUpperCase()} value in $:</label>
					<input
						id="coin-value"
						type="number"
						bind:value={coinValue}
						on:input={() => calculateCoinQuantity()}
						placeholder="Enter coin value in $ , eg: '1,500'"
						class="w-full !pl-7"
					/>
					<span class="absolute left-3 top-1/2 bg-white font-semibold text-gray-600">$</span>
				</div>

				{#if coinQuantity || coinValue}
					<div class="flex justify-between">
						<div>
							<p>Value (Now):</p>
							<span>{@html formatCurrency(+coinValue)}</span>
						</div>

						<div>
							<p>Value (ATH):</p>
							<span>{@html formatCurrency(+coinQuantity * coinData.ath)}</span>
						</div>
					</div>
				{/if}
				<button
					disabled={!coinQuantity && !coinValue}
					on:click={() => addCoinToWallet()}
					class="btn gradient-bg"
				>
					{#if isLoading}
						<div in:fade={{ delay: 200 }}>
							<Circle color="#fff" size="20" />
						</div>
					{:else}
						<span class="block" out:fade={{ duration: 200 }}>
							{isEditing ? 'Update Coin' : 'Add to wallet'}
						</span>
					{/if}
				</button>
			</div>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>

<style>
	input {
		@apply w-full rounded-md border-[var(--light-bg)] bg-white p-3 text-black;
	}

	.btn {
		@apply flex h-12 w-full items-center justify-center rounded-md font-medium text-white;
	}
</style>
