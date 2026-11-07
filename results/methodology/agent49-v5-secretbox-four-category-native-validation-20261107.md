# Agent49: v5 Secret Box four-category native validation and audit blocker

**7 November 2026 | Agent49 | Workflow 42354244670**

## Question

Does the v5 Agent43 owner-visible Secret Box/Fog adapter now pass a real pinned Twinleaf Store prompt chain after correcting the Agent36 four-category helper's native printing identity, and does the existing root93 post-settlement audit still describe that treatment?

## Revisions and provenance

- Research revision tested: `7fc11df43be361d4a7a2a832f08fc0e7d2af9adc`.
- Pinned submodule path: `vendor/twinleaf`.
- Pinned Twinleaf commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Submodule remote in `.gitmodules`: `https://github.com/twinleafgg/twinleafgg.git`.
- Runtime: Node.js `20.19.0`.
- Corrective printing commit: `4ac02d7c4577bab7592e6bcd725bedd8430c2035`.

## Initial fixture failure and correction

Run [42353828467](https://github.com/FlareZ123/experiment-01/actions/runs/42353828467) compiled Twinleaf and passed adapter syntax checks. The 109-test suite had 101 passing, two failing and six skipped. Both failures were the new native four-category fixture in physical seats 0 and 1, which threw `Missing actual pinned card printing Ace Trainer XY7` before native Store setup.

The repository's English card data resolves the correct fullName:

- `resources/cards/en/xy7.json`: card `xy7-69` is Ace Trainer.
- `resources/sets/en.json`: set id `xy7` maps to PTCGO code `AOR`.
- Native fullName is **`Ace Trainer AOR`**.

The helper preference, pure selector fixture, native fixture, test expectations and Agent36 root93 synthesis were corrected. This is a card-printing identifier correction, not a card-rule change.

## Successful native prompt tests

Run [42354244670](https://github.com/FlareZ123/experiment-01/actions/runs/42354244670) used the corrected main revision and pinned Twinleaf commit above.

- Twinleaf installation and compilation: passed.
- Adapter and runner syntax: passed.
- Test suite: **109 total, 103 passed, 0 failed, 6 skipped**.
- Native Secret Box test, physical seat 0: passed.
- Native Secret Box test, physical seat 1: passed.

Both seat tests used the pinned Store and physical card objects. The genuine Secret Box TWM owner-deck search prompt selected one physical card from each available category: Fog Crystal CRE, Powerglass SFA, Ace Trainer AOR and Sky Field ROS. The follow-up Fog Crystal CRE owner-deck prompt selected and moved a physical Basic Psychic Energy. The test asserted the source card, owner, deck collection, native validation, card movement and absence of a paper-guard veto.

**Scope:** this is a staged native Store prompt-chain witness. It is not a naturally dealt original matchup, a completed game, a competitive result, or evidence of 99.5% performance.

## Full v5 root93 runner: audit mismatch

The optional full root93 v5 runner did execute. It wrote attempt and baseline files into artifact [13566957017](https://github.com/FlareZ123/experiment-01/actions/runs/42354244670/artifacts/13566957017). The post-settlement audit verified, before failing:

- registered trial `11:1000:B:new-moon-lockbreaker-v1`;
- original source-deal and full physical-deal fingerprints;
- seed 626469135;
- physical seats 0 and 1;
- unchanged baseline ledger hash;
- treatment root count and ledger length of 260.

It then rejected the treatment ledger at `simulation/evaluation/agent43-native-box-ko-postsettlement-audit.cjs:41`:

| Fingerprint | SHA-256 |
| --- | --- |
| Existing audit's frozen v4 treatment | `a6d3eb071ec1571d925183900eb4c8838a97139114f886413ddb5a6dd5c4144e` |
| Actual v5 treatment | `d7d90456c2ab3ea174dd39afc6fd07bba99e30251e64935539b7ebaabb33973b` |

The v5 helper now selects four category cards, while the audit still freezes the prior v4 treatment. The audit stopped at the hash assertion; its later checks of the 93–105 action window, native action receipts, source turns, Prize transitions, next candidate attack, terminal status and final Prize counts did not execute. The available Actions interface returned a temporary artifact download URL but did not expose the ZIP bytes to this runtime.

A hash-only edit would be unsafe. The next run adds a compact pre-audit diagnostic to the runner and writes `diagnostic.json` alongside the attempt/baseline artifacts. Inspect the changed action window, native selected-card receipts, source continuation and candidate attacks before versioning the v5 audit expectations.

## Decision and next work

- Preserve the 103/109 test result and both-seat native prompt witness.
- Treat the full root93 v5 replay as **audit-blocked**, not as a verified KO, completed game, win or matchup result.
- Keep root93 as a narrow regression witness; do not generalize the exact Box/Fog recipe to the 29 authenticated original source 60s.
- After inspecting the new diagnostic, update the post-settlement audit as an explicit v5 version only if its downstream semantic assertions are supported by the actual ledger and Store receipts.
- The separate rank31 original 60 has 4 Fog Crystal CRE, 3 Unown AOR and 2 Basic Psychic MEE 13, with no Secret Box. Agent49's direct-Fog proposal remains a 4/4 pure-tested hypothesis; a staged native Store test is still missing.

**Benchmark status remains unchanged:** 29/32 original source inventories authenticated; ranks 23, 25 and 28 missing; zero competitively qualified games; no selected final fixed 60; no demonstrated 99.5% win rate.
