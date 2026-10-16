# Clone-only hidden-deck-order sampling experiment

**Agent 27, 16 October 2026.** Status: research-owned opt-in hook and regression committed; **pinned compiled-engine regression not yet executed**. No source-deck match result or competitive win-rate evidence is asserted.

## Problem and scope

Existing [Agent 18](hidden-order-policy-leak.md) and [Agent 50](hidden-information-policy-audit.md) diagnostics establish that pinned Twinleaf `SimpleTacticsAi` can use the actual physical ordering of unseen cards in a hypothetical draw before choosing a Pokémon TCG action. An opponent with the same public state and an unobserved reshuffle can therefore induce a different bot choice based on data that a paper player cannot know. The two reported effects are a PlayTrainerTactic Pokégear decision difference and a PlaySupporterTactic score difference. These are policy defects; the game engine can still implement actual draw mechanics correctly.

The goal here is narrower than an information-complete policy: remove the *actual physical order* of unknown deck cards from an experiment's speculative `Simulator` clones, maintaining the real Store's draw order and a separate policy RNG.

## Implementation

- [Clone-only hook](../../simulation/twinleaf/speculative-deck-sampling.cjs) wraps the **exported** pinned `game/bots/simulator.Simulator` constructor. The original Simulator first deep-clones its input `State`; the wrapper then samples each cloned player deck.
- `sampleDeckOrder` canonicalizes the multiset by card `fullName` and uses Fisher–Yates with an explicitly provided `random()` function. Two physically different permutations of the same unrevealed multiset therefore receive the same sample when supplied the same speculative random stream.
- The wrapper can be restored and explicitly rejects nested installation. It does not modify Twinleaf vendor source. It is **not enabled** by the headless field runner or any default policy.
- [Paired-state regression](../../tests/twinleaf-speculative-deck-sampling.test.cjs) reuses Agent 18's actual compiled-engine `fixture(true/false)`: baseline Pokégear decisions must differ as previously established, whereas under the hook the sampled hypothetical action score and choice must match with reset common random streams. The regression also asserts unchanged *actual* deck order, rejects double installation and verifies reversal to unpatched behavior.

The test has been written and committed; its compiled-engine assertions are **unverified pending execution in the pinned Twinleaf environment**. A small local independent Fisher–Yates sanity check is no substitute for this test. The existing [manual hidden-information CI workflow](../../.github/workflows/twinleaf-hidden-information.yml) currently does not invoke this newly added test.

## Relationship to concurrent Agent 18 implementation

During this investigation Agent 18 independently committed [`hypothetical-deck-order-hook.cjs`](../../simulation/twinleaf/hypothetical-deck-order-hook.cjs) and [comparative fixture](../../simulation/twinleaf/hypothetical-deck-sampler-test.cjs). Their wrapper samples before each `SimpleTactic.evaluateAction` by **temporarily** reordering the supplied state deck and then restoring it within a `finally` block. The new Agent 27 wrapper samples only the **Simulator's cloned** state after construction. The clone boundary reduces risk from observing or corrupting the real Store during evaluation, but must be demonstrated in compiled tests before choosing between them.

Agent 18 was contacted for adversarial comparison via `communications/agent18/20261016T0140Z_agent27_clone-only-sampler.md`. Both designs currently have insufficient evidence for production policy use.

## Important invalid assumptions still present

1. **Known top-card order:** Deck order is not always fully unknown. Effects can place or reveal a card on top, and cards can be learned without a subsequent shuffle. Sampling the entire deck would erase that legitimate information. A usable observation model needs to mark ordered known prefixes and sample only genuinely unknown segments.
2. **Hidden card membership:** The hook already receives actual enemy-deck identities and both players' facedown Prize cards in the raw state. Randomizing the enemy deck order does not remove this identity leak. Own Prize uncertainty before search (K0) also needs treatment.
3. **Opponent hand:** A cloned simulator has the opponent's exact hand, which can influence speculative attack or disruption outcomes. The hook does not model hand uncertainty.
4. **Research RNG:** `random` must be isolated from game-event shuffles and coin flips, or hypothetical scoring can itself alter real-game randomness. Existing `seed-stream-isolation.md` contains an independent protocol.
5. **Single-sample noise and action contention:** A single determinization can make a poor decision by chance, and two available actions may be scored under different samples. Replicated common-random-number samples and expected-action evaluation are a future research task.
6. **Integration order and legality:** Existing `headless.cjs` replaces the same Simulator export for fair speculative random arbitration. Combined hooks must be installed and restored in the correct order, and real Store prompt actions must remain valid. The hook is not yet integrated for match use.

## Verification gates

The next concrete actions are: run the existing paired-state regression against the pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` engine; compare observed action decisions and real-state immutability against Agent 18's CI tests; add an observation-aware known-top regression; then run a source-inventory representative action scenario before any end-to-end field pilot. A complete policy boundary and independent RNG are prerequisites for meaningful competitive comparison.

**Strength claims:** none. The research objective of a fixed 60-card deck winning 99.5% against Aichi Top 32 remains unmet.