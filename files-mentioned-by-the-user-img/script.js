(() => {
  const INTRO_WELCOME_MS = 2600;
  const INTRO_EYE_FALLBACK_MS = 9000;
  const terminalCommand = document.getElementById("terminalCommand");
  const terminalOutput = document.getElementById("terminalOutput");
  const navLinks = [...document.querySelectorAll("[data-nav-link]")];
  const sections = [...document.querySelectorAll("main .section[id]")];
  const revealTargets = [...document.querySelectorAll("[data-reveal]")];
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;
  const introOverlay = document.getElementById("introOverlay");
  const introEyeVideo = document.getElementById("introEyeVideo");
  const introSkip = document.getElementById("introSkip");
  const pixelField = document.getElementById("pixelField");
  let introFinished = false;

  const terminalFrames = [
    { command: "> whoami", output: "Cybersecurity & AI learner" },
    { command: "> status", output: "Learning. Building. Securing. Evolving." },
    { command: "> current_focus", output: "Networks / Linux / Cybersecurity / AI" },
  ];

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function waitForEyeVideoEnd(video, fallbackMs) {
    return new Promise((resolve) => {
      let resolved = false;
      const safeResolve = () => {
        if (resolved) {
          return;
        }
        resolved = true;
        resolve();
      };

      const clear = () => {
        video.removeEventListener("ended", onEnded);
        video.removeEventListener("error", onError);
      };

      const onEnded = () => {
        clear();
        safeResolve();
      };

      const onError = () => {
        clear();
        safeResolve();
      };

      video.addEventListener("ended", onEnded, { once: true });
      video.addEventListener("error", onError, { once: true });

      const durationMs = Number.isFinite(video.duration) && video.duration > 0 ? Math.ceil(video.duration * 1000) : fallbackMs;
      setTimeout(() => {
        clear();
        safeResolve();
      }, durationMs + 220);
    });
  }

  function completeIntro() {
    if (introFinished) {
      return;
    }

    introFinished = true;

    if (introEyeVideo) {
      introEyeVideo.pause();
    }

    if (introSkip) {
      introSkip.disabled = true;
      introSkip.blur();
    }

    if (introOverlay) {
      introOverlay.classList.add("intro-complete");
    }

    body.classList.add("intro-done");
    body.classList.remove("intro-lock");
  }

  function skipIntro() {
    completeIntro();
  }

  function typeLine(node, text, speed) {
    return new Promise((resolve) => {
      let index = 0;
      node.textContent = "";
      const timer = setInterval(() => {
        node.textContent += text[index];
        index += 1;
        if (index >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  async function runTerminal() {
    if (!terminalCommand || !terminalOutput) {
      return;
    }

    for (;;) {
      for (const frame of terminalFrames) {
        await typeLine(terminalCommand, frame.command, 28);
        await delay(160);
        await typeLine(terminalOutput, frame.output, 20);
        await delay(1200);
      }
    }
  }

  async function runIntro() {
    if (!introOverlay) {
      completeIntro();
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      completeIntro();
      return;
    }

    await delay(INTRO_WELCOME_MS);
    if (introFinished) {
      return;
    }

    introOverlay.classList.remove("intro-phase-welcome");
    introOverlay.classList.add("intro-phase-eye");

    if (introEyeVideo) {
      try {
        introEyeVideo.currentTime = 0;
        await introEyeVideo.play();
        await waitForEyeVideoEnd(introEyeVideo, INTRO_EYE_FALLBACK_MS);
      } catch {
        // Autoplay can fail depending on codec/browser policy; keep timed fallback.
        await delay(INTRO_EYE_FALLBACK_MS);
      }
    } else {
      await delay(INTRO_EYE_FALLBACK_MS);
    }

    completeIntro();
  }

  function spawnHeroPixels() {
    if (!pixelField) {
      return;
    }

    const palette = ["p-blue", "p-violet", "p-green", "p-pink"];
    for (let i = 0; i < 48; i += 1) {
      const pixel = document.createElement("span");
      pixel.className = `pixel ${palette[i % palette.length]}`;
      pixel.style.left = `${Math.random() * 100}%`;
      pixel.style.top = `${Math.random() * 100}%`;
      pixel.style.setProperty("--dur", `${1800 + Math.random() * 2200}ms`);
      pixel.style.setProperty("--delay", `${Math.random() * 1800}ms`);
      pixelField.appendChild(pixel);
    }
  }

  function setActiveNav(id) {
    for (const link of navLinks) {
      const target = link.getAttribute("href");
      link.classList.toggle("is-active", target === `#${id}`);
    }
  }

  function setupSectionObserver() {
    if (!sections.length || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveNav(visible.target.id);
        }
      },
      {
        rootMargin: "-30% 0px -45% 0px",
        threshold: [0.15, 0.35, 0.55, 0.75],
      },
    );

    for (const section of sections) {
      observer.observe(section);
    }
  }

  function setupRevealObserver() {
    if (!revealTargets.length) {
      return;
    }

    body.classList.add("reveal-ready");

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      for (const node of revealTargets) {
        node.classList.add("is-visible");
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.15,
      },
    );

    for (const node of revealTargets) {
      observer.observe(node);
    }
  }

  function setupThemeToggle() {
    if (!themeToggle) {
      return;
    }

    const storageKey = "portfolio-theme";
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === "light") {
      body.setAttribute("data-theme", "light");
    }

    themeToggle.addEventListener("click", () => {
      const currentTheme = body.getAttribute("data-theme");
      if (currentTheme === "light") {
        body.removeAttribute("data-theme");
        localStorage.setItem(storageKey, "dark");
        return;
      }
      body.setAttribute("data-theme", "light");
      localStorage.setItem(storageKey, "light");
    });
  }

  spawnHeroPixels();
  runTerminal();
  setupSectionObserver();
  setupRevealObserver();
  setupThemeToggle();

  if (introSkip) {
    introSkip.addEventListener("click", skipIntro);
  }

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || introFinished) {
      return;
    }

    event.preventDefault();
    skipIntro();
  });

  runIntro();
})();
