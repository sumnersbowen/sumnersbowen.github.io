(() => {
	const siteHeader = document.querySelector(".site-header");
	const navToggle = document.querySelector(".nav-toggle");
	const siteNav = document.querySelector(".site-nav");

	if (siteHeader) {
		let isHeaderCompact = window.scrollY > 140;
		let headerUpdateQueued = false;

		const updateHeader = () => {
			const scrollPosition = window.scrollY;

			if (!isHeaderCompact && scrollPosition > 140) {
				isHeaderCompact = true;
			} else if (isHeaderCompact && scrollPosition < 40) {
				isHeaderCompact = false;
			}

			siteHeader.classList.toggle("is-scrolled", isHeaderCompact);
			headerUpdateQueued = false;
		};

		updateHeader();
		window.addEventListener("scroll", () => {
			if (!headerUpdateQueued) {
				headerUpdateQueued = true;
				window.requestAnimationFrame(updateHeader);
			}
		}, { passive: true });
	}

	if (navToggle && siteNav) {
		navToggle.addEventListener("click", () => {
			const isOpen = siteNav.classList.toggle("is-open");
			navToggle.setAttribute("aria-expanded", String(isOpen));
		});

		siteNav.addEventListener("click", (event) => {
			if (event.target.closest("a")) {
				siteNav.classList.remove("is-open");
				navToggle.setAttribute("aria-expanded", "false");
			}
		});
	}

	document.querySelectorAll("[data-current-year]").forEach((element) => {
		element.textContent = new Date().getFullYear();
	});

	const slides = [...document.querySelectorAll(".hero-slide")];
	const dots = [...document.querySelectorAll(".slider-dot")];
	let activeSlide = 0;
	let slideTimer;

	const showSlide = (index) => {
		activeSlide = index;
		slides.forEach((slide, slideIndex) => {
			slide.classList.toggle("is-active", slideIndex === index);
		});
		dots.forEach((dot, dotIndex) => {
			dot.classList.toggle("is-active", dotIndex === index);
			dot.setAttribute("aria-pressed", String(dotIndex === index));
		});
	};

	const startSlider = () => {
		if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		window.clearInterval(slideTimer);
		slideTimer = window.setInterval(() => showSlide((activeSlide + 1) % slides.length), 6000);
	};

	dots.forEach((dot, index) => {
		dot.addEventListener("click", () => {
			showSlide(index);
			startSlider();
		});
	});

	startSlider();

	const lightbox = document.querySelector(".lightbox");
	const lightboxImage = lightbox?.querySelector("img");
	const lightboxCaption = lightbox?.querySelector("[data-lightbox-caption]");
	const lightboxCount = lightbox?.querySelector("[data-lightbox-count]");
	const lightboxClose = lightbox?.querySelector(".lightbox-close");
	const lightboxPrevious = lightbox?.querySelector(".lightbox-previous");
	const lightboxNext = lightbox?.querySelector(".lightbox-next");
	const galleryItems = [...document.querySelectorAll(".gallery-item")];

	if (lightbox && lightboxImage && lightboxCaption) {
		let activeProject = 0;

		const showProject = (index) => {
			activeProject = (index + galleryItems.length) % galleryItems.length;
			const item = galleryItems[activeProject];
			const image = item.querySelector("img");
			const caption = item.querySelector("span")?.textContent || "Project image";

			lightboxImage.src = image.src;
			lightboxImage.alt = caption;
			lightboxCaption.textContent = caption;
			if (lightboxCount) lightboxCount.textContent = `${activeProject + 1} / ${galleryItems.length}`;
		};

		galleryItems.forEach((item, index) => {
			item.addEventListener("click", () => {
				showProject(index);
				lightbox.showModal();
			});
		});

		lightboxClose?.addEventListener("click", () => lightbox.close());
		lightboxPrevious?.addEventListener("click", () => showProject(activeProject - 1));
		lightboxNext?.addEventListener("click", () => showProject(activeProject + 1));
		lightbox.addEventListener("keydown", (event) => {
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				showProject(activeProject - 1);
			}
			if (event.key === "ArrowRight") {
				event.preventDefault();
				showProject(activeProject + 1);
			}
		});
		lightbox.addEventListener("click", (event) => {
			if (event.target === lightbox) lightbox.close();
		});
	}
})();
