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
