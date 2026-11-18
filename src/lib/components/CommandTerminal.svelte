<script lang="ts">
	import { tick } from 'svelte';
	import { profile, projects } from '$lib/data';

	type Props = {
		open: boolean;
		theme: 'light' | 'dark';
		crt: boolean;
		onClose: () => void;
		onToggleTheme: () => void;
		onToggleCrt: () => void;
		onTriggerWired: () => void;
		onNavigate: (hash: string) => void;
	};

	let { open, theme, crt, onClose, onToggleTheme, onToggleCrt, onTriggerWired, onNavigate }: Props =
		$props();

	type LogEntry = {
		id: number;
		command?: string;
		lines: string[];
		accent?: boolean;
	};

	let inputEl: HTMLInputElement | undefined = $state();
	let logContainer: HTMLDivElement | undefined = $state();
	let commandText = $state('');
	let nextId = 2;

	let logs: LogEntry[] = $state([
		{
			id: 1,
			lines: [
				'NAVI // Protocol 7 (navi@wired · fedora44)',
				'Present day, present time. Ketik "help", "navi", atau "present".'
			]
		}
	]);

	$effect(() => {
		if (open) {
			tick().then(() => {
				inputEl?.focus();
			});
		}
	});

	async function pushLog(entry: Omit<LogEntry, 'id'>) {
		logs = [...logs, { id: nextId++, ...entry }];
		await tick();
		if (logContainer) {
			logContainer.scrollTop = logContainer.scrollHeight;
		}
	}

	function runCommand(raw: string) {
		const trimmed = raw.trim();
		if (!trimmed) return;
		const cmd = trimmed.toLowerCase();
		commandText = '';

		if (cmd === 'clear') {
			logs = [];
			return;
		}

		if (cmd === 'help') {
			pushLog({
				command: trimmed,
				lines: [
					'Perintah NAVI tersedia:',
					'  present     pesan Layer 01: Weird',
					'  navi        status node Protocol 7 & koridor 3D',
					'  whoami      profil singkat Ahmad Rizki Maulana',
					'  neofetch    info lingkungan Fedora + Hyprland',
					'  ls proyek   daftar 4 proyek pilihan',
					'  crt         nyalakan / matikan garis scanline CRT',
					'  theme       ganti mode gelap / terang',
					'  wired       aktifkan efek glitch Wired pada judul',
					'  goto <bagian>  lompat ke #proyek, #tentang, #eksperimen, #kontak',
					'  clear       bersihkan terminal'
				]
			});
			return;
		}

		if (cmd === 'present') {
			pushLog({
				command: trimmed,
				accent: true,
				lines: ['Present day, present time.', 'No matter where you go, everyone is connected.']
			});
			return;
		}

		if (cmd === 'navi') {
			pushLog({
				command: trimmed,
				accent: true,
				lines: [
					'NAVI OS // Protocol 7',
					'Layers      : LAYER:00 -> LAYER:05',
					'3D Corridor : InstancedMesh + Overhead Wired Cables',
					`CRT Filter  : ${crt ? 'Aktif' : 'Nonaktif'}`
				]
			});
			return;
		}

		if (cmd === 'crt') {
			onToggleCrt();
			pushLog({
				command: trimmed,
				accent: true,
				lines: [`Scanline CRT ${crt ? 'dimatikan' : 'diaktifkan'}.`]
			});
			return;
		}

		if (cmd === 'whoami') {
			pushLog({
				command: trimmed,
				accent: true,
				lines: [
					`${profile.name} (@${profile.handle})`,
					`${profile.role} · Indonesia`,
					profile.heroIntro
				]
			});
			return;
		}

		if (cmd === 'neofetch') {
			pushLog({
				command: trimmed,
				accent: true,
				lines: [
					'lemondeft@fedora44',
					'------------------',
					...profile.driverSpecs.map((s) => `${s.key.padEnd(10, ' ')} : ${s.value}`),
					`Theme      : ${theme === 'dark' ? 'Lain Dark (#0a0a0a / #9dc19e)' : 'Sage Light (#f7f9f6 / #3e5b41)'}`
				]
			});
			return;
		}

		if (cmd === 'ls' || cmd === 'ls proyek') {
			pushLog({
				command: trimmed,
				lines: projects.map((p) => `[${p.year}] ${p.title.padEnd(28, ' ')} ${p.stack.join(', ')}`)
			});
			return;
		}

		if (cmd === 'theme') {
			onToggleTheme();
			pushLog({
				command: trimmed,
				accent: true,
				lines: [`Tema diganti ke ${theme === 'dark' ? 'terang' : 'gelap'}.`]
			});
			return;
		}

		if (cmd === 'wired') {
			onTriggerWired();
			pushLog({
				command: trimmed,
				accent: true,
				lines: ['Sinyal The Wired dikirim ke viewport hero.']
			});
			return;
		}

		if (cmd.startsWith('goto ')) {
			const target = cmd.slice(5).trim();
			const hash = target.startsWith('#') ? target : `#${target}`;
			const valid = ['#proyek', '#tentang', '#eksperimen', '#kontak'];
			if (valid.includes(hash)) {
				onNavigate(hash);
				onClose();
				return;
			}
		}

		pushLog({
			command: trimmed,
			lines: [`Perintah tidak dikenal: "${trimmed}". Ketik "help" untuk daftar perintah.`]
		});
	}
</script>

{#if open}
	<div
		role="dialog"
		aria-modal="true"
		aria-label="Terminal perintah interaktif"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
	>
		<button
			type="button"
			aria-label="Tutup terminal"
			onclick={onClose}
			class="absolute inset-0 cursor-default"
		></button>

		<div
			class="relative z-10 flex w-full max-w-[680px] flex-col border border-control-line bg-bg shadow-2xl"
		>
			<div class="flex items-center justify-between border-b border-line bg-surface px-4 py-3">
				<div class="flex items-center gap-2 font-mono text-xs text-primary">
					<span>NAVI // Protocol 7</span>
					<span class="text-muted">· Ctrl+K</span>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-control-line bg-bg px-3 font-mono text-xs text-ink hover:border-primary hover:text-primary"
				>
					Esc
				</button>
			</div>

			<div
				bind:this={logContainer}
				class="flex max-h-[300px] min-h-[210px] flex-col gap-4 overflow-y-auto p-5 font-mono text-xs leading-relaxed"
			>
				{#each logs as entry (entry.id)}
					<div class="flex flex-col gap-1">
						{#if entry.command}
							<p class="text-primary">$ {entry.command}</p>
						{/if}
						{#each entry.lines as line, idx (idx)}
							<p class="whitespace-pre-wrap {entry.accent ? 'text-ink' : 'text-muted'}">{line}</p>
						{/each}
					</div>
				{/each}
			</div>

			<div class="flex flex-wrap gap-2 border-t border-line bg-surface px-4 py-3">
				{#each ['present', 'navi', 'neofetch', 'wired', 'crt', 'theme'] as quick (quick)}
					<button
						type="button"
						onclick={() => runCommand(quick)}
						class="inline-flex min-h-[44px] items-center border border-line bg-bg px-3 font-mono text-[11px] text-muted transition-colors hover:border-primary hover:text-primary"
					>
						{quick}
					</button>
				{/each}
			</div>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					runCommand(commandText);
				}}
				class="flex items-center gap-3 border-t border-line bg-bg px-4 py-3"
			>
				<label for="wired-cmd-input" class="font-mono text-xs text-primary">$</label>
				<input
					id="wired-cmd-input"
					bind:this={inputEl}
					bind:value={commandText}
					placeholder="ketik help, neofetch, wired, goto #proyek..."
					autocomplete="off"
					class="h-11 flex-1 bg-transparent px-2 font-mono text-xs text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-primary"
				/>
				<button
					type="submit"
					class="inline-flex min-h-[44px] items-center bg-primary px-4 font-mono text-xs font-medium text-on-primary hover:opacity-90"
				>
					Jalankan
				</button>
			</form>
		</div>
	</div>
{/if}
