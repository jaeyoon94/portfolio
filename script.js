
document.addEventListener("DOMContentLoaded", () => {
  const menuLinks = document.querySelectorAll(".index-link");
  const previewTitle = document.getElementById("preview-title");
  const previewDescription = document.getElementById("preview-description");
  const previewEyebrow = document.getElementById("preview-eyebrow");
  const previewCounter = document.getElementById("preview-counter");
  const previewTiles = document.querySelectorAll(".preview-tile");

  if (!menuLinks.length) return;

  function updatePreview(link) {
    const index = Array.from(menuLinks).indexOf(link);

    menuLinks.forEach((item) => {
      item.classList.toggle("active", item === link);

      if (item === link) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    if (previewTitle) {
      previewTitle.textContent = link.dataset.title || link.textContent.trim();
    }

    if (previewDescription) {
      previewDescription.textContent =
        link.dataset.description || "프로젝트 상세 내용을 확인하세요.";
    }

    if (previewEyebrow) {
      previewEyebrow.textContent =
        link.dataset.title?.toUpperCase() || "SELECTED WORK";
    }

    if (previewCounter) {
      previewCounter.textContent =
        `${String(index + 1).padStart(2, "0")} / ${String(menuLinks.length).padStart(2, "0")}`;
    }

    // 미리보기 카드도 선택한 분야에 맞춰 연결
    const target = link.getAttribute("href");

    previewTiles.forEach((tile, tileIndex) => {
      if (tileIndex === 0) {
        tile.href = target;
      }
    });
  }

  menuLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      updatePreview(link);
    });

    link.addEventListener("focus", () => {
      updatePreview(link);
    });

    link.addEventListener("click", (event) => {
      const targetSelector = link.getAttribute("href");

      if (!targetSelector || !targetSelector.startsWith("#")) return;

      const target = document.querySelector(targetSelector);

      if (!target) {
        event.preventDefault();
        updatePreview(link);
        return;
      }

      updatePreview(link);

      // 브라우저 기본 앵커 이동을 사용하되,
      // 스크롤 위치를 자연스럽게 이동
      event.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      history.replaceState(null, "", targetSelector);
    });
  });

  const initialLink =
    document.querySelector(".index-link.active") || menuLinks[0];

  updatePreview(initialLink);
});

/* ========================================
   Floating Navigation Behavior
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
  const floatingNav = document.querySelector(".floating-navigation");
  const navLinks = document.querySelectorAll(".floating-nav-link");
  const backToTop = document.getElementById("back-to-top");

  if (!floatingNav || !navLinks.length || !backToTop) return;

  // 목차가 가리키는 실제 페이지 영역
  const sections = Array.from(navLinks)
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  let sectionTops = [];
  let pageHeight = 0;
  let heroBottom = 0;
  let navFrame = 0;
  const headerLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  function measureSections() {
    sectionTops = sections.map(section => ({ id: section.id, top: section.getBoundingClientRect().top + window.scrollY })).sort((a,b) => a.top - b.top);
    pageHeight = document.documentElement.scrollHeight;
    const heroScene = document.querySelector('.pm-hero');
    heroBottom = heroScene ? heroScene.getBoundingClientRect().bottom + window.scrollY : 0;
    handleScroll();
  }

  // Scroll uses cached geometry; remeasure only after layout changes.
  function updateActiveSection() {
    const scrollPosition = window.scrollY;
    document.body.classList.toggle('is-body-theme', scrollPosition >= heroBottom - 88);
    const viewportMarker = Math.min(150, window.innerHeight * 0.2);

    let activeId = sections[0]?.id;

    sectionTops.forEach(section => {
      if (section.top <= scrollPosition + viewportMarker) activeId = section.id;
    });
    if (window.scrollY + window.innerHeight >= pageHeight - 4) activeId = sectionTops.at(-1)?.id;
    headerLinks.forEach(link => {
      const active = link.getAttribute('href') === '#' + activeId;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });

    navLinks.forEach((link) => {
      const isActive = link.dataset.section === activeId;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // 페이지를 일정 수준 이상 내리면 내비게이션 표시
  function updateNavigationVisibility() {
    floatingNav.classList.toggle("is-visible", window.scrollY > 180);
  }

  function handleScroll() {
    if (navFrame) return;
    navFrame = requestAnimationFrame(() => {
      navFrame = 0;
      updateActiveSection();
      updateNavigationVisibility();
    });
  }

  // 목차 클릭 시 해당 영역으로 이동
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.dataset.section);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches ? "auto" : "smooth",
        block: "start"
      });

      history.replaceState(null, "", `#${link.dataset.section}`);
    });
  });

  // 최상단 이동
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches ? "auto" : "smooth"
    });

    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  });
  // 스크롤과 창 크기 변경에 대응
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", measureSections, { passive: true });
  window.addEventListener("load", measureSections, { once: true });
  document.addEventListener("toggle", measureSections, true);
  document.fonts?.ready.then(measureSections);
  // Native details and responsive reflow may change section positions after toggle.
  if ("ResizeObserver" in window) new ResizeObserver(measureSections).observe(document.body);

  // 최초 실행
  measureSections();
});


/* Shared one-time reveal. Content stays visible without JS, IO, or motion permission. */
document.addEventListener('DOMContentLoaded', () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const selector = '.about-heading,.content-section-heading,.selected-heading,.case-study > header,.neon-flow-main,.ud-change-heading,.sl-timeline,.sl-loop,.tr-planning-grid,.tr-stakeholders,.dm-route,.dm-versions,.cap-intro,.cap-steps,.closing-inner > h2,.closing-career';
  const groups = [...document.querySelectorAll(selector)];
  if (reduce.matches || !('IntersectionObserver' in window)) return;
  const pending = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('motion-pending');
      observer.unobserve(entry.target);
      pending.delete(entry.target);
    });
    if (!pending.size) observer.disconnect();
  }, { threshold: 0.01, rootMargin: '0px 0px -24px 0px' });
  function showAll() {
    pending.forEach(element => element.classList.remove('motion-pending'));
    pending.clear();
    observer.disconnect();
  }
  groups.forEach(element => {
    if (element.getBoundingClientRect().top <= window.innerHeight) return;
    element.classList.add('motion-reveal', 'motion-pending');
    pending.add(element);
    observer.observe(element);
  });
  reduce.addEventListener('change', () => { if (reduce.matches) showAll(); });
  function showTarget(event) {
    let target = event?.target;
    if (event?.type === 'hashchange' || !target) {
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    }
    if (!target) return;
    pending.forEach(element => {
      if (element === target || element.contains(target) || target.contains(element)) {
        element.classList.remove('motion-pending');
        observer.unobserve(element);
        pending.delete(element);
      }
    });
  }
  window.addEventListener('hashchange', showTarget);
  document.addEventListener('focusin', showTarget);
});
