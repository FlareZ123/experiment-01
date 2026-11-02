# Face-up Active Iron Thorns narrows the full-32 missing-source bound without assuming an opponent setup policy

**Agent 26 | 2 November 2026 | mathematical inference from authenticated source printings and six earlier genuine Store public-setup receipts.** No new games, candidate wins, play-policy promotions, or paper game qualification.

## Why this is a separate finding

The prior [open-world public-mulligan result](agent26-openworld-mulligan-source-bound-20261102.md) bounds unseen Aichi Top32 source lists by looking at publicly revealed seven-card Basic-free hands alone. It purposely leaves out the opponent's real public Active. However, the six real [rank-6 source setup receipts](agent26-real-native-source6-public-mulligan-six.json) independently record the **face-up Active Iron Thorns ex** in the native setup. Incorporating that additional public fact makes the source space and conservative missing-source bound more informative.

For the **29 authenticated original tournament 60s** in [the preserved manifest](../aichi-2026/full-decklists.json), direct printed-card-count inspection yields a strict identity fact: **only ranks 6, 24 and 29 contain any Iron Thorns ex**. Each contains **four Iron Thorns ex TWM 77 and no other Pokémon cards**. Therefore, whenever those decks have a legal Basic-valid opening, their Active is necessarily Iron Thorns ex, regardless of the owner's choice policy. For the other **26** recovered original lists, the probability of showing Iron Thorns Active is **zero**.

These are assertions about the exact archived 29 manifests, checked by code at runtime; if any changes, the new solver fails closed rather than silently generalizing. The other three, ranks **23 (Regidrago), 25 (Raichu/Electrode) and 28 (Regidrago)**, remain unknown inventories. A label alone does not prove those players excluded a tech Iron Thorns ex, and the solver does not assume any particular cards for them.

## Model-free unknown-active bound

Let \(H\) again denote a sequence of publicly exposed Basic-free failed sevens, followed by an unobserved legal starting seven. An unknown deck with at most four Iron Thorns ex can show that Pokémon as Active only if its final seven contains at least one of them. Even if the opponent strategically chooses Iron Thorns every time it is available,

\[
 \Pr(\text{Active Thorns}\mid\text{unknown final seven})
 \leq 1-\frac{\binom{56}{7}}{\binom{60}{7}}
 =0.3994996257446656.
\]

The actual joint probability of a Basic-valid opening with Thorns Active is bounded by that same factor. Earlier failures are returned and reshuffled, so this final-seven bound is independent of the identities in \(H\). Let \(U(H)\) be the previous ordinary named-card copy-limit upper likelihood of the failed-sevens history. Every missing source has

\[
 P(H,\text{Active Thorns}\mid d_{\rm missing})
 \leq U(H)\times0.3994996257446656.
\]

For each recovered known source \(i\) in \(\{6,24,29\}\), the exact joint event likelihood equals the prior measured \(P(H\mid i)\), because the final valid seven forces Iron Thorns Active. All other known ranks have zero joint likelihood. Define \(S=\sum_{i\in\{6,24,29\}}P(H\mid i)\). The guaranteed known-source mass for equal priors across the 32 source identities is

\[
 L_{\rm Active}=\frac{S}{
   S+3 U(H)\times0.3994996257446656
 }.
\]

For rank 6 specifically the new lower bound is \(P(H\mid6)/(S+3U(H)\times0.3994996257446656)\). The upper is \(P(H\mid6)/S\), where all missing lists give no matching event. This argument **makes no assumption about skilled versus random Active selection** for the missing decks. Their entire contribution is capped under the most adversarial permitted selection.

## Six exact native public opening examples

These are the same preexisting six genuine rank-6 original Store setups, with candidate seat 0 or 1. They are not 32 sampled opponents, native match outcomes or a new trial.

| Original native seed | Candidate seat | Failed sevens | Rank-6 posterior among 29, with Active | Rank-6 robust full-32 lower | Missing-three total upper |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4136149016 | 0 | 1 | 100.000% | **0.389105%** | 99.610895% |
| 4136149016 | 1 | 1 | 39.130% | **0.218500%** | 99.441612% |
| 1514735430 | 0 | 0 | 33.333% | **16.666667%** | 50.000000% |
| 1514735430 | 1 | 1 | 46.154% | **0.291121%** | 99.369238% |
| 3730833191 | 0 | 1, with two Trainers' Mail | 100.000% | **0.065062%** | 99.934938% |
| 3730833191 | 1 | 1 | 33.333% | **0.129702%** | 99.610895% |

Compared with the original failed-hands-only bound, the first source-rank6 guarantee improves from **0.155811% to 0.389105%**, and the no-mulligan example increases from **1.539755% to 16.666667%**. Even after this improvement, the source lists missing from the benchmark leave broad ambiguity. These numbers are *minimum mathematical guarantees over adversarial possible missing inventories*, not plausible estimates that the missing ranks actually contain Iron Thorns or that rank6 has such a small real probability.

The data use the tournament's 29 preexisting registered sixties and previously archived native source setups. They never reveal the current opponent concealed hand, Prize contents or deck order to the simulated decision-maker.

## Reproduction and qualification

- [Actor-safe printed-source and public-Active evaluator](../../scripts/agent26-openworld-active-thorns-source-envelope.cjs) asserts the entire three-rank source-inventory identity, uses the same exact known-source likelihoods and four-copy unknown-source caps, and prints the six-row panel when run with the existing source manifest.
- [Four Node22 pure tests](../../tests/agent26-openworld-active-thorns-source-envelope.test.cjs) check the source identity contract, the exact \(0.3994996257\) factor, an adversarial failing inventory fixture, one explicitly observed result, a no-mulligan calculation, and all six archived public setups. Integrated into an early existing pure statistical step in the **manual-only** Aichi benchmark workflow. Does not modify Twinleaf or create an extra CI workflow.
- The derivation was independently checked using Python \(\texttt{math.comb}\) and a separately written JavaScript six-receipt source likelihood computation; all displayed figures match to better than five decimals.
- **Compiled CI verification:** [Manual Node22 run 41390434299](https://github.com/FlareZ123/experiment-01/actions/runs/41390434299) passed the early mathematical test step with all 13 tests, including four Active-conditioned source proofs and the four preceding open-world proofs, on actual repository sources. The run still ended overall **red** at a later independent Agent16 transitive policy-environment inventory gate. Initial [run 41390284830](https://github.com/FlareZ123/experiment-01/actions/runs/41390284830) exposed a return-field variable typo in the new module, corrected and preserved in commit `ac631fa8505332557c4df63a7d98541e70e483e0`. Do not call the full CI green or treat these pure tests as games.
- **Native gameplay qualification:** zero. The original setup observer and solver only establish public information and combinatorial constraints. Any early counter-control action whose merit depends on a specific source deck needs a legal actor-owned root, accepted native payment/effect, realistic opponent response, and paper-time validation.

**Field status:** 29/32 actual original tournament sixties authenticated, exact missing ranks 23/25/28, 0 competitively qualified games, and no demonstrated fixed-60 99.5% win rate.
