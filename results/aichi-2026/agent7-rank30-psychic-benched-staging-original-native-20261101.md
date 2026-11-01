# Original rank30 Clefairy: native Psychic Bench staging succeeds mechanically, loses Mimikyu Filch sequencing

**Agent 7 | 1 November 2026 | developmental original-Store A/B/A; zero qualified games.**

## Hypothesis and registered source conditions

The original Aichi rank30 Lillie's Clefairy JTG 56 source places multiple Clefairy ex on the Bench without attaching any Energy in four retrospective original-Store trajectories (see [read-only source diagnosis](agent7-rank30-rondo-original-owner-position-native-20261101.md)). Six authentic source Basic Psychic attachments in these native games occurred to other Active Pokémon, leaving Clefairy unpowered. An actor-only policy challenger now proposes **attaching a held Basic Psychic Energy to an existing face-up Benched JTG Clefairy**, using the same physical hand index and source-own Bench slot, rather than the first-return Active Energy destination. All opponent hidden zones are excluded.

Source ranks, seeds, printed 60s and physical seat assignments were inherited from Agent25's [previously registered nine-archetype cohort](registrations/agent25-nine-omitted-archetypes-source-readiness-20261101.json). Specifically, A seed 3407938073 has source on physical seat1, B seed 233633536 has source on seat0. Both fixed candidate decks, champion-reference and new-moon-lockbreaker-v1, are tested against each source seed, preserving the complete both-player physical shuffle, first player, engine and all non-recipient actor policy. The comparison used an A/B/A triplet per original paired case, with the altered policy applied to the **actual original source owner seat only** and exactly the same all-other-option profile in the controls.

This is a **retrospective** hypothesis and historical source-deal intervention; seeds had already been observed before the proposal. It cannot be pooled with fresh preregistered performance tests.

## Actual native outcome

Manual-only [compiled native Actions run 41347398458](https://github.com/FlareZ123/experiment-01/actions/runs/41347398458) finished **success** with 12 actual native Store games, unchanged pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Full unedited A/B/A native Store data, all root action ledgers, accepted physical target sidecars, statuses and game outcomes are preserved in [artifact 13099034074](https://github.com/FlareZ123/experiment-01/actions/runs/41347398458/artifacts/13099034074). All four A-repeat controls match their corresponding A original root-action SHAs and accepted native target sidecars. There are zero competitively qualified games.

**Important reporting correction:** the initial runner summary printed `attachedBasicPsychicToClefairy:0` for all treatments because its post-Store target matcher expected `Lillie's Clefairy ex` without the printing suffix, whereas the actual native physical sidecar reports `Lillie's Clefairy ex JTG`. This summary bug was corrected in the reusable runner at commit `cd2dc10c`. Direct inspection of the archived raw native `publicBoardChanges[].after.pokemon` and signed `storeAccepted:true` events gives the actual physically settled counts below. Preserve the original artifact and this explicit correction to avoid replacing raw evidence with the flawed old display metric.

| Registered original case | Control Psychic recipients | Treatment Psychic recipients | First treatment source-root policy changes | Source attacks (control to treatment) | Original and treatment engine winner |
| --- | --- | --- | ---: | --- | --- |
| A / champion | Latias ex, 2 | Benched Clefairy ex, **2** | 2 | 0 to 0 | Candidate in both |
| A / New Moon | Dedenne-GX, 1 | Benched Clefairy ex, **1** | 1 | 0 to 0 | Candidate in both |
| B / champion | Mimikyu, 2 | Benched Clefairy ex, **1** | 1 | Filch 6 to 1 | Source in both |
| B / New Moon | Mimikyu, 3 | Benched Clefairy ex, **2** | 2 | Filch 14 to 11 | Candidate in both |
| **Total** | **8** accepted source Basic Psychic attachments | **6** accepted Clefairy attachments | **6** changed source-root proposal choices | **No Rondo attacks** | **0 outcome changes** |

The changed source-root conditions occurred at turns 24/30 (A champion), 24 (A New Moon), 21 (B champion), and 15/33 (B New Moon). Source rank30 owner-seat native target geometry changed as expected: authentic `PlayCardAction` player target became Bench slot0, and after each accepted dispatch the public Benched Clefairy gained a Psychic Energy. The original first two A control and treatment compact root-action SHAs remained equal **despite differing physical target sidecars**. This is why compact action labels are insufficient for full-game causal parity. In the B cases, diverting Basic Psychic made Mimikyu use *Filch* less often, altering the downstream root-action SHA and some physical actions, but the unqualified terminal winner remained the same.

The treatment did not establish a Rondo attack. Additional Psychic/Colorless Energy, Active mobility, Wondrous Patch activation, and competing Supporter/Item priorities remain unresolved. Because a single normal attachment is limited by the turn quota, its opportunity cost is material. **Do not promote this recipient fork into common gameplay or interpret the unchanged engine winners as evidence of strength.**

## Execution and checks

- Pure challenger: `simulation/twinleaf/agent7-rondo-psychic-bench-staging.cjs`.
- Opt-in independent proposal and scorer: `simulation/twinleaf/agent41-same-root-proposal-choice.cjs`, flag `rondoPsychicBenchStage`; both `sameRootChoiceApply` and development preference required.
- Acting-seat gate: `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, `AGENT7_RONDO_PSYCHIC_BENCH_DEV`, `AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT`.
- Original A/B/A with actual source-position parity and A-repeat hash tests: `simulation/evaluation/agent7-rank30-psychic-bench-stage-aba.cjs`.
- Pure unit regression: `tests/agent7-rondo-psychic-bench-stage.test.cjs`.
- Manual-only pinned compilation: `.github/workflows/agent7-rank30-source-psychic-staging.yml`.

**Field benchmark unchanged:** 29/32 exact original 60s, ranks 23/25/28 absent, zero qualified competitive games and no demonstrated 99.5%.

## Further physical target continuity: Rondo is funded in two treatment histories but remains Benched

The actual Store sidecar proves both staged Basic Psychic attachments landed on the **same physical Bench slot 0** in two cases:

- A champion: source turn24 first Psychic, turn30 second Psychic, same `Lillie's Clefairy ex JTG`; after the second accepted dispatch the visible Bench slot carries **two** Basic Psychic Energy, sufficient for printed P+C. The source nevertheless Passed later that turn without promoting Clefairy, and never used Rondo in the observed remaining actions.
- B New Moon: source turn15 first Psychic, turn33 second Psychic, same JTG Bench slot0; two attached Basic Psychic Energy. The source proceeded to use Active Mimikyu's *Filch* on turn33 and later source turns, with no Rondo.
- A New Moon and B champion: only one Basic Psychic was put on a Clefairy before the game ended, so their Rondo prerequisites stayed incomplete.

**This is a second, genuinely different opportunity after funding:** selection of a legal Active promotion may still be absent. Active Latias ex can sometimes grant free retreat to Basics with Skyliner, but its actual ability-lock status and native `CheckRetreatCostEffect` on this exact later original Store state were not measured here. Likewise, held mobility does not prove a legal switch. Do not assert that a Rondo attack was actually reachable until physical retreat/switch acceptance, native attack declaration, damage settlement and opponent reply have all been observed.

The full sidecar shows that `after.pokemon` uses the **printed native fullName including JTG**, which is the evidence basis for the summary correction.

## Corrected reporting fully reproduced in compiled pinned native CI

After the precise printed-name correction and the synthetic exact-print receipt test, [**manual CI 41348200964**](https://github.com/FlareZ123/experiment-01/actions/runs/41348200964) completed **successfully**. Its freshly computed native summary now prints `attachedBasicPsychicToClefairy: 2,1,1,2` for the four treatment rows, total **6**, and **0** for every A and A-repeat control. All four same-original-source full physical starting deals and A-repeat root/accepted-target comparisons passed again. Exactly the same four original untimed engine terminal winners persisted, no Full Moon Rondo attack. [Full corrected artifact 13100426376](https://github.com/FlareZ123/experiment-01/actions/runs/41348200964/artifacts/13100426376). This supersedes the flawed computed summary field in older artifact 13099034074; the older archive remains valid raw physical-target evidence for independent auditing.
