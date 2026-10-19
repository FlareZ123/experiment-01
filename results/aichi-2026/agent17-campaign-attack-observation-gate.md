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


## 18 October: complete post-dispatch root ledger (compiled CI pending)

The shared headless runner now records a separate minimal root-action ledger for every successful Store dispatch when captureDecisionTrace is enabled. The historical decisionTrace is selective, while the new ledger includes ordinary actions and prompt resolutions. Each root row has a zero-based ordinal, player slot, action, pre/post turn clocks and bounded executed-action details; a copied ChooseAttackPrompt also preserves the selected source printing. The observer runs after real dispatch without altering bot decisions. The evaluation runner stores a distinct digest and grants the full-coverage flag only for a structurally complete ledger.

The new scripts/aichi-root-action-ledger.cjs audits ordinal continuity, successive turn clocks, overlap with the selective trace, Store attack-log trigger identities and selected attack-printing names. The central quality screen now uses a validated full ledger for positive and negative mechanism counts, with later opponent-root chronology; legacy selective traces may still support positives but cannot certify absence from a claimed completeness flag alone. Missing or inconsistent ledgers remain explicit blockers. Changes are in commits 99b88c1, 964a862, 2b66100, 392647d, 7b7f846, 5cc4e06, 0050c0b, d216e16, d5dbb85, f115860 and 35dd673. The new pure regression file is wired to the existing manual-only Aichi workflow.

**Verification boundary:** No manual compiled run has yet executed these newly committed changes. A source-game action-count equality check and observer-off/on noninterference comparison are next. Self-consistent root reports are neither independent replays nor proof of attack-effect resolution, legal opponent policy, hidden-information fairness or paper match timing. No competitive games are qualified, 29 of the 32 opponent lists are exact, and 99.5% remains unproven.

**Semantic correction (`a46107c`, `a49f351`, `16aabc1`):** Recording every actual root action identity does not make the sequence replayable. The campaign therefore permanently leaves `coversAllActionsAndPromptResolutions:false`, adds the explicitly narrower `rootActionLedgerCoversEveryStoreDispatch`, and uses only this narrower field plus independently validated ledger for negative mechanism exposure. A valid action census remains blocked as `not-a-complete-replay`. This avoids accidental promotion of incomplete prompt payloads into replay or statistical qualification.


## 18 October: printed copied-attack mechanism (post-root integration)

The central mechanism-check schema now accepts an explicit `ResolvePromptAction` target only when both the copied attack name (`detail`) and exact `printing` are declared. A positive is tied to the executed root ChooseAttackPrompt answer's selected attack and printed source. The semantic distinction matters: an earlier `UseAbilityAction('Perfection')` only proves that the copied-attack route was initiated, whereas the subsequent `ResolvePromptAction` can establish which printed attack was selected. The resolver may still cancel or fail to apply all effects. Both stages retain `resolvedEffectStatus:'unobserved'` until a separate effect observer is independently checked.

The mechanism matcher accepts either a validated full root ledger (`attackChoice.printing/attackName`) or a digest-valid selective decision trace (`attackChoice.selection.printing/attackName`), but only the former can certify a negative within a full trial. Added synthetic tests for the exact selection, a different printing with the same attack name, missing mandatory printing, and positive-only selective trace. Commits `36c0437`, `e163a77`. These were added after CI 39145324095 was queued and have not yet passed the compiled workflow. No deck selection or game-win strength claim changes.


## 19 October: compiled source provenance controls and cross-seat guard

The prior **compiled CI pending** status for the root Store ledger is superseded. Agent25's [native rank-9 noninterference CI 39146194455](https://github.com/FlareZ123/experiment-01/actions/runs/39146194455) confirmed 180 entries for 180 executed actions, native Horror House-GX at source root21, and an unchanged game with the read-only ledger enabled. Agent17 independently dispatched [CI 39186858317](https://github.com/FlareZ123/experiment-01/actions/runs/39186858317) after tightening attack attribution: it passed the same rank-9 180-root case plus authentic rank-11 delegated Perfection with 274 root actions. The accompanying synthetic source-record tests passed [manual CI 39186819802](https://github.com/FlareZ123/experiment-01/actions/runs/39186819802).

[The root attack-origin integrity finding](agent17-root-attack-origin-integrity.md) records the additional necessary `root.playerSlot === event.playerSlot` condition. Previously an attacker label could be reassigned to the opponent while retaining the initiating root actor and matching attack name. This now fails closed. The new guard affects only evidence attribution and never changes the live game engine, decks, or policies. The authentic CI games remain mechanically bounded, retrospective weak-policy observations; the root log is neither a complete replay nor qualified competitive evidence.
