# Exact owner-hand Trainer payment contention across the 29 authenticated original Aichi sixties

**Agent 27 | 3 November 2026 | pure arithmetic and static original-source inventory; no independent competitive games**

## Question and status

At a real owner root, a Trainer may be physically in hand and natively enumerated, yet playing it requires discarding cards that are not affordably disposable, or consumes the same Supporter/physical hand cards needed for another line. How much of this constraint can be audited *without hidden-zone access, pretending native legality, or forcing an after-Pass action*?

**Answer:** A new reusable owner-hand structural certificate calculates exact required discard count and physical choices for individual Trainers and ordered two-Trainer plans while preserving both original source Trainer cards. A separate original-29 source-inventory audit establishes exact-printing relevance. Both are deliberately diagnostic, not a selected game-playing policy.

**Validation:** [pure/manual CI 41632197579](https://github.com/FlareZ123/experiment-01/actions/runs/41632197579) **SUCCESS** at revision `1e03179ac87c10c8d58c6c77a9449f83feda9ebd`, including both new regression files and the existing card-audit suite. Initial hand-cost module independently passed [CI 41631867864](https://github.com/FlareZ123/experiment-01/actions/runs/41631867864) at revision `7b43c2e838bc23e8066a03dbdc4a1003763943ad`. No Twinleaf game was run for this report.

## Original field inventory: audited structural reach

The original 29 complete printed sixties contain **1,035 Trainer copies**. Exactly **231** are among the eight currently covered source-exact printing families, which occur in **28 of 29 decks**. These 231 copies partition as follows:

| Cost class | Exact original source printings | Physical copies |
| --- | --- | ---: |
| Mandatory hand discard | Quick Ball FST (72, discard 1); Ultra Ball MEG (24, discard 2); Mysterious Treasure FLI (37, discard 1); Secret Box TWM (10, discard 3) | **143** |
| Optional enhanced discard | Guzma & Hala CEC (13; standard Stadium search without extra discard; optional two-card hand discard enables additional Tool and Special Energy search) | **13** |
| No hand discard for playing | Battle VIP Pass FST (42); Trainers' Mail ROS (29); Professor's Letter BKT (4) | **75** |
| Cost **not classified** by this diagnostic | All other source Trainer printings, including VS Seeker, Tools, Stadiums, Supporters and many cost-free Items | **804** |
| **Total** | Original authenticated 29 source sixties | **1,035** |

These are *printed card inventory counts*, not drawn-hand frequencies, independent decisions or evidence that each card has a legal target. The remaining 804 are **unknown to this limited classification**, rather than known to require discards. Printed 60s and ranks are read from `results/aichi-2026/full-decklists.json` at runtime, with 60-card conservation, rank uniqueness and manifest SHA256 built into `scripts/agent27-original-field-trainer-payment-coverage.cjs`. Ranks **23, 25 and 28** remain unauthenticated; zero decks were filled with proxies.

## Bundled card-text source verification (follow-up)

The additional pure [source-text audit 41634397490](https://github.com/FlareZ123/experiment-01/actions/runs/41634397490) **passed** at `abda89dfb8daf08f92d5b5dacff2dc2ed516ce55`. It resolves all eight supported source printings against `resources/sets/en.json` and the exact `resources/cards/en/<set-id>.json` source rules, including alternative artwork card numbers, then asserts all variants agree with the selected mandatory / optional / no-hand-discard count. This independently checks our explicit physical discard cost claims against the bundled printed card database, while retaining separate target/turn/prompt uncertainty. Source file: [`scripts/agent27-source-trainer-cardtext-cost-audit.cjs`](../../scripts/agent27-source-trainer-cardtext-cost-audit.cjs), [regression](../../tests/agent27-source-trainer-cardtext-cost-audit.test.cjs). An initial test run failed on a pure classifier ambiguity: the optional Guzma & Hala two-discard phrase also matched the generic mandatory-two regex. That case was corrected by excluding recognized optional text from the mandatory pattern, then the full card audit passed. Neither run changes any game decisions.

[Original rank5/rank11 actual owner-root native A/B/A](agent27-owner-payment-native-aba-source5-11-20261103.md) subsequently found 39/39 generically unblocked paid variants physically affordable in 50 correlated roots and eight Pass roots holding at least one of them, with unchanged actual native trace. All remain unqualified.

## Payment certificate and examples

`simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs` exports:

- `physicalHandPayment(hand, sourceIndices, firstCost, secondCost, protectedIndices)`: uses only exact owner-hand physical card slots. It reserves all specified source Trainers, reports mechanical feasibility, unprotected feasibility, minimum protected-card sacrifices, exact counts of payment choices and one demonstrative unprotected payment assignment.
- `ownerTrainerDiscardContention(view, genericRows, protectedIndices)`: joins the shared Agent 5 `ownerTrainerOpportunity` rows by exact owner-hand position; reports each supported physical Trainer's payment modes and pairwise source-preserving payment certificates. It records same-turn two-Supporter and two-Stadium contention separately from hand affordability. It does not choose or dispatch an action.

**Example A, Secret Box:** In `[Secret Box TWM, Boss's Orders, Psychic Energy, Regidrago V]`, there are mechanically three other cards, so paying the mandatory three-card discard is physically possible in one way. If Boss and Regidrago are protected, only one other card is unprotected. The payment requires sacrificing at least two protected copies. This classification depends on a declared strategic protection set, not a fixed assertion that Boss and Regidrago are always indispensable.

**Example B, repeated Ultra Ball:** `[Ultra Ball MEG, Ultra Ball MEG, Energy A, Energy B]` supports using either single Ultra Ball by discarding two other physical cards. If both Ultra Balls must remain reserved for an intended two-play line, there are only two non-source cards available for the total four-card discard requirement. The joint line fails this initial-hand cost test, even though each individual card passed.

**Example C, Guzma & Hala:** the ordinary Stadium-search mode is modeled with zero hand discard; its enhanced Stadium/Tool/Special Energy line requires two other hand cards. A two-Trainer plan can reserve both cards and fail the enhanced payment even when Guzma & Hala alone has enough cards. The module does not assume that searching all named categories is possible or worthwhile.

**Copy counts matter:** Two identical physical Ultra Balls are distinct hand indices and are reserved separately. A supported printing is matched with its set, preventing an old Quick Ball whose text is different from inheriting the Sword & Shield discard rule.

## Proof boundary

The certificate concerns **a frozen initial owner hand and specified proposed plays**. It does not model new cards drawn by the first play, conditional search targets, rearranged hand or deck, first-turn exceptions, evolving locks, Pokémon-specific targeting, actual native prompt settlement, owner K1 search knowledge, opponent strategic response or competitive win rate. A `protectedIndices` set is externally supplied; no invented universal DCI threshold enters the answer. `physicallyAffordable` is **never** a claim of complete paper legality or even availability of a worthwhile target. Pairwise classifications are candidate resource obstructions, not a scored policy.

The separate native/engine functionality remains untouched, so previously frozen policy experiment identities and outcomes are unchanged. The new functions are pure, read-only, deterministic and safe to call with a genuine `actorObservation` plus Agent 5 generic frontier rows. Exact test coverage includes protected-card loss, print-specific rules, repeated copies, pairwise reservation, optional enhanced modes, quota blockers, public locks, arithmetic and malformed input.

## Next decision-changing step

Integrate the read-only payment certificate into the existing **bilateral owner-root Trainer frontier** (Agent 5/Agent 29) while retaining exact owner-private view and no-selection parity, then quantify **mechanically unaffordable / strategically protected / generically unblocked but card-specific unresolved / selected and actually paper-paid** cases on real frozen source roots. Do not turn a generic Pass into a forced Trainer play until a genuine shared candidate arbiter compares paid Trainer alternatives with attack, Energy and Bench options. The first selected release should prove actual native paid prompts, payoff and opponent reply under registered two-seat physical deals.

**Project status:** 29/32 original printed source sixties authenticated; zero competitively qualified games; no chosen fixed best 60; the 99.5% target remains unproven.

## Reproduction

- Pure cost model: [`simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs`](../../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs).
- Field inventory audit: [`scripts/agent27-original-field-trainer-payment-coverage.cjs`](../../scripts/agent27-original-field-trainer-payment-coverage.cjs).
- Regression tests: [`tests/agent27-owner-trainer-discard-contention.test.cjs`](../../tests/agent27-owner-trainer-discard-contention.test.cjs), [`tests/agent27-original-field-trainer-payment-coverage.test.cjs`](../../tests/agent27-original-field-trainer-payment-coverage.test.cjs).
- Existing manual runner: [`.github/workflows/aichi-card-audit.yml`](../../.github/workflows/aichi-card-audit.yml), ordinary card-coverage option, no Twinleaf compile or native matches for this fixture.
