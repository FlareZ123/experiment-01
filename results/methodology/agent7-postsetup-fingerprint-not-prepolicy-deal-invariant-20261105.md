# Agent 7: post-setup fingerprints cannot certify treatment-invariant physical deals for an opening-policy A/B

**5 November 2026 | methodological/source inspection + genuine compiled native eight-arm counterexample. No qualified competitive games.**

## Question

An existing [v6 versus v7 native preregistered original rank6/rank11 test](https://github.com/FlareZ123/experiment-01/actions/runs/42045862696) holds rank, source physical seat, candidate identity, integer seed and nominal source/candidate printing sets constant, while deliberately changing the **opening Basic placement policy**. The comparator asserts that all eight source-deal and full-physical-deal SHA256 fingerprints must match. It fails for two arms. Does that *necessarily* prove the initial shuffle or pre-choice physical deal changed?

**No. The fingerprint is intentionally taken after setup placement has already happened.** The existing hash comparison cannot distinguish a genuine pre-treatment RNG/deal mismatch from a successfully executed difference in Basic placement, which is exactly the experimental intervention.

## Direct source evidence

`simulation/evaluation/source-physical-deal-fingerprint.cjs`, function `fingerprintInitialSourceDeal`, asserts `state.phase===2` (PLAYER_TURN), `state.turn===1`, no pending prompts and zero already accepted player-turn actions. It constructs `privateSourcePositions` including the following **post-setup zones**: `hand`, `deck`, ordered `prizes`, `active`, ordered `bench`, `discard`, `lostzone`, `stadium`, `supporter`. The hash covers **all** of these positions. Its observer does not capture the owner hand before the setup `CHOOSE_STARTING_POKEMONS` choice.

`simulation/evaluation/full-physical-deal-fingerprint.cjs` constructs `initialFullPhysicalDealFingerprint` by hashing the two seat-specific versions of that very same post-setup position digest. Thus the full-deal hash inherits the distinction between a Basic held in hand, promoted Active, or placed on the Bench.

The baseline `simulation/twinleaf/agent50-owner-starting-basic-choice.cjs` selects all legal eligible setup Basics in hand order up to the native maximum. The v7 treatment `simulation/twinleaf/agent50-owner-protected-multibasic-store.cjs` delegates to `agent50-owner-preserve-turn-entry-setup.cjs`, which **withholds** recognized in-turn hand-to-Bench Ability Basics from initial Bench placement when another eligible Basic is present. Consequently, holding a support Basic in hand rather than Benching it intentionally changes the post-setup physical positions hashed by the two telemetry functions.

## Actually executed falsifying example

[Compiled CI 42045862696](https://github.com/FlareZ123/experiment-01/actions/runs/42045862696), executing exact head `f50d10398ea21805ae5333d013672844261811ff`, retained 8 original rank×seat×candidate attempts per policy, v6/v7 Store receipts, and a failed strict comparator archive. The actual output `AGENT1_ISSUE25_MIRRORED_OPENING_CONTRAST` from native job 127308501004 reports:

- **6/8** original-source post-setup physical position hashes match; **2/8** do not.
- **6/8** full two-player post-setup physical hashes match; **2/8** do not.
- **8/8** source physical seat and first-turn starter observations match.
- Both mismatches are source rank 11, repeat 103, source physical seat 0, candidate physical slot B: `11:103:B:champion-reference` and `11:103:B:new-moon-lockbreaker-v1`. Both v6 baseline attempts capped after 48 roots. Both v7 attempts aborted at root 11 and 17, respectively.
- The independently archived **v7 native opening selection** in *both* mismatched arms shows source seat 0 selecting `Mega Absol ex M1L`, `Squawkabilly ex PAL` and retaining the physically held `Tapu Lele-GX GRI` for later in-turn Bench entry. Baseline's source-policy code selects all eligible Basics up to the native maximum; its actual per-arm selection list was not included in the current public contrast receipt.

Thus the observed mismatch is **compatible with the intended opening-policy treatment alone**, even if the original shuffled hand, initial draw and deck order were exactly the same. The evidence does not prove that the RNG sequence differed. Conversely, it does not prove the pre-treatment deals were equal: that fact was never independently recorded at a policy-invariant stage.

## Existing follow-through already in the repository

**Important nonduplication correction:** Agent1 already implemented the appropriate native prechoice observer and eight-arm comparison *before this review*. The exact files are `simulation/twinleaf/agent1-setup-prechoice-private-fingerprint.cjs` and `simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs`, with [compiled native CI 41937767605](https://github.com/FlareZ123/experiment-01/actions/runs/41937767605). The observer binds registered native trial labels to actual Store instances, records each owner's pre-`CHOOSE_STARTING_POKEMONS` hand/deck/Prize positions using process-secret HMAC, separates post-setup board observations and retains all eight arms. Its eight-arm tests reported **16/16 source/candidate owner prechoice-input and pre-run request HMAC matches** under same-process comparison, while explicitly leaving entire policy closure and competitive inference **UNRESOLVED**. These are prior Agent1 findings, not this report's implementation.

The new finding here is that the *older v6/v7* first-stable-turn comparison, still run by the existing `issue25_only` job on 5 November, uses a **different, post-treatment definition of physical fingerprint**, and its strict eight-equality test therefore cannot be read as an independent test of the prechoice deal. The documented v8 input-HMAC evidence is a more relevant source to consult. Any successor should reuse and independently review v8 or newer prechoice custody rather than create a duplicate observer. A source-code observation does not retroactively certify v6/v7 game outcomes.

## Correct experimental requirement

1. Capture, at one unambiguous **pre-treatment boundary**, each player's ordered card positions and any already-committed public setup history: for example, both original first-seven draw hands and remaining deck order after the same shuffle/mulligan history but before either opening policy chooses an Active or Bench. Keep this observer read-only, private identities only in postgame opaque SHA256 and never available to the live decision algorithm. Capture the same receipt when an abort happens.
2. Separately capture the **post-treatment placement**: exact owner-held printed Basics, native accepted Active/Bench selection, remaining support in hand, opponent's setup decision and optional mulligan compensation. These physical differences are potential *mediators/outcomes* of the intervention. Do not require these post-treatment zones to match.
3. Compare pre-treatment fingerprints and common provenance across candidate-specific v6 versus v7 arms. Only when they match can their later differences receive paired causal interpretation, subject to live Store owner-information safety and the other independent qualification gates.
4. If a game is re-dealt because of mulligans, a setup choice affects the subsequent draw sequence, or one policy yields different compensation, the observer must specify whether its captured boundary was before the first treatment or after that endogenous event. There may be no single post-setup fingerprint that remains invariant under all treatment decisions.
5. Preserve the original strict post-setup fingerprint evidence and both negative arms; relabel it as **physical position parity**, useful descriptively. Requiring it to pass as a prerequisite for an opening treatment can incorrectly reject intended effects. Do not retrospectively declare v7 superior or a valid paired test until a genuine earlier-boundary receipt exists.

This is a *measurement-definition correction* supported by the exact pinned local source and the executed v7 audited selections. It is not a card-strength conclusion or an independent test of the initial shuffle itself.

**Field baseline unchanged:** 29/32 authenticated original source 60s, zero competitively qualified games, no selected fixed 60 and no demonstrated 99.5% all-field win rate.
