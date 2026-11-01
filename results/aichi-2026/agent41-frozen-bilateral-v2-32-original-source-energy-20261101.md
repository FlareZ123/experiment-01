# Agent 41: identical-deal 32-arm symmetric Special Energy policy repair

**1 Nov 2026 | completed paired native development treatment, zero competitively qualified games.** [Successful compiled manual native CI 41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584), head `86e0410847a953a73fdef7f76865493e75ac1c7f`; complete treatment raw JSON and compact failure-inclusive matrix in [artifact 13072623187](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584/artifacts/13072623187), ZIP SHA-256 `cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b`. Compare to independently archived [32-arm v1 baseline](agent41-frozen-bilateral-v1-32-original-source-native-20261101.md), CI `41278620085`, artifact `13072746019`. Native vendor pin remains `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## One controlled policy change

The [immutable v2 source-controlled profile](../../simulation/evaluation/agent41-frozen-bilateral-development-v2.json) differs from the [archived baseline v1 profile](../../simulation/evaluation/agent41-frozen-bilateral-development-v1.json) in **exactly one actor policy switch**:

```text
bilateralPublicContextSpecialEnergy: false/omitted (v1)
bilateralPublicContextSpecialEnergy: true          (v2)
```

This invokes the existing [Agent17 public-context owner Energy selector](../../simulation/twinleaf/agent17-public-context-special-energy.cjs) on **both players**, including flexible Special Energy contribution and publicly modified attack payability. It is one switch with multiple related decision effects. It does not add cards or alter a deck. Every other v1 policy setting, original 60, candidate 60, rank, physical seat, original source seed, 260-action cap and native engine pin were reused. The v2 policy was chosen **after observing the v1 development deficiency**; this is a deliberately matched exploratory intervention, not preregistered new independent performance sampling.

**All 32/32 matched v1-v2 arms have byte-identical opaque initial complete physical-deal SHA-256 fingerprints, unchanged candidate/source printed-60 hashes, identical first accepted setup coin, GO_FIRST choice, verified first draw and source-only initial deal fingerprints.** Both runs preserve all 32 attempted rows with no omitted native error/censor. The actual source first-player balance remains eight source-first and eight candidate-first attempts per opponent rank.

## Native causal-comparison results

| Exact original opposing source | Fixed candidate | v1 → v2 source attack declarations | v1 → v2 source-owned Energy PlayCardAction roots | v1 → v2 engine terminal games |
| --- | --- | ---: | ---: | ---: |
| Rank 6 Iron Thorns ex | Champion reference | **0 → 19** | **0 → 21** | 2 → 3 |
| Rank 6 Iron Thorns ex | New Moon v1 | **1 → 31** | **1 → 38** | 1 → 5 |
| Rank 11 Absol/Garbodor | Champion reference | 71 → 71 | 28 → 28 | 5 → 5 |
| Rank 11 Absol/Garbodor | New Moon v1 | 102 → 85 | 30 → 28 | 5 → 6 |
| **Total, 32 arms** | Both unchanged fixed 60s | **174 → 206** | **59 → 115** | **13 → 19** |

**Rank-6 source alone:** **1 → 50 native attacks** and **1 → 59 original-source Special Energy play roots** across the same 16 actual physical deals. The 59 treatment roots comprise **24 Speed Lightning, 16 Capture, 10 Double Colorless and 9 Spiky Energy**, all names in the original printed Iron Thorns 60. Rank-6 source attacks increased in **13/16 individual matched arms**, stayed unchanged in three and decreased in none. Source Energy attachments increased in **15/16**, stayed unchanged in one. All **50** rank-6 treatment source attack declarations have a same-epoch settled public attack record; **42** have a verified later opposing root in that same native game epoch. This is a material policy coverage change under authentic original 60s.

**Rank-11 context:** Both ranks received the same common selector, with a change in the rank-11 source attack count from **173 → 156** and Darkness Energy roots **58 → 56**. Fourteen of the 16 rank-11 source attack counts were identical; two decreased in length as the resulting trajectories changed. The paired source-energy intervention is not a uniform payoff function and may change later state and time in game. Rank11 uses ordinary Darkness Energy in these observed root ledgers, so there is little direct reason for a Special Energy proposal increase.

**Engine outcomes:** v1 had **13 engine-terminal / 19 capped**, v2 had **19 engine-terminal / 13 capped**, with all caps at 260 original native actions. These engine endpoints provide a policy-development observation only. This result does **not** establish a tournament win-rate, causal improvement for either candidate fixed 60, or how a skilled Iron Thorns player would respond.

## Game integrity and code provenance

The v2 native Store reported **32/32 `SETTLED_PHYSICAL_INTEGRITY_PASSED`** under the required physical-60 guard, with **2,004 fully settled root audits among 6,314 checked roots**. The original first setup `CoinFlipPrompt`, winning player's `GO_FIRST` action and verified draw-log first seat agreed with registered starting-order strata for all **32/32**. The common actor was enabled with `publicContextSpecialEnergyOptIn:true` in all **32** live game audits. Paper Supporter quota gate remained active, and the first frozen policy's native prompt fallback / retained root joins remained on. Same-root chooser observed **22 changed owner-root intents** in v2 compared with 23 in v1; these are correlated decision counts, not evidence of game value.

The pregame static research source closure SHA256 was `b2d332085097953b119b8a2ff1ea6f5b98e61c8384ee72550873d8e8bcef8bb6`, over **265 statically traced files / 105 named environment inputs**. The v2 postgame runtime attestation observed **163 actually loaded research-owned modules**, **154** with matching statically pinned source fingerprints and **9** runtime-only modules; the latter were the profile/wrapper/registration/preflight/reporting dependencies, retained with full hashes inside raw JSON. **0 modules changed on disk after preflight**. This does not certify all potential dynamic-import branches: **111 lexical dynamic-require sites** remain unresolved in the static audit. The completed [v2 metadata-specific pure tests and inspection CI 41279149002](https://github.com/FlareZ123/experiment-01/actions/runs/41279149002) passed all **102** pure tests before native execution.

## Interpretation and next gate

The earlier v1 native rank-6 source almost never attached Energy: **one source Energy action in 16 games**. The v2 treatment shows that a single already-implemented owner-visible Special Energy decision path can correct that specific coverage failure and induce genuine settled opposing attacks. The initial deals, coin outcomes and original sixty-card inventories did not change between the two versions. This validates an engineering improvement in the shared simulation policy, not a new deck-strength estimate.

A further controlled development step should compare actual Basic/Special Energy contenders and their opportunity costs, native kept-hand alternatives, ability lock and card-specific prompt legality, while preserving source pressure on all actors. Before any performance inference: certify native prompt target/cap/multiple validity (the pinned Store can bypass `PutDamagePrompt.validate`; see [Agent46 notice](../../communications/agent41/20261101T0546Z_agent46_native_prompt_validate_bypass.md)), complete two-player observation security, correct board/attack/Prize semantics, official Aichi 25-minute game time, robust competitive opponent play, and authenticated original opponent lists for ranks23/25/28. The full Top32 benchmark remains untested.

**Competitive-qualified games: 0. Verified single fixed-deck 99.5% Aichi Top32 win rate: none.**
