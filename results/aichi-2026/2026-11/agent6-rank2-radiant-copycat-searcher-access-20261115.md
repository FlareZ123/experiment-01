# Agent6 — searcher-aware access to the rank-2 Radiant/Copycat line

**15 November 2026 · 2,000,000 seeded deals · resource-access estimate only**

## Question

How often can the current Hood Shadow Rider v1 list assemble the first-turn board needed for the proposed Radiant Eternatus → Mimikyu Copycat/TM: Evolution response to rank 2, when the candidate goes first?

This extends [Agent41's direct-draw screen](agent41-rank2-radiant-copycat-four-vmax-line-20261115.md). It does not estimate a matchup win rate.

## Model

The script `scripts/agent6-rank2-radiant-copycat-searcher-access.py` loads the exact 60-card candidate from `candidate-hood-shadow-rider.json`, validates its relevant counts, and samples 2,000,000 shuffled deals with seed `20261115`.

Each deal is sequenced as opening seven, six Prizes, then the first-turn draw. Mimikyu must be in the opening seven and is chosen Active. The candidate is on the play, so no Supporter is played on turn one.

The first-turn feasibility search explores all sequences in this simplified Item-access model:

- Mysterious Treasure: Radiant Eternatus or Shadow Rider V from the deck; one `Other` card is discarded.
- Fog Crystal: Shadow Rider V or Basic Psychic Energy from the deck.
- Quick Ball: Radiant Eternatus or Shadow Rider V from the deck; one `Other` card is discarded.
- Forest Seal Stone: one any-card search, after at least one Shadow Rider V is in hand/play.
- Hisuian Heavy Ball: recover Radiant Eternatus or Shadow Rider V if it is in the Prizes.
- Battle Compressor + Night Stretcher: recover one Pokémon or Basic Energy from the deck through the discard pile.

The model requires at least two Shadow Rider VMAX still in the deck for Radiant Eternatus to put two into play. The 3+ VMAX branch requires at most one VMAX Prized; the 4-VMAX branch requires none Prized. The 3+ branch needs one Shadow Rider V available for the additional evolution; the 4-VMAX branch needs two. VMAX remaining in hand can be evolved normally on turn two; VMAX remaining in deck can be reached by the copied TM: Evolution. The model counts board resources, not the source of each evolution.

Two energy thresholds are reported:
- **E1:** one Psychic Energy accessible by the end of the first turn, to attach to Mimikyu.
- **E2:** two Psychic Energy accessible by the end of the first turn. This is a strict sufficient condition for paying Copycat's two-Energy attack cost on the following turn without relying on a second-turn draw or Dimension Valley.

The feasibility search explores legal assignments of the modeled searchers rather than using a fixed greedy order. Its discard abstraction assumes any `Other` card in hand can be discarded; it does not permit discarding an unused searcher as fodder. This is a declared simplification, not a claim that every `Other` card is strategically expendable.

## Results

Rates are per shuffled game, not conditional matchup win rates. Intervals are 95% Wilson intervals.

| First-turn access event | Deals | Estimated rate | 95% interval |
|---|---:|---:|---:|
| Mimikyu in opening seven | 233,558 | 11.6779% | 11.6335–11.7225% |
| E1 + resources for 3+ VMAX after turn-two evolution | 80,068 | **4.0034%** | 3.9763–4.0307% |
| E1 + resources for 4 VMAX board | 21,694 | **1.0847%** | 1.0704–1.0991% |
| E2 + resources for 3+ VMAX after turn-two evolution | 44,309 | **2.2155%** | 2.1951–2.2359% |
| E2 + resources for 4 VMAX board | 8,371 | **0.4186%** | 0.4097–0.4276% |

Conditional on Mimikyu appearing in the opening seven, the corresponding access rates are 34.2818%, 9.2885%, 18.9713%, and 3.5841%, respectively.

### Direct-draw sanity reference

The same simulation also reproduces Agent41's no-searcher screen:
- 3+ VMAX direct-draw reference: 3,159/2,000,000 = 0.15795% (95% interval 0.15254–0.16355%);
- 4 VMAX direct-draw reference: 196/2,000,000 = 0.00980% (95% interval 0.00852–0.01127%).

Agent41's exact 3+ direct-draw result is 0.158829%, inside this simulation's interval. This is a sampling/sequence sanity check, not an apples-to-apples comparison: the searcher model uses first-turn Item access, while the reference is direct draw only.

## Interpretation

1. **The Item package materially changes access.** Direct-draw-only calculations miss much of the first-turn setup because Treasure, Fog Crystal, Quick Ball, Forest Seal Stone, Heavy Ball, and the Compressor/Stretcher pair can assemble the required pieces.
2. **The line is still not a dependable standalone plan.** Even under the modeled searcher access, the 4-VMAX first-turn board with two Psychic Energy already accessible occurs in only 0.4186% of all deals. The 3+ branch is more accessible, but still only 2.2155% under the strict E2 condition.
3. **Energy timing is a major remaining uncertainty.** E1 is not itself proof that Mimikyu can attack on turn two. A second-turn draw, unused Fog Crystal, Dimension Valley, and the newly benched VMAX's Underworld Door draw effects can improve access; none is credited in E1/E2 beyond the stated thresholds.
4. **The result is conditional on the opponent gifting the attack.** The model does not decide whether the rank-2 player should use TM: Evolution when Mimikyu can copy it, nor does it model the actual game after the attack.
5. **No deck change is nominated.** This is a line-access result, not evidence that Mimikyu-2 or any other challenger is superior.

## Limitations

- Monte Carlo deal sampling, not exhaustive enumeration of all physical shuffles.
- First-turn search feasibility is exact only within the listed simplified action model.
- `Other` cards are treated as discard fodder; actual card value and sequencing may reduce feasibility. Conversely, other search/draw lines omitted here may increase it.
- No Supporter is used on the candidate's first turn, correctly reflecting going first. Second-turn Supporters and draw effects are not modeled.
- Dimension Valley and Underworld Door are not credited; the model does not calculate the probability of funding Copycat after the opponent's turn.
- It assumes Mimikyu is selected Active when present in the opening seven, and does not model alternate starts or switching into Mimikyu.
- It counts the number of VMAX resources available after Radiant, not whether each extra VMAX is in the deck for Copycat or in hand for a normal evolution. It therefore does not prove that Copycat itself resolves in every counted board.
- It assumes the candidate goes first and does not model the opponent's choice to use TM: Evolution, Prize taking, disruption, or actual game outcomes.
- It is not a matchup win-rate estimate and provides no evidence of the 99.5% objective.

## Reproduction

Run from the repository root:

```bash
python scripts/agent6-rank2-radiant-copycat-searcher-access.py --self-test
python scripts/agent6-rank2-radiant-copycat-searcher-access.py --deals 2000000 --seed 20261115
```

The script uses only the Python standard library and validates the relevant card counts against the fixed candidate JSON before sampling.

**Conclusion:** searcher-aware access makes the Radiant/Copycat line meaningfully more available than a direct-draw screen suggests, but even its favorable 3+ and 4-VMAX setups remain too infrequent to treat as a standalone rank-2 solution. The next useful model is second-turn energy/draw access (including Underworld Door and Dimension Valley) plus the opponent's rational choice of whether to offer TM: Evolution.
