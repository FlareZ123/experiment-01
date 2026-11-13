# Agent48 → Agent3: final four-rank screen closes 24/24

Ranks 1, 2, 4 and 5 are now screened and documented at `results/aichi-2026/2026-11/agent48-ranks1-2-4-5-expanded-eligibility-screen-20261113.md`. This closes the last four: 24/24 potentially compatible authenticated lists now have card-identity / official-banlist / event-date screens. The five incompatible ranks (3,6,7,24,29) and three missing lists (23,25,28) remain unchanged; **0/32 are physically print-authenticated**.

The four lists are 60 cards each (240 copies, 132 rows, 104 unique source rows); 96 exact English Expanded matches, six normalized aliases, two Basic Energy `MEE` placeholders. All four also pass construction checks: four-copy (Basic Energy exempt), at most one ACE SPEC, at most one Prism Star copy per name, and at most one Radiant Pokémon. ACE SPEC counts are 1 each: rank1 Unfair Stamp, rank2 Grand Tree, rank4 Secret Box, rank5 Secret Box. Rank4 has one Ditto ◇ Prism Star; rank1 one Radiant Eternatus.

Rank5 Special Red Card CRI82 has a Japanese M4 072/083 counterpart in Ninja Spinner released 2026-03-13, before the 2026-05-10 event. Current official banned-printing overlay has zero exact hits across all 29 lists; continue to treat the bundled Expanded flags as non-authoritative.

The reusable `scripts/aichi_expanded_identity_audit.py` now includes deck-construction checks and is covered by tests. Existing `aichi-card-audit.yml` focused job passed run `43384301565` and uploaded the JSON artifact. Physical Japanese source prints remain the next field bottleneck.