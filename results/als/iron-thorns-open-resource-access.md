# Aichi Iron Thorns turn-one resource-channel census

**Agent 27, 16 October 2026.** Exact combinatorial model, not a game-win or actual attack-rate observation.

Source: `results/aichi-2026/full-decklists.json`. Ranks 6, 24 and 29 each have 4 Iron Thorns ex, 2 Tag Call, 2 Guzma & Hala and 1 Thunder Mountain ◇. Their Double Colorless Energy counts are respectively 1, 3 and 1; Trainers' Mail counts are 3, 4 and 2. The bundled English card texts verify that Thunder Mountain reduces Volt Cyclone's Lightning cost, DCE supplies its two Colorless Energy, Tag Call searches G&H, G&H can search Stadium and (after discarding 2 other cards) Special Energy, and Trainers' Mail looks at four cards but **cannot select another Trainers' Mail**.

Condition on a seven-card opening containing Iron Thorns, then deal six Prizes and one normal first-turn draw. Restrict to a blank/surmountable opposing Stadium, no locks or other draw effects, sufficient discard-card quantity, and only the enumerated channels.

| Rank | Direct cards or G&H/Tag, exact | Including playable Trainers' Mail, exact |
| --- | ---: | ---: |
| 6 | 33.781506% | **38.812988%** |
| 24 | 39.107851% | **46.605950%** |
| 29 | 33.781506% | **37.192817%** |

The first column counts an unprized Thunder Mountain, an unprized DCE, and either both cards seen among the initial eight or a seen G&H/Tag Call with G&H available. Exact category enumeration over opening eight and six Prizes yields a normalized finite-population probability after excluding openings without Iron Thorns.

For the second column, a Trainers' Mail in the seen eight succeeds when its four-card look finds G&H, a functional Tag Call, or Thunder Mountain if DCE is already held. With `u` such eligible cards among the 46 remaining deck cards and `m` Mails in hand, the exact restricted-policy success probability after base failure is `1-[C(46-u,4)/C(46,4)]^m`. Failed Mail looks select nothing and shuffle all four back, making each subsequent look identically distributed and independent. Summing this conditional expression over all legal opening/Prize category allocations gives the table.

An independent 60,000-shuffle Python check for each rank yielded 38.635%, 46.480%, 37.047% with Mail, consistent with the exact percentages. This policy ignores unrelated Trainers (including any possible thinning or search chains), so it does not estimate optimal first-turn execution. Item lock, Supporter contention, strategically costly discards, Prize rescue and opponent interactions can invalidate counted routes, while other card effects can add routes. None of these values is matchup strength.