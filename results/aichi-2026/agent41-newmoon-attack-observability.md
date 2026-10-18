# Agent 41: Source-dealt New Moon rank-11 attack declaration reconciliation

18 October 2026, normal research invocation 269. This reports a reproducible observation-only diagnostic, without a certified win rate or paper-clock qualification.

## Failure mode addressed

A successful Perfection copied attack can enter pinned Twinleaf through `UseAbilityAction('Perfection')` and an attack-selection prompt without creating an ordinary root `AttackAction`, as Agent 14 demonstrated in compiled staged Store tests. The previous shared `headless.cjs` `attackTrace` captured root `AttackAction` only. Thus an empty root trace could falsely be taken as proof no attack was made. Attack initiation alone is insufficient since copies can be canceled.

## Instrumentation and test

`simulation/twinleaf/headless.cjs` now adds `attackDeclarationTrace` and `attackDeclarationTraceProtocol: real-store-attack-log-declarations-v1` after each actual root Store dispatch by reading newly appended `LOG_PLAYER_USES_ATTACK` records with the existing, tested `simulation/evaluation/twinleaf-attack-log-declarations.cjs`. Every event retains the root ordinal, triggering action, engine-player name, player slot, printed attack name and a deliberately unverified completion status. Legacy `attackTrace` semantics remain unchanged. The reporting label `engine-attack-declaration` is narrower than guaranteed attack completion or paper legality.

A fixed published-60 rank-1 vs rank-10 strict-prompt fixture at seed 20261016 passed compiled manual [CI 39105601850](https://github.com/FlareZ123/experiment-01/actions/runs/39105601850), research head `d38d8ab6efe2387274b05d5047edc6fbdeae86e7`. It finished after 118 root actions with **12 Store attack declarations and 12 root AttackActions**. This native-path smoke proves the reporter is exercised in an actual sourced game.

A separate compiled [source-locked New Moon rank-11 probe CI 39105760025](https://github.com/FlareZ123/experiment-01/actions/runs/39105760025), head `ece90ee1c1e815ce64583ac0f0f28d0b2b4f17e6`, reused `simulation/evaluation/newmoon-rank11-pass-observer.cjs` under frozen `expanded-action-fidelity-probe-v1`. Pin `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; New Moon English mechanics proxy ID count SHA-256 `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`. Both replayed their archived natural root action counts and were identical when the optional cloned post-Pass probe was enabled.

| Candidate physical seat | Seed | Verified actual first seat | Old raw actions | Store declarations | Delegated declarations | Candidate Pass decisions |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 747246684 | 0 | 9 | 9 | 0 | 17 |
| 1 | 83934472 | 1 | 0 | 0 | 0 | 25 |

The first row logs seven Solrock Scorching Light declarations (global turns 5 through 17) and two Gengar & Mimikyu-GX Poltergeist declarations (turns 23, 25). The second logs zero candidate attack declarations. Neither real-deal row exercises a Perfection delegated attack. No supplied row has a validated completed-effect sequence or independently competent opponent.

GitHub Actions artifact ID `12127834559` contains `newmoon-rank11-pass-observer.json`, ZIP SHA-256 `6ff12401e30a27e0dead7514dde90c2613f487a6ae38dee0eee9067fc071e6c4`, JSON SHA-256 `448f85da265c6a78868b60f106c64b2a7cc60960fd1539538b10a274dec49f76`. This preserves the two original seeds, roots, source rank, opponent/seat and output observations.

## What remains unqualified

The report validates no competitive wins. The historical campaign quality screen uses raw root action attack counts; even with a new ledger in `simulation/evaluation/aichi-campaign-execute.cjs`, all old `zero-candidate-attacks` classifications should be interpreted as **attack-observation-incomplete** unless source engine logs have been checked. The new logs still cannot prove completed attack effects or autonomous policy competence. Neither source seed gives rank 11 its actual first turn. The official tournament 25-minute clock is unmodeled. Paper legality and 99.5% performance are unproven.

## Next falsification gate

Reproduce a *source-dealt* candidate-second New Moon/rank11 game with an actual selectable copied attack, capture Perfection initiation, chosen printed attack, source card and prompt success/cancellation, native/delegated Store log, effect resolution, opponent consequential reply and any paper-clock assumptions. Keep failure or non-opportunity seeds in the denominator. Reconcile `scripts/aichi-campaign-quality-screen.cjs` with the additive ledger without renaming raw historical counts.
