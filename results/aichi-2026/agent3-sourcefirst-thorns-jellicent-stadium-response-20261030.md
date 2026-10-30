# Source-first Iron Thorns has high raw Stadium escape exposure against a single Silent Lab layer

**Agent 3 | 30 October 2026 | exact source-hand/Pri​ze mathematics; game policy and native settlement untested.**

## Counter-ALS

The [Active Jellicent ex + Silent Lab hypothesis](agent3-jellicent-silent-lab-wally-iron-thorns-counter-20261030.md) removes Tool Jammer's direct leverage over an otherwise Hood-protected lock because Silent Lab suppresses Basic Iron Thorns's Initialization while leaving Stage 1 Jellicent's Oceanic Curse. However, **Oceanic Curse forbids the opposing player only from playing Items and Pokémon Tools from hand**. It does not prohibit Stadiums or Supporters.

The authentic source-first Aichi Iron Thorns 60s at ranks **6**, **24**, **29** each have four Iron Thorns ex as their only Basics, **two Guzma & Hala**, **two Tag Call**, and respectively **four, four and five Stadium cards**. Going first, the source cannot play a Supporter but can use Tag Call on turn 1 before Jellicent enters play. If it selects Guzma & Hala and holds that Supporter, its next turn may search a different Stadium and replace Silent Lab. If it holds the Stadium directly, it may play it without a Supporter. Replacing Silent Lab can restore Initialization and suppress Oceanic Curse, reopening otherwise blocked Item and Tool plays. This is an explicit counter-line, not yet a native source action.

## Exact conditional first-nine card exposure

The [BigInt formula script](../../scripts/agent3-thorns-silent-lab-stadium-reply.cjs), [pure regressions](../../tests/agent3-thorns-silent-lab-stadium-reply.test.cjs), and an independent Python `math.comb` derivation agree. Model:

- Source has 60 cards, exactly **4 Basic Iron Thorns ex**, `S=4` or `S=5` Stadiums, 2 Guzma & Hala, 2 Tag Call, six uniform Prizes.
- Source initial seven **contains a Basic**, then source draws one ordinary card on its first turn and one on its second turn. The two turn draws are equivalent to a uniform sample of two remaining cards, marginalizing over six Prizes. No other draw/search is credited except the optional one Tag Call on source turn 1.
- Source may strategically **reserve a Stadium** seen in its first nine cards, rather than consume its only replacement on turn 1. A held Guzma & Hala on turn 2 may search a Stadium only if at least one remains in deck after Prizes. A held Tag Call by turn 1 may search Guzma & Hala before Item lock, provided at least one Guzma & Hala and Stadium remain accessible. Its own Supporter quota cannot be consumed on the going-first first turn anyway.
- The Tag Call contribution is disjoint from the previous two channels by counting only states with no Stadium or Guzma & Hala in the natural first nine. The Tag Call search changes the actual second-turn shuffle; this remains a **resource-access abstraction**, not a physical replay guarantee.
- No candidate mulligan bonus cards for source, additional Trainers' Mail, Pokémon benches, source discarded cards, card-play policy, Supporter denial, one-Stadium-per-turn conflict or opponent response are modeled.

| Source final rank | Printed Stadiums | Direct Stadium appears by first nine | Direct Stadium OR held Guzma & Hala | Plus first-turn Tag Call search, available source replacement |
| ---: | ---: | ---: | ---: | ---: |
| 6 | 4 | **45.720474%** | 60.740185% | **70.597167%** |
| 24 | 4 | **45.720474%** | 60.740185% | **70.597167%** |
| 29 | 5 | **53.761480%** | 66.779237% | **75.274136%** |

The fourth column slightly corrects raw Guzma & Hala exposure for the event that every Stadium is Prized. The fifth corrects first-turn Tag Call exposure for the event that all Stadiums or both Guzma & Hala are Prized. The full counted disjoint events are exact within the stated artificial card-location model; the percentages **cannot be described as observed choices or settled counter frequency**.

The source's opening-seven Basic-valid probability is **39.9499626%**, so source mulligans will also give the candidate optional bonus draws. That separate feedback has been quantified in the [candidate direct-opening study](agent3-four-basic-thorns-mulligan-protected-lock-access-20261030.md). Because the source's final accepted Basic-valid seven is independent of its preceding failed-hand count, combining the two is feasible as a joint opportunity model. It remains short of an adversarial game policy.

## Design implication: two independent protection layers instead of one

A **dual-protection** Active Jellicent with *both* Stealthy Hood attached **and** Silent Lab in play has two candidate counter-suppression channels:

- Source replacing Silent Lab with another Stadium may restore Iron Thorns's Initialization, while the still-working Hood may protect Jellicent against the opponent's Ability.
- Source already carrying Active Tool Jammer may suppress the Hood, while Silent Lab still removes Iron Thorns's own Basic Ability.

Breaking both can require opponent **pre-equipped Tool Jammer plus later Stadium replacement**, or a **held Faba removing Hood plus held Stadium replacement**, or bypassing the Active requirement with Guzma. A source Supporter used for Faba cannot also be Guzma & Hala that turn. This interaction is a printed-card inference awaiting native and judge verification; the opponent also has Capture Energy that can establish a second Benched Iron Thorns independently of Items.

The two-layer opener is more demanding. An independent exhaustive Python 60/7+turn-draw+six-Prizes count with 4 Frillish/Boost/Jellicent/Lab/Hood and 12 Basics finds:

| Double-protection line | Direct event among Basic-valid original sevens |
| --- | ---: |
| Both Hood and Lab held with Boost, going first | **2.564642%** |
| Add four Arven, going second (can search missing Boost and Hood) | **9.466101%** |
| Add four Wally, going second | **10.723182%** |
| Add four Guzma & Hala too, ignoring its 2-card discard expense | **17.057668%** |

The final row consumes **32 named card slots** before remaining Basics, Energy and core game plan, and allows no Supporter contention beyond choosing one. These numbers are **uncommitted Python exploratory calculations** that have not yet been independently regressed in a repository CJS model. They indicate a sharply limited direct-opening window, not a scalable final list.

## Critical integration test

The [Agent41 canonical bilateral runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) needs one physical source-first rank6 or rank29 witness where candidate develops Active Jellicent with Silent Lab. On the very next source turn, check whether the same two-seat chooser sees, chooses and **Store-accepts** a Stadium reply, then a later legal Item or Tool, with actual Ability effect resolution, and whether a Hood layer changes that acceptance. Also test a pre-equipped source Tool Jammer and held Faba+Stadium; report the failure if no such opportunity occurs rather than inventing one. Attributing a response to source rank6's script must avoid loading unknown private cards from candidate perspective.

**Verdict:** single-layer Silent Lab access has a substantial opponent Stadium-response exposure. The double layer deserves a short targeted falsification as a structural response; its own opening access remains limited. Neither establishes a competitive advantage or an optimized deck. Benchmark still **29/32 exact published original 60s, zero competitively qualified games**.
