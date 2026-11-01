# Rank26 source-first versus four-Basic opponent: optional mulligan draws and the direct Energy-zone event

**Agent 3 | 1 November 2026 | exact card-location model, not gameplay.**

The [direct root result](agent3-rank26-direct-root-lightning-dce-20261101.md) assumes the source rank26 Meloetta deck has one ordinary first-turn draw and **declines all optional opponent-mulligan bonus draws**. It measures a **2.788922647%** conditional event: after that draw, the singleton Double Colorless Energy (DCE) is in hand and both original Basic Lightning are still in deck, while all six previous disjoint self-KO witness branches meet unprized requirements. The source has 12 Basic Pokémon. Ranks **6, 24 and 29** are each four-Basic Iron Thorns-only source decks; they can repeatedly mulligan before a source-first Meloetta turn.

## Correct coupled setup distribution

Under the supplied Advanced Player's Rulebook setup (§I.G), both players restart the round if **both** failed to draw a Basic. If one player keeps a Basic-valid hand and the other failed, only the failed player continues mulliganing. This is more precise than treating the opponent's failed hands as an unconditionally geometric count.

Let `s=1-C(48,7)/C(60,7)=0.8093533072892635` be the rank26 source Basic-valid probability; `o=1-C(56,7)/C(60,7)=0.3994996257446656` be the four-Basic opponent's; `q=1-o`; and `d=1-(1-s)(1-o)=0.885516589676661`.

The opponent's number `M` of mulligans that give bonus-draw eligibility to rank26 has distribution:

- `P(M=0)=o/d=0.45114866327974673`.
- For `m>=1`, `P(M=m)=s*o*q^m/d`.

The expected source-visible opponent mulligans are **1.373846936**, slightly below the naive uncoupled `q/o=1.503131256`. Rounds where rank26 initially fails while the opponent holds a Basic do not award rank26 bonus draws.

## Original physical gate under three optional-draw policies

For a fixed `m`, rank26 may choose any bonus count from 0 to m before its mandatory first-turn draw. Conditional on the exact source group-Prize event, after `k=m+1` draws from the 47-card post-Prize deck, the probability of preserving both deck Lightning is `C(45,k)/C(47,k)` when DCE was initially held. When DCE was absent from seven, the probability to find it and avoid both Lightning is `C(44,k-1)/C(47,k)`. All counts use the original 60s; these formulas do not peek at actual deck order.

| Rule for choosing optional bonus draws | Conditional favorable first normal root |
| --- | ---: |
| Always decline all opponent-mulligan bonuses | **2.788922647%** |
| Always take all available bonuses | **3.071278778%** |
| Owner sees DCE in opening seven: decline; otherwise take all | **3.209995057%** |

The third illustrative decision uses only the owner's opening hand and public number of opponent mulligans. In this narrow objective, taking more cards when DCE is already held can pull a Basic Lightning out of deck and reduce direct Battle Compressor readiness; drawing more when DCE is absent can improve the chance of finding it. This is a **conditional tradeoff**, not a proof that a competitive source policy should ever decline mulligan draws. A drawn Lightning may still be discarded with Quick Ball, Carmine or another effect, and extra card acquisitions often have far more strategic value than this narrow direct event.

The calculation sums `m=0..46`, with omitted opponent-mulligan probability mass **3.56e-11**, and treats source's Basic-valid final seven as uniform. It excludes extra real first-turn draws/search, costs, Prize recovery, hand-to-discard Lightning routes, opponent defense, complete first-turn action execution and official clock. None of these percentages estimates a donk or game win rate.

## Reproduction

[Coupled setup enumerator](../../scripts/agent3-rank26-coupled-mulligan-zone.cjs) and [deterministic assertions](../../tests/agent3-rank26-coupled-mulligan-zone.test.cjs), building on the [underlying exact 7+6 DP](../../scripts/agent3-rank26-direct-root-lightning-dce.cjs). These new files are committed; no compiled native action or CI result is asserted. The next test is a first-turn owner-only source-dealt draw-choice and downstream legal discard/attachment census, with all source-deal fingerprints, failed lines and opponent replies preserved.

Benchmark remains **29/32** exact opponent 60s, **zero** competitively qualified games and no demonstrated 99.5% fixed sixty.

**Independent prior-method cross-check:** [Agent 27's 30 October rank26 Ticket/Compressor mulligan study](agent27-rank26-opponent-mulligan-ticket-visibility-20261030.md) independently derived the same simultaneous-failure-reset distribution and **1.373847** average bonus offers for the source rank26 versus four-Basic opponents, then checked it against **200,000** simulated setups and a successful source-aware CI. That earlier study counted a different, Prized-DCE Ticket recovery event. The present result applies the already-established setup distribution to a newly counted *unprized DCE held / two Lightning still in deck* event and three optional-draw policies.

**Executable verification (1 November):** The new deterministic Node20 tests for both exact computations passed [manual-only GitHub Actions CI 41329137800](https://github.com/FlareZ123/experiment-01/actions/runs/41329137800), pinned research head `c8ce215c5ed9b1799ce304bc758e10e0168ba547`. The single pure job completed successfully; this checks the combinatorial scripts and assertions, with no native-game or opponent-policy qualification.
