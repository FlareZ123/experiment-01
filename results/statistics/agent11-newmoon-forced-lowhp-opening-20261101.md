# Agent 11: forced 60-HP starter tradeoff in unchanged New Moon versus Shadow Rider 60s

**1 November 2026. Exact combinatorics, 29 original field source decks. Development-only deck-structure analysis.**

## Candidate printings and question

The frozen New Moon Lockbreaker v1 [exact 60-card English-equivalent manifest](../als/new-moon-lockbreak-english-proxy-60.json), SHA256 `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`, has **17 Basic Pokémon**. Of these, five physically printed Basics have **60 HP**: **3 Unown AOR 30**, English database ID `xy7-30`, and **2 Duskull VIV 69**, ID `swsh4-69`. The uploaded complete card database verifies their printed 60 HP and Basic stage; all other candidate Basic printings have more than 60 HP. The other two Pokémon are Stage-1 Dusclops.

The unchanged published rank-1 Shadow Rider reference 60 contains **14 Basics and zero Basics with HP at most 60**, independently established by the [source Basic and HP inventory](../aichi-2026/opening-hand-audit.json). These different Basic mixes can meaningfully affect both mulligan frequency and the chance of being forced to start with a vulnerable Pokémon.

## Exact natural card-location event

If a 60-card deck has (B) Basics of which (L) have at most 60 HP, then among legal starting sevens containing at least one Basic,

[
P(	ext{forced sole low-HP Basic})=
rac{Linom{60-B}{6}}
{inom{60}{7}-inom{60-B}{7}}.
]

New Moon: **8.61122899%** of Basic-valid first sevens contain *exactly one Basic*, one of its five 60-HP Pokémon. The reference: **0%** with the same threshold. This is physically forced only on the original seven, not a claim that 60 HP automatically loses the game.

For an original opponent with (B_S) Basics, also include the legal two-player *simultaneous* mulligan process and assume every optional opponent-mulligan bonus offered to the candidate is accepted. If (k) cards are awarded and the initial New Moon seven was forced low-HP, the chance of seeing **no other Basic** among those (k) additional physical cards is exactly (inom{37}{k}/inom{53}{k}). This marginalizes the six unknown Prize cards. Sum over the joint mulligan distribution. After observing over 37 extra physical cards, a second Basic is inevitable, so the finite sum is exact for the event.

**Field-wide result, 29 original known ranked opponents equally weighted:** New Moon has **7.93405063%** probability of having only one seen Basic and that Basic being HP≤60 after all maximum optional opponent mulligan bonuses. Shadow Rider stays at **0%**.

| Original opponent sources | New Moon 60-HP lone Basic after all bonus draws |
| --- | ---: |
| Ranks 6, 24, 29, four-Basic Iron Thorns | **5.99285%** each |
| Rank 1, 14-Basic Shadow Rider | **8.24063%** |
| Rank 30, 16-Basic Lillie's Clefairy | **8.35474%** |
| Equal-weight average over original 29 | **7.93405%** |

This complements the separately documented [29-source two-player mulligan resource model](../../scripts/agent11-field-simultaneous-mulligan-compensation.cjs): New Moon's 17 Basics reduce the bonus draws it offers opposing decks, but the candidate also contains five fragile Basics that its own valid starting seven can force Active.

## A tighter physical-screen after eight direct Basic-search Items

The same fixed 60 also contains **4 Battle VIP Pass FST225** and **4 Fog Crystal CRE140**. Their printed effects can find additional Basic Pokémon during the appropriate first-turn/item-usable window. The complete supplied card database confirms **16 Psychic Basic copies** in the candidate, enough that at least one remains in the deck even with six random Prizes, so Fog Crystal has a named Basic target at the start of this scenario. These Item lines can still be blocked by opposing Item locks or fail for other reasons, and the calculation does not give them a policy-verified success credit.

Among valid New Moon initial sevens, the more restrictive event of (1) **exactly one Basic with HP≤60**, and (2) **zero physical Battle VIP Pass and Fog Crystal cards**, is

`5*C(35,6)/[C(60,7)-C(43,7)] = 2.29271023%`.

Under the full two-player mulligan bonus distribution, require every extra physical card to contain neither another Basic nor either directly Basic-searching Item. Of the 53 unseen cards after this precise seven, **29** meet that restriction. The exact probability after all maximum opponent-mulligan bonuses, averaged equally over the 29 known original opponents, is **2.04224735%**, compared with **7.93405063%** when direct searcher cards were not screened. Against the original four-Basic Iron Thorns sources it is **1.39177924%**.

This tighter event quantifies **what is missing from the immediately visible, directly Basic-searching hand**, and must not be interpreted as a guaranteed unrescuable starter or a loss probability. Other Trainer/Ability lines could still rescue a hand with neither Item; an opponent's Item lock could make a held Item unusable. Both numbers describe different exact inventory events, and neither justifies an immediate candidate substitution.

## Cost-sensitive physical access frontier

The candidate also has **2 Mysterious Treasure FLI113**, whose search requires discarding one other card, and **1 Secret Box TWM163**, whose broad Item search requires discarding three other cards. When Item play is allowed, a held Treasure may search a Basic Psychic Pokémon, and Secret Box may obtain a Battle VIP Pass or Fog Crystal. Both are theoretically reachable Bench-rescue lines, subject to their costs and the alternative uses of those exact cards. The physical-card screen below counts a card as visible access without claiming that spending it is a rational or native-validated move.

| Named physical search routes counted | Counted copies in candidate / hypothetical 60 | Sole HP≤60 Basic, none of these routes after all maximum bonus cards; 29-source average |
| --- | ---: | ---: |
| Battle VIP Pass + Fog Crystal | **8** | **2.04225%** |
| Plus Mysterious Treasure | **10** | **1.38247%** |
| Plus Secret Box | **11** | **1.12669%** |
| Plus four *hypothetical* discard-requiring search slots, with four other slots removed | **15 hypothetical** | **0.46129%** |

Each row uses the exact same (B=17,L=5) and authentic 29 source Basic counts. For (T) distinct non-Basic physically searching cards included in the count, the initial-seven event is

`5*C(43-T,6)/[C(60,7)-C(43,7)]`.

After a valid initial seven with no such search Items, the extra-card no-access condition has hypergeometric factor `C(37-T,k)/C(53,k)` for (k) bonus cards. The sensitivity ranges are compositional what-if card-location calculations; the 15-copy row describes a **different 60** requiring four substitutions and was never a legal candidate list submitted for competitive evaluation. It is **not** evidence that those four additional slots would increase actual wins. In particular, Mysterious Treasure and Secret Box consume discards, compete for one-use search benefits, may be inaccessible under Item lock, and can be more valuable for their intended attack engine lines. Model the exact opportunity costs before using the two lower-risk rows to choose a decklist.

## Why this is only a structural risk

- A 60-HP opening Basic is **not** equivalent to an early Knock Out, donk, or game loss. Opponent attack access, setup speed, first-player seat, Bench options, Abilities, relevant HP modification, and later actions all matter.
- The result models initial seven and optional compensation draws **before any turn actions**. It excludes Item/Supporter search, Bench placement after setup, further ordinary draws, Prize-taking, attacks and any actual opposing decision policy.
- The five 60-HP printings have purposes in the candidate's engine, so removing them to reduce low-HP exposure could create larger consistency or attack-line losses. No card swap is justified from this number alone.
- Original source ranks 23, 25 and 28 are still absent, and the whole field has **zero competitively qualified native games**.

## Missing-originals sensitivity

For the three unpublished original lists at ranks 23, 25 and 28, permit each unknown source any Basic count from 1 to 60 without substituting another deck. Across all 32 ranks equally weighted, the resulting exact **interval for forced sole HP<=60 New Moon exposure** after maximum mulligan bonuses is **7.43676% to 7.99754%**. The interval also requiring absence of all 11 named Basic-search Items is **1.04649% to 1.14106%**. These bound physically observed setup cards under unknown source Basic counts. They certify neither real gameplay losses nor authenticity for the missing lists.

## Reproduction

The [source-locked exact calculator](../../scripts/agent11-newmoon-forced-lowhp-opening.cjs) verifies frozen candidate printing IDs/counts, original champion HP baseline, 29-rank Basic source counts, and distinguishes pure opening location from genuine gameplay. [Four regression cases](../../tests/agent11-newmoon-forced-lowhp-opening.test.cjs) cover exact seven, joint mulligan bonus, 29-rank mean and source mutation rejection. Added to the **existing manual-only statistics workflow** with three other Agent11 pure combinatorics suites; no new automatic CI workflow. Independent Python big-integer enumeration reproduced every displayed number. Native policy comparisons and game-win qualifications remain unchanged.
