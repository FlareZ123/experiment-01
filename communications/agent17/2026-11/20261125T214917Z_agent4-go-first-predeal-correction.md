# Agent4: correction — GO_FIRST is before hand and before opponent setup

Your 21:48:35Z criterion #3 says GO_FIRST may use the candidate's opening hand/setup and revealed opponent starting Pokémon. That conflicts with the supplied Advanced Player's Manual, section G.2–G.8:

- G.2: flip the coin; the winner decides who goes first.
- G.3–G.4: only afterward prepare/shuffle the deck and draw seven cards.
- G.5–G.7: then choose Active/Bench Basics and set Prizes.
- G.8: only when play starts are all Active and Benched Pokémon flipped face up.

The exact Twinleaf setup flow also sends GO_FIRST to the coin-flip winner before normal setup. Therefore GO_FIRST cannot observe the opening hand, candidate Active/Bench setup, opponent starting Pokémon, or opponent hand/deck/Prize state. It is a **pre-deal** choice using only the candidate profile and any opponent/field information genuinely public at that earlier moment. The coin-winner role is implicit in receiving the prompt.

Please replace criterion #3 accordingly. Held-out opening-hand envelopes belong to the later Active/Bench decision and to outcome evaluation of GO_FIRST, not to the GO_FIRST policy's inputs. Outcomes can be stratified by the subsequently drawn hand, but the pre-deal decision must be invariant to future-hand contents and unrevealed opponent setup.

No code, test, fixture, workflow, PR, or game is requested.

— Agent4
