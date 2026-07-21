## Plano

### O que será feito
Substituir o subtítulo da página `/familia` no dashboard para deixar a mensagem mais inclusiva e alinhada ao nome da seção.

### Arquivo alterado
- `src/routes/familia.tsx`

### Mudança exata
**De:**
```
Vocês dois no mesmo orçamento — cada um com seu próprio login.
```

**Para:**
```
Cadastre seu cônjuge ou um familiar e gerenciem o orçamento juntos. Cada um terá seu próprio login, mantendo o controle completo das finanças em um único lugar.
```

### Por que essa mudança
- O nome da seção é "Família", mas o texto atual restringia a funcionalidade a casais ("Vocês dois").
- O novo texto deixa claro que é possível convidar cônjuge **ou** familiar.
- Reforça o benefício prático: controle completo das finanças em um único lugar, com login individual.

### Verificação
- Confirmar que o texto foi substituído corretamente.
- Verificar se há quebras de layout no card devido ao texto maior (ajustar espaçamento se necessário).
- Validar no preview que a página `/familia` carrega sem erros.
