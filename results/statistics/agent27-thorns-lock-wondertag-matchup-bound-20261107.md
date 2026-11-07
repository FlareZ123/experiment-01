# Agent 27: independent narrow regression of the established Iron Thorns Wonder Tag lock model

**7 November 2026.** Mathematical matchup screen, not native gameplay or win-rate evidence. There are still **29/32** authenticated original Aichi card-name/count inventories, **zero qualified competitive games**, and no selected final fixed 60.

## Existing work and novelty correction

**Priority correction after a complete repository search on 7 November:** Agent27 had **already** implemented a stronger **full 29-original field matchup-specific Wonder Tag veto and exact 0–4 bonus model** in [`simulation/evaluation/agent27-adp-wondertag-29field-lock-bounds.cjs`](../../simulation/evaluation/agent27-adp-wondertag-29field-lock-bounds.cjs), with [existing tests](../../tests/agent27-adp-wondertag-29field-lock-bounds.test.cjs). Its original source ranks6/24/29 lock finding and constrained no-Wonder Tag rates **predate this report**. The present module is a simpler, read-only **independent narrow implementation/check**, *not a new discovery*, new roster coverage or new favorable deck result. The extra regression [source](../../tests/agent27-adp-thorns-opening-access-veto.test.cjs) explicitly cross-checks its rank6 outputs and rank6/24/29 identity with the more comprehensive older field model. The 7 November direct Agent5 mailbox note reproduced valid known constraints but its implication of an entirely new constraint should be read in this light. Do not expand component lanes on this duplicate finding. Future research should prioritize actual bilateral games.

## Question

The fixed [ADP–Thorton–Regidrago v2 printed 60](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json) includes one Tapu Lele-GX GRI60. Agent27's earlier [Wonder Tag paid access model](../../simulation/evaluation/agent27-adp-wondertag-bonus.cjs) conditionally permits a Bench-played Tapu Lele-GX to fetch Guzma & Hala. Can this extra access branch legitimately be used against the Aichi original Iron Thorns-only decks?

**For the opponent's still-active Initialization lock, no.** The actual original [Top32 inventory](../aichi-2026/full-decklists.json) contains **exactly four Iron Thorns ex TWM77 and zero other Pokémon** in each of ranks **6, 24 and 29**. A successfully set-up game must therefore start an Iron Thorns ex in the Active Spot. Its printed *Initialization* says that Rule Box Pokémon in play have no Abilities except Future Pokémon while Iron Thorns is Active. Tapu Lele-GX is a Basic Rule Box GX and is not Future; its *Wonder Tag* activates only on playing it from hand onto the Bench. A source side that uses Wonder Tag to access Guzma & Hala while opposing Initialization is active would be relying on a disabled Ability.

The underlying card-text witnesses are the supplied English-card corpus `resources/cards/en/sv6.json` (Iron Thorns ex `sv6-77`) and `resources/cards/en/sm2.json` (Tapu Lele-GX `sm2-60`). The Advanced Player's Rulebook distinguishes automatic in-play Abilities and triggered Bench-played Abilities. Any later removal of Initialization, alternate Active, or other card effect must be investigated in the actual state; this is a **conditional first-own-turn lock model**, not a permanent categorical prohibition. The candidate's printed v2 60 contains no Canceling Cologne or Stealthy Hood.

## Exact opening resource bounds for each of ranks 6, 24 and 29

Assume the ADP candidate goes second, begins with a Basic-valid seven-card hand, takes **all** offered opponent-mulligan bonus draws, draws once normally, and then uses a hypothetical no-Wonder-Tag paid route with six inaccessible Prize cards. Allow zero through four accepted bonus cards as exact events. For five or more, bound access between its exact four-bonus success rate and 100%. This is **mechanical affordability/access**, independent of choices by real players and subsequent opponents.

| Bonus cards ADP receives | Probability against a 4-Basic original |
| --- | ---: |
| 0 | 52.5430623714% |
| 1 | 18.9590288216% |
| 2 | 11.3849039029% |
| 3 | 6.8366390546% |
| 4 | 4.1054043109% |
| 5 or more | 6.1709615386% |

| Hypothetical hand-discardability profile | No-Wonder-Tag lower | Upper |
| --- | ---: | ---: |
| Any nonreserved card is mechanically disposable | **41.943300%** | **44.867857%** |
| Only six Dragon payloads may be discarded | 24.273826% | 28.175068% |
| Those Dragons plus seven Basic Energy | 32.069613% | 35.331534% |
| Those Dragons, Energy, plus four Battle Compressor | 35.584947% | 38.658846% |

The first no-bonus row is separately instructive: the previous hypothetical enabled-Wonder-Tag model reaches **43.747196%**, while its source-identical no-Wonder-Tag control is **37.981531%**. That **5.765665 percentage-point** difference should not be carried into the three original Thorns-only matchups while Initialization persists. Other card-access routes, notably natural Double Dragon Energy, Tag Call, Quick Ball, Ultra Ball, and Guzma & Hala, remain counted by the no-Wonder-Tag original predicate.

## Reproducible calculation

[New source-grounded read-only module](../../simulation/evaluation/agent27-adp-thorns-opening-access-veto.cjs) reuses the **exact full-60 BigInt numerators** for 0–4 extra cards from `agent27-adp-original29-four-bonus-bounds.cjs`. It derives all opponent bonus exposure from the existing exact two-player mulligan implementation in `agent1-original-field-mulligan-bonus.cjs`.

Writing `pA=C(53,7)/C(60,7)` for candidate first-seven mulligan risk and `pB=C(56,7)/C(60,7)` for each four-Basic original, the probability that the candidate is offered exactly `j>=1` cards is

```text
q = (1-pA)(1-pB)/(1-pA*pB)
P(candidate gets j bonuses) = q * pB^j
P(candidate gets at least 5 bonuses) = q * pB^5 / (1-pB)
P(candidate gets none) = 1 - sum(P(j=1..4)) - P(j>=5)
```

These equations account for both players simultaneously restarting a Basicless initial seven. The zero-bonus bin includes cases where the opponent instead received optional bonus cards. For each discardability profile `k`, let `r[k,j]` be the exact conditional no-Wonder-Tag resource probability after `j` bonus cards. The reported lower and upper are

```text
known = sum(P(j) * r[k,j], j=0..4)
lower = known + P(j>=5) * r[k,4]
upper = known + P(j>=5)
```

Monotonicity follows only for this simplified first-turn access predicate, where drawing an extra card cannot invalidate an earlier affordable route. Actual play may have opportunity-cost, targeting, locking, Prize or board-state complications. The numerical arithmetic was independently recomputed with Python Decimal using the public exact BigInt inputs. [New Node test suite](../../tests/agent27-adp-thorns-opening-access-veto.test.cjs) checks source ranks, rejects altered source printing/composition, independently calculates bonus masses, and compares all four bounds. **The original five Node tests passed in the full manually dispatched statistics CI 42325338384**; the earlier base 0–4 BigInt study did pass [CI 42144108050](https://github.com/FlareZ123/experiment-01/actions/runs/42144108050). The existing manual benchmark statistics workflow was amended with one short Node test step; [CI 42325338384](https://github.com/FlareZ123/experiment-01/actions/runs/42325338384) completed SUCCESS on pinned commit `aec35d5eefed3bf27bd435ccbecbb1bd28e094b5`. No new workflow was added.

## Research interpretation and next admission

These 3 of the 29 authenticated source ranks impose a firm *conditional Ability route veto*. The no-Wonder-Tag estimate is a screen of paid first-own-turn resource reachability; its upper bound is an intentionally optimistic tail assumption. It is **not** the probability of declaring a legal enhanced Altered Creation-GX, completing a real turn, surviving the Iron Thorns matchup, or winning a game.

This should constrain any matchup-aware optimization of the fixed ADP v2. The highest-value integration step is a physically dealt, owner-visible, **single shared bilateral policy** acceptance test that verifies one source ADP paid route under this lock, the opposing owner's payable response, and a source continuation. The current [v8 developmental policy](../../simulation/evaluation/agent36-issue25-common-v8.cjs) is not qualified for that claim. Do not launch a detached rank6-only CI cohort or promote a candidate on resource access alone.


### Compiled Node 22 validation, 7 November

The existing manually dispatched [Aichi benchmark statistical workflow 42325338384](https://github.com/FlareZ123/experiment-01/actions/runs/42325338384) checked out exact research commit `aec35d5eefed3bf27bd435ccbecbb1bd28e094b5` and completed with overall **SUCCESS**. The added short step invokes both Agent27 tests using Node 22. This confirms the pure mathematical/rules regression files under real Node, while leaving all real Store, paper legality, opponent-competence and clock-event audit obligations unchanged. No full native game or win-rate sample was run in this step.


**Later added parity test:** the sixth, cross-module original-field consistency test (`e2d2f584`) postdates CI 42325338384 and is **not yet CI-certified**. It explicitly checks the pre-existing full 29-opponent field model's three locked ranks and rank6 each DCI interval against this narrow regression, preventing future drift and documenting that the older result is primary. Only the original five pure cases were Node-certified in the initial run.
