# Agent 8: independent immutable v10 opponent card-choice response audit

**5 November 2026 | retrospective read-only archive analysis | zero qualified games.**

## Why this matters

The experimental success threshold for the Aichi Top32 project must distinguish **an actual opposing Store action** from evidence that the opponent policy **responds sensibly to the changed board**. Agent36 already demonstrated a valid first opposing Store action after the rank6 original source's two actual Volt Cyclone attacks. I independently recovered the historical native artifact and checked the *entire available completed opposing turns* against the strictly same-initial-physical-deal no-attack controls.

## Primary source and independent recheck

- Historical real compiled run: [CI 42106359764](https://github.com/FlareZ123/experiment-01/actions/runs/42106359764); artifact ID **13453110356**, `agent5-rank6-original-post-dce-thunder-volt-v10`.
- Downloaded the ZIP through the GitHub connector as actual bytes, decompressed all three embedded JSON receipts locally and independently recomputed their **SHA256**, matching all three embedded, independently retained `.sha256` sidecars. ZIP checksum **`2bb446348eda27642c64b0ceb20552550688a1eef452f02ab97620acde703f5f`**. JSON checksums: summary `60a9d84fb09a0ed959af2b2c3696d97d5c7ec3f305e5528a37293814eb45a5e7`; original control `9ad15fdffe756816c4814bbb3b1076b81e731510654e7545b4d7e1134c223dc7`; v10 treatment `f2fe6219cf4f959fe6d5c07b2ca11be49560ef2997d3dea09c50f9f3e0e7bf1a`.
- Repository SHA `92a33c3dca22f19b12de003a0ced35fe2af3ef36`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. **All eight frozen original IDs are retained.** Exactly two rank6 source-seat0 examples have one source attack each; the six other attempts are kept as no-attack/abort outcomes.
- Reusable pure comparator: [`simulation/evaluation/agent8-v10-opponent-response-matched.cjs`](../../simulation/evaluation/agent8-v10-opponent-response-matched.cjs) with [adversarial seven-case test](../../tests/agent8-v10-opponent-response-matched.test.cjs). Compare exactly same source and full two-player physical initial fingerprints, identical first player, verified same-epoch first real opponent root, strict settled source attack, first post-DCE divergence at actual source Pass replaced by Thunder Mountain, complete public root ledgers, and only completed opponent turns ending with actual Pass. Uses action type and printed card name; **does not claim to reproduce unrecorded targets or card choice rationale**.
- The numeric result below was **independently executed locally over the actual original JSON bytes**, with a separate local script implementing the same extraction; all eight adversarial synthetic tests in an earlier fuller local implementation passed. The newly committed shortened comparator and its seven pure tests are **not yet validated under repo CI**; do not conflate these. The actual archive SHA256 provides a stable way to reproduce these observations.

## Source-controlled matched result

| Original source trial | Original turn2 source control | v10 source treatment | Opponent turn3 actual volunteered action sequence | Opponent turn5 actual volunteered sequence |
| --- | --- | --- | --- | --- |
| `6:101:B:champion-reference` | Source Pass ordinal30 | Thunder ordinal30, source Volt Cyclone ordinal31, 140 damage to Latias ex | **Control and treatment both:** PlayCard Psychic Energy, Pass | **Control and treatment both:** Pass |
| `6:101:B:new-moon-lockbreaker-v1` | Source Pass ordinal37 | Thunder ordinal37, source Volt Cyclone ordinal38, 140 damage to Mewtwo & Mew-GX | **Control and treatment both:** PlayCard Psychic Energy, Pass | Original control: Pass; v10 treatment: **48-root capped before reaching turn5**, so censored |

**Numerical classification:** 8 original trials; 2 genuine source-attacking treatment arms; **3 completed opponent turns matched** across original control and treatment; **3 identical action-type/printed-card-name sequences; zero observed changes; 1 censored attempted comparison**. For the champion branch this matches *two* successive opponent turns, adding a second completed-turn comparison beyond the first immediate response already documented in Agent36's source settlement report. The v10 treatment therefore demonstrates a genuine reply, but **cannot demonstrate that the candidate policy changed a single recorded voluntary action choice in response to the 140 damage** in these small fixed examples. It may have changed targets, prompted decisions or other hidden-state aspects that are absent from these root envelopes.

Both 140-damage source attacks took **zero Prizes** and moved the source's only DCE off its Active Iron Thorns and onto the Bench. This is a real resource relocation with outstanding postattack attacking-tempo cost, as independently documented by [Agent36's next-original-turn audit](agent36-v10-source-return-after-dce-tempo-20261105.md).

## Distinct implications and boundaries

1. Do not label P4 "responsive opponent adaptation" from only a next opponent voluntary Store root. The archived evidence supports **real play and completed turn**, a different and weaker statement than strong tactical reaction.
2. Add actual chosen target, pre/post publicly observed owner hand/board and missed alternative decision to later evaluation records if one wants to test response sensitivity. Avoid information leakage, printed-cost loopholes or confusing different hidden physical openings.
3. These three exact paired complete turns are **descriptive evidence from two prespecified source attacks**. They are not a representative sample of the metagame, do not estimate win percentage or a strategic advantage, and cannot grade the underlying source Trainer choice optimality. Additional tests must specify an adequate continuation horizon before running.

**Gate status:** selected developmental Issue25 release remains v4; original field 29/32 authenticated; no fixed final 60 selected; **zero competitively qualified games, 99.5% undemonstrated**.

**22:20 UTC verification addendum:** The exact committed shortened opponent-response comparator and its exact seven regression cases were fetched back from GitHub and executed in an isolated V8 harness with equivalent synchronous Node-style assert/test stubs: **7/7 passed** (same action, changed card, capped turn, mismatched deal, false epoch, unsettled attack, partial response). The original archive-data comparison was performed independently in local Python as described above. This verification is not Node's native test runner or new native CI.
