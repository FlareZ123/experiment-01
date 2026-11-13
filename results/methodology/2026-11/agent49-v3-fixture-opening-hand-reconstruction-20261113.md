# V3 fixture opening-hand reconstruction and Quick Ball setup opportunity

**Agent 49 · 13 November 2026**

## Finding

The frozen Hood Shield Shadow Rider candidate opened with exactly one Basic Pokémon and a playable Quick Ball. The existing actor-only Quick Ball frontier would accept that post-setup hand if its `quickBallRoot` option were enabled. The V3 fixture passed empty candidate and opponent policy options, so the frontier was disabled. The starting-Pokémon prompt improvement cannot create a Bench Pokémon from this hand: there was only one Basic to place Active.

This is a concrete early-setup policy opportunity, not evidence that the 60-card list needs changing.

## Reproduction

The standalone reconstruction is [agent49-v3-fixture-opening-hand-reconstruction.cjs](../../../simulation/evaluation/2026-11/agent49-v3-fixture-opening-hand-reconstruction.cjs), with regression tests in [agent49-v3-fixture-opening-hand-reconstruction.test.cjs](../../../tests/2026-11/agent49-v3-fixture-opening-hand-reconstruction.test.cjs).

It verifies the exact candidate and field Git blob SHAs used by the fixture, both printed-60 fingerprints, the seed derivation, Twinleaf's xorshift32 random stream, and the setup reducer's order: coin flip, then the two 60-card shuffle prompts in seat order. It reproduces the native `CardList.applyOrder` / `moveTo` order without exposing the opponent's opening hand.

- Candidate deck blob: `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`
- Aichi field blob: `ae773f6201d7aa69d31914dbfee66f3fba692200`
- Candidate printed-60 fingerprint: `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`
- Rank-1 printed-60 fingerprint: `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`
- Twinleaf pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- Seed32: `4065045654`; physical random calls through both initial shuffles: `119`
- The coin flip returns true for candidate seat 0. The fixture trace records that the candidate chose second, so rank 1 seat 1 went first.
- Both opening hands contain a Basic, so the initial setup does not require a mulligan.

## Candidate's exact opening hand

| Card | Count | Source printing | Engine printing |
|---|---:|---|---|
| Psychic Energy | 3 | MEE 13 | SVE 5 |
| Arven | 1 | SVI 166 | SVI 166 |
| Quick Ball | 1 | FST 237 | FST 237 |
| Shadow Rider Calyrex V | 1 | CRE 74 | CRE 74 |
| Float Stone | 1 | BKT 137 | BKT 137 |

Shadow Rider Calyrex V is the only Basic in the opening hand and becomes the Active. The post-setup owner hand is therefore three Psychic Energy, Arven, Quick Ball and Float Stone, with five empty Bench slots.

The next three cards in the *unmodified* candidate deck order are Acerola BUS, Mysterious Treasure FLI and Shadow Rider Calyrex V CRE. Acerola is the first card above the opening seven. The second and third positions are not asserted as actual later draws: opponent actions can shuffle or otherwise change the candidate deck. The private full-state trace has not been independently cross-checked in this invocation.

## Existing policy coverage and the missing action chain

1. `simulation/twinleaf/agent8-actor-quick-ball-frontier.cjs` already supports Quick Ball FST. It requires an open Bench, a nonempty deck, no relevant Item/Pokémon lock, and at least one duplicated non-Quick-Ball printing in hand. The reconstructed post-setup hand has three Psychic Energy copies, so its pure root frontier returns `{ kind: 'play-quick-ball', handIndex: 3, printing: 'Quick Ball FST' }`.
2. `simulation/twinleaf/agent34-actor-only-root-policy.cjs` exposes this through the default-off `quickBallRoot` option. The current V3 runner passes `candidatePolicyOptions: {}` and `opponentPolicyOptions: {}`; neither role enables it.
3. The V3 prompt chain currently contains role composition, the actor-only root policy and native prompt resolution, but no Quick Ball owner-prompt continuation. `simulation/twinleaf/agent4-quick-ball-paper-payment-hook.cjs` validates that the mandatory payment is exactly one other physical owner-hand card and explicitly ignores the optional own-deck search prompt. It is a guard, not a decision adapter.
4. Enabling the root alone would therefore leave the mandatory payment and/or Basic search to the generic prompt fallback, preserving the actor-only boundary failure. A useful candidate experiment needs both the root option and an owner-bound continuation: bind the exact Quick Ball Card object, choose one exact physical Psychic Energy payment from the owner's hand, then select a Basic only from the authenticated owner-deck prompt using the native validator. Prefer a second Shadow Rider Calyrex V when actually offered; otherwise use a deliberate fallback. Verify that the exact retrieved Card object reaches the Bench.
5. The existing Mysterious Treasure root helper is Regidrago-specific: it requires Regidrago V/VSTAR in play. It is not a Shadow Rider Psychic setup policy. If Treasure enters the candidate hand later, it needs a separate Psychic-target policy and the same source-bound two-prompt treatment.

## Recommended next experiment

Keep the registered 60 unchanged. Give the candidate role a distinct, frozen policy identity with `quickBallRoot: true`; leave the rank-1 opponent policy unchanged for this diagnostic. Add the Quick Ball continuation to the existing V3 prompt/runtime closure rather than creating another workflow. Test both seats and exact physical source/cost/target identities, then rerun through the existing owner-encrypted Agent36 workflow once its owner-controlled public-key variable is configured.

## Limits

This is a deterministic opening-hand reconstruction plus a pure root-frontier evaluation. It is not a replay of the private full-state trace, not a completed Quick Ball action, not a competitive-qualified game, and not a matchup win-rate estimate. No claim is made that the suggested target or payment is globally optimal.

## Sanitized first-turn decision summary

The public first-fixture report states that the candidate did not Bench or search, and that its first three turns attached to the lone Shadow Rider Calyrex V and used Shadow Mist. The deterministic opening reconstruction makes the first-turn missed route concrete:

- Active: Shadow Rider Calyrex V CRE.
- Bench: empty (five open slots).
- Post-setup candidate hand: Psychic Energy SVE ×3, Arven SVI, Quick Ball FST and Float Stone BKT.
- Search card actually held: Quick Ball FST.
- Baseline behavior: it did not play Quick Ball; it proceeded with Energy attachment and Shadow Mist. No Quick Ball prompt was opened, so there is no actual payment donor or search target to report.
- The starting-Pokémon prompt could not bench a second Basic because the opening hand contained only the Active.

For turns two and three, the public fixture summary confirms the same lone-Active/no-Bench/no-search pattern and says an in-hand route remained, but it does not identify the exact later card or per-decision root. The next three cards in the unmodified deck order are not a substitute for those private turn snapshots: opponent actions can change the candidate deck. Do not report them as actual turn draws.

The prior invocation's raw local private scratch is not available in this invocation, and the repository's `private/` directory contains no trace artifact. Thus this is a sanitized first-turn reconstruction, not the requested complete three-turn private trace. The owner-encrypted workflow must be rerun after the owner configures `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` to recover the remaining turn-level details.

## Source-bound Quick Ball continuation implemented

A narrow adapter is now available at `simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs`, with mock-engine tests at `tests/2026-11/agent49-owner-quick-ball-prompt-continuation.test.cjs`.

The adapter is candidate-seat scoped by default (`eligibleSeats: [0])). It observes an already selected Quick Ball `PlayCardAction`, binds the exact physical Quick Ball and a specific duplicated owner-hand payment Card object before native dispatch, then requires the pinned Store's trainer-prompt `sourceCard` to match that exact Quick Ball for both the one-card discard and own-deck Basic search prompts. It checks prompt ownership, exact prompt zones and cardinalities, calls the native `prompt.validate`, prefers Shadow Rider Calyrex V only when that exact card is offered, and verifies the same physical payment and target objects moved to their expected zones. It waits for source-bound prompts to clear and the exact Quick Ball object to reach discard. Its public audit contains counters and seat/turn only; it does not expose opponent hidden identities.

The source-binding design was checked against the pinned Twinleaf implementation: Quick Ball FST is a distinct print class over Quick Ball, and `Store.stampTrainerPrompt` stamps the resolving trainer Card object onto prompts. This allows exact source binding rather than matching only a printing. The tests use a mock Store/Bot to validate physical-object identity, native validation, source mismatch fail-closed behavior, non-live-state fallback, and candidate-seat scope.

**Integration is still pending.** Agent36 should add the adapter path to `V3_FIXTURE_PROMPT_CHAIN`, wrap the fixture run inside the existing candidate/opponent role composition, and pass `eligibleSeats: [candidateSeat]`. The candidate role should use a distinct policy identity with `quickBallRoot: true`; keep the rank-1 opponent policy unchanged for the diagnostic. No native fixture was rerun here, and no competitive or win-rate claim follows from the mock tests.
