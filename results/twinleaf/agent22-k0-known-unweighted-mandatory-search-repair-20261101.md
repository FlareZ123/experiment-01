# Agent22: known unweighted deck cards in mandatory K0 search expectation

**1 November 2026 | deterministic, pure combinatorial model repair | no native game win.** Original Agent22 helper: [K0 hypergeometric expectation](../../simulation/twinleaf/agent22-k0-search-bundle-value.cjs); newly added [three regressions](../../tests/agent22-k0-search-bundle-value.test.cjs). The existing function estimates additive diminishing-value rewards for an **unrestricted any-card search that must select at least one**, marginalizing uniform unknown Prize assignments. It is a belief model, never a native Store selector or full deck-performance estimate.

## Reachable failure and minimal correction

The original code assembled per-copy marginal values for positive-weight printings and included one unweighted fallback card only if `unvalued - (prizeCount - assigned)` was positive. Here `unvalued` counted unweighted printings in the **unknown pool**, omitting unweighted cards the caller already knew were present in `observedDeckPrintings`. As a result, if every valued candidate became Prized but a **known in-deck filler** remained, the model constructed `increments=[]`, then used `increments[0] = undefined` in the mandatory choice, resulting in **NaN** instead of a finite opportunity cost.

The narrow fix adds `knownUnvalued = observedDeckPrintings.length - sum(valued.known)` and includes that count in available unweighted search candidates. No game-rule claim beyond the preexisting explicit unrestricted-search minimum is introduced. Example **unknown pool `[A]`, Prizes=1, verified known deck `[X]`, A weighted 10, X unweighted, cost 1**: the only legal chosen card is X and the finite expected utility is **−1**, with exactly one card chosen. The previous implementation returned NaN.

## Independent exhaustive reference calculation

Separately enumerated ordered sequences for an unknown pool of lengths **0–4** over symbols `A,B,X` and known in-deck sequences of lengths **0–2** over the same symbols; each possible Prize count **0 through min(2, pool.length)** was tested when at least one deck card remained. Prize allocations were enumerated by physical card index, making assignments equiprobable even when card names repeat. For every state the reference exhaustively enumerated one-card and two-card physically distinct selection bundles and maximized total additive marginal utility with **A weight 10, B weight 6, X weight 0, fixed per-chosen-card cost 1**, maximum two cards. The model used its closed-form grouped-marginal algorithm under the identical premise.

| Independent small-state census | Result |
| --- | ---: |
| Valid states tested, including ordered duplicates | **4,641** |
| Old formula discrepancies from brute selection optimum | **26**, all NaN from missing known filler |
| Corrected formula discrepancies | **0** |
| Second deduplicated multiset census | **990 states**, 20 old NaNs, 0 corrected mismatches |

The large enumeration evaluates all small cases under the stated three-symbol/additive hypotheses, **not** all possible Pokémon card interactions, opportunity costs, alternative Supporters, Bench constraints or full-game Prize probabilities. The actual original-rank7 53-card hypothetical test remains unaffected by this correction because that older input had no special known unweighted deck group.

## Persistent code and gate

- [Model source correction](../../simulation/twinleaf/agent22-k0-search-bundle-value.cjs), original `knownUnvalued` added and used only for the mandatory unweighted fallback.
- [Regression tests](../../tests/agent22-k0-search-bundle-value.test.cjs): known unweighted-only deck; valued unknown fully Prized; mixed known filler/unknown target with expected value 4 and positive-value probability 0.5.
- Commits `d2d65a133d2fb570aff821b446ff8f944e7c88af` and `fdc55a4150bb75fec66c6976cb3d94215f45371a` were committed and pushed. The existing shared manual workflow insertion was blocked by host security checks, so **these new tests have not been claimed as passing a hosted manual GitHub Actions run**. The independent Python exhaustive enumerations did run successfully in this invocation.

**Aichi scope:** still 29/32 authentic opponent original 60s, zero competitively qualified games, no demonstrated 99.5% field-win-rate contender.
