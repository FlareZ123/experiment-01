# Prospective rank11 first-turn conditional Store-screen ledger

**Agent 2, 18 October 2026.** Status: seed frame precommitted, source-printed, gameplay-outcome-free experiment under an existing manual CI workflow. **Evidence class: initial-state measurement and future counterplay selection only.**

## Scientific question

A narrow v1 autonomous rank11 Tool-Garbodor opener has a confirmed source-dealt 11-action positive fixture (seed `1244180408`). But the ordinary 64-arm candidate benchmark has poor exposure to it; its first 16 arms contained no opportunity and reused physical seat/seed pairs across candidate decks. The [live K0 screen](../twinleaf/rank11-first-decision-source-screen.md) now has a genuine pinned Store source-positive and independent physical-hand replay proof. It can audit a large stream of first-turn opportunities with far less game compute than a full engine continuation.

**This design deliberately conditions on the opponent's known printed rank11 source being in physical seat A against the rank1 reference in B.** It is a *mechanical challenge frame* and is **not the multi-opponent, both-seat field-performance design**. Source-first frequency under the fixed seeded engine, precise K0 triggering, and later K1/final lock outcomes remain distinct observable quantities.

## Precommitted registration

[The frozen registration JSON](registrations/rank11-conditional-firstturn-k0-v1-20261018.json) was committed in `8bf45e8cab3a3f96602847fcb84f5dd1deadd065` before any matching Store screening. Registration SHA-256:

`b09ea18666286856f69337581eaf10730ee3ac946bd501e42b04c914e18151bb`

It binds:

- Exactly published Aichi **rank11 Wataru Yano Absol/Garbodor** rank11 SHA-256 `967308cd60e92348d8069a348174d816efcaa06f3825a3cf45b64886facb1273`, physical A.
- Published **rank1 Yasunori Kato Shadow Rider** candidate `85d816b20b514bcf2936fbeca79d9577f745bc7e1e7e151c3234fd6c9ea81f52`, physical B.
- Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, known `rank11-autonomous-boostshake-v1` first-turn guard, pinned source-screen Git blob `de384a26e103acdc57e5d287d4c6633d8482cb60`, opener blob `4eb0f84b0fca36922b8a32b5d753ffbf6ef3d488`.
- Exactly **512 deterministic nonzero distinct 32-bit seeds**, indices 0–511, in sixteen fixed partitions of **32**. Each seed is the first little-endian 32-bit integer of SHA-256 on the compact JSON array `[seedDomain, 20261018, index]`, with domain `aichi-rank11-predecision-conditional-K0-v1`. There is no outcome-dependent seed search. All indices are derivable from this frozen frame before any execution.
- A 200-Store-action fail-safe solely for reaching first ordinary player decision. Captures all attempted seeds, errors and actual-first statuses; select only **draw-log-verified original-Store rank11-first K0** conditions. K1 prompt targets, final lock execution, and candidate responses are not observed in this screening phase.

[The screened attempt ledger implementation](../../simulation/evaluation/rank11-conditional-k0-screen-run.cjs) verifies the frame digest, source printing hashes, engine revision and immutable K0-screen/opener blob identities, then calls real `runMatch` up to the first bot root action. The stop is implemented by a reversible temporary hook; no cards, turns or hands are injected. The output's raw rows include *every* screened seed, verified source-first status, K0-positive flag and exceptions. The [pure partition tests](../../tests/rank11-conditional-k0-screen-run.test.cjs) enforce 512 unique nonzero seeds, complete 32-attempt row denominators, rejected-trial preservation and no competitive score fields.

## Interpretation and qualification

The model's `selectedK0` count does **not** estimate successfully executed first-turn Garbodor, even within this fixed source matchup. The `rank11-autonomous-boostshake-v1` policy can fail after an eligible K0 decision when printed deck search targets are Prized or unavailable, when selection prompts require alternative actions, or when opponent responses change. Follow-up K1 and opponent-response studies must require authentic replay equality at the first-turn decision and separately demonstrate the actual actions.

A seed selected by condition is valid for challenging a **specific mechanical counterplay state**, and must never be scored as an unselected competitive matchup win. Future full-strength evidence should come from independent candidate-vs-all-32 source decks, both true starting orders, validated paper effects and sufficiently skilled action policies.

**Field remains 29/32 full print-resolved opponent lists and zero competitively qualified games.** Ranks 23, 25 and 28 remain unresolved.


## Observed full 512-attempt screen, frozen before any continuation

[Manual compiled CI **39097916869**](https://github.com/FlareZ123/experiment-01/actions/runs/39097916869) **passed**, head `4c5c171df2a3b794de28b517cee30118256e3482`; test suite **66/66 passed**. Archived original 512-row artifact [12125432682](https://github.com/FlareZ123/experiment-01/actions/runs/39097916869/artifacts/12125432682), SHA-256 ZIP digest `53043fd481aa974e65bcf7a3b1d1cc805c2363b9e8a62a9173c245997b248557`.

| Precommitted original-Store opening diagnostic | Observed |
| --- | ---: |
| Total unique scheduled seeds screened | **512** |
| Rank11 actually first, verified from genuine draw state | **267** |
| Source rank11 original-decision `v1 openingOpportunity` true | **5** |
| All verified remaining non-K0 | **507** |
| Unverified first draws | **0** |
| Engine screening exceptions | **0** |
| Qualified competitive games/wins | **0** |

The conditional K0 positives were determined by owner-visible first-turn hand and public board, **before any rank11 policy continuation**. Their seed/index pairs, in original precommitted index order:

| Index | Engine seed |
| ---: | ---: |
| 82 | `2365845580` |
| 159 | `1841861201` |
| 198 | `3388373692` |
| 295 | `2806488363` |
| 305 | `1762595892` |

No selected game was tested or scored before committing [the five-selected-continuation registration](registrations/rank11-k0-selected-continuations-v1-20261018.json), registration SHA-256 `5a0719430593a780282499894cd6c16d5e8c4cb09dbcbffcb512b379435488d1` and commit `63bf4d993c2e346ce05d38e9867083c36cb131fa`.

Descriptively, **5/512** (0.9765625%) scheduled attempts and **5/267** (approximately 1.87266%) actual source-first openings met this narrow live K0 predicate. These observed seeded-engine counts should not be equated to the earlier **2.23068% static hand/search-target necessary-event census**, since the predicates and empirical setup/Active conditions differ. They are not independently policy-qualified matchup observations. The 512 records contain all eligible and ineligible trials; their screening provenance survives even if later selected counterplay runs fail.
