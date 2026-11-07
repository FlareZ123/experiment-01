# Reconstructing original seven-card opener versus postsetup first-root locations

**Agent 6 | 7 November 2026 | native printed-source read-only provenance, no competitive win-rate evidence.** [Preregistered 24-attempt manual GitHub Actions run 42334046899](https://github.com/FlareZ123/experiment-01/actions/runs/42334046899) **SUCCESS** at repository head \`c1ecfa4aaa8b964ba574d2edee7b2fb080589027\`, pinned Twinleaf \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`. [Machine-readable full attempt artifact 13559340293](https://github.com/FlareZ123/experiment-01/actions/runs/42334046899/artifacts/13559340293).

## Why the original seven matters

A [prior run](agent6-copycat-24triad-native-opening-zone-proof-20261107.md) safely captured a stable pre-action turn1 native Store snapshot, but its 'opening' zone pooled **current hand + staged Active/Bench Basics**, after setup and potentially after a first-turn draw or opponent-mulligan bonus draw. That observation cannot directly validate exact [seven-card starting hand + six Prize probability](agent6-copycat-27-location-opening-frontier-20261107.md).

The new \`createOriginalSevenCopycatCapture\` is a separate passive actual-Store instrument. It records named cards and Shadow Rider V count from the original rank1 source owner's **seven-card hand at their first genuine \`CHOOSE_STARTING_POKEMONS\` prompt**, before setup starting-card placement, and joins that receipt to six face-down Prize placements at the first stable turn1 PLAYER_TURN root. For each of Mimikyu GRI58, Dialga-GX UPR100, Hisuian Heavy Ball ASR146, and Forest Seal Stone SIT156: **in original seven => hand; otherwise Prized at stable first root => Prizes; otherwise original deck => deck.** The observer is created only on a registered B experiment arm, binds one actual Store instance via \`onRootStoreCreated\`, restores the unmodified dispatch before the first ordinary player action, and returns offline/private metadata **only after** the game. No owner decision can inspect named Prizes.

A caveat to preserve for future reproductions: a first starting-hand prompt must correspond to the **accepted seven**. This run's capture is first-attempt based; source mulligan histories should be cross-checked against \`initialSetupCompensation\` and source starting-prompt counts before treating the eight samples as unbiased legal-seven draws. The study is an instrumentation witness, not a distributional test.

## Preregistered game schedule and actual result

The frozen registration \`results/aichi-2026/registrations/agent6-copycat-exact-seven-24arm-native-20261107.json\` was committed **before** native execution: four independent Python \`secrets.randbits(32)\` seeds \`[2855357560,550392985,668611607,3710837965]\`, each with original rank1 champion versus original rank10 Regidrago in both physical-seat orientations, three identical **A-control / B-exact-seven-observer / A-repeat** modes = 24 source-dealt actual Store attempts. All modes use the same printed rank1 and rank10 card name/count 60s, explicit same-set Basic Energy printing translation and shared unqualified pinned SimpleTacticsAi policy; native root cap 96. Strict native prompt legality guard and recorded full physical-deal fingerprints are held fixed.

| Preregistered comparison | Actual evidence |
| --- | --- |
| Native original-deck attempts | **24/24** |
| Eight A versus A-repeat root-action SHA, status, winner and physical deal | **8/8 identical** |
| Eight B versus A exact matched root/status/outcome | **8/8 identical** |
| Eight actual root captures with a seven-card source receipt and six Prize reconstruction | **8/8** |
| Champion source and bilateral physical-deal digest identities | **8/8** |
| Engine errors | **0** |
| Native finished games (unqualified) | **3/24** |
| Unfinished native root-cap attempts | **21/24** |
| Focused first-seven capture tests | **4/4 passed** |
| Competitively qualified paper wins or matches | **0** |

The native terminal occurred on one source-seed/seat triad repeated in all three modes. It is not validated for opponent competence or official stage clock. The other seven groups were censored at the action cap; none is assigned a competitive outcome. The source/candidate are original card name/count sixties but not all historically verified physical printings: resolution explicitly maps champion 11 Psychic Energy MEE13 to the pinned equivalent Basic Psychic engine ID, and rank10 four Grass MEE9 plus two Fire MEE10 to the corresponding same-type engine IDs. These substitutions and card-effect fidelity remain outside paper qualification.

## True starting-seven H/P/D tally from eight B captures

| Original champion singleton | In original seven | Initially Prized | In original draw deck |
| --- | ---: | ---: | ---: |
| Mimikyu GRI58 | 1 | 1 | 6 |
| Dialga-GX UPR100 | 3 | 0 | 5 |
| Hisuian Heavy Ball ASR146 | 1 | 1 | 6 |
| Forest Seal Stone SIT156 | 0 | 1 | 7 |

**One of eight** source deals had exactly one of Mimikyu/Dialga initially Prized with Hisuian Heavy Ball outside both opening hand and Prizes (in deck). **Zero of eight** additionally had Forest Seal Stone and a Shadow Rider V in that source original seven. All observations are **experimental case counts**, not success probabilities. The exact combinatorial reference predicted single-core-Prized/Ball-in-deck in **14.383282%** of legal original sevens under independent uniform starting-hand/Prize deals. Eight native deals, split across just four seeded paired-seat groups, cannot meaningfully test that model or estimate a real match win rate.

The distinguishing contribution is an independently preregistered, native-pinned and intervention-free **join between a pre-setup source seven and its postsetup six Prizes**, avoiding the previous postsetup-frame ambiguity. For a first-turn Prize rescue line, future work should record actual owner K0/K1 deck search, public opponent lock constraints, real Ball acquisition and use, Forest Seal Stone as a one-use competing connector, and the complete Mimikyu Copycat -> Apex -> Timeless-GX resolution with all paper/native compatibility hooks and source reply.

## Source, code and reproduction

- Registration: \`results/aichi-2026/registrations/agent6-copycat-exact-seven-24arm-native-20261107.json\`.
- Source hook: \`simulation/evaluation/agent6-copycat-original-seven-capture.cjs\`.
- Source evaluator: \`simulation/evaluation/agent6-copycat-exact-seven-original-native.cjs\`.
- Four core tests: \`tests/agent6-copycat-original-seven-capture.test.cjs\`.
- Manual existing workflow opt-in: \`agent6_copycat_exact_seven: true\` in \`.github/workflows/mimikyu-copycat-regression.yml\`.
- Actions run [42334046899](https://github.com/FlareZ123/experiment-01/actions/runs/42334046899), archived [artifact 13559340293](https://github.com/FlareZ123/experiment-01/actions/runs/42334046899/artifacts/13559340293), head \`c1ecfa4aaa8b964ba574d2edee7b2fb080589027\`.

**Research admission remains unchanged:** 29/32 authenticated original 60-card name/count lists (missing ranks23,25,28), zero competitively qualified games, no finally selected fixed 60 and no demonstrated 99.5% field win rate.
