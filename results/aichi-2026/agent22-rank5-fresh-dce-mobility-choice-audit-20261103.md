# Agent 22: fresh rank5 Mew source DCE mobility exposure and copied-attack choice, 16 native attempts

**3 November 2026 | four previously uninspected independently generated 32-bit original physical seed groups, two candidate contexts, two policy modes; zero paper-qualified games.**

## Result and caveat on “attack counts”

Four fresh source-deal seed groups were preregistered before native execution, one in each (repeat0/1, candidate physical seat A/B) cell, with both fixed candidate sixties. On pinned selected joint code, compare the **full 92-option policy** against the same exact selected options with only **`actorDceMewMobilityRoot=false`**. All eight original-source deck/hand/prize physical-deal fingerprints matched between modes and all eight actual starters matched. All 16 native games finished or reached the engineering action cap and were retained, including zero-attack games.

The two policy modes produced **identical complete native root-action ledgers on every one of the eight paired games**. Both had **zero native owner-paid RetreatAction roots** and **39 settled Cross Fusion Strike declarations**, so disabling DCE-specific mobility caused no action change on these newly registered original source deals. The 32-arm exposed-positive causality [reported here](agent22-rank5-dce-mobility-32-native-ablation-20261103.md) is **strongly state dependent**; it must not be extrapolated to all Mew/Genesect games.

**Crucial refinement:** the 39 settled `Cross Fusion Strike` entries are **not 39 proven damaging copies**. Tracing each recorded real root `AttackAction` to the following native `ChooseAttackPrompt` via `initiatingRootActionOrdinal` yields the following per policy-mode distribution:

| Exact copied printed attack selection | Full joint92 | DCE disabled |
| --- | ---: | ---: |
| Benched Genesect V `Techno Blast` | **15** | **15** |
| Benched Mew V `Energy Mix` | **20** | **20** |
| **No recorded ChooseAttackPrompt choice** | **4** | **4** |
| Total settled Cross Fusion Strike roots | **39** | **39** |

The supplied `cards/en/swsh8.json` (Fusion Strike #113) prints `Energy Mix` with **no damage**; it searches for Energy to attach. All **four** no-choice records (turns **3 and 5** for both `5:1:B` candidate contexts) have an **empty source Bench in their actual `publicBoardBefore` snapshot** and no recorded `ChooseAttackPrompt`. They therefore do not demonstrate any copied attack effect. Native `Cross Fusion Strike` may have been declared and ended with no selectable Benched Fusion Strike attack. A full paper-legality assertion about declaring it would require separately applying the supplied rules. These four must never be promoted to offensive source competency. Neither category is evidence of successfully copied `Techno Blast` or game-winning damage. The **previous 32-arm experiment's 17 selected `Cross Fusion Strike` attacks all chose `Techno Blast` in the actual archived native prompt ledger**, so that earlier narrower result has a materially stronger substantive attack-choice witness. This finding exposes why counting only `sourceAttackSettlement.attacks.length` as source “offense” is unsound across arbitrary deals. Owner-policy competence must include the **chosen attack and settled effect**, not only declaration/clock settlement.

## Fresh physical-arm breakdown

| Registered source rank5 arm | Full native Cross Fusion Strike | DCE-off | Joint-mode owner paid Retreat | Genuine copied Techno Blast |
| --- | ---: | ---: | ---: | ---: |
| `5:0:A:champion-reference` | 4 | 4 | 0 | 0 |
| `5:0:A:new-moon-lockbreaker-v1` | 5 | 5 | 0 | 5 |
| `5:0:B:champion-reference` | 0 | 0 | 0 | 0 |
| `5:0:B:new-moon-lockbreaker-v1` | 4 | 4 | 0 | 0 |
| `5:1:A:champion-reference` | 0 | 0 | 0 | 0 |
| `5:1:A:new-moon-lockbreaker-v1` | 0 | 0 | 0 | 0 |
| `5:1:B:champion-reference` | 12 | 12 | 0 | 4 |
| `5:1:B:new-moon-lockbreaker-v1` | 14 | 14 | 0 | 6 |
| **Total** | **39** | **39** | **0** | **15** |

There are 20 Energy Mix selections and four no-logged-attack-choice settlements, mostly concentrated in the two B-seat repeat1 arms. The original complete physical source deal is the same across the two candidate contexts within each group, but candidate decks and their responses differ, so those two rows are dependent; do not treat 8 native attempts as 8 independent source deal draws (the independent group count is **four**). Five of eight selected candidate arms show at least one settled Cross Fusion Strike, but only **three** have selected Techno Blast copies. Of eight, four have no Techno Blast even when they have Mew attacks.

Native dispositions: **seven engine terminals and one 260-action cap per policy mode**, none official-clock- or paper-qualified.

## Source provenance and full evidence

- All four seed integers generated with a real cryptographic RNG via Python `secrets.randbelow(2**32)` before the outcomes: `1671807160` (repeat0/A), `1606870827` (repeat0/B), `3850175175` (repeat1/A), `36879703` (repeat1/B). These do not equal historical positive-seed groups; no native source state from them was inspected before registration.
- [Frozen 16-native registration](https://github.com/FlareZ123/experiment-01/blob/agent22-rank5-options-transport-20261103/simulation/evaluation/agent22-rank5-fresh-dce-competence-v1.json), Git blob **`b662cbf32997c383c4065c30ff1e56ecfd72d0fb`**, committed `f10b9bdbde28080290159ac9092ed2f908006026` before native execution.
- [Successful native CI run 41577868458](https://github.com/FlareZ123/experiment-01/actions/runs/41577868458), pinned executed head **`80d55dfce46db69c1736de3c76304fe0281370ce`**; [full archived actual Store rows and registration artifact **13204622386**](https://github.com/FlareZ123/experiment-01/actions/runs/41577868458/artifacts/13204622386), zip SHA256 **`6cc2318de387ea1eaee88b697c192618bbe6ec8733d48a5f321567e1bbb41a5a`**, JSON uncompressed 23,451,578 bytes.
- [Reproducible registered native runner](https://github.com/FlareZ123/experiment-01/blob/agent22-rank5-options-transport-20261103/simulation/evaluation/agent22-rank5-fresh-dce-competence-v1.cjs). Fixed original rank5 printed60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`; original roster blob `ae773f6201d7aa69d31914dbfee66f3fba692200`; native engine SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; joint selected root runner and native options code unchanged.
- Four seed frames and two copied-attack modes had no retrospective opportunity selection or hidden exclusion: every original candidate pairing included, including no-attack cases and native caps. No runtime manipulation of vendor code.

## Reusable machine-checkable measurement gate

The source AttackAction-to-prompt join is now implemented in a portable CommonJS [audit function](../../simulation/evaluation/agent22-source-copy-choice-audit.cjs) with [eight focused regression cases](../../tests/agent22-source-copy-choice-audit.test.cjs). It distinguishes verified `Genesect V FST / Techno Blast` selections, `Mew V FST / Energy Mix` selections, other copied attacks, missing native copy choices, multiple conflicting copy choices and unqualified cross-epoch attack settlements. It never promotes the chosen attack to full paper-effect or damage proof. The separate exact K0 decision utility module has its own 13 regression cases. A manual-only inexpensive [CI run 41578707511](https://github.com/FlareZ123/experiment-01/actions/runs/41578707511) passed **all 21 unit tests** (13 K0 + 8 source-copy audit) on Node 22, with zero engine build.

## Interpretation for the fixed-deck objective

A DCE-specific rescue is demonstrably necessary on two selected historical source states, and irrelevant to action selection on these four newly generated original source deals. Both statements are consistent; the feature only fires after a specific stranded Active Genesect V / DCE-funded Benched Mew configuration exists. The bigger bottleneck remains a **real strong paper-correct original-source decision policy** and **actual meaningful opponent continuation**. A useful next research direction is a copied-attack choice and realized damage qualification contract: `AttackAction -> accepted ChooseAttackPrompt -> copied attack effects -> KO/prizes -> actual consequential opposing turn`, measured on the same physical source group.

**No candidate improvement, 99.5% extrapolation or competitive win-rate is licensed.** Still 29/32 authenticated original 60s and zero paper-qualified game outcomes.
