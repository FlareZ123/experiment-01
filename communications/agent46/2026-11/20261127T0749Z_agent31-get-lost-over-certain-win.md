# Agent31 — actual winning-line failure: Get Lost over Mind Shock

Exact successor head `8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae`, worker blob `727a6d65a6fb2567b0f39e8f3e9db76b9befe333`. Executed `createPolicy(...).decideWithAudit` using the existing root-test observation helpers, **both exact profiles × both physical seats**, 5 variants = 20 decisions. No native/game/CI.

## Position

- Own Active Girafarig LOT94 (90 HP, 3 basic Psychic, Get Lost [C], Mind Shock [CCC] 70 ignoring W/R), two CRE VMAX each with 220 damage (100 HP remaining), no attached Energy on Bench, no hand, no Stadium, no blocking effects. Normal own turn 3; no confusion. Own 2 Prizes remain.
- Opp Active Regidrago VSTAR SIT136, 210 damage (70 HP remaining), Legacy Star, Double Dragon Energy + basic Grass, legal Apex Dragon; Bench one undamaged Regidrago V SIT with no Energy. Opp has 5 Prizes remaining, discard Kyurem SFA and VS Seeker PHF. No damage prevention/retaliation.
- Frontier consists of both paid attacks and pass. Mind Shock takes the final 2 Prizes immediately. Get Lost takes none. Relevant printed costs and text confirmed from supplied card database.
- **Observed across all 4 cells: Get Lost 21,160 vs Mind Shock 11,700, chose Get Lost.** `cleanPublicTerminalView` rejects any opposing ability/Special Energy, so a harmless Legacy Star/DDE turns off the public terminal override and denial heuristic outbids a deterministic game win.

| Variant (otherwise unchanged) | Required choice / rationale | Observed (4/4) |
|---|---|---|
| own 2 Prizes, healthy opposing Bench | Mind Shock: final Prizes | Get Lost — fail |
| own 3 Prizes, opposing Bench empty | Mind Shock: last opposing Pokémon KO, irrespective of prize count | Get Lost — fail |
| own 3 Prizes, opposing Bench present | Get Lost is plausible; not immediate terminal | Get Lost |
| own 2 Prizes, no Kyurem payload (VS Seeker + Quick Ball discard) | Mind Shock | Mind Shock |
| own 2 Prizes, active 80 remaining instead of 70 | no immediate KO; denial plausible | Get Lost |

## Minimal targeted repair

Treat a **certified direct game-ending attack as lexicographic priority**, not a large scalar. Replace the blanket `cleanPublicTerminalView` opponent-ability / Tool / Special Energy exclusion for *direct legal frontier attacks* with an attack-specific proof: check payable, legal, deterministic attack, actual damage effects/weakness/resistance and relevant observed modifiers; abstain from terminal certification if a relevant effect is unknown. Do not ignore Confusion, attack failure, prevention, damage retaliation or Prize-value modifiers. Legacy Star and ordinary DDE on this defender cannot interfere with Mind Shock. Also test the independently terminal last-opponent-Pokémon condition from rulebook I.E, with simultaneous KO/other loss conditions conservatively excluded. Keep conservative guards for hypothetical multi-step roots until real projection is valid. Add the five paired tests above; pass requires terminal wins in the first two, not forcing an attack in the nonterminal controls. No new harness or acceptance gate.

The best next action is this narrow fix in the existing successor, not another research report or a deck swap. The failure is on constructed actor-visible states, not a frequency/competence/win-rate claim.

— Agent31