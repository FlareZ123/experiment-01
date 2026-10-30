# Complete publicly revealed mulligan sevens identify source compositions much better than mulligan counts

**Agent 26 | 30 October 2026 | Evidence class:** pre-registered-in-code fixed-seed, source-balanced synthetic setup sampling with exact Bayesian likelihoods. This is a **source-identification** experiment. It generates no live-game actions and has **zero competitively qualified games**.

## Experimental question

Given the 29 recovered exact Aichi Open League 2026 original source sixties, how much additional information does a legal opponent gain by seeing every card in failed Basic-free sevens, compared with observing only the **count** of failed hands? Does the result justify giving the central shared owner-only action chooser an optional public history feature?

Use the original 29 published decklists, with equal prior weight for each source rank, and `samplesPerSource=256` independently seeded synthetic setups per source. Each setup samples seven without replacement from that source's exact 60 with the documented xorshift32 stream, then fully restores/shuffles all 60 after any invalid seven. It stops at a Basic-valid seven whose identities are **never passed to either posterior**. Observe `K`, the total number of publicly revealed invalid seven-card hands, and the complete card names of those failed sevens. The comparison is a within-setup count-only posterior versus a count-plus-public-identities posterior.

The count-only reference likelihood for source with b Basics is `q_b^K (1-q_b)`, with `q_b=C(60-b,7)/C(60,7)`. The complete-history likelihood is `(1-q_b) * product_i [product_x C(c_x,h_ix)/C(60,7)]`, with exact non-Basic named-card multiplicities `c_x`. The former conditions on total mulligan depth; the latter additionally uses every **public** invalid hand name. Both use the same uniform 29-rank prior.

## Observed synthetic results

<escape>7,424 setups, 256 per recovered source, fixed seed 20261030. All 7,424 attempts are retained in the denominator.</escape>

| Metric | Mulligan count alone | Count plus public seven-card names |
| --- | ---: | ---: |
| Average posterior probability assigned to the actual source rank | **4.25%** | **20.49%** |
| Most-probable-rank selection accuracy | **5.15%** | **21.38%** |
| Mean source-posterior entropy | **4.749 bits** | **3.896 bits** |

**Relevant conditional subcohort:** 1,570/7,424 setups (**21.15%**) revealed at least one full invalid seven. The remaining 5,854 had none, so there was no difference between models that received the same failed-hand count of zero.

| Metric, given at least one revealed failed seven | Count alone | Count plus seven-card names |
| --- | ---: | ---: |
| Mean posterior probability assigned to the actual rank | **6.84%** | **83.65%** |
| Mean source-posterior entropy | **4.443 bits** | **0.409 bits** |

For the 5,854 zero-mulligan setups, the two methods agree exactly: mean actual-rank posterior **3.557%** and entropy **4.831 bits**. With at least one failed seven, the **4.035-bit** difference is a large informational gain under the fixed 29-list prior. Overall the reduction is **0.853 bits**. These figures quantify uncertainty about the **source-rank identity within this specific modeled universe**.

## Why the result needs a strict action-policy gate

- The full card-name history often contains cards uniquely or nearly uniquely associated with one recovered source. The classification model uses tournament lists as *hypotheses*, which competitive players can research, but source selection and uniform prior are researcher assumptions. The three missing exact original decks (ranks 23,25,28), altered lists, unknown competitors and imperfect recollection can reduce field recognition.
- The sampled experiment ignores the player's **visible Active/Bench Pokémon** after legal setup. Those may already identify the opponent's archetype. It also ignores the opponent's intentional choice of Active Pokémon or Bench contents, so the observed information gain **cannot be equated with incremental playable decision value**.
- Maximum a posteriori rank accuracy is affected by tied or strongly favored rank-level priors, especially for zero-mulligan setups. Posterior true-rank mass and Shannon entropy are better ways to understand the information model; none are attack-success or game-win rates.
- The experiment conditions on a Basic-valid opening and privately knows the source composition to *generate* observations. The decision posterior receives only the actual failure count and public invalid seven names. Earlier failed-hand cards are returned before redrawing and must never be treated as depleted stock.
- Native game decision policy and tournament clock competence remain separate blockers. Do not promote a candidate based on a K0 source-belief score.

## Files and verification

- Reproducible experiment: `scripts/agent26-public-mulligan-information-power.cjs`
- Exact full-history likelihood implementation: `scripts/agent26-public-mulligan-fullhistory.cjs`
- Unit and deterministic regressions: `tests/agent26-public-mulligan-information-power.test.cjs`
- Unmodified sample results with all 29 source rows: `results/statistics/agent26-public-mulligan-information-power-sampled-7424.json`
- [Manual GitHub Actions run 41002493576](https://github.com/FlareZ123/experiment-01/actions/runs/41002493576), pinned run-head SHA `d003f12ae67d41fada6a9995d103b468d112ea78`, successful. The experiment ran using the opt-in boolean `agent26_public_history_information=true` in the existing benchmark-statistics workflow; the default workflow remains untouched for expensive simulation.

**Recommendation to action-policy owner:** given the large conditional information signal, it is reasonable to retain this public-history feature as a *candidate* actor-owned source-belief input. First test whether it changes a consequential root choice after the opponent's real public board has already been exposed, and whether that chosen root is physically accepted by the native Store and actually improves the continuation. If no root changes, the feature may be redundant in the studied matchups.

The research benchmark remains **29/32 exact published source 60s, zero policy-qualified competitive games**, and no demonstrated fixed-60 99.5% result.
