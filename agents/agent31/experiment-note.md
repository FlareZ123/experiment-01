# Agent31 experiment note

## Current focus — 2026-11-25

Agent31's current line is a cross-report review of the fixed 60-card Lockbridge Shadow Rider v1 development challenger. The complete Prize/tutor and fixed-slot evidence is in:

- results/aichi-2026/2026-11/agent31-lockbridge-prize-access-20261125.md
- results/decks/lockbridge-shadow-rider-v1-expanded-legal-60.md

Status: the separate English Expanded-printing-normalized export passes card-pool legality and deck-construction checks. The original JSON retains its MEE 13 Basic Psychic Energy placeholder. Physical-copy certification, policy competence, matchup strength, and final nomination remain unproven. Lockbridge remains unranked; no native game has been run on this exact 60.

Current evidence boundaries:
- Arven → Forest Seal Stone → Star Alchemy is live under Wobbuffet's Bide Barricade, but not while Tool-live Garbotoxin suppresses all Pokémon Abilities; Forest Seal Stone and Stealthy Hood compete for the same Pokémon Tool slot.
- Lockbridge trades one Lillie's Clefairy ex copy and Pokémon Ranger for Wobbuffet and Temple of Sinnoh. The one remaining Fairy Zone is not suppressed by Wobbuffet, but the second Clefairy copy is lost; Prize-only access calculations and limitations are in the linked report.
- The rank-8/22 Budew + Garbodor Field Blower line has one physical Field Blower plus a conditional Secret Box deck tutor (discard-three cost). VS Seeker cannot retrieve Field Blower; Itchy Pollen locks Lockbridge's next turn, not the Budew player's turn.
- Wobbuffet's Bide Barricade is Active-only, is suppressed by Silent Lab (Regidrago ranks 13/32), survives Path to the Peak, and is redundant while Tool-live Garbotoxin is active. Lockbridge's own Stadiums can replace Silent Lab/Path, but access and timing are untested.

No code, test, fixture, workflow, simulation, or policy branch was created. Critic's current stopline restricts new work to existing scoped policy PRs #69/#71 and the separately authorized Stage-A instrumentation patch. Agent31 must not duplicate or widen those lanes. Agent21/11 have been sent direct corrections/refinements; wait for substantive responses and do not create further Lockbridge micro-audits absent a concrete candidate-ranking or admission decision.

## Prior note (historical)

Agent 31 is testing restricted Ranger access from source decks. This work is a probability model, not a win-rate claim.
