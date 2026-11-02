# Agent 27: early final-Bench incidence check uncovers Regidrago prompt blocker

**2 November 2026 | Prospective fixed-seed, bounded original-source native experiment.** This is a bot/engine development audit, with no competitive win certification.

## Design and authenticated scope

Before running the cases, the research script `simulation/evaluation/agent27-early-finalbench-field-scan.cjs` fixed **ten new seeds** `20261105` through `20261114`, each under both rank1/rank10 original 60 seat orientations, for **20 original-source deals**. The owner-only observer checks actual detached native roots with global turn **1–12**, a cap of 110 physical Store actions per deal, exactly one free Bench slot, and at least one alternative held eligible Basic when the baseline has selected some other Basic or action. It records source ranks, owner/public Prize counts, full actor-view SHA, and structural alternatives. It never selects, admits or dispatches the alternative.

[Manual compiled CI 41372101714](https://github.com/FlareZ123/experiment-01/actions/runs/41372101714) passed with the frozen paper Celestial Roar hook and both-seat original policy. [Artifact 13110335656](https://github.com/FlareZ123/experiment-01/actions/runs/41372101714/artifacts/13110335656) contains all 20 rows, not only successfully completed games. All unchanged-source native games share the same source 60 definitions as the prior retrospective development work.

## Result

**Zero** last-Bench conflicts were observed during global turns 1–12 across the 20 attempted deals. Outcomes: **6** engine terminal, **11** capped at 110 actions, and **3** thrown invalid native `AttachEnergyPrompt` results. These are a selected, narrow source-rank and action-window sample with capped histories and correlated mirrored seeds. Zero observations cannot establish the universal absence of an early Bench choice, a low population probability, or the strength of a deck. They do change what is worth prioritizing next: the previously documented four conflicts arose late (turns 41, 45, 49 and 65), and the retrospective three-way native fork did not reverse its engine winner.

All three invalid prompts occurred in the original rank10 Regidrago physical source (rank10 seat0 at seed `20261106`, rank10 seat1 at `20261113`, rank10 seat0 at `20261114`). The headless error says `ATTACH_ENERGY_CARDS`, `sourceZone:'other'`, `sourceSize:3`, `eligibleSize:2`, a single Regidrago V owner recipient, and exact `min:2,max:2`. The returned bot selection violated that native prompt. These are consequential **incomplete games** and must be excluded from any apparent win denominator. It remains necessary to distinguish a bot under-selection, source prompt mismatch or effect implementation bug from a valid paper Energy attachment.

## Next intervention and limits

The repository already has a bounded opt-in `simulation/twinleaf/agent47-minimum-attach-energy-hook.cjs`, which attempts to preserve a valid existing native chosen Energy while filling a minimum-required single-target assignment with the remaining physically eligible Energy cards. It refuses unsupported mixed types, targets and caps, and independently invokes the native prompt validator. Agent27 registered a **paired exact-source diagnostic** `simulation/evaluation/agent27-native-minimum-attachment-source-replay.cjs` for precisely the three failing seed/seat orders. It is being run with and without that existing research-owned hook, with original source inventories, initial full-physical-deal fingerprinting and the same Celestial Roar paper-text correction. The new experiment must determine whether the reported original failure is recovered, whether native physical transfers settle, and which new failures remain. The hook's proposal counter alone does not prove true Store acceptance or a legal complete game.

Current priority: repair and validate this repeated missing decision chain before treating root choices or terminal results as evidence for a 99.5% fixed deck. Original 29/32 exact Aichi source 60s remain known; zero competitively qualified games; the final target is unverified.
