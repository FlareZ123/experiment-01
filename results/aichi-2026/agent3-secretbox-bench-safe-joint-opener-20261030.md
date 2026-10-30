# First-turn double-lock search must also survive the opponent's first attack

**Agent 3 | 30 October 2026 | exact source-specific setup/connector event, no actual Meloetta win or native lock result.**

## Why a seemingly 24.45% first-turn lock opener can be strategically unsafe

The [Secret Box + Arven two-layer Jellicent route](agent3-secret-box-arven-jellicent-double-layer-20261030.md) gave **24.450935%** physical first-own-turn opportunity with 4 Frillish, 4 Jellicent ex, 4 Boost Shake, 4 Stealthy Hood, 4 Silent Lab, 4 Arven, one ACE SPEC Secret Box and 12 total Basic Pokémon. The event requires **Frillish in the original opening seven** so the player can select it Active before drawing. It does not require a second Basic to be placed on the setup Bench.

A different original Aichi source, [rank26 Meloetta Donk](agent3-meloetta-donk-lone-basic-setup-risk-20261030.md), has printed capacity to use a first-player attack through Meloetta's Debut Performance. If it can actually Knock Out the candidate's **only** starting Pokémon, the candidate loses by having no Pokémon in play *before it ever gets to use the held Arven/Box/Boost*. A second legal Basic on Bench prevents that narrow immediate-loss condition from one single Active knockout. The source's complete Prize-enabling TM line and actual first-turn damage output remain unverified, so this is a necessary structural caution, **not a measured donk frequency**.

We therefore computed the exact **intersection** of (A) first-own-turn double-lock search access and (B) initial seven permits **at least two Basic Pokémon in play** (including opening Active Frillish and a candidate-selected second Basic on Bench). This excludes any candidate mulligan bonus cards, which could also be benched before game start; no opponent combat actions are simulated. The second-Basic condition is a board-design policy choice, and the single-Active-loss threat only actually occurs when an opponent finishes the legal KO.

## Finite combinatorial method

Extended the existing [BigInt Secret Box enumerator](../../scripts/agent3-jellicent-secret-box-shield-access.cjs) with optional `minSetupBasics=2` and [nine pure regressions](../../tests/agent3-jellicent-secret-box-shield-access.test.cjs). It partitions the unnamed card class into a defined count of remaining Basic and other cards **for purposes of the original opening seven**, while preserving exact disjoint joint Prize/deck-access counts and overlapping Arven/Box search route union. The model fixes four Frillish as Basics; varying total Basic copies affects the other eight or more starting-eligible Pokémon, not the same four Frillish. For transparency, `minSetupBasics=2` currently requires the unrestricted `cheapDiscards=0` profile; no assumed overlap between cheap discard fodder and separately Benched Basics is silently introduced.

| Candidate total Basic copies | Physical lock access going second | Lock access **AND** second starting Basic going second | Second Basic given the opening search event | Lock access AND second Basic going first |
| ---: | ---: | ---: | ---: | ---: |
| 8 | 30.277907% | **12.999027%** | 42.932382% | 4.131617% |
| **12** | **24.450935%** | **15.514351%** | **63.450950%** | 4.995476% |
| 16 | 21.969303% | **17.039032%** | 77.558365% | 5.552984% |
| 20 | 20.793206% | **18.071622%** | 86.911182% | 5.954417% |
| 24 | 20.226635% | **18.778608%** | 92.840990% | 6.247004% |

The probabilities are **conditional on a Basic-valid original seven**. A candidate whose one Basic is Frillish qualifies as a setup to search in the preexisting model but is excluded from this stronger **two Basic** event. Notice the reversal: **increasing total Basics from 8 to 24 decreases search-only opportunity but increases joint search-and-second-Basic opportunity**, even though all four core search copies remain fixed. This is a concrete mismatch between optimizing one ALS alone and optimizing the state needed to survive an opponent's first attack.

At 12 Basics, the joint opening is **15.514351%** going second, down from the 24.450935% search-only event. A valid such opening must still select a useful second Bench Pokémon, manage its Bench space and two-prize liabilities, retain enough hand to discard to Secret Box, and have an actual endgame attack plan. The additional Basic might be a poor starter or a Liability if its presence allows opponent Bench attacks or gust. Treating a full Bench as automatically superior would be equally unsound.

## Aichi-specific decision

A valid full-field fixed deck must respond to incompatible threats:

- Against first-player rank26, **pre-turn Bench survival** can matter more than a theoretical Arven route that would be available only after the source's attack.
- Against the three Iron Thorns lists, early **Stage 1 Jellicent + Lab/Hood** may suppress opponent Ability lock or Item/Tool reliance, but source Stadiums, Guzma and Faba still threaten the lock.
- Against rank11 Mega Absol Garbodor, [preloaded Basic Darkness Energy](agent3-absol-sourcefirst-professor-letter-hard-counter-20261030.md) allows eventual **Claw of Darkness 400 weakness-adjusted damage** against a 270HP Jellicent even if Item/Tool lock is active.

The joint model does **not** quantify source first-turn damage or second Basic survivability. The source rank26 Donk must still be verified through actual printed cards, native action and chosen targets before a player-specific loss probability can be asserted. The 12-Basic 15.514351% figure is a precise *pre-combat resource/board opportunity*, not a competitive success rate.

The [canonical two-seat policy owner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) should test source rank26 pre-turn first and record candidate starting Active/Bench identities, original source mulligans, source KO target, whether any surviving Bench remains, and whether the candidate ever reaches its first ordinary turn. A source-first Iron Thorns trial should independently verify Stadium/Tool-dependent lock activation and reversal. **Still 29/32 original authenticated benchmark lists, zero competitive-qualified games, no demonstrated 99.5%.**
