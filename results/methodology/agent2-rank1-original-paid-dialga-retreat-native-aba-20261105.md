# A native three-Psychic paid retreat rescues rank-1 attacks but does not reverse rank-3 deck-out

**Agent 2, 5 November 2026, ~13:29 UTC.** Retrospective **single selected historical physical deal**, **0 competitively qualified games**, no final fixed 60 or field win-rate claim. This file preserves the v1 native receipt and its measurement limitation even if the successor v2 changes the injection level.

## Source, registration and disposition

Preregistered before code/results: [same-deal paid-retreat registration](agent2-rank1-dialga-three-psychic-retreat-registration-20261105.md), commit \`50bcbba5\`. Fixed original **rank3 Snorlax Stall seat0 vs rank1 Shadow Rider seat1**, unchanged original printed sixties, seed \`290134\`. Source rank3's real held Guzma is selected at global turn16; rank1's real held Guzma is selected at turn3; source-target prompts are accepted natively. Baseline and repeated control are byte-identical at the complete native root-ledger SHA.

Native manual CI [42035671806](https://github.com/FlareZ123/experiment-01/actions/runs/42035671806), repository head \`46089f1fab8324e6c1ab2f172a8ae1d29880b2e1\`, pinned vendor \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`. Archive [13418950652](https://github.com/FlareZ123/experiment-01/actions/runs/42035671806/artifacts/13418950652) ZIP SHA256 \`c128dea104502154c4c2bbfd65a4dc2f2af803964c58846299d70e128956ea45\`, inner JSON SHA256 \`fc7b89e0260ef3174ce9f9928302a26a696cd08214b4a8476c36efec52eab242\`. Exact three arms and their failures retained. Job conclusion **FAIL by design** because the integrated runner demanded a typed \`RetreatAction\` in a ledger that records the bot's pre-Store \`PassTurnAction\`; see lineage limitation below. All four owner-only mock suites pass, including a nonthrowing unchanged Store no-op both seats and exact three physical fee cards both seats.

Same physical source: full-deal \`e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb\`, source-deal \`ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a\` across all arms. Baseline and repeat original root SHA \`1d68f7ae41707d6554c22706d4fe3d19f29f9ae68b5c10c0cbc964d424dc01ba\`. All three native games end with rank3 as native winner by rank1 deck-out.

## Genuine physical owner opportunity, payment and settled effect

At rank1 global turn33 the bot selected actual \`PassTurnAction\` root ordinal155. The preceding genuine owner state has Active \`Dialga-GX UPR\` with three physically distinct \`Psychic Energy MEE\` and the native \`CheckRetreatCostEffect\` returns **exactly 3**; the rank1 Bench contains \`Shadow Rider Calyrex V CRE\` with two Psychic. Rank3's Active is \`Bunnelby PRC\`. No observed Special Condition or prior turn retreat, and \`cannotRetreat\` was null.

The opt-in v1 \`Store.dispatch\` interception replaces that genuine selected Pass with a real \`RetreatAction(owner.id,1)\`. Custody audit preserves native physical card references: exact three new original Psychic cards enter owner discard; original Dialga slot moves to Bench; the two Psychic attached to Shadow Rider V remain attached; owner Active becomes the exact original Shadow Rider slot; owner \`retreatedTurn===33\`. The physical settlement is **verified** and no pending prompt or false-positive no-op remains. This is evidence that a legal native three-Energy paid retreat was missed at that original owner state. Paper-wide legality remains separately qualified.

| Metric | Original control | Three-Psychic Store intervention |
| --- | ---: | ---: |
| Native status | Terminal | Terminal |
| Native winner | Rank3 | Rank3 |
| Global terminal turn | 51 | 59 |
| Native root actions | 238 | 270 |
| Rank1 settled/declared attacks | 4 Shadow Mist | 17 Shadow Mist |
| Rank3 declared Burrow attacks | 19 | 15 |
| Rank1 Prize cards taken | 0 | 1 |
| Rank3 Prize cards taken | 0 | 0 |
| Rank1 remaining deck | 0 | 0 |
| Rank3 remaining deck | 21 | 17 |

The treatment starts attacking from the new Active on **the same global turn33**, then continues attack turns35,37,...57. The source stops using Burrow after turn42; the final public state shows Bunnelby no longer in play, Snorlax Active with 110 damage, and rank1's Shadow Rider V Active holding three Psychic. Despite a native Prize and repeated attacks, rank1 still decked out on global turn59.

## Critical root-custody limitation and next test

The normal headless \`rootActionLedger\` logs the **pre-Store bot proposal**, so the treatment root155 is still printed \`PassTurnAction\` even though the wrapped native Store actually dispatched \`RetreatAction\`. The physical audit proves the effect, but the external typed action ledger and the actual Store action differ. The runner's \`genuineNativePaidRetreat\` check therefore intentionally fails, and this job is **not** a complete action-lineage certificate. Do not count native typed \`RetreatAction\` in this archive; do not silently interpret pre-Store Pass as Store Pass. A successor **bot-decode-time** intervention must select the genuine \`RetreatAction\` *before* headless root capture and independently retain exact physical settlement, with all three A/B/A arms registered and source fingerprints checked again.

The treatment does not establish optimal retreat timing, counterplay or a competent opponent: rank3's post-KO fallback Stoutland/Snorlax, other paid-escape options and competitive 25-minute clock remain unresolved. The 29/32 original opponent-source composition and all-paper rules completeness remain vetoes.

Source implementation: [v1 actual-Store override](../../simulation/twinleaf/agent2-rank1-dialga-paid-retreat.cjs), [A/B/A runner](../../simulation/evaluation/agent2-rank1-dialga-paid-retreat-aba.cjs), [negative controls](../../tests/agent2-rank1-dialga-paid-retreat.test.cjs).
