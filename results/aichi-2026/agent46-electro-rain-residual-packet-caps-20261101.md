# Agent 46: residual Electro Rain packets can require several capped targets

**1 November 2026. Evidence class:** deterministic source-level defect and synthetic pure-policy regression. The new existing-workflow compiled check was dispatched; its run status is recorded separately and must be inspected. No original-source completed game or competitive win-rate inference.

## Reproducible failure

The optional `planElectroRainDamage` previously selected a projected KO subset, then placed any leftover 30-damage packets. Both branches required one recipient to accommodate the **entire leftover amount**. When that recipient did not exist, the method returned `null` even when multiple recipients' combined caps allowed a legal full prompt answer.

In the newly added synthetic test there are nine packets (270 printed attack damage), and three recipient caps of 2, 4 and 4 packets. The best projected KO costs two packets. The residual seven cannot fit either remaining target individually, but `[2,4,3]` respects all three caps, uses all 270 damage and preserves the projected KO. The former algorithm incorrectly returned `null`; the patched code explicitly divides the remainder among available recipients, preferring higher nominal Prize recipients. Tightening the third recipient cap to two packets lowers the combined capacity below nine, and the planner correctly still returns `null`.

The test's `prompt.validate` checks exact total damage and independently enforces each target cap, so it excludes the trivial invalid over-cap assignment. The tests retain earlier printed Weakness/Resistance exemption, Bench Barrier, Tool Jammer, Telescopic Sight and Rolling Iron cases.

## Files and implementation

- `simulation/twinleaf/raichu-prize-allocation-resolver.cjs`: fills unselected targets in existing priority order with `Math.min(remaining, cap)`; if necessary fills headroom on previously assigned targets, then rejects only genuine unallocated remainder.
- `tests/raichu-prize-allocation-planner.test.cjs`: multi-target residual and insufficient-total-cap regressions.
- `.github/workflows/aichi-raichu-electro-rain.yml`: adds one pure planner test step to the **existing manual-only** native regression workflow. No per-commit CI trigger or new workflow.
- Existing original decklists, pinned Twinleaf vendor, default policy, rules hooks and card sources unchanged.

## Current pinned-engine reachability check: negative

**Source inspection after the initial synthetic repair materially limits the result.** Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/alolan-raichu.ts`, constructs **every** `maxAllowedDamage` entry as `card.hp + damage`. All live Pokémon have positive HP, and `damage` is a multiple of 30. Therefore every target's packet cap in `planElectroRainDamage` is **at least the entire packet budget**. The old single-recipient remainder method always has capacity when at least one eligible recipient exists. The new strict [2,4,4] cap geometry is **not reachable through this pinned Alolan Raichu reducer**, so the change is defensive hardening only. It has no evidenced impact on real pinned Electro Rain choice or win rates.

The pinned `ptcg-server/src/game/store/prompts/put-damage-prompt.ts` `validate` implementation also does **not** enforce `maxAllowedDamage`; it checks the exact total damage, target accessibility, player type, and allowed slots. The regression intentionally overrides `validate` to enforce the synthetic cap contract. Thus the previous report's phrase "legal full prompt answer" refers only to this test's stronger per-recipient contract and must never be reported as an actually missed pinned Store play.

No further source-counterfactual testing is warranted merely to prove this unreachable condition. The next research contribution should focus on genuine original-source attack target choices or the shared two-player policy release. This evidence downgrade is deliberate, and the original diff remains a harmless, currently inert capacity-handling change.

## Scope and next falsification

The fixture uses a deliberately synthetic `PutDamagePrompt.maxAllowedDamage` cap geometry. The frequency of such caps in physically possible original rank-4/rank-17 Electro Rain turns is **unknown**, and the generic resolver fallback may already have recovered such cases. Even a verified pure assertion is not a native Store transition.

A live verification should capture the prompt `damage`, all per-target `maxAllowedDamage`, true target printing, player seat and actual native reply. If an original-source prompt contains the counterexample geometry, test fixed same-deal opt-in OFF/ON treatment with Store acceptance, actual KO/Prize transitions, and opponent continuation. Retain negative, censored and rejected cases. The corrected optional target allocator must remain separate from any claims about a released common chooser.

## Benchmark status

The full Aichi Top 32 has 32 identified opposing archetypes and 29 authenticated original final-place 60s. Original ranks 23, 25 and 28 remain unverified. There are zero competitively qualified games, no evidence-selected final fixed 60, and no demonstrated 99.5% rate.
