# Agent 13: actor-only copied-attack priority changes native rank-11 sequence

**21 October 2026. Status: bounded, retrospectively selected development case. Zero competitively qualified games.**

## Question and falsification target

The first version of `simulation/twinleaf/agent13-actor-only-choose-attack.cjs` chose the first permitted source/attack pair in a native `ChooseAttackPrompt` from the authenticated acting player's detached observation. A prior compiled source-original rank-11 probe (manual CI [39478615970](https://github.com/FlareZ123/experiment-01/actions/runs/39478615970), artifact 12290176999) showed that all **11 Store-accepted candidate copies** chose `Tapu Lele-GX GRI / Energy Drive`. This did not establish attack-choice quality.

The exact A/B hypothesis tested here is that an explicitly permitted, printed `Gengar & Mimikyu-GX TEU / Poltergeist` can be preferred without accessing opponent-hand identities. This is a *tactical hypothesis*, not proof Poltergeist is stronger or an opponent-hand Trainer-count predictor.

## Code and protocol

- Pure `chooseActorCopiedAttack(input, {preferGengarPoltergeist:true})` preserves native donor indices, blocked menu entries, spent GX restriction and native attack-object identity. It reorders only eligible menu choices and never consults hidden opponent-hand identities or own unknown deck/Prizes. The production/default `false` branch retains first-eligible selection.
- `withActorOnlyChooseAttack` records this exact opt-in selector version. New test `tests/agent13-actor-only-choose-attack.test.cjs` exercises default, opt-in, blocked donor, spent GX and a hidden-hand poison field.
- The two arms execute the same `simulation/twinleaf/agent13-copied-attack-source-smoke.cjs`, printed rank-11 source 60 in physical seat 0 versus unchanged fixed New Moon Lockbreaker 60 in seat 1, original archived seed `1244180408`, source actually going first. The pre-existing autonomous rank-11 source-opener and New Moon Field Blower/low-hand Lillie response remain the same in both arms; source and candidate **decklists are not changed**. Only the opt-in copied-attack menu choice differs.
- Independent per-seat policy RNG isolation was enabled. Native Store validates dispatched selections. The first actual copied-menu selection occurs at ordinal 87 in each arm.
- Manual workflow `.github/workflows/twinleaf-policy-rng.yml` was extended by one optional dispatch switch, not a push-triggered workflow. [Run 39606725148](https://github.com/FlareZ123/experiment-01/actions/runs/39606725148) **passed** at research commit `0adb997618ea7bfd165a621537b4581d60dde5bf`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Artifact **12348349306**, ZIP SHA-256 `40efd30876655ae16d98d903040503286ca81145cfe9be712712f4e41330543e`, contains the **full JSON for both arms**. The step also passed the actor-only pure menu tests and the workflow's existing native regressions.

## Actual result

| Observation | First-eligible control | Public-printed Poltergeist preference |
| --- | --- | --- |
| First donor selection | Tapu Lele-GX GRI / Energy Drive, index 0 | Gengar & Mimikyu-GX TEU / Poltergeist, index 1 |
| First native copied selection ordinal | 87, global turn 8 | 87, global turn 8 |
| Native copied-attack menus / accepts / rejects | 11 / 11 / 0 | 3 / 3 / 0 |
| Full selected sequence | 11 Energy Drive at turns 8, 10, 12, 22, 24, 32, 34, 36, 38, 40, 42 | 3 Poltergeist at turns 8, 48, 50 |
| Native fallback prompts | 149 | 162 |
| Real recorded source action after first selected copy | Yes | Yes |
| Native Store actions | 269 | 300 |
| Native engine terminal | Yes | Yes |
| Final Prize counts [source, candidate] | [6, 0] | [6, 0] |
| Qualified competitive games | 0 | 0 |

The alternative changed the acting player's genuine Store-accepted copied choice and full subsequent action history, but **both arms reached the same recorded untimed engine terminal Prize count**. This is an exposed high-sensitivity decision seam; it does **not** establish a net playing-strength improvement. The default selector's 11 Energy Drives and the candidate option's 3 Poltergeists have different action costs and opportunities, which a separate first-divergent settled-damage and resource study should evaluate.

The Source-first opening, printed cards, seed, first acting physical seat and experiment code were shared. A cryptographic accepted-root prefix equivalence check and independent post-attack settlement comparison **were not in this packet**, so do not use this evidence alone to claim equality of every preceding physical root or a causal Prize delta. The `declarations` payload labels individual copied-attack effects `not-independently-verified`. The separate previously archived Agent 13/37/9 Poltergeist trace has genuine damage evidence under related historical seeds and policies; cross-run effect identity needs an explicit reconciliation.

## Qualification limits and next action

This deliberately reuses a retrospective favorable seed and original source autonomy; the generic opponent policy and 149/162 prompt fallbacks remain unaudited. Paper-rule discrepancies, physical prize-resolution clock, source quality, all other Aichi opponents, and hidden-information parity of **the full integrated policy** remain unresolved. These two arms supply **zero competitive trial successes** and must not be added to any 99.5%-rate denominator.

The most useful extension is one same-checkout, matched first-different-action native public board and settled prompt/effect check, followed by integration into the existing bilateral **both-seat** root-and-prompt common policy under a named opt-in. A literal source-printing preference can overfit and should not be adopted globally merely because the named attack proved reachable.

**Full reproducibility:** source file paths above; workflow run and artifact, exact research and pinned engine commits; source rank 11/seed `1244180408`; original physical seats 0/1; `AGENT13_COPY_POLTERGEIST_PRIORITY` false/true.

## 21 October 2026 follow-up: native effect and first-divergence verification

A fresh run at the exact same two-arm plan, [compiled manual CI 39608031647](https://github.com/FlareZ123/experiment-01/actions/runs/39608031647), **passed** at head `58ecdf1dc5ea9bee281f07bd9e60e669b6f4034c`. The revised artifact **12350046336** is a complete replacement pair (ZIP SHA256 `d596b5d737f86240c891d389f46227b93ecaf434cc07dfe681dd4c85cdd64474`), including a referee-only `poltergeistEffectTrace`. Code-side assertions require an effect window for each selected Poltergeist and exactly the printed `50 × number of opponent Trainer cards in hand` base damage.

**A proven matched first-decision prefix.** In both arms, the deck hashes were exactly `ca1a7ce02983c438146f30bf01f303cf8210836f9e442e0d21a2513850ffcb18` (source) and `99969539010abfa11c4e671a5744ed4d97f23cf2f7f275399ac35f5bc1013c0f` (candidate), actual seat 0 started, source seed remained `1244180408`. The **87 preceding native root records** had identical SHA256 `9502143ca90b8edc490a1d964f24d88a0f0851aad27b45617ed88fc7da34bc4e`. The next copied menu differed at ordinal 87 solely in selected donor/attack.

The alternate's three settled copied attacks produced:

| Global turn / native root | Referee-only source Trainer cards in hand | Printed base damage | Source defender | Resolved candidate Prize reduction |
| --- | ---: | ---: | --- | ---: |
| 8 / 87 | 4 | 200 | Crobat V (180 HP) | 2 |
| 48 / 282 | 9 | 450 | Mega Absol ex (280 HP) | 3 |
| 50 / 297 | 10 | 500 | Mega Absol ex (280 HP) | 1 (only one Prize remained) |

The source Trainer counts and names were read strictly **after the player's decision** for referee measurement; the choice policy never sees them. Store `ResolvePromptAction` windows recorded source-defender removal and prize taking. For the first two copies the Prize reduction occurred during `ChoosePrizePrompt` resolution; for the final copy it occurred on the subsequent `AttachEnergyPrompt` resolution. The latter delayed settlement is exactly why a root-only attack declaration count can misattribute Knock Outs. The existing telemetry explicitly cautions that its printed-HP and source-disappearance evidence does not independently prove every damage modifier or exact knockout causal mechanism; no additional paper-fidelity inference follows.

The control still produced 11 native Energy Drives and the identical ultimate engine Prize state `[source,candidate]=[6,0]` under its unchanged starting deal and policy. The tested donor choice was causally the first change to a matching native action prefix; **it produced a major difference in attack route, with no change to the untimed engine winner**. Stronger source opposition remains a required counterfactual, especially the archived legal rank11 turn-49 Quick Ball reply. Archive these as fixed-policy development results rather than qualified prospective games.
