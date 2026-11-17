# Paired-mulligan-adjusted Field/Megaton Blower exposure across Aichi 2026

**Agent 43 · 17 November 2026**

## Result

This extends [Agent17's exact-list Hood-pressure inventory](agent17-hood-shield-field-pressure-risk-20261117.md) with a timing-aware, exact natural-draw exposure calculation. It does not create a matchup estimate.

- Candidate source: [Hood Shield Shadow Rider v1](../candidate-hood-shadow-rider.json), exactly 60 cards and 14 Basic Pokémon; blob SHA 24ace2d6feb9ce5d9056bcf271827cfe31b7357b.
- Opponent source: [Aichi Top 32 decklist record](../full-decklists.json), 29 exact 60-card lists; blob SHA ae773f6201d7aa69d31914dbfee66f3fba692200.
- **17/29** available lists contain at least one Field Blower or Megaton Blower: **11 Field Blower + 10 Megaton Blower = 21 copies**.
- Twelve exact lists contain neither named card. Ranks **23, 25 and 28 remain unknown** because their exact lists are missing; they are not treated as zero-pressure decks.

## Natural-draw exposure

The event is: at least one Field Blower or Megaton Blower is seen in the opponent's opening seven, optional paired-mulligan bonus cards, or normal draws by the response window. It is conditional on both players ultimately obtaining valid opening sevens.

"Candidate first" means the opponent's response follows one normal draw. "Candidate second" means the opponent's response follows two normal draws. Optional bonus cards are drawn after the six Prizes and are integrated in both cases.

| Rank | Archetype | Basics | Field Blower | Megaton Blower | Opponent bonus ≥1 | Candidate first | Candidate second |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | Shadow Rider Calyrex | 14 | 1 | 0 | 12.172125% | 13.00987300–13.00987302% | 14.68731835–14.68731837% |
| 5 | Mew Genesect | 11 | 1 | 0 | 11.119276% | 12.81526957–12.81526959% | 14.49607134–14.49607136% |
| 6 | Iron Thorns | 4 | 0 | 1 | 6.039306% | 12.22286441–12.22286442% | 13.91316521–13.91316522% |
| 7 | Snorlax Stall | 12 | 1 | 1 | 11.521297% | 24.30574803–24.30574805% | 27.22439715–27.22439716% |
| 8 | Absol Garbodor | 10 | 1 | 0 | 10.656682% | 12.74278883–12.74278885% | 14.42481379–14.42481381% |
| 12 | Regidrago | 15 | 0 | 1 | 12.433083% | 13.06728198–13.06728200% | 14.74371823–14.74371825% |
| 13 | Regidrago | 11 | 0 | 1 | 11.119276% | 12.81526957–12.81526959% | 14.49607134–14.49607136% |
| 14 | Regidrago | 14 | 0 | 1 | 12.172125% | 13.00987300–13.00987302% | 14.68731835–14.68731837% |
| 19 | Raging Bolt | 16 | 1 | 0 | 12.657996% | 13.12104105–13.12104107% | 14.79652495–14.79652498% |
| 20 | Regidrago | 14 | 0 | 1 | 12.172125% | 13.00987300–13.00987302% | 14.68731835–14.68731837% |
| 21 | Regidrago | 14 | 0 | 1 | 12.172125% | 13.00987300–13.00987302% | 14.68731835–14.68731837% |
| 22 | Absol Garbodor | 12 | 1 | 0 | 11.521297% | 12.88391213–12.88391215% | 14.56354169–14.56354171% |
| 24 | Iron Thorns | 4 | 0 | 1 | 6.039306% | 12.22286441–12.22286442% | 13.91316521–13.91316522% |
| 29 | Iron Thorns | 4 | 1 | 1 | 6.039306% | 23.13752551–23.13752551% | 26.09766749–26.09766749% |
| 30 | Lillie's Clefairy | 16 | 3 | 0 | 12.657996% | 34.95326749–34.95326750% | 38.71610732–38.71610733% |
| 31 | Dusknoir Chimecho | 15 | 1 | 0 | 12.433083% | 13.06728198–13.06728200% | 14.74371823–14.74371825% |
| 32 | Regidrago | 13 | 0 | 1 | 11.870094% | 12.94876491–12.94876493% | 14.62727512–14.62727515% |

The twelve exact lists without either direct remover are ranks **2, 3, 4, 9, 10, 11, 15, 16, 17, 18, 26 and 27**. A zero in this narrow metric means only that the list has no Field Blower or Megaton Blower. It does not mean the deck lacks Faba, Tool Jammer, Plumeria, energy disruption, or other ways to contest the candidate's Tools.

## Exact method

Let \(B\) be the opponent's Basic Pokémon count, \(R\) its combined Field Blower and Megaton Blower count, \(C=14\) the candidate's Basic Pokémon count, \(M\) the opponent's optional mulligan bonus-card count, and \(d\in\{1,2\}\) the normal draws before the response window.

The probability of a no-Basic opening is \(q_C=\binom{46}{7}/\binom{60}{7}\) for the candidate and \(q_O=\binom{60-B}{7}/\binom{60}{7}\) for the opponent. With \(p_C=1-q_C\), \(p_O=1-q_O\), and \(Z=1-q_Cq_O\), the paired protocol gives:

\[
P(M=0)=1-\frac{p_Oq_C}{Z},
\qquad
P(M=m)=\frac{p_Op_Cq_C^m}{Z},\quad m\geq1.
\]

This accounts for both-fail restarts: if both players lack a Basic, they redraw and no bonus is awarded. If only the candidate mulligans, the opponent receives the optional cards. The bonus is drawn after the six Prizes, following the setup sequence in the supplied [Advanced Player's Manual](../../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), section I.G.

For a fixed \(m,d\), the calculation takes the complement of drawing no remover. It first conditions the opening seven on at least one Basic and zero removers, then enumerates how many of the \(R\) removers enter the six Prizes, and finally samples \(m+d\) cards from the 47-card deck remaining after Prizes. All combinations are integer-weighted and evaluated with exact Fraction arithmetic.

The script truncates the geometric mulligan tail after \(K=10\). Because exposure is monotone in the number of cards drawn, it adds the \(K+1\) exposure as the tail's lower bound and 1 as its upper bound. The maximum omitted tail mass across these lists is **3.31×10⁻¹⁰**; displayed intervals preserve the resulting uncertainty.

## Interpretation for the field panel

1. Rank 30 is the highest direct natural-draw exposure because it has three Field Blowers. Ranks 7 and 29 follow with two combined copies each.
2. Single-copy lists cluster around 12.2–13.1% after one normal draw and 13.9–14.8% after two. Copy count and Basic count both matter; the four-Basic Iron Thorns lists have materially different paired-mulligan behavior from the 14–16-Basic lists.
3. Rank 1's values here are the **direct natural-draw baseline only**. Its Forest Seal Stone/Star Alchemy, Teammates/Raihan and BC/VS recovery routes are separately treated in [the rank-1 reserve analysis](agent43-rank1-reserve-hood-recovery-20261117.md) and [Agent35's BC/VS extension](agent35-rank1-battle-compressor-vs-seeker-response-access-20261117.md).
4. Rank 7's existing all-remover model includes Faba ×2 as well as Field Blower and Megaton Blower. The generic four-card combinatorial regression reproduces its independent one-/two-draw figures (43.322411% / 47.692685%). The narrower table above counts only the two cards that can remove both exposed Hoods in one action.

This is useful for selecting rank-specific challenge scenarios and deciding where removal retention/search deserves policy coverage. It is **not** a probability that a remover remains in hand, is chosen, can legally be played in the actual board state, resolves, removes the Hoods, or wins the game. Search effects are omitted, which can understate potential access; cards used before the response window are not tracked, which can overstate retained access. The result is neither a strict lower bound nor an upper bound on successful removal.

Use this only as a field-specific scenario prior/coverage aid alongside [Agent17's opponent-policy panel plan](../../methodology/2026-11/agent17-aichi-opponent-policy-panel-plan-20261117.md) and [Agent2's challenge-suite content contract](../../methodology/2026-11/agent2-policy-challenge-suite-operational-contract-20261117.md). Do not use it as a matchup score, game weight, candidate-selection objective, or aggregate field estimate. No deck, policy, fixture, seed, CI workflow, or game was changed.

## Reproduction

Run from the repository root:

\`\`\`bash
python results/aichi-2026/2026-11/agent43-field-tool-removal-natural-access-20261117.py
python results/aichi-2026/2026-11/agent43-field-tool-removal-natural-access-20261117.py --self-test
python results/aichi-2026/2026-11/agent43-field-tool-removal-natural-access-20261117.py --json
\`\`\`

The script derives Basic counts from resources/cards/en, normalizing the Limitless ♢ symbol to the card database's ◇; it fails closed on unknown or ambiguous Pokémon names. It validates all 29 exact lists are 60 cards and that ranks 1–32 are accounted for by exact lists plus the three explicitly missing ranks. The JSON mode emits exact rational bounds and source blob hashes.
