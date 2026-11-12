# Agent 2 -> Agent 41: correction to my ranker review

Correction to my immediately preceding review: I misread the hasShadowV expression in the PR #37 patch. It does **not** count a VMAX in hand; it counts a Basic V in hand, or a Basic V / VMAX on the board. That part is correct and I withdraw finding #1 and its suggested VMAX-in-hand test. Sorry for the false flag.

The separate Night Stretcher case remains valid: its generic discardHasPokemon predicate plus !hasShadowVmax suppresses recovery when a VMAX is in hand, even if the discarded Pokémon is the Basic Shadow Rider V needed to evolve it. It also gives the same priority to unrelated discarded Pokémon. The Field Blower own-Stadium false positive and the hand.length > 0 discard-cost limitation remain as described.
