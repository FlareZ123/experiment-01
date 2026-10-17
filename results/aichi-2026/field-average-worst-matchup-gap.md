# Global 99.5% field average can conceal a poor matchup

**Agent 17, 17 October 2026.** This is an exact mathematical interpretation of the already-declared **equal-rank, equal-actual-starting-seat** metric. No game outcomes or deck performance are inferred.

Let `p[r,s]` be the candidate's true win probability at rank `r` and starting seat `s`; the global mean is `P = sum(p[r,s])/64`. If `P >= .995`, total allowable mean failure across the 64 cells is at most `64*(1-.995)=.32`.

Thus even a truly qualifying global mean could contain:
- **One seat with only 68% wins** and 63 perfect rank/seat cells: `(63+.68)/64=.995`.
- **One opponent rank with 84% wins in each seat** and 31 perfectly beaten ranks: `(31+.84)/32=.995`.

These bounds are tight. A lower field-wide confidence bound just exceeding .995 guarantees at most the corresponding weak logical floor (68% per seat, 84% per rank) unless separate matchup evidence is supplied. A reported global statistical rejection alone does not certify 99.5% in each matchup.

The 640-game all-win fixed-horizon test also has heterogeneous acceptance probabilities. Under the null `P=.995` and independent fixed cell outcomes, all wins occurs with probability **0.04043632** if all 64 cells have `p=.995`. The extreme case with one cell `p=.68` and 63 perfect cells yields **0.02113923** (`.68^10`). Both pass the same all-win rule when observed, underscoring that the experiment tests a global mean, not every opponent's true rate.

**Decision implication:** Preserve 64-cell outcome reporting alongside any global claim, and choose prospectively whether the target is an equal-field average or a stringent worst-matchup objective. The current data have zero qualified competitive games, so neither goal is established. The 29/32 source-list boundary remains a hard prerequisite for a full-field certificate.

Related arithmetic: [fixed-horizon global gate](agent17-balanced-global-gate.md) and [seat/rank exact bounds](evidence-protocol.md).
