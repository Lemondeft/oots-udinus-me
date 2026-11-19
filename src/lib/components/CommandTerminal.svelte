<script lang="ts">
	import { tick } from 'svelte';
	import { profile, projects } from '$lib/data';
	import { playConfirm, playTick } from '$lib/sound';

	type Props = {
		open: boolean;
		theme: 'light' | 'dark';
		crt: boolean;
		sfx: boolean;
		onClose: () => void;
		onToggleTheme: () => void;
		onToggleCrt: () => void;
		onToggleSfx: () => void;
		onTriggerWired: () => void;
		onNavigate: (hash: string) => void;
	};

	let {
		open,
		theme,
		crt,
		sfx,
		onClose,
		onToggleTheme,
		onToggleCrt,
		onToggleSfx,
		onTriggerWired,
		onNavigate
	}: Props = $props();

	type LogEntry = {
		id: number;
		command?: string;
		lines: string[];
		accent?: boolean;
	};

	const COMMAND_LIST = [
		'present',
		'navi',
		'whoami',
		'neofetch',
		'ls proyek',
		'crt',
		'sfx',
		'theme',
		'wired',
		'goto #proyek',
		'goto #tentang',
		'goto #eksperimen',
		'goto #kontak',
		'clear',
		'help'
	];

	let inputEl: HTMLInputElement | undefined = $state();
	let logContainer: HTMLDivElement | undefined = $state();
	let commandText = $state('');
	let history: string[] = $state([]);
	let historyIdx = $state(-1);
	let nextId = 2;

	let logs: LogEntry[] = $state([
		{
			id: 1,
			lines: [
				'NAVI // Protocol 7 (navi@wired · fedora44)',
				'Present day, present time. Ketik "help", tekan Tab untuk autocomplete, atau panah atas untuk riwayat.'
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

	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp') {
			if (history.length === 0) return;
			event.preventDefault();
			const next = historyIdx < history.length - 1 ? historyIdx + 1 : historyIdx;
			historyIdx = next;
			commandText = history[history.length - 1 - next];
			playTick(sfx);
			return;
		}

		if (event.key === 'ArrowDown') {
			if (historyIdx <= -1) return;
			event.preventDefault();
			const next = historyIdx - 1;
			historyIdx = next;
			commandText = next >= 0 ? history[history.length - 1 - next] : '';
			playTick(sfx);
			return;
		}

		if (event.key === 'Tab') {
			const query = commandText.trim().toLowerCase();
			if (!query) return;
			const match = COMMAND_LIST.find((item) => item.startsWith(query));
			if (match) {
				event.preventDefault();
				commandText = match;
				playTick(sfx);
			}
		}
	}

	function runCommand(raw: string) {
		const trimmed = raw.trim();
		if (!trimmed) return;
		const cmd = trimmed.toLowerCase();
		history = [...history.slice(-24), trimmed];
		historyIdx = -1;
		commandText = '';

		if (cmd === 'clear') {
			logs = [];
			playTick(sfx);
			return;
		}

		if (cmd === 'help') {
			playConfirm(sfx);
			pushLog({
				command: trimmed,
				lines: [
					'Perintah NAVI tersedia:',
					'  present        pesan Layer 01: Weird',
					'  navi           status node Protocol 7 & koridor 3D',
					'  whoami         profil singkat Ahmad Rizki Maulana',
					'  neofetch       info lingkungan Fedora + Hyprland',
					`  ls proyek      daftar ${projects.length} proyek pilihan`,
					'  crt            nyalakan / matikan garis scanline CRT',
					'  sfx            nyalakan / matikan audio synth NAVI',
					'  theme          ganti mode gelap / terang',
					'  wired          aktifkan efek glitch Wired pada judul',
					'  goto <bagian>  lompat ke #proyek, #tentang, #eksperimen, #kontak',
					'  clear          bersihkan terminal'
				]
			});
			return;
		}

		if (cmd === 'present') {
			playConfirm(sfx);
			pushLog({
				command: trimmed,
				accent: true,
				lines: ['Present day, present time.', 'No matter where you go, everyone is connected.']
			});
			return;
		}

		if (cmd === 'navi') {
			playConfirm(sfx);
			pushLog({
				command: trimmed,
				accent: true,
				lines: [
					'NAVI OS // Protocol 7',
					'Layers      : LAYER:00 -> LAYER:05',
					'3D Corridor : InstancedMesh + Overhead Wired Cables',
					`CRT Filter  : ${crt ? 'Aktif' : 'Nonaktif'}`,
					`Audio Synth : ${sfx ? 'Aktif' : 'Nonaktif'}`
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

		if (cmd === 'sfx') {
			onToggleSfx();
			pushLog({
				command: trimmed,
				accent: true,
				lines: [`Audio synth NAVI ${sfx ? 'dimatikan' : 'diaktifkan'}.`]
			});
			return;
		}

		if (cmd === 'whoami') {
			playConfirm(sfx);
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
			playConfirm(sfx);
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
			playConfirm(sfx);
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
			playConfirm(sfx);
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
			const valid = ['#hero', '#banner', '#proyek', '#tentang', '#eksperimen', '#kontak'];
			if (valid.includes(hash)) {
				playConfirm(sfx);
				onNavigate(hash);
				onClose();
				return;
			}
		}

		playTick(sfx);
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
					<span class="text-muted">· Ctrl+K atau /</span>
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
				{#each ['present', 'navi', 'neofetch', 'wired', 'crt', 'sfx', 'theme'] as quick (quick)}
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
					onkeydown={handleInputKeydown}
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
