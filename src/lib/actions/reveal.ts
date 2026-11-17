export function reveal(node: HTMLElement, delayMs = 0) {
	if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
		return {};
	}

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return {};
	}

	const rect = node.getBoundingClientRect();
	if (rect.top < window.innerHeight * 0.92) {
		return {};
	}

	node.style.transitionDelay = `${delayMs}ms`;
	node.classList.add('reveal-pending');

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.remove('reveal-pending');
					node.classList.add('reveal-visible');
					observer.unobserve(node);
				}
			}
		},
		{ threshold: 0.04, rootMargin: '0px 0px -20px 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
