import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Scribble } from "@/components/Scribble";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Armando Gonçalves, web design" },
      { name: "description", content: "Armando Gonçalves — web designer and developer in Lisbon. Websites for people who'd rather be remembered than templated." },
      { property: "og:title", content: "Armando Gonçalves, web design" },
      { property: "og:description", content: "Websites for people who'd rather be remembered than templated." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const sections = ["About", "Work", "Contact"];

function Content({ i }: { i: number }) {
  if (i === 0)
    return <p>Part engineer, part musician, part wrestler. I build websites for people who'd rather be remembered than templated.</p>;
  if (i === 1)
    return (
      <div className="space-y-1">
        <p>Associação 641</p>
        <p>Website for a music incubator at the Fábrica da Pólvora, Barcarena.</p>
        <a href="https://641.pt" target="_blank" rel="noreferrer" className="reveal-link">641.pt →</a>
      </div>
    );
  return (
    <div className="space-y-1">
      <p>Armando Gonçalves</p>
      <p><a className="reveal-link" href="tel:+351968507107">+351 968 507 107</a></p>
      <p>Instagram: <a className="reveal-link" href="https://instagram.com/dopacrusader" target="_blank" rel="noreferrer">@dopacrusader</a></p>
      <p>LinkedIn: <a className="reveal-link" href="https://linkedin.com/in/armando-goncalves" target="_blank" rel="noreferrer">armando-goncalves</a></p>
      <p>GitHub: <a className="reveal-link" href="https://github.com/mr-arpg" target="_blank" rel="noreferrer">mr-arpg</a></p>
    </div>
  );
}

function Index() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <main
      className="relative min-h-screen bg-background text-foreground font-mono cursor-none-fine"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-hotspot],[data-panel]")) setActive(null);
      }}
    >
      <h1 className="sr-only">Armando Gonçalves, web design</h1>
      <div
        className="relative mx-auto pt-[8vh] w-[90vw] md:w-[66vw]"
        onMouseLeave={() => setActive(null)}
      >
        <Scribble active={active} />
        <div className="absolute inset-x-0 bottom-0 top-[8vh] grid grid-cols-3">
          {sections.map((s, i) => (
            <button
              key={s}
              data-hotspot
              aria-label={s}
              aria-expanded={active === i}
              aria-controls={`panel-${i}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="hotspot"
            />
          ))}
        </div>
        <div className="relative mt-6 min-h-48" data-panel onMouseEnter={() => active !== null && setActive(active)}>
          {sections.map((s, i) => (
            <section
              key={s}
              id={`panel-${i}`}
              aria-label={s}
              className={`reveal absolute max-w-sm text-xs leading-relaxed ${
                i === 0 ? "left-0" : i === 1 ? "left-1/2 -translate-x-1/2" : "right-0"
              } ${active === i ? "is-visible" : ""}`}
            >
              <Content i={i} />
            </section>
          ))}
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-4 text-center font-mono text-[10px] leading-relaxed text-muted-foreground">
        <p>Lisbon, Portugal · Available remotely</p>
        <p>© 2026 Armando Gonçalves</p>
      </footer>

      <CursorDot />
    </main>
  );
}

function CursorDot() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = ref.current;
      if (!el || e.pointerType !== "mouse") return;
      el.style.opacity = "1";
      el.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return <div ref={ref} className="cursor-dot" style={{ opacity: 0 }} aria-hidden="true" />;
}
