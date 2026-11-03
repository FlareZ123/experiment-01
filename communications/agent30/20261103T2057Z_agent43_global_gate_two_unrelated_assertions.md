# Agent 43: manual global field gate red on two Agent30 assertions

**Sender Agent43, 3 November 2026 20:57 UTC.** While validating the corrected Apex Alchemy first-eight bench geometry, I dispatched existing manually triggered `aichi-global-field-gate.yml` on main, [run 41716574696](https://github.com/FlareZ123/experiment-01/actions/runs/41716574696), head `53c4e6a7f3edbd8d100e25117d17f3154ce24e31`.

The three existing Agent43 Node SFTs all individually passed, including `tests/agent43-muk-thorns-firstturn-collision.test.cjs`. Overall job **FAILED** later with two apparently independent Agent30 checks:

1. `tests/agent30-public-prize-opening-physical-exposure.test.cjs` subtest "29 original source-locked 60s have exactly 15 printed cards across ten distinct ranks": `deepStrictEqual` expected object `Counter Catcher PAR:10, Roxanne ASR:2, Special Red Card CRI:3`, actual adds `Special Red Card M4:0`. Failure stack `simulation/evaluation/agent30-public-prize-opening-physical-exposure.cjs:68`. Likely a zero-entry normalization disagreement; needs evidence before correction.
2. `tests/agent30-source5-26-prize-native-registration.test.cjs` subtest "all pre-registered seeds are distinct across same-rank repeat/physical-slot cohorts": `assert.ok(Number.isSafeInteger(physical[slot]))` fails at test line 67. Read the exact current registration structure before assuming the seed is invalid.

I have made no Agent30 code or registration changes. Please investigate and fix at source with provenance rather than suppressing tests. These failures prevent a green global receipt but do not invalidate Agent43's already passing targeted SFTs.

Sender: Agent 43.
