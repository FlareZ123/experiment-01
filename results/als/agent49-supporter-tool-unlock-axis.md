# The single-slot Faba / Field Blower channel diversification hypothesis

**Agent 49, 18 October 2026.** This report proposes a more practical way to challenge the early-Garbotoxin matchup than one-Colorless Tool-clearing attacks. It is a *card-text and mathematical* result with no autonomous source-dealt games. It does not alter the fixed [New Moon Lockbreaker v1](new-moon-lockbreak-60-candidate.md).

## Source legality, action channels and the natural hypothesis

- **Field Blower** GRI 125 (`sm2-125`) is an **Item**. Its effect discards **up to two** Tools or Stadiums in play ([Limitless](https://limitlesstcg.com/cards/gri/125)). Two copies are in the frozen New Moon list.
- **Faba** LOT 173 (`sm8-173`) is a **Supporter**. Its effect sends **one** opposing attached Tool, opposing Special Energy, or either player's Stadium to the **Lost Zone** ([Limitless](https://limitlesstcg.com/cards/lot/173)); it is legal in paper Expanded and is present in the published Aichi runner-up Vileplume deck, so it has direct 2026 field provenance.
- **Xerosic** PHF 110 (`xy4-110`) is another single-Tool Supporter channel, discarding from either player's Pokémon rather than using the Lost Zone. **Ruffian** JTG 157 (`sv9-157`) can discard an opposing Tool and Special Energy from the *same* Pokémon; supplied Advanced Rulebook D-04 permits resolving the available part if one category is missing. These support the broad category but Faba is the priority due to Lost Zone permanence.

**Counterfactual:** in exactly the existing New Moon v1 60, replace **one Field Blower with one Faba**. Both are non-Basic Trainer cards, so the variant still has 17 Basic Pokémon, six Energy, 19 Pokémon total, 35 Trainer cards, and 60 total. The two direct access channels become one Item and one Supporter.

If an opposing Tool-Garbodor is active as an Ability lock, a Faba **already in hand** remains playable under that Ability lock because it is a Supporter action independent of the affected Pokémon's Ability. Faba removes Garbodor's attached Tool *during the current turn*, so the player can potentially declare Perfection afterward **on the same turn** if their Mewtwo & Mew-GX is Active and otherwise legal. This avoids the attack-clearing Rotom/Chatot route's forfeited-attack-turn and immediate-retool window. The absence of Item lock is irrelevant to playing Faba itself.

This is conditional on **Supporter permission**, a clear target, paid attack Energy, and no further surviving lock. It uses the one Supporter per turn, displacing the turn's Lillie's Determination / Ace Trainer. Garbotoxin can also block Tapu Lele-GX's Wonder Tag, so *searching* Faba through that Ability while locked is circular; holding the physical Faba is a distinct resource event. Faba removes **one** card, whereas Field Blower can remove two simultaneously.

## Exact first-eight direct visibility

Use a uniform 60-card shuffle, Basic-valid opening seven, one ordinary draw, no extra draws/searches/mulligan bonus, and no partial knowledge of six face-down Prize cards. Let B mean at least one of the original **two** Field Blowers appears in the first eight. In the candidate variant let F mean the **one Faba** appears and I mean the **one remaining Field Blower** appears. All target cards are non-Basic and the 17 Basic count is unchanged.

| Conditional event | Exact fraction | Chance |
| --- | --- | ---: |
| Original B: one or more of 2 Blowers seen | `416435/1708349` | **24.376459377%** |
| Variant F: singleton Faba seen | `3752617/29041933` | **12.921374758%** |
| Variant I: singleton Blower seen | `3752617/29041933` | **12.921374758%** |
| Variant F **and** I | `425839/29041933` | **1.466290140%** |
| Variant F **or** I | `416435/1708349` | **24.376459377%** |
| Variant Faba **and** one of four Stadiums seen | `55803671/1103593454` | **5.056542407%** |

That **24.376% equality is exact**, because the conditional union event asks whether at least one of **two designated non-Basic cards** appears, regardless of the label printed on either one. It says nothing about equality of *playable* Tool-removal opportunities under differing lock states, searchable Items, or competing Supporters. In particular, the newly introduced Item-locked, Supporter-open line has a *direct Faba visibility ceiling* of 12.921% in this narrow first-eight model; a two-Blower list has zero immediately playable Blowers in such a lock, but may still have other card effects.

Proof: define
`V = 1 - C(43,7)/C(60,7)`,
`Q(m) = [C(60-m,8)/C(60,8)] * [1 - C(43-m,7)/C(60-m,7)]`.
For a designated disjoint collection of `m` non-Basic cards, `Q(m)` is the joint probability of a valid Basic opening and *no* designated card in the first eight. Thus `P(at least one | valid) = (V-Q(m))/V`. For a singleton Faba and four Stadiums, `P(Faba & >=1 Stadium | valid) = [V-Q(1)-Q(4)+Q(5)]/V`. Exact BigInt functions are implemented in [script](../../scripts/supporter-item-tool-unlock.cjs) and checked by [rational regressions](../../tests/supporter-item-tool-unlock.test.cjs). An independent Python `fractions.Fraction` calculation reproduced the figures.

## Lock and choice matrix

| State at start of candidate turn | Two Blowers (same Item axis) | One Blower + one Faba |
| --- | --- | --- |
| No Trainer lock | Up to two Item copies, if held; each can remove two | Item plus Supporter pathways, if held; Faba competes with draw Supporter |
| Item lock active, Supporter open | Both Blowers unplayable from hand | Faba can remove one Tool on this turn if held |
| Supporter lock active, Items open | Blowers can be played | Single Blower can be played, Faba blocked |
| Item **and** Supporter lock | Both Blowers blocked | Both blocked; an attack-based Tool-removal line might remain |
| Tool Garbodor **plus Temple of Sinnoh** | One Blower can remove both Tool and Stadium if Items playable | Faba can remove only one; an additional eligible Stadium replacement could address the other condition |

The last row matters for source rank 11, whose exact published 60 has **3 Float Stone**, **1 Muscle Band**, **2 Forest Seal Stone** and **2 Temple of Sinnoh**. Float Stone and Muscle Band can re-equip Garbodor; Forest Seal Stone attaches to Pokémon V and is not a substitute attached Garbodor Tool. A Tool plus Temple state creates a *two-channel demand*. Faba could remove the Tool and an own Stadium card could replace Temple before attacking, but `Faba AND any Stadium visible` has only the 5.0565% direct-resource frequency. Even that is an optimistic opportunity because Stadium action and replacement may be unavailable or tactically dominated.

## Decision and falsification test

This is a **promising axis-diversification hypothesis** relative to the attack-clearing Rotom swap because removal can occur before the primary attack, with exactly unchanged two-card direct-visibility coverage in a no-search abstraction. It has conspicuous costs: Supporter contention, fewer Blowers reachable via Item searches such as Secret Box, one-card versus two-card simultaneous removal, Faba's 10% unconditioned six-Prize risk, and surviving/recreated Garbotoxin or Energy locks.

**Keep the published New Moon v1 frozen**. Construct a separately hashed 60 only if a competent source-dealt Garbodor response test establishes the value of Tool removal within an **Item-forbidden** turn or after alternate Item search has already failed. That test should require a legally held Faba, real `PlayCardAction` and target prompt, Garbotoxin state verification, successful Perfection declaration and copied-attack effect during the **same** turn, plus opponent follow-up. Stronger evidence would compare frozen Field Blower vs Faba lists under both true starting orders and independently dealt opponent responses. Do not count the synthetic resource event or staged action as a competitive game.

Field status stays **29/32** exact 60s, **zero** independently qualified competitive games, and **no** demonstrated 99.5% fixed-list win rate.
