# Frozen 512-run rank-11 owner-hand screening for the Star-fetched VIP branch

**Agent 32 | 30 October 2026 | retrospective read-only source-hand census.** Evidence comes from previously registered original Twinleaf Store opening rows, without native setup reruns or competitive-game results.

## Frozen archive and provenance

The original [Agent 2 rank11 conditional K0 study](rank11-conditional-K0-screen.md) preregistered 512 distinct fixed 32-bit seeds, original published **rank11 Wataru Yano Absol/Garbodor** in physical seat A and original rank1 Shadow Rider in seat B. The Twinleaf revision is **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. Its [compiled manual CI 39097916869](https://github.com/FlareZ123/experiment-01/actions/runs/39097916869) passed, and the frozen 512-record ZIP is [artifact 12125432682](https://github.com/FlareZ123/experiment-01/actions/runs/39097916869/artifacts/12125432682).

Downloaded the original ZIP and verified SHA256 **53043fd481aa974e65bcf7a3b1d1cc805c2363b9e8a62a9173c245997b248557** against its publication. The archived JSON records SHA256 is **4f1d37c273de8f12dd0f07ceeec14079250464c4e7c594b56321156991d7f8c7**. This audit reads only the actual source player's own first-decision hand, actual first player and initial Active from the frozen rows. It makes no native actions and does not change the original experimental frame.

Reproducer: [read-only archive auditor](../../scripts/agent32_rank11_k0_archive_audit.py) and [pure tests](../../tests/test_agent32_rank11_k0_archive_audit.py). The auditor refuses nonmatching ZIP SHA256, wrong original rank/seat/engine, incomplete attempt denominator, unverified source-first or missing source-hand data. Pure owner-boundary tests also **passed** in the existing manual [Aichi opening audit CI 40985816929](https://github.com/FlareZ123/experiment-01/actions/runs/40985816929), at head **c54f2393e968bc88be98693119dcfc45164ef6ad**, after the new test was registered.

## Exact owner-hand census

| Frozen owner observation | Count |
| --- | ---: |
| All original preregistered attempts | **512** |
| Native draw-verified source rank11 actually first | **267** |
| Of those, Oranguru V selected Active | **52** |
| Of those, Boost Shake EVS held in source's own first-decision hand | **15** |
| Of those, **neither Trubbish FST nor Battle VIP Pass FST held in source hand** | **8** |

All eight original attempt indices and seeds:

| Index | Seed | Source own-hand cards | Forest Seal Stone held | Float Stone held |
| ---: | ---: | ---: | --- | --- |
| 2 | 1462371689 | 7 | Yes | No |
| 137 | 3855389153 | 5 | No | Yes |
| 232 | 2301458581 | 7 | Yes | No |
| 233 | 3471823849 | 9 | Yes | Yes |
| 299 | 2387754768 | 7 | No | No |
| 376 | 2549346519 | 6 | No | No |
| 440 | 1518908781 | 6 | No | No |
| 458 | 2375861161 | 7 | No | Yes |

All eight have **fewer than two Garbodor BKP cards in the source's observed hand**. None was selected by the archived older direct openingOpportunity predicate, which tests a different necessary condition and does not establish an AI error.

## Interpretation and evidence limit

The original K0 artifact **does not identify the initially Benched Pokémon**. Its source hand excludes any Basic that was Benched during setup. Thus an absence of Trubbish *in the hand* does **not** prove absence of a Trubbish *already on the Bench*. In that case the event would belong to a different, easier search route, and is excluded from the mathematically disjoint Star-fetched VIP branch.

The artifact also does not reveal the exact post-Prize search deck, the legality and actual selected targets of Back Order/Star Alchemy, or the completed equipped-Garbodor evolution. Starting hand sizes vary with Bench setup and possible opponent mulligan bonus draws, whereas the finite-population model assumes exactly the original seven plus one ordinary first-turn draw.

Consequently, **8/267 is a source-first hand-only shortlist**. It is neither an empirical estimator of the [exact 3.20644156% K0 eight-card condition](agent32-rank11-oranguru-boost-shake-exact-window-20261030.md) nor evidence that eight disjoint searches were executable. It is a read-only diagnostic from an older, preregistered source-ranked experiment.

## Next native falsification

A genuinely owner-visible **initial Bench public snapshot** at each original K0 root can distinguish already-benched Trubbish from absent Trubbish. A fresh precommitted source-dealt K0 scan could also record the needed source-owned fields. In qualifying states, authenticate the native sequence Back Order → exact Tools and recipients → Star Alchemy's single VIP → VIP's exact Trubbish transfer → held Boost Shake's first-turn Garbodor evolution with Float Stone, followed by an actual opponent response. Compare K0 hand availability with K1 post-search deck membership without giving a bot hidden truth. Reuse Agent41's single common executable and preserve original unchanged source 60s.

**Status remains 29/32 exact field original sixties, ranks 23/25/28 missing; zero competitively qualified games and no demonstrated 99.5% fixed-60 win rate.**