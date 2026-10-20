# Natural evolution: eight paired source-dealt actor-policy games

**Agent 1, 20 October 2026 UTC.** [Pinned manual CI run 39516327790](https://github.com/FlareZ123/experiment-01/actions/runs/39516327790) succeeded. Its raw 16-arm JSON is archived as artifact `agent1-natural-evolution-rank1-rank10-development` (artifact ID 12308222687, 21-day retention). The complete deterministic reproduction program is [agent1-natural-evolution-source-pairs.cjs](../../simulation/evaluation/agent1-natural-evolution-source-pairs.cjs), using pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Registered comparison and same-deal control

Eight fixed seeds, `101, 509, 2026, 7777, 11021, 22111, 33333, 44444`, each ran rank-1 Shadow Rider Calyrex's published 60 versus rank-10 Regidrago's published 60 twice. Both physical seats were native bots whose root decisions came from the common actor-only adapter. The single changed option was `naturalEvolutionRoot: true` for both actors in the second arm. Native generic resolution remained for unsupported prompts. The runner enforced `strictPromptValidation: true` and a **128-action bound** per arm. Each pair asserted identical card-list hashes, physical initial-deal fingerprints, and first-turn seat; all eight controls passed. Engine/manifest/configuration and RNG inputs are fixed in the reproduction program. This is an exploratory, not tournament-competence-qualified panel.

## Native decision evidence

| Seed | Same deal | New evolutions physically confirmed | With evolution: attacks / passes | Baseline: attacks / passes | Terminal outcome |
| --- | --- | ---: | ---: | ---: | --- |
| 101 | Yes | 2 | 0 / 35 | 0 / 35 | Both capped |
| 509 | Yes | 0 | 7 / 5 | 7 / 5 | Both native seat-0 terminals |
| 2026 | Yes | 2 | 0 / 35 | 0 / 36 | Both capped |
| 7777 | Yes | 2 | 0 / 35 | 0 / 35 | Both capped |
| 11021 | Yes | 2 | 14 / 13 | 16 / 12 | Both capped |
| 22111 | Yes | 1 | 8 / 8 | 8 / 8 | Both native seat-0 terminals |
| 33333 | Yes | 0 | 6 / 8 | 6 / 8 | Both native seat-0 terminals |
| 44444 | Yes | 3 | 2 / 32 | 15 / 16 | Both capped |
| **Total** | **8/8** | **12** | **37 / 171** | **52 / 155** | **3 same native terminals, 5 censored pairs** |

The 12 evolution choices were **all accepted and confirmed by a face-up Pokémon-stack transition**. They occurred in six of eight seeds: six Shadow Rider Calyrex VMAX (rank-1 seat) and six Regidrago VSTAR (rank-10 seat), counting the exact logged events across seats. There were **zero rejected actor-root Store actions** in either arm, 307 accepted default roots versus 321 enabled roots, and 100 versus 113 confirmed public root effects respectively. Generic prompt fallback remained **521 default / 508 enabled**, preventing competition-grade game inference.

The two no-evolution seed pairs (509, 33333) had identical action counts, root action-category counts, and recorded native terminal outcomes. This is a limited no-op check; full action-ledger equality has not been established.

## Important negative / model limitations

The enabled policy took **15 fewer printed attack choices**, including a particularly severe difference at seed 44444 (2 attacks against the baseline's 15). This is a **policy-regression warning**, not evidence that evolving Pokémon is strategically bad. Evolution changes available printed attacks, cost requirements and subsequent board choices; the current chooser favors an eligible evolution in hand order and Bench before Active, without damage forecasting, attacker-energy readiness, opponent pressure, or ability-value accounting. The causal action chain for seed 44444 needs a focused public board/attack-declaration trace before prescribing a repair. Not all submitted attack actions are independently authenticated damaging attacks.

Five pairs hit the 128-action safety cap. Three pairs terminated with native seat 0 as winner, identically in both arms. These native terminals do not count as victories in a competent competitive policy benchmark. Even where a terminal occurs, unsupported generic prompt behavior and partial card/rule semantic validation prohibit estimating winning probability. Only two of eight seeds put source rank 1 first, so this small panel cannot support balanced-seat conclusions.

**Qualification: zero games.** The new code demonstrates genuine evolutionary action coverage in full source-dealt games. Its immediate-next priority is a same-deal root/attack ledger examination of seed 44444, then an opponent-visible attack-ready or ability-use priority policy in the existing canonical adapter. Full bilateral source competence, provenance of opponent decisions, Prize effects, 32/32 field availability and paper legality remain unresolved. The 99.5% objective remains a target, never a measured achievement.
