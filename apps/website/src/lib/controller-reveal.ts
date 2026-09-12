import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initializeControllerReveals() {
  document.querySelectorAll<HTMLElement>("[data-case-story]").forEach((root) => {
    if (root.dataset.initialized) return;
    root.dataset.initialized = "true";
    const abort = new AbortController();
    const mm = gsap.matchMedia();
    const scene = root.querySelector<HTMLElement>(".case-scene")!;
    const sticky = root.querySelector<HTMLElement>(".case-sticky")!;
    const base = root.querySelector<HTMLImageElement>(".case-base")!;
    const cover = root.querySelector<HTMLElement>(".case-cover")!;
    const button = root.querySelector<HTMLButtonElement>(".case-toggle")!;
    const buttonLabel = root.querySelector<HTMLElement>("[data-case-button-label]")!;
    const title = root.querySelector<HTMLElement>("[data-case-title]")!;
    const description = root.querySelector<HTMLElement>("[data-case-description]")!;
    const progressLine = root.querySelector<HTMLElement>(".case-progress")!;
    const images = [...root.querySelectorAll<HTMLImageElement>(".case-layers img")];
    let open = false;
    let toggle = () => {};

    function describe(inside: boolean) {
      open = inside;
      root.dataset.open = String(inside);
      button.setAttribute("aria-expanded", String(inside));
      buttonLabel.textContent = root.dataset[inside ? "closeLabel" : "openLabel"]!;
      title.textContent = root.dataset[inside ? "insideTitle" : "closedTitle"]!;
      description.textContent = root.dataset[inside ? "insideDescription" : "closedDescription"]!;
      scene.setAttribute("aria-label", root.dataset[inside ? "insideAlt" : "closedAlt"]!);
    }

    async function prepare() {
      observer.disconnect();
      try {
        await Promise.all(
          images.map((img) => {
            img.loading = "eager";
            return img.decode();
          }),
        );
      } catch {
        // Keep the closed image and native inside disclosure if loading fails.
        return;
      }
      if (abort.signal.aborted) return;
      root.dataset.ready = "true";
      button.hidden = false;
      mm.add(
        {
          always: "all",
          motion: "(prefers-reduced-motion: no-preference)",
          tall: "(min-height: 600px)",
        },
        (context) => {
          const scroll = context.conditions?.motion && context.conditions?.tall;
          describe(false);
          root.dataset.progress = "0";
          // A button may have changed opacity outside the previous media context.
          gsap.set([cover, base, progressLine], { clearProps: "all" });
          if (!scroll) {
            delete root.dataset.scroll;
            toggle = () => {
              describe(!open);
              gsap.set(cover, { opacity: open ? 0 : 1 });
            };
            return;
          }
          root.dataset.scroll = "on";
          const timeline = gsap.timeline({
            paused: true,
            onUpdate() {
              const progress = timeline.progress();
              root.dataset.progress = progress.toFixed(3);
              if (progress > 0.6 !== open) describe(progress > 0.6);
            },
          });
          timeline
            .to(
              cover,
              {
                xPercent: -8,
                yPercent: -15,
                rotation: -4,
                scale: 1.025,
                duration: 0.5,
                ease: "power1.inOut",
              },
              0.12,
            )
            .to(cover, { opacity: 0, yPercent: -27, duration: 0.28, ease: "power1.inOut" }, 0.5)
            .to(base, { scale: 1.07, yPercent: 2, duration: 0.58, ease: "power1.inOut" }, 0.2)
            .to(progressLine, { scaleX: 1, duration: 1, ease: "none" }, 0);
          const trigger = ScrollTrigger.create({
            trigger: root,
            start: () =>
              `top ${parseFloat(getComputedStyle(root).getPropertyValue("--case-top"))}px`,
            end: () => `+=${Math.max(1, root.offsetHeight - sticky.offsetHeight)}`,
            animation: timeline,
            scrub: 0.45,
            invalidateOnRefresh: true,
          });
          toggle = () =>
            window.scrollTo({ top: open ? trigger.start : trigger.end, behavior: "smooth" });
          // This section adds its travel after the images are decoded. Refresh
          // downstream sections once; never remove another section's triggers.
          ScrollTrigger.refresh();
          return () => {
            trigger.kill();
            timeline.revert();
            delete root.dataset.scroll;
          };
        },
      );
    }
    button.addEventListener("click", () => toggle(), { signal: abort.signal });
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void prepare();
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(root);
    document.addEventListener(
      "astro:before-swap",
      () => {
        abort.abort();
        observer.disconnect();
        mm.revert();
      },
      { once: true, signal: abort.signal },
    );
  });
}
