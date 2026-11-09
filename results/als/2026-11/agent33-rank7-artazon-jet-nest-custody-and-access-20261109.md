# Original rank7 Artazon → Jet Wobbuffet → Nest Ball: real pinned Store and exact resource screen

**Agent 33 | 9 November 2026 | conditioned two-player native card-mechanics test, not a competitive-game result**

## Decision

Original Aichi rank7 Snorlax Stall possesses an executable, owner-visible Item-lock counterline against Sentinel Lopunny/Vileplume v1, provided the opponent has supplied Artazon, its Vileplume lacks effective Stealthy Hood, source Wobbuffet is searchable, Jet Energy is held and unattached this turn, and the source can still use an Item. The currently default-off common actor root selects the Jet rescue after authentic Artazon search. The genuine pinned native Store executed the whole source-owned chain in **both physical seats**, including the Nest Ball Item payoff, while keeping all **60 distinct original rank7 physical card identities** and all 60 Sentinel card identities in owner zones. **No natural game, tournament-quality bot response or win-rate result is implied.**

The practical caveat is large: the exact **rank7 Jet + Nest early-card location screen is only 1.8139980968652318%** conditional on a Basic-valid opening seven, if both singletons must appear in that opening or the following two ordinary draws and a Wobbuffet must still remain in deck. Adding an initial non-Wobbuffet Basic requirement leaves **1.5329554371925584%**. These are restrictive pure-location screens for the specific Nest followup, not opportunity rates with draw/search or all possible post-lock Item payoffs.

## What actually passed

Existing manually dispatched native workflow [42573068887](https://github.com/FlareZ123/experiment-01/actions/runs/42573068887) was **successful** at commit `ebc6956c2c15f2f962d14b4e6b24c1c24edda738` and includes this new test in the existing bounded-match job:

- Exact unchanged original rank7 printed-sixty objects and exact Sentinel v1 printed-sixty objects start in distinct physical owned zones, both source seat 0 and source seat 1.
- Candidate Sentinel's Artazon PAL is already in the Stadium zone; candidate's AOR Vileplume is already evolved on Bench. These conditions are intentionally **staged**, not natural-proof claims about the Sentinel opener. Source is initially Active Mimikyu PAL with Wobbuffet PHF in its genuine deck, and genuinely holds one original Jet Energy PAL and one Nest Ball SVI.
- A native `UseStadiumAction` owned by the rank7 player invokes real `ChooseCardsPrompt` over that player's own deck. The requested original Wobbuffet is accepted, selected and put onto the source Bench. Shuffle/Wait prompts are completed. Each physical 60 is conserved.
- `choosePublicJetBenchSwitch(actorObservation(...))` proposes `jet-promote-wobbuffet-suppress-unhooded-aor-item-lock` without requiring a payable attack; the actual canonical `chooseActorRootIntent(...,{jetBenchSwitchRoot:true})` selects the same special-Energy root. It reads own hand and public geometry; no opponent hidden identities are supplied.
- The source-owned `PlayCardAction` attaches its exact original Jet to Benched Wobbuffet. Native Jet switches that Wobbuffet to Active. Native `IS_ABILITY_BLOCKED` confirms Vileplume Irritating Pollen is suppressed. Physical-card and owner-printing checks pass after the switch.
- With Wobbuffet Active, a native source-owned Nest Ball Item plays successfully, resolves a real own-deck search for original Regirock XYP, puts Regirock onto the source Bench, discards Nest Ball and leaves no unresolved prompts. Both exact original sixties remain unchanged and the active turn remains with the original source player.
- With Stealthy Hood attached to the opponent's Vileplume, the root **correctly declines** this exact no-payable-attack Jet utility line in each physical seat. Separate already-existing Agent40 native Hood and Item-lock parity fixtures cover the actual lock and Item rejection after a Hood-protected Active Wobbuffet. This new experiment does not assert a forced bad Jet attachment in the Hood branch.

**Counts:** four original-source tests, all passed: two productive no-Hood paths, two Hood-veto paths. Two prior standalone staged Wobbuffet Jet tests also passed in the same workflow, for six successful tests in the relevant native step. The first intermediate run incorrectly counted a single Jet physical ID twice because pinned `PokemonCardList.cards` and `.energies.cards` are overlapping views on an attached Pokémon. The corrected test collapses only overlays within the same Pokémon slot and **still rejects a duplicated card ID across separate physical zones**. The native rerun passed. This was test-accounting duplication, not an observed native extra card.

The test resides in [`tests/2026-11/agent33-rank7-artazon-jet-native.test.cjs`](../../../tests/2026-11/agent33-rank7-artazon-jet-native.test.cjs) and runs through the existing registered [`tests/agent33-rank7-wobbuffet-jet-vileplume-native.test.cjs`](../../../tests/agent33-rank7-wobbuffet-jet-vileplume-native.test.cjs). The original 60 manifests are [source Aichi inventories](../../aichi-2026/full-decklists.json) and [Sentinel proposal](../../aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json). The current native pin is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Exact availability calculation

The original rank7 source list has **1 Jet, 1 Nest, 3 Wobbuffet, 9 other Basic Pokémon and 46 other cards**. Distribute the physical categories without replacement into seven opening-hand cards, six Prizes, two ordinary draws, and the remaining 45-card deck. Condition the initial seven on at least one Basic. Count placements where both Jet and Nest occur in the first nine visible cards and at least one Wobbuffet remains in the deck after those draws. The denominator is

```text
[C(60,7) - C(48,7)] × C(53,6) × C(47,2)
= 7,757,255,669,109,186,240
```

The exact favorable numerator is **140,716,470,206,610,936**, equivalent to **164359214493 / 9060605674120 = 1.8139980968652318%**. Requiring at least one of the other nine Basics in the initial seven yields **118,915,272,556,537,248**, equivalent to **3156705621 / 205922856230 = 1.5329554371925584%**.

The 7/6/2 allocation is enumerated using exact BigInt combinations in [`scripts/2026-11/agent33-rank7-jet-nest-opening-screen.cjs`](../../../scripts/2026-11/agent33-rank7-jet-nest-opening-screen.cjs). [Pure tests](../../../tests/2026-11/agent33-rank7-jet-nest-opening-screen.test.cjs) bind all counts to the real source inventory and check each exact integer. The existing manual Energy census [42573415759](https://github.com/FlareZ123/experiment-01/actions/runs/42573415759) passed, including the new pure test and previously broken legacy Jet-test string-escaping fix. This screen adds the **specific Nest requirement** to Agent40's broader Jet-plus-Wobb location screen ([prior analytical work](../agent40-rank7-reciprocal-artazon-jet-wobbuffet-exact-20261106.md)). The fraction is not an early-turn Item-unlock upper bound when other Items can follow Jet or search/draw can find missing singletons; it is a restricted no-extra-access witness.

## Selection impact and remaining work

The candidate's exposed Artazon can provide the opponent's Wobbuffet, and Jet can transform that connection into immediate Item access under an unprotected Vileplume. Sentinel v1 contains three Stealthy Hood, so the relevant strength question is its **actual paid, early placement on the Vileplume**, competing with the TM: Evolution Tool channel and other setup resources. This is an observed tactical weakness in a constructed state and an independently executable counter-response, not proof that Sentinel has a bad rank7 match.

To rank fixed sixties, the next useful extension is a **fresh native original rank7 source-deal exposure census**: observe genuine Artazon status, source owner's held Jet/Item and Bench/attachment state, Vileplume's effective Tool protection, and the complete opponent reply. A policy should consider other held Item payoffs and a potentially already-active Wobbuffet. Any future comparison must preserve actual physical deals, both seats, native failures/caps, fully paid actions, and source competence. Do not promote the staged test into a competitive result.

Current benchmark remains **29/32** original Aichi sixties, missing ranks **23/25/28**, **zero competitively qualified games**, no selected fixed 60 and no demonstrated 99.5% win rate.
