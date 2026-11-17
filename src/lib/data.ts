export type Project = {
	title: string;
	description: string;
	stack: string[];
	year: number;
	repoUrl: string;
	noteUrl?: string;
	noteLabel?: string;
};

export const projects: Project[] = [
	{
		title: 'Pacer',
		description:
			'Aplikasi pelacak lari dan multi-olahraga berbasis GPS offline-first dengan Flutter dan Supabase Postgres, lengkap dengan sinkronisasi outbox SQLite, klub lari, tantangan, papan peringkat, dan penilaian pelatih.',
		stack: ['Flutter', 'Dart', 'Supabase', 'PostgreSQL'],
		year: 2026,
		repoUrl: 'https://github.com/Lemondeft/pacer',
		noteUrl: 'https://my-blog-lemondeft.vercel.app/blog/pacer',
		noteLabel: 'Baca catatan'
	},
	{
		title: 'wa-bot',
		description:
			'Bot otomasi WhatsApp berbasis event menggunakan Baileys dengan fitur chat LLM multimodal, pembuatan gambar, konversi stiker, reveal pesan sekali lihat, ringkasan chat, dan unduhan media.',
		stack: ['TypeScript', 'Node.js', 'Baileys', 'OpenAI'],
		year: 2026,
		repoUrl: 'https://github.com/Lemondeft/wa-bot',
		noteUrl: 'https://my-blog-lemondeft.vercel.app/blog/wabot',
		noteLabel: 'Baca catatan'
	},
	{
		title: 'my-blog',
		description:
			'Catatan teknis pribadi dan weblog pengembang yang mendokumentasikan setup Fedora/Hyprland, arsitektur basis data Pacer, dan berbagai eksperimen secara terbuka.',
		stack: ['React', 'TypeScript', 'Vite', 'Tailwind'],
		year: 2026,
		repoUrl: 'https://github.com/Lemondeft/my-blog',
		noteUrl: 'https://my-blog-lemondeft.vercel.app/',
		noteLabel: 'Buka situs'
	},
	{
		title: 'my-apple-music-downloader',
		description:
			'Pipeline downloader Go dan wrapper FairPlay DRM dalam kontainer Docker untuk mengunduh audio lossless ALAC dari Apple Music langsung di Linux.',
		stack: ['Go', 'Docker', 'CMake'],
		year: 2026,
		repoUrl: 'https://github.com/Lemondeft/my-apple-music-downloader',
		noteUrl: 'https://my-blog-lemondeft.vercel.app/blog/apple-music',
		noteLabel: 'Baca catatan'
	}
];

export const profile = {
	handle: 'lemondeft',
	name: 'Ahmad Rizki Maulana',
	role: 'Fullstack Developer · Siswa SMK PPLG',
	heroIntro:
		'Siswa SMK jurusan PPLG di Indonesia yang berfokus membangun aplikasi web fullstack dengan TypeScript, aplikasi mobile dengan Flutter dan Supabase, serta otomasi alur kerja.',
	bio: 'Saya belajar dengan langsung membangun dan merilis proyek nyata. Sebagian besar waktu saya dihabiskan untuk pengembangan web TypeScript, aplikasi mobile offline-first, dan ngoprek sistem Linux sambil mendalami machine learning.',
	facts: [
		{ label: 'Fokus', value: 'Web fullstack, mobile & otomasi' },
		{ label: 'Stack utama', value: 'TypeScript · React · Next.js · Flutter · Postgres' },
		{ label: 'Lingkungan', value: 'Fedora 44 · Hyprland (Quickshell ii)' },
		{ label: 'Lokasi', value: 'Indonesia' }
	],
	skillGroups: [
		{
			label: 'Dipakai sehari-hari',
			items: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS']
		},
		{
			label: 'Aktif dikerjakan',
			items: ['Flutter', 'Dart', 'Supabase', 'PostgreSQL', 'PHP']
		},
		{
			label: 'Eksplorasi & alat',
			items: ['Svelte', 'Python', 'Kotlin', 'Machine Learning', 'Fedora Linux', 'Docker', 'Git']
		}
	],
	driverSpecs: [
		{ key: 'OS', value: 'Fedora 44' },
		{ key: 'WM', value: 'Hyprland (end4)' },
		{ key: 'Bar', value: 'Quickshell (ii)' },
		{ key: 'Terminal', value: 'kitty' },
		{ key: 'Shell', value: 'fish + starship' },
		{ key: 'Editor', value: 'Neovim' }
	],
	links: {
		github: 'https://github.com/Lemondeft',
		blog: 'https://my-blog-lemondeft.vercel.app/',
		discord: 'https://discord.com/users/699924273040719955',
		email: 'ahmadcpu26@gmail.com',
		dotfiles: 'https://github.com/end-4/dots-hyprland'
	}
};
