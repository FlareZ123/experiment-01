# Native canonical rank-11 missing held-Seal opening: fixed source, two unchanged candidate 60s

**Agent 30, 29 October 2026. Reproducible retrospective policy-development test. No competitive-qualified games.**

## What was corrected

In the [29 October preregistered 32-arm scout](agent41-prospective-canonical-scout-native-20261029.md), the exact published rank-11 Absol/Garbodor source opponent held a sufficient Forest Seal Stone, Float Stone, Battle VIP Pass opening yet passed on its first own turn in both candidate arms. [Authenticated physical deal and full seven-card source hand](agent30-preregistered-rank11-held-seal-missed-line-20261029.md), seed **2307728896**, source physical seat **B**, actual source **second**. The frozen common runner previously used only the direct held-Boost-Shake source policy, omitting a previously validated held-Seal route.

We added a **default-OFF** `rank11ExclusiveOpening` option to the existing [canonical bilateral v2 runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs), calling the pre-existing [exclusive direct/held-Seal arbiter](../../simulation/twinleaf/rank11-exclusive-openers.cjs). No original 60, opponent seed, starting assignment or original preregistered archive was modified. The [retrospective control/treatment replay](../../simulation/evaluation/agent30-rank11-canonical-exclusive-fork.cjs) uses the original frozen run flags and 260-root cap for both source vs rank-1 champion and source vs New Moon Lockbreaker v1.

## Completed pinned original-Store execution

**Manual existing-workflow CI: [40935362470](https://github.com/FlareZ123/experiment-01/actions/runs/40935362470), success**, engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Native artifact **12925080839**, named `agent30-canonical-rank11-selected-seed-unqualified`, SHA256 ZIP artifact digest `f599b4f10524088ca5eaea97dc82e480fbddce8c87e4d9055205c775bf0c8c31` (as reported by Actions). Pinned engine compiled; **12 pure tests passed** after correcting the exact order of two Prized Darkness Energy copies in a regression fixture. All **four native Store executions completed the experiment without exception**. The original source full physical-deal fingerprint was identical across control/treatment and both candidate comparisons: `1fd47565f188fa681b08be6538b8b2b3f84b2e9a8c9534b5323fd25d8bc11ef5`. Authentic first turn was always candidate A, verified from native draw log.

| Unchanged candidate sixty | Direct-only source control | Combined source treatment | Control final status | Treatment final status |
| --- | --- | --- | --- | --- |
| Published rank-1 Shadow Rider reference | No source first-turn Boost Shake | **Held-Seal line fully completed, equipped Garbodor at candidate T3** | Native source terminal, 56 turns | **260-root cap**, 58 turns, no winner |
| New Moon Lockbreaker v1 | No source first-turn Boost Shake | **Held-Seal line fully completed, equipped Garbodor at candidate T3** | Native source terminal, 54 turns | Native source terminal, 64 turns |

The source branch selected `held-seal` at **global T2**, VIP route and Float Stone Tool, on both treatments. Native Store accepted this exact sequence with owner-only search selections:

1. Battle VIP Pass selected Trubbish from own deck.
2. Forest Seal Stone attached to Active Oranguru V.
3. Star Alchemy's genuine owner-deck prompt selected Boost Shake.
4. Float Stone attached to Trubbish.
5. Boost Shake selected Garbodor and evolved Trubbish, ending source turn.

Both native policy audits show `held.completed=true`, `held.aborted=null` and a genuine candidate-next-turn witness `{turn:3,equippedGarbodor:true}`. The strict source/reply packet identifies an actual settled Boost Shake root at source T2, a live candidate decision at T3, and a subsequent source T4 root, with unbroken turn chronology. The rank-1 response attached Psychic Energy and used Shadow Mist, whose 10 damage was natively settled. New Moon's first T3 action was **Field Blower**, accepted by Store, followed by a ChoosePokemonPrompt, Unown bench and Pass. The archived **candidate T3 Pass post-choice public-board observation**, saved as `candidatePerfectionPassSamples[turn=3].publicBoardBeforePass`, shows `Garbodor` still Benched but **with zero attached Tools**, whereas the authenticated source's T2 Boost Shake completion and the candidate T3 pre-response public board show Float Stone attached. The native T3 Store sequence is `Field Blower` PlayCardAction → `ChoosePokemonPrompt` resolution → `Unown` Bench → Pass; this supports Field Blower removing the Garbodor Tool before the candidate ended T3. The actual chosen ChoosePokemon prompt target was not separately serialized, and the passive lock's suppression/resumption was not independently tested; do not infer a competitively competent reaction from Tool removal alone. The post-Pass cloned Perfection menu had no eligible GX/EX copy donor, so its `CANNOT_USE_POWER` result does not isolate Garbotoxin after removal.

## Evidence and evaluation boundary

This is a **single retrospectively selected original rank-11 source deal**, run against two different candidates under a shared newly enabled source policy. Neither two candidates nor two treatments constitute independent sources. Source opponent competence improves in a previously authenticated missed opening, and one candidate/engine completion becomes a cap. This is meaningful policy-execution evidence that **disqualifies relying on original weak-source terminals for deck ranking**. The native terminals and action cap are developmental: there is no calibrated tournament clock, validated human-level two-player policy, broad paper-fidelity certification, field-wide matchup sample or win-rate estimator. **Zero competitive-qualified games and zero demonstrated progress to a 99.5% win rate** should be counted from this fork.

The original prospectively registered archive remains unchanged. Future work: verify New Moon's actual T3 Field Blower selected Tool and effect, extend the shared rank-6 source attack competence, then preregister an independent actual-start-stratified both-candidate cohort with exact 60s, native target receipts and complete censored/error accounting. An existing combined source implementation now has a verified route through the canonical runner, so there is no need to duplicate a special-purpose bot.
