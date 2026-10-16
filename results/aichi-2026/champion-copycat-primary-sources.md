# Champion Copycat counterline: official evidence

Agent 1, 16 October 2026. This is a paper-Expanded rules audit, not a measured match result.

## Primary evidence

- Official Japanese Pokemon TCG FAQ: https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%BE%E3%83%AD%E3%82%A2%E3%83%BC%E3%82%AFBREAK&regulation_faq_main_item1=all . The Zoroark BREAK Foul Play Q&A explicitly says that Mimikyu Copycat reproduces Foul Play even when the previous Foul Play copied Gaia Volcano. The player then chooses a fresh attack for the reproduced Foul Play. This is a direct precedent for Copycat-of-copy and for retaining the original declared attack's identity.
- The same official FAQ says that a GX attack chosen through Foul Play consumes the user's once-per-game GX allowance, and cannot be chosen after the player already used GX.
- Official champion interview: https://www.pokemon-card.com/info/005499.html . CL Aichi May 2026 Open winner Yasunori Kato confirms that Mimikyu Copycat used opponent Regidrago VSTAR's Apex Dragon to reverse a game, and says Mimikyu plus Dialga-GX were deliberate choices.
- Champion's testing teammate, 16 May 2026: https://torecacampmedia.com/ . Aripoke's article titled CL2026 Aichi May Expanded Shadow Rider VMAX tuning explicitly describes the full Mimikyu Copycat -> opponent Apex Dragon -> own discarded Dialga-GX Timeless-GX route, followed by a bonus-turn Copycat -> Apex Dragon -> own discarded Radiant Eternatus Power Beam. The article claims a major improvement against Regidrago and substantial difficulty against Absol Garbodor. These are first-person qualitative reports, not measured win rates.
- Supplied Advanced Player's Rulebook 3.4 section II-C-18 says an attack copying another attack retains the name of the originally declared attack.

## Technical conclusions

Mimikyu's Copycat excludes the opponent's last declared GX attack. Regidrago's Apex Dragon is non-GX even when its chosen payload is a GX attack. Mimikyu may copy Apex Dragon and select attacks from Dragon Pokemon in its **own** discard. Selecting Timeless-GX requires an unused GX allowance and should mark it spent and grant the extra turn. If Lillie's Clefairy ex Fairy Zone is working, Mimikyu's Psychic damage of 150 doubles to 300 against an opposing Dragon, sufficient for a 280 HP Regidrago VSTAR. Copycat selecting Radiant Eternatus's Power Beam on the bonus turn can deal 200 base or 400 against the same Psychic-weak Dragon.

## Simulator gate

The existing [Twinleaf audit](../twinleaf/mimikyu-apex-copycat-audit.md) reports that an opt-in hook reaches 150 damage but does not set usedGX. That is an incomplete correction. A real-state acceptance test needs to verify the GX marker, bonus-turn skip, opponent last-attack persistence, a second non-GX payload, own-discard ownership, and negative cases (opponent GX declaration, own usedGX, absent payload, Fairy Zone under Ability lock). Keep patches outside vendor and do not use defective game results to infer matchup strength.

**Evidence confidence:** high for the paper copy-of-copy rule and copied GX marker; high for the champion's documented strategy; no fully passing nested engine fixture and no quantitative matchup outcomes.
