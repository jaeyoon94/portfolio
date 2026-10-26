
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

  // 현재 스크롤 위치에 따라 목차 상태 갱신
  function updateActiveSection() {
    const scrollPosition = window.scrollY;
    const viewportMarker = window.innerHeight * 0.35;

    let activeId = sections[0]?.id;

    sections.forEach((section) => {
      const sectionTop =
        section.getBoundingClientRect().top + window.scrollY;

      if (sectionTop <= scrollPosition + viewportMarker) {
        activeId = section.id;
      }
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
    updateActiveSection();
    updateNavigationVisibility();
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
  window.addEventListener("resize", handleScroll);

  // 최초 실행
  handleScroll();
});

/* 우측 목차: 현재 위치한 섹션 강조 */
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(
    ".floating-nav-link[data-section]"
  );

  const sections = Array.from(navLinks)
    .map((link) => {
      const sectionId = link.dataset.section;
      const section = document.getElementById(sectionId);

      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  function updateActiveSection() {
    // 화면 상단에서 조금 내려온 지점을 기준으로 현재 섹션 판별
    const threshold = 150;
    let currentSection = sections[0];

    for (const item of sections) {
      if (item.section.getBoundingClientRect().top <= threshold) {
        currentSection = item;
      } else {
        break;
      }
    }

    navLinks.forEach((link) => {
      const isActive = link === currentSection.link;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  window.addEventListener("scroll", updateActiveSection, {
    passive: true,
  });

  window.addEventListener("resize", updateActiveSection);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((item) => {
        item.classList.toggle("active", item === link);
      });
    });
  });

  updateActiveSection();
});
document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("typing-title");

  if (!title) return;

  const text = "GAME PM PORTFOLIO";
  const speed = 100;
  let index = 0;

  title.textContent = "";

  function typeText() {
    if (index < text.length) {
      title.textContent += text.charAt(index);
      index++;
      setTimeout(typeText, speed);
    }
  }

  // 첫 화면이 준비된 후 타이핑 시작
  setTimeout(typeText, 500);
});