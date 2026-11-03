# Agent 41: independent rank-6 native resource-to-Prize chain audit (3 November 2026)

**Finding:** Across the four originally registered, frozen Iron Thorns rank-6 native attempts, a conservative, read-only Store-evidence gate verifies **two native source chains** spanning Guzma & Hala, Thunder Mountain Prism Star, Double Colorless Energy, a Volt Cyclone attack, a one-Prize gain and the immediate opponent Pass. The other **two registered attempts** do not select this specific Guzma & Hala root. All four remain **paper/competitive unqualified**. This is an independent postprocessor of a prior native artifact, not a fresh game or deck-performance estimate.

## Exact source and reproducibility

The underlying immutable profile is [Agent20's frozen rank-6 source canary](agent20-frozen-bilateral-rank6-canary-release-v1-20261102.md). The original [compiled GitHub Actions run 41465829225](https://github.com/FlareZ123/experiment-01/actions/runs/41465829225) archived artifact 13151571539. ZIP SHA256: 19bb6b149afabc9b27c13707a2fa39421038fdcbdfe6da159659b692c19df3a2. Extracted JSON SHA256: 6976c0063384a61e438a9e601fc3e4c1447fa7a25446c5341f213a0d032d39e7.

Actual checkout: 133f507e14e3b51ee95dd2488b1917f13ec07c86. Pinned Twinleaf: a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. Original source printed-60 fingerprint for all arms: b50e4cf27c449653cf9c61e4e830b7a3d61f9b1c7e42a7dfd2d781a1c6e6895a.

The [machine audit](../../simulation/evaluation/agent41-rank6-source-chain-native-audit.cjs), [15 locally passing regressions](../../tests/agent41-rank6-source-chain-native-audit.test.cjs), and [small evidence projection](agent41-rank6-source-native-slice-v1.json) are independently inspectable. The projection removes unrelated Store events while retaining the exact reported early source roots and sidecars; it is not the full game transcript. The full original Actions artifact remains authoritative for the omitted decisions. Applying the gate to the original untrimmed four rows reproduced the same statuses.

## All registered attempts

| Trial | Actual source seat / game starter | GH / Stadium / DCE / attack / candidate root ordinals | Status |
| --- | --- | --- | --- |
| 6:0:A:champion-reference | B / B | 21 / 28 / 29 / 30 / 36 | Native settled, opponent Pass, paper unqualified |
| 6:0:A:new-moon-lockbreaker-v1 | B / B | 19 / 26 / 27 / 28 / 34 | Native settled, opponent Pass, paper unqualified |
| 6:1:B:champion-reference | A / B | No qualifying GH sequence | Specific GH root unselected, other tactics unassessed |
| 6:1:B:new-moon-lockbreaker-v1 | A / B | No qualifying GH sequence | Specific GH root unselected, other tactics unassessed |

Both native-positive cases selected Crushing Hammer POR and Team Flare Grunt XY for the two-card hand-payment prompt, selected Thunder Mountain Prism Star LOT and Double Colorless Energy SUM from the original-source deck, played Stadium and Energy, then declared Volt Cyclone. The native public board immediately before attack places Double Colorless Energy on the **Active Iron Thorns ex** with the relevant Stadium in play. Native attacks settled within their clock epoch, the source Prize count changed 6 to 5 and the opponent's next accepted root was Pass on the following global turn. The original source deals matched between candidate arms within each seat cohort. The two source-seat-A cases started second, so this is not a balanced GH opportunity comparison.

## Independent vetoes and limitations

The gate requires exact printed deck identity, real player seats and starter, accepted original physical-root printing, same-owner prompt children, a two-name hand payment choice, the relevant source deck search, ordered Stadium and DCE roots, an actual Active recipient, a native attack declaration and settled Prize delta, and an actual immediately following opposing root. The 15 regressions include wrong payment seat/count, lost or misallocated DCE, lost Stadium, mismatched Prize records, clock-reset disagreement, and fabricated opponent reply.

**Critical qualification limit:** The original archived prompt contains **selected cost names** without an independently verified, exact post-dispatch owner-hand-to-discard custody transition in this specific four-row audit. Native Store acceptance alone cannot establish paper-valid cost. [Agent7's separately recorded live source custody witness](agent7-natural-rank6-ghala-custody-to-pass-reply-20261102.md) must not be silently grafted onto this archive. [Secret Box's zero-payment Store defect](agent4-secret-box-twm-native-three-card-paper-cost-20261102.md) makes that distinction material. The gate always outputs physicalDiscardCustodyVerified=false, paperGameQualified=false and competitiveGameQualified=false. The complete attack text, 25-minute tournament clock, owner-only AI information, and opponent reply competence remain unqualified. An opposing Pass is chronological evidence, not competent opposition.

## Decision use

Use this exact four-arm positive/negative packet as a **native resource-to-payoff regression** for a genuinely selected symmetric two-seat common policy. A later policy that reallocates DCE or changes root/prompt choices must account for the changed physical chain. For overall field decisions, still require joint native source-policy qualification of ranks 5 and 11 with the existing negative Quick Ball and Active/Bench recipient controls, all paper-payment guards and the whole original Top32 field. The research remains at **29 of 32 authenticated source sixties, zero competitively qualified games and no defensible final deck**.
