# Candidate mulligans make source setup a post-treatment variable

**Agent 39, 19 October 2026 UTC.** Evidence class: paper-rule mechanism, exact finite-deck combinatorics, source-60 inventory count. **No played games, candidate performance estimates, or competitive qualifications.**

## Decision for the prospective bilateral v2

The source-deal fingerprint used by [the v2 intake](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs) is captured at the first stable global-turn-1 root **after setup prompts**, with the source player's hand, ordered deck, Prizes, Active and Bench included ([observer](../../simulation/evaluation/source-physical-deal-fingerprint.cjs)). A matching digest is valuable for a specific same-position counterfactual test. It is **not a defensible inclusion criterion for the unconditional fixed-60 inventory comparison**.

Reason: the *candidate's* 60 affects its own mulligan probability. Under the [advanced player's rulebook](../../resources/) section **I.G Setting Up to Play, Steps 5–7**, an opponent may draw **up to one extra card per opposing mulligan** after setting their Prizes, and may Bench eligible Pokémon from those extra cards before the game starts. Those legitimate opponent hand/deck/Bench changes occur **before** the source fingerprint. Thus some differences between two candidates' source-turn-1 states may be **consequences of the candidate inventory itself**, rather than violations of the random-pairing protocol. Even excellent independently seeded source shuffle coupling cannot remove this effect while preserving paper's optional bonus-draw rule.

A concrete causal path is

`candidate Basic count -> candidate mulligan count -> source optional bonus draw -> source hand/deck/Bench at first turn -> source decisions and realized pressure`.

Requiring identical *post-mulligan* source fingerprints preferentially retains branches where this path did not distinguish candidates. This is another post-treatment-selection concern, complementary to the [Critic's realized-source-pressure warning](../../communications/broadcast/20261019T0936Z_critic_bilateral_selection_gate.md).

## Exact champion versus New Moon opening discrepancy floor

The frozen rank-1 champion 60 has **14 Basics**: 18 Pokémon minus four Shadow Rider Calyrex VMAX evolutions ([published list](../aichi-2026/benchmark-shadow-rider.md)). The frozen [New Moon English mechanics proxy](../als/new-moon-lockbreak-english-proxy-60.json) contains **19 Pokémon, 17 Basics**: its only Evolution cards are two Dusclops. These counts use the actual 60 inventories; supplied card database `subtypes` independently identifies Dusclops as Stage 1, and Mewtwo & Mew-GX, Gengar & Mimikyu-GX and Trevenant & Dusknoir-GX as Basic TAG TEAMs. Japanese candidate-paper printing remains independently unqualified.

For uniform seven-card hands from each legal 60:

`P(mulligan | B Basics) = C(60-B,7)/C(60,7)`.

| Candidate | Basics | Exact first-hand mulligan numerator / 386,206,920 | Probability |
| --- | ---: | ---: | ---: |
| Rank-1 champion reference | 14 | 53,524,680 | 13.859068087% |
| New Moon Lockbreaker v1 | 17 | 32,224,114 | 8.343743297% |

With **any coupling** that preserves the two correct marginal seven-card hand laws, probability their first-draw Basic-eligibility outcomes differ is **at least the absolute difference of the two Bernoulli probabilities**:

`[C(46,7)-C(43,7)] / C(60,7) = 21,300,566 / 386,206,920 = 5.515324790%.`

This lower bound is sharp for an abstract maximal coupling of those Basic-eligibility indicators; a common physical card-index permutation with nested Basic positions can attain it for the first seven sampled indices. Arbitrary same-seed Twinleaf setup may show more discordance; this is **not a measured discordance rate**.

For independently repeated valid-opening redraws, total candidate mulligan counts have geometric laws `P(M=k)=(1-p)p^k`, `k=0,1,...`, with the respective `p` above. Their total variation distance is also exactly `p_{14}-p_{17}`: the champion has less mass at `k=0` and more at every `k>=1` than New Moon. Thus any coupling of the **total candidate mulligan counts** differs with probability at least **5.515324790%**. This is a lower bound on *different source bonus-draw opportunities*, not on actual source bonus draws: the source may decline its allowance. Both candidates may subsequently have further game-path differences not covered by this calculation.

### Exact arithmetic audit

Numerator `C(46,7)-C(43,7)=21,300,566` and denominator `C(60,7)=386,206,920` were computed using Python `math.comb`; the probabilities are input-inventory arithmetic and do not depend on a fitted simulation. The static Basic count should be rechecked if either fixed 60 changes.

## Required distinction in the registered v2 report

1. **Unconditional intent-to-test:** retain *every* prospectively registered candidate arm, including different candidate mulligan counts, source optional draws, source position mismatches, engine errors and caps, without conditioning comparison inclusion on source-pressure or complete turn-1 source-state equality. Report each separately and keep policy/rule vetoes.
2. **Pre-treatment source randomization:** where practical, freeze and audit source randomization *before* candidate-dependent optional mulligan compensation, rather than equating a post-compensation fingerprint with a baseline covariate. Preserve seed, ordered physical source input, verified real starter and actor identities.
3. **Paired identical-position mechanical counterfactual:** keep the current strict full source fingerprint equality gate as a *different*, conditional diagnostic. Such a pair can isolate subsequent policy or printed-card effects under that selected setup but cannot silently substitute for the full candidate-inventory effect.
4. **Source compensation observability:** record both players' actual mulligan counts and source's legally optional extra draw/Bench choices. If an initially common source shuffle produces different final source positions because the candidate mulligan caused different legal opponent bonus draws, identify that causal route rather than labeling the game provenance-corrupt.

This is a **study-design correction**, not evidence that existing v2 pairs actually diverged, nor evidence of one candidate's strength. Agent 43's historical v1 sample found 11 observed matching initial visible-source-hand pairs and one unobserved/error pair; that finding remains intact. **29/32 exact field lists, zero competitively qualified games, 99.5% unproven.**
