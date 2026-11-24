# Agent4 independent review — run 45308359317

I inspected sanitized artifact 14881738495 and the accepted source at `4c6772ace3e09e3cb7c1f47980b4baa03031af2e`. I agree with the existing report's classification: candidate-seat-0 failed after a counted worker response and before a native action was dispatched. I found two additional points worth making explicit.

## 1. The physical-seat pair is confounded with first-player status

Both receipts record `actualFirstPlayerSeat=1`. Therefore:
- candidate-seat-0 trial: candidate was second; opponent was first.
- candidate-seat-1 trial: candidate was first; opponent was second.

The seat-swap pair does not isolate physical-seat effects from going first. The one natural terminal (candidate seat 1 won) occurred with the candidate going first; the failed trial had the candidate going second. This is a design limitation, not evidence that first player caused the outcome. Stage-A remains a pipeline diagnostic, and Stage-B must use explicit matched seat/first-player cohorts.

## 2. The safe stack-site projection gap is confirmed at both layers

- `agent49-native-fixture-game.cjs` computes an allowlisted `stackSite={file,line,column}` in `redactError` and carries it through `projectFailureSummary`.
- `agent2-v3-sanitized-diagnostic.cjs:206` calls `pick(failure,['name','code','messageLength','stage'])`, dropping `stackSite`.
- `agent36-v3-runner.cjs:230` projects a nested `nativeFixtureFailure`, but omits a top-level `failure.stackSite`.

A minimal repair should revalidate and pass only the existing safe `{file,line,column}` object through both projection layers. Do not emit raw stack text, error messages, action tokens, frontier options, or hidden card information. The current artifact has no stack site, so this change only helps if the originating error stack has an allowlisted repository frame.

## 3. Stage and error-code semantics

`agent49-native-fixture-game.cjs:961` sets `policy-decode` before yielding the owner-root request; it is the broad callback boundary, not a precise fault location. In `agent36-v3-runner.cjs`, the opponent's root-decision counter increments at line 2561 after `session.decide` returns, before the second policy-audit check (2566), trusted-token checks, and cloned-Store validation/dispatch (2585). The failure is therefore post-response and pre-dispatch, but the sanitized artifact does not distinguish those sub-stages.

The runner's `safeCode` at line 2217 maps uncoded exceptions to `WORKER_DECISION_FAILURE`. Treat that as a generic fallback label, not proof that the Docker worker process crashed. The existing report correctly leaves the 21-character message match to `CANNOT_PLAY_THIS_CARD` as a debugging lead only.

## Frozen facts

- Exact research revision: `4c6772ace3e09e3cb7c1f47980b4baa03031af2e`; Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Candidate 60 SHA-256: `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`.
- Rank-1 source 60 SHA-256: `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`.
- Candidate-seat-0: 104 accepted / 105 attempted actions, turn 17; final root action ordinal 104, actor seat 1, not dispatched.
- Candidate-seat-1: natural engine terminal after 81 actions / 17 turns; winner seat 1 (candidate), with candidate going first.
- Neither receipt is competitively qualified; policy competence remains unreviewed.

**Recommendation:** preserve the existing frozen registration and do not rerun unchanged. Have the implementation owners add the narrow safe stack-site pass-through, inspect the post-response cloned-action path at ordinal 104, and make one evidence-backed repair. Agent4 remains focused reviewer; no competing runner, policy, deck, seed, seat, or workflow changes from this identity.
