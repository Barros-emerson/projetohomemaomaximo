
## Objetivo
Transformar o módulo de treino em um Sistema Operacional Pessoal de performance — força funcional, longevidade, prevenção de lesão. Sem estética de bodybuilding.

## Escopo em 4 blocos (posso executar todos ou você escolhe)

### Bloco 1 — Novo plano semanal (`src/data/treino-plano.ts`)
Substituir a rotina atual pela divisão pedida:
- **SEG · UPPER FORÇA** — Supino 5x5 · Barra Fixa com carga 5x · Militar em pé 5x5 · Remada Curvada 4x6 · Farmer Walk 4 rounds · Face Pull 3x20
- **TER · LOWER FORÇA (pré-Jiu 12h)** — Agachamento 5x5 · RDL 4x6 · Afundo caminhando 3x10 · Panturrilha em pé 4x15 · Ab Wheel 4x12 · *tag: sem falha total*
- **QUA · UPPER VOLUME** — Supino Inclinado Halter 4x10 · Remada Máquina 4x10 · Puxador 3x12 · Desenvolvimento Máquina 3x10 · Elevação Lateral 3x15 · Rosca Direta 3x10 · Tríceps Corda 3x12
- **QUI · POWER DAY (pré-Jiu)** — Box Jump · Push Press · KB Swing · Farmer Walk Pesado · Core Stability · Mobilidade
- **SEX · LOWER PERFORMANCE** — Levantamento Terra 5x3 · Front Squat 4x6 · Hip Thrust 4x8 · Mesa Flexora 3x12 · Panturrilha 4x15
- **SÁB · RECUPERAÇÃO** — Jiu opcional, sem gym
- **DOM · OFF** — Caminhada, sol, mobilidade, família

Cada dia com tag de foco (FORÇA/VOLUME/POWER/PERFORMANCE/RECOVERY) e nota de proteção peitoral onde aplica (progressão lenta, sem passar por dor).

### Bloco 2 — Ciclo de 12 semanas (`src/hooks/useLoadSuggestion.ts`)
Trocar o ciclo atual de 6 semanas por:
- **S1-S3 Build** — RPE 7-8, 70/75/80%
- **S4 Deload** — volume -40%, carga -15%
- **S5-S8 Overload progressivo** — 78/82/85/87%
- **S9-S11 Peak** — 88/90/92%
- **S12 Deload** — reinicia
Exibir na sugestão: 1RM Est · Semana · Fase · Alvo % · Carga sugerida (arredondada a 2.5kg). Peito continua com teto 75% e -15%.

### Bloco 3 — Readiness auto-ajuste
Já existe hook `useReadiness`. Adicionar comportamento explícito:
- **<60** — banner amarelo + cortar acessórios (últimos 30% dos exercícios do dia) e reduzir carga sugerida em 15%
- **<40** — bloquear treino e sugerir "Sessão de Recuperação" (caminhada 30min · mobilidade · alongamento · sol) com botão para registrar como sessão de recuperação
- Readiness já é obrigatório antes de iniciar (mantém).

### Bloco 4 — Missões Diárias + "DIA VENCIDO"
Renomear conceitualmente no Checklist/Dashboard:
- Header do Checklist: "MISSÕES DIÁRIAS" no lugar de "ROTINA".
- Quando todas as missões do dia estão concluídas (ou skipped em dia especial), o card final muda para **"DIA VENCIDO"** em dourado com selo tático, no lugar de "concluído".
- Não muda a estrutura de dados, só naming e visual do estado final.

## Design (aplicado nas telas do treino)
- Fundo preto, tipografia branca, acentos verdes discretos já existem no tema.
- Retirar emojis do header dos dias — trocar por códigos táticos (`M · UPPER STRENGTH`).
- Cores por foco: FORÇA branco, VOLUME cinza, POWER verde, PERFORMANCE dourado sutil, RECOVERY zinc.
- Sem gradientes coloridos, sem gaming, animações mínimas.

## Fora de escopo (não faço agora sem confirmação)
- Não reescrevo Checklist inteiro nem Dashboard — só o naming + estado "DIA VENCIDO".
- Não migro dados históricos: `treino_sessoes` antigos continuam válidos.
- Não removo o dia atual de Terça "Recuperação Ativa / Força Segura" já cadastrado sem sua confirmação — o Bloco 1 substitui essa terça pela LOWER FORÇA nova (é o que o brief pede). Se quiser preservar a terça atual como "protocolo de recuperação da lesão", me diga.

## Ordem de execução
Bloco 1 → Bloco 2 → Bloco 3 → Bloco 4. Cada bloco é independente e testável.

Confirma que sigo com os 4 blocos? Ou quer priorizar só o Bloco 1 (plano semanal) primeiro pra validar antes de propagar?
