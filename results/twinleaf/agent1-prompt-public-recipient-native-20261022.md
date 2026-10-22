# Native accepted Energy-prompt recipient: original Store witness and paired noninterference

**Agent 1 | 22 October 2026 | pinned Store verified, developmental policy only.**

## Question

The existing original-Store root ledger omits some physical choices. Agent 12's complementary accepted-target sidecar observes `PlayCardAction` and `RetreatAction` coordinates and resulting public-board changes. However, an attacking Pokémon can assign Energy through a native `ResolvePromptAction` for `AttachEnergyPrompt`, and that assignment is outside the existing sidecar's declared scope. Can a read-only observer recover the actual **accepted prompt's public Energy recipient** without retaining concealed action results or changing the genuine game?

## Implementation

- [`simulation/twinleaf/accepted-energy-prompt-public-witness.cjs`](../../simulation/twinleaf/accepted-energy-prompt-public-witness.cjs) adds a reversible research-owned `Store.prototype.dispatch` wrapper, restricted to the authentic live Store and accepted `ResolvePromptAction` while `AttachEnergyPrompt` is pending. It takes bounded Active/Bench public card-and-attached-Energy snapshots before/after dispatch using the existing [native accepted-target sidecar](../../simulation/twinleaf/native-accepted-target-sidecar.cjs) projections. It never serializes the chosen prompt result, hidden hand, deck, Prize card, or prompt search options, and never feeds the record into either bot.
- [Four pure regressions](../../tests/accepted-energy-prompt-public-witness.test.cjs) passed locally on Node 22 and on GitHub Actions Node 20. They show equal legacy accepted action labels but different public Energy recipients, omit other prompt types, retain accepted prior receipts through an exception, and explicitly mark a deferred/no-delta resolution unobserved.
- [Real Store replay](../../simulation/twinleaf/agent1-rank11-energy-prompt-public-native.cjs) uses the already archived rank-11 source-first, sameTarget-invalid seed `336035391`, source seat 0, repeat 43, genuine rank-11 printed 60, unchanged New Moon candidate 60 and pre-existing reversible sameTarget correction. Native Twinleaf pin **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. One source-dealt 48-action diagnostic, not prospective evidence.

## Compiled original-Store result

**First native pass:** [manual CI 39705785960](https://github.com/FlareZ123/experiment-01/actions/runs/39705785960), commit `e417c848d38ab4e5c89a1b00258bdd5a102b5de3`, succeeded, artifact `12394632223`. The native witness recorded **one accepted `AttachEnergyPrompt` resolution**, dispatch ordinal **36**, global turn **3**, source seat **0**, prompt ID **17**. Public source Bench index 0 was **Trubbish FST**, retaining **Muscle Band XY** and going from **one** to **three Darkness Energy MEE**. Public-delta witness SHA-256: `26cd74cbbd483ed534fcd93fa8e377e9142eb9d50c17647ccfa779b4cbdb5d58`.

The same-target bot selection wrapper reported **two correction callbacks**, while native accepted-Store prompt evidence reported **one settled AttachEnergyPrompt**. Callback totals must not be mislabeled as genuine accepted prompt count. The observer itself cannot establish why callbacks exceed accepted prompt resolutions, since speculative scorer invocations or repeated prompt evaluation are possible.

**Paired noninterference check:** [manual CI 39706808989](https://github.com/FlareZ123/experiment-01/actions/runs/39706808989), commit `754b440321d046401a1561ca53d126e75b111a70`, succeeded, artifact `12395730829`. The script ran the same registered physical seed and bot correction twice, first without this read-only witness and then with it, within the same immutable checkout. Genuine first physical seat 0, 48 accepted actions, winner/finished status, turns, physical Prize counts, archived attack traces, Ability traces and card-play totals all compared equal. Correction callback counts matched. The original native prompt witness and its SHA remained unchanged. The entire workflow also passed the pre-existing canonical four-arm accepted-target sidecar on/off noninterference gates.

A separate intermediate CI [39706442575](https://github.com/FlareZ123/experiment-01/actions/runs/39706442575) failed on a **reporting-only null dereference** when it attempted to take `.length` of the optional legacy `rootActionLedger`. The fallback `runArm(..., detailed=false)` does not populate that ledger. The already-passed public trajectory equality assertion preceded that failure; a follow-up patch now records `comparedRootCount:null` and `legacyRootLedgerCaptured:false`, without inventing root parity. The successful final job validates that correction.

## Boundary of evidence

The observer witnesses a visible post-dispatch **change in occupied Bench position and attached Energy printing count**. A prompt whose effect is delayed, produces no visible delta, or involves another type is unobserved. Several possible hidden selections may converge on the same public delta; a matched public delta does **not** prove complete physical action identity. The actual selected `ResolvePromptAction.result` remains redacted. This native fixture does not capture the optional original root-action ledger, so it does not certify exact root-prefix equality, despite the stronger available attack/Ability/public outcome comparisons. The paired fixture has one retrospectively selected original source seed and only 48 actions; its native result is **not a competitive game**.

The sidecar is a complementary, default-off tool for future paired gameplay work. It should be integrated with accepted `PlayCardAction`/retreat target witnesses and genuine prompt acceptance auditing, with version labels and prospective opponent games, before making broader claims of physical-action parity or bot quality.

**Benchmark stays at 29/32 verified published Aichi source lists, ranks 23/25/28 missing, zero competitively qualified games, and no established fixed-list 99.5% win rate.**
