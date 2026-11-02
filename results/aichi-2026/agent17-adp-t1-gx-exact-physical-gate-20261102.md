# Agent17: ADP / Thorton / Regidrago v2 first-turn GX access and Prize-continuity gate

**2 November 2026 | exact finite combinatorics | independent candidate screening | no native games | no paper matchup wins qualified**

## Fixed candidate and decision

The unchanged proposal is [Agent5 ADP / Thorton / Regidrago v2](candidates/agent5-adp-thorton-regidrago-60-v2.json), candidate identity SHA-256 `bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`. The [candidate packet](agent5-adp-thorton-regidrago-structural-fifth-candidate-20261102.md) describes a powerful but conditional T1 Altered Creation-GX followed by T2 Thorton and Regidrago VSTAR Apex Dragon. The current screening decision is **DEFERRED, with a definite adversarial native falsifier**. The restricted phase-one probability calculated here cannot reject the complete list, since further search, extra draws and Switch lines are available.

There are seven Basic Pokémon in this fixed 60: Arceus & Dialga & Palkia-GX (ADP) ×2, Regidrago V ×3, Tapu Lele-GX ×1 and Crobat V ×1. Other relevant printings are Double Dragon Energy XY6 97 ×4, Tag Call SM12 206 ×4, Guzma & Hala SM12 193 ×3, Thorton SWSH11 167 ×4, M Charizard-EX XY2 69 ×1, Regidrago VSTAR SWSH12 136 ×3, and seven basic Grass/Fire Energy. The audit reads those exact IDs from the **unchanged v2 JSON** and verifies the key supplied-card text against `resources/cards/en/`.

## First-turn event and opportunity classes

The defined event is a personal **turn one going second** with ADP selected Active from the initial seven. The opening seven must contain a Basic. One normal turn draw adds the eighth card. Before that attack the pilot can attach Double Dragon Energy to Active ADP either from the first eight or through a physically reachable Guzma & Hala line. Guzma & Hala must be in the first eight, or Tag Call must be in the first eight and a Guzma & Hala must survive in the searchable deck. The searched Double Dragon must itself remain in the deck after six Prizes. Physically, after ADP starts Active the hand has enough cards to discard two other cards even if Tag Call is consumed; **strategic acceptability of those discarded cards is not established**. No other card draw/search, ADP promotion by Switch, opponent Item lock, Energy denial, pre-attack KO or tactical resource choice is modeled.

The three routes are mutually exclusive in the stated priority: directly held Double Dragon, otherwise held Guzma & Hala fetching Double Dragon, otherwise Tag Call fetching Guzma & Hala fetching Double Dragon. This makes their percentages additive without double counting. Altered Creation-GX needs one Metal Energy and one *additional* Water Energy for its extra-Prize effect; the attached Double Dragon supplies both under its actual Dragon-only Energy rule when unhindered.

| Exact phase-one route | Conditional on Basic-valid seven | Unconditional random seven |
| --- | ---: | ---: |
| Double Dragon in first eight, ADP in opening seven | **15.01876035%** | 9.02446595% |
| No held Double Dragon, but held Guzma & Hala can search it | **7.48856269%** | 4.49972417% |
| Neither held, but Tag Call can access surviving Guzma & Hala and Double Dragon | **6.48632997%** | 3.89750303% |
| **Union of the three routes** | **28.99365301%** | **17.42169315%** |

An unconditioned seven contains no Basic with probability **39.91204508%**; the accepted Basic-valid seven probability is **60.08795492%**. Mulligans alter the opposing player's potential extra draws and are excluded from this single-hand composition test. Tag Call finding ADP after starting some other Basic is insufficient for this specific Active ADP event. That other-starter Switch line has its own distinct costs and remains outside this calculation.

## Exact six-Prize continuity screen

For the same first-turn event, require at least one card from **each** of five additional groups to be physically outside six Prizes: Thorton, Wild Blaze M Charizard-EX, Regidrago V, Regidrago VSTAR, and a basic Grass/Fire Energy. A group already seen in the first eight qualifies as unprized. If unseen, at least one copy must remain among the 46 cards after first eight and six Prizes. Inclusion-exclusion on the specific remaining physical groups handles simultaneous Prize collapse without multiplying marginal probabilities.

The resulting necessary-identity joint event is **25.98705553% conditional on Basic-valid seven**, or **15.61509021% unconditional**. Its exact route numerators (same denominator below) are `33683669933058368`, `16811214945273120`, and `14575986320229440`. The sum is `65070871198560928`.

This second number still does **not** show that Thorton, evolution, discard-ready Charizard or the right basic Energy can actually be drawn or searched by T2. It leaves the physical Wild Blaze discard requirement, first-turn use of Guzma & Hala, second-turn Thorton Supporter contention, Regidrago VSTAR evolution, exactly one manual attachment on each turn, and a surviving ADP/board untested. It is a joint availability screen, not the probability of the full payoff.

## Counting proof and reproduction

Use disjoint initial deck groups with sizes `[2,4,4,3,4,1,3,3,7,2,27]`: ADP, Double Dragon, Tag Call, Guzma & Hala, Thorton, M Charizard, Regidrago V, Regidrago VSTAR, basic Grass/Fire Energy, other Basics and all remaining cards. Enumerate every seven-card category composition with at least one ADP, weighted by the product of binomial coefficients. Enumerate the eighth card from the remaining 53. For each state, six-Prize subsets are counted by inclusion-exclusion on whole category exhaustion. First taking the eighth card and then six Prizes counts the same uniform unordered partition as setting six Prizes first and subsequently drawing one of the remaining 47.

The **unconditional denominator** is `C(60,7) × 53 × C(52,6) = 416717869162795200`. The Basic-valid conditional denominator is `[C(60,7) - C(53,7)] × 53 × C(52,6) = 250397245379590400`. First-turn route numerators are `37606562218854720`, `18751154685007360`, `16241591574433680`, with union `72599308478295760`. All enumeration counts are integer BigInt values.

The executable, manifest-driven standalone [Node SFT](../../tests/agent17-adp-t1-gx-prize-gate.sft.cjs) asserts exact denominator and channel numerators, print-text contracts, missing-ADP and missing-Double-Dragon negative controls, Tag Call incremental value, and the singleton Wild Blaze Prize prerequisite. It was run successfully in a local reconstruction with the identical candidate counts and supplied card JSON. A separate Python exact enumeration independently reproduced the route numerators. A 300,000-deal deterministic Monte Carlo using physical seven/Prize/draw partitions yielded approximately **28.9869%** phase-one and **25.9660%** Prize-filtered among 179,978 Basic-valid hands, consistent with exact enumeration. These are verification checks, not independent paper games.

## Independent original-rank6 answer availability

The authentic source [rank-6 Iron Thorns printed 60](full-decklists.json) has **four Basic Pokémon**, all Iron Thorns ex TWM 77, and eight direct attached-Energy removers: Plumeria ×4, Team Flare Grunt ×2 and Enhanced Hammer ×2. When rank6 starts **first**, it ordinarily sees its initial seven and two turn draws before its **second turn**, immediately following ADP's own first turn going second. The opposing ADP with its attached Double Dragon is then a target for those removal effects, subject to exact costs, permitted actions and source priorities.

Conditioned on rank6 obtaining a seven-card opening with at least one Basic, the probability of seeing **at least one of these eight physical removal cards in the first nine** is **71.98924575%** without bonus/mulligan draws. The independent exact count uses

`1 - [(C(52,7)-C(48,7)) C(45,2)] / [(C(60,7)-C(56,7)) C(53,2)]`

with denominator `212610958560` and favorable numerator `153057025440`. The source's own raw seven is Basic-invalid **60.05003743%** of the time; its actual accepted opening therefore follows the Basic-valid conditional distribution. The candidate also frequently mulligans, so both players' optional extra mulligan draws are excluded from this baseline. Actual hand retention, two-card Plumeria discard, Supporter contention, T2 board state, source choice of a removal action and candidate recovery remain unmeasured. The standalone SFT checks the original rank6 card counts and exact BigInt fraction.

This is a **high-probability source answer-access pressure signal**, and a reason to prioritize a naturally selected first-source-turn policy with card preservation and paid removal. It does not prove that 71.99% of actual rank6 games remove the Double Dragon or beat the ADP deck. Multiplying it by 28.99% would introduce extra independence and no-mulligan-draw assumptions and still produce only a joint physical opportunity, not a played counter or a candidate defeat.

## Precommitted hard-source falsifier for the next integrated pilot

Use original [rank-6 Iron Thorns](full-decklists.json), retaining its printed four Plumeria, two Team Flare Grunt and two Enhanced Hammer, and the registered v2 unchanged 60. Test both start orders and actual source seats in one symmetric common-policy native release with all physical deals recorded. The decisive central-plan challenge occurs after an actual payable candidate T1 enhanced Altered Creation-GX with **exactly one Double Dragon attached**: a legally selected and settled source Energy-removal effect before the candidate's T2 can strip that DDE. With only one subsequent normal manual Energy attachment, the exact proposed immediate Thorton→VSTAR→Apex Dragon attack cost cannot be met without an additional legal source of Energy acceleration. Record the real source payment, energy-zone transition, candidate's legal alternatives and opponent continuation. This falsifies **the immediate two-turn payoff under that observed response**, without automatically proving a candidate game loss.

For comparison, a fully selected positive result must record the T1 Active ADP and Double Dragon owner payment, enhanced GX declaration and persistent effect, T2 Thorton replacement preserving turns and attachments, VSTAR evolution, real discarded Dragon selection, Apex Dragon cost and Wild Blaze five-card mill, attack damage and extra Prize, followed by a competent original-source response. Early Item lock, opponent T1 attack pressure, second Stadium/Tool lines, or non-ADP starters should remain in the denominator.

Agent30's [Apex Alchemy early Muk plus paid Dragon-copy analysis](../statistics/agent30-apex-alchemy-direct-turn2-lock-attack-20261102.md) investigates a different mechanism under a narrower constrained draw/discard model. The 28.99% and Agent30's 0.125% events **must not be treated as equivalent metrics or a candidate ranking**. Both proposals remain structurally interesting and competitively unqualified. No change to the original printed 60s, frozen policies or selected best-deck index follows from this result.

**Field status remains 29/32 authenticated original sixties, zero competitively qualified games, no selected best fixed 60, and no demonstrated 99.5% win rate.**
