# Agent 25: candidate-owned Compressor priority, genuine Store six-arm contrast

**1 November 2026 | development evidence only | original source rank 6/10/11 60s unchanged | never a competitive win-rate estimate.**

## Frozen policy and exact source protocol

[Candidate-only Battle Compressor policy was preregistered](registrations/agent25-dhelmise-v2-early-discard-policy-20261101.json) after the native baseline disclosed that one 120-action source-rank11 trace attempted 30 Dhelmise HNS attacks while only one qualifying donor was in discard. The [opt-in research-side policy](../../simulation/twinleaf/agent25-dhelmise-compressor-donors.cjs) only changes one candidate physical seat's SimpleTacticsAi tactic order and own-deck ChooseCardsPrompt response. It checks the candidate's **owner-held card**, **own visible Active/Bench**, **own discard** and **genuine own-deck search prompt**; it never sees the opposing hand or future draws. Before an existing Trainer tactic, if a Dhelmise is owned and fewer than four named HNS donors are already discarded, the candidate proposes a held Battle Compressor and prioritizes actual Banette, Shuppet, Sinistcha card objects in the public-to-owner prompt. This is not a comprehensive ALS policy.

The two arms of each pairing share the **same physical candidate 60, source original 60, seed, seat and printed-card mapping**. Source ranks 6/10/11 × candidate seat0/seat1 yield six pairs. The original Store runs remained bounded by **120 native root actions** and enforced full physical-card custody for both players. The paper HNS Ability-lock correction remained opt-in for both versions. No post hoc inclusion filter or replacement of a failed arm.

Manual native [GitHub Actions 41272861044](https://github.com/FlareZ123/experiment-01/actions/runs/41272861044) at commit `78f6b954fd2c834ba840a469b6dad98b5eed7f3f` compiled the pinned original Store, passed the 24-arm lock-control suite, and archived complete baseline and changed-decision original-60 outputs. Independently downloaded and decoded both actual artifacts:

- [Baseline archive 13069468726](https://github.com/FlareZ123/experiment-01/actions/runs/41272861044/artifacts/13069468726) SHA256 `bd0599f3a8ee18b17bbf0a841f0316b8720bf21afe6cbfe8b41d1e59c17e3843`.
- [Candidate policy archive 13069927162](https://github.com/FlareZ123/experiment-01/actions/runs/41272861044/artifacts/13069927162) SHA256 `2e31136815757b97acee720302734e47dfdc538dc12376b580999cbf57cfee88`.

Both artifacts retain exactly the same candidate ordered native SHA256 `20135b47359b2a546fbe7f899b502aff0d470150e72cbb751dd810be036e122c`; the recorded **face-up first-turn Active and Bench states match in all six pairs**. Matching this public board is weaker than a full physical hand, Prize and deck-order identity attestation. Later deal/policy event paths may diverge.

## Native comparison

In each row, the HNS statistic is the `rawNamedDonors` sum observed across `countChecks` actual printed attack reducer invocations. A quotient of four **does not prove every individual attack had four donors**.

| Source rank | Candidate seat | Baseline status: roots, HNS sum / checks | Candidate-only new policy: roots, HNS sum / checks | Remaining Prizes baseline → policy (seat0, seat1) |
| --- | --- | --- | --- | --- |
| 6 Iron Thorns | 0 | Untimed engine terminal 80; 0/0 | Same terminal 80; 0/0 | (2,6) → (2,6) |
| 6 Iron Thorns | 1 | Capped 120; 0/6 | Capped 120; 0/6 | (5,6) → (5,6) |
| 10 Regidrago | 0 | Capped 120; 0/3 | Capped 120; **12/3** | (4,6) → **(6,6)** |
| 10 Regidrago | 1 | **Native settled-card conservation exception** | **Same class of exception** | no valid terminal |
| 11 Mega Absol/Garbodor | 0 | Capped 120; **30/30** | Capped 120; **60/15** | (4,6) → **(1,5)** |
| 11 Mega Absol/Garbodor | 1 | Capped 120; 0/0 | Capped 120; 0/0 | (5,6) → (6,6) |

**Strategic inference is mixed:** rank11 seat0 advances from average one to four HNS donors during actual native attack checks and reaches one Prize remaining for the candidate within the same action cap. Rank10 seat0 also gains access to four donors on average, yet reaches no recorded Prize gain by the action cap, compared with the original bot reaching four remaining. The new Compressor path may consume scarce actions or change later legal reachability; the values alone cannot attribute causation to optimal discard timing. Neither observation demonstrates a win, especially against a competent source-policy opponent.

In source-rank6 seat1, **zero HNS donors counted both ways** despite an HNS attack being invoked six times, consistent with continuing failure to realize the Item-based opening against the source's ability-lock strategy. Opponent active lock status and actual Item legality were not proven here. The unchanged rank6 seat0 native terminal happens without a single HNS attack invocation, so it provides no evidence of the new policy's intended effect.

Both versions of rank10 candidate-seat1 reproduce the same hard-fail `TWINLEAF_SETTLED_PHYSICAL_60_VIOLATION` and cannot be scored. The candidate-only version's saved forensic witness identifies the **79th actual Store root**, global turn 13, `ResolvePromptAction` made by candidate seat1, after which **original source seat0 has 59 physically located cards** with neither temporary prompt custody nor duplicated or ghost Energy. [Separate frozen same-seed physical investigation](registrations/agent25-rank10-native-physical60-custody-fork-20261101.json) removes this *assertion only* to observe the actual subsequent source root without qualifying any terminal.

## Conclusion and next action

This is a genuinely executed **same-source, same-printing, same-seed experimental policy fork** with reproducible positive and negative consequences. The source ranks and opponents are unchanged and all six pairs are explicitly retained. It is **not a causal paired-physical-deal guarantee, a fully strong bot, a rules-certified engine, or game win-rate evidence**. The known one-card physical disappearance makes rank10 seat1 invalid. The 120-action cap makes the other unfinished games invalid as completed match samples. The two terminal arms are both the same weak-policy Iron Thorns example, with no HNS check.

Future native experiments should preserve **per-attack HNS donor count histogram and discard source events**, distinguish consumption of Blender versus Compressor, verify legal opponent tool-lock resolution, and include a direct source opponent action response. Full benchmark unchanged at **29/32 authenticated original source lists, zero competitively qualified games, no supported 99.5% target**.
