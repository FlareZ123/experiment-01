# Rank31 Chimecho: Fog Crystal energy rescue for a natural Active opener

**Agent 5, 18 October 2026.** Exact finite-deck counting and an independent 250,000-deal categorical shuffle. **Resource availability only. Zero qualified competitive games, no attack frequency or win-rate inference.**

## Why this is distinct from the existing rank31 opening models

The [direct Bell opening census](chimecho-direct-t1-bell-opening.md) counts a singleton **Chimecho CIN 43** in the opening seven and an already drawn Psychic-producing Energy by the first normal draw. The [Latias plus Fog pivot census](chimecho-latias-fog-opening-routes.md) adds two disjoint paths **when Chimecho was not in that opening hand**, using a free-retreat Latias or a newly drawn Chimecho. A missing fourth path is:

**Chimecho starts Active, no Psychic-producing Energy appears in the initial seven plus first normal draw, but Fog Crystal is seen and can fetch a Basic Psychic Energy left in the deck.**

Rank31's [exact registered 60](full-decklists.json) contains one Chimecho, four Fog Crystal CRE 140, **two Basic Psychic Energy MEE 13**, three Telepathic Psychic Energy POR 88 and **15 total Basic Pokémon**. [Fog Crystal's printed Item text](https://asia.pokemon-card.com/hk-en/card-search/detail/1555/) searches a Psychic Energy card or Basic Psychic Pokémon. [Telepathic Psychic Energy's printed wording](https://asia.pokemon-card.com/sg/card-search/detail/25058/) provides Psychic **while attached**; it supplies an attack's Psychic cost once in hand and attached, but is not counted as a Psychic-Energy search target **while still in the deck**. This exact model therefore gives Fog **two Basic Psychic Energy targets**, excluding the three Special Energy cards. The deck list contains no other Basic Psychic Energy.

## Four disjoint first-turn resource events

Write `H` for the seven initial cards, `P` for the six face-down Prizes and `T` for the first normal turn draw, in that order. Here `E` means **any** of the five usable Energy after attachment and `F` means any of the four Fog Crystals.

- **D, existing direct:** Chimecho in `H` and at least one `E` in `H∪T`. The conditional hand-plus-first-draw energy probability uses seven non-Chimecho sampled positions.
- **B, new Fog bridge:** Chimecho in `H`; **zero** `E` in `H∪T`; at least one `F` in `H∪T`; **at least one** of the two Basic Psychic Energy cards is in the remaining deck, rather than all copies in `P`. Fog fetches one Basic Psychic Energy for the ordinary attachment to Active Chimecho.
- **F, existing Latias/Fog pivot:** Chimecho absent from `H` and `T` and outside Prizes, Latias in `H`, Fog and Energy in `H∪T`.
- **T, existing Latias/direct-draw pivot:** Chimecho exactly `T`, Latias in `H`, and Energy already in `H`.

The labels use F and T as defined by the earlier [Latias study](chimecho-latias-fog-opening-routes.md). The new B event is disjoint from D because it requires no drawn Energy, and from F/T because it requires Chimecho in the original hand. **It does not require Skyliner, switching, or a spare Bench slot.** It does require playing Fog Crystal and manual attachment unhindered by the opponent.

## Exact first-seven / six-Prize / first-draw calculation

Conditioning on singleton Chimecho in the opening seven has probability `7/60`. The other six opening cards plus first normal draw are a uniform seven-card sample from the remaining 59. Of those 59, five are usable Energy, four are Fog and fifty are neither.

```text
P(D) = (7/60) * [1 - C(54,7)/C(59,7)]
     = 0.05610162034383019

P(no E, at least one F | Chimecho in H)
     = [C(54,7) - C(50,7)] / C(59,7)

P(at least one Basic Psychic Energy survives in deck | no E in observed 7)
     = 1 - C(50,4)/C(52,6)
     = 1 - (6*5)/(52*51)

P(B) = (7/60) * [C(54,7)-C(50,7)]/C(59,7)
             * [1-C(50,4)/C(52,6)]
     = 51799174/1984053357
     = 0.02610775250435969
```

The six Prize positions form a uniform sample of the 52 unobserved cards even though Prize cards were set before `T`. Both Basic Psychic Energy cards remain unobserved conditional on the bridge event's no-E requirement. This is why the final survival factor is exact. The existing 15 Basic Pokémon imply `P(valid H)=1-C(45,7)/C(60,7)=0.8824992053482625`.

| Disjoint resource subtotal | Unconditional shuffled deal | Conditional on a legal initial seven |
| --- | ---: | ---: |
| D: printed Chimecho + directly drawn Energy | 5.610162% | 6.357130% |
| **B: new Fog search for Basic Psychic Energy** | **2.610775%** | **2.958388%** |
| **D∪B: Active Chimecho with drawn or Fog-searched Energy** | **8.220937%** | **9.315518%** |
| D∪F∪T: prior Latias-study union | 7.369629% | 8.350862% |
| **D∪B∪F∪T: revised restricted union** | **9.980404%** | **11.309250%** |

The revised four-event union is **12541047547/125656712610** of raw deals. Its legal-opener conditional fraction is **12541047547/110891949025**. The extra B route increases the earlier three-event opportunity union by **2.610775 percentage points unconditional**, or **2.958388 points conditional**. This is a larger *opportunity union*, and deliberately says nothing about probability of an actual successful Bell attack against the field.

## Independent reproduction

- Portable exact BigInt implementation: [`scripts/rank31-fog-energy-direct.cjs`](../../scripts/rank31-fog-energy-direct.cjs); regression: [`tests/rank31-fog-energy-direct.test.cjs`](../../tests/rank31-fog-energy-direct.test.cjs).
- Tested in an isolated local **Node v22.16.0** process: **2/2 tests passed**. As of this report, **no manually dispatched CI** has verified the new repository files. The existing workflow remains manual-only; do not introduce a per-commit job.
- Independently drew **250,000** uniform full-deck categorical permutations with Python 3 `random.Random(29831018)`, assigning Chimecho 1, Fog 4, Basic Psychic Energy 2, Telepathic Psychic Energy 3, other Basics 14, all other cards 36. Of those, **220,709** seven-card initial hands had a Basic; the simulation counted **14,054** D and **6,518** B (20,572 union). Observed unconditional union **8.2288%**, versus exact **8.22094%**, deviation **0.143** binomial standard errors. The simulation sampled Prizes at positions 7–12 and first draw at 13, and for bridge B explicitly checked at least one Basic Psychic Energy in positions 14–59.

## Limitations and action for opponent-policy testers

Even `D∪B∪F∪T` is an **incomplete set of card-access lines**. It omits Quick Ball, Pokémon Communication, Hisuian Heavy Ball prize recovery, draw effects, Telepathic Energy's own Bench recruitment, mulligan bonus draws and opponent interference. Against live Item locks, the B/F branches may be unplayable; against Ability locks, Latias's Skyliner F/T pivot may fail. No independence can be assumed between access, opponent locks and player choices.

A diagnostic that observes a rank31 player starting Chimecho with **Fog in hand and both Basic Psychic Energy still searchable** should treat choosing a different Fog target as a real policy opportunity-cost decision, preserving the actual original-root hand and K1 deck state. Test an autonomous Fog-for-Energy action plus printed Bell resolution and opponent reply in a source-dealt board before promoting it beyond a conditional resource count. Do not count shared-seed branches as independent games.

**Field status unchanged:** 29/32 exact opponent lists, missing 23/25/28; zero independently qualified competitive games and no verified 99.5% deck.

### Pinned-engine source cross-check, without claiming a Store test

Read-only inspection of [Twinleaf's exact pinned `FogCrystal` implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/fog-crystal.ts) at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` independently confirms that this version includes an Energy search target only if `c.energyType === EnergyType.BASIC && c.name === 'Psychic Energy'`. The alternate permitted target is a Basic Psychic-type Pokémon. Thus its implemented search pool has **two** Energy targets for registered rank31. This source inspection agrees with the counting model, but is **not** an actually dispatched Fog Crystal action or conclusive paper-ruling certification. Verify the engine's real owner-facing target list and the chosen root action before using the bridge as a tested in-game line.

## Conditional default-policy preference: the solo-starter search score

A closer read-only audit of **pinned upstream `a9905a76`**, not an actual Store-dispatch test, reveals a testable policy fork. The default [`ChooseCardsPromptResolver`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/choose-cards-prompt-resolver.ts) selects a Fog search target by descending `StateScore.getCardScore`. That score only computes the delta of [`HandScore`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/state-score/hand-score.ts) after hypothetically adding a card, with [default constants](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-bot-definitions.ts):

| Target, at a prompt with empty Bench, no held Basic and no held Energy | Hand-score gain |
| --- | ---: |
| Basic Psychic Pokémon | **21** (one card plus 20 for a Basic when Bench empty); **23** if no Pokémon in hand |
| Basic Psychic Energy | **6** (one card plus 5 for first Energy in hand) |

Thus **when that exact prompt state occurs**, the pinned default chooses a Basic Psychic Pokémon over the Energy needed to attach to an existing Active Chimecho and use Bell. This is a **policy contrast, not yet a demonstrated strategic error**: when Chimecho is the only Pokémon in play, recruiting a second Basic also protects against immediate no-Pokémon-in-play loss if Chimecho is Knocked Out; that survival axis may justify the generic preference in some matchups. This is a **deterministic relative scoring implication**, conditional on the generic resolver running and the alternative Pokémon being a valid deck target. Registered rank31 contains three Psychic Basic Duskull, three Psychic Basic Koffing and three Psychic Basic Unown in addition to Chimecho, all verified in the bundled source card database. If no other Basics appeared among the observed first eight, six Prize cards cannot hide all nine alternatives, so a searchable Psychic Basic is guaranteed. An alternative attack-first policy can deliberately choose Energy instead at this exact decision boundary. Comparing the two requires an opponent capable of exploiting a lone fragile Active and a real attack-and-reply trace.

The exact **strict solo-starter subset** of B requires Chimecho in initial seven, **no other Basic Pokémon or eligible Energy** in the remaining six initial cards and first draw, at least one Fog in those seven positions, and at least one Basic Psychic Energy remaining in deck:

```text
P(B and no other Basic seen by first draw)
 = (7/60) * [C(40,7)-C(36,7)]/C(59,7)
          * [1-C(50,4)/C(52,6)]
 = 812567/233418042
 = 0.003481166207366267
```

This is **0.348116621%** of uniformly shuffled games or **0.394466781%** of valid initial-seven openings; it is **13.333841%** of the narrower Fog-rescue event B. The exact count is exported as `soloStarterFogBridge` in the BigInt calculator and checked in its local regression. A separate **400,000-deal** categorical Python shuffle with seed `29831019` found **1,431** such deals (sample **0.357750%**, within **1.035** approximate binomial standard errors of the exact value).

**Essential causal limit:** having no other Basic in the first eight does **not** prove the Bench is still empty at the actual Fog prompt. An earlier Battle VIP Pass, Buddy-Buddy Poffin, Telepathic Energy effect, or other play may recruit a Basic, and the bot may never play Fog. Nor does selecting Energy necessarily mean an attack succeeds against a live lock. The percentage is a **pre-interaction source-hand predicate**, not a measured default-policy error rate. The decisive next test is a genuine source-60 owner-visible Fog prompt with live Bench/hand and target list, root action, manual Energy attachment, attack selection and opponent reply. A stage-specific deterministic source audit alone cannot replace that experiment. The new [opt-in rank31 Fog-for-Energy resolver](../../simulation/twinleaf/rank31-fog-energy-prompt-policy.cjs) and its [pure choice/hidden-information tests](../../tests/rank31-fog-energy-prompt-policy.test.cjs) make the competing source-card choice executable in one selected engine seat via `runMatch({rank31FogEnergySeat:0|1})`, without modifying the pinned vendor. The isolated Node v22.16.0 tests pass **3/3**; the adapter has not been compiled against the vendor or trialed in an actual Store match by this invocation. The alterative is neither proven stronger nor to be counted as a competitive outcome.

## Frozen next-stage source experiment, registered before outcome observation

The [two-original-deal repeat-1 registration](registrations/rank31-fog-energy-source-pair-v1-20261018.json) was committed with **candidate in physical seat A: seed 2481088205, rank31 in B**, and **candidate in physical seat B: seed 2932006358, rank31 in A**, derived by the shared `decorrelated-slots-v3` code. Source rank1 and rank31 registered deck-input SHA256 are respectively `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311` and `6a38420649c4ed689f3e5bf831d97f5990cecad18b294b353d3b62bae38ddd32`, as previously confirmed in authentic rank31 source diagnostics. SHA256 of the human-readable precommit JSON bytes: `e5171467474da8fe0984bb4bf11c2ed053c940b29eec9b01866c18133e4c613b`.

The reproducible [source-pair runner](../../simulation/twinleaf/rank31-fog-energy-source-pair.cjs) launches each original source deal twice with the same untouched 60-card deck inputs: generic pinned search choice and opt-in attack-first Fog Energy choice. It checks matched physical-deck hashes and actual first-turn ownership, preserves all cases including **nonexposures**, and records Fog plays, owner-deck prompt choices, Bell attacks and both 240-action-capped statuses. The seat opt-in is wired through `rank31FogEnergySeat` in [`headless.cjs`](../../simulation/twinleaf/headless.cjs), and the [manual-only lock-board workflow](../../.github/workflows/aichi-lock-board-tests.yml) includes both pure regression files and an optional `rank31_fog_energy_source_pair` diagnostic artifact. The paired arms are **two original deals, not four independent games**.

**Execution state on commit:** the local pure math and prompt selector tests passed (**2+3 tests**). The compiled pinned-engine source-pair workflow **has not run** under this invocation; no realized actual-start distribution, Fog target decision, Bell declaration or winner is reported. An attempted manual workflow dispatch earlier in this invocation was rejected by tool safety controls; don't infer a run was queued. This registration is prospective, separate from the preexisting rank31 repeat-0 fixture, and unqualified for win-rate inference.

## 18 October 2026: autonomous selector scope is narrower than resource access

The [exact Basic-occupancy audit](rank31-fog-breadth-policy-gap.md) finds that **86.666159%** of this report's defined direct Fog bridge deals contain another Basic Pokémon in the first seven cards plus first normal draw. The original strict owner-search selector refuses the Energy choice while any other Basic remains in hand or on the Bench; a separately opt-in broader variant permits it. This quantifies a conditional policy coverage gap under pre-action assumptions, **without proving additional Bell attacks or matchup wins**. Neither selector can make Fog appear in hand or force the generic bot to play it; actual Store attack and opponent-response tests remain required.
