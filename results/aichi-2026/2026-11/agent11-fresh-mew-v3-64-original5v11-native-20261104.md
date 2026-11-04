# Fresh 16-seed original rank-5 Mew versus rank-11 Absol: 64 native arms, intermittent copy payoff and a natural full-Bench abort

**Agent 11 | 4 November 2026 | Preregistered developmental source-policy research | 0 competitively qualified paper games**

## Registered protocol and provenance

This independently generated cohort follows [the previous exact 32/32 paired historical-profile audit](agent11-mew-competence-cross-profile-native-20261104.md). We tested the **same one executing symmetric Mew policy** across **16 genuinely new random seeds × two rank-5 physical seats × owner-resource-tutor control/treatment = 64 preregistered arms**. The 16 seeds were generated through Python `secrets.randbelow(750000000)+1000000000` before their registration was committed. No source deal was selected based on observed success.

- [Registration frozen before dispatch](../registrations/agent11-owner-resource-tutor-bilateral-v3.json), commit `a9ad8e6d36fda4f4cb5e7e64d479958788baeefb`; SHA256 of runtime `JSON.stringify(registration)`: `9596462c6157a92ec1d97253166a86d25a5e0a1c1a5e05191391d8fe05ca7248`.
- Exact original paper-scope ranks 5 (Mew/Genesect) and 11 (Absol/Garbodor), unchanged printed 60s from `results/aichi-2026/full-decklists.json`; four Genesect V FST, four Mew V FST and four Double Colorless in original rank 5.
- Same pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` as the previous retrospective. Default-off shared actor components include natural Mew VMAX evolution, Special Energy and public context Energy, Genesect Fusion draw and donor-choice Techno Blast, known-dead attack guard in **both physical seats**. Tutor mode adds the existing K0 owner resource Item after-Pass adapter. Each arm capped at 90 native root actions; both source decklists unchanged.
- Existing **manual** [Actions run 41896989505](https://github.com/FlareZ123/experiment-01/actions/runs/41896989505), checkout `8d38c5d54d2833ac7582b83e30a7f9230fa0a3db`, actual Agent11 job successful. First uploaded immutable artifact **13356787268**, ZIP SHA256 `08a579f5099417a2961391b47fa213c4649da1cd492ae6bd66c2f9c6d4596b5f`, ZIP contains `agent11-owner-tutor-native-v3.json` SHA256 `67b946e466ce8457054f5eef10f178704bcd88e6e8ed96b9c949ca6b4debdc10` and one separate public native rule probe. This report concerns the named v3 JSON.
- Independent strict source/registration/status/physical-deal/attack/Prize verifier: [`scripts/agent11-fresh-mew-v3-archive-audit.cjs`](../../../scripts/agent11-fresh-mew-v3-archive-audit.cjs). Use it against the extracted raw JSON, preserving both error and cap records. **No policy is promoted as a selected competitive release.**

## Full 64-arm disposition

| Preregistered mode | Native rank-5 wins | Native rank-11 wins | Action-capped | Native error | Rank-5 Cross Fusion declarations | Native source-rank-5 Prize cards taken |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Control (32 arms) | 2 | 5 | 25 | 0 | 17 | 15 |
| Resource tutor (32 arms) | 2 | 4 | 25 | 1 | 18 | 15 |
| **All 64 registered** | **4** | **9** | **50** | **1** | **35** | **30** |

Those four native rank-5 wins were **the same fresh seed value, 1511799401**, observed in both source physical orientations and both tutor arms. They must not be counted as four independent confirmations. Each did exhibit a complete native Prize path from 6 to 0 via copied Techno Blast damage and Knock Outs. However, in those four winning arms, the rank-11 opponent generated no damaging attacks or Prize gain, repeatedly selecting ineffective `Terminal Period` or setup `Motivate`. This remains a weak opponent-competence witness and provides no field-strength estimate.

Native tutor mode selected and Store-accepted **26 resource Items**, with **52 native physical cards moved** to owners. It yielded no additional rank-5 native winners; one prior control rank-11 terminal became a cap (seed `1236471893`, rank5Seat0) and one control cap became a native error (seed `1591350664`, rank5Seat0). Counts or Store acceptance alone do not establish tactical benefit, paper-valid payment, causal field advantage, or stronger opponent policy.

**Exact initial-deal pairing:** 31 of 32 control/tutor pairs have identical full physical fingerprint and actual first-turn evidence in their *primary* rows. The one native-error row retains a separately stamped true Store abort `fullPhysicalDealFingerprint.digestSha256` `df220377c86f502172417f908b91a7e1f6c59963980121a88ea77c10234b9ec1`, identical to its control row, and an identical first-turn slot 0. Thus **32/32 full original physical pairings are demonstrably equal** after transparent reconstruction from the separate native abort, while the one primary receipt remains missing. Do not silently rewrite the archived primary row.

## Mew attack payoff census, with copied-effect accounting

Across 64 attempts, source rank 5 declared **35** Cross Fusion Strike attacks; **32** reached native settlement and **three** were unresolved before the 90-action cap. Public pre-attack owner Bench classification:

| Benched Fusion Strike donor in public owner board | Declarations | Settled | Observed payoff |
| --- | ---: | ---: | --- |
| Genesect V | 21 | 20 | Copied 210 damage events and Knock Outs, totaling 30 source Prize cards across both A/B modes |
| Mew V, without Genesect V | 2 | 2 | No direct damage/Prize; **both put Double Colorless Energy from deck onto Benched Mew V**, a real non-damage resource payoff |
| No eligible Benched Fusion Strike Pokémon | 12 | 10 | Ten settled with unchanged board and Prize snapshots, two unresolved at cap |
| **Total** | **35** | **32** | Different tactical capabilities despite the same outer attack name |

An attack-count metric erroneously equates all 35 declarations. In the ten settled no-donor attacks, even the board's attached Energy and Pokémon positions stayed unchanged. In the two Mew-donor attacks, the copied `Energy Mix` materially changed Energy custody, despite zero damage. This demonstrates why a settlement classifier must compare *all affected public resources*, rather than credit only Prize counts or incorrectly call every zero-damage attack useless.

In the rank-5 source winner seed, repeated copied Genesect Techno Blast attacks that had an eligible donor were separated by at least four global turn indices (14 within-arm repeat intervals in the whole cohort), consistent with the printed Techno Blast next-own-turn inability to attack. That observation does not certify all native copy-effect semantics, but it avoids a false claim that repeated attack declarations on consecutive source turns are necessarily legal.

## Naturally occurring Twinleaf paper-fidelity failure

The sole error arm was `seed1591350664-rank5seat0-resource-tutor`. Pinned Twinleaf threw **`NO_BENCH_SLOTS_AVAILABLE`** during a source-rank-11 Active `Trubbish FST` `Call for Family` `AttackAction` at root ordinal **54**, global turn 10, acting physical seat 1. Its independently preserved pre-dispatch public snapshot shows **five occupied Bench positions** and an Active Trubbish with one Darkness Energy. The original Trubbish FST 168 card text instructs a Basic Pokémon deck search onto the Bench.

The supplied *Advanced Player's Rulebook*, **C-11 (Put Basic Pokémon onto your Bench)**, explicitly explains that if an attack with such an effect is used while the Bench is full, that attack **ends without searching the deck or adding a Pokémon**. Throwing a Store dispatch error violates this rule. This is a specific natural source-deal paper-fidelity counterexample, with a complete pre-error public state. A research-owned hook or compatible upstream fix requires a targeted two-seat positive/negative test before release; the frozen vendor submodule must remain unchanged. The natural error invalidates this arm as a native completed game; its original attempted row remains in the denominator.

## Research consequence and limits

Source-rank-5 policy can produce genuinely settled 210-damage copied attacks and full six-Prize paths, but copied attacks remain intermittent, with numerous missing-donor or non-damaging branches. Native rank-11 choices likewise remain tactically weak in important states. One paired Item intervention changes a native terminal to a cap, and another reaches a demonstrable engine paper-rule error. The next selected common policy must value fully paid **resource → Benched attack source → copied attack → opponent reply** chains, validate empty-donor and copy-effect cases, and handle full-Bench attack behavior according to the paper rulebook.

All 64 native attempts are developmental, 50 are action-censored, and one is an engine failure. The source field still has 29 of 32 authenticated full inventories (ranks 23/25/28 missing) and no qualified tournament-style opponent pool. **Zero competently qualified paper Expanded games, zero selected final 60, no demonstrated 99.5% rate.** No native terminal in this file may be retroactively promoted to a tournament win.
