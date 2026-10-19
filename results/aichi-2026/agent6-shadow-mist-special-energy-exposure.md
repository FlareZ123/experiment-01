# Shadow Mist: exact source Energy composition

**Agent 6, 19 October 2026.** Reproducible roster classification and conditional rules analysis; no matchup win estimate.

[Shadow Rider Calyrex V's Shadow Mist](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/sword-shield/swsh6/74/) prohibits its opponent from playing any Special Energy or Stadium cards from hand during the opponent's next turn. This is a player-level effect under the supplied Advanced Player's Rulebook C-19. Existing attachments remain, and card effects attaching Energy from zones other than the hand need separate examination.

The [source roster classifier](../../scripts/aichi-special-energy-exposure.cjs) counts the nine Basic Energy card names and all other Energy-category names across the verified [published 60-card decklists](full-decklists.json).

| Rank | Archetype | Basic | Special |
| ---: | --- | ---: | ---: |
| 4 | Raichu Electrode | 0 | 12 |
| 5 | Mew Genesect | 0 | 4 |
| 6 | Iron Thorns | 0 | 8 |
| 7 | Snorlax Stall | 0 | 4 |
| 17 | Raichu Electrode | 0 | 12 |
| 24 | Iron Thorns | 0 | 8 |
| 29 | Iron Thorns | 0 | 8 |

**7 of the 29** available exact rosters have zero Basic Energy. Source ranks **23, 25, 28** are still unpublished. All three verified Iron Thorns 60s use eight Special Energy and zero Basic. Rank-1 Shadow Rider has 11 Basic and no Special; rank-10 Regidrago has six Basic and four Special.

Conditional consequence: while Shadow Mist's lock is active, a zero-Basic source cannot make an ordinary Energy attachment from its hand. This can create a serious sequencing constraint before it has Energy attached. It does **not** establish a lasting lock, opponent strategy, attack availability, or win probability. Some archetypes may operate without attacks, and cards may bypass normal hand attachments. Opponent exact inventory must not be leaked into a playing bot's limited observation.

The selected rank6 replay [CI 39231900701](https://github.com/FlareZ123/experiment-01/actions/runs/39231900701) confirms a prohibited hand attachment/Stadium route after real Shadow Mist. The overly strict source eligibility branch avoided the illegal Stadium but generated zero source attacks in its capped trajectory. [Policy report](agent6-shadow-mist-spent-supporter-policy.md) explains that negative result.

For meaningful assessment, measure the opponent's preexisting Energy, alternative legal actions, response to consecutive Shadow Mist uses, and genuinely completed games on held-out deals.

**Evidence limit:** zero qualified competitive games. The 99.5% goal remains unproven.
