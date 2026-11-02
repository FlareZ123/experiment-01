# General printed-Basic Active source identification without inventing an opponent's setup policy

**Agent 26 | 2 November 2026 | mathematical methods and archived original-source printed 60s.** This develops the earlier [forced Iron Thorns Active calculation](agent26-openworld-native-visible-thorns-active-20261102.md) into a reusable paper-opening likelihood interval for **any ordinarily selectable Basic Pokémon Active**. It evaluates source-recognition uncertainty rather than game-winning probability.

## Missing methodological link

A public starting Active is generally **selected**, not uniformly sampled, from a Basic-valid seven-card hand. With Regidrago V, for instance, an owner holding both Regidrago V and Budew may actively choose which one starts. Weighting a source simply by its ratio of Regidrago V to total Basics falsely assumes random selection; weighting only by possession falsely assumes the owner always selects it. Neither assumption follows from a registered decklist.

The correct source-specific bounds can be calculated from what hand compositions **force** a particular visible Active and what hand compositions merely **permit** it. This keeps adversarial setup choice possible without inventing a behavioral policy.

## Combinatorial result

Suppose an original legal 60 contains \(b\) Basic Pokémon in total and \(a\) copies of the named, publicly observed Active Basic Pokémon. For an independent shuffled seven,

\[
F(a,b)=\frac{\binom{60-b+a}{7}-\binom{60-b}{7}}{\binom{60}{7}}
\]

is the probability of holding at least one named Basic and **no other Basic**, so choosing that Active is unavoidable at normal setup; and

\[
P(a)=1-\frac{\binom{60-a}{7}}{\binom{60}{7}}
\]

is the probability of holding the named Basic at all, so choosing it is available. Consequently the exact joint probability \(q_i\) of a known source showing the public Active on its first legal starting seven satisfies \(F_i\leq q_i\leq P_i\), independent of deliberate Active choice. These are unconditioned masses; a hand with no Basic contributes zero to both.

An observed sequence of failed seven-card hands is publicly revealed, then reshuffled. Its exact per-source likelihood \(h_i\) is computed from the previously audited [source inventory and failed-hand combinatorics](../../scripts/agent26-public-mulligan-fullhistory.cjs). Therefore each known original source's joint event likelihood lies in \([\ell_i,u_i]=[h_iF_i,h_iP_i]\).

The three missing source inventories remain unobserved. A conservative ordinary-Basic upper uses the four-copy limit:

\[
U_{\mathrm{missing}}=3U(H)\left(1-\frac{\binom{56}{7}}{\binom{60}{7}}\right),
\]

with \(U(H)\) the public failed-hand unknown-source bound. Under an equal 32-rank prior, each original recovered rank has the **independent robust posterior interval**

\[
\left[
\frac{\ell_i}{\ell_i+\sum_{j\ne i}u_j+U_{\mathrm{missing}}},
\quad
\frac{u_i}{u_i+\sum_{j\ne i}\ell_j}
\right].
\]

Endpoints are separate adversarial possibilities and generally do not combine into one possible posterior vector.

## Source-grounded examples

The exact archived source manifest contains **nine** known Regidrago V-bearing original lists. For the ranked finalist **rank 10** with a visible *Regidrago V* and **zero publicly failed sevens**, it contains **4 Regidrago V within 15 total Basics**. Thus the physical seven-card event forces Regidrago Active with probability **0.1049203468441218**, while it can select Regidrago Active with probability at most **0.3994996257446656**. After allowing each known source an adversarial selection strategy and admitting the three missing lists, rank 10 has full32 source-rank interval **2.422389% to 30.484540%** under the equal-rank model. The total missing-source posterior upper in this example is **54.122505%**. This illustrates why an Active-only name cannot be converted into exact rank identification without a tested setup-choice policy.

For the **Iron Thorns ex** Active, the generic calculation exactly reproduces the [source-specific result](agent26-openworld-native-visible-thorns-active-20261102.md) across all six previously archived native source-rank6 public setups, because the three known Iron Thorns decks (ranks 6,24,29) contain it as their sole four Pokémon. The generic method covers mixed-Basic decks as well.

## Necessary out-of-support behavior

A publicly observed invalid seven can consist of real legal cards **not found in any of the 29 archived registered original sixties**. For example, a hypothetical invalid hand showing four Potion and three Great Ball has zero likelihood under every recovered opponent, but a positive upper likelihood under an unknown legal 60. The 29-source-only posterior is mathematically undefined there. The new solver explicitly returns `KNOWN_29_IMPOSSIBLE`, assigns recovered sources zero posterior and marks missing or outside-field identity as necessary. A seven of the same ordinary Potion is impossible even for an unknown legal sixty under the four-copy rule, so the solver instead flags `OUTSIDE_SUPPORTED_32_SOURCE_EVENT`. These are controlled synthetic tests of model support, **not claims that any Aichi player revealed those hands**.

## Verification, limitations and use

Implementation: [`scripts/agent26-public-active-robust-source-intervals.cjs`](../../scripts/agent26-public-active-robust-source-intervals.cjs). Tests: [`tests/agent26-public-active-robust-source-intervals.test.cjs`](../../tests/agent26-public-active-robust-source-intervals.test.cjs), joined to the existing manual-only pure statistical regression workflow. It uses the exact Stage-aware printed-Basic classifier, source-inventory legal hand mass, opponent-visible Active name and opponent-visible invalid seven names. It never asks for concealed opponent deck order, Prize cards, hand, or the hidden actual source rank.

**Compiled regression:** The first [manual run 41390893725](https://github.com/FlareZ123/experiment-01/actions/runs/41390893725) exposed an overstrict test assertion assuming all three Iron Thorns original lists survive every public revealed seven. In reality, some hands eliminate ranks 24/29. I corrected that test assertion without changing the mathematical policy code, commit `2814c9b8beddf15cd9a860b6b50c391c9c6cdb2f`. The corrected [Node22 manual workflow 41390984892](https://github.com/FlareZ123/experiment-01/actions/runs/41390984892) **passed all 17 tests** in the early math step (five preceding plus twelve Agent26), including out-of-support and exact six-native comparison cases. The global job remains **red** solely at the independently failing later Agent16 environment-inventory gate. This confirms the pure mathematical contracts only; no new gameplay was performed.

This method applies to **ordinary Basic Pokémon setup**. Special abilities allowing non-Basic Pokémon to begin a game, copy-name quirks, uncertain public card printings, multi-source priors different from equal placement and strategic setup choice correlations need separately tested extensions. The three missing original lists retain unknown inventories, so the resulting intervals may be wide. These are calculations about the identity of one original opponent, and are **not native matches or action-policy receipts**.

**Target status:** 29/32 authenticated original opponent 60s, ranks23/25/28 missing, zero competitively qualified games, no demonstrated fixed-60 99.5% field win rate.
