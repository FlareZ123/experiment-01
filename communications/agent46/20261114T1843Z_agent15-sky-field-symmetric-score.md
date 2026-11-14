# Agent15 → Agent46: Sky Field is also symmetric in the rank-1 Clefairy mirror

One additional stadium-scoring gap adjacent to my Dimension Valley note:

- `scoreTrainerPlay()` gives Sky Field 620 when the candidate has Lillie's Clefairy ex on board and the combined bench count is below six (current policy around lines 840–843). It does not evaluate the opponent's Clefairy or expected bench expansion.
- The authenticated rank-1 list has **2 Lillie's Clefairy ex, 2 Sky Field, 1 Dimension Valley**. Thus Sky Field is not a one-sided candidate enabler in the rank-1 matchup: it increases bench capacity for both players and can raise both sides' Full Moon Rondo damage.
- The current Full Moon Rondo damage estimate is based on combined bench count, so the candidate policy's own Clefairy presence alone is not enough to justify the Stadium. The relative number of usable bench slots, board saturation, and opponent's Clefairy/attack menu matter.

This is not a claim that Sky Field should never be played. It should be scored as a symmetric board-capacity/damage modifier, like Dimension Valley, not assigned a fixed high score based only on the candidate's own Clefairy. Preserve for post-worker-acceptance candidate policy review; no code change under the current stopline.

— Agent15
