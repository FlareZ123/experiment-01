# Preregistered rank6 first-player coverage: eight independent source seeds, both seats, true native opening receipts

**Agent 7 | 2 November 2026. 16 native games, eight independent source seed cohorts, zero paper/competitive games qualified.**

## Question

An earlier four-seed Lillie-after-Pass experiment placed the candidate in both physical seats, but every native game happened to start with **physical seat1**. That sample confounded the candidate's physical seat with whether the candidate actually took the first turn. Rather than interpreting seat effects from that accident, preregister eight genuinely fresh, unfiltered source seeds, physically place both fixed candidate lists on each planned seat, and record accepted coin-flip, first-player choice, the actual first turn and the first-draw log. No behavioral intervention, card swap, or post-observation seed replacement.

## Registration and pinned execution

[Registration](registrations/agent7-rank6-starter-seat-coverage-20261102.json), committed `d857a80` *before* any native game, lists eight independent CSPRNG `secrets.randbits(32)` draws: `652911886, 3344886974, 136643745, 3556454342, 3140915274, 4147346438, 3339792625, 802103465`. The first four assign candidate physical seat A (native seat0), the latter four seat B (native seat1); every seed includes both original fixed candidate 60s (Champion reference and New Moon lockbreaker) and the unchanged original rank6 source printed 60. **16 registered actual games** use the unchanged selected `agent20-frozen-rank6-canary-v1` 86-option native policy, frozen SHA256 `6ff3ee325098cfc68253928a9dd5370da52c9cc64b86a4435be2b07a0d392dc6`, with no alternative root policy.

Manual-only pinned [compiled GitHub Actions run 41487506830](https://github.com/FlareZ123/experiment-01/actions/runs/41487506830) **SUCCESS**, source checkout head `46c171112f3eccad4f97fcdb5bc524a566333b17`, Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Full raw native artifact 13163370171](https://github.com/FlareZ123/experiment-01/actions/runs/41487506830/artifacts/13163370171), ZIP SHA256 `eca1769f3c221ff0c591a1286201f148493dd7971bb2e66ddf0795fe89fb4fd7`. Runner `simulation/evaluation/agent7-rank6-prospective-starter-seat.cjs`; manual workflow `.github/workflows/agent7-rank6-starter-seat.yml`.

The native Store's first-turn observer is verified against the first turn's actual draw log in **16 of 16** games. An independent native setup observer also captured all **16 accepted initial coin prompts and 16 accepted `GO_FIRST` choices**, without passing these receipts into the bot policy. Each pair of different candidate 60s under the same seed preserved an **exact source physical-deal fingerprint and the same first-player slot** in **8/8 seed groups**, verified from the machine output.

## Actual unique source seed opening matrix

Each row represents one actual source physical seed, used against two different fixed candidate 60s; duplicate candidates in a row must not be counted as independent coin flips.

| Cohort | Seed | Candidate physical seat | Native coin winner | Winner selected | Actual first seat | First player |
|---|---:|---|---|---|---|---|
| `6:80:A` | 652911886 | 0 | 0 | Second | 1 | Source |
| `6:81:A` | 3344886974 | 0 | 0 | Second | 1 | Source |
| `6:82:A` | 136643745 | 0 | 1 | Second | 0 | Candidate |
| `6:83:A` | 3556454342 | 0 | 0 | Second | 1 | Source |
| `6:84:B` | 3140915274 | 1 | 0 | Second | 1 | Candidate |
| `6:85:B` | 4147346438 | 1 | 1 | Second | 0 | Source |
| `6:86:B` | 3339792625 | 1 | 1 | Second | 0 | Source |
| `6:87:B` | 802103465 | 1 | 1 | Second | 0 | Source |

The coin-winner distribution was **4 seat0 / 4 seat1** across eight independent source seeds, while the setup bot consistently selected **to go second** for the coin winner in all eight source openings. Because the chosen player goes second, starter seat is the opposite of the coin winner. This produced **six source-first cohorts** and **two candidate-first cohorts**, and the full crossed matrix was observed at least once in each physical candidate position.

| Candidate physical seat | Candidate starts first (games; independent cohorts) | Source starts first (games; independent cohorts) | Total |
|---|---:|---:|---:|
| 0 | 2 games; 1 seed | 6 games; 3 seeds | 8 games; 4 seeds |
| 1 | 2 games; 1 seed | 6 games; 3 seeds | 8 games; 4 seeds |
| Total | 4 games; 2 seeds | 12 games; 6 seeds | 16 games; 8 seeds |

The original runner produced **seven native engine-game-end dispositions** and **nine action caps** across 16 games. Neither native outcome counts nor turn-order distributions establish paper wins or deck superiority.

## Interpretation

The previous four-seed `actualStarterSeat=1` finding was **a sample coverage limitation**, rather than verified proof that Twinleaf always makes seat1 play first. Fresh preregistered seeds produced both first players in both candidate physical positions with accepted setup receipts and verified first-draw logs. Nonetheless, only one independent seed cohort per physical candidate seat had the candidate go first in this trial, making estimates of a causal first-turn advantage highly uncertain.

A **coin winner always choosing second** was directly observed across these eight source cohorts. This is a behavior of the current native selected setup policy in the sampled games. Whether choosing second is strategically optimal for the original 60s is an open research question, and no paper-rule violation is inferred.

For future fixed-deck evaluations, preserve native coin outcome, chooser, choice, actual first player, physical seat, exact original-source physical deal, and action cap as distinct fields. Pairing equal seeds does not replace inspecting actual initial deals and starter receipts. Posthoc balancing by discarding unfavorable coin outcomes must never be represented as an unselected test.

**Conclusion:** first-player/seat coverage is now directly measurable and represented in both orientations; the source 60 remains paper legality and competitive-policy unqualified, with no progress claim toward an established 99.5% full-field win rate. The roster remains 29 of 32 authenticated original printed sixties.
