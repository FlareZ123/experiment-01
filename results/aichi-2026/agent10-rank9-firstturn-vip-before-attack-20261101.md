# Rank9 source: first-own-turn VIP Item preempts a real Thunder Wave and still permits that attack

**Agent 10 | 2026-11-01 | retrospective, original native physical-deal mechanism test | 0 competitive-qualified games**

## Motivation and existing reuse

The original-source rank9 Shun Ito Absol/Electrode [baseline](agent10-original-rank9-absol-electrode-native-20261101.md) and same-deal [ordinary evolution fork](agent10-rank9-symmetric-natural-evolution-retro-20261101.md) exposed an exact root-contention problem: original rank9 source had *two held Battle VIP Pass FST* on its first owned turn (global turn2), active Voltorb ROS, free Bench, and instead chose its immediate **Thunder Wave** attack, ending its first turn. The earlier verified [Agent9 owner VIP-after-Pass](agent9-original-32-vip-native-source-coverage-20261029.md) deliberately intercepts **Pass only**, so does not repair a root already choosing a valid attack. Do not count those rank11 original source tests as evidence that this rank9 first-turn line was playable under the frozen policy.

Developed a **default-off, owner-only, both-seat VIP-before-first-attack adapter** [agent10-battle-vip-before-attack.cjs](../../simulation/twinleaf/agent10-battle-vip-before-attack.cjs). It observes the original actor-only `AttackAction` choice, checks the acting owner's own held VIP, first-turn legal time window, publicly open Bench and Item lock, proposes exactly one genuine `PlayCardAction` before the attack, then uses Agent9's existing **native owner-deck `chooseVipPromptCards` selection** to resolve original `ChooseCardsPrompt`. The native Store validates action and search. It observes public deck/Bench physical deltas and restores both native prototypes. No special rule reads opponent concealed cards. This is an action-opportunity patch and deterministic selector, not a qualified opponent player.

The adapter is installed **after** the canonical root decoder and therefore can see a genuinely proposed Attack and insert a legal Item into the same source turn; the original Attack remains available afterward. The shared `actorVipBeforeAttack:true` option in the original [common bilateral v2 runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) is **false by default**, as is the option in [canonical actor composition](../../simulation/evaluation/agent7-canonical-actor-composition.cjs). Its two [native-shaped mocked tests](../../tests/agent10-battle-vip-before-attack.test.cjs) verify the printed first-turn gate, owner prompt, physical movement, continuation to the original attack and hook restoration.

## Original source, registration and compiled Store

The actual native evaluation reuses **the same four independently preregistered rank9 arms**, seed 3060075246 candidate A, 690229661 candidate B, once with each unchanged champion-reference/New Moon 60. Same source original printed deck, same setup bonus, same pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, same frozen v2 base policy. The **only policy factor relative to the previous [evolution-ON treatment](agent10-rank9-symmetric-natural-evolution-retro-20261101.md)** is the new symmetric first-attack VIP root option. Ordinary natural evolution stays on in both arms.

Native driver [agent10-rank9-early-vip-evolution-counterfactual.cjs](../../simulation/evaluation/agent10-rank9-early-vip-evolution-counterfactual.cjs), [one-factor registration test](../../tests/agent10-rank9-early-vip-evolution-counterfactual.test.cjs), the existing manual-only [GitHub Actions run **41340110972**](https://github.com/FlareZ123/experiment-01/actions/runs/41340110972) **PASSED**, artifact ZIP **13096763510** SHA256 `7f643cbd858c2b5575524e7f13259a9702d381975c3ec5a493f9709b2f07d1fe`. Complete JSON contains all four root ledgers, original native target and owner search receipts, source/candidate attack settlement, preexisting native prompt audits and one source abort-free 4-arm disposition. The previous no-VIP evolution control is [run 41339009194](https://github.com/FlareZ123/experiment-01/actions/runs/41339009194), artifact 13096871120, SHA256 `54350c55cee2a86da7663364ce750b646b1c0edb9a805962eb7872693fe2e16a`.

## Full same-deal before/after rows

| Rank9 source seed, candidate seat and fixed opponent | Evolution ON, VIP off | Evolution ON, VIP before first Attack | Source VIP Item / owner search / physically confirmed Bench |
| --- | --- | --- | --- |
| 3060075246 / A / champion | 260-root cap | 165-root candidate engine terminal, seat0 took all 6 Prizes | **1 / 1 / 1**, 2 source Basics arrived |
| 3060075246 / A / New Moon | 260-root cap | 260-root cap | **1 / 1 / 1**, 2 source Basics arrived |
| 690229661 / B / champion | 103-root candidate engine terminal | Same 103-root candidate engine terminal | 0 / 0 / 0 |
| 690229661 / B / New Moon | 260-root cap | 260-root cap | 0 / 0 / 0 |

**All 4/4 full two-seat physical initial deal fingerprints exactly match** the evolution-ON control. There are **two distinct original source physical deals**, one per seed, and **one distinct rank9 source opening with a successful VIP correction**: the shared A source opening is repeated across the two candidate 60s. First starting player verified via native coin and first-draw receipt, source starts second in both A cases and first in both B cases. All four treated native games passed settled physical-zone integrity. Winner disposition is a **native outcome**, not official paper match outcome or a comparative win probability.

## Causal original root and continuing attack

On both A candidate games the authentic original owner source roots first agree with control through accepted native root ordinal16: **source seat1 attaches Prism Energy ASC to Active Voltorb** at global turn2.

- **Control** source root ordinal17 immediately announces **Thunder Wave**, and the attack ends the first source turn.
- **Treatment** source root ordinal17 is an actual **Battle VIP Pass PlayCardAction**, replacing that first attack proposal. Native original owner-deck `ChooseCardsPrompt` resolves at ordinal18, followed by a `ShuffleDeckPrompt` ordinal19.
- The genuine source search chose **Toedscool PAR** and **Dedenne GX UNB**, with both exact physical Basic card objects moving from the original source deck to two empty Bench slots. Deck length **46→44**, Bench occupancy **0→2**, native action and prompt accepted with no unresolved search.
- The source still announced its **Thunder Wave** attack at root ordinal21 on that **same global turn2**, demonstrating Item insertion preserved its one allowable attack. This is a real multi-step action sequence rather than a synthetic staged hand with scripted effects.

The native audit reports for each A arm `acceptedItems=1`, `acceptedSearches=1`, `physicallyConfirmedBenchSearches=1`, `unresolvedSearches=0`. No treatment source VIP Item appeared in the B source-first games, preserving other actions. All 4/4 original Store arms ran to native cap/terminal, no unhandled error. These two positive game-arm item traces share one source physical deal, so they do not establish a two-deal empirical success probability.

## Immediate consequences and unresolved line contention

With first-turn VIP, the source's existing ordinary evolution adapter naturally accepted **Toedscool→Toedscruel at global turn4** on both A arms, rather than the prior treatment's **turn20**. This was supported by earlier direct Bench placement. The source then produced additional ordinary attacks:

| A native source case | Same-seed evolution-only source attacks | Evolution+VIP source attacks |
| --- | --- | --- |
| Champion | 19 Thunder Wave + 1 Hidden Power | **10 Thunder Wave** |
| New Moon | 19 Thunder Wave | **15 Thunder Wave + 11 Dedenne GX Static Shock** |

The source did **not** dispatch Extra Energy Bomb, a natural Mega Absol attack, or a printed Toedscruel attack in these two replays. Agent9's reproducible VIP search target ranking favors a Basic with a held Stage1 followup, then considers other printed Basics. Here it chose **Toedscool and Dedenne GX** rather than the original source's **Mega Absol ex**. The two Bench additions increase physical setup, but might also expose multi-Prize Bench liabilities and consume slots required for a different ALS. **More Items and earlier evolution are proven; stronger opposition or an improved candidate win rate are unproven.**

All relevant source first-turn prompts and forward play remained engine-consistent. However the entire native game still lacks paper-compliant hidden-hand Night Watch random choice, independently qualified opponent decision quality, a complete ability/attack module across all original source cards, official 25-minute Swiss/Top32 adjudication, and 32 original opponent printed 60s (still 29 authenticated). Source win qualification **0**, candidate competitive win qualification **0**, and no 99.5% evidence.

## Follow-on research priority

The new positive on one source opening distinguishes three separate capabilities required for a competent original rank9 adversary: (1) search/play real first-turn Bench from the correct owner-deck prompt, now proven under this option; (2) evolve the required pieces, now proven for Toedscruel/Electrode on related same-source deals; (3) assemble a decision-quality **Electrode-GX Extra Energy Bomb → Mega Absol ex** continuation with correct discard availability and Prize trade, **not yet shown naturally**. Source-opponent root policy should choose VIP targets based on *owner-registered source lines*, while preserving hidden-information safety, natural availability and independent tests. The [earlier pinned staged Electrode recipient test](agent7-rank9-electrode-mega-recipient-staged-pinned.md) demonstrates a possible five-Energy destination, not this source-dealt ALS.
