<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';

	const title = 'Portfolio All Time High Value Checker Tool';
	const description = 'A tool to check the all time high value of your portfolio';
</script>

<slot />

<Toaster />
<footer class="gradient-bg">
	<p>Developed by <span class="font-semibold">Nnadi Victory</span></p>
	<a href="https://github.com/Nnadivictory25" title="github" target="_blank" rel="noreferrer">
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
			class="lucide lucide-github"
			><path
				d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
			/><path d="M9 18c-4.51 2-5-2-7-2" /></svg
		>
	</a>
	<a href="https://twitter.com/nnvictory001" title="twitter" target="_blank" rel="noreferrer">
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
			class="lucide lucide-twitter"
			><path
				d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
			/></svg
		>
	</a>
</footer>

<svelte:head>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="https://portfolio-ath-checker-v2.pages.dev/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="627" />
	<meta property="og:image:alt" content="Portfolio ALL Time High Checker Tool" />
	<meta property="og:type" content="website" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:domain" content="portfolio-ath-checker-v2.pages.dev" />
	<meta property="twitter:url" content="https://portfolio-ath-checker-v2.pages.dev" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="https://portfolio-ath-checker-v2.pages.dev/og.png" />
</svelte:head>

<style>
	footer {
		@apply fixed inset-x-0 !bottom-0 flex h-10 items-center justify-center gap-2 text-center text-lg text-white;
	}

	a {
		@apply text-gray-300 transition-all hover:scale-105 hover:text-white;
	}
</style>
