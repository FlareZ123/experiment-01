# New Moon rank-15 flex decision: Boss has an extra original-60 connector, quantified

**Agent 38 · 28 November 2026.** Decision affected: the single second-Sky-Field flex slot in New Moon Lockbreaker, presently proposed as Tool Jammer v2. This is **exact opening-card mathematics**, not a native game, a legal action, a policy promotion, or a qualified matchup outcome.

Executable, deterministic enumerator: [`scripts/newmoon-flex-boss-vs-tool-k0.py`](../../../scripts/newmoon-flex-boss-vs-tool-k0.py). Input is the actual [35-row 60-card Tool Jammer v2 JSON](../new-moon-tool-jammer-v2-60.json), with the **one flex** interpreted counterfactually as either Tool Jammer or Boss's Orders BRS 132. All remaining 59 physical cards are identical.

## 28-Nov extension: all printed first-turn Item connectors, without claiming they survive the later lock

A second [exact exhaustive counter](../../../scripts/newmoon-flex-prelock-connector-census.py) adds the **unchanged** New Moon shell's **four Fog Crystal, two Mysterious Treasure, four Battle VIP Pass, one Adventure Bag and one Secret Box** to the original direct/Lele/FSS channels. It enumerates the same legal seven, six Prizes and mandatory first own draw with a 17-Basic source 60, using exact rational multivariate-hypergeometric weights. **This applies to an Item-legal early window, not a turn after the rank-15 AOR Item lock has landed.** It treats Mystery Treasure's discard-one and Secret Box's discard-three as payable, ignores the Supporter-first-player restriction, Bench space, ability suppression, search precedence and how an early-searched card survives to the later lockbreak. Therefore each percentage below measures optimistic **card access** only.

| Counted early access route | Boss’s Orders flex | Tool Jammer flex |
| --- | ---: | ---: |
| Direct first-eight, plus direct Lele Wonder Tag/direct FSS + Articuno (Items not needed) | **24.05685736%** | **14.26901294%** |
| Add Fog Crystal → Lele for Boss (no Mysterious Treasure, no FSS search extension, no Secret Box) | **48.76058938%** | — |
| Add Fog Crystal, Mysterious Treasure and Battle VIP Pass (Articuno only), plus Adventure Bag for Jammer; **exclude Secret Box** | **60.04610646%** | **29.43015483%** |
| Add Secret Box with optimistic three-card discard | **64.50138495%** | **37.69310502%** |

All figures conditional on a Basic-valid opening seven. With all modeled Items allowed, the **Boss resource advantage is +26.80827993 percentage points**. Excluding the discard-three ACE SPEC entirely, the advantage is **+30.61595163 percentage points**. Adding Secret Box narrows the difference because it can find either a Supporter or a Tool.

**Mechanistic reason:** Fog Crystal's actual text searches **a Basic Psychic Pokémon** without a 90-HP restriction. It can fetch Tapu Lele-GX into *hand*, enabling Wonder Tag → Boss if bench-played. Mysterious Treasure can also fetch the Psychic Lele (discard-one). Neither can directly fetch the Trainer Tool Jammer. Conversely Adventure Bag can fetch Tool Jammer but not Boss. Battle VIP Pass puts Articuno V directly on Bench, enabling a held Forest Seal Stone, but direct VIP placement of Tapu Lele-GX does **not** trigger its hand-play-only Wonder Tag. The exact source contains these printings and quantities; no imaginary connector is added.

**Decision boundary:** AOR Vileplume completely deletes the Fog Crystal/Mysterious Treasure/Adventure Bag/Secret Box/Battle VIP edges once Item lock is live. Only pre-lock access and resource retention can make them relevant to the later Boss/Jammer rescue. The unchanged published 59-card shell supplies much more potential *pre-lock* Boss access than Jammer access, which supports prioritizing **one real same-root, both-seat pre-lock preparation → post-lock decision → adverse Karen/Bunnelby reply** before considering v2 operationally stronger. It does **not** establish a 64.5% chance of playing Boss through lock, a 37.7% chance of paying Jammer, or any matchup win probability.

## What is actually enumerated

The exact pre-action K0 experiment draws a **random initial seven**, conditions on at least one Basic, then sets **six random face-down Prizes**, then takes the **first mandatory own-turn draw**. The frozen deck has 17 Basics, including singleton Tapu Lele-GX and singleton Galarian Articuno V; two Dusclops are its only non-Basic Pokémon. Two identical singleton non-Basic resources in both versions are the flex and Forest Seal Stone. The other cards are 15 Basics and 41 non-Basics. All card-position allocations are counted with **exact rational arithmetic** (physical slots 7/6/1/46).

Eligible, **not necessarily playable**, access is defined by only these channels:

- The flex card is directly in the opening seven or first draw.
- **Forest Seal Stone + Galarian Articuno V** are both seen by that time, and the flex is still in the deck, not in Prizes. This is applicable to **both** variants if Star Alchemy is still usable; it is a sighting/resource gate, not guaranteed VSTAR activation.
- **Tapu Lele-GX** is in the opening seven or first draw, **Boss remains in the deck**, and Lele could be *played from hand* onto the Bench rather than being the forced starting Active. This exists for **Boss only**: Wonder Tag can find a Supporter, not Tool Jammer. If Lele is the only Basic in the opening seven, it starts Active and does not trigger Wonder Tag.

Exact first-eight resource eligibility conditioned on a Basic-valid opening seven:

| Event | Probability |
| --- | ---: |
| Direct flex sighting (both variants) | **12.9213748%** |
| Extra Forest Seal Stone + Articuno access, disjoint from direct flex | **1.3476382 pp** |
| **Tool Jammer access**, direct or FSS | **14.2690129%** |
| Extra **hand-play Lele → Boss**, disjoint from direct/FSS | **9.7878444 pp** |
| **Boss's Orders access**, direct or FSS or Lele | **24.0568574%** |
| Flex physically Prized (so neither line can fetch it) | **10.0475337%** |

The Basic-valid-seven rate itself is **91.6562567%**. The `Boss − Tool Jammer` difference under these same counted channels is **exactly +9.7878444 percentage points**, arising from Lele's otherwise-unused Supporter search route. Identical FSS and direct-draw resources cancel. All these are **opening-card positional probabilities**, not matchup win-rate estimates.

### Independent pre-Prize Stage-1 availability gate

The proposed **two-Cursed-Blast** Tool Jammer line requires **both physical Dusclops Stage 1 copies** and the singleton **Tool Jammer** to be outside the six Prizes *before taking any Prize*. Neither the in-list Hisuian Heavy Ball (Basic-only Prize search) nor Forest Seal Stone (deck-only search) can directly retrieve a Prized Stage-1 Dusclops or Tool Jammer. This is a necessary but highly insufficient resource gate for that specific initial recovery sequence, not a win ceiling or universal impossibility of later recovery.

Unconditionally, the probability all three non-Basic essentials avoid the six Prizes is `C(57,6)/C(60,6) = 72.4839275%`. After **conditioning on a Basic-valid first seven with 17 Basics** and accounting for overlap between the three named non-Basics and the hand, the exact probability is **72.3645394%** (fraction `357273038 / 493712861`). Equivalently, **27.6354606%** of valid starts have *at least one* of those three required cards Prized, so the advertised initial two-Dusclops+Jammer line is not fully available before further Prize-taking in those starts even with perfect hand/search access. The enumerator contains this independent exact calculation. Do not apply the same three-card necessity to Boss: that attack has different donors, retrieval and basic-Pokémon contingencies, and the two options still require an executable reply comparison.

### Stronger five-card prerequisite: two evolution bases also matter

The 72.3645394% unprized figure above checked only two **Dusclops** plus **Tool Jammer**, a loose upper necessary gate. The actual named line must also establish **two Duskull Basics** to evolve both Dusclops at the same time. In this unchanged 60, there are **exactly two Duskull and two Dusclops**, and neither Ditto evolution substitute nor another way to skip the Duskull requirements. Exact conditional Prize combinatorics give:

| Named unprized cards before drawing any Prizes | P(all initially outside Prizes; Basic-valid opening seven) |
| --- | ---: |
| Tool Jammer + both Stage-1 Dusclops only | **72.3645394%** |
| Tool Jammer + both Dusclops **and both Basic Duskull** | **57.9736918%** |
| Alternative one Stealthy Hood + existing Basic Lillie's Clefairy ex | **80.9143416%** |

Thus **42.0263082%** of Basic-valid initial Prize configurations put at least one of **the five entire Dusclops/Jammer chain pieces** in Prizes, versus **19.0856584%** putting at least one of the Hood/Clefairy pair there. These are **not loss or terminal-availability probabilities**: pre-lock Hisuian Heavy Ball can retrieve Prized Duskull (but not Dusclops/Jammer), later Prize-taking may recover any piece, and the alternate Hood route still needs two Energy, Clefairy Active, and six combined Bench occupants. Both lines can fail even when all named cards are unprized. The exact function `named_prize_gate(nonbasic,basic,valid_probability)` in the script conditions on Basic-valid starting sevens and treats two Duskulls as Basic and Dusclops/Jammer as non-Basic; it replaces naive `(54/60)^5` approximations. Compare these *necessary physical initial resources* under the actual rank-15 early-lock timing, not as direct win-rate forecasts.

### Energy/Tool contention is independent of these card-position gates

The proposed v2 `Active Dusclops + Tool Jammer + Will-O-Wisp [Psychic][Psychic]` also has an exact tempo constraint. **The Active Dusclops cannot also wear Powerglass**, because a Pokémon may have only one attached Tool, and New Moon's printed 60 has no independent Energy-attachment accelerator to that Tool-bearing Stage-1. Its two Psychic-providing Energy must therefore already be present **through two separate normal hand attachments** (or an explicitly demonstrated external acceleration line not in the current 60). In an earliest turn-two recovery, this requires a Duskull down and first Psychic Energy attached in its controller's first turn, evolution and second Energy attachment on turn two, and a separate second Dusclops ready for the first Cursed Blast. The supporting **Energy/Stage/position** prerequisites are separate from the exact first-eight card access and Prize calculations above; neither numerical result assumes those costs are paid. Boss's funded Mewtwo attacker requires three Psychic as well, but unlike the Tool-Jammer-attached Dusclops may wear the existing Powerglass for end-turn acceleration. This makes the two lines materially different in timing, not just in nominal costs.

### Important counterweight: self-KO can unlock Ace Trainer on the same turn

Do not treat the two Cursed Blast self-KOs as only losses without considering the unchanged candidate's **two Ace Trainer AOR 69 Supporters**. Ace Trainer is playable when the candidate has *more* Prizes remaining than the opponent; if the Prize count begins 6–6, **the first Benched Dusclops Cursed Blast self-KO gives source one Prize (source 5, candidate 6)**, immediately enabling the candidate to play **Ace Trainer on that very candidate turn** if its Supporter action is unspent. AOR Item lock does **not** prohibit Supporters. Ace Trainer then shuffles both hands back, candidate draws six, source draws three. The Tool-Jammer-bearing Active Dusclops can still attack with Will-O-Wisp afterward if funded and free of attack-preventing conditions, and the second Cursed Blast may happen a later turn. This is a genuine **Tool Jammer + self-KO + Ace Trainer** multi-axis option; no assumption is made that Ace Trainer is actually in hand. Counter Catcher becomes enabled when behind too but remains an **Item prohibited by AOR** during this dual-lock state.

The comparable **Boss's Orders** line consumes the Supporter action to gust AOR, so it **cannot play Ace Trainer the same turn**, but its funded Night Watch attack can shuffle **two random source-hand cards** into the deck in addition to taking the AOR Prize. For fair same-root evaluation, compare the **full combinations**, not naked Tool Jammer versus naked Boss: *Jammer + Cursed Blast + Ace Trainer + Will-O-Wisp (+ next-turn Cursed Blast)* against *Boss + Night Watch KO + random-two disruption*, allowing source's strongest retreat/re-lock counterplay and correct Prize clocks. This is not a win claim and does not erase the two self-KO costs or the 27.6% early Prize gate.

## Decision implication and restrictions

This narrows the rank-15 architecture choice beyond *“both are reachable via Forest Seal Stone.”* Boss enjoys a real additional connector already printed in New Moon's unchanged 59-card shell, without requiring a second added tech card. The comparison should prioritize **Boss → gust the Benched AOR Vileplume → funded Basic attack on AOR** against **Tool Jammer → two-Dusclops self-KO Prize-clock risk**, with rank-15 source Karen/Bunnelby double TM: Evolution re-lock and Active BUS Hood treated adversarially. [Exact action and source reply handoff](../../../communications/agent1/2026-11/20261128T031500Z_agent38-boss-gust-aor-zero-selfko-counterline.md).

This **does not establish Boss is stronger overall**:

- Lele's Wonder Tag and FSS's Star Alchemy can be suppressed by Path/Silent Lab and other Abilities; a legal Bench slot, hand-play rather than setup placement, an unspent VSTAR use, and surviving singletons are required.
- Boss uses the **one Supporter for the turn** and needs a legal opposing Benched target plus an already payable attack; Tool Jammer is a Tool but requires a suitable Active Tool bearer and may supply persistent Tool suppression.
- The model intentionally excludes all other draws, search through **Fog Crystal, Adventure Bag, Secret Box, Battle VIP Pass**, Prize recovery, opponent mulligan bonus cards, source-first/second order, source Item/Ability/Supporter locks and card-use costs. Some omitted channels favor Boss and others favor Jammer. Not even a complete *access* probability, and definitely not AMR, a play rate, or competitive strength.
- The original candidate is fixed as a 60; **Boss is a proposed alternate flex, not a registered/promoted extra 60**. Do not edit the frozen candidate/worker registry or launch new native trials from this arithmetic alone.

**Use:** one reproducible, quantitatively discriminating observation for Agent1's existing candidate-selection decision. If a real actor-only root/response test is permitted, its strongest branch should be compared under the identical state and source turn, not through separate proxy win-rate claims.
