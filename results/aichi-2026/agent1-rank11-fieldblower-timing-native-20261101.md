# When should the original rank1 Shadow Rider use its single Field Blower against rank11 Garbotoxin?

**Agent 1 | 1 November 2026 | one retrospectively selected original physical source deal, registered three-arm same-seed native policy experiment | zero competitive-qualified games**

## Pre-registered question

The [source's native turn-3 relock counterfactual](agent1-source-garbotoxin-turn3-native-retool-counterfactual-20261101.md) found that rank11's unmodified bot can use **Back Order to fetch two Float Stones and re-equip Garbodor** on its very first turn after rank1 uses its single held Field Blower. A removal on rank1's first turn (global turn 2) therefore gives a limited Ability-unlocked window. Could the original rank1 recipient preserve the same Field Blower for its second turn (global turn 4), after VMAX evolution becomes possible, and does the actual original Store support a later Tool removal?

The [three-arm registration](registrations/agent1-rank11-fieldblower-timing-20261101.json) was committed **before** the opt-in timing modifier and native run. It holds the same original rank11 Wataru Yano Absol/Garbodor 60, original rank1 Yasunori Kato Shadow Rider 60, exact rank11 source-opening source K0 hand SHA-256 and Bench at frozen index299 seed2387754768, and Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The first-turn source card-conditioned multi-step plan is identical in all three arms and deliberately approved by an external experimental callback. The rank11 bot's actual turn-3 and later decisions otherwise remain unmodified.

The only planned difference is the recipient's native **automatic** Field Blower policy:

1. Immediate: first allowed global turn 2.
2. Deferred: first allowed global turn 4.
3. Generic control: disable extra automatic Field Blower, using the unmodified native bot for all recipient actions.

An opt-in `earliestFieldBlowerTurn` parameter was added to [the existing research-owned opponent tactical adapter](../../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs), defaulting to zero to preserve historical behavior. It still checks the actual acting recipient's **own held card**, opposing public Tool-bearing Garbotoxin, actual native Item legality and owner-authenticated prompt target. The minimum-turn policy does not make an unavailable card playable or remove a real native prompt.

## Complete compiled three-arm evidence

The [registered native executable](../../simulation/evaluation/agent1-rank11-blower-timing-three-native.cjs) completed **3/3 original K0 source replays**, with no Store exceptions, no source first-turn setup failure and all prior 11-action source plans settled. Manual [CI 41347909641](https://github.com/FlareZ123/experiment-01/actions/runs/41347909641) **SUCCESS** at tested head `b75dcf08e346a4f0a771c0e4c52fe4ea702029d6`. Complete [three-arm JSON artifact 13099957882](https://github.com/FlareZ123/experiment-01/actions/runs/41347909641/artifacts/13099957882), archived ZIP digest `sha256:dd06473a94f7dcafd80f5fc7d8f236d079977b68c2355a15f2e4234e39b0afd2`.

| Real native evidence | Immediate turn2 | Deferred turn4 | Generic |
| --- | ---: | ---: | ---: |
| Rank1 owner actually holding Field Blower at first turn4 root | 0 | **1** | **1** |
| Actual native rank1 Field Blower PlayCardAction / Tool-removal on turn2 | **1 / 1** | 0 / 0 | 0 / 0 |
| Original rank11 Garbodor has Float Stone at its first turn3 owner root | No | **Yes** | **Yes** |
| Original source Garbodor has Float Stone in rank1's first turn4 public snapshot | **Yes** (source re-equipped) | **Yes** (still equipped) | **Yes** (still equipped) |
| Actual rank1 Field Blower PlayCardAction / confirmed Tool-removal on turn4 | 0 / 0 | **1 / 1** | 0 / 0 |
| Observed rank1 turn4 UseAbilityAction roots | 0 | 0 | 0 |

The **deferred** owner did physically preserve the single original `Field Blower GRI` through turn2 and the source's turn3. At its next legal real turn4, its native tactical policy played that very same card and confirmed removal of source Garbodor's Float Stone; after the effect it accepted a Psychic Energy attachment and ended its turn. The generic owner retained Field Blower at turn4 but never proposed it. The immediate owner had already consumed its copy on turn2; rank11 had relocked with a fresh Float Stone on turn3.

This is a **temporal option demonstration** on identical original paper inventories, not a proof that holding Field Blower is stronger than immediately using it. None of the observed rank1 turn4 continuations included a native Ability use. Whether such an Ability line was actually available, whether one would be beneficial, and whether source re-equips again after the deferred break remain open.

## Transfer to evaluation

Treat `Field Blower` as a **one-use timing resource** whose strategic value depends on the board's evolving Ability payloads, search/discard consequences, the source's relock access, the recipient's other hand actions, and later source/recipient turns. A generic bot's ability to retain a card is neither evidence of deliberate resource protection nor evidence that choosing the Tool-removal turn is optimal. The observed unlock at turn4 is mechanically valid and a distinct temporal state from the turn2 unlock. Future common policy work should compare the *actually available* immediate uses of enabled Abilities and opponent responses, with the same owner hand and paper legality constraints; no universal ranking of the three arms follows.

**Global research qualification:** Original Aichi field 29/32 exact physical lists (missing final ranks 23,25,28), zero competitively qualified games, no supported fixed 60-card deck achieving the target.
