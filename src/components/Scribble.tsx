import { useMemo } from "react";

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

type Stroke = { d: string; w: number; o: number; region: number; light: boolean; dash?: string };

function buildStrokes(): Stroke[] {
  const r = rng(641);
  const out: Stroke[] = [];
  const W = 1000;
  for (let i = 0; i < 240; i++) {
    const cx = 40 + r() * 920;
    const cy = 60 + r() * 140;
    const kind = r();
    const pts: [number, number][] = [];
    if (kind < 0.55) {
      // cursive-ish loops
      const len = 60 + r() * 220;
      const n = 6 + Math.floor(r() * 10);
      const amp = 10 + r() * 40;
      for (let k = 0; k < n; k++) {
        const t = k / (n - 1);
        pts.push([cx - len / 2 + t * len + (r() - 0.5) * 25, cy + (r() - 0.5) * amp * 2]);
      }
    } else if (kind < 0.8) {
      // vertical tall strokes
      const h = 40 + r() * 160;
      pts.push([cx, cy - h / 2], [cx + (r() - 0.5) * 30, cy], [cx + (r() - 0.5) * 20, cy + h / 2]);
    } else {
      // big arcs
      const rad = 30 + r() * 90;
      for (let k = 0; k < 6; k++) {
        const a = Math.PI + (k / 5) * Math.PI * (1 + r());
        pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.8]);
      }
    }
    const p0 = pts[0]!;
    let d = `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}`;
    for (let k = 1; k < pts.length; k++) {
      const [px, py] = pts[k - 1]!;
      const [x, y] = pts[k]!;
      d += ` Q${px.toFixed(1)} ${py.toFixed(1)} ${((px + x) / 2).toFixed(1)} ${((py + y) / 2).toFixed(1)}`;
    }
    const thick = r() < 0.35;
    const light = r() < 0.18;
    if (light) {
      // irregular white stroke: stacked passes with varying width and broken dashes
      for (let p = 0; p < 3; p++) {
        out.push({
          d,
          w: 0.6 + r() * (p === 0 ? 7 : 3),
          o: 0.6 + r() * 0.4,
          region: Math.min(2, Math.floor((cx / W) * 3)),
          light: true,
          dash: `${(4 + r() * 40).toFixed(0)} ${(1 + r() * 8).toFixed(0)} ${(2 + r() * 20).toFixed(0)} ${(1 + r() * 5).toFixed(0)}`,
        });
      }
      continue;
    }
    out.push({
      light: false,
      d,
      w: thick ? 4 + r() * 6 : 0.8 + r() * 2.2,
      o: r() < 0.3 ? 0.45 + r() * 0.3 : 1,
      region: Math.min(2, Math.floor((cx / W) * 3)),
    });
  }
  return out;
}

export function Scribble({ active }: { active: number | null }) {
  const strokes = useMemo(buildStrokes, []);
  return (
    <svg viewBox="0 0 1000 280" className="h-auto w-full" aria-hidden="true">
      {[0, 1, 2].map((g) => (
        <g
          key={g}
          className={`scribble-group scribble-g${g} ${active === g ? "is-active" : ""} ${
            active !== null && active !== g ? "is-dim" : ""
          }`}
        >
          {strokes
            .filter((s) => s.region === g)
            .map((s, i) => (
              <path
                key={i}
                d={s.d}
                fill="none"
                stroke={s.light ? "var(--scribble-light)" : "currentColor"}
                strokeDasharray={s.dash}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={s.w}
                opacity={s.o}
                className={s.light ? "scribble-stroke is-light" : "scribble-stroke"}
                style={{ animationDelay: `${(i % 7) * -0.9}s` }}
              />
            ))}
        </g>
      ))}
    </svg>
  );
}
