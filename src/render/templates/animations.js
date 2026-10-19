// v3 3-Tier Animation Engine — Modern Vertical Video & Dynamic Karaoke
// HyperFrames runtime drives playback by seeking the timeline frame-by-frame.
//
// Supported GSAP props: opacity, x, y, scale, scaleX, scaleY, rotation, width, height, visibility.
// Do NOT use `delay:` in vars — use position parameter (3rd arg) instead.

window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
window.__timelines["news-video"] = tl;

(function () {
  // ── Inject shimmer masks into all .shimmer-sweep-target elements ──────────
  document.querySelectorAll(".shimmer-sweep-target").forEach((el) => {
    if (!el.querySelector(".shimmer-mask")) {
      const mask = document.createElement("div");
      mask.className = "shimmer-mask";
      el.appendChild(mask);
    }
  });

  const stage = document.getElementById("stage");
  const scenes = Array.from(stage.querySelectorAll(".scene"));

  // ── Scene dispatch ──────────────────────────────────────────────────────
  scenes.forEach((scene) => {
    const start = parseFloat(scene.dataset.start);
    const dur = parseFloat(scene.dataset.duration);
    const layout = scene.dataset.layout;

    // Scene visibility: fade in/out
    tl.set(scene, { opacity: 1 }, start);
    tl.set(scene, { opacity: 0 }, start + dur);

    // ── Tier Top Animations (Badge + Headline) ────────────────────────────
    const badge = scene.querySelector(".tier-top-badge");
    if (badge) {
      tl.fromTo(badge, { scale: 0.5, opacity: 0, y: -20 }, { scale: 1, opacity: 1, y: 0, duration: 0.4 }, start + 0.1);
    }

    const headline = scene.querySelector(".tier-top-headline");
    if (headline) {
      tl.fromTo(headline, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, start + 0.2);
      const mask = headline.querySelector(".shimmer-mask");
      if (mask) {
        tl.fromTo(mask, { x: "-120%" }, { x: "120%", duration: 0.9 }, start + 0.6);
      }
    }

    // ── Tier Mid Animations (Mockup + Auto-scroll) ────────────────────────
    const mockup = scene.querySelector(".mockup-laptop") || scene.querySelector(".mockup-phone");
    if (mockup) {
      tl.fromTo(mockup, { y: 60, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.55 }, start + 0.15);
    }

    const scrollTrack = scene.querySelector(".mockup-scroll-track");
    if (scrollTrack) {
      const scrollDuration = Math.max(1, dur * 0.75);
      tl.fromTo(scrollTrack, { y: "0%" }, { y: "-35%", ease: "none", duration: scrollDuration }, start + 0.4);
    }

    // ── Tier Bot Animations (Karaoke Subtitles) ───────────────────────────
    const karaokeBox = scene.querySelector(".karaoke-display-box");
    if (karaokeBox) {
      tl.fromTo(karaokeBox, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, start + 0.15);
    }

    const chunks = Array.from(scene.querySelectorAll(".k-chunk"));
    chunks.forEach((chunk, cIdx) => {
      const cStart = parseFloat(chunk.dataset.kStart);
      const cEnd = parseFloat(chunk.dataset.kEnd);
      // Ensure all chunks start hidden
      tl.set(chunk, { opacity: 0, y: 15, visibility: "hidden" }, 0);
      // Activate chunk
      tl.set(chunk, { opacity: 1, y: 0, visibility: "visible" }, cStart);
      // Hide chunk when next chunk starts or at scene end
      const hideTime = cIdx < chunks.length - 1 ? cEnd : start + dur;
      tl.set(chunk, { opacity: 0, y: -15, visibility: "hidden" }, hideTime);
    });

    const words = Array.from(scene.querySelectorAll(".k-word"));
    words.forEach((word) => {
      const wStart = parseFloat(word.dataset.kStart);
      const wEnd = parseFloat(word.dataset.kEnd);
      // Initial state: subtle dimmed
      tl.set(word, { opacity: 0.55, scale: 1.0 }, 0);
      // Highlight on read: kinetic bounce pop-in with vibrant lemon gold
      tl.to(word, {
        opacity: 1,
        scale: 1.26,
        color: "#ffe600",
        duration: 0.1,
        ease: "back.out(2)",
      }, wStart);
      // Finish highlight: settle into crisp solid white
      tl.to(word, {
        scale: 1.0,
        color: "#ffffff",
        opacity: 1,
        duration: 0.08,
        ease: "power1.inOut",
      }, wEnd);
    });

    // ── Template Specific Inner Animations ────────────────────────────────
    if (layout === "hook") {
      animateHook(scene, tl, start);
    } else if (layout === "comparison") {
      animateComparison(scene, tl, start);
    } else if (layout === "stat-hero") {
      animateStatHero(scene, tl, start);
    } else if (layout === "feature-list") {
      animateFeatureList(scene, tl, start);
    } else if (layout === "callout") {
      animateCallout(scene, tl, start);
    } else if (layout === "outro") {
      animateOutro(scene, tl, start, dur);
    }
  });

  // ── HOOK ──────────────────────────────────────────────────────────────
  function animateHook(scene, tl, start) {
    const headline = scene.querySelector(".hook-headline");
    if (headline) {
      tl.fromTo(headline, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 }, start + 0.15);
      const mask = headline.querySelector(".shimmer-mask");
      if (mask) {
        tl.fromTo(mask, { x: "-120%" }, { x: "120%", duration: 1.0 }, start + 0.7);
      }
    }

    const subhead = scene.querySelector(".hook-subhead");
    if (subhead) {
      tl.fromTo(subhead, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, start + 0.55);
    }
  }

  // ── COMPARISON ────────────────────────────────────────────────────────
  function animateComparison(scene, tl, start) {
    const leftCard = scene.querySelector(".cmp-left");
    if (leftCard) {
      tl.fromTo(leftCard, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, start + 0.15);
    }

    const vs = scene.querySelector(".cmp-vs");
    if (vs) {
      tl.fromTo(vs, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35 }, start + 0.45);
    }

    const rightCard = scene.querySelector(".cmp-right");
    if (rightCard) {
      tl.fromTo(rightCard, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, start + 0.6);
    }
  }

  // ── STAT HERO ─────────────────────────────────────────────────────────
  function animateStatHero(scene, tl, start) {
    const value = scene.querySelector(".stat-value");
    if (value) {
      tl.fromTo(value, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 }, start + 0.15);
      const mask = value.querySelector(".shimmer-mask");
      if (mask) {
        tl.fromTo(mask, { x: "-120%" }, { x: "120%", duration: 1.0 }, start + 0.7);
      }
    }

    const label = scene.querySelector(".stat-label");
    if (label) {
      tl.fromTo(label, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, start + 0.55);
    }

    const context = scene.querySelector(".stat-context");
    if (context) {
      tl.fromTo(context, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, start + 0.85);
    }
  }

  // ── FEATURE LIST ──────────────────────────────────────────────────────
  function animateFeatureList(scene, tl, start) {
    const card = scene.querySelector(".feat-card");
    if (card) {
      tl.fromTo(card, { y: 60, scale: 0.95, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5 }, start + 0.1);
    }

    const rule = scene.querySelector(".feat-rule");
    if (rule) {
      tl.fromTo(rule, { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 1, duration: 0.4 }, start + 0.45);
    }

    const bullets = scene.querySelectorAll(".feat-bullet");
    bullets.forEach((b, i) => {
      tl.fromTo(b, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 }, start + 0.6 + i * 0.15);
    });
  }

  // ── CALLOUT ───────────────────────────────────────────────────────────
  function animateCallout(scene, tl, start) {
    const card = scene.querySelector(".callout-card");
    if (card) {
      tl.fromTo(card, { y: 50, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.55 }, start + 0.2);
    }
  }

  // ── OUTRO ─────────────────────────────────────────────────────────────
  function animateOutro(scene, tl, start, dur) {
    const cta = scene.querySelector(".out-cta-top");
    if (cta) {
      tl.fromTo(cta, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.45 }, start + 0.2);
    }

    const channel = scene.querySelector(".out-channel");
    if (channel) {
      tl.fromTo(channel, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55 }, start + 0.55);
    }

    const underline = scene.querySelector(".out-underline");
    if (underline) {
      tl.fromTo(underline, { width: 0 }, { width: "600px", duration: 0.5 }, start + 0.9);
    }

    const source = scene.querySelector(".out-source");
    if (source) {
      tl.fromTo(source, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, start + 1.3);
    }

    // TikTok follow card
    const ttCard = scene.querySelector("#tt-card");
    if (ttCard) {
      const ttBtn = scene.querySelector("#tt-follow-btn");
      const ttFollow = scene.querySelector("#tt-btn-follow");
      const ttFollwing = scene.querySelector("#tt-btn-following");
      const ttBase = start + 1.6;

      tl.fromTo(ttCard, { opacity: 0, y: 80, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, ttBase);

      if (ttBtn) {
        tl.to(ttBtn, { scale: 0.92, duration: 0.15 }, ttBase + 0.9);
        tl.to(ttBtn, { scale: 1, duration: 0.4 }, ttBase + 1.05);
      }

      if (ttFollow) {
        tl.to(ttFollow, { opacity: 0, duration: 0.08 }, ttBase + 1.05);
      }
      if (ttFollwing) {
        tl.to(ttFollwing, { opacity: 1, duration: 0.08 }, ttBase + 1.08);
      }

      const holdStart = ttBase + 1.3;
      const holdEnd = start + dur - 0.1;
      const holdLen = Math.max(0.5, holdEnd - holdStart);
      tl.to(ttCard, { scale: 1.08, duration: holdLen }, holdStart);
    }
  }
})();
