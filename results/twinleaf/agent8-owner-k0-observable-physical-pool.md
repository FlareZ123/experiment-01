# Owner-observable physical K0 inventory for costed pre-search actions

**Agent 8, 19 October 2026 UTC. Evidence classification:** pure owner-zone accounting, strict physical-count conservation, hidden-identity noninterference tests, and a source-printed sixty-card *synthetic* zone fixture. This is a policy-integration primitive, not a real Store-search decision, opponent benchmark or simulation win.

## What the adapter establishes

[Implementation](../../simulation/twinleaf/owner-k0-observable-inventory.cjs) exposes `ownerK0ObservableInventory({owner,registered,deckUnsearched:true,observedDeckPrintings?,observedPrizePrintings?})`, reusing the existing exact [strictK0Belief](../../simulation/twinleaf/strict-k0-unknown.cjs) inventory subtraction. The `registered` array must enumerate **each physical copy by actual registered printing identity**, including duplicated Pokémon, Trainers and Energy cards.

The observable card set enumerates only the acting owner's:

- hand, discard pile, Lost Zone, played Stadium, played Supporter;
- full Active card stack and every Bench card stack, including attached cards and all intermediate Evolution cards;
- separately and only **counts** deck and Prize cards through collection lengths.

Twinleaf's `playZone` is an alias of `supporter`; it is never counted a second time. The module does **not** dereference an entry inside `owner.deck.cards` or any `owner.prizes[*].cards`, inspect opponents, or use the physical allocation of concealed cards. Already publicly identified individual deck or Prize copies may be supplied in explicit arrays after another authenticated observation has produced the information; these are subtracted from the appropriate unknown deck/Prize cardinalities. Inconsistent source inventories, zone shapes and impossible counts raise errors instead of silently dropping cards.

The return includes `pool` (sorted unknown printings with multiplicities), `deckCount` and `prizeCount` for the unknown portion, full physical sizes, complete visible printing list, and transparent zone cardinalities. This supports the [Agent 47 exact K0 discard frontier](../../simulation/twinleaf/k0-discard-value-frontier.cjs) **without passing hidden deck identities to the pre-search action decision**.

## Testing

[Five new regressions](../../tests/owner-k0-observable-inventory.test.cjs) cover:

1. all owner-visible physical zones, including intermediate Active stack and attached Bench card copies;
2. equality of outputs under two hidden deck/Prize permutations where the only varying concealed card objects throw on attempts to read their names;
3. an already-revealed deck card and already-revealed Prize card, with separate unknown cardinalities;
4. explicit K0 first-search requirement, overdeclared revealed positions, missing player zones and inconsistent registered cards;
5. exact conservation of a synthetic seven-visible-card, 47-deck-card, six-Prize-card partition of the **actual rank-6 Aichi source 60 printing inventory**. This is a bookkeeping test and not an observed rank-6 opening.

The [existing manual Aichi statistics workflow](../../.github/workflows/aichi-benchmark-stats.yml) now executes these alongside Agent 47's two discard-frontier suites. [CI run 39343999217](https://github.com/FlareZ123/experiment-01/actions/runs/39343999217) passed; the combined K0 step recorded **13 passed, zero failed** (five from this module). No new CI workflow was created.

## Information and utility limits

The caller remains responsible for supplying the exact *registered* deck identities, proving `deckUnsearched:true` from authentic per-actor history (for example the existing `owner-deck-knowledge-epoch.cjs` recorder), and authenticating any separately observed deck/Prize identities. The module cannot itself prove that the player has never searched because inspecting only a current board snapshot does not reveal all past searches.

An owner may know a card's position or the top of the deck because of a nonsearch effect. The remaining unknown allocation may then be nonexchangeable. This extractor provides only the **multiset**, so Agent 47's `uniformUnknownAllocation:true` is an extra modeling premise that must be justified before using its exact expectation.

The basic API does not track ownership of cards transferred into unusual external zones or detached into temporary effect-resolution buffers. In such a state, the total-count invariant should fail closed, or the caller must model the full ownership transfer. It also cannot decide whether spending a real Battle Compressor is worthwhile, infer a legal search prompt, price Supporter/Bench contention, or predict a winning game. Those responsibilities remain with the actual common-policy action comparator and native Store sequence.

**Benchmark remains 29/32 published exact opponent lists and zero qualified games.** This result is ready for Agent 47 and the Agent 10 canonical common-policy integrator to scrutinize; it has not been installed into their game-playing policy.
