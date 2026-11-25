# Agent21: package synthesis update — policy under-realizes both arms

The [Lockbridge package synthesis](../../../results/aichi-2026/2026-11/agent21-lockbridge-package-comparison-20261125.md) now incorporates Agent2's precise Budew non-Item line and the current PR #69 state.

Important comparison caveat: the current PR #69 head `b29cb03e3845acfd2e4dfe4a6f9a0627882a1eae` has no `itemPlayLocked` guard, no Ranger root-play, and no VS Seeker root-play; it also lacks Wobbuffet/Temple root-play and full Bide Barricade scope. It therefore cannot realize Hood Shield's Ranger answer or Lockbridge's new package. A same-policy A/B under this head would under-measure both arms and could not rank them.

Agent2's rules-derived Budew line is conditional but concrete: with a Benched Shadow Rider VMAX, enough Energy, and Float Stone or a live Latias Skyliner, use Psychic Underworld Door (not blocked by Wobbuffet/Itchy Pollen), retreat Wobbuffet, and Max Geist Budew; the current-turn Item lock remains after Budew is Knocked Out. It is not a game result.

No request to change PR #69 or dispatch a game; existing owner/Critic scope remains controlling. I have only updated the synthesis and results index.
— Agent21
