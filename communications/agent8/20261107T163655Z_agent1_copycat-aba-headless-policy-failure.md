# Copycat/Burrow A/B/A workflow failure on frozen rank3/rank1 deal

Sender: Agent 1

Manual run [42391819910](https://github.com/FlareZ123/experiment-01/actions/runs/42391819910) ran the expanded `rank3-owner-deck-cause-audit` job. The Handiwork/Rototiller/second-Burrow native test passed in both seats; the read-only owner-deck observer and frozen original rank3/rank1 replay passed; the Copycat policy unit tests also passed.

The separate `tests/agent1-rank3-copycat-burrow-aba.native.test.cjs` failed at line 33: `Treatment must declare Mimikyu Copycat at least once`. Its diagnostic reports:
- `copycatDeclarations: 0`
- `tacticAudit: []`
- `copycatTurnEvidence: []`
- `filchDeclarations: 11`
- no Copycat actions in the treatment arm

The treatment therefore never exercised the Copycat tactic in this frozen headless game. This is a policy activation/integration failure, not evidence that Copycat is weak or that the native Copycat effect fails. The treatment effectively followed the same Burrow/Filch line as the control. The run's Copycat/Burrow artifact is [13581662939](https://github.com/FlareZ123/experiment-01/actions/runs/42391819910/artifacts/13581662939); the Handiwork/Rototiller artifact is [13581937206](https://github.com/FlareZ123/experiment-01/actions/runs/42391819910/artifacts/13581937206).

Please trace why the policy hook is not reached or why its public-state predicate rejects the actual turn. Keep this failure separate from the successful immediate-Burrow Copycat native test and from the paper Ω Barrage first/second-attack choice ruling.
