# Missing Aichi 2026 Top32 entries: exact archetype reconciliation without inventing three 60s

**Agent 5 | 4 November 2026 | external-source corroboration, not cardlist admission**

## Result

The benchmark [29 published complete source name/count inventories](full-decklists.json) lack tournament ranks **23, 25 and 28**. Public [Limitless tournament Results](https://limitlesstcg.com/tournaments/566) independently fixes their **rank and displayed player name**; its [Regidrago detailed tournament history](https://limitlesstcg.com/decks/260/results) directly marks both rank 23 and rank 28 Regidrago; and [Limitless full Top32 archetype statistics](https://limitlesstcg.com/tournaments/566/statistics) allow an exhaustive count cross-check. **[Limitless Raichu Electrode Combo detailed results](https://limitlesstcg.com/decks/282/results)** also directly lists **Kazuki Kumegawa at 25th** in the same event. Thus all three rank assignments are individually source-marked, in addition to the arithmetic check.

| Missing final rank | Player shown in Limitless Results | Archetype supported by public tournament source | Complete exact original 60 recovered? |
| ---: | --- | --- | --- |
| 23 | **Yuki Ueno** | **Regidrago** | **No** |
| 25 | **Kazuki Kumegawa** | **Raichu Electrode Combo** (as categorized by Limitless) | **No** |
| 28 | **Jo Kato** | **Regidrago** | **No** |

The independent Japanese [Pokekameshi CL Aichi 2026 Top32 roundup, page 2](https://pokekameshi.com/cl2026aichidec-extra/2/) quotes a post from **レプリカ / Replica (@nnaacc5_uec)**: `CL愛知エクストラ 予選28位トナメ1没でした！ レジドラゴ、今までありがとう`, dated May 10, 2026. This is additional first-person *rank-28 Swiss-place/Regidrago archetype* corroboration. Do not equate the account's handle to the English-romanized player name without independent evidence; this report asserts no verified person/handle mapping.

The same roundup quotes **kume (@kume_pokeca)** that they reached Top32 playing **Alolan Raichu one-shot**; an attached note about the event is visible but the complete recorded 60 is not established. Since the Swiss-place account is not identical to the final results-name label, treat this as **archetype-level supporting context**, not an authenticated player identity or printing inventory.

## Rank-25 first-person tactical context, still short of a printed 60

The [free preview of the rank-25 pilot's own May 14 article](https://note.com/kume_pokeca/n/n6cfd126f5774), titled `CL愛知2026エクストラ ベスト32 アロライワンショット`, records a detailed **Swiss 7–1** with matchups, explicitly says **25th entering the elimination bracket**, and reports a first-round elimination loss against **Mega Absol/Garbodor**. The listed eight Swiss pairings include **five Regidrago opponents, four wins and one loss**. These are a single player's self-reported finite matches (4–1), far too few and matchup/opponent-policy dependent to support a reliable win percentage; they do identify live counterplay that the shared source policy must represent.

The free introduction also describes designing the Alolan Raichu one-shot deck against Regidrago's normal opening, specifically anticipating **Latias ex dependence, Ability lock before the opponent's first meaningful Ability activation, and first-turn Item-lock disruption**. The author discusses Klefki, Wobbuffet and Garbodor as distinct Ability-lock choices and states they selected a build that could include **Klefki**. This is self-reported *strategic context* for that rank-25 pilot; the actual card counts and prize/search structures remain inaccessible in the visible free portion. It cannot prove a specific exact opening action or substitute for the original 60. The battle report is useful for adversarial policy test design: starting Basic choice must consider whether it preserves or prevents opponent-turn Ability access and a paid disruption response.

The same article's public summary lists one **ADP Dragonite** opponent among the Swiss wins, which underscores the danger of treating a narrow ADP-enhanced-GX first-eight resource opportunity as a matchup victory. It does not establish the exact opponent decklist or the specific turn/action that decided that match.

## Exact 32 versus 29 aggregate inventory arithmetic

The 29 exact name/count source roster's archetype counts, with the five Abs(o)l/Garbodor/Electrode lists grouped as the published Limitless **Mega Absol Box** category, are:
- Regidrago **9**, Raichu Electrode Combo **2**, Mega Absol Box **5**, Iron Thorns **3**, Snorlax Stall **2**;
- Shadow Rider Calyrex **1**, Vileplume Control **1**, Mew Genesect **1**, Mega Lopunny **1**, Raging Bolt **1**, Lillie's Clefairy **1**, Meloetta Donk **1**, Dusknoir Chimecho **1**.

The [Limitless tournament statistics](https://limitlesstcg.com/tournaments/566/statistics) report the same 32-field archetypes with **Regidrago 11** and **Raichu Electrode Combo 3**. Every other group's count agrees with the 29-source subset. Hence the multiset difference **Top32 minus authenticated-29 = {Regidrago ×2, Raichu Electrode Combo ×1}**, matching the individually supported rank assignments 23/25/28. Check: the known field subtotal is **29**, public full field total **32**.

This is **not 32 authentic complete opponent decklists**: without full exact 60 inventories, original ranks 23/25/28 cannot be honestly entered as fully reconstructed, sampled as authentic original-source arms or included in competitive-qualified field wins. The event's archetype count alone cannot determine card counts, ACE SPECs, Dragon attack donors, original special Energy inventory, paper printings or tactical choices.

## Provenance and release impact

1. [Limitless original results](https://limitlesstcg.com/tournaments/566) locates players and place numbers, including the three omissions.
2. [Limitless Regidrago historical results](https://limitlesstcg.com/decks/260/results) names Yuki Ueno at 23rd and Jo Kato at 28th in the **May 10, 2026** CL Aichi Open League event.
3. [Limitless event statistics](https://limitlesstcg.com/tournaments/566/statistics) independently constrains Regidrago=11 and Raichu=3 over 32, all other categories accounted for.
4. [Pokekameshi top-cut roundup](https://pokekameshi.com/cl2026aichidec-extra/2/) corroborates Swiss 28th rank's Japanese Regidrago account independently, without establishing an exact 60 or mapping public handles to tournament-result identities.
5. [Original 29-source roster](full-decklists.json) provides only 29 complete inventories, with printed-set historical and card-database caveats separately documented in [the live decision board](../README.md).

**Practical guidance:** annotate missing ranks as `archetypeVerifiedButComplete60Missing` without imputing a template Regidrago or another player's Raichu list. The exact 32-field sampling gate is still **blocked**. These archetype labels can inform incomplete-data sensitivity analysis only, explicitly excluding source-authentic card-combination or win-rate claims.
