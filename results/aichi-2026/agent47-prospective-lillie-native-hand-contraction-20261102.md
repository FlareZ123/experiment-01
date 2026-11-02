# Native Lillie's Determination after Pass: six physical hand-size exchanges, three contractions

**Agent 47 | 2 November 2026 | read-only reanalysis of Agent7's preregistered 16-game native archive.** The original [prospective trial and control/treatment design](agent7-prospective-rank6-lillie-policy-paired-native-20261102.md) was performed by **Agent7**. This report introduces **no new native games, candidate policy, deck card, or opponent**. It analyzes the actual physical zone receipts to quantify the resource-allocation tradeoff that a naive draw-volume metric misses.

## Original evidence

[Original CI 41483117649](https://github.com/FlareZ123/experiment-01/actions/runs/41483117649) **SUCCESS** with original pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Original [raw 16-game artifact 13161380187](https://github.com/FlareZ123/experiment-01/actions/runs/41483117649/artifacts/13161380187) contains the exact file `agent7-rank6-lillie-prospective-paired-output.json`, **72,049 bytes, uncompressed SHA-256 `93f1730901a41bace7729466ee59d21d78f4e012a776684a58bfcdf22485a92f`**, registration SHA-256 `3fb859aa4f45d7675d38724859cae56d070ed3e19d0a520c4079b6ab5fef6364`. Agent7's original eight control/treatment pairs matched **8/8 exact full initial physical deals**. The native Store accepted and fully settled every one of the **six selected candidate Lillie Supporter roots** in five treatment games.

The [pure derived-count verifier](../../scripts/agent47-prospective-lillie-hand-balance.cjs) rechecks every native settled event from the original report; the [compact real-field fixture](../../tests/fixtures/agent47-lillie-native-real-hand-counts-16.json) preserves all six observed before/after hand/deck counts across all eight trial IDs and the original file's SHA for independent regression. It is a filtered archival excerpt, **not a replacement for the complete artifact**. [Negative tests](../../tests/agent47-prospective-lillie-hand-balance.test.cjs) reject unpaired original deals, missing native effects, false deck conservation and inconsistent acceptance counts.

**Executed pure regression:** [Existing manual Agent47 CI 41486548694](https://github.com/FlareZ123/experiment-01/actions/runs/41486548694) **SUCCESS**, registered the new real-field and negative tests alongside the existing research tests. This does not rerun native matches; the original Agent7 compiled artifact remains the sole native evidence.

## The actual six settled candidate decision outcomes

`Hand Δ` means **owner physical cards held immediately after the accepted Supporter resolves minus owner cards held immediately before its play**, including Lillie itself. Positive is an immediate increase. All these cards are shuffled into the deck by Lillie's effect; they are **not discarded** or permanently lost.

| Registered native trial (source rank6) | Global turn | Candidate hand | Candidate deck | Prizes before | Hand Δ | Native treatment result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `6:70:A:champion-reference` | 10 | 11 → 8 | 32 → 34 | 6 | **−3** | Source native win |
| `6:71:A:new-moon-lockbreaker-v1` | 62 | 27 → 8 | 13 → 31 | 6 | **−19** | Action cap |
| `6:72:B:new-moon-lockbreaker-v1` | 3 | 5 → 8 | 43 → 39 | 6 | **+3** | Source native win |
| `6:72:B:new-moon-lockbreaker-v1` | 5 | 5 → 8 | 38 → 34 | 6 | **+3** | Same game as preceding row |
| `6:73:B:champion-reference` | 49 | 22 → 6 | 17 → 32 | 4 | **−16** | Action cap |
| `6:73:B:new-moon-lockbreaker-v1` | 3 | 5 → 8 | 43 → 39 | 6 | **+3** | Source native win |

**Three of six accepted Lillie actions immediately expanded the hand by three cards; three immediately contracted it by 3, 19 and 16 cards.** Across the six *dependent* events the arithmetic hand-count change sums to **−29 cards** (75 prior physical hand slots versus 46 after). This aggregate is purely a count diagnostic: the six actions occur in five native games, with one game contributing twice, and some cards could be drawn again after the shuffle. It is neither an estimate of deck strength nor a quantity of unique resource cards destroyed.

The deterministic check follows the printed `Lillie's Determination M1L` rule. With exactly six Prize cards remaining, the Supporter shuffles the remaining hand back into the deck and draws **eight**; otherwise it draws **six**. For starting owner hand `H` *including Lillie*, and owner deck `D`, after a fully resolved play the printed effect implies:

[
H_{after}=8\text{ if Prizes}=6,\text{ otherwise }6;\qquad
D_{after}=D+H-1-H_{after}.
]

All **six** archived native before/after pairs satisfy these exact relations, show Supporter quota **0→1**, and place the actual Lillie outside its previous owner hand. In the late-turn 22→6 example, the candidate had **four** Prizes remaining, correctly activating six-card draw instead of eight-card draw. A metric that counts every Lillie play as an additional eight acquired cards is mechanically wrong for all six observed plays.

## What this changes in strategy evaluation

This quantifies a concrete form of **Supporter opportunity cost and hand-state-dependent AMR** in actual games. Spending an otherwise available Supporter can replace a large existing hand with a substantially smaller random hand. That cost is amplified when the source player already pressures the candidate and a valuable response card is held. However, **large hand contraction does not prove the choice is strategically dominated**, because a bloated hand may contain dead, unusable or matchup-irrelevant cards and Lillie may reach better necessary cards. A smaller hand can also reduce deck exhaustion risk or enable particular follow-up draw paths. To decide correctly one must observe actual prior-card identities, DCI/UDP under the state, board/Bench/energy needs, available Supporter alternatives and opponent responses.

A new prospective hypothesis for Agent7's already established registration framework is: **score the Lillie replacement by state-dependent expected utility, beginning with actual hand-size exchange plus protected singleton/active response preservation, rather than selecting any payable Lillie whenever the bot would Pass**. A simple `H <= printed draw target` veto would suppress the three contracting plays here, but would still choose the 5→8 play in `6:73:B:new-moon-lockbreaker-v1` whose treatment ended as a *source* native victory instead of a control action cap. Thus **hand-size filtering by itself is not an empirically demonstrated improvement**.

Agent7's prospective original 16 native games recorded **zero candidate native winners** under both policies (control 5 source engine wins plus 3 action caps; Lillie treatment 6 source wins plus 2 caps). No 25-minute paper clock, complete competent opponent policy, or whole-game paper certificate was observed. **Competitive-qualified games remain zero**, and the single fixed-60 99.5% target is unproven.
