# Agent 25: first six rank-6 source-locked diagnostics

[Manual CI 38836135424](https://github.com/FlareZ123/experiment-01/actions/runs/38836135424) uploaded verified artifact SHA256 `6d413770e52ce6e18aee5d98aabc2b7f9685445d894613e75a18fc99872458fc`. All six 60-card games ended, verified actual first turn and source/engine deck hashes. Candidate wins: champion 2/2, Hood 2/2, Temple 1/2, with one Temple loss.

**Material policy blocker:** Every one of the 12 player-seats used zero Supporters. SupporterDecisionGuard-v1 was disabled in every trial. In the champion-second trial, the Iron Thorns opponent attacked zero times. Hood-first and Temple-first each attacked once. Temple-second performed 15 consecutive Shadow Mist attacks before using two Night Watch attacks. These are default-bot pathologies, not competent adversarial matchups.

Independent-slots-v2 gave distinct seeds 20367160 and 20367161 for engine seats A/B while matching each seed across candidates. Turn order is proven by the first draw log. Re-run under an explicitly qualified Supporter and tactical policy before comparing deck strength. No win-rate claim is justified.
