# Agent 3 preregistration: owner-visible spent GX attack-name suffix guard on fixed rank11 source pairs

**Registered 22 October 2026 UTC, before modifying selector or starting any matched native game.**

## Mechanism and source hypothesis

The [original four-seed rank11 archive](../agent3-rank11-failure-inclusive-native-store-20261022.md) and [paper full-Bench opt-in comparison](../agent3-rank11-paper-fullbench-four-seed-native-20261022.md) reveal `LABEL_GX_USED` at original seed `2612415444` control accepted-root ordinal 39 (global turn 7) and full-Bench-corrected treatment ordinal 196. The printed `Mewtwo & Mew-GX UNM` `Miraculous Duo-GX` had already been declared during that same game's earlier turn. The frozen actor-root policy in commit `6566bc396fa1bec0d851760fff9f45fe65d005b6` recognizes `attack.gxAttack` but can overlook a printed name ending in `-GX` when its metadata flag is unset. The newer shared main policy independently recognizes name suffixes, but the legacy source branch does not.

**Hypothesis:** A narrow owner-visible root veto for a card attack named `-GX` **only after the player has already used a GX attack, or is explicitly barred from GX attacks**, should replace the invalid later choice by another native typed root while allowing the first legal GX declaration under the frozen former actor policy.

## Frozen original conditions

- Same source rank11 Absol/Garbodor registered exact 60, fixed New Moon candidate 60, source seat0 and candidate seat1, source-first original deals, candidate policy, no clock, `maxRootActions=260`.
- Exact preregistered independent seed cohort **`[17984023, 1407148205, 2612415444, 2584586627]`** and two `source future Energy staging` arms each. Every attempt retained.
- Frozen baseline: the [Agent3 full-Bench branch](https://github.com/FlareZ123/experiment-01/tree/agent3-rank11-fullbench-four-seed-20261022), commit `6566bc396fa1bec0d851760fff9f45fe65d005b6`, [CI 39706991965](https://github.com/FlareZ123/experiment-01/actions/runs/39706991965), [raw artifact 12395865494](https://github.com/FlareZ123/experiment-01/actions/runs/39706991965/artifacts/12395865494).
- Twinleaf engine submodule **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**; no changes to vendor, game rules, prompt selection, Bench hook, manual workflow, input seeds or any non-GX actor decisions.
- Treatment will change **only** the printed GX name-suffix spend/ban predicate inside `chooseActorRootIntent` in `simulation/twinleaf/agent34-actor-only-root-policy.cjs`. Preserve the branch's `printedGxRoot` default and the original legal first-use behavior; when `gxUsed=false` and `cannotUseGXAttacks=false` a name-only GX is still allowed by the historical policy. When either flag is true, name-suffix GX is filtered. The actor's detached view `ownPublic.publicTurnRestrictions` supplies the flags. It cannot inspect opponent hand/deck/Prize or hidden owner deck positions.
- Add a small isolated pure actor policy test for the name-only GX spent and unspent cases; invoke existing native manual CI with `agent50_marnie_native_pair=true`, same exact four seeds.

## Audit, falsification and safety

Compare physical-source deal fingerprints per seed and exact original accepted-root prefix (including prior GX declaration before the bad second GX attempt), first changed action, eventual native errors, action caps, final Prizes and all eight attempted outcomes. Seed `1407148205` should remain exactly unchanged if no previously used GX suffix affects its selected line; record any unexpected divergence. Source seed `2584586627` should retain its unrelated same-target `AttachEnergyPrompt` failure. The GX-spend filter must never **convert a real legal first GX attack into a blocked action**, and owner flags must be observed at the correct turn.

A passing read-only/test native Store packet would demonstrate a specific bot legality fix, **not** a competent policy, a newly certified tournament win, or an opponent-field performance estimate. Do not retroactively delete censor samples or use card-state information unavailable to the acting player. All cases remain **0 competitive-qualified games**.
