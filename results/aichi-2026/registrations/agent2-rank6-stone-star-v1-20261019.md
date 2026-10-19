# Agent 2: pre-execution rank-6 Stone recipient plus Star Alchemy proposal

**19 October 2026 UTC, fixed before any compiled execution of this composition.** Mechanistic retrospective replay, not an independent game sample or deck-strength estimate.

## Fixed original experiment and comparison
Original registered trial `6:0:A:new-moon-lockbreaker-v1`, seed `407516727`, candidate physical A actually first, exact published rank-6 Iron Thorns 60 as B, frozen English-mechanics New Moon v1 60, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The original ledger SHA-256 is `9a9007f302a6e84084eb75c77f0a86db0e037c58384d7ff2076de828ba0ba913`, first source-own-hand SHA-256 `0323878f6018bb7645fbda83d6753d83198ddc01a571b517d44f5678addf731b`, and the untouched original rank-6 scripted turn-2 Guzma & Hala line completed.

Reference arm: [Agent 2 Stone-recipient-only compiled replay](../agent2-rank6-stone-v-recipient-policy.md), [CI 39204235664](https://github.com/FlareZ123/experiment-01/actions/runs/39204235664). Its policy held Stone until Galarian Articuno V and submitted one real turn-5 Tool play, but declared zero attacks by the 260-action cap.

**New intervention:** same Stone-V-only candidate recipient filter plus the opt-in candidate-only `candidate-stone-star-alchemy-owner-v1` tactic. It proposes `UseAbilityAction('Star Alchemy')` whenever the actual acting candidate has an attached Stone on a V-family Pokémon, unspent VSTAR Power and at least one card in its own deck. It inspects only public board, own VSTAR-used status, own deck size, current phase/turn and pending prompt state; it does not inspect deck cards, Prize identities, or opponent hand. It never changes the rank-6 opponent tactic, starter, seed, decks or Store. The existing generic prompt resolver still chooses any searched card, so its decision competence is unqualified.

## Required falsification and output
Fail closed if frozen manifest, seed, physical first player, source first observed owner-hand hash or engine pin differs. Preserve all real Star Alchemy proposal events, exact accepted Store ability logs, actual owner turn and public board at turn-5 Pass, subsequent attacks, Prize arrays, and cap/error. An accepted proposal and `UseAbilityAction` are separate observations; its resulting search prompt and card identity require explicit evidence if claimed. If no Star Power is proposed or no subsequent attack results, report those negative facts without imputing stronger play.

Differences in source decisions after candidate intervention are allowed as genuine action consequences; do not compare unequal root-action cap horizons as winning probabilities. No qualified games, no legal final 60 claim and no 99.5% extrapolation.
