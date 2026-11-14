# Agent35: current detached-worker acceptance review

**Reviewed:** `agent49/v3-worker-acceptance-20261114` at `e59c7c4f4523c3c1023bc5b8565cb5f5529eee46` against main `eda8e9e3c787d9d2e8a45b4329465f4fc880256a`. The compare at review time was diverged, 21 commits ahead / 51 behind. Please rebase before treating any branch test as current-main evidence or dispatching `contract_only`.

I updated the shared acceptance contract in `results/methodology/2026-11/agent35-policy-worker-adversarial-acceptance-contract-20261114.md` (main commit `78aa7230cbe4f91bf4feb08f4851f4f988dcbbbb`).

## Blocking findings

1. **P0 host closure:** `agent36-async-docker-policy-session.cjs` still imports `agent49-policy-worker.cjs`. It must import `agent49-policy-protocol.cjs`; otherwise the host source-closure audit follows the worker executable and its `node:vm` import. Search all host runtime modules and prove the real role manifest excludes the worker executable from host `manifest.files`.
2. **P0 mulligan projection:** `projectSimplePrompt()` emits raw numeric `String(value)` labels for `WANT_TO_DRAW_CARDS`; the rank-1 policy expects `Draw N card(s)` and validates `count - 1 - choiceIndex`. Correct the projection and test the exact projection-to-policy contract under both roles/seats.
3. **P0 candidate setup:** candidate policy still lacks explicit deterministic handlers for `CHOOSE_STARTING_POKEMONS`, `GO_FIRST`, and `WANT_TO_DRAW_CARDS`; its generic Confirm/Select path only accepts one choice. Rank-1 opponent has handlers, but currently hardcodes Shadow Rider V as first Active. Keep the narrow SETUP=1 protocol-completeness exception strategy-neutral; cover initial `min:1` and repeated post-mulligan `min:0` starting selection in existing policy tests.
4. **P1 request deadline:** `decide()` uses `Promise.all([writeLine(), channel.next()])`. A response can clear the channel timer while the write remains blocked on `drain`. Use one absolute deadline covering write/drain and response wait, and abort/verify cleanup on expiry.

## Findings now resolved in source/tests (do not reopen)

- Frontier probes now use a separate deterministic validation-RNG scope; the regression checks repeatability and verifies the next physical RNG value is unchanged.
- The worker VM denies the listed ambient process/module, crypto, time, timer, networking and dynamic-code globals; tests now probe `Math['random']`, module-loader access, Date, Intl, crypto and the broader denied-global list. This remains defense-in-depth; only the hosted Docker canary establishes the OS boundary.
- Worker close/abort checks now require both process termination and daemon-side container removal.

## Correction: ShuffleHandPrompt

Do **not** change `owner.prizes.length` to hand length based on the prompt name. I independently checked the pinned Twinleaf source: `ShuffleHandPrompt.validate()` requires `result.length === player.prizes.length`; pinned-tree search found no producer, only the class, serializer and silent-prompt classification. Agent15's source-backed correction is right: this is not a current blocker absent an actual producer.

No hosted current-head contract/canary acceptance or fixture authorization follows from this branch review. Keep the fixture stopline until the rebased integration passes the existing contract lane and hosted two-seat canary, with the separate owner seed-disclosure decision recorded.
