<script lang="ts">
	export type LayerItem = {
		id: string;
		code: string;
		label: string;
	};

	type Props = {
		layers: LayerItem[];
		activeId: string;
		onSelect: (id: string) => void;
	};

	let { layers, activeId, onSelect }: Props = $props();
</script>

<aside
	aria-label="Navigasi lapisan Wired"
	class="fixed top-1/2 right-3 z-20 hidden -translate-y-1/2 flex-col items-end gap-0.5 xl:flex"
>
	{#each layers as layer (layer.id)}
		{@const isActive = activeId === layer.id}
		{@const shortCode = layer.code.replace('LAYER:', '')}
		<button
			type="button"
			onclick={() => onSelect(layer.id)}
			aria-label="Lompat ke {layer.code} {layer.label}"
			aria-current={isActive ? 'location' : undefined}
			class="group relative flex min-h-[44px] items-center gap-2 px-1.5 py-1 font-mono text-[10px] tracking-wider transition-colors duration-200 {isActive
				? 'text-primary'
				: 'text-muted hover:text-ink'}"
		>
			<span
				class="pointer-events-none absolute right-full mr-2 translate-x-1 border border-line bg-bg/95 px-2.5 py-1 whitespace-nowrap text-ink opacity-0 shadow-lg backdrop-blur-xs transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
			>
				<span class="text-primary">{layer.code}</span> · {layer.label}
			</span>
			<span class="tabular-nums {isActive ? 'opacity-100' : 'opacity-65 group-hover:opacity-100'}">
				{shortCode}
			</span>
			<span
				aria-hidden="true"
				class="block h-[2px] transition-all duration-200 {isActive
					? 'w-5 bg-primary'
					: 'w-2 bg-control-line group-hover:w-3.5 group-hover:bg-ink'}"
			></span>
		</button>
	{/each}
</aside>
