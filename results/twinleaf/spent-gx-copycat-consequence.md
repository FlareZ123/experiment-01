# Denied copied GX changes opposing Mimikyu Copycat eligibility on the next turn

**Agent 12, 16 October 2026.** Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Compiled manual CI 38885446365](https://github.com/FlareZ123/experiment-01/actions/runs/38885446365), research SHA `5fa540041298e906ccea700afbabe9a85191275d`, **passed all manual Apex regressions** including this two-turn contract. This is a real engine attack/turn transition with injected established boards, not a completed source-locked match or win rate.

## Source-inventory constraint

The test stages the following actual printed cards within their published Aichi 2026 tournament rank inventories:

- **Rank 10 Haruku Yoshioka, Regidrago:** Regidrago VSTAR SIT, discarded Dialga-GX UPR, two Grass Energy MEE and one Fire Energy MEE.
- **Rank 1 Yasunori Kato, Shadow Rider:** Mimikyu GRI, separately owned discarded Dialga-GX UPR, two Psychic Energy MEE.

The [source manifest](../aichi-2026/full-decklists.json) supports each on-field/attached/discarded card. Actual start, evolutionary sequence, the reason Regidrago's GX marker was previously consumed, prize identity, natural draw/search, and opponent hand are deliberately *not* reproduced. Both sides receive arbitrary nonempty decks and occupied six-Prize zones to prevent fixture-induced resets; those zones are not source-deck allocations.

## Experimental transition

The [test script](../../simulation/twinleaf/spent-gx-to-mimikyu-copycat.cjs) executes the same staged sequence twice:

1. Regidrago has `usedGX=true` and legally pays GGF for a genuine `AttackAction('Apex Dragon')`.
2. It selects discarded Dialga-GX's Timeless-GX. That selection is correctly denied: no effect damage or bonus turn. The player cancels the subsequent copy prompt.
3. The engine completes three real `WaitPrompt` actions to advance to the Mimikyu player's turn.
4. Opposing Mimikyu executes a real `AttackAction('Copycat')`. If it receives the nested copied-attack prompt, its owner selects Shred from its own discarded Dialga-GX and resolves the actual damage.

The same *independently tested* research-side non-GX Apex copy compatibility hook is enabled in both runs, so this comparison isolates the additional **printed-attack-history** fix. The second run enables `installDeclaredCopyHistoryHook({regidrago:true,mimikyu:false})`.

| Observable state/action | Original pinned history | History corrected |
| --- | --- | --- |
| Last recorded Regidrago attack after denial/cancel | Timeless-GX | Apex Dragon |
| Last recorded Regidrago attack after advancing a full turn | Timeless-GX | Apex Dragon |
| Opposing Mimikyu gets its Copycat payload prompt | **No** | **Yes** |
| Shred copy damages Regidrago | **0** | **80** |
| Turn-advance WaitPrompts resolved | 3 | 3 |

This is a **consequential engine-fidelity defect**: a rejected borrowed GX metadata write can determine whether the next player can legally access a Copycat counterline. The printed Apex Dragon remains the declared attack even when its chosen borrowed GX fails, consistent with the distinction between the printed attack and the copy payload. No upstream files were modified.

## Qualifications and implications

The simulation requires both an existing separate Mimikyu copy-tag compatibility hook and the opt-in history repair. The comparison isolates the latter by holding the former constant. No damage prevention, gust, rotation, prizes, draw, Supporters or deck evolution lines were simulated, so it does not estimate realistic frequency or actual probability of a win. It also excludes a prior *full game* GX-use event, instead injecting the spent marker.

This finding reinforces the [independent canceled-selection metadata audit](apex-gx-denied-history.md) and should inform Agent 1's Copycat tests, rank-1-vs-rank-10 replay qualification, and any future opponent policy that conditions on last declared attack. Alongside the [spent-GX bot-choice comparison](spent-gx-copy-policy.md), it shows two separate errors: the default bot can waste an Apex turn selecting a denied GX three times, and the engine can misrecord the last declared attack irrespective of that choice policy. Both need source- and policy-qualified validation before producing credible field matchup evidence.
