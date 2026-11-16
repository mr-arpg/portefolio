import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Scribble } from "@/components/Scribble";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "armando, web design" },
      {
        name: "description",
        content:
          "Armando Gonçalves — web designer and developer in Lisbon. Websites for people who'd rather be remembered than templated.",
      },
      { property: "og:title", content: "armando, web design" },
      {
        property: "og:description",
        content: "Websites for people who'd rather be remembered than templated.",
      },
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
      "Part engineer, part musician, part wrestler (Olympic freestyle wrestling). I make websites in my spare time, maybe one day full time.",
    cv: "My CV",
    place: "Lisbon, Portugal · Available remotely",
    code: "EN",
    switchLabel: "English",
    clickMe: "click me",
  },
  pt: {
    sections: ["Sobre", "Trabalho", "Contacto"],
    about:
      "Parte engenheiro, parte músico, parte lutador (luta livre olímpica). Faço websites nos meus tempos livres, quem sabe um dia a tempo inteiro.",
    cv: "O meu CV",
    place: "Lisboa, Portugal · Disponível remotamente",
    code: "PT",
    switchLabel: "Português",
    clickMe: "clica-me",
  },
} as const;

const works = [
  { title: "Associação 641", href: "https://641.pt", label: "641.pt" },
  {
    title: "Eyewitness (ARTeFACTo 2026, Beja)",
    href: "https://arpg-eyewitness.hf.space/",
    label: "hf.space",
  },
  { title: "Sozaia", href: "https://mr-arpg.github.io/sozaia/", label: "sozaia" },
  { title: "Dvojeziko", href: "https://dvojeziko.vercel.app/", label: "dvojeziko" },
  {
    title: "Mixtaper Concept",
    href: "https://mr-arpg.github.io/mixtaper/?list=PLV9OFpCeDOvk&title=Awesome+Tuga+Vibes+For+Melina+Vol.1",
    label: "mixtaper",
  },
  { title: "Onion Tools", href: "https://mr-arpg.github.io/onion-tools/", label: "onion-tools" },
  {
    title: "Parody University",
    href: "https://mr-arpg.github.io/tecas.pt/tecas.pt/",
    label: "tecas.pt",
  },
  { title: "HackerSchool Recruitment", href: "https://hackerschool.github.io/HRS/", label: "HRS" },
] as const;

type Lang = keyof typeof copy;

function ScreenDraw({ wipe }: { wipe: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const ink = () => {
      const color =
        getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim() ||
        "#000";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width === w && canvas.height === h) {
        ink();
        return;
      }
      const prev = document.createElement("canvas");
      prev.width = canvas.width;
      prev.height = canvas.height;
      if (canvas.width && canvas.height) prev.getContext("2d")?.drawImage(canvas, 0, 0);
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (prev.width && prev.height) ctx.drawImage(prev, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ink();
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
      try {
        document.body.setPointerCapture(e.pointerId);
      } catch {
        // Some mobile browsers reject capture; the window listeners still draw.
      }
      x = e.clientX;
      y = e.clientY;
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    };
    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      if (e.cancelable) e.preventDefault();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
      x = e.clientX;
      y = e.clientY;
    };
    const up = (e: PointerEvent) => {
      drawing.current = false;
      if (document.body.hasPointerCapture(e.pointerId))
        document.body.releasePointerCapture(e.pointerId);
    };

    window.addEventListener("resize", fit);
    window.addEventListener("pointerdown", down, { passive: false });
    window.addEventListener("pointermove", move, { passive: false });
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
  if (i === 0)
    return (
      <p>
        {t.about}{" "}
        <a
          className="reveal-link"
          href={`${import.meta.env.BASE_URL}cv.pdf`}
          target="_blank"
          rel="noreferrer"
        >
          {t.cv} →
        </a>
      </p>
    );
  if (i === 1)
    return (
      <div className="space-y-1">
        {works.map((work) => (
          <p key={work.href} className="flex flex-wrap items-baseline gap-x-2">
            <span>{work.title}</span>
            <a
              href={work.href}
              target="_blank"
              rel="noreferrer"
              className="reveal-link whitespace-nowrap"
            >
              {work.label} →
            </a>
          </p>
        ))}
      </div>
    );
  return (
    <div className="space-y-1">
      <p>Armando Gonçalves</p>
      <p>
        <a className="reveal-link break-all" href="mailto:armandogoncalves@tecnico.ulisboa.pt">
          armandogoncalves@tecnico.ulisboa.pt
        </a>
      </p>
      <p>
        <a className="reveal-link" href="tel:+351968507107">
          +351 968 507 107
        </a>
      </p>
      <p>
        Instagram:{" "}
        <a
          className="reveal-link"
          href="https://instagram.com/dopacrusader"
          target="_blank"
          rel="noreferrer"
        >
          @dopacrusader
        </a>
      </p>
      <p>
        LinkedIn:{" "}
        <a
          className="reveal-link"
          href="https://linkedin.com/in/armando-goncalves"
          target="_blank"
          rel="noreferrer"
        >
          armando-goncalves
        </a>
      </p>
      <p>
        GitHub:{" "}
        <a
          className="reveal-link"
          href="https://github.com/mr-arpg"
          target="_blank"
          rel="noreferrer"
        >
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
  const [systemCursor, setSystemCursor] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const t = copy[lang];
  const nextLang: Lang = lang === "en" ? "pt" : "en";

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "pt" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const move = (e: PointerEvent) =>
      e.pointerType === "mouse" && setDot({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <main
      className={`relative min-h-screen bg-background text-foreground font-mono cursor-none-fine${
        active !== null ? " is-reading" : ""
      }${systemCursor ? " is-system-cursor" : ""}`}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-hotspot],[data-panel]")) setActive(null);
      }}
    >
      <h1 className="sr-only">armando, web design</h1>
      <ScreenDraw wipe={wipe} />
      <button
        type="button"
        onClick={() => {
          setLang(nextLang);
          localStorage.setItem("lang", nextLang);
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setSystemCursor(true)}
        onPointerLeave={() => setSystemCursor(false)}
        aria-label={copy[nextLang].switchLabel}
        className="lang-toggle fixed top-5 right-6 z-40 border-0 bg-transparent p-0 font-mono text-base leading-none text-foreground"
      >
        {copy[nextLang].code}
      </button>
      <div
        className="relative mx-auto pt-[8vh] w-[90vw] md:w-[66vw]"
        onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
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
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  setActive(i);
                  setWipe((n) => n + 1);
                }}
                onPointerDown={(e) => {
                  if (e.pointerType === "mouse") return;
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
          <p className={`click-hint${active !== null ? " is-off" : ""}`} aria-hidden="true">
            <svg viewBox="0 0 210 42" className="click-arrows">
              <path d="M104 39C91 29 59 22 25 8" />
              <path d="m31 5-7 3 3 7" />
              <path d="M105 38c-2-10-2-19 0-30" />
              <path d="m100 13 5-6 4 7" />
              <path d="M106 39c15-10 47-18 80-30" />
              <path d="m181 6 6 3-3 7" />
            </svg>
            <span>{t.clickMe}</span>
          </p>
        </div>
        <div
          className="relative mt-6 min-h-48"
          data-panel
          onMouseEnter={() => active !== null && setActive(active)}
        >
          {t.sections.map((s, i) => (
            <section
              key={i}
              id={`panel-${i}`}
              aria-label={s}
              className={`reveal absolute text-base leading-relaxed md:text-xs ${
                i === 0
                  ? "left-0 w-full md:max-w-sm"
                  : i === 1
                    ? "left-0 w-full md:left-1/2 md:w-max md:max-w-full md:-translate-x-1/2"
                    : "left-0 w-full md:left-auto md:right-0 md:w-auto md:max-w-sm"
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

      {dot && active === null && !systemCursor && (
        <div
          className="cursor-dot"
          style={{ transform: `translate(${dot.x - 4}px, ${dot.y - 4}px)` }}
        />
      )}
    </main>
  );
}
