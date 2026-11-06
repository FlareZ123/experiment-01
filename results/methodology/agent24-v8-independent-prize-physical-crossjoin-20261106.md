# Independent cross-archive proof of eight physical Prize transitions in the v8 continuation

**Agent 24 | 6 November 2026 | development-only, no game qualification.** Two independently compiled native receipts from the exact same eight original Aichi v8 trial registrations corroborate every settled Prize-taking attack event by a unique root-observed physical Prize-card exit. This is an audit of execution accounting, not a paper-rule certification, causal KO-token proof, or strategically competent opponent.

## Independent, immutable inputs

1. **Native attack and public Store ledger:** GitHub Actions [run 42287771647](https://github.com/FlareZ123/experiment-01/actions/runs/42287771647), artifact **13538082892**, archived ZIP SHA256 `36d759b28ae75bb120d94c30a6faa2ae79bd1e03ddb0df902a94418e2ba47882`. Member `treatment/issue25-steward-v8.json` SHA256 `6ed9db1568aaf546e3165ddae2a2fa21fd1224f7d50e1e2dc8b8c6f578bb5a45`, 1,131,705 bytes. The telemetry has full actual public root actions, both-seat settled attack transcripts and Prize count before/after, initial source/full physical deal fingerprints, actor seats, and native disposition. Checkout `a5d3657ac4cdbccd79cced59c133dd6d7d35a6a4`.
2. **Separately compiled physical Prize-zone observer:** GitHub Actions [run 42310603535](https://github.com/FlareZ123/experiment-01/actions/runs/42310603535), artifact **13549085324**, ZIP SHA256 `0f186a14841b6459b8f6c8665e9c9948a96da506424e41cf0aba2f3de429316e`. Member `agent3-v23-selected-v8-ko-source-physical.json` SHA256 `190905a4a94eade2bf4926796d02efcbe696335e6b9d33d06f3804c9a8d1da0f`, 67,615 bytes. Agent3's [root-Store physical custody report](agent3-v23-native-automatic-final-prizes-physical-custody-20261106.md) explains the passive observer and automatic final-Prize branch. Checkout `787e2e169872ce5e662f72be3cbc349a324d520b`.

Both experiments used pinned native engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. They were different **native runs**, so shared original registered ID alone would be an insufficient join. I independently compared **every one** of the eight IDs and verified each matching actor-seat assignment, exact full physical deal SHA256, exact source physical deal SHA256, exact root count, native disposition, and final Prize counts; all eight matched. The first archive's complete public Store root arrays also individually recompute to their reported SHA256 digests. The second archive's physical exit observer reports eight registered root Stores, zero omitted exit records, zero hidden Prize-face reads and exactly eight unique physical exit records.

## Eight independent natural-key joins

A qualifying public event is a **settled** real `AttackAction` with the attacking physical seat's Prize count decreasing. The separate Store observer must report exactly one physical Prize exit with the same registered trial ID, owner seat, source attack's turn, before/after Prize count, number of physical cards, and `ResolvePromptAction` class. Every moved Prize object must arrive in that owner's hand. Every physical record must match exactly one public event; missing, reused, ambiguous and orphan records fail the audit.

| Registered original / contender | Actor | Attack root → settled root | Turn | Prize count | Physically moved to actor's hand |
|---|---|---:|---:|---|---:|
| Rank 6 / Champion | source | 85 → 91 | 17 | 6 → 5 | 1 |
| Rank 6 / New Moon | source | 97 → 103 | 17 | 6 → 5 | 1 |
| Rank 11 / Champion | source | 84 → 89 | 18 | 6 → 4 | 2 |
| Rank 11 / New Moon | source | 40 → 45 | 6 | 6 → 5 | 1 |
| Rank 11 / New Moon | source | 102 → 107 | 20 | 5 → 2 | 3 |
| Rank 1 / Champion | contender | 61 → 66 | 13 | 6 → 5 | 1 |
| Rank 1 / Champion | contender | 77 → 82 | 17 | 5 → 3 | 2 |
| Rank 1 / Champion | contender | 108 → 109 | 25 | 3 → 0 | 3 |

**Result: eight uniquely joined Prize-taking attack events, 14 physically transferred Prize-card objects, five source events and three contender events, zero unassigned physical exits, zero duplicate joins.** The final Rank1/Champion three-Prize exit is meaningful: the native engine automatically awards the final Prizes without opening a `ChoosePrizePrompt`, yet an actual root `ResolvePromptAction` completes the physical hand transfer. A prompt-only tally would miss these three objects.

## Reproduction and adversarial tests

- Pure read-only crossrun auditor: [`simulation/evaluation/agent24-v8-prize-physical-crossjoin.cjs`](../../simulation/evaluation/agent24-v8-prize-physical-crossjoin.cjs), accepting the two JSON objects above and exposing `crossjoinNativePhysicalPrizeExits(v8, physical)`.
- Regression suite: [`tests/agent24-v8-prize-physical-crossjoin.test.cjs`](../../tests/agent24-v8-prize-physical-crossjoin.test.cjs), **8 local Node v22 tests passed, zero failures**. Tests veto wrong full/source deal, wrong actor, wrong turn, duplicate physical events, unsettled attacks, hidden Prize-face reads and modified root digest. These pure tests have **not** been run against native CI as a separate step; the published cross-archive invocation itself succeeded locally on the two exact downloaded artifacts. Both committed source files' Git blob SHAs were verified equal to the locally tested files.

## Precisely bounded evidence

The natural key is **trial, physical actor seat, turn, before/after Prize count, transfer count and Store action class**. Agent3's separate physical observer does **not** publish the matching public attack's root ordinal or a unique native `executeCheckState` KO cause token. The join is uniquely determined over both observed complete datasets and strengthened by deal/status/turn agreement. It is **not a common-run physical object identity join** nor independent proof that every physical transfer was a printed-rule-legal Knock Out. Exact KO cause, paper attack cost, paper timing, tool behavior, hidden-information policy integrity, and official match clock are unverified.

No candidate optimization, benchmark expansion, or credible human-level opponent competence is established. This analysis preserves the source response gap documented in [Agent24's post-KO Energy-collapse audit](agent24-v8-bilateral-post-prize-counterplay-20261106.md): in four source-Prize contexts, each first Prize-bearing attack left the contender board Energy-free, and no contender post-Prize AttackAction occurred within the recorded root cap. The five source Prize events did **physically award eight Prize objects to their source players** in the independent native observer. The three contender events awarded six to the rank-one mirror. **Paper-qualified games: 0; authenticated original 60s: 29/32; no selected fixed60 and no verified 99.5%.**
