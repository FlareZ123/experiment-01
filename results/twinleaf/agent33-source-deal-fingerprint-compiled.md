# Agent 33: compiled first-source-deal SHA capture is bounded and noninterfering

**19 October 2026 UTC. Evidence class: pure serializer regression plus two real pinned Store smoke games.** This report is about comparability of physical initial source deals. It supplies no qualified Pokémon match outcomes or deck win rate.

## Concrete question

Two fixed candidate 60s can use the same registered opponent 60, RNG seed and engine physical slot while the resulting opponent's actual shuffled deck/Prize and hand configuration differ. Existing common-comparison archives checked the first source hand but could not certify equivalence of all hidden and face-up source positions. A new v2 comparison needs a postgame digest of the actual source-side state at the first stable turn.

## Implementation

- [Read-only source serializer and one-shot observer](../../simulation/evaluation/source-physical-deal-fingerprint.cjs)
- [Opt-in headless flag](../../simulation/twinleaf/headless.cjs): `captureInitialSourceDealFingerprintSeat:0|1` (absent by default)
- [Eight pure tests](../../tests/source-physical-deal-fingerprint.test.cjs)
- [Two genuine Store regressions](../../tests/headless-initial-source-deal-smoke.test.cjs)
- [Manual-only CI](../../.github/workflows/source-deal-fingerprint-smoke.yml)

`createInitialSourceDealObserver` is instantiated before setup processing, sees the real Store before every root action, and captures **once** when the first `PLAYER_TURN` root has no unresolved setup prompts. The pure serializer requires global turn 1, pinned phase 2, and zero **player-turn actions** since setup. Total headless `actions` may already be nonzero because setup prompts were dispatched; passing that total to the serializer would be incorrect.

The canonical source serialization contains the source actor's **ordered** hand, deck, each face-down Prize slot, Active and Bench card stacks including Tool and Energy arrays, plus discard, Lost Zone, Stadium and Supporter zones, identified by full printed `fullName`. It intentionally excludes transient object IDs and effect/state flags. Its only returned data are `{schema,seat,digestSha256}`, exposed after the game. A future runner must keep this offline evidence out of both players' decisions and speculative bot scoring.

## Compiled evidence

The pinned upstream Twinleaf submodule was built successfully by [CI run 39211090064](https://github.com/FlareZ123/experiment-01/actions/runs/39211090064), head commit `3b2f66c0abd9a5b5684cf3717e8a3c1962223244`, workflow job `117924409209`, **all 10 tests passed**. Node 20.19.0 was requested for the upstream build.

The first full-game harness compared the same smoke-deck pair and seed `20261019` with and without the observer, capped at 80 root actions. Both runs matched on action count, winner, turns, terminal status, real first player, attack-declaration trace, root-action ledger, deck hashes and action counts. The observed result contained the 64-character digest and expected source physical seat 0, while the control result had no digest field. The second genuine Store smoke, seed `20261020`, captured seat 1. The eight pure tests separately verify initial-order sensitivity, hidden deck/Prize change detection, runtime ID independence, no input mutation, setup boundary and one-shot capture.

This is a **bounded observational noninterference result**. It has not been checked with Aichi rank6/11 legal source 60s under two different candidate 60s. Matching SHA-256 from source initial card positions is a useful full-deal equality diagnostic, subject to the completeness and semantics of the modeled zones and hash collision assumptions. It does not establish that later policies were identical, legal or information safe.

## Qualification and next use

Agent 41 owns the common-candidate policy and v2 runner and has accepted this helper for the historical four-arm development comparison. Record the source postgame SHA from each arm; compare actual initial deals, true first starter and real source-policy decisions separately. Only later independently precommitted fresh seeds can contribute to prospective evidence, after hidden-information leaks and legal-action failures are addressed.

**29/32 exact published Aichi opponent lists. Zero competitively qualified games. No demonstrated 99.5% fixed-deck win rate.**
