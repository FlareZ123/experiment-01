# Temple of Sinnoh in a fixed Iron Thorns / Mimikyu 60: native dead-slot diagnosis

**Agent12 | 9 November 2026 | Frozen prospective 48-game evaluation, complete.**

Original Aichi Iron Thorns source ranks **6, 24, 29** have no Basic Lightning Energy in their printed 60s. All Energy in those lists is Special (Speed Lightning, Capture, Double Colorless, sometimes Spiky). Their Iron Thorns ex Volt Cyclone attack needs Lightning. Temple of Sinnoh ASR155 converts all Special Energy to one Colorless and removes their other effects. A protected Mimikyu PAL97 with a real Basic Psychic MEE13 plus a Colorless can still use Ghost Eye through Temple. This is a theoretically asymmetric Energy-cost/attacker-lock interaction, subject to Stadium replacement, Pokémon board position and attack sequencing.

**Candidate v2** [fixed 60](../../aichi-2026/candidate-iron-thorns-temple-mimikyu-v2.json) replaced exactly one Player's Ceremony with one Temple of Sinnoh in the prior [fixed Safeguard Pivot v1](../../aichi-2026/candidate-iron-thorns-safeguard-pivot-v1.json). Four Thorns ex and one Mimikyu retained, so both are distinct 60-card contender hypotheses.

## Fresh native outcome

[Precommitted registration](../../aichi-2026/registrations/agent12-temple-mimikyu-versus-safeguard-fresh-20261109.json) held 24 independent original-source rank/seat/seed groups across ranks 6,24,29 (three repeats each seat) and ranks 1,5,13 (one repeat each seat). [Run 42598235709](https://github.com/FlareZ123/experiment-01/actions/runs/42598235709) compiled pinned Store, passed all pure tests and executed all 48 games; full raw archive [13664133816](https://github.com/FlareZ123/experiment-01/actions/runs/42598235709/artifacts/13664133816).

| Native result at 260 roots | Safeguard v1 | Temple v2 |
| --- | ---: | ---: |
| Wins | 7 | 6 |
| Losses | 1 | 0 |
| Right-censored | 16 | 18 |
| Engine errors | 0 | 0 |
| Real Temple of Sinnoh PlayCard roots | 0 | **0** |
| Native declared and settled Ghost Eye | 16 | 2 |
| Volt Cyclone declarations | 38 | 47 |
| Opponent source Volt Cyclone declarations | 46 | 51 |

Only **15 of 24** original source physical deal fingerprints matched across candidates. Just **four** groups were both physically matched and double-terminal. The sharp Temple minus Safeguard native-win count interval is **[-9,+10]** for those 15 comparable source deals. This is much too broad for candidate ranking.

**Actual diagnosis:** the shared native decision policy made **zero Temple plays in 24 Temple-holding 60-card games**. The predicted special-Energy counterline was never executed. Therefore v2 produced no evidence about whether a *played* Temple would deny an opposing Volt Cyclone or whether the opponent could counter it. Merely adding a Stadium does not demonstrate its strategic contribution.

## Executable response

A new default-off, source-independent [public owner policy](../../../simulation/twinleaf/2026-11/agent12-thorns-mimikyu-temple-owner.cjs) acts only against an observed opposing Active Iron Thorns ex with Special Energy actually attached. It uses the actor's own held Psychic, Jet, Temple and visible board to propose: fund Benched Mimikyu, promote via Jet before Temple disables Jet's switching effect, then play held Temple when Mimikyu is Active and has Basic Psychic. It is wired through a default-off hook in [the native root policy](../../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) under explicit `AGENT12_TEMPLE_THORNS_OWNER_DEV=true`. It creates real native PlayCardAction proposals, with the pinned Store responsible for legality, payment and effects.

A **fresh, prospectively registered** [48-game 360-root policy panel](../../aichi-2026/registrations/agent12-temple-owner-holdout-native-20261109.json) uses new random seeds against those same six source ranks and turns the new policy on **identically for v1 and v2**, so differences can be attributed to the printed Temple slot only when the actual original-source physical deal fingerprints match. This distinguishes a policy-level missing action from a card-slot problem. The owner pilot must produce accepted and relevant native actions before its merits can be inferred; any source Pass after Temple is merely observational and cannot establish an attack veto alone.

No native result in this series is qualified for competitive-paper or the 99.5% target. Existing opponent policy, setup, paper-clock and full Top32 field gaps remain.
