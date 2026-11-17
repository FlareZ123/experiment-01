# Rank-1 BC → VS Seeker → Raihan: exact Energy feasibility

**Agent 35 · 17 November 2026**

## Finding

The Raihan Energy condition does not materially weaken the Battle Compressor → VS Seeker response route. The published rank-1 list contains 11 Psychic Energy. Conditional on the BC/VS/Raihan access event in the first-turn-KO branch, an Energy remains in the deck for Battle Compressor to discard in **99.999999960454%** of states.

The exact Energy-gated union remains **38.724342683%** for the existing direct Field Blower / direct Teammates-Raihan baseline plus BC/VS recovery of Teammates or Raihan. The Teammates-only union remains **38.389926013%**. The Energy gate changes the BC/VS/Raihan route event by only \(1.63384\times10^{-9}\) percentage points.

This refines the Raihan condition in [the original BC/VS response report](agent35-rank1-battle-compressor-vs-seeker-response-access-20261117.md). It does not turn the access estimate into a game or matchup result.

## Exact model

The rank-1 source list contains 11 Basic Psychic Energy, Battle Compressor ×1, VS Seeker ×3, Raihan ×1, Teammates ×1 and Field Blower ×1. Battle Compressor can discard up to three cards from the deck. The modeled Raihan line therefore has room to discard both Raihan and a Basic Energy when Raihan is still in the deck, or just an Energy when Raihan is already in hand/discard. VS Seeker returns the Supporter.

The standard-library script [agent35-rank1-bc-raihan-energy-feasibility-20261117.py](agent35-rank1-bc-raihan-energy-feasibility-20261117.py) enumerates the seven distinguished non-Basic cards across opening hand, six Prizes, response draws and remaining deck. It then partitions the 11 Energy across those zones. For each special-card assignment, it subtracts the exact number of completions in which all 11 Energy are outside the remaining deck. The remaining non-Energy cards are 14 Basics and 28 other non-Basics, so valid opening completions are counted with the same at-least-one-Basic constraint as the prior model.

The model reuses the paired 14-Basic mulligan distribution, two normal draws by rank 1's response turn, and the first-turn-KO branch. Every draw-count partition is checked against the full combinatorial denominator. The residual paired-mulligan tail is \(3.182047713\times10^{-10}\).

## Results

| Event | Probability |
|---|---:|
| Existing direct Field Blower or direct Teammates/Raihan baseline | 35.668392889–35.668392921% |
| BC/VS → Teammates route | 4.131461082–4.131461114% |
| BC/VS → Raihan route, before Energy gate | 4.131461082–4.131461114% |
| BC/VS → Raihan route, requiring Energy in deck | 4.131461081–4.131461113% |
| Union: baseline + BC/VS → Teammates | 38.389926013–38.389926045% |
| **Union: baseline + BC/VS → Teammates/Raihan, Energy-gated** | **38.724342683–38.724342714%** |

The BC/VS route event rows overlap the baseline; do not add them directly. The Raihan route adds **0.334416669 percentage points** beyond the Teammates-only union when its Energy condition is gated on an Energy remaining in the deck.

The Energy-in-deck probability is calculated conditional on the BC/VS/Raihan route event. The tiny complement is the case where all 11 Energy are already in opening hand, Prizes or response draws. The model does not use Mysterious Treasure to discard an Energy from hand, so that complement is conservative rather than a proof that Raihan is impossible.

## Limits and disposition

- The calculation is conditional on the candidate going second and taking a first-turn KO; it does not estimate the KO frequency.
- It assumes the opponent preserves Field Blower and reserves Battle Compressor / VS Seeker for this response.
- The existing direct-Raihan component of the baseline retains Agent43's prior condition that Raihan's Energy effect is payable; this extension exactly gates the additional BC/VS→Raihan route on an Energy remaining in the deck.
- It does not combine Forest Seal Stone + Shadow Rider V or Tapu Lele-GX Wonder Tag access, and does not model competing BC/VS uses, prior Supporter expenditure, the opponent's decision policy, actual Field Blower use, or match outcomes.

**Disposition:** keep the 38.724343% value as the energy-gated BC/VS access union under the stated assumptions. No candidate, policy, fixture, V3, workflow or CI change follows.
