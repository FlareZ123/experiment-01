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

This conservation result does **not** certify rank-11's turn as optimal. A different earlier sequence could have preserved attached Energy or used a different attacker. Later or alternative actions could exploit discarded Energy via Dark Patch onto a **Benched** Darkness Pokémon, or sequence switching/gust effects. Whether any such counterfactual was legally reachable, information-set-correct or tactically superior remains untested. The later compiled source-owner Pass audit below now closes the hand-information question. The availability and quality of alternative **Trainer** sequences remain unproven.

The current source Pass is a **resource-constrained negative control**. It should not be called an opponent-policy success or failure without comparing legally payable alternatives. The copied-attack fixture is retrospective, has a specified native-Gengar opening pivot, and remains unsuitable for aggregate win-rate claims.

**Outcome boundary:** 29/32 exact opposing 60s, **zero competitively qualified games**, and no established 99.5% fixed-deck win rate.


## 19 October follow-up: genuine own-hand Pass audit and full printed-attack frontier

**Evidence update by Agent 8.** The previous pending [manual CI 39159764589](https://github.com/FlareZ123/experiment-01/actions/runs/39159764589) **completed successfully**, at exact head `2e930d97909f6d3638907eaca348d543cf30dcdf`. I downloaded its authentic `rank11-copied-attack-selection` artifact **12148074329**. Archive SHA-256: `f91734b49bdfac50daa9c6ca935c142a791eec44f8a9f56ec92c566106547293`; archived `rank11-copied-attack-selection.json` SHA-256: `11e335adb3cc2f97c4c4fb4720e3ac6124224e3b4d905999ae27860dfcd348ff`. This is the same frozen, selected original game with identical source seed, player assignments and 274-action/turn-36 engine outcome. It is independent **source-own-hand evidence**, not a new gameplay experiment or performance sample.

The read-only `sourceTurn23PassAudit` records the source player's hand immediately before their real `PassTurnAction` at ordinal **223**:

`VS Seeker PHF; Squawkabilly ex PAL; Quick Ball FST; Carmine TWM; Battle VIP Pass FST`.

The earlier actual same-turn owner sequence was **Float Stone 217 → Shopping Center 218 → Marnie 220 → Pass 223**. The Marnie pre-play hand was `Battle VIP Pass, Quick Ball, Professor's Letter, Marnie, Garbodor` with respective archived print identifiers. After Marnie, the owner held **zero Energy cards** and no `Dark Patch`. There was also **no manual Energy attachment root action**. The owner could not make an ordinary Energy attachment from that hand; this resolves the earlier uncertainty without exposing any opponent hidden hand or Prize content. Having played Marnie, Carmine cannot be played as a second ordinary Supporter this turn. The retained Quick Ball/VS Seeker demonstrate why it would still be wrong to call **all available sequencing** exhausted or Pass strategically forced.

An independent read of the very same artifact's `nonterminalCopiedResponse.afterPublicBoard[0]`, immediately after the prior turn-22 KO, establishes the following physical **printed-attack minimum-cost frontier**. Every attached card is a basic Darkness Energy (one unit) and every listed printed attack requires more Energy units than that Pokémon currently holds. The only source actions before Pass played Float Stone, Stadium and Supporter, and did not attach or move Energy; the source already had exactly five Benched Pokémon, so the Stadium's removal of Sky Field cannot force the source to trim its Bench.

| Source Pokémon following prior KO | Attached Energy cards | Smallest printed attack cost in Energy units | Immediate printed attack payable without intervening acceleration? |
| --- | ---: | ---: | --- |
| Active Mega Absol ex | 1 | 2 (Terminal Period) | No |
| Benched Oranguru V | 1 | 3 (Psychic) | No |
| Benched Crobat V | 1 | 2 (Venomous Fang) | No |
| Benched Latias ex | 0 | 3 (Eon Blade) | No |
| Benched Garbodor | 2 | 4 (Offensive Bomb) | No |
| Benched Mega Absol ex | 0 | 2 (Terminal Period) | No |

Thus moving the Active with Float Stone **alone** cannot promote an already-powered printed attacker either. The count-only proof does not depend on assigning a type to numeric attack-cost codes, and the source's Shopping Center does not reduce printed attack costs. The archived same-source board displays **five** remaining Energy in play and the pre-KO source board accounted for all **eight**, with three placed into discard by the KO. This remains a **local mechanical negative control**: an Item line such as `Quick Ball` or a recovery action arranged earlier could change a future turn or board, and no competent alternative-turn policy or real-paper match result has been established. Later Agent 6's [Garbodor Tool-target and candidate-response source forks](rank11-turn23-garbodor-tool-target-contrast.md) separately demonstrate that *where Float Stone goes* is consequential even without any immediate payable printed attack.
