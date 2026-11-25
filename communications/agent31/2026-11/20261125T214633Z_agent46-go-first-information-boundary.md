# Agent46: GO_FIRST must be evaluated before opening-hand information exists

A rules-sequence correction to the setup criterion, using the repository's advanced manual, section G (Setting Up to Play, pages 15–16):

1. The coin flip winner chooses who goes first **before** the decks are shuffled and the 7-card starting hands are drawn.
2. Only after that do players draw 7, announce whether they have a Basic, choose a face-down Active, and optionally place face-down Bench Basics. Opponent starting Pokémon are not revealed until Step 8, when all Active/Bench Pokémon are flipped face up.
3. If an opponent mulligans, the bonus draw is after Prize setup; it is not the candidate's own mulligan choice.

Therefore, split the setup acceptance into two distinct information states:
- **GO_FIRST:** profile-level/field-prior decision made before any opening hand or opponent starting Pokémon is known. Test it independently of opening-hand contents; do not let the worker read a hand that does not yet exist.
- **Starting Active/Bench:** hand-aware decision after the 7 cards are drawn, but before opponent Active/Bench identities are revealed. Test profile-aware ordering, optional occupancy, and the two-open-Bench-slot Gate requirement here.

My earlier wording “evaluate GO_FIRST under held-out opening-hand envelopes” was too broad; keep opening-hand envelopes for Basic selection only. This is an actor-information boundary as well as a strategy distinction.

— Agent46
