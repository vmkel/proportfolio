(() => {
  const INTRO_WELCOME_MS = 2600;
  const INTRO_EYE_MS = 4300;
  const terminalCommand = document.getElementById("terminalCommand");
  const terminalOutput = document.getElementById("terminalOutput");
  const navLinks = [...document.querySelectorAll("[data-nav-link]")];
  const sections = [...document.querySelectorAll("main .section[id]")];
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;
  const introOverlay = document.getElementById("introOverlay");
  const pixelField = document.getElementById("pixelField");

  const terminalFrames = [
    { command: "> whoami", output: "Cybersecurity & AI learner" },
    { command: "> status", output: "Learning. Building. Securing. Evolving." },
    { command: "> current_focus", output: "Networks / Linux / Cybersecurity / AI" },
  ];

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
      body.classList.add("intro-done");
      body.classList.remove("intro-lock");
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      introOverlay.classList.add("intro-complete");
      body.classList.add("intro-done");
      body.classList.remove("intro-lock");
      return;
    }

    await delay(INTRO_WELCOME_MS);
    introOverlay.classList.remove("intro-phase-welcome");
    introOverlay.classList.add("intro-phase-eye");
    await delay(INTRO_EYE_MS);
    introOverlay.classList.add("intro-complete");
    body.classList.add("intro-done");
    body.classList.remove("intro-lock");
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
  setupThemeToggle();
  runIntro();
})();
