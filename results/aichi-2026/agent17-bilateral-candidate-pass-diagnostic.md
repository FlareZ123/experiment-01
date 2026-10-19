# Historical bilateral candidate Pass evidence: bounded v0 diagnostic

**Agent 17, 19 October 2026 UTC.** This is retrospective policy development, not a competitive matchup or paper-rule verdict.

## Provenance and protocol

- The original completed four-arm development CI was [39234692630](https://github.com/FlareZ123/experiment-01/actions/runs/39234692630), head 516dd592. The additive extraction rerun [39267601867](https://github.com/FlareZ123/experiment-01/actions/runs/39267601867) PASSED with no engine errors, at head 786b6195; the archived raw artifact is 12194160319.
- The new, **cheap archive-only** [CI 39268514180](https://github.com/FlareZ123/experiment-01/actions/runs/39268514180) PASSED after a fixed YAML escaping defect in first attempt 39268385045. It downloaded the existing artifact without recompiling Twinleaf or rerunning any match, and surfaced exact Perfection rejection codes.
- Four historical arms were two candidate-deck comparisons on each of only two original source deals: rank 6 Iron Thorns, rank 11 Absol/Garbodor, all candidate-first. Fixed opponent 60s, pinned Twinleaf a9905a76, and common added candidate policy agent41-bilateral-common-resource-policy-v0. Both New Moon and champion reference were examined under the same added candidate policy. These are retrospectively selected development fixtures.
- Reusable extractor: scripts/aichi-bilateral-pass-evidence-summary.cjs, regression tests: tests/aichi-bilateral-pass-evidence-summary.test.cjs, manual archive-only workflow: .github/workflows/aichi-bilateral-pass-archive-audit.yml. Two tests passed in compiled and archive-only jobs.

## Actual archived decisions

| Historical matchup and candidate | Store attack declarations | Candidate Pass choices | Printed Pass probes | Accepted printed clone announcements | Perfection probes | Accepted Perfection clones |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Rank 6, reference | 3 | 1 | 1 | 0 | 0 | 0 |
| Rank 6, New Moon | **0** | **17** | **4** | **0** | 0 | 0 |
| Rank 11, reference | 1 | 14 | 3 | 0 | 0 | 0 |
| Rank 11, New Moon | **0** | **24** | **3** | **0** | **4** | **0** |

Rank-6 New Moon was Active Latias ex on the turn-1 and turn-3 sampled Pass decisions (Eon Blade rejected), then Galarian Articuno V on turn 5 and turn 7 (Psyray rejected). No Perfection sample there had active Mewtwo & Mew-GX. The **other 13/17 Pass choices had no printed-attack probe**.

Rank-11 New Moon had active Mewtwo & Mew-GX for sampled turn-1, turn-3 and turn-5 Pass decisions; printed Miraculous Duo-GX announcements were all rejected. Separately sampled detached Perfection activations at **turns 1, 3, 5 and 7** all yielded **CANNOT_USE_POWER**, activationAccepted false, no attack-choice prompt, and an empty copied-attack menu. The **other 21/24 Pass choices had no printed-attack probe**, and Perfection sampling was capped at four.

All five or fewer reference Pass samples were likewise unaccepted for printed attacks. Consequently, none of these early bounded probes demonstrates an obvious missed accepted attack. Rejection is compatible with many different setup, lock, and engine reasons. It is not proof that a stronger legal continuation was unavailable.

## Decision and limits

The New Moon zero-attack behavior is a serious actual-game bottleneck under this frozen generic policy. Rank 6 visibly suffered non-Mewtwo Active positioning in the sampled early turns. Rank 11 had Mewtwo Active but the pinned engine refused the sampled Perfection Ability. **CANNOT_USE_POWER does not identify its cause**: check publicly visible lock status and physically present copying payloads separately against the real source state before attributing the rejection to Garbotoxin or resource absence.

The underlying headless engine captures no more than eight bucketed printed/Tool attack probes *across both players* and no more than four Perfection probes for the candidate seat. Each is a **post-choice detached cloned-Store observation**. It proves neither full paper legality nor a resolved attack or missed optimal play. These historical pairs were candidate-first and cannot establish both-start performance. No independent replay root digest comparison was performed in this investigation.

The next useful research step is a source-conserved owner/public-board diagnosis of the four rank-11 Perfection rejections and a separate rank-6 pivot/energy diagnosis, followed by fresh preregistered both-start bilateral policy tests across more hard archetypes. Preserve full failed-game denominators and official-clock limits.

**Fixed-field status unchanged:** 29/32 exact Top 32 sources, zero competitive-qualified games, and no demonstrated 99.5% target.
