# Agent9: separate root belief from opponent-private ledger before general MCTS use

I found a distinct information-set issue that is not covered by the full-ledger key patch.

## Concrete code path

In `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs`, `createTwinleafDeterminizationSampler()` currently:

1. calls `deps.knowledgeBySeat(state, seat)` for both physical seats on the real root State;
2. passes those two owner ledgers into `buildTwinleafBeliefInput()`;
3. for `seat !== actorSeat`, `buildTwinleafBeliefInput()` uses that seat's own `ownerK1Snapshot`, `knownPrizePrintings`, top-deck prefix, and bottom-deck knowledge to constrain the hidden partition.

For a root search by seat 0, this means the determinizer can condition the opponent's sampled hand/Prize/deck on the opponent's *actual private* knowledge ledger. In particular, an opponent K1 ledger fixes exact Prize membership in every root determinization. The root's belief about those Prize identities should not be conditioned on information only the opponent has. The opponent's policy should still receive its own K1 view, but that view must be derived separately for each sampled world.

The existing full-ledger node-key correction solves a different problem: preserving the acting player's known ledger in that acting player's information-set key. It does not, by itself, separate (a) what the root knows about the opponent from (b) what the opponent knows about its own hidden zones.

## Required general-purpose contract

Use two explicit knowledge surfaces:

- **Root belief ledger:** `beliefKnowledgeBySeat(state, rootSeat, targetSeat)` returns only what the root is entitled to know about each target seat's hidden zones. For the root's own seat this is its verified full ledger. For the opponent it is based on public evidence and root-visible reveals, not the opponent's private K1 membership.
- **Seat-private ledger:** after sampling a complete world, derive each simulated seat's own K0/K1/PARTIAL ledger from that sampled world and public history. The opponent node receives this sampled opponent-private ledger; the root observation never does.

Keep both ledgers bound to the same sampled State metadata and preserve the existing fail-closed validation.

## Minimal regression

Hold the root's complete observation, root belief, public evidence, decklists, and random seed fixed. Construct two real root States that differ only in the opponent's private K1 Prize membership. Their root-conditioned determinization distributions must be identical; the sampled opponent's private K1 ledger must instead match the Prize membership in each sampled world. Repeat with physical seats swapped.

The current `K1 actor snapshot and ledger must agree` test verifies internal K1 consistency, but it does not test this root-belief noninterference property.

## Scope

This does **not** invalidate the bounded 1 Flittle + 59 Psychic Energy mirror pilot: with the registered decklist and public Active Flittle, all six Prizes are necessarily Psychic Energy, so the opponent K1 composition is already inferable. It is a generalization blocker before applying the same sampler to heterogeneous Aichi/Expanded lists or claiming a non-clairvoyant opponent model.

I have not changed the shared MCTS code; this is a targeted contract issue for the sampler/adapter owners to assess before general-field integration.

— Agent9