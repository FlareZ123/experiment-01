# Real Store Night Watch effect audit on the authentic rank-11 terminal response

**Agent 3, 18 October 2026. Evidence class:** pinned-source code inspection, independent read-only real Store action boundary journal, compiled single-seed CI. Retrospectively selected successful lock/terminal seed, unqualified for paper-competitive inference.

## Exact replay and source provenance

The [original conditioned-source rank11 versus rank1 experiment](rank11-source-conditioned-rank1-attack-response.md) reported one early held Boost Shake -> Tool-equipped Garbodor opponent line that ended in an engine win for the **unchanged** published rank1 Shadow Rider reference: seed `2809154458`, rank11 physical seat A, rank1 physical seat B, source rank11 **actually second** (`firstTurnSlot=1`). All card/deck inputs came from the repository's printed Aichi Top32 source pool; no staged card/board insertion. The frozen source policy completed its actual on-board lock before that game's later three Night Watch attacks. Other original conditioned seeds were unfinished.

The [manual CI replay 39120240559](https://github.com/FlareZ123/experiment-01/actions/runs/39120240559) passed with pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Artifact [12133763384](https://github.com/FlareZ123/experiment-01/actions/runs/39120240559/artifacts/12133763384) preserves the counts. The experiment used [real Store dispatch journaling](../../simulation/twinleaf/rank11-night-watch-effect-journal.cjs) composed with the established [source policy](../../simulation/twinleaf/rank11-direct-boostshake.cjs), and retained the actual attack declarations from [the executable audit](../../simulation/twinleaf/rank11-night-watch-effect-audit.cjs). No vendor files, state contents, player hands or policy decisions were changed by the observer.

## Net resolved effects, pre- and post-prompt chain

Each Night Watch was a real logged root `AttackAction` by rank1 against rank11. The observer captured public aggregate card counts before the attack and after the first returned state without an unresolved prompt.

| Actual global turn | Rank11 hand | Rank11 deck | Rank11 Active before -> after | Consequence |
| --- | --- | --- | --- | --- |
| 9 | 5 -> **4** | 40 -> **41** | Tapu Lele-GX 0 -> **150 damage** | No KO of 170-HP Lele |
| 11 | 4 -> **3** | 41 -> **42** | Tapu Lele-GX 150 -> Garbodor 0 | Active Lele knocked out; source promotes Garbodor |
| 13 | 1 -> **0** | 45 -> **46** | Garbodor -> no Active | Garbodor knocked out, no replacement; engine awarded winner B |

The first two attacks thus produced net **-1 opponent hand, +1 opponent deck**, despite at least two cards held before each declaration. **These are net boundary observations, not yet proof that the card moved exactly one**: a separate effect could compensate a two-card return within the prompt chain. The third attack sees one held card and properly has net one returned. A follow-up [prompt cardinality audit](../../simulation/twinleaf/rank11-night-watch-effect-audit.cjs) now records every resolution step and selecting prompt's min/max and selected-card count; interpret its compiled evidence before declaring a card implementation bug.

## Paper/card-text and selection-policy risk

The pinned upstream [Trevenant & Dusknoir-GX SMP 217 implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx.ts) states **choose two random cards from opponent's hand**, and sets `cardsToShuffle=Math.min(2, opponent.hand.cards.length)`. It then opens a `ChooseCardsPrompt` addressed to the **attacker** with `cards=opponent.hand`, `isSecret:true`, and fixed min/max `cardsToShuffle`. The printed attack must choose 2 random cards if 2+ are present.

The generic pinned [ChooseCardsPromptResolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/choose-cards-prompt-resolver.ts) ranks **individual actual card objects by `getCardScore(state,prompt.playerId,card)`** before returning the first legal selections. Since this prompt supplies **the opponent's private hand**, the autonomous attacker's selection path appears **card-identity-dependent and potentially information-advantaged**; the card text requires random sampling. This is a concrete evaluator-competence/fidelity risk even if the net one-card count later has an innocent explanation. It requires a targeted randomized resolver correction and real Store isolation testing before games involving Night Watch can be qualified. Do not extrapolate from the successful engine winner.

## Evidentiary limits and response implications

The original source win is a **raw completed Twinleaf engine game** at root action 103, not a demonstrated paper-competitive win. Three observed attack announcements, zero duplicate physical-reference anomalies in the captured run and a terminal winner do not certify effect correctness or opponent policy competence. This seed was deliberately selected because the source lock completed, making it unusable for an unconditional outcome-frequency estimate. It is still valuable for reproducing a state-specific rules/policy failure.

Next validation should inspect the per-step prompt cardinalities, verify the actual two random cards were moved, and compare the unchanged input 60 and seed under an isolated source-compatible, random-identity-blind resolver. Confirmed semantic corrections should be maintained as research-owned adapters and cross-checked on an independent first/second-start source batch. This may change rank11's opportunities and the reference candidate's response, so all previous raw engine terminal counts remain **unqualified**.

Current field remains **29/32 source-complete**, with ranks 23/25/28 unpublished. **No competitive-qualified Aichi game and no evidence of reaching the 99.5% target.**
