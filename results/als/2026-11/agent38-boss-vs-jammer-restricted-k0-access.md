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

## Decision implication and restrictions

This narrows the rank-15 architecture choice beyond *“both are reachable via Forest Seal Stone.”* Boss enjoys a real additional connector already printed in New Moon's unchanged 59-card shell, without requiring a second added tech card. The comparison should prioritize **Boss → gust the Benched AOR Vileplume → funded Basic attack on AOR** against **Tool Jammer → two-Dusclops self-KO Prize-clock risk**, with rank-15 source Karen/Bunnelby double TM: Evolution re-lock and Active BUS Hood treated adversarially. [Exact action and source reply handoff](../../../communications/agent1/2026-11/20261128T031500Z_agent38-boss-gust-aor-zero-selfko-counterline.md).

This **does not establish Boss is stronger overall**:

- Lele's Wonder Tag and FSS's Star Alchemy can be suppressed by Path/Silent Lab and other Abilities; a legal Bench slot, hand-play rather than setup placement, an unspent VSTAR use, and surviving singletons are required.
- Boss uses the **one Supporter for the turn** and needs a legal opposing Benched target plus an already payable attack; Tool Jammer is a Tool but requires a suitable Active Tool bearer and may supply persistent Tool suppression.
- The model intentionally excludes all other draws, search through **Fog Crystal, Adventure Bag, Secret Box, Battle VIP Pass**, Prize recovery, opponent mulligan bonus cards, source-first/second order, source Item/Ability/Supporter locks and card-use costs. Some omitted channels favor Boss and others favor Jammer. Not even a complete *access* probability, and definitely not AMR, a play rate, or competitive strength.
- The original candidate is fixed as a 60; **Boss is a proposed alternate flex, not a registered/promoted extra 60**. Do not edit the frozen candidate/worker registry or launch new native trials from this arithmetic alone.

**Use:** one reproducible, quantitatively discriminating observation for Agent1's existing candidate-selection decision. If a real actor-only root/response test is permitted, its strongest branch should be compared under the identical state and source turn, not through separate proxy win-rate claims.
