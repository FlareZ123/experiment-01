# Sentinel's first-turn Hood/TM contention against original rank-7 Wobbuffet

**Agent40 | 6 November 2026 | Exact restricted card-location screen for one matchup. This is not an observed first-turn failure, opponent choice, qualified match or win-rate estimate.**

## The resource collision

The unchanged [Sentinel Lopunny Vileplume v1 fixed 60](../aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json) has **3 Stealthy Hood UNB186**, **2 Technical Machine: Evolution PAR178**, **4 Guzma & Hala CEC193**, and **4 Tag Call CEC206**. A first turn going second can use **one Guzma & Hala** to search Stadium + Tool + Special Energy, given two genuine discardable cards. The now-proven Artazon→Bunnelby→TM Evolution→Jet sequence consumes its **only Tool search** on TM unless the TM was already available in hand. A simultaneous first-turn Stealthy Hood on Oddish/Vileplume requires either an already-held Hood or using that Tool search on Hood when TM was already held. There are other potential first-turn strategies, but for this restricted single-G&H Tool connector, **a natural opening-eight sighting of at least one of these five cards (3 Hood, 2 TM)** is a necessary resource condition for both Tool functions. It is far from sufficient: discard payment, targets, evolving, Energy, Artazon and actual timing remain separate.

Printed [Wobbuffet PHF36](../als/agent40-original-field-guzma-response-window-20261106.md) has Active-only **Bide Barricade**, which removes Abilities from non-Psychic Pokémon. Sentinel's Vileplume AOR is Grass; an attached Stealthy Hood prevents the opponent's Ability effect on it. Original rank 7 has **3 Wobbuffet among 12 Basics**. A rank7 owner able and willing to start Wobbuffet Active can suppress an *unprotected* Vileplume Item-lock Ability as soon as it appears, subject to actual evolving and countereffects. Tool Jammer cannot disable a Hood on Benched Vileplume merely by remaining on its own Active; the two-Active Guzma counterline has distinct requirements and is not counted here.

## Exact restricted opening probabilities

We condition *both decks separately* on a Basic-containing starting seven and independent shuffled 60s. Candidate goes second and naturally sees one draw, totaling eight cards; original rank7's initial Active is chosen from its seven.

| Event | Exact conditional probability |
| --- | ---: |
| Rank7 has at least one Wobbuffet in its legal starting seven | **38.9730381662%** |
| Sentinel sees at least one of 3 Hood + 2 TM among first eight | **50.8772702336%** |
| Sentinel sees none of those five cards in first eight | **49.1227297664%** |
| **Joint:** rank7 Wobbuffet available in opening seven, Sentinel has neither Tool family among first eight | **19.1446202201%** |

The first event has exact fraction **307629 / 789338**; the candidate no-tool event **36089157 / 73467328**. As independent physical opening randomizations, their joint is **11102071278753 / 57990553748864**. This is a **joint opportunity/connector-conflict frequency**, not a realized 19% matchup loss or forced lock miss. The rank7 player may select another Active and Sentinel may follow other lines, delay the lock, or acquire Tools with other draws; source policies and hand payments remain unmodeled.

For a hypothetical change of this particular resource margin from **five** to **six** copies of Hood-or-TM in the same 60 with 14 Basics, conditional first-eight sighting rises from **50.87727% to 57.76196%**, and the joint rank7-Wobbuffet/no-tool event falls from **19.14462% to 16.46145%**. This is **not** a card-swap recommendation: the removed card's tactical value, whether an added copy is Hood or TM, Supporter contention, and the full setup distribution have not been evaluated. This illustration demonstrates a bounded resource-visibility tradeoff.

## Derivation and validation

For a shuffled 60 with b Basics and g disjoint searched-family Trainers, require a Basic in first seven. Let d be subsequent natural draws. Exact none-of-g probability is

**Q(b,g,d) = [(C(60-g,7) − C(60-g-b,7)) × C(53-g,d)] / [(C(60,7) − C(60-b,7)) × C(53,d)].**

Take **b=14, g=5, d=1** for Sentinel; the [previous Agent40 generic BigInt sighting evaluator](../../simulation/evaluation/agent40-field-guzma-first-nine.cjs) implements exactly this complement for d=0,1,2. The source Wobbuffet calculation uses [C(60,7)−C(57,7)]/[C(60,7)−C(48,7)], because three Wobbuffet are a subset of rank7's 12 Basics. Python integer arithmetic with fractions reproduces every printed value and the reduced product above; this was independent of the prior source-status and print census. Physical printed counts were rechecked directly against the authenticated original rank7 and unchanged Sentinel 60 inventories. The supplied card-list ZIP confirms PHF36 Bide Barricade, UNB186 Hood, CEC193 G&H, and PAR178 TM Evolution wording.

**Next meaningful falsification:** In the existing Agent28 two-seat native paid Bunnelby/TM/Artazon line, place an authentic source rank7 Active Wobbuffet from a Basic-valid original initial seven; cover cases with/without a genuinely paid attached Hood. Record whether Bide Barricade actually suppresses Vileplume's Item lock, whether the Tool connector was used by TM or Hood, and an independently selected original reply. This is conditional testing; random games and the stronger shared bilateral policy remain separate release gates.

**No finalist or field-strength claim:** 29/32 original sixty-card inventories authenticated, ranks 23/25/28 absent, zero qualified competitive games, no demonstrated 99.5% win rate.
