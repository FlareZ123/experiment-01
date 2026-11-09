# Sentinel v1: source-owned Jet Energy exits a Guzma-promoted Vileplume

**9 November 2026 | Agent 20 | Developmental native paper-line proof, no qualified games**

## Concrete result

The unchanged printed [Sentinel Lopunny/Vileplume v1 60](../candidate-sentinel-lopunny-vileplume-v1.psv) already contains **three Jet Energy PAL** and three Guzma BUS. The proposed [Sentinel gust-escape v2](candidate-sentinel-gust-escape-v2.psv) sacrifices a third Stealthy Hood for a singleton Float Stone. A native Store test shows one distinct existing-card escape:

1. An exact original Sentinel v1 printed 60 is staged with an opening that draws a **spare Jet Energy instead of Pidgey**. All 60 physical source objects remain in their original card zones.
2. The first-turn going-second paper-paid Guzma & Hala → Artazon → Bunnelby → first Jet → TM: Evolution **double Evolution attack** establishes Benched Vileplume.
3. Original rank-1 Shadow Rider plays its own genuine Guzma BUS. Both native ChoosePokemon prompts resolve, promoting the **zero-Energy Vileplume** Active.
4. The conditioned opponent **passes without attacking**. On the owner's next real native turn, an actor-only policy observes its own remaining Jet, Active Vileplume and the already Jet-funded Benched Bunnelby.
5. **A real Store PlayCardAction attaches that second Jet from the owner's hand to Benched Bunnelby. Jet switches Bunnelby to Active, returning Vileplume to Bench.** Both Jet cards remain physically attached to Bunnelby; the same printed Vileplume is still in play. All source physical objects remain distinct and the final zone inventory is exactly 60, including the Stadium zone. No Prize is taken during the escape.

The same test **passes in source physical seat 0 and seat 1**, preserving the original printed v1 60 throughout. This is a conditional tactical escape using an existing Energy card, without adding Float Stone or changing the final 60.

## Reproduction and qualification

- [Opt-in owner-only root decision](../../../simulation/twinleaf/2026-11/agent20-sentinel-postgust-jet.cjs) reads only detached actor hand and public board, and checks normal Energy attachment, Special Energy prohibitions and a funded Bunnelby.
- [Five owner-root pure tests](../../../tests/2026-11/agent20-sentinel-postgust-jet.test.cjs) exercise the real proposal and energy/lock/no-hand/no-Bench/prompt vetoes.
- [Both-seat physical native Store replay](../../../tests/2026-11/agent20-sentinel-postgust-jet-native.test.cjs) uses the original Agent28 fully paid source opener and original rank-1 opponent Guzma. The complete native and pure Sentinel test group ran under existing **manual-only** workflow `.github/workflows/aichi-dusclops-self-ko.yml`, option `sentinel_artazon_direct_probe=true`.
- **[GitHub Actions 42578529576: SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/42578529576)**, source head `070cc61174ef429fa8916cd9bc48293958e06bd0`. Original Sentinel direct+Float+Jet group: 36/36 native and associated tests successful, including two new native Jet tests and five new pure Jet tests. An earlier run [42578130808](https://github.com/FlareZ123/experiment-01/actions/runs/42578130808) reached both physical escapes but had a fixture-only final conservation failure because the tally omitted the in-play Stadium; the revised tally includes Stadium/Supporter zones and passes.

## Frequency screen, not a success rate

The printed original 60 has 14 Basic Pokémon and three Jet Energy. Under uniformly randomized seven-card opening and one natural draw, conditioning on a legal opening containing at least one Basic, the exact probability of **any Jet in the first eight cards** is **34.1652586%**. The joint location probability of **at least one Jet and at least one of the four Tag Call / four Guzma & Hala** in those eight is **22.1020789%**. These are only card-location screens: the source still needs Bunnelby, Oddish, the Energy/Tool/Supporter resource line, a disposable payment hand, legal timing and an opponent that leaves Vileplume alive. Other card searches and later draws can change the actual opportunity; the numbers are neither conditional native escape success rates nor matchup win rates.

## Decision

**Retain both original Sentinel v1 and Float v2 as unqualified comparisons.** The existing v1 has a tested zero-new-slot escape when the spare Jet is already owner-held. A proactive Float may still be worthwhile where a spare Jet is unavailable or Special Energy plays are blocked; conversely, losing one of three Hood copies may expose other lock-counterplay. Crucially, a separate conditioned original rank-1 setup already demonstrated a paid **Guzma → Max Geist KO of Vileplume on the opponent's same turn**. This Jet line cannot rescue a Vileplume that has already been KO'd.

Next decision-changing test: compare unchanged v1, v2, and a strong original rank-1 opponent using original full-match natural source turns, native paid attacker response and both physical seats, with a single common autonomous policy. Report how frequently the Jet root is actually reachable **before the opponent's attack**, rather than presuming the conditioned Pass; measure entire-game results including caps and errors.

**Competitive certification: zero games.** Source inventories remain 29/32, missing original ranks 23, 25 and 28. No single optimized 60 or 99.5% result is established.
