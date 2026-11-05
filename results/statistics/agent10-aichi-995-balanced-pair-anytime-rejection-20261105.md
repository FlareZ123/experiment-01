# Agent10: deterministic two-seat blocks admit a separate anytime-valid rejection test

**5 November 2026 | mathematical derivation, pure CommonJS implementation and synthetic regression.** This complements the independent-fair-seat *per-game* e-process of Agent7. The shared simulator currently has **zero competitively qualified complete games**, no selected fixed 60, and only 29/32 original Aichi Top 32 inventories. This result is a conditional statistical procedure, not empirical deck evidence.

## Target-specific necessary condition

For one fixed 60/policy, define `p_(i,s)` as its true **game-win probability** versus original rank `i` with original source occupying physical seat `s in {0,1}`. Let `p_i=(p_(i,0)+p_(i,1))/2`, and define the target uniform field rate `p_field=(sum_i p_i)/32`. Under `p_field >= 0.995`, total rank loss budgets satisfy `sum_i(1-p_i)<=0.16`, so **every rank's equal-seat win rate must be >=0.84**. Finding sound statistical evidence against *any one rank's* 84% floor is therefore sufficient to reject the full 99.5% claim. It cannot establish its converse.

## Why deterministic alternating seats require a distinct statistic

Agent7's [fair-seat-randomized per-game test](agent7-aichi-995-anytime-early-rank-rejection-20261105.md) correctly excludes a predetermined 0/1 seat sequence. For an alternative **prospectively frozen two-game block**, play exactly one independent source-seat-0 game and one independent source-seat-1 game against the same original rank. Complete both regardless of the first outcome; only then examine/score the block for adaptive stopping. The second game must have an independently sampled physical opening, opponent/random play and outcome conditional on the pre-block history. This design can be valid with *deterministic* 0/1 seat allocation without pretending either individual game has the average-seat win probability.

Write `r_s=1-p_(i,s)`, the nonwin rate for that physical seat. Under the per-rank null, `(r_0+r_1)/2<=0.16`. Define `L_s=1` for a qualified nonwin (loss or counted tie), `0` for a qualified win. For any precommitted alternative per-seat nonwin probability `q>0.16`, the full-block likelihood multiplier is

`M_q = (q/0.16)^(L_0+L_1) * ((1-q)/0.84)^(2-L_0-L_1)`.

Set `a=q/0.16 > b=(1-q)/0.84 >=0`. With conditional independence within the block,

`E[M_q | history] = [r_0 a+(1-r_0)b]*[r_1 a+(1-r_1)b]`

`<= [((r_0+r_1)/2)a + (1-(r_0+r_1)/2)b]^2` by arithmetic-geometric mean

`<= [0.16a + 0.84b]^2 = 1`.

The last inequality uses `a>b`. This proof includes the `q=1` limit, in which even one win makes that alternative's contribution zero. Thus the product of such multipliers across independently completed rank-specific blocks is a nonnegative **test supermartingale**. Fixed convex mixtures over alternatives are also supermartingales. Matchup rank scheduling can be adaptive **between completed blocks**; no result-dependent incompleteness, replacement, selection, or mid-pair stopping is allowed.

Precommit the following loss-rate alternative mixture: `q=.25` weight `.10`, `q=.50` weight `.20`, `q=.75` weight `.20`, `q=1.00` weight `.50`. Under the global 99.5% null, every rank e-process `E_i` is valid. The uniform `E_global=(sum_i E_i)/32`, initialized at 1 for each unplayed rank, is also a nonnegative test supermartingale. By Ville, the **anytime-valid global rejection boundary is `E_global>=20` for one preselected fixed deck/policy at alpha=.05**. Checking continuously after *complete blocks only* controls type-I risk even when the next opponent rank is selected adaptively from finished blocks.

This is a conditional rejection test for the uniform field objective. It is not a positive-strength certificate, per-rank 99.5% confirmation, or an assertion that the resulting win rate is below any particular value. If several deck/policy pairs are tested and then one is reported, candidate-selection multiplicity or held-out preselection must be handled separately.

## Reproducible source and synthetic tests

- [Pure CJS analyzer](../../simulation/evaluation/agent10-995-balanced-pair-early-rejection.cjs) and [11 deterministic Node tests](../../tests/agent10-995-balanced-pair-early-rejection.test.cjs) use existing manual [Aichi statistics CI](../../.github/workflows/aichi-benchmark-stats.yml), with no new workflow.
- Inputs are complete pairs carrying a unique block ID, two unique game IDs, exact rank 1..32, the same frozen candidate/policy identity, exactly one original physical seat0 and seat1, outcomes `win/loss/tie`, and labels `PRECOMMITTED_ONE_PER_SEAT` and `QUALIFIED`. The analyzer fails closed on malformed IDs, incomplete/repeated seats, nonqualified games or changed identities.
- Pure arithmetic check enumerates `r_0=0,.01,...,.32`, `r_1=.32-r_0` across all four fixed alternatives and confirms each expected paired e-multiplier `<=1+1e-12`. This is a test grid; the general validity comes from the proof above.
- On a synthetic one-rank two-block trajectory with all **four games nonwins**, the rank e-value is `879.1685104370117` and the global mixture (31 other ranks at e=1) is `28.442765951156616`, crossing 20 on the **second completed pair**. One two-loss block alone does not cross. This is mathematical evidence behavior, **not observed match results**.
- The CJS computes log mixtures to stay finite for extreme hypothetical counts and records the first completed-block crossing, all rank/seat counts, and mandatory `qualifiedGamesVerifiedExternally:false` and `independentBlockPrecommitmentVerifiedExternally:false` warnings.

**Admission is still external:** `PRECOMMITTED`, `QUALIFIED`, timestamps, seat assignment and any other text labels supplied by a runner are insufficient to prove independent physical deals or paper-valid games. The actual original 60s, decision policies, owner-safe information, card costs, attack/control settlement, opponent play, official 25-minute match adjudication, frozen hypothesis and all failed/censored trials must be validated independently. No native timeout, root-cap, prompt mock or Store acceptance can be counted as one of these game results.

## Applicability and priority

This model is useful **only after** the Issue25 executing common two-seat policy produces competitively accepted complete games. The live development bottleneck remains genuine source resource-to-attack/control conversion with an opponent response. Keep this code as a low-compute statistical planning module and avoid dispatching bulk games merely to exercise it. Agent7's independently randomized per-game e-process remains valid under its own different seat-sampling protocol; the two analyzers must not be applied interchangeably.

**CI evidence:** [manually dispatched run 42066088293](https://github.com/FlareZ123/experiment-01/actions/runs/42066088293), pinned checkout `060d158a87766ac37ca9af20a59867c9ab71263a`, completed 5 Nov 16:55 UTC. The exact dedicated Agent10 paired-seat test command finished **10/10 passing** in the `test-benchmark` job. **The overall workflow failed** for unrelated later steps: Agent5 ADP test imported missing `./agent5-adp-paid-opening.cjs`, and the existing moving-development policy inventory reported drift. These failures do not invalidate the ten passing isolated mathematical tests, and a red workflow must never be described as a green overall suite. Eleventh crossing regression and the later dependence-robust sibling were committed after this checkout, so no compiled CI claim covers them.

The additional regression (commit `100bd935`) checks that crossing is retained after later wins. It postdates the queued workflow's checkout and is not yet verified by that run.

### Later full CI completion

The independently dispatched [statistics workflow 42070601918](https://github.com/FlareZ123/experiment-01/actions/runs/42070601918), at immutable checkout `119ed6da5735210b5906ebdc8e44a5edeba01323`, completed **SUCCESS** on 5 November 2026 at 17:10:42 UTC. The named Agent10 CI step passed with the original eleven and the arbitrary-within-pair-dependence eleven synthetic tests loaded through the existing test entrypoint. All Agent5 paid-opening import steps passed following the three path corrections; the policy inventory step also passed. This verifies the model's software regressions. It does not verify experimental sampling laws or create any qualified Pokémon matches.
