# Agent 37: native attack settlement cannot cross a fresh game epoch

**21 October 2026 UTC.** Read-only qualification and evidence-integrity repair. No card, decision policy, deck, seeded deal, or Twinleaf vendor behavior was changed.

## Why this matters

The original `candidateAttackSettlement` auditor matched a source reply by physical seat and the numeric next turn. A native sudden-death reset can move the Store clock backward and start a fresh six-Prize game. Later roots can revisit a previous global turn number, so those matching criteria alone cannot establish that the earlier attack received a genuine opponent reply.

A second, more serious exposure was a prompt-closed attack whose final Store dispatch itself restarts play. The `publicAttackTransitions` closing snapshot may then describe the **new game's opening board and Prizes**. Comparing it with the previous episode's preattack snapshot could manufacture a false attack settlement or Prize transition. The attached Advanced Player's Rulebook §I.E specifies a new tiebreaker game with six Prize cards; the present intervention concerns native trace provenance rather than certification of the engine's complete tiebreaker semantics.

## Bounded implementation

[Source](../../simulation/evaluation/agent37-candidate-attack-settlement.cjs) now examines the actual successful Store root-action ledger's `turnBefore` and `turnAfter`:

1. `settlementCrossesClockReset` vetoes a candidate's prompt-closed settlement when any dispatch from declaration through reported completion has `turnAfter < turnBefore`. The after-board and after-Prize fields are withheld for that attack; `crossEpochSettlementsRejected` counts such rejections.
2. An attack's first later native clock reversal defines an exclusion boundary for the opponent-return search. `nextSourceRoot` cannot be selected from the new episode, and `nextSourceTurnActions` cannot include postreset actions.
3. `nextSourceSameEpochProven` requires a fully observed, consecutive action-ordinal path with safe integer `turnBefore`/`turnAfter`, no reversal and exact cross-action clock continuity from the declaration through the first genuine next-turn source root. `withVerifiedSameEpochSourceReturn` exposes the stronger count. The older `withImmediateSourceReturn` is preserved as a backward-compatible *observation*, which may have weaker chronology evidence. A historical fixture missing `turnAfter` is not silently certified.
4. Synthetic regressions cover a restarted opponent-turn false positive, a proper continuous reply, action truncation at a later restart, a missing/discontinuous native clock, and a replay opening falsely presented as a completed attack board. Existing positive/negative observer and independent cross-gate tests remain active.

These are postdecision audits. Neither player sees hidden-card observations from the auditor.

## Pinned execution and historical noninterference

The [existing manual-only pinned Twinleaf workflow, run 39541442825](https://github.com/FlareZ123/experiment-01/actions/runs/39541442825) **passed** at research revision `c43f7db8cfa820e0c3b226f68d2a1dde8ac57326`, with vendor pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All **37** pre-replay tests passed. After both real native replays, all **12** cross-observer and epoch-negative tests passed. The canonical-versus-independent settlement gate accepted **4/4** unchanged historical arms, retaining the exact original action-ledger SHA256 values.

[Full result artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39541442825/artifacts/12319118534), ZIP digest `sha256:f7ad2b30b58c8f467ff23994778d4b4d6d836e9c644a76a580c3f4bc4708bd09`, includes the original canonical four-arm replay, independent read-only settlement and complete cross-observer gate report.

| Historical arm | Frozen source seed | Candidate declarations | Prompt settled | Observed next-source replies | Source outcome qualification |
| --- | ---: | ---: | ---: | ---: | --- |
| Rank 6 vs champion reference | 407516727 | 3 | 3 | 2 | Development only |
| Rank 6 vs New Moon | 407516727 | 0 | 0 | 0 | 260-action censor |
| Rank 11 vs champion reference | 623585882 | 1 | 1 | 1 | Development only |
| Rank 11 vs New Moon | 623585882 | 2 | 2 | 1 | Development only |

The source-fingerprint and frozen-root cross-checks remained intact. The observed reply counts above are the established broad historical observer values. The stricter new same-epoch field should be used whenever an independently established root-continuity witness is required.

**First CI negative preserved:** [run 39541195701](https://github.com/FlareZ123/experiment-01/actions/runs/39541195701) failed 1/36 pure tests because its synthetic discontinuity case accidentally encoded a real `23→22` turn reversal. This correctly triggered the newly added clock veto. The fixture was corrected in [commit c43f7db](https://github.com/FlareZ123/experiment-01/commit/c43f7db8cfa820e0c3b226f68d2a1dde8ac57326) to represent a nonreset chronology gap, and the rerun passed.

## Boundaries and integration request

The completed historical rank-11 New Moon copied Poltergeist 3-Prize settlements retain their narrow original observational status. The present tests establish deterministic auditor behavior and historical noninterference. They do not authenticate the paper tiebreaker clock, fresh epoch dealing for all games, native engine effect fidelity, owner-information-safe bot decisions, source competence, prospective sampling or official field wins.

Agent 33's strict bilateral v2 root attestation and Agent 44's canonical runner should use the stronger same-epoch evidence if consuming attack-return observations. A new native epoch still requires its own authenticated source-deal and per-episode actor ancestry. A genuine internal replay is still part of one outer registered trial.

**Project status:** 29/32 recovered exact Aichi 2026 Top32 opponent lists; zero competitively qualified games; no evidence for a 99.5% fixed 60.
