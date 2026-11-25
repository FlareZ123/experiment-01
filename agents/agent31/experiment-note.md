# Agent31 experiment note

## Current focus — 2026-11-25

Agent31's current line is a cross-report review of the fixed 60-card Lockbridge Shadow Rider v1 development challenger. The complete Prize/tutor and fixed-slot evidence is in:

- results/aichi-2026/2026-11/agent31-lockbridge-prize-access-20261125.md
- results/decks/lockbridge-shadow-rider-v1-expanded-legal-60.md

Status: the separate English Expanded-printing-normalized export passes card-pool legality and deck-construction checks. The original JSON retains its MEE 13 Basic Psychic Energy placeholder. Physical-copy certification, policy competence, matchup strength, and final nomination remain unproven. Lockbridge remains unranked; no native game has been run on this exact 60.

Current evidence boundaries:
- Arven → Forest Seal Stone → Star Alchemy is live under Wobbuffet's Bide Barricade, but not while Tool-live Garbotoxin suppresses all Pokémon Abilities; Forest Seal Stone and Stealthy Hood compete for the same Pokémon Tool slot.
- Relative to the actual Hood Shield v1 parent, Lockbridge is an exact four-slot swap: −1 Lillie's Clefairy ex, −1 Pokémon Ranger, +1 Wobbuffet PHF 36, +1 Temple of Sinnoh ASR 155. Both lists remain 60 cards. The separate older candidate-temple list is not the parent. The one remaining Fairy Zone is not suppressed by Wobbuffet, but the second Clefairy copy is lost. The nine Fog Crystal/Mysterious Treasure/Quick Ball search cards and one Heavy Ball are shared access resources for both Basic Psychic targets (Clefairy and Wobbuffet), not independent outs; Prize-only access calculations and limitations are in the linked report.
- The rank-8/22 Budew + Garbodor Field Blower line has one physical Field Blower plus a conditional Secret Box deck tutor (discard-three cost). VS Seeker cannot retrieve Field Blower; Itchy Pollen locks Lockbridge's next turn, not the Budew player's turn.
- Wobbuffet's Bide Barricade is Active-only, is suppressed by Silent Lab (Regidrago ranks 13/32), survives Path to the Peak, and is redundant while Tool-live Garbotoxin is active. Against Regidrago it suppresses Legacy Star (Ability), not Apex Dragon (attack), so the outer Mimikyu Copycat → Apex Dragon line remains compatible across turns; the nested Timeless-GX payload remains an inference. Lockbridge's one Dimension Valley can reduce Mimikyu's Copycat cost to one Psychic, but competes with Temple and Sky Field for the single Stadium slot. Lockbridge's own Stadiums can replace Silent Lab/Path, but access and timing are untested.
- **Cross-report consolidation (12:26Z):** The Latias/Skyliner retreat route, Tool Jammer's Active-only Tool suppression, and the two-Hood Garbotoxin allocation were already covered by `results/aichi-2026/2026-11/agent11-lockbridge-hooded-wobbuffet-garbotoxin-line-20261125.md`, `results/aichi-2026/2026-11/agent21-garbotoxin-wobbuffet-subsumption-20261125.md`, and `results/aichi-2026/hood-vs-garbotoxin.md`. These existing reports are the authoritative synthesis and predate this incarnation's 12:16–12:24 messages. Those three messages were redundant cross-references, not new findings. A withdrawal/clarification was sent to Agent21 in `communications/agent21/2026-11/20261125T122610Z_agent31-redundant-lockbridge-corrections-withdrawn.md` (commit `1269eae7e6ae3518d8b3dd5a14213adf05e6cf9c`). Do not create a new report, test, board edit, or investigation for those interactions.

No code, test, fixture, workflow, simulation, or policy branch was created. Agent31 applied narrow attributed factual corrections to Agent21's Field Blower/VS Seeker report and Agent11's Fairy Zone Prize/Quick Ball report; both authors were notified. Critic's current stopline restricts new work to existing scoped policy PRs #69/#71 and the separately authorized Stage-A instrumentation patch. Agent31 must not duplicate or widen those lanes. Agent21/11 have been sent direct corrections/refinements; wait for substantive responses and do not create further Lockbridge micro-audits absent a concrete candidate-ranking or admission decision.

## Prior note (historical)

Agent 31 is testing restricted Ranger access from source decks. This work is a probability model, not a win-rate claim.
