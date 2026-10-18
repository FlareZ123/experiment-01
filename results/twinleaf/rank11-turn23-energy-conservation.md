# Rank-11 nonterminal Poltergeist reply: zero accessible basic Energy at the observed Pass

**Agent 8, 18 October 2026.** Independent source-count and rule-text audit of Agent 35's existing authentic nonterminal copied-attack packet. This is a **negative policy-accusation test** and source-level card-conservation proof, not a strategically qualified opponent turn or game.

## Fixed source and reproducibility

- Original source game: exact registered **rank 11 Wataru Yano Absol/Garbodor** 60 versus **New Moon Lockbreaker English mechanics proxy** 60. Rank 11 physical A actually started first. New Moon physical B started second.
- Source seed `1111464409`, retrospectively selected; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Independent input: full actual-source rank-11 card roster in `results/aichi-2026/full-decklists.json` and [source-dealt compiled artifact 12147813055](https://github.com/FlareZ123/experiment-01/actions/runs/39158329417/artifacts/12147813055), ZIP SHA-256 `e625e90bc7910bcebd1271cf94fd9f6386d26cd31e057d795d4b8693bd364e41`. I downloaded the ZIP and inspected the actual `nonterminalCopiedResponse.beforePublicBoard[0]`, `afterPublicBoard[0]`, and complete `opponentRootActions`.
- Versioned excerpt `results/twinleaf/rank11-turn23-energy-exhaustion-source.json`; mechanically check with `scripts/rank11-source-energy-exhaustion.cjs` and `tests/rank11-source-energy-exhaustion.test.cjs`. The excerpt is a transcription of the actual artifact; the raw CI artifact remains primary evidence.

## Exact source resource conservation

The published rank-11 60 contains **exactly eight Energy cards, all basic Darkness Energy**; it contains **zero Special Energy**. At global turn **22**, before candidate's actual Perfection-copied Gengar & Mimikyu-GX **Poltergeist** at Store ordinal **210**, source rank11 had:

| Source Pokémon | Physical attached Darkness Energy |
| --- | ---: |
| Active Mega Absol ex (about to be KO'd) | 3 |
| Benched Oranguru V | 1 |
| Benched Crobat V | 1 |
| Benched Latias ex | 0 |
| Benched Garbodor | 2 |
| Benched second Mega Absol ex | 1 |
| Benched third Mega Absol ex | 0 |
| **Total in play** | **8 / 8** |

All eight physical Darkness Energy were visibly in play. There was **no Darkness Energy in hand, deck, Prizes or discard** at this pre-attack boundary under ordinary fixed-card ownership. Poltergeist did 300 printed base damage to a Mega Absol ex with 130 HP remaining, and the Store discarded the KO'd Active and its **three attached Darkness Energy**, taking three Prizes for the Mega ex KO.

The newly promoted Mega Absol ex had **one Darkness Energy**. Source turn **23** records Float Stone (ordinal 217), Shopping Center replacing Sky Field (218), candidate Bench discard prompt (219), Marnie (220 plus resolution prompts), and **Pass** (223). No `Super Rod`, `Dark Patch`, search, Energy attachment, retreat, switch, or other recovery action appears in the complete Store root ledger for this turn. Float Stone, Shopping Center and Marnie do not return discarded Darkness Energy to the hand or deck. The Marnie draw therefore cannot yield Basic Darkness Energy: all eight are already in play or discard.

The observed promoted Mega Absol ex still has just one Darkness Energy for its printed attacks: **Terminal Period** costs Darkness + Colorless; **Claw of Darkness** costs two Darkness + Colorless. On that actual board, with no Energy recovery or attachment executed, **neither printed attack was immediately payable**. Its Pass is not evidence that the generic bot overlooked a currently powered attack or an ordinary Basic Darkness Energy attachment in hand.

## Distinctions and remaining uncertainty

This conservation result does **not** certify rank-11's turn as optimal. A different earlier sequence could have preserved attached Energy or used a different attacker. Later or alternative actions could exploit discarded Energy via Dark Patch onto a **Benched** Darkness Pokémon, or sequence switching/gust effects. Whether any such counterfactual was legally reachable, information-set-correct or tactically superior remains untested. The other source cards potentially in hand after Marnie have not been replayed from a source-personal perspective, and a new `simulation/twinleaf/rank11-turn23-pass-resource-audit.cjs` is ready to capture that perspective from the original real source run without altering gameplay.

The current source Pass is a **resource-constrained negative control**. It should not be called an opponent-policy success or failure without comparing legally payable alternatives. The copied-attack fixture is retrospective, has a specified native-Gengar opening pivot, and remains unsuitable for aggregate win-rate claims.

**Outcome boundary:** 29/32 exact opposing 60s, **zero competitively qualified games**, and no established 99.5% fixed-deck win rate.
