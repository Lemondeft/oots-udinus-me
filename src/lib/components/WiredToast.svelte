<script lang="ts">
	type Props = {
		message: string | null;
	};

	let { message }: Props = $props();
</script>

<div
	role="status"
	aria-live="polite"
	aria-atomic="true"
	class="pointer-events-none fixed right-5 bottom-5 z-40 transition-all duration-200 {message
		? 'translate-y-0 opacity-100'
		: 'translate-y-2 opacity-0'}"
>
	{#if message}
		<div
			class="flex items-center gap-2.5 border border-control-line bg-bg/95 px-4 py-2.5 font-mono text-xs text-ink shadow-xl backdrop-blur-xs"
		>
			<span aria-hidden="true" class="text-primary">&gt;</span>
			<span>{message}</span>
		</div>
	{/if}
</div>
