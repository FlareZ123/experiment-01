# Agent 1: Wonder Tag native shuffle v3, live Store owner and pending-prompt custody

**6 November 2026. Pinned native developer-effect witness, no game-competitive admission.**

## Finding

A native `ShuffleDeckPrompt` callback may return after a game-state replacement, even when an observer's previously captured `owner` object is no longer the current Store player. A valid numeric permutation for that stale object would have satisfied the previous v2 callback-completion count despite lacking proof that the **current** native Store owner deck was shuffled. Similarly, a synthesized or unregistered callback could be counted without demonstrating that its prompt had genuinely entered the live Store pending-prompt collection.

The [v3 read-only observation module](../../simulation/twinleaf/agent1-wondertag-native-shuffle-completion.cjs) now records:

- `nativeLivePromptRegistrationsVerified` and `nativeLivePromptRegistrationsMissing`, requiring exact pending `Store.state.prompts` object identity and owner ID at prompt offer;
- `nativeCallbackLiveOwnerMatches` and `nativeCallbackDetachedOwners`, comparing captured original owner object to the *current* `Store.state.players[seat]` inside the callback;
- existing exact trial ID + actor seat, valid numeric-permutation, callbacks-invoked, callback failures, unresolved prompts, errors, and no silent owner reassignment.

A positive `allOfferedShufflesCompleted` now requires every offered prompt to be genuinely registered and every callback bound to its still-live Store owner. If the original reducer legitimately changes the Store player object and the older callback still settles a correct physical shuffle, this stricter gate may **reject usable evidence conservatively**; it cannot mistakenly upgrade that ambiguous continuation. The observer never supplies choices or accesses concealed card names. The [v10 independent comparator](../../simulation/evaluation/agent1-issue25-protected-wondertag-v10.cjs) also requires all four new counters to be consistent before issuing `nativeShufflePromptCompletionIndependentlyCertified=true`.

## Regression and actual engine evidence

- [Pure observer tests](../../tests/agent1-wondertag-native-shuffle-completion.test.cjs) cover detached owner after forced Store replacement, prompt absent from native pending collection, malformed order, repeated callbacks, owner misroute, missing native trial, callback throws and original native failure restoration.
- [v10 comparator tests](../../tests/agent1-issue25-protected-wondertag-v10.test.cjs) inject both detached-owner and nonexistent-pending-prompt certifications; each must now fail closed.
- [Actual native eight original v11 compiled CI 42291907800](https://github.com/FlareZ123/experiment-01/actions/runs/42291907800) completed successfully on pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Actual native eight original v12 comparator-enabled CI 42292281476](https://github.com/FlareZ123/experiment-01/actions/runs/42292281476) also succeeded with new v10 pure comparator checks.
- [Actual native v12 positive-witness CI 42292691798](https://github.com/FlareZ123/experiment-01/actions/runs/42292691798) explicitly enforced **one** existing real native contender-owned Wonder Tag shuffle offer at frozen trial `11:202:A:champion-reference`, one live Store registered prompt and matching live owner callback, zero missing/detached counts, and one valid real Shuffle callback. All other unchanged original trials were retained. This positive native source role is **contender seat 0**, original rank11 source seat 1.

The historical earlier [v2 native callback report](agent1-issue25-native-wondertag-trial-shuffle-v2-20261106.md) used two rank11 original-source actual native offers. Its earlier archived counts are not retroactively recertified by new v3 fields; do not silently backfill them. The tests certify **native identity-and-callback evidence for particular observed transitions**. They still do not prove shuffle entropy, complete paper card effect, correct owner-deck order or full match legality.

## Decision

This fixes an instrumentation false-positive pathway and ensures future collected native traces distinguish truly live owner-deck Shuffle callbacks from detached snapshots. No decklist, native action policy, paper-clock implementation or original opponent is changed by v3. **Zero competitively qualified games; no selected best fixed 60.** The immediate leverage is quality of evidence for source-independent actual-prompt policy successors, not a measured win-rate gain.
