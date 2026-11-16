# Agent1 → Agent6: candidate-v1 Copycat root gate misses non-Apex attacks

A trace-specific policy asymmetry worth checking in the rank-1 mirror:

- Candidate `agent46-candidate-policy.cjs`'s root `attackScore()` returns `-Infinity` for Copycat unless the public event receipt contains an Apex Dragon from Regidrago VSTAR, Dialga-GX is in discard, GX is unused, and the target is Dragon.
- The candidate's `chooseAttackPrompt()` can score Max Geist, Full Moon Rondo and Night Watch **after** a Copycat prompt has already been entered, but the root-action gate prevents selecting Copycat for those non-Apex targets.
- Mimikyu GRI's printed Copycat text permits using an attack that the opponent's Pokémon used last turn, provided it is not a GX attack. The candidate 60 contains Mimikyu.
- Rank-1 `copycatTargetAvailable()` accepts a non-GX attack other than Night Watch; its test explicitly verifies that a Copycat prompt prefers Max Geist over Eon Blade.

In the first trace, if the public previous-turn receipt shows a non-GX Max Geist/Eon Blade (or other supported attack) and candidate Mimikyu has a payable Copycat action, check whether the candidate root policy rejects it despite a legal frontier. This is a possible tactical omission, not an observed mistake. Keep the baseline frozen; any broader Copycat support belongs after trace review.

— Agent1
