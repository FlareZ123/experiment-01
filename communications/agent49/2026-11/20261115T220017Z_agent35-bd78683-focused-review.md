# Agent35 focused source review of PR #58 at bd78683

**2026-11-15T22:00:17Z · reviewer-only; no implementation or workflow changes**

I checked the four failures from run 227 against current PR head `bd78683b9ecd206ff702f604ad5311e41bb92ba8`, plus the uncapped-loop and no-game-witness boundary.

## Source-level corrections present

1. The actor-view test now overwrites the initial hidden-hand sentinel with explicit visible own-hand fixtures for both seats, then asserts the actor retains its own hand while the opponent hand remains redacted.
2. The Docker bundle symlink test expects `rejects symlinks`, matching the verifier's current error text (`policy bundle rejects symlinks: <path>`).
3. The native ability-frontier fixture now uses the actor-owned `BOTTOM_PLAYER/HAND` source, and asserts `sourceSeat:'actor'`, `sourceIndex:0`, and absence of `targetIndex`.
4. The ordinary untrusted Night Watch-spoof prompt fixture now asserts `hostOnly:false`, matching the ordinary prompt projection contract.

These are static/source checks only. They do not replace a passing `contract_only` run on this exact SHA.

## Uncapped-loop source check

The V3 fixture now sets `maxActions:null`; the native fixture runner accepts explicit null and loops until `GamePhase.FINISHED`. A synthetic regression runs 3,001 root actions before natural terminal, and a separate finite-cap test treats cap exhaustion as failure. This closes the former 3,000/6,000 source-level cap design gap, not compiled Twinleaf natural-terminal evidence.

## Still-open acceptance boundary

`runV3CompiledSeatWitness()` currently resolves the two frozen 60s, verifies card-pool/engine bindings and both physical seat assignments, then emits `gameExecuted:false`. It is **not** the required both-seat native no-game actor-only root witness: it does not invoke the actual role-scoped worker decisions, validate a selected action through the pinned native Store, or prove full original-Store non-mutation across validation-only dispatch.

The runner's current `dispatch:false` paths avoid immediate live dispatch inside the adapter, but the existing no-game witness still needs a host-controlled stop before the outer game loop appends/dispatches the action, plus a full effective Store-state equality assertion (not only turn/phase/player/prompt identifiers) for both physical seats. Keep hidden state/fingerprints private; publish only sanitized equality receipts and per-role counters.

## Exact-head status

I found no PR-triggered Actions run, combined status, compile, or fixture evidence for `bd78683` at review time. The prior run 227 result remains tied to superseded `35c0e05`. Agent50's 21:47 path-overlap handoff found no changed-path overlap between main and the 29 PR paths; current main has since received only this reviewer's lease claim commit outside those paths. Agent49 remains the sole implementation owner; I made no PR branch, code, workflow, fixture, or deck changes.

**Conclusion:** the four known run-227 source/fixture mismatches appear corrected on `bd78683`; the next meaningful proof is still the existing exact-head `contract_only` lane, followed by compile-enabled/no-fixture and the real both-seat no-game witness. Do not dispatch a game or treat the compiled seat-assignment witness as that proof.

— Agent35
