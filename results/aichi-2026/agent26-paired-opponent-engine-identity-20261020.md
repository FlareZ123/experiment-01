# Agent 26: paired-trial opponent engine-inventory integrity

**20 October 2026, normal research.** Evidence class: source-code inspection and synthetic fail-closed regression, verified by an existing manually dispatched GitHub Actions workflow. This is not a Pokémon match or a win-rate estimate.

## Identified counterexample

The existing `hasPairedTrialSchedule` function in `simulation/evaluation/aichi-evidence-envelope.cjs` compares phase, rank, repeat, seed, candidate engine slot, published opponent digest and draw-log-proved actual starting order. That is useful, but the source printing digest alone does not establish that both **resolved Twinleaf opponent deck inputs** were identical. The pairing helper previously accepted two archived arms even if one independently self-consistent completed row held a different opponent `expectedEngineDeckHashes[opponentSlot]` and `observedEngineDeckHashes[opponentSlot]`.

This matters because source printing resolution, mappings and special hooks may drift even with identical published source cards and scheduled RNG seed. Comparing such arms as equal-source paired experiments would mix the intended candidate treatment with a changed opponent engine inventory.

## Correction and falsification

The existing helper now extracts the actual opponent slot for each row and requires a well-formed 64-hex `expectedEngineDeckHashes` value, identical `observedEngineDeckHashes` for that slot, and **the same opponent engine hash across both matched archives**. It retains candidate-deck freedom: `expectedEngineDeckHashes[candidateSlot]` may legitimately differ across experimental arms. Missing opponent observation fails closed. It leaves historical aggregate audits and source-mirror alias handling unchanged.

`tests/aichi-evidence-envelope.test.cjs` adds one adversarial regression that:

1. Affirms a different candidate engine deck still pairs when the source engine inventory matches.
2. Changes only one physical opponent deck hash and its matching observed hash, leaving each archive internally self-consistent. `auditArchive` still passes, but pairing now rejects the contrast.
3. Deletes the opponent-observation channel and verifies the paired comparator rejects the record.

**Compiled/workflow evidence:** [manual Aichi benchmark statistical tests #39396701149](https://github.com/FlareZ123/experiment-01/actions/runs/39396701149), workflow-dispatch under exact research head `94d733b814588e2f3e8639eb08f924f0ab89da1f`, completed **success**. This workflow includes `tests/aichi-evidence-envelope.test.cjs` in its Node benchmark stage. Code commits: [source integrity check `47e1f8a`](https://github.com/FlareZ123/experiment-01/commit/47e1f8a6be817af08227757fe64ceb84e9fde6b0) and [adversarial regression `94d733b`](https://github.com/FlareZ123/experiment-01/commit/94d733b814588e2f3e8639eb08f924f0ab89da1f).

## Interpretation and limits

This closes a **necessary engine-inventory pairing condition**. It does not independently authenticate card text, initial RNG state, mulligan behavior, opening-hand overlap, immutable rules, source-policy competence, Store-level actions or a source-dealt lock response. Even one perfectly matching opponent 60 plus seed does not establish identical **physical opponent opening zones** when candidate lists and mulligan draws differ. For prospective rank-6/rank-11 comparison, preserve source-zone/deal fingerprints, candidate-specific lock applicability, both actual starting orders, all unfinished or rejected attempts, and the strict policy/attack evidence gates. Do not silently retroactively upgrade older archives.

The shared field status remains **29/32** exact source 60s recovered (ranks 23, 25 and 28 absent), **zero competitively qualified games**, and no demonstrated fixed-deck 99.5% win rate.
