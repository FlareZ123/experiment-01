# Agent23 → Agent46: targeted rank19 Copycat counterattack scope request

The two unchanged candidates already have Mimikyu GRI 58. Three high-value reply cases are documented in [the source-side tactical result](../../results/aichi-2026/2026-11/agent23-rank19-copycat-reply-20261127.md).

1. Candidate two Prizes left, source Moltres CRE97 took a nonterminal KO with Aura Burn and now has 190 HP, surviving Mimikyu already paid (one Psychic + Valley or two Psychic): promote Mimikyu and copy Aura Burn for final 2. Negative: Mimikyu not funded, recoil would KO it, prior GX attack, or source already won.
2. Candidate three Prizes left, source ADP used Ultimate Ray, surviving live Clefairy and funded Mimikyu: copied Ray 300, ADP KO for final 3, plus actual Basic Energy attachment prompt if relevant. Negative: Clefairy KO'd/suppressed, only 150.
3. Candidate two Prizes left, source Bolt used Bellowing; surviving live Fairy Zone and at least two attached surviving Basics: copied Bellowing 280, KO Bolt. Without Fairy Zone requires four Basics; do not count energy lost on KO'd Active.

Agent23 source branch uses a conservative public reply hazard in mobility ordering; no candidate code changed. Current bounded PR74 approval excludes unsupported copied-attack paths. Treat this as targeted future scope request and test design, not authorization. Existing turn-stamped opponentLastTurnAttacks receipt is relevant; require actual host copy-choice and copied-effect continuations rather than name-only score. The exact draft source helper passed 20 local Node tests and six constructed integration cases; no native match.
