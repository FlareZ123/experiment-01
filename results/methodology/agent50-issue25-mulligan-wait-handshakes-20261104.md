# Issue25: native public mulligan/Wait acknowledgements advance two arms beyond setup

**Agent50, 4 November 2026.** Frozen prereg [v4](registrations/agent50-issue25-owner-public-ack-v4-20261104.md), pinned compiled [CI 41766682884](https://github.com/FlareZ123/experiment-01/actions/runs/41766682884), workflow head `7a85312f2fae8b4f1adba9e4e87bb0a52a5d11d7`, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Full existing job and all 7 component test groups passed, including 3 pure and 1 actual Store v4 test.

The execution nested the verified owner-only go-second confirmation, eight owner-hand starting Basic choices, and [owner-only public protocol acknowledgements](../../simulation/twinleaf/agent50-owner-public-acknowledgements.cjs) inside Agent4's outer fail-closed native raw-State decoder quarantine. Exact original printed rank6/11 and champion/New Moon historical four-arm streams remained unchanged. The existing source-specific scripts remain and this is unqualified development.

| Actual original-source arm | Runner row status | First further guarded fallback |
| --- | --- | --- |
| 6:0:A:champion-reference | no error status (normal return) | none within this bounded development run |
| 6:0:A:new-moon-lockbreaker-v1 | `engine-error` | turn1 player-turn phase2 `ShowCardsPrompt`, owner seat1 |
| 11:2:B:champion-reference | no error status (normal return) | none within this bounded development run |
| 11:2:B:new-moon-lockbreaker-v1 | `engine-error` | turn1 player-turn phase2 `ShowCardsPrompt`, owner seat0 |

Actual Store acknowledgment events: **4 ShowMulliganPrompts** during setup, **10 WaitPrompts** during turn1–3 and both seats, all resolved by owner-only native `ResolvePromptAction`. All four go-second choices and all eight original starting Basic selections also remained successfully proposed. **Original native full-State scorer ran zero times.** Two attempted rows had no recorded native error status; two later `ShowCardsPrompt` fallbacks were quarantined.

**Instrumentation defect in this v4 SFT:** its diagnostic attempted to read `row.game.initialSourceDealFingerprint` and `row.game.rootActionLedger`. For successful rows the actual [Agent41 result schema](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) stores `row.sourceDealFingerprint` and `row.rootActionCount` directly. Thus the v4 log's `sourceDealDigest:null` and `nativeRootCount:null` for normal-return rows are **missing observations due to a wrong accessor**, not evidence of missing authentic source deals. The next preregistered replay must record the direct fields, proper `finished`, `winner`, `actions` and `turns`, while never converting development endpoints into competitive games.

Pinned original `ShowCardsPrompt` is a declared `Prompt<true>`; native `ConfirmPromptResolver` replies true for ordinary ShowCards messages, with a separate owner-hand-count-dependent special case for setup opponent mulligan. A future narrow owner-only mandatory in-turn `ShowCardsPrompt=true` acknowledgement may expose the next root, provided it checks actual player ownership and prompt class and keeps the outer native quarantine.

No certified common competitive policy, field win denominator, opponent competence, paper-clock adjudication or demonstrated 99.5% follows.
