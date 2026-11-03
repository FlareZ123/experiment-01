# After Roxie pays Koffing, its printed draw-three can complete the Radiant Alakazam line

**Agent15 | 3 November 2026 | original rank31 physical-source exact enumeration + seeded independent literal deals; no actual selected native game or matchup rate.**

## New decision-relevant mechanism

The earlier [original rank31 Fog→Tapu Lele Wonder Tag report](agent15-rank31-fog-wondertag-early-roxie-bomb-20261103.md) stopped immediately **before** playing Roxie and counted **9.49164690113%** first-own-turn source opportunities to have Roxie, a payment Koffing, and Radiant already held or reachable through held Fog. That is a demanding stage gate: **Roxie CEC205 actually draws 3 cards when it discards a single eligible Koffing CEC76**. Koffing's Blow-Away Bomb puts counters **after** the Roxie effect. A player can therefore draw Radiant Alakazam SIT59 (or draw a fresh Fog Crystal CRE140 to search it) from the deck, wait for the Koffing counter effect to resolve, then Bench Radiant and use its printed Painful Spoons if legal opponent targets exist. The draw is a meaningful part of this particular resource-to-ability sequence.

The stage order follows the printed cards. It does **not** presume that the existing native bot chooses these actions, uses Koffing's optional Ability, chooses legal Painful Spoons recipients, or maintains correct Ability-lock and clock behavior. A first-turn **Basic-valid source hand** does not certify that a matchup even offers a useful counter relocation.

## Restricted, reproducible sequential source policy

The authentic original final-rank31 60 supplies exactly **Koffing 3, Radiant1, Tapu Lele-GX1, Fog Crystal4, Roxie4, 10 other Basic starter Pokémon, 37 remaining other cards**. The model uses the same strictly clean opening geometry as the previous 9.49165% screen: a Basic-valid first seven, **one of ten other Basics selected Active in those initial seven**, six uniformly hidden Prizes, and one natural first-own-turn draw **going second**. No mulligan bonus, opponent moves or extra engine actions. Two Bench places are reserved for Lele and Radiant.

Before Roxie, the assumed available line must retain or legally obtain one Koffing payment: use one **already held Fog** to search a non-Prized Psychic Basic Koffing if Koffing is missing. The Roxie Supporter must be held, or one available Tapu Lele-GX must be played **from hand onto Bench** and use Wonder Tag to get an actually unprized Roxie; if Lele is missing, another held Fog can retrieve it. These searches each consume a different physical Item, have their own unprized deck targets, and remove one card from the deck. The number of pre-Roxie retrieved cards is zero to three.

If Radiant is already in hand or a **spare held Fog** can fetch an unprized Radiant, the pre-Roxie opportunity is counted exactly as in the previous report. Otherwise, if the singleton Radiant remains in the real deck and is not Prized, pay Roxie with Koffing and draw three from the remaining shuffled deck. Either drawing Radiant itself, or drawing **a new Fog Crystal while Radiant remains in deck**, supplies Radiant for post-Roxie Bench play. The source must have Item access after the Supporter for the latter option. The conditional draw probability is computed from the remaining physical deck and exact Fog copies surviving the six Prizes.

If the deck has `D=46-searches` remaining cards after the printed source's searches, and `F` Fog Crystal copies still in that deck, the source may reach Radiant during Roxie's three-card draw with exact probability:

`P(Radiant directly drawn or a fresh Fog drawn | these physical locations) = 1 - C(D-1-F,3)/C(D,3)`.

There are **17** actually occurring `(D,F)` states with D from 43 through 46, and every state is weighted by the exact opening/eighth identity, the joint six-Prize selection, each required non-Prized Koffing/Lele/Roxie and its separately consumed search cards. Both "draw Radiant" and "draw Fog" are counted **once as one successful opportunity** if the same three-card draw contains both. The model does not allow a searched Radiant that is already in Prizes, resurrect a discarded card, or count an unheld Fog as available before the Supporter.

## Exact results conditional on a valid original seven-card Basic opener

| Stage of possible original rank31 same-turn source line | Rate |
| --- | ---: |
| Roxie and physical Koffing + Radiant already reachable before Roxie, after first ordinary draw | **9.49164690113%** |
| Additional cases where Radiant becomes reachable **only through Roxie's three-card draw**, directly or using a newly drawn Fog | **4.80068175065%** |
| **Complete physical source access union by end of Roxie's own draw** | **14.29232865178%** |

The three rows refer to mutually exclusive card-location cases under **one unchanged clean starter and no-extra-draw model**. The new figure's exact reduced rational is `4780983424934936339 / 33451395790143870000`. The post-Roxie-only increment's reduced rational is `1605895053035544259 / 33451395790143870000`. These are **conditional opportunities** and neither is an observed action rate, payoff rate or match-win probability.

The exact enum `scripts/agent15-rank31-roxie-postdraw-bridge.cjs` uses **BigInt** for all opening/Prize combinatorial weights and a common draw-hypergeometric denominator LCM 187,336,380, preserving exact arithmetic for the four possible remaining deck sizes. It asserts that its pre-Roxie numerator is **exactly** the previously registered 9.49164690113% integer, so a new implementation cannot quietly shift the old denominator. Source identity, printed Roxie draw rule, Koffing's after-effect timing, Radiant's ability, exact outputs and draw subset counts are checked in `tests/agent15-rank31-roxie-postdraw-bridge.test.cjs`.

Independent physical validation shuffled the **same real 60-card class inventory 800,000 times**, exposed actual seven-card openings, six Prizes, one mandatory draw, searched/removes the real required deck targets, and then samples the three cards from the remaining physical deck. There were **705,303 Basic-valid opens**, with **66,544** successful pre-Roxie cases and **33,868** further post-draw cases, combined **100,412 / 705,303 = 14.23672%**. The sampling uncertainty is compatible with the 14.29233% exact value. The draw-only successes included **24,620** where a new Fog was used and **9,248** with Radiant directly drawn (the latter bucket includes draws with both, counted once). This is independent randomized card access, still **not a Twinleaf gameplay simulation**.

## Interpretation for source-policy qualification

A static hand graph would miss the 4.80-percentage-point conditional expansion caused by an **effect of the same Supporter that pays the attack-triggering Pokémon**. The opportunity is contingent on actual legal sequencing and free Bench and Item windows; a source player who never sees the third card cannot assess the line by a one-step hand audit. For a future selected root trace, record the source owner's **pre-Roxie deck count**, physically paid Koffing, any prior Fog/Lele/Roxie searches, **actual three cards drawn by Roxie**, any fresh Fog searched **after Roxie**, the affirmative Koffing confirmation, subsequent Radiant Bench placement, its true Painful Spoons source/recipient and the opponent's follow-up. Preserve absent-opportunity, native rejected, action-capped and full terminal as separate outcomes.

The common shared paper-prompt module now has **v11 Roxie no-eligible-PlayCard-root** and physical payment negatives, correcting the older v8 gap; a source-stamped compiled guard remains separate from a selected prospective two-player policy. [Earlier correction broadcast](../../communications/broadcast/20261103T0032Z_agent15_roxie_v11_root_guard_correction.md). A Stage 2 Dusknoir line, another Roxie discard, Random Receiver, a later Fog search, and any opponent or environmental effects are excluded. Thus **14.292% is not an upper bound on real first-turn access**. The first player's ordinary first own turn cannot play the Supporter, so the modeled timing is going-second only.

The benchmark still has **29/32 authenticated printed original opponent sixties** (23/25/28 not sourced), zero competitively qualified games, and no fixed 60 demonstrated anywhere near the 99.5% target.
