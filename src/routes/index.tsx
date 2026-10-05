import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Scribble } from "@/components/Scribble";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "armando, web design" },
      { name: "description", content: "Armando Gonçalves — web designer and developer in Lisbon. Websites for people who'd rather be remembered than templated." },
      { property: "og:title", content: "armando, web design" },
      { property: "og:description", content: "Websites for people who'd rather be remembered than templated." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const copy = {
  en: {
    sections: ["About", "Work", "Contact"],
    about:
      "Part engineer, part musician, part wrestler. I build websites for people who'd rather be remembered than templated.",
    work: "Website for a music incubator at the Fábrica da Pólvora, Barcarena.",
    place: "Lisbon, Portugal · Available remotely",
    code: "EN",
    switchLabel: "English",
  },
  pt: {
    sections: ["Sobre", "Trabalho", "Contacto"],
    about:
      "Parte engenheiro, parte músico, parte lutador. Faço websites para quem prefere ser lembrado a ser um template.",
    work: "Website para uma incubadora de música na Fábrica da Pólvora, Barcarena.",
    place: "Lisboa, Portugal · Disponível remotamente",
    code: "PT",
    switchLabel: "Português",
  },
} as const;

type Lang = keyof typeof copy;

function ScreenDraw({ wipe }: { wipe: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const color =
        getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim() || "#000";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    fit();

    let x = 0;
    let y = 0;

    const blocked = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest("button, a, .reveal.is-visible"));

    const down = (e: PointerEvent) => {
      if (e.button !== 0 || blocked(e.target)) return;
      e.preventDefault();
      drawing.current = true;
      x = e.clientX;
      y = e.clientY;
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    };
    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
      x = e.clientX;
      y = e.clientY;
    };
    const up = () => {
      drawing.current = false;
    };

    window.addEventListener("resize", fit);
    window.addEventListener("pointerdown", down, { passive: false });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  useEffect(() => {
    if (wipe === 0) return;
    drawing.current = false;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, [wipe]);

  return <canvas ref={ref} aria-hidden="true" className="draw-layer" />;
}

function Content({ i, lang }: { i: number; lang: Lang }) {
  const t = copy[lang];
  if (i === 0) return <p>{t.about}</p>;
  if (i === 1)
    return (
      <div className="space-y-1">
        <p>Associação 641</p>
        <p>{t.work}</p>
        <a href="https://641.pt" target="_blank" rel="noreferrer" className="reveal-link">
          641.pt →
        </a>
      </div>
    );
  return (
    <div className="space-y-1">
      <p>Armando Gonçalves</p>
      <p>
        <a className="reveal-link" href="tel:+351968507107">
          +351 968 507 107
        </a>
      </p>
      <p>
        Instagram:{" "}
        <a className="reveal-link" href="https://instagram.com/dopacrusader" target="_blank" rel="noreferrer">
          @dopacrusader
        </a>
      </p>
      <p>
        LinkedIn:{" "}
        <a className="reveal-link" href="https://linkedin.com/in/armando-goncalves" target="_blank" rel="noreferrer">
          armando-goncalves
        </a>
      </p>
      <p>
        GitHub:{" "}
        <a className="reveal-link" href="https://github.com/mr-arpg" target="_blank" rel="noreferrer">
          mr-arpg
        </a>
      </p>
    </div>
  );
}

function Index() {
  const [active, setActive] = useState<number | null>(null);
  const [wipe, setWipe] = useState(0);
  const [dot, setDot] = useState<{ x: number; y: number } | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const t = copy[lang];

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "pt" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const move = (e: PointerEvent) => e.pointerType === "mouse" && setDot({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <main
      className="relative min-h-screen bg-background text-foreground font-mono cursor-none-fine"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-hotspot],[data-panel]")) setActive(null);
      }}
    >
      <h1 className="sr-only">armando, web design</h1>
      <ScreenDraw wipe={wipe} />
      <button
        type="button"
        onClick={() => {
          const next: Lang = lang === "en" ? "pt" : "en";
          setLang(next);
          localStorage.setItem("lang", next);
        }}
        aria-label={t.switchLabel}
        className="lang-toggle fixed top-5 right-6 z-40 border-0 bg-transparent p-0 font-mono text-base leading-none text-foreground"
      >
        {t.code}
      </button>
      <div
        className="relative mx-auto pt-[8vh] w-[90vw] md:w-[66vw]"
        onMouseLeave={() => setActive(null)}
      >
        <div className="relative">
          <Scribble active={active} />
          <div className="absolute inset-0 grid grid-cols-3">
          {t.sections.map((s, i) => (
            <button
              key={i}
              data-hotspot
              aria-label={s}
              aria-expanded={active === i}
              aria-controls={`panel-${i}`}
              onMouseEnter={() => {
                setActive(i);
                setWipe((n) => n + 1);
              }}
              onFocus={() => {
                setActive(i);
                setWipe((n) => n + 1);
              }}
              onClick={() => setActive(i)}
              className="hotspot"
            />
          ))}
          </div>
        </div>
        <div className="relative mt-6 min-h-48" data-panel onMouseEnter={() => active !== null && setActive(active)}>
          {t.sections.map((s, i) => (
            <section
              key={i}
              id={`panel-${i}`}
              aria-label={s}
              className={`reveal absolute max-w-sm text-xs leading-relaxed ${
                i === 0 ? "left-0" : i === 1 ? "left-1/2 -translate-x-1/2" : "right-0"
              } ${active === i ? "is-visible" : ""}`}
            >
              <Content i={i} lang={lang} />
            </section>
          ))}
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-4 text-center font-mono text-[10px] leading-relaxed text-muted-foreground">
        <p>{t.place}</p>
        <p>© 2026 Armando Gonçalves</p>
      </footer>

      {dot && <div className="cursor-dot" style={{ transform: `translate(${dot.x - 4}px, ${dot.y - 4}px)` }} />}
    </main>
  );
}
