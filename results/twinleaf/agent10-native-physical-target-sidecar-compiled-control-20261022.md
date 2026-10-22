# Agent 10: compiled canonical physical-target sidecar no-op gate

**22 October 2026 UTC | completed manual compiled validation | historical game diagnostics only.**

## Question and execution

Agent 8 demonstrated that the canonical root-label SHA omits target geometry. Agent 12's opt-in native target witness has pure validation and canonical wiring, but no original Store compiled verification at the time of [their status report](agent12-accepted-physical-target-sidecar-20261022.md). I dispatched the **existing** manual workflow `.github/workflows/rank11-sametarget-source-replay.yml`, setting only `canonical_v2_only=true`, with no workflow edits or extra flag. [Run 39701078703](https://github.com/FlareZ123/experiment-01/actions/runs/39701078703) **succeeded** at pinned shared repository head `49d24feef2b17f604163c7b7535cf12bc5ef0cee` (22 October, 00:40:20–00:42:08 UTC).

The workflow compiled pinned Twinleaf, ran five included groups of pure tests, then launched four historical **source-first** canonical bilateral arms with `AGENT12_SAME_TARGET_ATTACH_DEV=true` and the read-only `AGENT12_NATIVE_TARGET_SIDECAR_DEV=true`, followed by the exact same four arms with the sidecar disabled. Both paired runs enabled `AGENT7_CANONICAL_ACTOR_POLICY_DEV`, `AGENT41_PAPER_SUPPORTER_DEV`, `AGENT41_MANDATORY_OPTION_DEV`, and `AGENT41_SOURCEFIRST_RETRO_DEV`. The workflow asserted equal trial IDs, original source-deal fingerprint, legacy complete root ledger SHA, natural terminal flag, and native winner for every pair. All these assertions passed. Successful arms also required `rootOrdinalLinked=true`, `targetUnobserved=0`, and at least one accepted target receipt. All four arms met these checks.

## Actual Store sidecar receipts

| Historical arm | Accepted PlayCard/Retreat target receipts | Ordinals linked | Sidecar SHA256 |
| --- | ---: | --- | --- |
| Rank 6, champion reference | 7 | Yes | `074f1b69121761736f99f134c89df27bb49f324567988a4a13732d143df8d619` |
| Rank 6, New Moon Lockbreaker | 11 | Yes | `d6f575264253871cdebd618d84dbbd9faf1991239221f05c4d2262ea9707e905` |
| Rank 11, champion reference | 12 | Yes | `7d3d599546608cfb52ccd42cef709d72425d89f3e24b61069d8c04e1ec8b4f03` |
| Rank 11, New Moon Lockbreaker | 21 | Yes | `239542acc98f8be9b03cbeefed283d58e94fe93eb9395aeef71ce6b889e5fe8a` |

All four rows reported zero observer-uncaptured targets and no engine errors. The active sameTarget selection correction recorded **zero modified prompt selections** in these particular four historical games, so this run validates native sidecar noninterference rather than correction efficacy. The correction was validated separately by Agent 42 on an authentic failing seed.

In this historical panel, the rank-6 champion arm ended after 54 accepted actions (native winner physical seat 1), rank-6 New Moon was **censored at action cap 260** (no winner), rank-11 champion ended at 89 actions (native winner seat 1), and rank-11 New Moon ended at 225 actions (native winner seat 0). Do not convert these into paired competitive results. The archive is [artifact 12393048521](https://github.com/FlareZ123/experiment-01/actions/runs/39701078703/artifacts/12393048521), ZIP SHA256 from uploader `eba1d78efffe808d45c9121a0dbb7d8c8ad83eed8bd4dd31488958e7098bd238`. Workflow job `119570188591` contains the printed verification receipts and preserved outcomes.

## What has been established

The existing **compiled native Store** accepted and serialized observer sidecars in a four-arm historical panel. Each target-bearing root had an assigned native accepted root ordinal; the observer left the original source deal, complete root ledger, terminal condition and result unchanged relative to observer-OFF control on that panel. This closes Agent 12's exact historical compile/no-op verification gate.

## What remains open

These are **retrospectively selected, untimed, policy-incomplete** fixture games with weak general actor choices. They do not demonstrate hidden-information safety, physical equivalence for the whole game state, printed-card/paper fidelity, opponent decision competence, or prospective matchup strength. The rank6 New Moon row remained censored. The headless runner's `qualifiesForCompetitiveInference` was false for all four rows; **0 competitive games are qualified**. The target sidecar covers PlayCard/Retreat declared recipients, not all prompt choices or game events. A decisive next falsification is to feed Agent 50's same-seed source-T7/T9 Darkness-to-Active-versus-Bench physical divergence through this actual Store observer, proving the earlier compact root SHA can agree while accepted target receipts diverge.

This report documents verification of an existing Agent 12 implementation. It introduces **no additional runner, policy variant or CI workflow**, and does not support the 99.5% deck target as an achieved result.
