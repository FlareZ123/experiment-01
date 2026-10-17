# Agent 35: preregistered authentic rank-8 Latias escape counterfactual

**17 October 2026 UTC, normal research mode. Pre-dispatch design.** No qualified game or win-rate evidence.

## Why this source position

The frozen benchmark 60 is Aichi rank 1 champion Shadow Rider Calyrex. The opponent is the **exact published Aichi rank 8 Yusuke Kobayashi Absol/Garbodor 60**. The v3 comparison protocol fixes pilot:8:0:champion-reference:A, physical benchmark seat A and PRNG seed **3755937400**. The original [source-dealt artifact 39041216040](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040) is the observational reference, but its archived policy revision differs from a new dispatch's head. Source archive revision 0de5fdf1965dbc388cebe65dff400cb5a5494b9c; pinned engine a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

In the reference game, candidate Passes at global turns **21, 23, 25, 27** while Active Latias ex carries two Psychic, Benched Trevenant & Dusknoir-GX carries three Psychic, candidate holds Field Blower, and an opposing Benched Garbodor holds Float Stone. [Source-hand and public-board audit](rank8-latias-escape-window.md). Four repeated turns are one correlated physical game, not four independent observations.

## Falsifiable experiment

The new research-owned scripts [policy](../../simulation/twinleaf/rank8-latias-escape-policy.cjs) and [full-deal fork](../../simulation/twinleaf/rank8-latias-escape-fork.cjs) select the first matching **already chosen Pass** on one of those four turns. Selection reads only visible board and acting player's own hand. In the unchanged natural source deal, three different paths are run:

1. **Control:** unchanged pinned bot.
2. **Tool branch:** Field Blower targeting Garbodor's Float Stone, then normal Latias retreat to three-Psychic Trevenant & Dusknoir-GX, then its printed Night Watch attack.
3. **Paid-retreat branch:** bypass Field Blower and directly spend Latias's attached Energy to retreat to the same attacker, then attempt Night Watch.

The branches are mutually exclusive full games from the same seed and source 60s, never spliced together. The controller intercepts a source Pass only and uses genuine PlayCardAction, ResolvePromptAction, RetreatAction and AttackAction. A pre/post unchanged-source run checks for same-process observer/override contamination; the first raw Store dispatch divergence should be the selected Pass replaced by an action on that same global turn. A different initial turn, missing conjunction, an earlier action divergence, an invalid Store declaration, absent Tool-selection prompt, failed retreat, unavailable attack, or inability to reproduce baseline is reported as a **failure to demonstrate the proposed line**, never silently deemed legal or strategically optimal.

**Outcome accounting:** Save JSON under the manual [Garbotoxin cross-lock workflow](../../.github/workflows/aichi-garbotoxin-crosslock.yml) artifact rank8-latias-source-escape-fork, including source opportunities, branch actions, first dispatch divergence, captured terminal state and failure mode. Source mismatch can arise from policy drift and must not be misreported as refutation of the original archived position. An accepted attack is not proof the line was strategically superior. All branches use the same unqualified generic opponent bot. No game from this test is eligible for 99.5% or Top-32 competitive inference without later paper-rule and policy validation.

## Primary acceptance criterion

At least one authentic source Pass should be converted into the entire **Field Blower -> Tool selected and removed -> Retreat -> Night Watch** ordered action chain, with unchanged earlier root Store dispatches. The paid-retreat route is the essential control: if the source Store accepts Retreat and Night Watch without Field Blower, then Field Blower itself has no immediate attack-access necessity in that state. A successful control route could reframe the observed pass as a general multi-action planning defect. If both fail, first identify the exact Store rejection and check the paper card text before concluding either route is impossible.

This experiment targets a single high-impact policy qualification blocker and carries no performance claim.


## Executed result, 17 October 16:06 UTC

[Compiled manual CI 39047711587](https://github.com/FlareZ123/experiment-01/actions/runs/39047711587) **passed** at exact source revision 0d24436d74b3bffcbe74cef483998066963ad8ac; source engine pinned a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. Artifact [12106677145](https://github.com/FlareZ123/experiment-01/actions/runs/39047711587/artifacts/12106677145), ZIP SHA-256 0075febae0d49a79e9cfd247e7b8a22fa0cee653f1c021120f0f124248846d22, internal JSON SHA-256 7fa91cd82f8363c4ad3fac16639d424d0e10570e7d5a076450f161021ec14531. Previous [first run 39047445869](https://github.com/FlareZ123/experiment-01/actions/runs/39047445869) **failed** before the fork because the new prefilter incorrectly treated PokemonCardList.tools as an object containing cards; the actual pinned representation is an array. The source test and implementation were both corrected in commits 1a780b1 and 0d24436. This is a research fixture bug, not evidence against a card interaction.

The unchanged v3 source is reproduced exactly: champion physically A, **actual first**, global turns **21/23/25/27** all contain the previously archived Pass with Field Blower in own hand. The same-game repeat after both experiments produced identical full action traces. The first actual Store dispatch diverged at **ordinal 138, turn 21**, from the previously selected PassTurnAction in each fork. There was no preceding root Store dispatch divergence.

| Branch | Verified intervened action sequence at turn 21 | Terminal engine turn | Terminal Prizes remaining, candidate/opponent |
| --- | --- | ---: | ---: |
| Control | Original Pass | 45 | 0 / 2 |
| Remove Tool | Field Blower -> resolved ChoosePokemonPrompt 85 targeting Garbodor's Float Stone -> RetreatAction -> Night Watch AttackAction | 29 | 0 / 6 |
| Pay retreat | RetreatAction with existing two Psychic -> Night Watch AttackAction | 31 | 0 / 6 |

All three completed with winner seat **A / candidate**, so the result does **not** show an altered win/loss for this deal. The two branches differ in Energy and Item expenditure and induce different later generic-bot paths. The near-term printed attack was accessible with paid retreat **without first removing Garbotoxin**. The successful Tool branch only demonstrates a viable longer alternative, not a necessity or that it dominates the paid-retreat route.

**Key corrected conclusion:** A frozen actual opponent deal contains a missed **Retreat -> attack** two-action opportunity. The historical Pass is not explained solely by a missing Field Blower multi-action unlock. Policy scoring/horizon failure is a strong hypothesis; we have demonstrated an executable omitted line, but no independent claim of strategic dominance against a competent opponent or of paper-perfect engine effects.

**Qualifications remaining:** This record uses one correlated natural deal, the pinned and incomplete Twinleaf engine, a research policy hook, and the same generic opposing bot. The order of root dispatches and source-zone/effect digests were compared for prefix control, but a complete proof of Store clone semantics, opaque continuation closure isolation and opponent tactical competence is absent. Current field-wide opponent exact lists **29/32**; qualified competitive game count **zero**; the aspirational **99.5%** is not demonstrated. Next test should capture action-by-action Energy payment, immediate Night Watch damage and two-card random hand effect, plus whether the opponent has a capable response on its next turn. That is required before promoting either branch to competitive-policy evidence.


## Exact immediate-effect ledger and first opponent reply

An additional **read-only root Store action observer** now records action-indexed pre/post public board, acting player Energy and Tool state, and hidden-zone *counts only*. [Manual compiled CI 39048566364](https://github.com/FlareZ123/experiment-01/actions/runs/39048566364) **passed**, head SHA 8d31b7854687ef62958a2d3fc3404388ebc57b53; artifact [12107115550](https://github.com/FlareZ123/experiment-01/actions/runs/39048566364/artifacts/12107115550), ZIP SHA-256 3066f80c18f5f4e9c911f2527c4ce2eb5cdc021709cd559ba561201e9a4387e9, JSON SHA-256 2fa9625bfa3685cad629dce384bbabd5a4deee6397f60741daf8fcb4d89b26be. The same original control replayed unchanged in process and each branch still diverged only at live Store action ordinal 138, turn21.

**Tool removal route:** At ordinal138 Field Blower was accepted. A SelectOptionPrompt resolved at139 and ChoosePokemonPrompt resolved at140, where the actual Float Stone left opposing Benched Garbodor. At ordinal141 Latias legally retreated to Trevenant & Dusknoir-GX while **retaining its two Psychic Energy** on the Bench. Night Watch was declared at142, selected two opposing hand cards at143, revealed/shuffled through successive prompts, and ultimately put **150 damage** on opposing Active Crobat V. In the immediate hand-selection effect, opponent hand moved **7 -> 5** cards and deck **32 -> 34** (before subsequent turn draw). The opponent's next observed turn played **Float Stone again**, then **VS Seeker**, then passed; this is concrete retool counterplay, albeit generated by an unqualified bot.

**Paid-retreat route:** At ordinal138, Latias moved to Bench with **zero attached Energy**, its previously attached two Psychic discarded as retreat cost, while Garbodor **retained Float Stone**. At ordinal139 Night Watch was declared, two opponent hand cards were selected and shuffled from hand into deck, then **150 damage** was placed on opposing Active Crobat V. Again the immediate opponent hand and deck counts moved **7 -> 5** and **32 -> 34**. Opponent's next recorded action was VS Seeker followed by Pass. The paid line saved Field Blower while spending two Psychic, a materially different cost from the Tool route.

**Attack semantics caveat:** Independent [Night Watch pinned-reducer audit](../twinleaf/night-watch-random-hand-semantics.md) already demonstrated the engine's ordinary ChooseCardsPrompt allows **scored choice of two hidden cards**, contrary to printed **random two-card selection**. The observed two-card zone counts and 150 damage are consistent with the printed effect, but the *identities* of the cards chosen in these source continuations may be biased. Neither branch's later terminal outcome can be promoted to realistic competitive evidence. An existing isolated [random-selection compatibility hook](../../simulation/twinleaf/night-watch-random-hook.cjs) provides a well-defined next same-deal contrast; it must be enabled at the actual intervention moment to preserve the original source prefix. This is independent from action legality, which succeeded in both routes.
