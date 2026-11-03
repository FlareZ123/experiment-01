# Agent 2: paper-paid Muk/Regidrago first-turn line is a rare opening event in two fixed Apex Alchemy 60s

**3 November 2026. 320,000 paired virtual pregame setups; 29 authenticated Aichi originals stratified by source Basic count; no played games or match wins.** This report analyzes a highly constrained *sufficient resource witness* for a first-turn Alolan Muk Ability board followed by a potential second-turn Regidrago VSTAR Apex Dragon attack. The chosen owners are unchanged, registered [Agent43 v0](agent43-apex-alchemy-paper-expanded-v0.json) SHA256 `21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769` (3 Boost Shake, 3 Quick Ball) and [Agent2 v1](agent2-apex-alchemy-shake4-quick2-v1.json) SHA256 `5cd6b0fc7781e1a5a3b29f5a23654750295af89bdc63621f235fbd0c56701fd0` (4 Boost Shake, 2 Quick Ball).

## How the four nested gates differ

| Owner opening resource event | v0 | v1 | v1 minus v0, percentage points | Paired 95% Monte Carlo interval, pp |
| --- | ---: | ---: | ---: | ---: |
| **Funded Muk+Regidrago:** choose initial non-Grimer Basic Active; Boost Shake held and Muk remains in deck; Grimer and Regidrago V each held or reachable by distinct *paid* Quick Ball/Treasure | 15.72164% | 18.01560% | +2.29397 | [+2.20747,+2.38046] |
| Above, also hold Regidrago VSTAR, Double Dragon Energy and a second compatible Energy after all required search payments | 0.64784% | 0.74638% | +0.09853 | [+0.08118,+0.11589] |
| Above, also send a Dragon attack payload to discard by an explicitly funded Pokémon search or by playing a held Battle Compressor targeting a Dragon still in deck | 0.24190% | 0.27509% | +0.03319 | [+0.02273,+0.04365] |
| **Active-Regidrago potential turn-two Apex:** above, with Regidrago V already in the initial seven and selected as initial Active | **0.17336%** | **0.19948%** | **+0.02612** | **[+0.01716,+0.03508]** |

The third row intentionally cannot certify next-turn attack access if Regidrago V is on the Bench without a verified mobility route. The fourth row fixes this by requiring Regidrago V to be chosen as initial Active, kept in play while Boost Shake evolves Grimer on the Bench, and attached to a Double Dragon Energy during the first turn. At the end of that turn, Regidrago VSTAR and a second Grass, Fire or Double Dragon Energy must remain in hand, and a Dragon payload must already be in discard. This suffices for the *card-cost, evolution-age and board-position* resources for an Apex Dragon attack on the following turn **if the board survives and opponent effects do not prevent it**. It is far stronger than the earlier search-only access metric. The event is rare because it deliberately excludes new cards drawn through Abilities, Supporters, and the next turn's normal draw, along with alternate Energy acceleration and attack lines.

All these probabilities are **conditional on a valid initial seven-card Basic opening** and on the scripted source-mulligan/owner-bonus model. The event is a narrow opportunity subset, not the probability of turn-two attack in actual competitive play, a bound on a deck's win rate, or proof that a swap improves a match. Valuable discard donors are counted as mechanically expendable, with no game-specific DCI/AMR protection beyond required line components.

## Source-conditioning and variation

The exact original 29 printed-60 opponent Basic counts are grouped into eight strata: 4 Basics (three ranks), 10 (one), 11 (six), 12 (three), 13 (three), 14 (six), 15 (four), 16 (three). Each stratum supplies 40,000 *paired* candidate setups with deterministic NumPy RNG seed `20261103+sourceBasicCount`; strata are weighted by `rankCount/29`. The virtual simultaneous-mulligan race uses the exact seven-card hypergeometric invalidity probabilities, conditions on the owner's valid Basic opening, repeats opponent mulligans geometrically, and awards the owner **all** offered optional compensation draws. Initial seven, six Prizes, ordinary first-turn draw and extras remain physically disjoint. The same one-for-one physical slot in both candidate decks is Quick Ball in v0 and Boost Shake in v1, with 59 identical card objects in the same virtual order. Both registered 60s contain exactly 12 Basic Pokémon and 10 Energy. Real attached cards, actual two-player Store transitions and official Aichi match clock have **not** been observed.

| Original source Basic count | Original ranks | Chance owner offered any bonus | v0 strict Active line | v1 strict Active line |
| ---: | ---: | ---: | ---: | ---: |
| 4 | 3 | 54.89% | 0.682% | 0.790% |
| 10 | 1 | 22.02% | 0.158% | 0.193% |
| 11 | 6 | 18.80% | 0.118% | 0.152% |
| 12 | 3 | 16.01% | 0.133% | 0.145% |
| 13 | 3 | 13.60% | 0.100% | 0.103% |
| 14 | 6 | 11.52% | 0.105% | 0.115% |
| 15 | 4 | 9.73% | 0.100% | 0.110% |
| 16 | 3 | 8.19% | 0.130% | 0.145% |

The paired interval reflects finite virtual opening sampling under this **specific model**, excluding source roster uncertainty (original ranks 23/25/28 are absent) and excluded game actions. Even the model's positive v1 strict-line difference is not evidence of superiority: the separate [Agent2 known29 broad either-lock+attacker census](agent2-alchemy-known29-mulligan-field-20261103.md) found **v0 41.5883% versus v1 37.4684%** on that different, more inclusive opportunity objective. These metrics favor different strategic axes, and neither accounts for actual opponent play.

## Reproducibility and checks

- **Source:** [paired Python runner](../../simulation/evaluation/agent2-alchemy-paid-muk-turn1.py); reads the two immutable registered printed 60s and the 29 authentic original 60s. The source Basic-rank census is fail-closed, and candidate construction asserts exact 60 counts and the one Quick Ball / Boost Shake substitution.
- **Tests:** [11 deterministic local regression cases](../../tests/agent2-alchemy-paid-muk-turn1.test.py) include two distinct search donors, preservation of Compressor rather than illegally consuming it as search cost and simultaneously playing it, Prized Muk, invalid Active geometry, missing Double Dragon Energy, Dragon donor routes, canonical one-card physical coupling, exact four-Basic source bonus probability, seeded replay and four-gate monotonicity. All 11 passed locally with a category-identical reconstructed candidate fixture and synthetic source inventories having the independently confirmed 29 Basic counts.
- **Remote manifest check:** an independent GitHub connector fetch verified both original registered manifests carry 60 physical cards each, 12 Basics each, and differ only by Quick Ball 3→2 and Boost Shake 3→4. This was a source-inventory check, **not** a compiled Twinleaf run or a full repository CI validation.

The proper next test is a **selected, paper-paid, symmetric two-seat native policy** that can actually choose among these constrained Muk and Budew lines, preserve Energy/Active targeting, produce characteristic attacks and survive opponent continuation. Earlier research and the current integration roadmap have not yet established such competitive qualification. Do **not** advance either candidate to a selected strongest deck from these resource incidence numbers. The objective remains one legal, fixed 60 against all 32 original opponents, with **zero competitively qualified games** as of this report.
