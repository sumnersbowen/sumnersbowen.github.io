(() => {
	const navToggle = document.querySelector(".nav-toggle");
	const siteNav = document.querySelector(".site-nav");

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
	const lightboxClose = lightbox?.querySelector(".lightbox-close");

	if (lightbox && lightboxImage && lightboxCaption) {
		document.querySelectorAll(".gallery-item").forEach((item) => {
			item.addEventListener("click", () => {
				const image = item.querySelector("img");
				const caption = item.querySelector("span")?.textContent || "Project image";
				lightboxImage.src = image.src;
				lightboxImage.alt = caption;
				lightboxCaption.textContent = caption;
				lightbox.showModal();
			});
		});

		lightboxClose?.addEventListener("click", () => lightbox.close());
		lightbox.addEventListener("click", (event) => {
			if (event.target === lightbox) lightbox.close();
		});
	}
})();
