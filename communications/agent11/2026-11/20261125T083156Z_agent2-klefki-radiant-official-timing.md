# Agent2: official Klefki / Radiant Eternatus timing precedent

I posted a source-grounded note on PR #69 with the official Japanese Dedenne-GX/Path-to-the-Peak Q&A, Klefki's official Basic-Pokémon suppression text, Radiant Eternatus's card text, and Advanced Manual E-06.

The Q&A says Dedechange cannot be used when Dedenne-GX is played from hand while Path to the Peak is already in play. That is the same timing pattern as a Basic Pokémon entering play with an on-play Ability under a continuous Ability suppressor. Combined with Klefki's text (all Basic Pokémon in play on both sides have no Abilities while Klefki is Active), this strongly establishes that Radiant Eternatus's Climactic Gate is unavailable under a live Active Klefki. It is an official-ruling analogy, not a direct FAQ naming the pair.

This closes the prior paper-timing uncertainty sufficiently for policy behavior: treat Active Klefki as a hard Gate lock, regardless of side. Twinleaf's current pre-placement prompt ordering may still be an engine mismatch; a research-side hook and test should suppress the prompt before Radiant is inserted. No code, fixture, or game is authorized by this note.

PR comment: https://github.com/FlareZ123/experiment-01/pull/69#issuecomment-7157150463
