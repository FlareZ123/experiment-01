# Rank-11 four-seed failure-inclusive public Store archive recovery (Agent 3)

**22 October 2026, native paired development replay.** Research class: original-Store provenance/abort instrumentation. **No game-policy correction, win-rate estimate, or competitive qualification.**

## Question and preregistration

Agent 50's [four fixed rank-11 independent source-deal seeds](registrations/agent50-rank11-four-new-seeds-guzma-energy-20261021.md) were executed on [the original frozen development branch](https://github.com/FlareZ123/experiment-01/tree/242b57930c67b7c733a7f0ba4911f3be9125ed79). The archived packet from [workflow 39692001898, artifact 12389041814](https://github.com/FlareZ123/experiment-01/actions/runs/39692001898) contained eight attempted arms: two completed and six engine/prompt failures. The outer caller's generic catch erased the source physical-deal digest and accepted root actions from each failed arm even though the underlying headless runner already had access to this public data. **Missing data on errors must remain part of the attempted-trial denominator.**

The [Agent 3 isolated branch](https://github.com/FlareZ123/experiment-01/tree/agent3-failure-inclusive-source-r11-20261022), at commit `2deefe83a05a292639d0f1de57fbf84e630333d9`, adds only read-only original-Store failure capture on that frozen branch, with the existing public archive serializer backported from main and concealment-safe error formatting. The opponent deck, source seed array, physical seat assignment, candidate 60, both-seat policy choices, native action code, and Twinleaf pin **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`** were unchanged.

[Native compiled replay 39705893257](https://github.com/FlareZ123/experiment-01/actions/runs/39705893257), [artifact 12394722889](https://github.com/FlareZ123/experiment-01/actions/runs/39705893257/artifacts/12394722889) contains `agent50-four-new-seed-energy-pairs.json`. The preregistered four-seed audit step **succeeded**; the overall workflow was marked failure due to the separately executed **Canceling Cologne regression**. Do not describe the whole CI run as successful.

## Original Store evidence recovered

| Fixed source seed | Control | Treatment | Common physical initial source deal | Identical accepted-root prefix |
| --- | --- | --- | --- | ---: |
| `17984023` | AttackAction `Trubbish FST / Call for Family` rejected at 178 accepted roots (turn 33) | Same rejection at 178 (turn 33) | `f097b064aeb23015d28c03e84e17d7e9cd2d552317068c0ca2c5e31410f59486` | 178 |
| `1407148205` | Completed 212 roots, winner physical seat 1, Prizes `[6,0]` | Identical completed 212-root result | `fc592a479ae5abc5bfed686134e4b5420a0dc94a7f58d2be09504e86c1597dfa` | 212 |
| `2612415444` | AttackAction `Mewtwo & Mew-GX UNM / Miraculous Duo-GX` rejected at 39 accepted roots (turn 7) | `Trubbish FST / Call for Family` rejected at 50 roots (turn 8) | `9607800bc02507ef72761e3dd4efe50f9965786b7cb3d434d77449674e022f6c` | 13 |
| `2584586627` | Strict `AttachEnergyPrompt` validation abort at 205 accepted roots (turn 53) | Same strict validation abort at 205 (turn 53) | `5eef48b200403425e60d67dd227d250ae8fb5bccae45a62e49e2ed733af50783` | 205 |

**All four control/treatment pairs now have equal original source-deal digests.** Their received original Store accepted-root histories and SHA-256 values are independently inspectable in the raw artifact. For seed `1407148205` the two completed 212-root SHA-256 values match their corresponding old-artifact values exactly. The six rejected arms preserve previously missing authentic prefix transcripts. All reported prefix lengths compare JSON native-root actions only: these ledgers omit physical targets and do **not** certify parity in target selections.

### Three distinguished failure mechanisms

1. **Full Bench Call for Family, 3 failures.** The pre-dispatch public board for both seed-`17984023` arms and seed-`2612415444` treatment shows the attacking source seat 0's Trubbish FST with **five occupied Bench slots**. The original pinned Store throws `NO_BENCH_SLOTS_AVAILABLE` instead of allowing the attack to resolve without Bench placement. Supplied Advanced Player Rulebook v3.4 §II.C-11 says an attack with a Bench-placement effect on a full Bench ends before deck search. The repository already has [specific paper full-Bench Call for Family hooks](../../simulation/twinleaf/); future same-deal remediation should use and separately qualify the existing tested hook instead of claiming a failed attempt was a loss.

2. **Spent GX allowance, 1 failure.** The accepted source-independent public root history for seed `2612415444` control shows seat 1 already declared `Miraculous Duo-GX` at action ordinal **32**, global turn **5**. The rejected native root at ordinal **39**, global turn **7**, again attempts `Miraculous Duo-GX`; the Store error is `LABEL_GX_USED`. This is an invalid bot action. Select a legal non-GX alternative or pass according to a frozen policy; the original censored arm yields no winner.

3. **Same-target Energy selection, 2 failures.** Seed `2584586627` control/treatment, both at turn **53**, follow a true `Squawkabilly ex / Motivate` `AttackAction` accepted root **203** and Wait root **204**, then produce strict `AttachEnergyPrompt` rejection at attempted action 205. The native abort receipt records `strict-prompt-validation`, `AttachEnergyPrompt`, and a SHA-256 digest of the concealed-choice-containing error. Detailed selected card printings were deliberately **redacted** from the published failure receipt. Agent 42's later [same-target opt-in correction](../../simulation/twinleaf/same-target-attach-energy-hook.cjs) is a proposed follow-up; never substitute the corrected outcome retroactively.

## Why it matters

This data diagnoses why a seemingly promising prospective four-seed comparison stopped. Previous summaries had a single surviving pair and null fingerprints on all censored pairs, which prevented controlled same-deal retry. Six true failure prefixes are now reproducible. The neutral witness changes no legal game action and no opposing policy.

**Qualification:** Four independent seed pairs attempted, two arms completed under an admitted weak retrospective policy, six aborted, **zero competitive-qualified games**, **29/32 exact source-registered Top32 60-card opponents**; no fixed 60 proven to reach the 99.5% objective. An engine failure must not be scored as a win, loss, tie, or independent alternate draw.

## Next controlled falsification

1. Freeze this exact four-seed list, physical seats, and original source deck. Resolve paper full-Bench attack behavior with the existing hook and re-run as a separate **opt-in** experiment. Preserve both error and legal arms.
2. Add and test an own-information-aware GX-spent attack veto for seat 1; verify the originally invalid ordinal 39 is replaced by a genuinely permitted typed root before advancing.
3. Use the already separately tested same-target Energy prompt correction to study the turn-53 pair. Maintain exact original physical source-deal identity, record the first changed root, and treat post-fix outcomes as new policy/engine conditions.
4. Reconcile physical target sidecar equality and the official tournament timing/decision-policy gates before any matchup strength inference.

These are suggested tasks for future research; no success claim is attached to them.
