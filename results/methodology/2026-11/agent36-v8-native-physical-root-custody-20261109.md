# Agent36: Eight native v8 source games now have exact live Store-to-physical-card receipts

**9 November 2026 | Status: successful developer-instrumentation experiment; zero paper-qualified games.**

## Implemented and run

The shared runner now supports a read-only, actual-native-Store **physical receipt producer**. It binds 120 original physical card object identities at the two `AddPlayerAction` boundary, and on every genuinely accepted root captures both owners' card positions before and after the exact native `Store.dispatch`, unresolved owner prompt options and selected card identities. It retains a separate rejected-action ledger. Its callbacks never supply hidden information to a bot. Full deck and Prize locations are retained **only in the offline audit artifact**.

- Producer: [`simulation/twinleaf/agent36-live-paper-root-receipts.cjs`](../../../simulation/twinleaf/agent36-live-paper-root-receipts.cjs).
- V8 runner/custody join: [`simulation/evaluation/agent36-v8-native-paper-root-capture.cjs`](../../../simulation/evaluation/agent36-v8-native-paper-root-capture.cjs). One unchanged registered eight-game historical selected-v8 panel. Native exact Store root joins compare ordinal, seat, global turn and action class, including abort-preserved ledgers. No new policy/60-card change.
- Tests: [recorder](../../../tests/2026-11/agent36-live-paper-root-receipts.test.cjs) and [native join](../../../tests/2026-11/agent36-v8-native-paper-root-capture.test.cjs), 11 passing tests in pinned native workflow.
- [Successful real CI run 42637232845](https://github.com/FlareZ123/experiment-01/actions/runs/42637232845), native `Capture original v8 physical Store-root payments and owner prompts` step passed. [Artifact 13683832636](https://github.com/FlareZ123/experiment-01/actions/runs/42637232845/artifacts/13683832636).
- JSON payload 11,758,895 bytes, SHA-256 `c72818d47e561fa4c39a649ab0e21f1500856cc2968b63be0e682fac03d02f01`. Uploaded ZIP SHA-256 `e984bfc0ae37ee3d245a94e946de8d07f82938781e5c2ec744488a4b8a2eb7bd`. Engine pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Real outcomes, independently inspected from the archived JSON

| Historical registered original rank / candidate | Exact accepted roots | Full physical reference custody clean | Native terminal |
| --- | ---: | --- | --- |
| 6 / Champion | 128 | Yes, every root | No |
| 6 / New Moon | 120 | Yes, every root | No |
| 11 / Champion | 128 | Yes, every root | No |
| 11 / New Moon | 88 | Yes, every root | No |
| 1 / Champion | 98 | Yes, every root | No |
| 1 / New Moon | 128 | Yes, every root | No |
| 3 / Champion | 106 | Yes, every root | No |
| 3 / New Moon | 93 | Yes, every root | No |

**889/889** accepted root receipts and **8/8** native root-ledger tapes join exactly by action ordinal, acting seat, turn and action class. Every root preserves original 120-card physical identities with no duplicate, missing or unregistered references according to the observer's defined native zones and unresolved-prompt custody. There were **605 native prompt-resolution actions**, **98 card-play actions**, **59 attack declarations**, and **127 passes** in the archived tapes. All eight games were capped or engine-errored: no natural terminal. These are developmental sources, not independent competitive game results.

**Do not confuse zone transfers with deck reorder.** The v1 `movement` array records changes in a card's full zone **and index**. Across the eight tapes, 13,075 index-or-zone position changes include 12,304 within-zone index changes (mostly deck shuffles); only 771 changed the zone label, some temporarily entering or leaving prompt custody. A consumer seeking paid resource movement must compare normalized zones and unresolved prompt identities, not count `movement.length` as physically discarded/played cards.

## Immediate practical use and limitations

The raw packet is inspectable evidence for actual costs, card identities and the exact prompted owner selection at a specific accepted root. The real-game collector is opt-in; it does not edit Twinleaf vendor code or reinterpret old v8 games. Its `settledPhysicalIdentityClean` proves reference-level conservation under the modeled zones. **It does not certify printed effect semantics, payment legality, Hidden Information noninterference, independent tactical competence, official Aichi stage-specific continuous 25-minute clock, or Japanese Extra card legality.** Those require separate review and the independent [signed admission gate](../../../simulation/evaluation/agent45-independent-competitive-admission.cjs). That gate's production reviewer registry remains empty. This result is a working evidence producer, not 889 qualified moves.

Do not backfill any historical paper win or 99.5% estimate. The next registered full original-source games should attach these same exact Store callbacks, preserve card snapshots and raw owner prompt choices, and distinguish natural complete games from caps/aborts. Agent41's exact source-factor receipt and Agent45's signed competitive-admission intake are the immediate consumers. No full Top32 benchmark winner is selected.
