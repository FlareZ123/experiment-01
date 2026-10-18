# Agent 17: campaign attack-declaration quality-screen reconciliation

**18 October 2026.** Evidence class: campaign-quality instrumentation and synthetic regression, not proof of competitive play. Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The Aichi published field remains **29 of 32 exact lists**. No independently qualified competitive games or demonstrated 99.5% win rate.

## Problem

The original `scripts/aichi-campaign-quality-screen.cjs` classified `candidateAttacks === 0` and `opponentAttacks === 0` as `zero-*-attacks`. Those counters measure **root AttackAction dispatches**. Mewtwo & Mew-GX Perfection copied attacks may enter pinned Twinleaf via root `UseAbilityAction` and subsequent attack-selection prompt, without a root AttackAction. The completed-source observer now adds separate `attackDeclarationTrace` records from real Store `LOG_PLAYER_USES_ATTACK` events; see Agent 41's `agent41-newmoon-attack-observability.md` and Agent 14's compiled `perfection-delegated-attack-observability.md`.

## Controlled change

- Added `scripts/aichi-attack-observation-reconcile.cjs` to check archived declaration protocol, reported seat, chronological log indices, root action ordinals, player names, attack names, and independently duplicated declaration count fields. A consistent payload is labeled **self-consistent-engine-attack-declarations**. This is an *internal consistency gate*, not authenticated replay or confirmation of completed attack effects.
- Integrated the helper into the shared `aichi-campaign-quality-screen.cjs`. For a raw root-zero count, observed log declarations of one or more now produce `candidate-root-attack-action-undercount` (or opponent equivalent). Logged zero produces `zero-*-logged-attack-declarations`. Unavailable older ledgers remain raw-root-zero observations and carry `attack-observation-incomplete`; malformed newer ledgers receive `attack-observation-integrity-mismatch`. The historical `zeroCandidateAttackTrials` and `zeroOpponentAttackTrials` totals retain their **root-action-only** meanings.
- Added `tests/aichi-attack-observation-reconcile.test.cjs` and additional synthetic full-screen tests in `tests/aichi-campaign-quality-screen.test.cjs`. These explicitly include a root-zero candidate with one genuine-log-shaped delegated declaration, a zero-declaration record, and a mismatched-count record.

## Prospective falsification criterion

Run the existing **manual-only** `aichi-first-game.yml` quality-screen test step at this committed revision, with the default bounded pilot. The inserted synthetic test must classify a **root-zero, log-one** candidate as an undercount, **not** as a logged zero. The separate zero-log synthetic case must classify as a logged zero; a mismatched ledger must fail closed. Existing schedule, source-deck, and historical root-only diagnostic tests must remain passing. Report negative outcomes and unrelated CI failures without treating generic-bot engine terminal winners as competition evidence.

No decklist, engine rule, pinned submodule, RNG schedule or autonomous policy was changed. Engine-declared attacks remain distinct from resolution, inflicted effects, policy competence and the official paper tournament clock. Qualification is still blocked by independently reviewed replay and matchup decision policies, missing 3 source lists and paper timing.


## Root ordinal and opponent follow-on audit (18 October 2026)

The shared campaign quality screen formerly counted mechanism actions directly from a digest-valid trace, even when two entries repeated the same root action ordinal. It now verifies the chronological root ordinal sequence, acting player slots and root action-count bound. Digest-valid but duplicated or out-of-range entries are excluded from action counts and labeled with a distinct lineage-integrity blocker.

Each positive mechanism carries its original root action ordinal and, where captured, a later opponent root dispatch ordinal. A later opposing action remains an observation of chronology only; it cannot prove a consequential tactical response. The audit explicitly leaves original opportunity, detached policy proposals and resolution of attack/card effects as `unobserved`.

Three new synthetic regressions cover valid later-opponent-root evidence, a duplicate with perfectly matching action digest, and a root ordinal beyond the actual action count. [Manual CI 39135372290](https://github.com/FlareZ123/experiment-01/actions/runs/39135372290) passed the existing benchmark test workflow. The current 29/32 source coverage, zero qualified games and unproven 99.5% target are unchanged.


## 18 October: next-turn and terminal consistency addendum

The quality screen distinguishes any later opposing root from the first **non-prompt opposing action on a strictly later turn** (`opponentNextTurnRootActionOrdinal`). A same-turn opposing prompt never establishes this later-turn field. [CI 39136227313](https://github.com/FlareZ123/experiment-01/actions/runs/39136227313) passed.

The quality screen also matches the completed-game reported winner to an observed Store terminal phase transition's `after.winner`. Absent or contradictory evidence is flagged `terminal-outcome-unavailable` / `terminal-winner-mismatch`, with `completedTerminalUnboundTrials` counts. [CI 39136596867](https://github.com/FlareZ123/experiment-01/actions/runs/39136596867) passed. Source records and terminal objects remain user-supplied and unauthenticated. No competitive win-rate evidence changed.
