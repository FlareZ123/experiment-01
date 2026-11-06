# Frozen original-source owner-root audit: why the generic funded Float Stone A/B had no selected actions

**Agent14 | 6 November 2026 | developmental native evidence only.** This is a retrospective **observer-only** replay of the twelve original-source control attempts registered for the [4 November prospective Float Stone A/B](agent14-prospective-generic-funded-floatstone-zero-activation-20261104.md). It changes no root choice, registered card list, paper claim, or selected Issue #25 policy.

## Question and original registration

The [pre-execution 12-pair A/B](registrations/agent14-prospective-generic-funded-floatstone-20261104.json) had twelve unchanged native root action sequences after enabling a conservative, source-independent Float Stone helper. Did it fail to activate because the actual owner-visible on-policy states never passed that helper's full opportunity predicate?

A read-only observer was inserted at the actor-owning root in [the existing shared actor policy](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) and exposed through the [registered replay runner](../../simulation/evaluation/agent14-generic-funded-floatstone-census.cjs). The replay uses the same twelve previously registered original-rank **1, 11 and 30** physical seed/candidate-slot groups, including both historical contender 60s. The native helper remains **OFF** and the same frozen bilateral policy runs in both seats. The observer reads the detached current owner's hand/public board and calls the same conservative proposal as a non-mutating predicate. The pinned Twinleaf commit is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Native evidence and reproducibility

- [Full compiled successful manual-only GitHub Actions run 41886926766](https://github.com/FlareZ123/experiment-01/actions/runs/41886926766), research HEAD `5104b6cd90cce98ffeaee375b52f75817b1cf999` from 4 November 2026; native root observer and full pinned-engine build completed.
- [Archived JSON artifact 13350954583](https://github.com/FlareZ123/experiment-01/actions/runs/41886926766/artifacts/13350954583); uploaded ZIP SHA-256 `368fee1ce374f6a9d88752a33fc95e57215f818f7fb732f3ece06803c244d56d`, as printed by the Actions artifact uploader. This checksum is from the CI log and has **not** been independently rehashed from downloaded bytes in this continuation.
- The observed SHA-256 of the ordered twelve triples `[registered trial ID, real root ledger digest, full physical deal fingerprint]` was **`cf2722c6fbd637a43c20a05dcc4a0d26cae7f1171d5cb2ecdab229ddee65b4b6`**, exactly equal to the earlier preregistered control archive fingerprint. The runner asserts all twelve rows and the nested actor root census before producing the report.
- The [first manual CI attempt 41886502236](https://github.com/FlareZ123/experiment-01/actions/runs/41886502236) failed because the runner read the wrong nested audit field, yielding `missing actor owner-root census`. A later source fix used `row.actorOnlyDecisionCoverage.detailedComponentAudits.root.genericFundedFloatStoneAudit`; this was a **report-extraction bug**, not evidence of a native gameplay change.

## Observed owner-root denominator

| Owner-root event | Count across 12 real native attempts |
| --- | ---: |
| Actor-owned root observations, both physical seats | **565** |
| Owner holds printed `Float Stone BKT` | **84** |
| Owner's Active has printed Float Stone already attached | **0** |
| Owner's Active has at least one Energy card attached | **410** |
| Full conservative proposal returned a non-null Float Stone intent | **0** |
| Held/attached Float Stone roots where that proposal declined | **84** |
| Helper selected as native intent | **0** |

The 84 hand-held observations partition across source-rank pair groupings as **13** in rank 1, **51** in rank 11, and **20** in rank 30. All twelve original-trial groups had zero helper-eligible owner roots, including both physical seats. The native endings matched the prior control: **ten engine game endings and two action-limit censors**. There were **zero competitively qualified games**.

These are **root observations, not distinct hands, independent draws, games, or probability estimates**. A held Float Stone can recur across many root decisions. The "Active has Energy" event need not overlap with the "Float Stone held" event; the aggregate counters cannot establish that conditional co-occurrence.

## Interpretation, with explicit scope

This is a direct non-interventional explanation for the **zero observed root-action differences** in the prior twelve A/B pairs: at no observed root did the exact helper's conservative eligibility test return an intent. A lower-priority-policy explanation is therefore unnecessary for these replays. That conclusion is limited to the registered twelve frozen physical original-source attempts, the recorded owner-root observations, and **this exact helper**.

The helper excludes opportunities outside its design: it requires a nonzero-cost partially funded Active, an unused retreat, no payable Active attack, a payable Bench attack with **at least 80 nominal projected damage**, publicly acceptable conditions/Tools, and held or already-attached Float Stone. It does not evaluate zero-damage control, deck-out, Prize routes, later energy acceleration, alternate attack effects, or all lock/retreat edge cases. [Agent2's separate printed Bunnelby Burrow deck-out fixture](../methodology/agent2-rank3-fss-float-bunnelby-native-20261104.md) is an existing counterexample to treating the 80-damage threshold as a complete tactical-value measure.

Do **not** conclude that natural-paper Float Stone opportunities are absent, that the owner bots are competent, or that Float Stone is generally unimportant. The native engine has known paper-fidelity gaps, including the [Tool Jammer/Float Stone counterexample](agent6-tool-jammer-floatstone-native-fidelity-20261102.md). The evidence does not modify the current fixed-60 selection gate, demonstrate a matchup win rate, or certify a complete official-timed paper game.

## Compiled independent held-gate decomposition, 6 November addendum

To determine what the zero helper activations conceal, a **second read-only replay** added a separate per-gate observation classifier, [`agent14-floatstone-held-owner-gates.cjs`](../../simulation/twinleaf/agent14-floatstone-held-owner-gates.cjs), invoked only at acting-owner roots holding printed Float Stone. It computes individual owner-public facts independently of the original chosen helper and leaves that helper disabled. The [six pure regression tests](../../tests/agent14-floatstone-held-owner-gates.test.cjs) cover positive paid attackers, missing board resources, below-threshold yet payable moves, Tool/retreat locks, absence of Float Stone and hidden-zone Proxy denial.

**Compiled manual native run [42142112624](https://github.com/FlareZ123/experiment-01/actions/runs/42142112624), SUCCESS, 6/6 pure tests**, research HEAD `b7702a961fae0071315747f0712849e9deafb134`, same pinned upstream commit. Its [archived structured JSON artifact 13466744580](https://github.com/FlareZ123/experiment-01/actions/runs/42142112624/artifacts/13466744580) has Actions-uploader ZIP SHA-256 `8705ed553e0f53287b736960c246b70e7f4ee88bd6032a243ff042c9a83c46db` (uploader-reported, not independently rehashed here). **The same ordered 12-trial full-deal/native-ledger SHA `cf2722c6fbd637a43c20a05dcc4a0d26cae7f1171d5cb2ecdab229ddee65b4b6` was independently reproduced a second time.** Gameplay selections, trial IDs, source/candidate printed decks, first-player and known native endings are unchanged.

| Independent condition, restricted to the **84 held-Float-Stone owner roots** | Satisfying roots |
| --- | ---: |
| After global turn 1 | 84 |
| Any occupied owner Bench slot | 75 |
| Any Energy attached to owner Active | 70 |
| Owner Active has positive printed Retreat Cost | 84 |
| Owner Active Tool slot is empty | 84 |
| Once-per-turn retreat remains unused | 84 |
| No visible Tool-play lock | 84 |
| No recognized Jamming Tower or opponent Active Tool Jammer | 84 |
| Any Energy attached to a Bench Pokémon | **18** |
| At least one Bench attack payable under **public recognized Energy-cost model**, regardless of damage | **15** |
| At least one recognized payable Bench attack with **nominal projected damage >=80** | **0** |
| All coarse structural gates (including >=80 payable Bench attack) | **0** |

These flags **overlap and are not mutually exclusive**; they do not partition 84 into different games or hands. The old aggregate's 84 held Float Stone versus 410 energized Active ambiguity is now partially resolved: **70** of the 84 held-Tool owner roots had an energized Active. The decisive missing eligibility witness is a Bench attack that the *conservative model* recognizes as both Energy-payable and at least 80 nominal damage. The 15 model-payable Bench-attack roots establish a concrete class that the helper's hard damage threshold can exclude; the data do not say their attacks had beneficial control, could legally resolve under every paper effect, or were preferred to existing options. Nor does zero recognized >=80 exclude high-damage attacks with unimplemented multipliers or other complex effects.

The observed obstacle is therefore predominantly in the **funded Bench payoff recognition and hard damage threshold**, rather than an ordinary inability to hold Float Stone, a used retreat quota, a filled Active Tool slot, a public Tool Jammer, or a general Turn 1 restriction. This conclusion is specific to the recorded actor-root population and the enumerated public gate model. No player-choice policy was improved, no new payoff was native-settled, and zero competitive games remain.

**Research consequence:** A new Float Stone priority-tuning A/B on these same deals has little information value without first broadening and independently validating the actual owner-visible opportunity definition. For the common Issue #25 release, prioritize **paper-paid source attack/control payoffs, competent opponent counterplay, physical provenance, and independent rule fidelity**. Preserve the original 12-pair negative trial and this replay as a bounded non-activation example.
