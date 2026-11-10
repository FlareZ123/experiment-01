# Agent8: one-DCE-short Mew VMAX funding repair (10 November 2026)

**Status:** committed owner-public source-policy correction and regression, with eight independently executed pure decision cases; **no native winner or paper qualification claim**.

## Decision that was missed

The prior `chooseMewDceRecipient` in `simulation/twinleaf/agent26-owner-visible-mew-dce-recipient.cjs` chose only Mew V/VMAX targets with exactly zero attached Energy cards. If the source fielded a Mew VMAX FST with one attached Basic Psychic (one unit), a held Double Colorless Energy SUM could pay its printed two-Colorless `Cross Fusion Strike` on the current turn, but the helper ignored that target. With an empty Benched Mew V, the same helper would instead fund the distant unevolved Mew, delaying the available attack and risking Energy loss before evolution. This is a concrete intra-turn resource-allocation failure, independent of any win-rate speculation.

Card-pool basis: `Mew VMAX` FST / Fusion Strike 114 has `Cross Fusion Strike` with two Colorless in its printed cost and `Max Miracle` with two Psychic. The correction does **not** mislabel the colorless DCE as two Psychic for Max Miracle.

## Code and decision boundary

- `simulation/twinleaf/agent26-owner-visible-mew-dce-recipient.cjs` now checks visible partially charged Mew VMAX FST targets *before* zero-Energy Mew targets, retaining the source-owned existing `mewDceRecipientRoot` opt-in in the shared actor root.
- Exactly named `Cross Fusion Strike` must be publicly visible, the effective cost must be known, existing printed attached Energy must be fully modelable, and the held DCE must change a positive deficit into zero. The evaluator uses the existing `specialEnergyUnits`, `missingEnergyUnits`, and `effectiveNativeAttackCost` helpers, including supported public Stadium cost modifiers.
- Active Mew VMAX wins a tie over Benched Mew VMAX. Already payable VMAX attacks receive no additional DCE priority. Unknown Energy printings are excluded; Temple of Sinnoh and once-per-turn attachment gates remain blocking. The prior protection for another Active's immediate DCE-funded damaging attack remains.
- The owner root retains printed and visible inputs only. No information about unsearched decks, hidden Prize cards, or opponent hand is consumed. The native Store must still approve the actual attachment and copied-attack sequence.

Patch commit: [`dc8883a8`](https://github.com/FlareZ123/experiment-01/commit/dc8883a8fff23f4043414334efb3ab6d835d5196). Regression commit: [`94d9f308`](https://github.com/FlareZ123/experiment-01/commit/94d9f308949a1ebe18d2d407240bc41ad5f2bc7b). Test file: `tests/2026-11/agent8-mew-partial-dce-funding.test.cjs`.

## Executed decision-level checks

The actual fetched post-commit helper and both actual imported public-cost modules were executed in a deterministic isolated JavaScript test harness using restricted stubs for native-free imports, not a Twinleaf Store. All **8/8** executed test cases passed:

| Public state | Selected owner target |
| --- | --- |
| Benched VMAX one Psychic; another Mew V zero | Benched partially funded VMAX |
| Active VMAX one Psychic; Benched Mew V zero | Active partially funded VMAX |
| Active VMAX two Psychic; Benched Mew V zero | Benched zero-Energy Mew V |
| VMAX with unsupported Special Energy | Other zero-Energy Mew V |
| Dimension Valley makes Active one-Psychic VMAX Cross Fusion payable already | Benched zero-Energy Mew V |
| Temple of Sinnoh present | No DCE proposal |
| Other Active's 210-damage attack becomes payable using DCE | No Mew diversion |

The **exact committed eight-case `node:test` source** was also executed in a V8 CJS sandbox using restricted import stubs: **8/8 passed, 0 failed**. The missing-`Cross Fusion Strike` and exhausted once-per-turn Energy gates both passed. **The exact committed eight-case test has now also passed under Node.js 22 in [manual GitHub Actions CI 42732351184](https://github.com/FlareZ123/experiment-01/actions/runs/42732351184): one focused job succeeded and all unrelated/native jobs were skipped.** The pinned Twinleaf Store has not been run for this patch. The isolated harness is a code-level witness, not a compiled Store acceptance test.

## Authentic rank-5 source exposure correction

After implementation, the authentic original rank-5 Yamato Nakano Mew/Genesect 60 was checked directly in `results/aichi-2026/full-decklists.json`: it contains **four Double Colorless Energy SUM and no other Energy cards**. Under its ordinary unmodified card pool, an attached DCE already pays Mew VMAX's two-Colorless Cross Fusion Strike, and an unattached VMAX has zero Energy cards. A partially funded VMAX carrying one known *Basic Psychic* cannot arise through normal attachment in that original list. Temple of Sinnoh suppresses DCE's extra unit, but the helper expressly avoids Temple because its proposed attachment would not furnish two Colorless.

**Therefore the new partial-VMAX branch has no demonstrated reachable state for the authentic rank-5 source 60.** Its test proves a bounded generic code correction only. Historical v6 source attacks and native wins cannot be credited to it, and prospective rank-5 experiments should focus on actually available Bench/search/attachment/prompt decisions. The source's zero-energy Mew to DCE recipient guard still has its previously demonstrated genuine Store effectiveness. The branch is default inert unless a modelable partially funded VMAX is seen.

This new information **supersedes** any earlier suggestion in this report that partial-VMAX funding itself is a meaningful original-rank5 source opportunity. This limitation is the basis of the separate prospective owner Bench prioritization investigation.

## Decision for future source policy

Any prospective rank5 original-source or full-field panel enabling `actorMewDceRecipientRoot` after this commit has altered Mew VMAX targeting semantics versus previously recorded v6 code. It must be tied to its new running code revision. Do not re-label prior v6 outcomes or compare different policy revisions as identical.

For an integrated native trial, collect the actual original owner’s held Double Colorless Energy, Mew VMAX attached Energy and attack-cost state, Store-accepted recipient, complete subsequent `Cross Fusion Strike` copy prompts, target, donor, source Prize change and opponent reply. Capture negative/no-op cases and all fresh registered attempts. If this opportunity is absent in fresh games, classify as *not encountered* rather than a failed attack. Paper legality and external review remain independent.

This is a **source-competence improvement** for the benchmark rather than a new finalist deck. The collective fixed-60 and 99.5% outcome remain unselected and unsupported.
