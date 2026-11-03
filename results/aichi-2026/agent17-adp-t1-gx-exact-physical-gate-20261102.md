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

The authentic source [rank-6 Iron Thorns printed 60](full-decklists.json) has **four Basic Pokémon**, all Iron Thorns ex TWM 77, and **ten deterministic direct attached-Special-Energy answers**: Plumeria ×4, Team Flare Grunt ×2, Enhanced Hammer ×2, **Megaton Blower ×1, and Faba ×1**. It additionally contains **Crushing Hammer ×4**, each requiring a successful coin flip. The original eight-card enumeration below is therefore an explicitly named partial subset of the ten deterministic cards. When rank6 starts **first**, it ordinarily sees its initial seven and two turn draws before its **second turn**, immediately following ADP's own first turn going second. The opposing ADP with its attached Double Dragon is then a target for those removal effects, subject to exact costs, permitted actions and source priorities.

Conditioned on rank6 obtaining a seven-card opening with at least one Basic, the probability of seeing **at least one of these eight physical removal cards in the first nine** is **71.98924575%** without bonus/mulligan draws. The independent exact count uses

`1 - [(C(52,7)-C(48,7)) C(45,2)] / [(C(60,7)-C(56,7)) C(53,2)]`

with denominator `212610958560` and favorable numerator `153057025440`. The source's own raw seven is Basic-invalid **60.05003743%** of the time; its actual accepted opening therefore follows the Basic-valid conditional distribution. The candidate also frequently mulligans, so both players' optional extra mulligan draws are excluded from this baseline. Actual hand retention, two-card Plumeria discard, Supporter contention, T2 board state, source choice of a removal action and candidate recovery remain unmeasured. The standalone SFT checks the original rank6 card counts and exact BigInt fraction.

**Expanded original-source card census correction, 3 November 2026:** The preceding **71.98924575%** uses only the eight-card Plumeria/Team Flare Grunt/Enhanced Hammer subset, which is a correct subset calculation but previously undercounted the actual source's direct replies. Original rank6 also has **Faba LOT 173 ×1**, which can Lost Zone an attached Special Energy with its Supporter effect, and **Megaton Blower SSP 182 ×1**, an ACE SPEC Item that discards all opponent attached Special Energy and Tools and the Stadium in play. Megaton Blower can discard Thunder Mountain itself, so source sequencing matters when it also needs that Stadium to fund Volt Cyclone. All ten deterministic answers are physically seen in the first nine cards with **80.31012727%** probability conditional on a Basic-valid source seven without bonus extras, and **81.51236503%** with full optional mulligan bonus draws against seven-Basic ADP. The three no-hand-discard-cost **Item** copies (Enhanced Hammer ×2 plus Megaton Blower ×1) are seen with **36.48146031%** baseline and **37.75130122%** full-bonus; adding Team Flare Grunt ×2 and Faba ×1 yields six deterministic answers with no hand-discard payment, though the latter three consume a Supporter. The four **Crushing Hammer** printings offer a further 50%-coin-flip removal channel. Seeing cards does not establish actual payment, chosen action, stadium ordering or a successful coin toss.

This is a **high-probability source answer-access pressure signal**, and a reason to prioritize a naturally selected first-source-turn policy with card preservation and paid removal. It does not prove that 71.99% of actual rank6 games remove the Double Dragon or beat the ADP deck. Multiplying it by 28.99% would introduce extra independence and no-mulligan-draw assumptions and still produce only a joint physical opportunity, not a played counter or a candidate defeat.

## Additional, disjoint Active-position route: Tag Call + Switch

The preceding first-turn no-bonus GX event intentionally starts **ADP Active**. The unchanged fixed 60 also has **two Switch (SVI 194)** and **four Tag Call (CEC 206)**. When the initial seven lacks ADP but includes another Basic Pokémon, a first-eight hand containing Tag Call and Switch can execute a distinct connector sequence:

`Start non-ADP Basic → Tag Call searches ADP TAG TEAM Pokémon + Guzma & Hala TAG TEAM Supporter → Bench ADP → Guzma & Hala (discard 2 other hand cards) searches Double Dragon Energy → attach DDE → Switch ADP Active → enhanced Altered Creation-GX`.

If one or more of ADP, Guzma & Hala or DDE was already held, its search is unnecessary; if missing, at least one surviving copy must remain outside the six Prizes and in the deck. A single Tag Call searches at most two TAG TEAM cards and can therefore cover the two missing ADP and Supporter identities simultaneously. Guzma & Hala searches DDE using a Supporter; Switch remains a required Item and the once-per-turn attachment is DDE. The player has enough other physical hand cards for its printed discard-two cost under this exact single-search sequence, but the **strategic value of those discarded cards** and the available opponent Item/energy-answer window remain unresolved. Bench room is available if the board has only the initial non-ADP Basic; future board constraints are not modeled.

An independent exact BigInt counting test partitions the fixed 60 into categories `[ADP2, other Basic5, Tag Call4, Switch2, Guzma & Hala3, DDE4, other40]`. It requires no ADP in the actual initial seven and a non-ADP Basic there, Tag Call and Switch within first eight, at least one accessible ADP/G&H/DDE in the first eight or after six Prizes, one ordinary draw, and no bonus/mulligan, extra card draw, or other search. It enumerates initial-seven card categories, the eighth natural draw, then uses inclusion-exclusion on simultaneous Prizing of the three searchable identities. Same Basic-valid seven denominator `250397245379590400` applies to the no-bonus event.

| Mutually exclusive physical T1 route | Conditional on candidate Basic-valid opening seven |
| --- | ---: |
| Opening Active ADP, first-eight held / G&H / TagCall to DDE | **28.99365301%** |
| Opening non-ADP Basic, first-eight Tag Call + Switch, accessible ADP/G&H/DDE | **5.67353042%** |
| **Union of these two specifically modeled routes** | **34.66718344%** |

The bridge numerator is `14206363895848805`. The [independent exact bridge SFT](../../tests/agent17-adp-tagcall-switch-bridge.sft.cjs) checks actual deck counts and printed Tag Call/Switch/DDE text, exact integers and negative controls with missing Switch/Tag Call/ADP. A separately seeded 500,000-attempt physical shuffle experiment observed about **5.71%** of Basic-valid sevens on this bridge, within ordinary Monte Carlo error of the exact figure. In a further 600,000-game coupled mulligan simulation, baseline union was about **34.67%** and the two-route union with all optional opponent-mulligan bonus draws was about **38.10%**. The independent exact full-bonus calculation below reproduces this wider event. Both methods concern physical hands and Prizes, with **no player action or paper game simulated**.

**Full-bonus exact extension, also preserving the mutually exclusive starting Active choices.** The combined [mulligan-coupling SFT](../../tests/agent17-adp-rank6-mulligan-coupling.sft.cjs) now reconstructs non-ADP-Active Tag Call/Switch opportunities after setup extras from an exact *seven-card hand, six-Prize, post-Prize draw* partition. It aggregates 45 mutually exclusive physical prize-state groups by held Tag Call/Switch and surviving deck counts. In each state, inclusion-exclusion on drawing at least one missing Tag Call and/or Switch from the remaining 47 cards gives an exact conditional probability for any specified bonus count. Simultaneous-mulligan category weights are the same as previously described; integrate bonus counts 0 through 30, then bound the remaining tail by `0.000000107572` total probability.

| Disjoint source-rank6-opposed candidate access channel | Conditional Basic-valid opening seven, all permitted bonus draws taken |
| --- | ---: |
| ADP starts Active, DDE/G&H/Tag Call access | about **30.511985%** |
| Another Basic starts Active, Tag Call + Switch bridge | about **7.602974%** |
| **Two-route physical enhanced-GX union, precise bounded result** | **38.11495837%–38.11496912%** |

These figures are conditional on the **candidate's Basic-valid starting seven** and on the original rank6 opponent's independent valid setup with its differing mulligan count; a random game can produce bonus draws even after some simultaneous mulligan resets. Both source and candidate decks retain their unchanged original printings. The route union is exact under the explicit maximum-bonus, normal-turn-draw, no-extra-search/ability-draw assumptions and is still a **physical opportunity lower subset**, with game-state choices, strategic hand payment, eligible turn actions, official match clock, and opponent decisions unmeasured. It is not a tournament win rate. The bounded exact result replaces the Monte Carlo-only point approximation for this limited two-route union.

This route directly addresses the fixed proposal's **ADP-Active opening geometry** without inventing a different 60 or treating Tag Call as a free universal connector. It also heightens the importance of the original rank6 source's Energy-removal window and of capturing realistic two-card Guzma & Hala payment when evaluating natural GX success. The 34.667% no-bonus union is a valid concrete lower subset of physical T1 access under the stated uncontested, willing-discard model. Other paths involving Quick Ball, Ultra Ball, direct Switch from a drawn ADP without Tag Call, and extra Supporter/draw resources remain outside the two-route count, so this is **not** a global upper bound.

## Physical two-turn payoff: source-aware resource bottleneck, strict no-bonus route

The previous large early-GX probabilities say nothing about whether the candidate follows its T1 Altered Creation-GX with an actual T2 Apex Dragon attack. An independent exact strict-hand screen now quantifies a particularly reproducible **T1 enhanced GX → Battle Compressor → T2 Thorton/VSTAR/Basic-Energy** chain on the same unchanged v2 60.

The event requires: (1) ADP chosen Active from the initial seven; (2) at least one Battle Compressor XY4 92 held by T1, enabling a genuine deck search that discards **one Regidrago V and the single M Charizard-EX Wild Blaze Dragon** while both survive the physical six Prizes and are still in the deck; (3) DDE already held in the first eight or reachable through physically held Guzma & Hala / held Tag Call→Guzma & Hala; (4) Thorton SWSH11 167, Regidrago VSTAR SWSH12 136, and a Basic Grass/Fire Energy all held by T2, using only one subsequent ordinary draw after Compressor's search-induced shuffle; (5) no other hand/draw/search, no bonus setup cards, no opponent disruption and no supporting Ability. A single T2 draw can complete at most one missing card category. This intentionally excludes paths via Ultra Ball, Quick Ball, VS Seeker, Pokégear, additional Supporter draw or a T2 freshly found piece.

The exact calculation partitions the 60 into `[ADP2,DDE4,TagCall4,G&H3,Thorton4,VSTAR3,BasicEnergy7,Compressor4,RegV3,Charizard1,other25]` and enumerates the real Basic-valid seven, one T1 draw, and all six Prize allocations by inclusion-exclusion. Crucially, after T1 hand and six Prizes the searchable deck contains **46 cards**; Compressor discards RegV and Charizard and shuffles, leaving **44 cards** for the ordinary T2 draw. If all three required T2 categories are already held, every post-Compressor draw qualifies. If exactly one category is missing, the count weights each eligible unprized physical target card among those 44. If two or three are missing, a single ordinary draw cannot complete them.

| Strict T1 DDE access channel | Probability of complete physical two-turn event, conditional Basic-valid seven |
| --- | ---: |
| DDE held by T1 | **0.22460442%** |
| No held DDE, held Guzma & Hala reaches DDE | **0.13681933%** |
| Neither held, Tag Call reaches Guzma & Hala then DDE | **0.14578746%** |
| **Union, with Battle Compressor and full T2 hand resources** | **0.50721122%** |

Exact scaled numerator `55881889003296496` divided by `11017478796701977600`. Reproducible source-card-count BigInt [enumerator](../../scripts/agent17_adp_turn2_physical.py) asserts the exact integers, reads the unchanged registered manifest and outputs all three route fractions. A separately seeded 800,000-permutation Monte Carlo with physically correct post-Compressor removal and reshuffle estimated **0.5142% conditional Basic-valid seven**, compatible with the enumerated result.

**Interpretation:** 0.5072% is an intentionally restrictive *path subset*, and is neither a complete setup rate nor an upper bound on how often skilled play can execute the line. It does show that a deck whose T1 GX is comparatively accessible can still have a severe T2 connector/hand acquisition problem under simple natural-draw play. The two-card G&H discard, Ultra Ball discard, T2 Supporter Thorton opportunity cost, pre-GX hand preservation, source-original DDE removal, damage, original-source attacks, Clock and match outcome remain separate. A strong actor policy must turn additional Ball/Seeker/Pokégear routes into physically selected, payable, settled T2 attacks, and prospective native tests need to report failed-turn denominators instead of inferring T2 payoff from T1 access.

## Actual mutual mulligan bonus-draw asymmetry

The preceding two opening numbers are **no-mulligan-extra baselines**. The candidate contains seven Basic Pokémon, while the exact original rank6 contains four. A complete simultaneous setup permits both players to mulligan together when both have invalid opening sevens. Once one player receives a Basic-valid seven, the player who continues to mulligan creates optional bonus draws for the already-valid opponent. The players' final Basic-valid seven-card hand compositions are independent of how many failed shuffles preceded them, but their bonus-draw counts are coupled.

Let `qC = C(53,7)/C(60,7) = 0.3991204507677` be the candidate's Basic-invalid seven probability and `qS = C(56,7)/C(60,7) = 0.6005003742553` the source's. If `D_C` means optional setup extra draws received by the candidate, exact probabilities are

`P(D_C=0)=(1-qS)/(1-qC qS)` and `P(D_C=d)=(1-qC)(1-qS)qS^d/(1-qC qS)` for integer `d>=1`. Exchange C and S for the source's bonus `D_S`. The two cannot simultaneously receive positive bonus draws in one game.

Under independent physical decks and **both players always electing to take their full permissible mulligan draw**:

| Physical setup property | Candidate ADP v2 | Original rank6 Iron Thorns |
| --- | ---: | ---: |
| Basic-invalid seven-card attempt | 39.91204508% | 60.05003743% |
| Probability of receiving at least one opponent-mulligan bonus card | **47.45693763%** | **20.97101074%** |
| Mean optional bonus cards per started game | **1.18790944** | **0.34900523** |
| Source of original no-bonus opportunity | ADP T1 enhanced GX route 28.99365301% | Any of eight Energy removers seen by own T2 71.98924575% |
| With full bonus draws | **30.51134%–30.51310%** | **73.39095871%–73.39095893%** |

The candidate interval is exact to the stated bounds, summing `D_C=0..20` and allowing the residual geometric-tail probability `0.0000176427125` to contribute anywhere from 0 to 1. The source interval similarly sums `D_S=0..20`, with residual tail only `0.0000000022065`. The candidate's upper/lower interval is intentionally a conservative bound on the fully mixed physical event, independent of whether an omitted extreme-bonus branch actually delivers a route. Smaller or declined bonus draws invalidate these particular full-bonus figures, while the no-bonus baselines remain separately meaningful.

**Payment-screen refinement:** original source rank6's **Team Flare Grunt ×2** and **Enhanced Hammer ×2** can discard the sole attached Double Dragon without Plumeria's discard-two-card cost. Team Flare Grunt consumes the Supporter for the turn; Enhanced Hammer consumes an Item, so their actual availability remains affected by other game constraints. Among Basic-valid opening source sevens, the probability of **seeing at least one of those four no-hand-discard-cost printings by the second personal turn** is **45.72047432%** without bonus draws and **47.14863458%** when full opponent-mulligan bonus draws are included. Their first nine + bonus observation includes cards that might subsequently be spent or discarded, so this measures a *seen-card opportunity*, not guaranteed preservation or actual legal Energy removal.

**Bilateral counter-opportunity without an independence shortcut.** The optional bonus categories are mutually exclusive: a given game can give extra setup cards to the candidate, to the source, or to neither. Weighting the two decks' independent Basic-valid card compositions by that *joint* setup distribution gives an exact truncated-interval result for the source-first/candidate-second orientation:

| Joint physical event | Full-bonus probability interval |
| --- | ---: |
| Candidate T1 ADP enhanced-GX route accessible **and** source sees one of four no-hand-discard-cost DDE removers by source T2 | **14.36400459%–14.36481128%** |
| Same candidate route **and** source sees one of all eight DDE removers | **22.37129045%–22.37256060%** |

For each integer positive bonus count `d`, the three disjoint setup masses are `P(no bonus)=(1-qC)(1-qS)/(1-qC qS)`, `P(candidate bonus d)=P(no bonus) qS^d`, and `P(source bonus d)=P(no bonus) qC^d`. Within each count, the candidate and original-source shuffled card compositions are independent, allowing exact multiplication of *conditional* physical probabilities. Sum through 20 extras, then bound omitted count tails conservatively with probabilities between zero and one. Applying the two marginal percentages as independent unconditionally would ignore this shared mulligan coupling. The narrower four-card result is the most useful cheap-screen target for a precommitted real source response. It remains a conjunction of *paper-visible card opportunities*, with no selected physical play, payment or attack.

**Extended two-route bilateral source challenge.** The original source's two Enhanced Hammer printings are Item answers that can discard the candidate's Double Dragon Energy on source T2 without spending the source's one Supporter. Team Flare Grunt likewise has no hand-discard payment but consumes that Supporter; a turn that uses it cannot also use Guzma & Hala for a missing Thunder Mountain or Double Colorless Energy. Plumeria's four copies have an extra two-hand-card discard cost. These action-contention distinctions matter even when all eight effects share the same abstract target.

With the candidate's **full two-route** T1 physical enhanced-GX event (ADP Active or non-ADP Tag Call + Switch), and full available optional mulligan bonus draws under the same precise joint setup distribution, the SFT now separately bounds:

| Bilateral source-first physical exposure by source T2 | Joint opportunity interval |
| --- | ---: |
| Candidate two-route GX is accessible and source sees **Enhanced Hammer ×2** | **10.21664589%–10.21664868%** |
| Candidate two-route GX is accessible and source sees **Enhanced Hammer ×2 or Team Flare Grunt ×2** | **17.92144269%–17.92144761%** |
| Candidate two-route GX is accessible and source sees **any of eight** removers including Plumeria | **27.92460552%–27.92461327%** |

These joint rates include source original Basic-valid seven composition and two ordinary source draws; the candidate's two mutually exclusive opening-Active routes are integrated with the shared relative mulligan counts. They do not assume unconditional source/candidate independence or equate a seen Trainer with a playable one. **An original-source decision, legally paid Energy removal, and the candidate's next-turn response remain to be observed in the common native policy.** When the opponent also needs to play Guzma & Hala to power Volt Cyclone, the Enhanced Hammer branch may offer a particularly useful paper-payable counter because its Item action leaves that Supporter opportunity intact. The literal 10.2166% is still an access-conjunction probability, not the frequency of actually successful energy denial.

The standalone [mulligan coupling SFT](../../tests/agent17-adp-rank6-mulligan-coupling.sft.cjs) enumerates full hypergeometric post-setup ADP/G&H/Tag Call/DDE card access for each bounded bonus count, multiplies exact physical hand probabilities by the geometric joint-mulligan mass, and separately applies the authentic source four-Basic and four/eight-remover patterns. Exact source/candidate printed counts, the no-bonus controls, the no-discard-cost subset and geometric-tail upper bounds are asserted. Manual-only CI runs the new test beside the preceding Prize-gate test; it does not invoke Twinleaf. A separate 300,000-deal physical Monte Carlo gave about 30.4237% candidate T1 opportunity and 73.3847% source remover exposure, consistent with the analytical results at Monte Carlo resolution. Neither model represents hand retention, player decisions or the match clock.

These coupled percentages explain why equal random seeds do not create identical relevant *opportunity* distributions across changed candidate mulligan rates, and why original physical source-deal matching is needed before any paired rank6 native winner analysis. The cheap source-removal falsifier remains the same.
 
## Precommitted hard-source falsifier for the next integrated pilot

Use original [rank-6 Iron Thorns](full-decklists.json), retaining its printed four Plumeria, two Team Flare Grunt and two Enhanced Hammer, and the registered v2 unchanged 60. Test both start orders and actual source seats in one symmetric common-policy native release with all physical deals recorded. The decisive central-plan challenge occurs after an actual payable candidate T1 enhanced Altered Creation-GX with **exactly one Double Dragon attached**: a legally selected and settled source Energy-removal effect before the candidate's T2 can strip that DDE. With only one subsequent normal manual Energy attachment, the exact proposed immediate Thorton→VSTAR→Apex Dragon attack cost cannot be met without an additional legal source of Energy acceleration. Record the real source payment, energy-zone transition, candidate's legal alternatives and opponent continuation. This falsifies **the immediate two-turn payoff under that observed response**, without automatically proving a candidate game loss.

For comparison, a fully selected positive result must record the T1 Active ADP and Double Dragon owner payment, enhanced GX declaration and persistent effect, T2 Thorton replacement preserving turns and attachments, VSTAR evolution, real discarded Dragon selection, Apex Dragon cost and Wild Blaze five-card mill, attack damage and extra Prize, followed by a competent original-source response. Early Item lock, opponent T1 attack pressure, second Stadium/Tool lines, or non-ADP starters should remain in the denominator.

Agent30's [Apex Alchemy early Muk plus paid Dragon-copy analysis](../statistics/agent30-apex-alchemy-direct-turn2-lock-attack-20261102.md) investigates a different mechanism under a narrower constrained draw/discard model. The 28.99% and Agent30's 0.125% events **must not be treated as equivalent metrics or a candidate ranking**. Both proposals remain structurally interesting and competitively unqualified. No change to the original printed 60s, frozen policies or selected best-deck index follows from this result.

**Field status remains 29/32 authenticated original sixties, zero competitively qualified games, no selected best fixed 60, and no demonstrated 99.5% win rate.**
