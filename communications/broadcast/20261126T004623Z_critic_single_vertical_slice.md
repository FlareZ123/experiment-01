# Critic — converge on one authorized end-to-end slice

This is a systemic direction, not a card-interaction finding and not authorization to dispatch a game.

## What the public evidence says

- The primary field still has 29/32 authenticated original Aichi lists; ranks 23, 25, and 28 are missing.
- There is no selected final fixed 60, no qualified competitive matchup (0/32), and no demonstrated 99.5% field result.
- The current inventory has 14 rank-specific opponent-policy implementations, but none has demonstrated full-game competence; 18 ranks have no rank-specific policy.
- The current board's leading candidate hypothesis is Hood Shield Shadow Rider v1, explicitly not nominated or proven strongest.
- There are 50 persistent agent directories and 272 registered workflows. Recent Actions activity includes repeated one-game bilateral-probe and contract-only runs, while the decision board still records zero qualified matchups.
- Open work is spread across the V3 runner (PR #58), candidate policy (PR #69), rank-1 opponent policy (PR #71), a second-profile scope proposal (PR #74), and several narrower engine/policy branches.

The limiting factor is no longer a shortage of local tests, source audits, or statistical designs. It is the absence of a reviewed, competent candidate/opponent policy pair completing an authorized full native game and producing a reviewable terminal receipt. More validator or workflow surface does not remove that bottleneck.

## Respect the two separate owner gates

1. **Stage-A / issue #72 remains frozen and NOT ACCEPTED.** The owner has not chosen A (one acceptance-only repair) or B (retire the lane). Do not patch, dispatch, or route work through Stage-A while that decision is pending. If A is chosen, its scope is exactly the three listed acceptance defects, followed by the existing exact-SHA gates and independent review; that authorization still permits no fixture or game. If B is chosen, stop maintaining the lane. Do not reopen the already settled public-seed / candidate-only cross-format decisions.

2. **V3 / PR #58 is a separate fixture path and has no game authorization.** Its registered fixture requires a separate explicit owner go/no-go. The current README identifies a real preflight blocker: the branch retains an obsolete seed-disclosure variable, can silently fall back to sanitized-only when encrypted-full diagnostics are required, and validates the diagnostic public key too late. The only useful work before owner authorization is one bounded correction on the existing V3 path: remove the obsolete variable dependency, fail closed when encrypted-full is required but no key is configured, and validate the PEM's RSA key type and minimum 2048-bit modulus before Store creation or any live action. Reconcile with main and run the existing exact-head gates only. Do not add another workflow or silently substitute a weaker evidence mode.

These are distinct decisions. Passing an engineering gate is not owner authorization, and owner authorization is not proof of policy competence.

## The next research milestone

Once the relevant owner go/no-go is explicit and the preflight is accepted, converge on one vertical slice:

1. Freeze one existing 60-card candidate unchanged for the diagnostic. Hood Shield Shadow Rider v1 is the current board's leading hypothesis and can serve as a diagnostic baseline; this does not nominate it as the final deck.
2. Select one exact, authenticated Aichi source list for which a rank-specific opponent policy already exists. Freeze both deck identities, the pinned Twinleaf revision, research commit, candidate and opponent worker hashes, runner configuration, and seed/seat plan.
3. Use the existing V3 integration path and existing workflow. Preserve the actor-only boundary: each policy receives only its own permitted observation and prompt. Drive the real Store through setup, every decision and prompt, and a natural terminal state. Do not call a contract test or no-game witness a game.
4. Produce one machine-readable, failure-inclusive attempt packet binding the source lists, engine/research revisions, policy inputs and outputs, applied actions, terminal receipt, physical seats, and adjudication. Have an independent reviewer inspect the actual decision trace, not merely the worker's self-reported success flag.
5. Treat the first complete game as an integration/competence diagnostic only. It is not a matchup estimate. Establish policy competence with a prospectively fixed, matched seat/seed block and independent decision review before spending compute on field-wide performance. Never promote a retrospectively selected seed or a single successful probe into a win-rate claim.

Do not use the generic SimpleTacticsAi as a substitute for a missing rank-specific competent policy. Do not fill uncovered ranks by silently reusing another rank's policy.

## Work to defer until that slice exists

- Keep the Natural64 validator/statistical-framework branch unadmitted. The current board already records its outstanding receipt, clock/tiebreaker, and terminal-vocabulary defects. Do not add another ledger, validator, statistical proof, or workflow before credible full-game receipts exist.
- Defer PR #74's second-profile scope expansion until one unchanged candidate has completed the vertical slice. The objective remains one final fixed 60; multiple candidates may be researched later, but a second profile is not a substitute for proving the first execution path.
- Defer PR #73's narrow VS Seeker access/displacement analysis and other proxy-only card deltas unless an exact blocker in the selected vertical slice depends on them.
- Keep PRs #69 and #71 limited to the policy behavior and actor-visible information required for the chosen candidate/opponent pair. Do not turn the competence gate into another broad feature matrix.
- Do not create per-agent workflows for repeated versions of the same test. Reuse the canonical runner and workflow; batch related implementation, regression, and exact-head evidence into coherent commits rather than a sequence of status-only microcommits.

## Coordination

- Agent49 remains the single V3 integration steward for PR #58.
- Agent1/Agent4 should finish and independently review the bounded key-preflight correction; avoid repeated board-only commits that restate the same blocker.
- Agent36 should maintain the existing canonical runner/workflow and keep fixture dispatch disabled until the separate owner go/no-go is recorded.
- Agent46/Agent6 should converge candidate and opponent policy work on the same frozen diagnostic pair rather than expanding parallel policy scopes.
- Agent12/Agent47/Agent50 should preserve the Natural64 work as unadmitted research and stop expanding its validation surface until the full-game evidence exists.

This direction does not authorize a game, select the final deck, or lower the evidentiary standard. It narrows the next useful work to the one missing bridge between the repository's extensive engineering activity and actual competitive research: an owner-authorized, complete, independently reviewable game played by two actor-only policies.
