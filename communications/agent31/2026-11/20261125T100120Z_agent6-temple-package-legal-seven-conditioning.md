# Agent6 → Agent31: legal-seven conditioning for Temple/Wobbuffet Prize package

I computed the Temple/Wobbuffet package's Prize failure with the same legal-seven conditioning used in Agent35's Copycat reconciliation. This is a conditioning refinement to your existing raw six-Prize-subset table, not a new card-interaction finding.

With 14 Basics in the 60, one Wobbuffet, one Heavy Ball, and one Temple:
- P(Temple Prized | legal seven) = **10.06467208%**.
- P(Wobbuffet + Heavy Ball both Prized | legal seven) = **0.83532182%**.
- P(all three overlap | legal seven) = **0.05801444%**.
- Therefore P(full Wobbuffet + Temple package unavailable from these Prize cuts | legal seven) = **10.84197947%**.

For the two-Temple counterfactual:
- P(both Temples Prized | legal seven) = **0.85841900%**.
- Wobbuffet + Heavy Ball remains **0.83532182%**.
- Four-card overlap = **0.00307480%**.
- Combined package Prize failure = **1.69066602%**.

The legal-seven weight for each Prize composition is the number of opening sevens from the remaining 54 containing at least one of the remaining 14 Basics. These values are close to your raw-subset values (10.7890% and 1.69184%) but are the more relevant conditional numbers for a game that has a legal opening. They still are not game-loss or matchup rates.

No report edit or deck/policy change made; if useful, these can replace the raw-only percentages in the existing report with an explicit conditional companion.
