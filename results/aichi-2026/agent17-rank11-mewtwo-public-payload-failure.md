# Rank-11 New Moon: early Perfection lacks visible GX/EX payloads

**Agent 17, 19 October 2026 UTC. Evidence:** one retrospectively selected, source-dealt historical game under pinned Twinleaf, post-choice public observations. **Zero competitively qualified games.**

## Exact source provenance

- Frozen opponent: Aichi rank 11 Absol/Garbodor from `results/aichi-2026/full-decklists.json`; candidate: frozen 60-card New Moon Lockbreaker v1 from `results/als/new-moon-lockbreak-60-candidate.md`. This particular historical arm is `11:2:B:new-moon-lockbreaker-v1`, actual physical **candidate B starting first**, seed `623585882`, common candidate resource policy `agent41-bilateral-common-resource-policy-v0`, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Full four-arm replay [CI 39270208602](https://github.com/FlareZ123/experiment-01/actions/runs/39270208602), success at code head `7751a81`. Raw archive is downloadable from that run. A separate [archive-only reduction CI 39271790795](https://github.com/FlareZ123/experiment-01/actions/runs/39271790795) passed, with no engine compile or game replay.
- Identical archived source-side physical deal SHA-256 `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`. Actual historical New Moon root action ledger SHA-256 `646c06f1d8a52f426689b877c1cc84f530ef22c36f0fd55ac34573ef6d8d4979`. These are **identity checks**, not proof of complete paper-rule fidelity. The separately recorded reference-deck candidate arm shares the source-deal fingerprint, but its distinct root history is not an independent opponent observation.
- New observation code `simulation/twinleaf/perfection-post-pass-probe.cjs` captures *only* the actual acting owner's face-up Bench and discard attack-bearing Pokémon. `simulation/evaluation/agent41-bilateral-v2-development.cjs` associates cloned Perfection probes with same-decision `publicBoardBeforePass`; `scripts/aichi-bilateral-pass-evidence-summary.cjs` reports them without inventing attack eligibility.

## Real early Pass board states

| Actual global turn before candidate Pass | Active Mewtwo & Mew-GX Energy | Eligible GX/EX Pokémon in candidate discard | Candidate Bench | Opponent Garbodor in play? | Detached Perfection activation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 Psychic | 0 | Duskull, Latias ex | No, Trubbish only | `CANNOT_USE_POWER` |
| 3 | 1 Psychic | 0 | Dusclops, Latias ex | No, Trubbish only | `CANNOT_USE_POWER` |
| 5 | 1 Psychic | 0 | Dusclops, Latias ex | No, Trubbish only | `CANNOT_USE_POWER` |
| 7 | 2 Psychic | 0 | Dusclops, Latias ex, Solrock, Klefki | No, Trubbish only | `CANNOT_USE_POWER` |

Mewtwo & Mew-GX held **Powerglass** throughout. The opponent's visible board had one or two **Trubbish**, and later a Mega Absol ex with Float Stone; no evolved, Tool-equipped Garbodor appears in these four captured windows.

Crucial printed distinction: Mewtwo & Mew-GX (UNM, card `sm11-71`) Perfection specifically refers to attacks of **Pokémon-GX or Pokémon-EX** on **your Bench or in your discard pile**. The Bench's `Latias ex SSP` is a modern lowercase **Pokémon ex**, which does **not** meet that text. Duskull, Dusclops, Solrock and Klefki are also ineligible. The public copy-source inventory therefore contains **zero valid species of the stated GX/EX categories** in each sampled state.

This establishes an immediate *necessary setup prerequisite failure* on all four sampled turns: no attack can be copied via Perfection from these visible regions. It provides a sufficient explanation for an empty copied-attack menu without requiring an opposing Garbotoxin lock. It does not establish that the generic `CANNOT_USE_POWER` is uniquely attributable to that condition internally, and the first turn going first independently bars attacking. In contrast, the source's intended Gengar & Mimikyu-GX copied **Horror House-GX** costs one Psychic, and the repository's staged pinned-Store positive control with Gengar & Mimikyu-GX in discard and one Psychic attached does expose that attack.

## Causality still unresolved

The frozen candidate has exactly one Gengar & Mimikyu-GX, one Trevenant & Dusknoir-GX and **two Battle Compressor**. Neither GX payload had reached the public Bench/discard at any sampled early Pass. This trace establishes a *missing payload* at observation time. It **cannot distinguish** a Prized or inaccessible payload, a held playable Compressor deliberately or mistakenly unused by the bot, a prior deck-search opportunity missed, or some other private setup issue.

A separately isolated, single-arm, historical owner-hand continuation is being developed to distinguish those cases while preserving exactly the same source deal and root action sequence for an observational rerun. Even if a missed legal setup appears, it must be tested as a **new actual Store line** and against meaningful source replies before it counts as improvement.

Other limitations: the rank-11 New Moon development game was action-capped at 260, had **zero candidate attack declarations**, and involved a generic hidden-information-unsafe bot. The four sampled Perfection tests were bounded detached post-Pass probes on **one correlated source deal**, not four independent games; later 20 unprobed candidate passes do not inherit the conclusion. No Japanese source-print equivalence, official clock, complete opponent policy, full-game result or win rate is certified.

**Next discriminating action:** compare the actual acting-owner hand and public resource actions immediately preceding turns 3, 5 and 7 to the absence of GX/EX public payloads, then test a purposeful Battle Compressor or Bench setup via a separate legally dispatched candidate policy. **No 99.5% result follows.**
