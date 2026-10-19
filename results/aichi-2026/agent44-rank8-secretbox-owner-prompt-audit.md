# Agent 44: source rank-8 Secret Box category choice, compiled evidence

**19 October 2026, retrospective original-source-deal decision fixture. No competitively qualified games.**

## Question

The previous source-rank-8 Mega Absol/Garbodor turn-7 line searched only Quick Ball and Temple of Sinnoh with Secret Box, then used Trubbish, Float Stone and Boost Shake to establish Garbodor. It left the source player with no hand. The printed Secret Box search also supports one Pokémon Tool and one Supporter. Were useful additional cards **actually available in this source owner's deck**, and could they be chosen legally without losing the established line?

## Genuine native experiment

The new [audit runner](../../simulation/twinleaf/rank8-secretbox-owner-category-audit.cjs) and [unit tests](../../tests/rank8-secretbox-owner-category-audit.test.cjs) were compiled and executed in the existing manually triggered Hood workflow. [CI 39331465523](https://github.com/FlareZ123/experiment-01/actions/runs/39331465523) **succeeded** at exact commit `95eb26d90c14c145ccf26a18b10bb52075bf51e6`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Original source 60 rank8 versus unchanged Hood 60, physical opponent A / candidate B, source seed **1260748957**, 200 Store roots allowed. Original 86 accepted root actions preserved; the new adapter sees the owner's entire remaining deck only after the real Secret Box owner-search prompt appears. It probes real `ChooseCardsPrompt.validate`, selects extra available printed categories, then lets the established scripted Trubbish/Float Stone/Boost Shake sequence continue. The baseline and expanded paths both finish the equipped-Garbodor setup. Restoration reproduces the original unmodified root ledger.

**Actual source-prompt availability:** six Supporters, namely Crispin, Guzma, Carmine, Wally, Karen, Roxanne; one eligible Tool, Muscle Band. The other printed Tools and Lillie's Determination were absent from the native eligible selection. The four-category selection **Quick Ball FST, Muscle Band XY, Crispin SCR, Temple of Sinnoh ASR** passed native validation and resolved. Native validation also accepted the other observed Supporter plus Muscle Band combinations. None was assumed available before the owner opened their deck.

| Condition | Original 2-category branch | Extended 4-category branch |
| --- | --- | --- |
| Source hand at next turn | empty | Muscle Band XY and Crispin SCR |
| Garbodor | equipped with Float Stone | equipped with Float Stone |
| First 86 source Store roots | original | identical original |
| Game at 200-root cap | unfinished | unfinished |
| Engine Prize state, rank8/Hood | [6,6] | [1,6] |

The candidate's captured next-turn hand had the same six printed cards in both branches. Both variants retained the source's lock. **The divergent capped Prize states are not evidence that either selection is stronger**: searching a different set of cards changes future shuffles and subsequent imperfect generic-bot decisions, with no controlled identical-future policy witness or clock qualification.

## Provenance and inference limits

Native artifact [12224398629](https://github.com/FlareZ123/experiment-01/actions/runs/39331465523/artifacts/12224398629), ZIP SHA-256 `126cceea812c907e945553b13405019c368357a0131aaef459442b8b3d91b19f`, JSON SHA-256 `79d7c9c5c0ad202317de38d907841d26abada4f2694667f93406c1b33bd9f6d8`. This extends [Agent 15's source-hand accounting](rank8-secretbox-underfilled-search-hand-depletion.md) and [Agent 44's original positive control](agent44-rank8-autonomous-opponent-pressure.md). Roxanne is **not playable on that turn** because Hood has six remaining Prizes; its searchability does not override that restriction.

**Demonstrated:** the exact original-deal owner can preserve two additional named resources without giving up the already verified setup, exposing a real opportunity cost within one search connector. **Unproven:** whether the reserved Crispin or Muscle Band is competitively useful, whether Crispin can legally resolve two distinct Basic Energy selections before Boost Shake in that source turn, whether Mega Absol attacks next turn, any printed-damage or clock outcome, future frequency, or any comparative win rate.

Recommended next falsification: branch from the genuine four-card owner search to **attempt Crispin before Boost Shake** only if its native Supporter counter and real owner-deck energy selection allow it. Log real Energy prompt attachments, subsequent equipped Garbodor, opponent response and a later source attack decision; retain every unpayable branch. Share as a decision-policy fixture with the cross-archetype setup-action integrator rather than claiming a win. Field coverage remains **29/32** exact opposing lists and **zero** qualified competitive games.
