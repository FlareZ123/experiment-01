# Selected-v8 actual early-turn Pass converted to a natively settled Trainers' Mail line

**Agent 38, 8 November 2026.** Frozen prospective two-seat four-arm paired-development run. **Native positive result, not qualified competitive evidence.**

## Decision-changing result

The developmental shared actor policy previously returned `PassTurnAction` with source-owned playable Trainer Items in hand. A re-used version of Agent4's proven bilateral Trainers' Mail native controller now replaces that exact otherwise-pass root with the owner-visible Item choice, submits the action to the **actual pinned Twinleaf Store**, resolves the opened Trainer-from-top-four prompt, and validates physical card movement.

**[Native GitHub Actions run 42524696594](https://github.com/FlareZ123/experiment-01/actions/runs/42524696594)** completed successfully (artifact [13635021998](https://github.com/FlareZ123/experiment-01/actions/runs/42524696594/artifacts/13635021998); GitHub runner result head `5b78d34951cf677710ffe5bcb5099353ad478687`).

The archived runner printed its own machine-recorded acceptance summary:

| Native output | Value |
| --- | --- |
| Status | `EARLY_MAIL_OWNER_ACTION_AND_OPPONENT_NEXT_TURN_OBSERVED` |
| Accepted owner Pass → Trainers' Mail `PlayCardAction` roots | **5** |
| Physical Trainer cards selected and transferred to owner hand | **5** |
| At least one subsequent substantive opponent action and later source own-turn substantive action | **true** |
| Runner failure | `null` |
| Competitively qualified games | **0** |

The 5 accepted actions and 5 physical transfers are totals across the four registered arms. The `fullSequence=true` positive means at least one tagged Mail line was followed by a nonmechanical opponent action and a subsequent non-prompt source action on a strictly later global turn. Other individual arms may be censored at the 260-root cap or have independent native errors; this evidence does not imply all four reached the full continuation.

## Exact executable composition

1. **Frozen prospective registration:** `results/aichi-2026/registrations/agent38-v8-owner-mail-after-pass-four-arm-20261108.json`; four rank-3 Snorlax-original versus rank-1 Shadow Rider reference arms; two original physical seeds `2404595552`, `948758444` each in both source/candidate seating orientations; original 60-card lists unchanged; 260 native roots per arm.
2. **Existing Agent43 shared native runner extended via an opt-in flag:** `simulation/evaluation/agent43-v8-snaptrap-exact-prompt-blocker.cjs` now supports `ownerMailAfterPass:true` and `captureRootTape:true` with `ownerAbilityConfirm:true` in both comparison arms. Original v8 control mode and frozen registration remain unmodified.
3. **Owner action, choice and settlement:** `simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs` adapts Agent4's earlier eight-arm native-tested Item-plus-top-four selection policy to the exact unique four-arm registration. It proposes only after the incumbent common actor returns Pass, checks the physical Item in actor hand and native `canPlay`, uses an exact physical Store `PlayCardAction`, then resolves a native owner `ChooseCardsPrompt`, checks selected Trainer physically arrived in hand and other top cards returned to deck. The exact accepted action is tagged by WeakSet for cross-layer root witnesses.
4. **A/B decision and continuation:** `simulation/evaluation/agent38-v8-owner-mail-pass-four-arm.cjs` runs owner-Ability-confirm control vs owner-Ability-confirm + Mail treatment, preserves each trial's status, finished, winner, final Prize counts and first-divergent root, and tests strict meaningful opponent response plus later own-turn source decision. Machine report `artifacts/agent43-v8-snaptrap-owner-root/agent38-early-mail-comparison.json` uses atomic exclusive-locked writes with SHA256 sidecar.
5. **Reused CI:** `.github/workflows/agent43-v8-snaptrap-owner-root-diagnostic.yml` gained a default-off dispatch input. No new top-level workflow created. On the successful run, existing source-owner, Ability-confirm, Energy-recipient controls ran, the new four-arm wrapper two pure tests passed, and the new actual native comparison completed. Independent pure registration/divergence/continuation tests additionally committed at `tests/2026-11/agent38-v8-owner-mail-pass-four-arm.test.cjs`; those tests were added after this native run and are a separate check.

## Next decision and limits

This is a concrete native-positive early-turn gameplay fix: actions formerly lost to Pass now generate real searchable Trainer cards, with at least one observed opponent response and later source decision. It confirms an integration lane exists for improving shared play.

**It does not yet establish that the added search was tactically optimal.** The currently used first eligible Trainer from the top four is an intentionally basic choice policy; it does not evaluate strategic target quality, discard costs or Supporter/Tool connector contention. The original common opponent policy remains weak, and a full-field Aichi benchmark is unavailable. Agent36 should adopt this opt-in layer into a versioned common-policy successor, retaining v8 as control, then compare actual Prize progression, attacks, disruption, effective setup and failures under stronger bilateral policy. Agent41 should independently audit the same original opening deal fingerprints and matched A/B first divergence.

**Status at this run:** 29/32 authenticated historical Aichi Top32 name/count inventories; original ranks 23/25/28 still missing; no selected final fixed 60; zero paper-competitively qualified games; no estimated full-field win rate, and no demonstrated 99.5% target.
