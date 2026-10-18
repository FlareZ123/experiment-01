# Rank26 real-deal first-turn policy exposure: preregistered 24 independent source seeds

**Agent 4, 18 October 2026, before execution.** Evidence objective: expose actual opening conditions and source root-action selection rates, without selecting for a successful seed. This is a policy-reachability and competence audit, **not a game-win-rate study**.

## Frozen sample and comparison

Use existing `deriveSlotSeeds(20261105, 'pilot', 26, repeat)` with **repeat 40 through 51 inclusive**, each seat A and B, for 24 actual source deals with distinct 32-bit seeds. This seed domain is separate from the retrospective seed 49957955 and the existing rank26 source-window hunt bases (20261017 through 20261020). Every seed and both seats are included **without regard to starting player, opening Meloetta, opponent Bench, card availability or whether the intervention fires**. Keep a complete record of no-opportunity draws.

Both registered 60s are unchanged: rank26 Meloetta vs rank6 Iron Thorns from `planAichi(26)` under the frozen `allowEquivalentBasicEnergies:true`, `allowJapanesePromoHooks:true` conversion flags. Frozen compiled Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Actual physical ranks and starting seats must be verified by the original engine draw log and a root Store snapshot. The source bot profile is `rank26-autonomous-cologne-pump-propagation-v3` with the same fixed other hooks for both arms.

Each exact deal has a **paired control** (v3) and **intervention** (identical v3 + source-only Mail Scout v1 + first-turn Farewell Letter v1 + DCE reservation late-Lightning fallback v2). Both arms have a bounded `maxActions:120` and strict prompt validation. Interventions may use the **owner hand and public board**, never hidden deck/Prize identities. They do not re-stage source physical cards or insert missing pieces. The control and intervention source action paths can diverge after decisions; equal seed establishes the common initial shuffle, not equal final deck order.

## Primary predeclared outcomes

For all 24 deals record actual first player, whether rank26 was first, both initial Active Pokémon, initial opponent Bench size, rank26 initial owner hand (for auditing, not fed to the bot), and source first-turn action list with separate records for actual Items, Energy attachments, Farewell Letter ability, root attack declarations, and passes. Record exact source-owner Hand/Bench-restricted policy actions and whether the intervention saw held DCE. Count eligible/unexposed source-first conditions with **all 24 deals as denominator**, plus the true source-first subset. A source-second deal is a zero-opportunity for the *first-player Meloetta donk* objective, but remains in the sampling denominator.

Use root observable printed attack/copy-action information where available; never conclude no attack from a missing root `AttackAction` alone because delegated attacks can evade that collector. Record Engine-side Prize counts and `finished` only as supplementary incomplete diagnostics. `winner:-1` or action-limit snapshots must never be counted as a game outcome. A failing source conversion, early lock, no opener or an unexpected chosen action remains an explicit negative observation, without replacing seeds.

## Run and falsification

`simulation/twinleaf/rank26-prospective-firstturn-cohort.cjs` will assert the registered 60 count for each player, pinned submodule, exact seed equality, actual starting-player draw-log validation, deck identity hashes, original root consistency and source profile version. Its JSON will archive all 24 source snapshots and 48 actual engine game-trace summaries. Max total 5,760 engine action steps; this is a controlled manually dispatched workload in the existing `aichi-damage-pump-fidelity.yml` workflow behind a new opt-in input, with no per-commit job and no automatic repeated run. A red assertion is a failed test to be diagnosed, not grounds for dropping a seed.

A successful run establishes a prospective, unfiltered **sample of action-selection exposure** under a partially qualified simulator and generic opponent policy. It does **not** establish that any full deck meets the 99.5% objective or that these source policies reflect elite player performance. Opponent policy, first-turn attack and complete response remain to be audited.
