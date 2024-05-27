<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner';

	type $$Props = SonnerProps;
</script>

<Sonner
	class="toaster group"
	toastOptions={{
		classes: {
			toast:
				'group toast group-[.toaster]:bg-[var(--ctn-bg)] group-[.toaster]:text-white group-[.toaster]:border-border group-[.toaster]:shadow-lg',
			description: 'group-[.toast]:text-muted-white',
			actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-white',
			cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-white'
		}
	}}
	{...$$restProps}
/>
