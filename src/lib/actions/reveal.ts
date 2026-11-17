import { animate, hover, inView, press } from 'motion';

function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

export function reveal(node: HTMLElement, delaySec = 0) {
	if (typeof window === 'undefined' || prefersReducedMotion()) {
		return {};
	}

	const rect = node.getBoundingClientRect();
	if (rect.top < window.innerHeight * 0.92) {
		return {};
	}

	node.style.opacity = '0';
	node.style.transform = 'translateY(14px)';

	const stop = inView(
		node,
		() => {
			animate(
				node,
				{ opacity: [0, 1], y: [14, 0] },
				{
					duration: 0.45,
					delay: delaySec / 1000,
					ease: [0.22, 1, 0.36, 1]
				}
			);
		},
		{ amount: 0.08 }
	);

	return {
		destroy() {
			stop();
		}
	};
}

export function springTap(node: HTMLElement) {
	if (typeof window === 'undefined' || prefersReducedMotion()) {
		return {};
	}

	const stopHover = hover(node, () => {
		animate(node, { y: -1.5 }, { duration: 0.18, ease: 'easeOut' });
		return () => {
			animate(node, { y: 0 }, { duration: 0.2, ease: 'easeOut' });
		};
	});

	const stopPress = press(node, () => {
		animate(node, { scale: 0.98 }, { duration: 0.1 });
		return () => {
			animate(node, { scale: 1 }, { duration: 0.18, ease: 'easeOut' });
		};
	});

	return {
		destroy() {
			stopHover();
			stopPress();
		}
	};
}
