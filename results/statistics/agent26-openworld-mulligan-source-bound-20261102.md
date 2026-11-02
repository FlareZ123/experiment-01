# Public mulligan rank identification is fragile to the three missing Aichi source sixties

**Agent 26 | 2 November 2026 | mathematical robust-identification envelope and analysis of six previously captured genuine native setup receipts.** No simulated match winners, new physical games, policy improvements or competitive qualification are claimed.

## Unresolved question

The prior full-public-mulligan posterior [Agent26, 30 October](agent26-public-mulligan-fullhistory-information-power-20261030.md) assigns posterior probabilities **conditional on one of 29 recovered original Aichi Top32 decklists**. This can make a rare publicly exposed invalid seven appear to identify a known rank with certainty. However, the remaining original registered sixties at **ranks 23, 25 and 28** are missing. What is the *certified minimum* probability assigned to a known rank if the omitted lists may contain unknown but paper-deck-legal cards?

This is an **open-world worst-case posterior interval** under a stipulated **uniform prior across the 32 original players**. It is deliberately adversarial, and does not estimate the actual probabilities for the missing three decks.

## Exact derivation

Let the publicly observed event \(H\) be an ordered collection of fully disclosed seven-card hands without any Basic Pokémon, followed by an unobserved seven with a Basic. A failed seven is reshuffled before another independent attempt.

For each known source \(i\), the existing exact combinatorial model supplies \(P(H\mid i)\). Define \(Z=\sum_{i\in K}P(H\mid i)/29\), where \(|K|=29\). The three omitted decklists have unknown likelihoods.

A particular unordered failed hand with observed name multiplicities \(m_x\) has mass

\[
 P(h\mid d)=\frac{\prod_x\binom{c_x(d)}{m_x}}{\binom{60}{7}},
\]

where \(c_x(d)\) is the deck's physical count of that card name. For each ordinary non-Basic name, paper deck rules give \(c_x\leq4\). For an unrestricted Basic Energy name, use the deliberately conservative \(c_x\leq60\). Dropping all other constraints, including the requirement that a deck can actually make a Basic-valid opening, yields a safe upper likelihood for a single hand:

\[
U(h)=\min\left(1,\frac{\prod_x\binom{M_x}{m_x}}{\binom{60}{7}}\right), \quad M_x\in\{4,60\}.
\]

For independent reshuffled failed hands, use \(U(H)=\prod_hU(h)\); the final Basic-valid opening has probability at most one. The true missing-source event likelihood can be smaller or zero. Under 32 equal source priors, the missing-source maximal mass is \(3U(H)/32\), while the 29 known-source mass is exactly \(29Z/32\). The guaranteed **lower bound** on the total known-source posterior mass is therefore

\[
L(H)=\frac{29Z}{29Z+3U(H)}.
\]

For a particular known rank with closed-world posterior \(p_{i\mid K}\), its conservative interval is \([L(H)p_{i\mid K},\;p_{i\mid K}]\). The total unknown-rank posterior is in \([0,1-L(H)]\). These bounds are valid without inventing any of the missing inventories. **Their extrema need not be jointly achievable by the three actual absent lists**; no deck-construction feasibility maximization was attempted.

The denominator \(\binom{60}{7}=386{,}206{,}920\). For seven distinct non-Basic names, \(U=4^7/\binom{60}{7}=0.00004242285456718383\). For two copies of one non-Basic name and five distinct others, \(U=\binom{4}{2}4^5/\binom{60}{7}=0.000015908570462693936\). These are loose **event-likelihood caps**, not posterior probabilities.

## Application to actual previously archived native Store disclosures

Input: exact previous [Agent26 six native rank-6 opening receipts](agent26-real-native-source6-public-mulligan-six.json), validated in [the native printed-name compatibility report](agent26-all29-native-public-mulligan-compatibility-20261030.md). Each row observes the opponent's genuinely public invalid-seven names. The true original source was rank 6, but the posterior calculator was not given that rank as an observation. The calculation below **does not condition on the visible Iron Thorns ex Active**; a separate earlier experiment studied active-conditioned source beliefs. All six examples are retrospective setup information, not independent game-strength samples.

| Native seed | Candidate seat | Public failed sevens | Rank 6 posterior, known-29 only | Rank 6 bound across 32 | Missing-three total upper |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4136149016 | 0 | 1 | 100.0000% | **0.155811%–100.0000%** | 99.8442% |
| 4136149016 | 1 | 1 | 39.1304% | **0.087584%–39.1304%** | 99.7762% |
| 1514735430 | 0 | 0 | 1.7411% | **1.539755%–1.7411%** | 11.5626% |
| 1514735430 | 1 | 1 | 46.1538% | **0.116745%–46.1538%** | 99.7471% |
| 3730833191 | 0 | 1, including two Trainers' Mail | 100.0000% | **0.026002%–100.0000%** | 99.9740% |
| 3730833191 | 1 | 1 | 33.3333% | **0.051937%–33.3333%** | 99.8442% |

The headline contrast is a matter of **guarantees**, not actual likelihoods: the first observed seven gives rank 6 probability one *inside the 29 known deck hypotheses*, while the existing data can only guarantee **0.155811%** rank-6 probability with three unrestricted unknown source lists and equal 32-player priors. The actual rank-6 conditional posterior could be much higher; the worst-case omitted hypotheses are chosen to favor the observed data and are unlikely to represent the registered omitted decks.

In the zero-mulligan example, the unknown hand likelihood cap is one, and the known event average is 0.7912294697289253, giving known-source total posterior at least **88.4374%**. That gap is smaller because the absence of a revealed non-Basic hand is less discriminatory among source hypotheses.

## Model boundary and next actionable step

The missing ranks are already labeled Regidrago (23 and 28) and Raichu/Electrode (25). Actual archetype knowledge, characteristic Basic counts, public Active/Bench selection, externally verifiable deck images, and exact one-ACE-SPEC/Prism Star limitations can **tighten** the crude 60-card bound, but must be grounded and cannot be replaced with invented source sixties. The upper values here intentionally omit those constraints.

More importantly, a calibrated source belief is only useful for deck optimization when it changes a legally selectable **owner-visible action** and when the resulting native Store payment/effect and opponent continuation are verified. This result neither certifies early anti-Iron-Thorns tech decisions nor changes the shared default policy.

## Reproducible implementation and verification state

- [Open-world source envelope module](../../scripts/agent26-openworld-mulligan-source-envelope.cjs), using the existing exact known-29 posterior implementation and source manifest.
- [Four-case Node 22 regression](../../tests/agent26-openworld-mulligan-source-envelope.test.cjs) checks copy-count caps, multiplicities, Basic Energy exemption, both genuine rank-6 positive examples, no-mulligan event and all six bounds. Added to the **existing** manual-only benchmark workflow's established pure-statistics test command; no new workflow.
- Independently recomputed \(\binom{60}{7}\), likelihood caps and numeric lower bounds with Python's \(\texttt{math.comb}\). Every computed bound agrees with the direct JS independent calculation. The first dispatched existing CI [run 41389305090](https://github.com/FlareZ123/experiment-01/actions/runs/41389305090) was **red due to an unrelated earlier Agent16 transitive source-inventory gate** and skipped our later statistical test step. Accordingly, **the new Node test cannot yet be claimed to have passed compiled CI**; the test is committed and scheduled in that step, and still requires execution through an unblocked runner. Preserve this explicit validation caveat.

**Status:** No new original source 60, no native gameplay result and zero competitive-qualified games. Keep the project-wide 99.5% goal as an unverified aspiration. This is a mathematical uncertainty guard against declaring a known-list posterior conclusive in a 32-opponent field with three missing inventories.
