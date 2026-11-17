<script lang="ts">
	import { profile } from '$lib/data';
</script>

<div class="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
	<div class="flex w-full flex-col gap-6 lg:w-[420px] lg:shrink-0">
		<div class="flex flex-col gap-2">
			<span class="font-mono text-xs text-primary">$ hyprctl clients</span>
			<h3 class="font-display text-xl font-medium text-ink">Daily Driver</h3>
			<p class="text-sm leading-relaxed text-muted">
				Tiling window manager dengan Quickshell dan alur kerja terminal di Fedora.
			</p>
		</div>

		<dl class="flex flex-col divide-y divide-line border-t border-b border-line">
			{#each profile.driverSpecs as spec (spec.key)}
				<div class="flex items-baseline justify-between gap-4 py-3 font-mono text-xs">
					<dt class="text-primary">{spec.key}</dt>
					<dd class="text-right text-muted">{spec.value}</dd>
				</div>
			{/each}
		</dl>

		<a
			href={profile.links.dotfiles}
			target="_blank"
			rel="external noopener noreferrer"
			class="inline-flex min-h-[44px] items-center justify-between border border-control-line bg-surface px-4 font-mono text-xs text-ink transition-colors duration-200 hover:border-primary hover:text-primary"
		>
			<span>dotfiles: end-4/dots-hyprland (ii)</span>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M7 17 17 7M9 7h8v8" />
			</svg>
		</a>
	</div>

	<!-- Representasi tata letak tiling Hyprland dari halaman whoami my-blog -->
	<div
		class="grid min-h-[260px] w-full flex-1 grid-cols-1 gap-2.5 border border-line bg-surface p-3 sm:grid-cols-[3fr_2fr]"
	>
		<div class="grid grid-rows-2 gap-2.5">
			<div class="flex flex-col justify-between border border-line bg-bg p-3.5">
				<span class="font-mono text-[11px] text-muted">firefox</span>
				<div class="mt-3 h-12 border border-line/70 bg-surface/60"></div>
			</div>
			<div class="flex flex-col justify-between border border-line bg-bg p-3.5">
				<span class="font-mono text-[11px] text-muted">neovim</span>
				<div class="mt-3 h-12 border border-line/70 bg-surface/60"></div>
			</div>
		</div>

		<div class="flex flex-col justify-between border border-control-line/70 bg-bg p-3.5">
			<span class="font-mono text-[11px] text-muted">kitty</span>
			<div
				class="mt-3 flex flex-col gap-1.5 border border-line bg-surface p-3 font-mono text-xs leading-relaxed text-ink"
			>
				<p><span class="text-primary">$</span> hyprctl dispatch ws 1</p>
				<p><span class="text-primary">$</span> nvim src/routes/+page.svelte</p>
				<p><span class="text-primary">$</span> bun run dev</p>
			</div>
		</div>
	</div>
</div>
