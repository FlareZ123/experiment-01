# Agent 17: engine-terminal winner attribution for the frozen v2 fixed-deck comparison

**1 November 2026 | read-only decomposition of the completed original Agent41 32-arm v2 archive.** The explicit question is whether its 19 developmental engine terminals discriminate between unchanged **rank-1 Shadow Rider reference** and **New Moon Lockbreaker v1**, rather than merely indicate that the opponent policy improved. All win labels below are *native untimed Store outcomes under weak unqualified actors*, never competitive match wins.

## Frozen evidence

- Original CI [41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584), [artifact 13072623187](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584/artifacts/13072623187); complete ZIP SHA256 \`cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b\`.
- Source original rank6 Iron Thorns and rank11 Absol/Garbodor, candidate lists each used unchanged across four original seed indices and two actual physical candidate slots. Native \`winner\` was checked against the record's actual \`sourceSeat\` and \`candidateSeat\`; unfinished 260-action cases remain **censored**, never wins.
- The previously published [Agent41 v1→v2 policy treatment](agent41-frozen-bilateral-v2-32-original-source-energy-20261101.md) improved rank6 source Energy play/attacks substantially. This is the same **exploratory v2 cohort**, not a fresh experiment.

## Actual owner-attributed terminals and all censored attempts

| Original source rank | Fixed candidate | Source engine terminals | Candidate engine terminals | Censored / action capped | Total |
| --- | --- | ---: | ---: | ---: | ---: |
| 6 Iron Thorns | Shadow Rider reference | 3 | 0 | 5 | 8 |
| 6 Iron Thorns | New Moon Lockbreaker | 5 | 0 | 3 | 8 |
| 11 Absol/Garbodor | Shadow Rider reference | 3 | 2 | 3 | 8 |
| 11 Absol/Garbodor | New Moon Lockbreaker | 4 | 2 | 2 | 8 |
| **Total** | **Both fixed 60s** | **15** | **4** | **13** | **32** |

Both candidate lists have **zero candidate-native terminals** against original rank6 in the v2 repaired-source cohort. This is a serious **developmental threat signal** worth including in future structural deck-screening hypotheses, while any claimed real competitive rank6 loss probability would be unjustified. Rank11 candidate terminals tie at two apiece; no support for choosing the stronger deck.

### Censor-sensitive descriptive bounds

Even if the engine-terminal \`candidate\` label were a competent competitive win (it is not), the uncensored candidate-terminal fraction alone cannot summarize an attempted cohort. Giving **every capped game its unknown outcome**, the logically sharp descriptive candidate-outcome range per original rank is:

| Native source | Fixed candidate | Observed candidate-terminal fraction | Full-data fraction with censored arms arbitrary |
| --- | --- | ---: | ---: |
| rank6 | Shadow Rider | 0/8 | **0% to 62.5%** |
| rank6 | New Moon | 0/8 | **0% to 37.5%** |
| rank11 | Shadow Rider | 2/8 | **25% to 62.5%** |
| rank11 | New Moon | 2/8 | **25% to 50%** |

These intervals reflect only the finite set of **eight already-selected developmental engine deals** for each source/candidate pair. They are logical missing-outcome bounds, **not sampling-confidence intervals**, posterior estimates, prospective rates, or paper-tournament results. They overlap for both candidates at both sources. A competitor's action cap should be resolved as an explicit clock/policy state in later registered data rather than silently interpreted as a loss or win.

### Opponent-start and matched-source-deal discipline

Rank6 source actually starts first in four of eight games per candidate. Shadow Rider's three original-source engine terminals all occur **source-first**; New Moon's five source terminals include **four source-first and one source-second**. Rank11 original-source engine terminals are three for Shadow Rider and four for New Moon; candidate engine terminals are two each. A native start is a separate axis from which physical side the candidate deck occupies.

There are **16 nominal original rank × seed × physical candidate-side pairs** across the two fixed decks. In **14/16** the pairs have the **same complete original source-deal SHA** and the same actual source first-player status; the two mismatches are both rank11, **seed 0 side B** and **seed 3 side A**. Equal integer seed and shared source rank are insufficient proof that the original source physical deal stayed identical in those two cases. The candidate's own physical deck and deal are inherently different between the candidate lists even on the 14 source-matched pairs.

Among all 16 nominal pairs, **zero pairs finished as opposite-sided candidate/source engine winners**, so there is **no direct decisive both-terminal deck reversal**. At rank6: three both-source-terminal pairs, three both-censored pairs, two source terminal for New Moon versus champion capped. At rank11: three both-source-terminal pairs, one both-candidate-terminal pair (different source deals), one both-censored pair (different source deals), one champion capped versus New Moon source terminal, and two cases where one candidate terminal opposes the other's action cap. These are descriptive correlated observations, not an estimate of either deck's strength.

### New independently reproduced original-field prompt blockers

Agent12's [rank6 Camping Gear original-Store fixture](agent12-source-rank6-campinggear-paper-prompt-20261101.md) shows the native Store can accept a zero- or two-card reply to a printed unrestricted one-card search without its guard. This separate fixture does not establish a corresponding defect in any v2 archived Camping Gear action. The [rank11 Night Watch study](agent12-night-watch-random-selection-paper-gap-20261101.md) shows the generic actor can choose opponent concealed-hand cards despite the printed attack requiring random selections. The v2 archive includes **nine** such Night Watch prompts across two long-game arms. Neither defect is established to reverse an archived winner, but both make any competitive interpretation of the present engine-terminal totals especially unsafe.

### Both New Moon candidate-native rank11 terminals encounter the Night Watch random-selection paper defect

Independently joining all nine `Night Watch` `ChooseCardsPrompt` resolutions in the original frozen v2 ledger to actual initiating attack roots, selecting actor seat and ultimate native terminal **puts every one of the nine in the only two rank11 New Moon candidate-terminal games**:

| New Moon native candidate terminal | Candidate-seat Night Watch opponent-hand selections | Source attack competence context |
| --- | ---: | --- |
| `11:0:B:new-moon-lockbreaker-v1` | **4**, source owner opponent hand selected | Source had **zero** recorded attack declarations |
| `11:2:A:new-moon-lockbreaker-v1` | **5**, source owner opponent hand selected | Source Trubbish made **18 full-Bench Call for Family no-op attacks**, including **17** with printed Super Poison Breath base-payable |
| **Combined** | **9** in two New Moon terminal games | **Both games remain competitively unqualified** |

[Agent12's independently sourced printed-randomness defect](agent12-night-watch-random-selection-paper-gap-20261101.md) establishes that printed `Night Watch` requires random opponent-hand discards, while the pinned native generic resolver can inspect and score concealed physical hand cards when choosing. The nine accepted native replies actually returned two concrete opponent hand cards each; no cryptographically independently recorded random selection witness accompanies them. **We cannot conclude the actual picked cards differed from a particular possible random draw**, nor that the two game winners would reverse. The factual causal limitation is important: both New Moon native candidate-terminal games were exposed to a **known paper-randomness mechanism defect**, and one additionally had a demonstrably ineffective opponent attack policy. Consequently **zero** of New Moon's two historical candidate terminals against rank11 is an independently paper-qualified competitive victory. Do not use those two terminals to claim advantage over Shadow Rider.

## Deck decision

The v2 native policy's repair makes the original rank6 source more consequential, and both fixed candidate lists fail to produce a candidate terminal within their eight respective development arms. The overall v2 **19/32 engine-terminal** increase is driven by developmental game completion and source wins, not a demonstrated candidate upgrade. Any deck selection that interprets increased terminal count as candidate improvement would invert the actual winner mapping.

**Recommendation for follow-on evidence:** after the shared paper-prompt and two-player policy gates, register a small **new exact-source cross-archetype fixed-60 comparison** with both actual starter orders, independent source opening fingerprints, native opponent replies, all caps/errors, and at least one untouched holdout rank. Keep the two candidate physical deals distinct. Do not rank New Moon above Shadow Rider, or vice versa, on the frozen v2 results.

**Qualification:** 29/32 exact source 60s, 0 competitively qualified games, no demonstrated field-level 99.5% win rate.
