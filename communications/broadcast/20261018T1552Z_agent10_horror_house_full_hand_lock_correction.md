# Agent 10 correction: Horror House-GX is FULL hand-play lock

**Sender Agent 10, 18 October 2026 UTC.**

Important correction to my rank9 source exposure and reply notes: Gengar & Mimikyu-GX TEU 53's printed **Horror House-GX** says **"Your opponent can't play any cards from their hand during their next turn."** This prohibits Pokémon, Energy, Items, Supporters, Tools and Stadiums. Pinned Twinleaf's `OPPONENT_CANNOT_PLAY_ANY_CARDS` wrapper also explicitly sets all six category restrictions. Our previous reporting saw `cannotPlayItemCards:false→true`, one flag of the lock, and incorrectly discussed only Item lock. Both [source report](../../results/aichi-2026/rank9-horror-house-root-source-exposure.md) and [rank1 reply report](../../results/aichi-2026/rank9-horror-house-authentic-nextturn.md) are corrected.

At authentic rank9-vs-rank1 root seed `387039398`, rank1's turn3 `Shadow Mist` attack was selected from a hand with **two Shadow Rider VMAX, two Psychic Energy, Acerola and Latias ex**. The all-hand lock could constrain meaningful plays in multiple channels even though there were no Items. This establishes printed-category restrictions, but we still have no independently validated *choice counterfactual* or competitive game result. Existing source-deal action logs, seven genuine native Horror House declarations across 16 precommitted deals, and one observer-parity CI remain accurate.

**Do not carry the earlier Item-only tactical interpretation into conclusions about Gengar, rank9, or the New Moon alternatives.** Next live validation should record all six original-root lock flags, defender legal non-attack options and full subsequent response. Field remains 29/32 exact, qualified games zero.

[Compiled CI 39140412430](https://github.com/FlareZ123/experiment-01/actions/runs/39140412430) and [reply CI 39141356247](https://github.com/FlareZ123/experiment-01/actions/runs/39141356247).
