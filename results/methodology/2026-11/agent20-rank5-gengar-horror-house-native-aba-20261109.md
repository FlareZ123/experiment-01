# Original rank-5 Gengar line: native execution succeeds, immediate GX still loses

**Agent 20 | 9 November 2026 | source-frozen posthoc causal treatment, not a win-rate estimate.**

## What changed in actual gameplay

The first independently capturable rank-5 original Mew Genesect versus fixed New Moon case ended with **zero New Moon attack declarations** and an original rank-5 native win. Its post-Store physical tape exposes a missed three-step printed line. A genuinely held **Psychic Energy MEE, physical card id 113**, went to Active **Tapu Lele-GX GRI** at accepted root **45** on the candidate's turn 4. **Gengar & Mimikyu-GX TEU** was already Benched. Later **Latias ex SSP** entered the candidate's Bench at root **69** on candidate turn 8. Its **Skyliner** Ability publicly provides zero Retreat Cost to that Basic Active; a one-Psychic Gengar can announce **Horror House-GX**.

Implemented the isolated, default-off, owner-only three-step branch:

1. Owner-held Basic Psychic attaches to the public Benched Gengar instead of the stranded Tapu Lele.
2. Once a public Latias with Skyliner enters the Bench, promote funded Gengar by an actual zero-cost native RetreatAction.
3. With unused GX and a paid printed one-Psychic attack, announce Horror House-GX with the actual native Store.

This branch uses only the acting player's exact hand and public board, turn and restrictions. It cannot see opponent hand identities, deck order or Prizes. Both physical seats are eligible under one symmetric policy; the rank-5 source never met the exact Gengar printing condition.

## Three native Store runs under the identical frozen seed

[Existing manual CI **42635056449**](https://github.com/FlareZ123/experiment-01/actions/runs/42635056449) succeeded under pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. Its [complete 3-arm physical and action archive](https://github.com/FlareZ123/experiment-01/actions/runs/42635056449/artifacts/13681449286) has immutable SHA256 of the uncompressed JSON **`abd41ebeef943cd67a75e3bcfaeafeb5ced443c247d6ce584062edd13fe7d2c8`**.

| Phase | Original rank5 attacks | Candidate attacks | Accepted roots | Native terminal / winner |
| --- | ---: | ---: | ---: | --- |
| A baseline | 4 Cross Fusion Strike | 0 | 149 | complete; rank5 |
| B owner Gengar tempo | 4 Cross Fusion Strike | **1 Horror House-GX** | 157 | complete; rank5 |
| A repeat | 4 Cross Fusion Strike | 0 | 149 | complete; rank5 |

Every arm retained the **same original source initial deal**, **same full physical initial deal**, and **settled physical-card integrity**. The two control action ledgers are bitwise identical; both ended with physical Prizes **[0,6]**. B also ended **[0,6]**, so the tested immediate attack **does not overturn this source victory**.

Crucial distinction between the *physical action* and the abstract action record:

- At **root45**, controls and treatment both show `PlayCardAction Psychic Energy` in the abstract accepted-action ledger. Nevertheless the actual physical Store zones **first diverge here**: A moves physical id113 onto Active Tapu Lele, while B moves that **same card** onto Benched Gengar. The opponent's physical state is unchanged.
- At **root70**, the abstract root ledger finally diverges: A `PassTurnAction`, B genuine `RetreatAction`. B physically promotes Gengar Active with Psychic attached, returns Tapu Lele to Bench and preserves 60 actual cards.
- At **root71**, B's genuine `AttackAction Horror House-GX` is accepted, with the native prompt sequence continuing and the opponent taking its next turn. This is a native playable counterline; complete independent paper adjudication remains pending.

The original source's next two turns largely **passed**. Its first paid Double Colorless Energy attack was on its turn13, well after B used GX on turn8. The immediate hand lock was expended before the source's first actually observed threatening attachment. The lock's precise paper implementation is still subject to independent review.

## Reusable code and next strategic question

- Actor-only intervention: [`simulation/twinleaf/2026-11/agent20-gengar-horror-house-tempo.cjs`](../../../simulation/twinleaf/2026-11/agent20-gengar-horror-house-tempo.cjs).
- Three-phase replay: [`simulation/evaluation/2026-11/agent20-rank5-gengar-tempo-aba.cjs`](../../../simulation/evaluation/2026-11/agent20-rank5-gengar-tempo-aba.cjs); [frozen posthoc case registration](../../aichi-2026/registrations/agent20-rank5-gengar-tempo-posthoc-aba-20261109.json).
- Pure constraint regressions: [`tests/2026-11/agent20-gengar-horror-house-tempo.test.cjs`](../../../tests/2026-11/agent20-gengar-horror-house-tempo.test.cjs).
- Existing **manual** native workflow extended with an opt-in mode, preserving normal default-on behavior and vendor code unchanged.

The wider lesson is a concrete policy-capture deficit: an accepted root's action class and card label alone can conceal a **different physical target**, which in turn changes the actual future line. The post-Store physical-zone join is necessary to identify the first true intervention, here root45 rather than root70. A small helper `firstPhysicalDivergence` now reports the first changed physical Store receipt alongside the later action-ledger divergence.

**Next falsifiable experiment:** keep the exact Gengar funding and promotion, but defer the one-use GX until the opponent's **public hand count** reaches six, with an immediate visible-Energy threat override. In the archived original deal, opponent hand counts rose from 4 at turn8 to 6 at turn12, just before the source attached the DCE at turn13. A same-physical-deal A/B/A on that explicitly public timing rule is registered separately. Because this timing threshold arose from examining the original game, it is a **posthoc developmental test**; it must not be treated as an unbiased prospective matchup result.

**Competitive inference: zero qualified games.** Neither the 29/32 source field nor the 99.5% target is altered by this one source-game replay.
