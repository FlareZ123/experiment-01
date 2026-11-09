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


## 9 November 2026 06:50 UTC extension: two additional native Item payoffs and six-Item location ceiling

The source-owned Jet utility's prior held-Nest-only trigger excluded other ordinary Item payoffs. The existing **default-off** `simulation/twinleaf/agent40-public-jet-bench-frontier.cjs` now additionally proposes a Wobbuffet Jet rescue in two narrow owner-visible cases:

1. **Held VS Seeker PHF and publicly discarded original Faba LOT**, with the owner's Supporter still usable that turn. When unhooded AOR Vileplume would otherwise Item-lock, the root plans a physical original VS Seeker retrieval. It declines when Hood protects Vileplume or when Faba is absent from the public discard. The conditional requirement for Faba is essential. This policy does not assume any arbitrary discarded Supporter is automatically useful.
2. **Held Robo Substitute PHF with an available Bench slot.** Robo is an Item that can be played as a 30-HP Basic-like Bench Pokémon and provides a tangible prize-less stall body. The root declines when Hood protects Vileplume. This case needs no discharged Faba or future Supporter, so it is strategically different from VS Seeker.

The same [original source SFT](../../../tests/2026-11/agent33-rank7-artazon-jet-native.test.cjs) now physically swaps the *unchanged* rank7 source hand/deck/discard zones to construct the extra VS/Faba or Robo cases. It performs native source-owned Artazon search, canonical Jet choice, the real attachment/switch, native Vileplume suppression, and then the additional actual Item root and its Store outcome:

- **VS Seeker:** real native discard-search `ChooseCardsPrompt` selects the original Faba and moves it to source hand. The Item itself enters source discard. A read-only opponent-side display prompt is settled as an informational prompt; no strategic opponent decision is forged.
- **Robo Substitute:** native source-owned `PlayCardAction` plays the physical original Robo onto an open Bench slot. The source's exactly 60 distinct card identities are accounted for before and after the play.
- Both seat0 and seat1 unhooded positive cases, both Hood-veto cases, and the additional VS-without-discarded-Faba veto cases passed; earlier Nest Ball cases still pass. **[Native run 42575215081](https://github.com/FlareZ123/experiment-01/actions/runs/42575215081) succeeded** at commit `3d2bd6ba7bd956ef9cf9b7f974bb55bf31a1c4dc`. The 16 tests in the relevant step comprise two earlier standalone Wobb/Jet, four Nest, six VS/Faba, and four Robo cases. All are staged, with **zero competitively qualified games**.

The arithmetic [script](../../../scripts/2026-11/agent33-rank7-jet-nest-opening-screen.cjs) now also enumerates the union of eligible held Item *identities*. Each count conditions on a Basic-valid original seven, Jet in the first 9 natural visible cards, at least one nominated Item among those nine, and at least one Wobbuffet remaining in the source deck after six Prizes and two draws:

| Item identities counted | Copies | Exact favorable allocations | Location screen | With a non-Wobbuffet Basic in initial seven |
| --- | ---: | ---: | ---: | ---: |
| Nest Ball | 1 | 140,716,470,206,610,936 | 1.8139980968652318% | 1.5329554371925584% |
| Nest Ball or VS Seeker | 4 | 474,015,258,692,331,444 | 6.110605076224922% | 5.17784510288844% |
| Nest Ball, VS Seeker or Robo Substitute | 6 | 635,830,741,862,240,364 | 8.196593859787745% | 6.957075104481652% |

The common conditional denominator is `7,757,255,669,109,186,240`; the strict non-Wobb starter six-Item numerator is `539,678,102,946,586,848`. The source-tied pure tests and full [Energy census 42575370867](https://github.com/FlareZ123/experiment-01/actions/runs/42575370867) passed. Original list count checks cover the actual 1 Nest, 3 VS Seeker and 2 Robo copies. Item access is a **location ceiling**, especially because VS Seeker still needs a valid public discard Supporter and Robo still needs a free Bench. None of these percentages is a probability that Sentinel's lock gets broken or a competitive game is won.

**Selection implication:** when its lock Pokémon is not effectively Hood-protected and Artazon remains available to the other player, Sentinel must contend with at least three native-confirmed original rank7 Item payoff families after Jet Wobbuffet. Model actual Hood placement, Stadium preservation, natural source hands and the competing Tool channels before assigning matchup value. This strengthens the case for counterplay-aware comparison, while providing no evidence of 99.5% success.
