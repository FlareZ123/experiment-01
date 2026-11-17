# Rank 1: paired-mulligan reserve-Hood access by turn order

**Agent 43 · 17 November 2026**

## Decision-relevant result

The proposed rank-1 reserve line is strategically plausible, but the simple 53/59 = 89.830508% statistic is only a Prize-location condition: conditional on the first Hood not being Prized, it says the second Hood is also outside the six Prizes. It does **not** say that the candidate can access the second Hood in time.

I enumerated the candidate's opening hand, six Prizes, paired-mulligan bonus cards, and first two normal draws. The model tracks the actual reserve sequence in the fixed [Hood Shield Shadow Rider v1 list](../candidate-hood-shadow-rider.json): Stealthy Hood ×2, Arven ×1, VS Seeker ×2, and 14 Basics.

| Candidate's seat | First Hood secured by own turn 1 | Reserve secured before rank 1's first response | First Hood + reserve accessible by own turn 2 | Reserve accessible by turn 2, conditional on first Hood |
|---|---:|---:|---:|---:|
| Candidate goes first | **24.526875220–24.526875251%** | **1.492870761–1.492870793%** | **4.610382477–4.610382509%** | **18.797268017–18.797268171%** |
| Candidate goes second | **34.582794326–34.582794358%** | **3.871859723–3.871859755%** | **6.778527383–6.778527415%** | **19.600866585–19.600866695%** |

The ranges are rigorous truncation bounds: the exact paired-mulligan distribution is summed for bonus counts 0–10, and the entire remaining tail is added only to the upper endpoint. The tail is 3.182047713 × 10⁻¹⁰ probability.

**The practical correction:** the reserve copy being outside Prizes about 89.83% of the time is not an 89.83% recovery rate. Under this narrow Arven/VS Seeker line, only about **18.8–19.6% of games in which the first Hood is secured** also have a second Hood accessible by the candidate's second turn.

## Why turn order changes the first-turn number

Both players draw at the beginning of every turn, including the first player's first turn. However, the player going first cannot play a Supporter on their first turn. Arven is therefore available on turn 1 only when the candidate goes second.

- **Candidate goes first:** first-turn access in this model is a Hood already in hand. Arven can be used on the candidate's second turn, after rank 1 has had its first response.
- **Candidate goes second:** first-turn access is either a Hood in hand or Arven in hand with at least one Hood still in the deck. If one Hood is in hand and Arven is available, Arven can fetch the reserve copy before rank 1 responds. If no Hood is in hand, Arven can fetch the first copy; a second copy then requires a later draw or VS Seeker recovery.

This is why the paired first-turn figure of 34.582794% is specifically a **going-second** result. It should not be read as a seat-independent first-turn probability. The corresponding going-first direct-Hood baseline is 24.526875%.

Rules references:
- [Official Pokémon TCG rulebook](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf), Trainer-card rules: the player going first cannot play a Supporter on their first turn.
- [Official Pokémon TCG rules Q&A](https://asia.pokemon-card.com/hk-en/rules/search/?pageNo=11), Basic Rule: the player going first does draw at the start of their first turn.
- [2026 rulebook update note](https://professorprogram.pokemon.com/news/11473085): no major basic-rule change since the Scarlet & Violet rulebook.
- The supplied [Advanced Player's Manual](../../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), setup section G, sets Prizes before optional mulligan-bonus draws.

## Exact model

Candidate categories are Hood ×2, Arven ×1, VS Seeker ×2, Basic Pokémon ×14, and other cards ×41. The candidate and rank 1 both have 14 Basics.

Let

\[
q = \frac{\binom{46}{7}}{\binom{60}{7}}, \qquad p=1-q, \qquad D=1-q^2.
\]

Shared both-fail mulligan rounds repeat and award no optional cards. If \(M\) is the number of optional cards the candidate receives from rank 1's one-sided mulligans:

\[
P(M=0)=1-\frac{pq}{D}, \qquad
P(M=m)=\frac{p^2q^m}{D}\quad(m\ge1).
\]

The exact enumerator conditions on a valid seven-card opening, then samples six Prizes, \(M\) optional cards after Prizes, one normal draw on the candidate's first turn, and one normal draw on its second turn. The candidate's first-turn Supporter restriction is applied explicitly.

For the reserve line:
1. Attach one Hood if it is in hand; otherwise, when going second, Arven can search the first Hood if one remains in the deck.
2. If the candidate goes second and has one Hood in hand plus Arven and a second Hood in the deck, Arven can secure the reserve before the opponent responds.
3. If Arven fetched the first Hood, the second Hood must remain in the deck; VS Seeker can recover Arven on turn 2. If the first Hood was naturally drawn, unused Arven can search the second copy on turn 2.
4. If the second Hood is drawn naturally on turn 2, it is already in hand and no search is needed.

The calculation uses exact Fraction arithmetic and multivariate-hypergeometric weights. It was independently sanity-checked against a 300,000-trial seeded simulation; the simulation was only a check, not the reported estimator.

## Interpretation and limits

This is a **narrow line-specific resource model**, not a total deck-access estimate, matchup probability, removal probability, or game outcome.

Included:
- direct Hood draws;
- Arven as the only first/second-turn Tool search;
- VS Seeker recovery of Arven if Arven fetched the first Hood;
- the exact paired-mulligan bonus distribution;
- the first-player Supporter restriction.

Excluded:
- Forest Seal Stone / Star Alchemy access;
- Tapu Lele-GX access to Arven;
- Fog Crystal / Mysterious Treasure lines that find Tapu Lele;
- Battle Compressor and other discard/recovery lines;
- Supporter contention (the model assumes Arven can be prioritized when needed);
- bench-space constraints, Ability suppression, the opponent's actual choice to use Field Blower, and whether a reserve Hood prevents a loss.

Those excluded search routes may increase total reserve access; Supporter contention and actual board constraints may reduce practical access. Therefore these figures should not be presented as a strict lower or upper bound on whole-deck reserve access.

The result is sufficient to reject the shortcut from “second Hood not Prized” to “second Hood can reliably be re-established.” It does **not** justify a deck change before the canonical V3 acceptance and natural-terminal trace. The next useful experiment is to add the omitted FSS/Lele access paths to the same state model, then validate the resulting sequence in the accepted native runner.

## Reproduction

Run: **python3 results/aichi-2026/2026-11/agent43-rank1-reserve-hood-recovery-20261117.py**

The script uses only the Python standard library and exact rational arithmetic.

**Evidence classification:** deck counts = normalized source-list facts; first-turn draw/Supporter restrictions = official rules; probabilities = exact combinatorial calculations under the assumptions above; actual reserve attachment, Field Blower choice, and matchup outcome = untested.
