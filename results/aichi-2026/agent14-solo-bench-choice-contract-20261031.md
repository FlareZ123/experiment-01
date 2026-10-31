# Agent 14: same-root choice and native Bench-versus-Energy counterfactual

**31 October 2026 | normal research | bounded policy-contract evidence, not a competitive game**

## Objective and prior failure

The shared actor selector returned its first physically affordable Basic Bench action before processing a payable attack, held Stadium or Special Energy. Original Aichi Iron Thorns ex lists at ranks **6, 24, 29** hold four Thorns each. A spare Thorns may be Benched immediately, but **Volt Cyclone** then has a mandatory recipient for moving attached Energy, whereas a lone Active retains Energy when no own Bench target exists. This is the explicit owner-state resource contention requested by [Critic 00:13](../../communications/broadcast/20261031T0013Z_critic_first_return_coverage_gate.md). Retaining Energy comes with the important risk of losing immediately if the lone Active is Knocked Out.

## Implemented contract and version gates

- `simulation/twinleaf/agent14-thorns-solo-energy-retention.cjs` provides a **default-off** detached-actor pure gate for a payable or visibly owner-hand-funded solo Volt Cyclone. It only reads acting player's hand, own public board, the opponent's **public** board and static card metadata. It does not assume unseen deck, hand or Prize contents. Current version: `agent14-solo-thorns-energy-retention-v3-stadium-path`.
- `simulation/twinleaf/agent14-owner-solo-bench-choice-contract.cjs` obtains **two independent proposals from one exact owner-root observation**: first-return Bench, and deferred-Bench attack or Stadium/DCE setup. The receipt includes physical hand/Bench index or attack name, rejected alternative, owner resource consumption, selector identity, and explicit unverified-native fields. Current version: `agent14-owner-solo-bench-choice-contract-v3-risk-comparison`.
- `simulation/twinleaf/agent14-visible-lethal-reply.cjs` is a bounded public safety signal: if the visible opponent Active survives nominal Volt and already has Energy to use a fixed-damage attack that can KO our damaged lone Active, it **chooses the baseline backup Bench** instead. This is an owner-visible tactical heuristic; unknown attack modifiers, future moves and policies remain outside the calculation.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs` integrates the pair collector **before root selection** under `deps.thornsSoloEnergyRetention===true` or `AGENT14_THORNS_SOLO_HOLD_DEV=true`, with a bounded `audit.sameRootSoloBenchChoices`, a total conflict count and version stamp. The normal source-wide behavior is untouched when the flag is false.
- `tests/agent14-thorns-solo-energy-retention.test.cjs` exercises attached DCE, DCE+Thunder in hand, DCE-attached with held Thunder, quota restrictions, public-lock vetoes, hidden-zone isolation, both proposal receipts, native wrapper integration and a synthetic public-payable Shred threat.
- `tests/agent14-solo-thorns-choice-native.test.cjs` stages **the pinned original printings** (Iron Thorns ex TWM, DCE SUM, Thunder Mountain LOT, Dialga-GX UPR) under real Store in physical seats A and B. The source card's genuine `AfterAttackEffect` uses `AttachEnergyPrompt`. The exact pinned source implements zero-Bench return without Energy movement; with a Bench, mandatory selected Energy is moved.

## Actual results and provenance

- [Manual workflow 41149647197](https://github.com/FlareZ123/experiment-01/actions/runs/41149647197) completed success at `7278b96e` and executed the integrated wrapper/option tests. [Manual 41150138705](https://github.com/FlareZ123/experiment-01/actions/runs/41150138705) completed success at `b1c84ac7`, including explicit public fixed-damage retaliation and held-Thunder regression.
- [Native workflow 41149639917](https://github.com/FlareZ123/experiment-01/actions/runs/41149639917) completed success at `7278b96e`, with initial two-seat native Bench acceptance and solo attack settlement. On both physical seats the solo branch inflicted **140 damage**, received only mandatory Wait prompts, and kept the **Double Colorless Energy SUM** physically attached to Active. No Bench was added.
- An earlier attempt to settle the counterfactual Benched attack [41149904454](https://github.com/FlareZ123/experiment-01/actions/runs/41149904454) failed **only at the newly added test**, because the test incorrectly assumed Volt's native prompt was `ChoosePokemonPrompt`. Reading the **pinned** `iron-thorns-ex.ts` and `attach-energy-prompt.ts` proved the correct mandatory `AttachEnergyPrompt` CardAssign response. The test was fixed with a typed owner Bench recipient.
- [Native workflow 41150230126](https://github.com/FlareZ123/experiment-01/actions/runs/41150230126) ran the corrected two-seat counterfactual test successfully at commit `dc40fd1c`. Actual Store prompts in both seats were `WaitPrompt, AttachEnergyPrompt, WaitPrompt, WaitPrompt` for the Bench baseline and three `WaitPrompt` instances for the solo alternative. Both attacks inflicted **140 damage**. Baseline moved DCE to the Benched Thorns, leaving the attacking Active with zero attached Energy. Solo retained DCE on its attacking Active. These are **staged native** game states; the actual full-source game path and native opponent continuation are unqualified.

## Exact narrow opener incidence, mathematical derivation

Using each published original 60 only, with four Iron Thorns ex, one Thunder Mountain and `d` copies of Double Colorless, the probability that eight uniformly sampled cards include **at least two Thorns, at least one Thunder and at least one DCE** is

`P(E)=sum_{k=2}^4 sum_{j=1}^d C(4,k) C(d,j) C(1,1) C(55-d, 8-k-j-1) / C(60,8)`,

with out-of-range combinations treated as zero. The probability the starting seven has at least one Basic in an all-Thorns four-Basic deck is `1-C(56,7)/C(60,7)`. Event E implies a legal seven-card starter, so conditioning on a valid opening is the ratio.

| Original rank | DCE | 8-card unconditional direct-hand event | Conditional on legal starting seven |
| --- | ---: | ---: | ---: |
| 6 | 1 | 0.0780949% | 0.195482% |
| 24 | 3 | 0.217471% | 0.544359% |
| 29 | 1 | 0.0780949% | 0.195482% |

This **excludes all search routes**, mulligan bonus draws, prior-turn Energy attachment and opponent disruption. It only measures this narrow direct-hand subset, not the real frequency of relevant solo-choice roots; counting synthetic or source-replay opportunities as wins is invalid.

## Evidence classification and next releases

- **Proven pinned-Store mechanism**: Bench vs solo changes Energy location after the identical printed attack in two physical seats.
- **Tested native action acceptance**: Both starter proposals can be played in staged genuine Store states and settle the printed attack, including its mandatory Energy prompt.
- **Proposed tactical score**: Preserve backup under visibly payable, surviving opponent fixed-damage lethal reply; otherwise prefer solo Energy preservation only under the explicit development flag.
- **Unproven**: Natural source exposure with this exact common chooser, response-policy competence, full physical-deck custody for these synthetic fixtures, Paper-rule exhaustive card fidelity, and any competitive or 99.5% advantage. Source-wide benchmark still has **29/32 exact original sixties** and **zero qualified competitive games**.

The local test hook is ready to hand off as a bounded proposal producer to a generic shared same-root arbiter. Avoid claiming that this narrow action contract solves the population's broader supporter/search/energy opportunity-cost coverage.
