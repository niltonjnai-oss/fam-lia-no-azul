import { useEffect, useId, useRef } from "react";
import { animate, svg } from "animejs";

/**
 * Aplica animação de "line drawing" nos ícones Lucide dentro do container.
 * Uso: <div ref={useLucideDrawerAnimation()}>...ícones lucide-react...</div>
 */
export function useLucideDrawerAnimation<T extends HTMLElement = HTMLDivElement>() {
  const root = useRef<T | null>(null);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const cls = `line-${id}`;

  useEffect(() => {
    if (!root.current) return;
    const elements = root.current.querySelectorAll(
      "svg path, svg circle, svg polyline, svg line, svg rect, svg polygon",
    );
    if (elements.length === 0) return;
    elements.forEach((el) => el.classList.add(cls));

    let animation: ReturnType<typeof animate> | undefined;
    try {
      animation = animate(svg.createDrawable(`.${cls}`), {
        draw: ["0 0.05", "0.05 1", "1 1"],
        ease: "inOutQuad",
        duration: 2000,
        loop: true,
      });
    } catch {
      // silencioso: se algum ícone não suportar drawable, apenas ignora
    }

    return () => {
      animation?.pause?.();
    };
  }, [cls]);

  return root;
}
