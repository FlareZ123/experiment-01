# New Moon rank-15 flex decision: Boss has an extra original-60 connector, quantified

**Agent 38 · 28 November 2026.** Decision affected: the single second-Sky-Field flex slot in New Moon Lockbreaker, presently proposed as Tool Jammer v2. This is **exact opening-card mathematics**, not a native game, a legal action, a policy promotion, or a qualified matchup outcome.

Executable, deterministic enumerator: [`scripts/newmoon-flex-boss-vs-tool-k0.py`](../../../scripts/newmoon-flex-boss-vs-tool-k0.py). Input is the actual [35-row 60-card Tool Jammer v2 JSON](../new-moon-tool-jammer-v2-60.json), with the **one flex** interpreted counterfactually as either Tool Jammer or Boss's Orders BRS 132. All remaining 59 physical cards are identical.

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

### Energy/Tool contention is independent of these card-position gates

The proposed v2 `Active Dusclops + Tool Jammer + Will-O-Wisp [Psychic][Psychic]` also has an exact tempo constraint. **The Active Dusclops cannot also wear Powerglass**, because a Pokémon may have only one attached Tool, and New Moon's printed 60 has no independent Energy-attachment accelerator to that Tool-bearing Stage-1. Its two Psychic-providing Energy must therefore already be present **through two separate normal hand attachments** (or an explicitly demonstrated external acceleration line not in the current 60). In an earliest turn-two recovery, this requires a Duskull down and first Psychic Energy attached in its controller's first turn, evolution and second Energy attachment on turn two, and a separate second Dusclops ready for the first Cursed Blast. The supporting **Energy/Stage/position** prerequisites are separate from the exact first-eight card access and Prize calculations above; neither numerical result assumes those costs are paid. Boss's funded Mewtwo attacker requires three Psychic as well, but unlike the Tool-Jammer-attached Dusclops may wear the existing Powerglass for end-turn acceleration. This makes the two lines materially different in timing, not just in nominal costs.

## Decision implication and restrictions

This narrows the rank-15 architecture choice beyond *“both are reachable via Forest Seal Stone.”* Boss enjoys a real additional connector already printed in New Moon's unchanged 59-card shell, without requiring a second added tech card. The comparison should prioritize **Boss → gust the Benched AOR Vileplume → funded Basic attack on AOR** against **Tool Jammer → two-Dusclops self-KO Prize-clock risk**, with rank-15 source Karen/Bunnelby double TM: Evolution re-lock and Active BUS Hood treated adversarially. [Exact action and source reply handoff](../../../communications/agent1/2026-11/20261128T031500Z_agent38-boss-gust-aor-zero-selfko-counterline.md).

This **does not establish Boss is stronger overall**:

- Lele's Wonder Tag and FSS's Star Alchemy can be suppressed by Path/Silent Lab and other Abilities; a legal Bench slot, hand-play rather than setup placement, an unspent VSTAR use, and surviving singletons are required.
- Boss uses the **one Supporter for the turn** and needs a legal opposing Benched target plus an already payable attack; Tool Jammer is a Tool but requires a suitable Active Tool bearer and may supply persistent Tool suppression.
- The model intentionally excludes all other draws, search through **Fog Crystal, Adventure Bag, Secret Box, Battle VIP Pass**, Prize recovery, opponent mulligan bonus cards, source-first/second order, source Item/Ability/Supporter locks and card-use costs. Some omitted channels favor Boss and others favor Jammer. Not even a complete *access* probability, and definitely not AMR, a play rate, or competitive strength.
- The original candidate is fixed as a 60; **Boss is a proposed alternate flex, not a registered/promoted extra 60**. Do not edit the frozen candidate/worker registry or launch new native trials from this arithmetic alone.

**Use:** one reproducible, quantitatively discriminating observation for Agent1's existing candidate-selection decision. If a real actor-only root/response test is permitted, its strongest branch should be compared under the identical state and source turn, not through separate proxy win-rate claims.
