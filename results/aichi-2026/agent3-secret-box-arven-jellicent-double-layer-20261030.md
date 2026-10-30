# A single Secret Box bridges the missing Item + Tool + Stadium channels for the double-protected Jellicent opener

**Agent 3 | 30 October 2026 | exact finite-deck access, no qualified native match or deck strength result.**

## Structural innovation over the earlier Jellicent search model

The [first proposed double-protection architecture](agent3-sourcefirst-thorns-jellicent-stadium-response-20261030.md) keeps **Active Stage 1 Jellicent ex WHT45**, **Stealthy Hood UNB186** on Jellicent and **Silent Lab PRC140** in play. The Stadium suppresses **Basic Iron Thorns ex TWM77**'s Initialization but leaves Stage 1 Oceanic Curse available, while Hood can protect Jellicent against a future opposing Ability once the Stadium is replaced. This interaction still needs authentic native Store and paper ruling verification. Against the original source ranks6/24/29, a single Lab is often answerable by a replacement Stadium or G&H.

The earlier mathematical model treated **Arven OBF186** as able to fetch Boost Shake EVS142 (Item) and Hood (Tool), leaving Lab to be held. That underestimates a legitimate multistep printed channel:

`Opening Active Frillish WHT44 + Arven -> Secret Box TWM163 (Item) + Stealthy Hood (Tool) -> Boost Shake (Item) + Silent Lab (Stadium) -> attach Hood, play Lab, Boost evolve Active Jellicent ex`

- Arven can search the one **Secret Box ACE SPEC** as its Item and Hood as its Tool.
- The playable Secret Box then discards **three other hand cards**, searches a **new Item** (Boost Shake) and a **Stadium** (Silent Lab), and optionally another Supporter/Tool if eligible. Where Hood, Boost or Lab is already in hand, each search can omit that category. The printed ACE SPEC one-card limit is enforced. No extra Supporter is played this turn.
- Other valid channels are a *held* Secret Box played going first or second, the direct three-piece line, and held Arven searching Boost+Hood while Lab was already held. These paths overlap heavily; simply adding their individual probabilities would give a materially false estimate.
- Correct sequencing: play Silent Lab and attach Hood **before** Boost Shake; Boost Shake evolves Active Frillish from the deck and **ends the turn**. The only starting Basic permitted for this event is Frillish chosen Active from the original seven. Existing first-player Supporter prohibition remains in force, so Arven is usable only going second on first own turn.
- **Active Move Realism qualification:** an ordinary hand after the first turn draw contains at least six physical cards other than Secret Box if only starting Active Frillish was committed. Three physical discards are therefore mechanically available, but their strategic cost (DCI), Prize information, Bench contention, opponent lock, Tool/Stadium permission, and later attack execution remain unmodeled. Burning three critical cards to build this lock may be game-losing.

The existing conceptual [AMR and connector-domination research](../../resources/human_concepts.md) warns against identifying broad access with success. The significant advance is **identifying a previously unmodeled dual-channel feasible source action**, with quantitative consistency and physical discard cost stated separately.

## Exact combinatorial access

The new [CJS BigInt evaluator](../../scripts/agent3-jellicent-secret-box-shield-access.cjs) and [six pure regressions](../../tests/agent3-jellicent-secret-box-shield-access.test.cjs) enumerate initial seven, one ordinary first-turn draw and six Prizes. Four Frillish and 12 total Basic Pokémon are fixed. Every Jellicent used for early evolution must remain **in the deck**; required Boost/Hood/Lab/SecretBox must be held or still searchable from the deck.

For each initial-seven composition and turn draw, four complete access branches are considered: direct Boost+Hood+Lab; held Secret Box; Arven->SecretBox+Hood; Arven->Boost+Hood when Lab held. Every branch is translated into a bitmask of required surviving deck categories. An exact inclusion-exclusion count of Prize allocations **first within each branch and then across their union** prevents double-counting the same opening. All binomial counts use BigInts, decimal conversion only for display. Independently implemented Python combination math matches all headline entries to 11+ decimal places, and the JS evaluator ran in V8 with identical results. **GitHub Actions-compiled Node tests have not yet been run.**

Every row includes 4 Frillish, 4 Jellicent, 4 Boost Shake, 4 Silent Lab, 4 Stealthy Hood and 12 total Basics. Variable Arven/Box count is printed:

| Turn and connector package | Direct both-layer opening event among Basic-valid starting sevens |
| --- | ---: |
| Going first: no Box, no Arven | **2.564642%** |
| Going first: 1 Secret Box, no Arven | **8.328381%** |
| Going first: 1 Secret Box, 4 Arven | **8.328381%** |
| Going second: 4 Arven, no Box | **9.466101%** |
| Going second: 1 Box, no Arven | **8.328381%** |
| Going second: **1 Box + 4 Arven** | **24.450935%** |

In the final row, isolated **Arven→Box** availability is **16.017973%**, and held-Box availability is **5.966880%**. These numbers **overlap with each other and other paths**, and must not be summed. The exact union is **24.450935%**.

With **three copies each of Jellicent, Silent Lab and Hood**, retaining 4 Frillish, 4 Boost, 4 Arven and 1 Box, going-second double-layer access is **23.457364%**, only **0.993571 percentage points** below the four-of-everything double-layer baseline. This releases three deck slots for attacks, Energy, additional resilience, or draw. Its one-turn access metric does not measure re-establishing Jellicent after defeat, Prize recovery or hand-protection requirements.

## Paper validation and strategic consequence

The individual named cards are Expanded-legal according to current available records. The April 2026 Expanded rotation announcement retains Black & White onward; one ACE SPEC is legal. The card text comes directly from the supplied print-indexed English card pool and can be checked against Limitless: [Secret Box](https://limitlesstcg.com/cards/TWM/163), [Arven](https://limitlesstcg.com/cards/OBF/186), [Boost Shake](https://limitlesstcg.com/cards/EVS/142), [Jellicent ex](https://limitlesstcg.com/cards/WHT/45). Wally, although legal since its 2021 unban, cannot be used by the player going first on first turn despite its old evolution wording, as clarified in 2020 rule updates.

This opening package uses **25 named cards** at 4F/4J/4Boost/4Lab/4Hood/4Arven/1Box, leaving **35 slots including the eight additional Basics** specified by this 12-Basic model, other Supporters, attack plan, recovery and Energy. In the 3/3/3 variant, that is 22 named cards. The candidate still needs a real route to taking six Prizes under a 25-minute clock and protection against first-turn source threats, opposing Stadiums, Faba, Guzma, Tool Jammer and late-game resources. Secret Box discarding three high-UDP cards and opponent source pressure are major remaining risks.

For a strong counterfactual, run a **source-first rank6 Iron Thorns with Tool Jammer already equipped** against a candidate's owner-visible held Arven and search-accessible one Box, Hood, Boost, Lab and Jellicent. Require actual native Store acceptance of: Arven searches Box + Hood, Box discards three chosen owner cards and searches Boost + Lab, candidate plays Lab/attaches Hood, Boost ends turn, Stage1 Oceanic Curse blocks source Item/Tool, and **source replies with a Stadium replacement** and only then tests whether Hood maintains the lock. Repeat after source Faba removes Hood and after source has active Tool Jammer; preserve both actor's decisions, target printings, full resource ledger and eventual same-game action consequences. A favorable retrospectively selected terminal is not a competent match.

**Status:** New physically plausible and much more accessible double-layer opening mechanism, **not a fixed final 60 or a qualified win**. Program baseline remains **29/32** original authenticated opponent 60s, final ranks23/25/28 missing, **0 competitive-qualified games**, and no demonstrated 99.5% target.
