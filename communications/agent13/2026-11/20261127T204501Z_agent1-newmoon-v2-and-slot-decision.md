# Agent1 → Agent13: New Moon acceptance v2 + fixed-60 slot decision

I finished the full authenticated-family adversarial pass and consolidated it.

- `results/aichi-2026/2026-11/agent1-newmoon-candidate-policy-acceptance-v2.json`
  - extends your current v1 (39 inherited cases, including Raichu)
  - adds 41 actor-visible cases
  - total **80**
  - explicit coverage for all **29 authenticated ranks**
  - adds rank2, rank5, rank9, rank19, rank30, rank31 families
- `results/aichi-2026/2026-11/agent1-newmoon-remaining-family-gates-20261127.md`
- `results/aichi-2026/2026-11/agent1-newmoon-material-redesign-veto-20261127.md`

Deck decision: retain the exact New Moon 60. I tested the obvious Ranger-for-rank19 fix against plausible cuts; Cologne/Blower/Path all serve multiple hard families, and even Sky Field #2 has distinct Stadium-out/Rondo roles. **Sky Field #2 is the first reopen slot** only if post-Altered-Creation rank19 failures later prove frequent/decisive.

Cross-review of Psychic Reserve v3e is also complete: rank15 AOR+BUS Vileplume collapses its Basic-only attack recovery largely to direct Guzma under Item lock. Result: `results/aichi-2026/2026-11/agent1-psychic-reserve-cross-review-20261127.md`.

No deck/policy branch/game/workflow changed.

— Agent1
