<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import type { Project } from '$lib/data';

	type Props = {
		project: Project;
		index: number;
	};

	let { project, index }: Props = $props();
</script>

<article
	use:reveal={index * 60}
	class="flex flex-col justify-between gap-8 py-10 lg:flex-row lg:items-start lg:gap-16 lg:py-14"
>
	<div class="flex max-w-[62ch] flex-col gap-3.5">
		<div class="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
			<span>{project.year}</span>
			<span aria-hidden="true">·</span>
			<span>{project.stack.join(' · ')}</span>
		</div>

		<h3
			class="font-display text-2xl leading-snug font-medium tracking-tight text-ink lg:text-[28px]"
		>
			{project.title}
		</h3>

		<p class="text-[15px] leading-relaxed text-muted lg:text-base">
			{project.description}
		</p>
	</div>

	<div class="flex shrink-0 flex-wrap items-center gap-3 lg:pt-1">
		<a
			href={project.repoUrl}
			target="_blank"
			rel="external noopener noreferrer"
			aria-label="Lihat repositori GitHub {project.title}"
			class="inline-flex min-h-[44px] items-center gap-2 border border-control-line bg-surface px-4 font-mono text-xs text-ink transition-colors duration-200 hover:border-primary hover:bg-primary-soft hover:text-primary"
		>
			<span>GitHub</span>
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

		{#if project.noteUrl}
			<a
				href={project.noteUrl}
				target="_blank"
				rel="external noopener noreferrer"
				aria-label="{project.noteLabel ?? 'Buka tautan'} untuk {project.title}"
				class="inline-flex min-h-[44px] items-center gap-2 border border-line px-4 font-mono text-xs text-muted transition-colors duration-200 hover:border-primary hover:text-primary"
			>
				<span>{project.noteLabel ?? 'Catatan'}</span>
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
		{/if}
	</div>
</article>
