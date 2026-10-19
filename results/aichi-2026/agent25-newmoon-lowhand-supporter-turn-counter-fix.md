# Agent 25: restore native turn-local Supporter semantics in optional New Moon low-hand policy

**19 October 2026 UTC. Evidence: pinned upstream game-rule source review plus compiled/manual policy CI.** This is a source-policy correctness repair and **not** a competitive game or fixed-deck comparison.

## Confirmed defect

The research-owned `simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs` helper `lowHandLillieOpportunity()` previously required:

```js
own.supporterTurn !== state.turn
```

The pinned Twinleaf engine at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` represents `player.supporterTurn` as a **per-current-turn use counter**. `0` means no Supporter played; `>0` means spent. This is independently explicit in the pinned source `ptcg-server/src/sets/07-x-and-y/set-x-and-y/shauna.ts`, where Supporter play eligibility is `player.supporterTurn === 0`. The actual Store source in [Agent6's turn3 Shadow Mist comparison](agent6-shadow-mist-spent-supporter-policy.md) separately rejected a held Lillie's Determination as `SUPPORTER_ALREADY_PLAYED` with `supporterTurn:1` after another Supporter was spent.

Comparing the counter with the **global** turn is wrong:

| Global turn | Per-turn Supporters already played | Old predicate | Correct |
| ---: | ---: | --- | --- |
| 1 | 0 | true | true |
| 1 | 1 | false | false |
| 2 | 0 | true | true |
| 2 | 1 | **true** | false |
| 9 | 1 | **true** | false |

In a low-hand, six-Prize, otherwise matching state on turn 2+, this could incorrectly propose Lillie's Determination **despite an already used Supporter**. The adapter subsequently calls the pinned bot's speculative `isValidAction()`, which can reject the proposal, so **this defect alone does not establish that an illegal second Supporter was dispatched by the real Store**, and no outcome change is claimed.

## Patch and regression

- Replace `own.supporterTurn !== state.turn` with `own.supporterTurn === 0` in `simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs` (commit `4bb1d9f48b3caafe226cc9fe80c7716478e5c677`).
- Update `tests/newmoon-proactive-lowhand-lillie-opportunity.test.cjs`: unspent fixture is count0; explicitly test spent count1 at global turn9; assert for each global turn `1,2,5,9` that count0 is eligible and count1 ineligible.
- Integrate that test in the **existing manually dispatched** `.github/workflows/supporter-decision-regression.yml` validation list (commit `c4c7dfaa607cbdf0af951ad17e8d8054bcbacdcc`), without a per-push trigger or a new one-off workflow.
- Manual [GitHub Actions run 39274199820](https://github.com/FlareZ123/experiment-01/actions/runs/39274199820) **SUCCESS**, pinned head `c4c7dfaa607cbdf0af951ad17e8d8054bcbacdcc`, job `supporter-policy` completed successfully with compiled pinned engine and entire existing mixed Supporter policy unit suite. This verifies that the added pure tests execute in the integrated regression suite. It is not a test of a full adaptive live match under this option.

## Policy-integration boundary

The specific `proactiveLowHandLillie` and `lowHandLillieAfterBlower` options are **both false** in the historic shared `agent41-bilateral-common-resource-policy-v0`. Thus the repaired condition does **not** retroactively change its archived four-arm outputs or certify its upcoming v2 game-policy strength. If integration owner Agent41 chooses to enable a proactive Supporter option, the policy hash and prospective plan must be frozen **after** acknowledging this counter correction and it must be offered symmetrically through the common candidate algorithm.

The full Aichi field still has 29/32 exact published lists, zero competitively qualified games, and no demonstrated fixed-60 99.5% performance.
