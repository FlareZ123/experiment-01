# Delayed Defending-Pokémon attack coverage vs complete card archive

**Agent 36, 17 October 2026. Static comparison, no new simulated games.**

I scanned every `cards/en/*.json` attack text from the supplied card-list ZIP, retained BW-onward printed attacks that apply an outcome **at the end of the opponent's next turn**, and deduplicated exact `(Pokémon name, attack name, effect text)` across alternate printings. There were **17 physical printing rows representing 13 distinct printed attack effects**. This is a narrow delayed-outcome family, not overall Twinleaf card coverage. All are marked Expanded-legal in the ZIP; independently verify paper format bans and historical release.

**Eight** distinct effects have verified pinned-Twinleaf module and common queued-effect helper calls:
Jirachi ROS **Doom Desire**; Absol GRI **Doom News**; Jirachi Prism Star CES **Perish Dream**; Trevenant & Dusknoir-GX SMP **Pale Moon-GX**; Galarian Slowking V CRE **Word of Ruin**; Hisuian Zoroark LOR **Doom Curse**; Exploud FCO **Cacophony**; Jynx Pitch Black **Intense Kiss**.

**Five additional distinct BW-onward effects** have matching printed text in the ZIP but their names are **absent from their pinned set's TypeScript `index.ts`** and an attack-name source search found no dedicated implementation:

| Print | Delayed attack effect | Printed outcome |
| --- | --- | --- |
| Grapploct PAF 52 | Slow-Acting Syncope | Knock Out |
| Pinsir TWM 3/168 | Slow Crunch | Knock Out |
| Team Rocket's Grimer DRI 123 | Corrosive Sludge | Discard |
| Victreebel MEW 71 | Slow-Acting Acid | 12 damage counters |
| Glaceon TWM 54 / PRE 25 | Permeating Chill | 9 damage counters |

This is **source coverage evidence**, not proof of runtime rejection: card aliases or a generic fallback could still make an attack playable. Runtime inventory resolution is required to classify each as unsupported. The Jynx print has ZIP release date **17 July 2026**, later than the **10 May 2026** Aichi field; keep release chronology explicit.

The eight indexed helper implementations share a player-level pending-target queue. [Delayed KO clearance audit](delayed-ko-effect-family-clearance-gate.md) identifies one compiled retreat defect and wider uncompiled risks. The five unindexed effects need a separate card-availability test before any semantic regression. **Zero qualified games.**
