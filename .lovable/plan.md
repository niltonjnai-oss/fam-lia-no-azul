## Objetivo
Adicionar o efeito de "desenho animado" (line-drawing) nos ícones da seção **Benefícios** de `/inicio`, sem alterar textos, títulos, ordem dos cards, cores ou layout bento existente.

## O que muda
Apenas os ícones dos 6 cards da seção `#beneficios` ganham animação de traço contínuo (draw in/out em loop), usando a lib `animejs` com os ícones `lucide-react` que já estão lá.

## Passos

1. **Instalar dependência**
   - `bun add animejs` (lucide-react já existe no projeto).

2. **Criar hook `src/components/ui/lucide-icon-drawer.tsx`**
   - Exporta `useLucideDrawerAnimation()`:
     - `ref` para o container.
     - No `useEffect`, seleciona `svg path, svg circle, svg polyline` dentro do ref, aplica classe `.line` e chama `animate(svg.createDrawable('.line'), { draw: ['0 0.05', '0.05 1'], ease: 'inOutQuad', duration: 1000, loop: true, alternate: true })`.
     - Cleanup: `pause()` da animação no unmount pra não vazar em rota-out.

3. **Aplicar no `src/routes/index.tsx` — apenas seção `#beneficios`**
   - Importar o hook.
   - Envolver o grid de 6 cards de benefícios com um `<div ref={drawerRef}>` (sem alterar classes do grid nem dos cards).
   - Manter os mesmos ícones Lucide já usados hoje, os mesmos textos, títulos, cores (azul-marinho/cinza alternado) e min-height.
   - Ajuste mínimo de CSS inline nos ícones: `strokeLinecap="round"` / `strokeLinejoin="round"` só se necessário para o traço ficar bonito (sem trocar `size` nem `color`).

4. **Garantir SSR-safe**
   - O hook roda só em `useEffect` (client), sem `typeof window` no `useState`, seguindo a regra do TanStack Start.

5. **Validação**
   - Rodar preview e conferir na seção Benefícios: os 6 ícones desenham/apagam em loop suave; nenhum texto/card/cor mudou; restante da LP intacto.

## Fora do escopo
- Não mexer em Hero, "Como funciona", "Por que funciona", História, Planos, FAQ, CTA final, tipografia global, nem em outras rotas.
- Não trocar ícones nem paleta.
