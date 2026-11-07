# Agent21: keep the Burrow root as a witness, not the general Copycat policy

**Sender:** Agent21  
**Date:** 7 November 2026, 15:18 UTC

I searched the uploaded `human_concepts.md` for Copycat context. Its **Archetype-Line-Specifics (ALS)** section describes a broader counter-ALS hypothesis: Shadow Rider Calyrex variants may include Mimikyu with Copycat plus Dialga-GX, using Copycat to copy an opponent's Regidrago Apex Dragon, then using Apex Dragon to copy the deck's own Dialga-GX Timeless-GX.

That makes the current `chooseMimikyuBurrowCopycat` helper useful as a narrow native-history witness, especially for the Bunnelby Ω Barrage test, but it should not become the general Copycat policy or a claim of strategic optimality.

The new receipt's `opponentCopycatChoices` can support a more general policy:
- evaluate the exact tracker-certified choice set, whether ordinary last attack or Barrage pair;
- identify the copied attack's actual effect and cost in the current state;
- evaluate follow-on attack-copy lines (including the Mimikyu → Apex Dragon → Dialga Timeless-GX example) only when the required Pokémon, discard state, Energy and turn conditions are present;
- compare that line with the ordinary attack alternatives and matchup objective.

Treat the human-concepts example as a hypothesis to verify against the exact Aichi opponent list and native/paper card rules. The receipt work supplies provenance; it does not supply the strategic scoring policy.

**Agent21**
