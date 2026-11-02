# Original rank-5 native Quick Ball OFF/ON: same-revision, same-physical-deal regression

**Agent 9 | 2 November 2026 | preregistered 16 native attempts | zero competitively qualified games**

## Primary native evidence

[Completed GitHub Actions run 41419769572](https://github.com/FlareZ123/experiment-01/actions/runs/41419769572), commit `63699dba8ac63cc39a171d8d51c53add1b1846c4`; artifact **13130330602**, name `agent9-rank5-quickball-same-revision-pair-16arm`, ZIP SHA256 `892f0a18139604d75f3f48f6402cc20747fff0fca87b34fd062f239e68a46467`, contains complete **35,268,396-byte JSON** with all 16 original native attempts, every root action, attached actual original source and candidate policies and paired comparisons.

[Pre-outcome registration](registrations/agent9-rank5-quickball-same-revision-pair-20261102.json), [runner](../../simulation/evaluation/agent9-rank5-quickball-same-revision-pair.cjs) and [manual workflow](../../.github/workflows/agent9-rank5-quickball-same-revision-pair.yml) use the exact unchanged original-rank-5 Mew/Genesect printed sixty (`a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`), the two existing candidate sixties, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, two source-policy modes, four registered trials per mode. Every Quick Ball OFF/ON arm is in the **same head commit**, same process, same exact full physical initial deal fingerprint and same source deal fingerprint, **8/8 matches**.

| Control vs intervention | OFF | ON |
| --- | ---: | ---: |
| Original source accepted Quick Ball `PlayCardAction` | **0** | **14** |
| Source native `AttackAction` | **12** | **0** |
| Source genuine engine terminals, excluding censored | **6** | **8** |
| Native censored/nonterminal | **2** | **0** |
| Original source engine wins as recorded by `winner` seat | **6 of 8 attempts with one unqualified original engine win per candidate branch in seat B and seat A reference** | **4 of 8** |
| Competitively qualified game wins | **0** | **0** |

**The winner row is intentionally an illustrative unqualified engine counter and should not be used as a win-rate estimate.** Actual per-trial `winner` field is a seat number (0 or1), and the table's verbal summary is incomplete without source-seat matching. See the per-pair table below instead of the winner prose.

| Policy mode and trial | Source seat | OFF source attacks | ON source attacks | ON source Quick Ball | OFF native status | ON native status |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| integratedV3Control, A reference | 1 | 4 | 0 | 1 | engine terminal | engine terminal |
| integratedV3Control, A New Moon | 1 | 2 | 0 | 3 | censored | engine terminal |
| integratedV3Control, B reference | 0 | 0 | 0 | 1 | engine terminal | engine terminal |
| integratedV3Control, B New Moon | 0 | 0 | 0 | 2 | engine terminal | engine terminal |
| integratedV3FusionMobility, A reference | 1 | 4 | 0 | 1 | engine terminal | engine terminal |
| integratedV3FusionMobility, A New Moon | 1 | 2 | 0 | 3 | censored | engine terminal |
| integratedV3FusionMobility, B reference | 0 | 0 | 0 | 1 | engine terminal | engine terminal |
| integratedV3FusionMobility, B New Moon | 0 | 0 | 0 | 2 | engine terminal | engine terminal |

## Critical action-level attribution

The first divergence in each of the eight paired native root ledgers was **the Quick Ball intervention replacing an original `PassTurnAction`**. For A reference in each policy mode, this was at native ordinal **17** by physical **candidate seat 0**, where a candidate-held Quick Ball played *before the original source had its first own ordinary turn*. Source's later accepted Quick Ball occurred at ordinal 41. Thus the treatment has **both-actor** intervention effects and **cannot attribute the entire source attack collapse specifically to its own Quick Ball**.

Other first divergence ordinals: A New Moon **40**, original source physical seat1; B reference **39**, original source physical seat0; B New Moon **40**, original source physical seat0. The same root divergence pattern repeats across the second registered source-policy mode.

One A reference game has two genuine original-source Mew VMAX evolution `PlayCardAction` in the OFF policy (native ordinals79,178), versus **zero** in ON, and four source native attacks vs zero. The A New Moon trial retains one Mew VMAX evolution on ON but still drops from two source attacks to zero. The exact evolution and attack shifts are measured native actions, with causality through search targets and subsequent opponent lines unresolved.

The replay is a **strong negative regression for blindly adding conservative Quick Ball across both actors**, on this tiny fixed deal cohort. A source-only or timing- and target-aware intervention must be isolated separately. The previous [historical different-build pilot](agent9-rank5-quickball-native-activation-and-regression-20261102.md) was insufficient for causal comparison. This paired study removes the *code revision* and *physical deal* confound, while preserving the bilateral-effect ambiguity and every censored/engine-terminal outcome. No 99.5% field game win inference follows.

## Next development

Freeze the exact four source-dealt trials and compare three separately toggled policies under one head: baseline; original-source-only Quick Ball; candidate-only Quick Ball. Capture target choice, discard affordability, actual hand-size compression, real evolution/attack follow-up and opponent continuation. Preserve per-Pokémon history rather than granting value for Item acceptance alone. Prioritize original rank5's other printed 42 Trainer cards, which remain largely unexercised.

**Field: 29/32 authenticated opponent originals; ranks 23,25,28 unavailable; zero competitively qualified games.**
