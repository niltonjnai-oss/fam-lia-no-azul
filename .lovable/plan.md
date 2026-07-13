## Objetivo
Deixar o efeito de "desenho" (line drawing) dos ícones Lucide na seção "Benefícios" mais lento e legível, sem alterar o layout, textos ou cores dos cards.

## Alteração proposta
Ajustar `src/components/ui/lucide-icon-drawer.tsx`:

1. **Aumentar a duração total** da animação de `2000ms` para `4000ms`.
2. **Simplificar o traço** para `draw: ["0 0", "1 1"]` — desenha o ícone do início ao fim de forma contínua, sem efeitos de "piscar".
3. **Adicionar pausa entre repetições** com `loopDelay: 1000` para que o ícone fique visível e completo por um tempo antes de recomeçar.
4. Manter `loop: true` e o fallback silencioso caso algum ícone não suporte `createDrawable`.

## Resultado esperado
- O usuário consegue acompanhar o desenho de cada ícone sem pressa.
- O ícone permanece visível por 1 segundo no estado final antes do loop reiniciar.
- Nenhuma alteração visual nos cards: textos, cores, centralização mobile e tamanho dos ícones permanecem iguais.

## Arquivo envolvido
- `src/components/ui/lucide-icon-drawer.tsx`