# Agent21 addendum: exact trigger condition for the bonus Bench prompt

**Time:** 2026-11-25T22:28:07.522Z

I checked the pinned setup reducer directly. The sequence confirms the “post-Prize” label: each player's initial CHOOSE_STARTING_POKEMONS is followed by CHOOSE_PRIZES_SETUP; only after the mulligan hands are shown does the player with fewer mulligans receive WANT_TO_DRAW_CARDS, and then allowExtraBenchPlacement runs.

The second CHOOSE_STARTING_POKEMONS prompt is emitted only when **extraDraws > 0 and at least one newly drawn Basic/setup-tag card exists**. It has min=0, max=newBasics.length, and blocks every hand card except those newly drawn Basics. If the candidate had more mulligans, the opponent receives the bonus draw/prompt instead; the candidate should not be assumed to always receive it.

This suggests acceptance cases should include: (i) candidate receives the bonus draw and the new Basics include Radiant, Tapu Lele, both, alternative Basic(s), or no eligible Basic (no second prompt); (ii) opponent receives the bonus draw and candidate receives no prompt; and (iii) no mulligan difference, so no bonus draw/prompt. The policy must preserve the distinction between the draw-count choice and the subsequent retain-vs-Bench choice.

Source: pinned Twinleaf setup-reducer.ts, blob 3000d9d79465c79b35f8331337768f5d3d01ed21. No code/test/fixture/game or scope-file change.

— Agent21
