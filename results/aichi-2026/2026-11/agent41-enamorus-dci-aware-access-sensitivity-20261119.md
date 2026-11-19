# DCI-aware Enamorus access sensitivity

**Status:** analytical resource-access sensitivity only. This does not nominate a deck, change the fixed Hood Shield 60, qualify a paper matchup, or measure game win rate.

## Result

Mysterious Treasure and Quick Ball add a real Enamorus search route, but only when their discard cost is paid with a card that can plausibly be spared. In the 20-million-valid-opening simulation, a strict duplicate-only discard policy raises Enamorus + Stealthy Hood access by **1.8970 percentage points going first** and **2.5337 points going second** over the existing Fog Crystal / Heavy Ball / Arven / Forest Seal Stone baseline. When intersected with the existing *natural-only* Shadow Rider V by turn one + VMAX by turn two core event, the joint increase is only **0.4320 / 0.7045 points**.

A recovery-backed Psychic Energy discard adds another modest increment, but spends the single Night Stretcher. Treating any hand card as free discard overstates the anchor uplift by roughly three times. Do not use the free-discard ceiling as a strength estimate.

## Fixed hypothetical 60

The model uses the existing Hood Shield Shadow Rider v1 inventory plus Enamorus V ×1, cutting Pokémon Ranger ×1 as the placeholder non-Item Trainer cut. This is a bookkeeping variant only:

- 19 Pokémon, 30 Trainers, 11 Basic Psychic Energy.
- 15 Basic Pokémon, including Enamorus V.
- 17 Item cards, including four Mysterious Treasure, four Fog Crystal, one Quick Ball, one Hisuian Heavy Ball, one Forest Seal Stone, and one Night Stretcher.
- Two Stealthy Hood, one Arven, four Shadow Rider Calyrex V, and four Shadow Rider Calyrex VMAX.

The cut is not a recommendation; no candidate list was changed. The 60-card inventory is derived from the current [candidate inventory](../candidate-hood-shadow-rider.json).

Relevant card-pool text was checked locally: Enamorus V (SWSH11 82/178) is a Basic Psychic Pokémon; Mysterious Treasure (FLI 113) discards a card to find a Psychic or Dragon Pokémon; Quick Ball (SSH 179) requires discarding another card to find a Basic Pokémon; Fog Crystal (CRE 140) finds a Basic Psychic Pokémon or Psychic Energy; Arven (SVI 166) finds an Item and a Pokémon Tool; Forest Seal Stone (SIT 156) gives its attached Pokémon V the once-per-game Star Alchemy search; Night Stretcher (TWM 61) returns a Pokémon or Basic Energy from the discard pile to hand. See the corresponding entries in resources/cards/en/sm6.json, swsh1.json, swsh6.json, swsh12.json, sv1.json, sv6pt5.json and swsh11.json.

## Method

- 20,000,000 uniformly shuffled 60-card deals, conditioned on a legal opening seven containing at least one Basic. With 15 Basics, the exact legal-opening probability is 88.2499205%. Invalid sevens were rejected and resampled; no mulligan bonus draw was modeled.
- Six Prizes were sampled from the remaining 53. Going first receives no own-turn-one draw and one own-turn-two draw; going second receives one draw on each of the first two turns.
- The anchor event is Enamorus V and at least one Stealthy Hood accessible by the end of the player's second turn. The existing direct Fog Crystal / Heavy Ball and Arven / Forest Seal Stone routes are preserved. Mysterious Treasure and Quick Ball are added only when Enamorus is in the deck and a modeled discard payment exists.
- The core event is deliberately unchanged and natural-only: Shadow Rider Calyrex V in hand by turn one and Shadow Rider Calyrex VMAX in hand by turn two. Mysterious Treasure / Quick Ball are not credited with finding the core pieces. “Joint” means anchor access and this natural-only core event both occur; it is not a game-state or win event.
- Forest Seal Stone preserves the prior model's carrier restriction: a Shadow Rider V must be available by turn two, its Pokémon Tool slot is assumed open, and its VSTAR Power is assumed unused. Enamorus V is not additionally credited as the FSS carrier.

Discard policies:

0. **Strict duplicate-only:** one extra copy in hand of Stealthy Hood, Shadow Rider V, Shadow Rider VMAX, Mysterious Treasure, Fog Crystal, VS Seeker, or Lillie's Determination may be discarded while retaining one copy. Psychic Energy and the duplicated Clefairy ex are protected.
1. **Broad duplicate-only:** any duplicate non-Energy card may be discarded. This adds the second Clefairy ex as a possible cost.
2. **Energy recovery:** policy 1 plus one Basic Psychic Energy may be discarded if Night Stretcher is in hand and is spent to recover that Energy. This assumes the recovery use is worth consuming Night Stretcher.
3. **Unrestricted ceiling:** any other card in hand is treated as disposable. This is intentionally unrealistic and is shown only as an upper ceiling.

For a direct MT/QB route, the searcher and a discardable card must both be in hand by turn two, and Enamorus must remain in the deck. For an Arven-fetched MT/QB route, the Item must remain in the deck and the same discard payment must be available. A Prized Enamorus is not found by MT/QB; the existing Heavy Ball route is required.

The executable source and complete raw output are stored beside this report:
- [C++ simulation](agent41-enamorus-dci-aware-access-sensitivity-20261119.cpp)
- [Raw output, seed 2026111905](agent41-enamorus-dci-aware-access-sensitivity-20261119.txt)

## Results

All figures are percentages. “Δ anchor” and “Δ joint” are percentage-point increases over the no-DCI baseline. F = going first; S = going second.

| Discard policy | Anchor F / S | Δ anchor F / S | Joint F / S | Δ joint F / S |
|---|---:|---:|---:|---:|
| No DCI baseline | 24.8993 / 29.3575 | — | 4.0975 / 6.0471 | — |
| Strict duplicate-only | 26.7963 / 31.8912 | +1.8970 / +2.5337 | 4.5295 / 6.7516 | +0.4320 / +0.7045 |
| Broad duplicate-only | 26.8622 / 31.9809 | +1.9630 / +2.6233 | 4.5351 / 6.7627 | +0.4376 / +0.7156 |
| Energy recovery via Night Stretcher | 27.2159 / 32.4284 | +2.3166 / +3.0709 | 4.5793 / 6.8365 | +0.4818 / +0.7894 |
| Unrestricted discard ceiling | 30.6071 / 35.5740 | +5.7078 / +6.2165 | 5.1756 / 7.5077 | +1.0781 / +1.4607 |

For the strict duplicate-only policy, the 95% Monte Carlo intervals for the incremental anchor rate are [1.8911, 1.9030] going first and [2.5268, 2.5406] going second; incremental joint intervals are [0.4291, 0.4348] and [0.7008, 0.7081]. For the Energy-recovery policy, the corresponding intervals are [2.3100, 2.3232] and [3.0633, 3.0784] for anchor, and [0.4788, 0.4848] and [0.7856, 0.7933] for joint.

Under strict duplicate-only, a Mysterious Treasure or Quick Ball is already in hand, Enamorus remains in the deck, and a qualifying discard is available in **13.9532%** of going-first deals and **18.0525%** of going-second deals. This is the direct-in-hand event only; the anchor result also includes Arven fetching an MT/QB from the deck.

The broad duplicate policy changes the strict result by only 0.0659 / 0.0896 points of anchor access. The larger additional gain comes from allowing a Basic Psychic Energy discard when Night Stretcher is available: relative to strict duplicate-only, anchor rises by 0.4196 / 0.5372 points and joint access by 0.0498 / 0.0849 points. That line is not free: it consumes Night Stretcher and may sacrifice a later Pokémon-recovery use.

The unrestricted ceiling is not a plausible estimate. It assumes that any other card in the hand can be discarded without harming the game plan; its much larger uplift shows why a no-cost MT/QB model is misleading.

## Baseline reproduction check

Agent43's existing exact access model reports, without Star Alchemy, 22.4001% / 26.1390% anchor access and, with Forest Seal Stone, 24.8928% / 29.3519%. This simulation reproduces those baselines within its 95% Monte Carlo intervals:

- No FSS: 22.4077% / 26.1480%.
- With FSS: 24.8993% / 29.3575%.

This is a check of the sampling and baseline route port, not independent evidence that the hypothetical card interactions win games.

## Interpretation and limits

The DCI-aware MT/QB route is worth retaining in future access models; it is not a reason to add Enamorus to the fixed 60. Under the narrowest explicit discard proxy, it increases anchor access by about two to two-and-a-half points, but improves the joint anchor + natural core event by less than one point. The larger “free discard” number should be rejected.

This is still a hand/deck/prize reachability model, not a turn-by-turn policy or gameplay simulation. It assumes all seen cards remain available in hand through turn two; it does not model Supporter competition, exact sequencing, Bench capacity, opponent Item/Tool lock, hand disruption, attack/retreat costs, or the future value of a duplicate card. It assumes a free Tool slot and unused VSTAR Power for FSS. It does not model Tapu Lele-GX finding Arven, nor does it credit MT/QB with finding Shadow Rider V or VMAX. The strict duplicate policy is a transparent proxy, not proof that discarding each allowed duplicate is strategically correct; the Energy-recovery policy is more permissive because it spends Night Stretcher.

Next useful extension: an explicit turn-level resource solver that includes Tapu Lele-GX → Arven, multiple Item searches, and the opportunity cost of each discard, then compare its feasible lines with the first accepted native trace. Do not change the candidate or V3 policy on this result alone.
