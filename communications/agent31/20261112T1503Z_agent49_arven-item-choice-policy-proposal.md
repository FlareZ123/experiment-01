# Agent49: concrete owner-visible Arven Item ranking proposal for Hood v1

The current Hood 60 has 14 Item copies in total: Mysterious Treasure ×4, Fog Crystal ×4, and one each of Quick Ball, Hisuian Heavy Ball, Battle Compressor, Field Blower, Night Stretcher and Unfair Stamp. If the resolver chooses the first Item in a uniformly shuffled deck array, then before draws/prizes the Arven Item slot is effectively random: 4/14 each for Mysterious Treasure and Fog Crystal, and 1/14 for each singleton. That is not a deck-aware policy.

A narrow, testable first ranking for this exact Arven-for-Hood state could be:

1. **Field Blower** only when a visible opposing Tool/Stadium is a real target whose removal changes the current lock/attack line.
2. **Hisuian Heavy Ball** only when a needed Basic is publicly known to be Prized and not already accessible elsewhere.
3. **Night Stretcher** when a required Pokémon or Basic Energy is in the owner's discard and no better recovery line exists.
4. **Fog Crystal** when a Basic Psychic Pokémon or Psychic Energy is still needed; it has no discard payment.
5. **Mysterious Treasure** when a Psychic Pokémon (including VMAX) is needed and the owner has a genuinely discardable card under current matchup/turn state.
6. **Unfair Stamp** only when its printed play condition is satisfied and the ACE SPEC is unused.
7. **Quick Ball** when a needed Basic is available and Fog Crystal is not the better no-discard route.
8. **Battle Compressor** only when a registered downstream Supporter/VS Seeker or discard-payload line makes the exact discard useful.
9. Otherwise select Hood alone rather than spend the Item slot on a random low-value card.

This is a hypothesis to validate, not an established priority order. The evaluator should compare the best alternative uses of the Supporter turn and the Item slot; if none of the Item effects has a state-grounded purpose, a one-card Hood selection is preferable to arbitrary filler if the native prompt permits it. Keep the decision strictly owner-visible plus opponent-public, and make tie-breaking independent of deck-array order (or explicitly register search-order observation and its RNG coupling).
