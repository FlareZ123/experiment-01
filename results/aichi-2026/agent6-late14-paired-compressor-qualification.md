# Late14 owner-Compressor development: paired archive and attack-effect boundary

**Agent 6, 19 October 2026 UTC. Independent second-reader audit.** This report compares the original canonical four-arm common-policy archive with Agent 5's late14 historical development replay, preserving all attempted arms, failures and censoring. It is a **policy-mechanics observation**, with zero competitively qualified games and no deck-strength inference.

## Immutable sources and comparison

- Baseline: [manual CI 39334611748](https://github.com/FlareZ123/experiment-01/actions/runs/39334611748), artifact **12226307087** (`agent5-common-compressor-historical-develop.zip`), original downloaded ZIP SHA256 `27d65bce2c2650ac97c9766dc342530542d2b177c0b8f695c08e0e89d43fd80a`. Its inner `agent5-bilateral-baseline.json` SHA256 is `3597e2f7c4d7113fa01f1e2c05fb6dc989fffd80b9d3c3a285481231535482ea`.
- New optional late-window treatment: [manual CI 39337626879](https://github.com/FlareZ123/experiment-01/actions/runs/39337626879), artifact **12228230445** (`agent5-late14-canonical-compressor-dev.zip`), ZIP SHA256 `ea4c2184234b51eb61ff93394ffb90862598efefe696bb58262b2040d967aaab`. Inner `agent5-bilateral-late14-compressor.json` SHA256 `1bd89dc99fb069015be81c8e89572d03c7e90b2b071145a1c742f4cdc6f6f0e7`.
- Exact 60-card source decks, trial IDs, source physical deal fingerprints, source initial observed hand digests, actual first-player seats and seed IDs match arm by arm. Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The candidate policy is the same common v0 plus explicitly opt-in `newMoonAttackPayloadCompressorLateSeat`. The historical seeds are already inspected and cannot be treated as prospective.
- The [fail-closed archive classifier](../../scripts/agent6-late14-paired-archive-gate.cjs) and its [three pure regression tests](../../tests/agent6-late14-paired-archive-gate.test.cjs) bind the real owner Compressor root, subsequent own-deck selection and copied-attack declarations. Their three cases passed an independent V8 regression harness. This validates the classifier's pure logic, **not** compiled Store execution.

## Four-arm paired disposition

| Historical fixed arm | Original common v0 | Late14 owner Compressor | Exact root ledgers |
| --- | --- | --- | --- |
| rank6 / champion / candidate A | 90 roots, engine terminal, candidate 3 attacks | same 90 roots / same outcome | identical |
| rank6 / New Moon / candidate A | 260-root censor, candidate 0 attacks | same 260-root censor, candidate 0 attacks | identical |
| rank11 / champion / candidate B | 224 roots, engine terminal, candidate 1 attack | same 224 roots / same outcome | identical |
| **rank11 / New Moon / candidate B** | **260-root censor, candidate 0 attacks**, 22 source attacks | **164 roots, candidate 2 attacks, 9 source attacks**, candidate engine terminal | changed |

For the changed rank11 trial `11:2:B:new-moon-lockbreaker-v1`, seed **623585882**, both arms fingerprint the same initial source deal `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`. The source's initial-hand digest remains `895885a2079ee2253592e244060f31b4f4beec67d0621ca45636785e1e17074f`. **Candidate physical seat B went first**. The early source Boost Shake policy had `completed:false`, with no eligible source opportunity detected: this is **not** a tested timely Garbotoxin lock.

The late branch actually submitted `PlayCardAction` for **Battle Compressor** at global turn **11**, Store root **96**. A genuine owner-deck search at root **97**, linked to parent root 96, selected `Gengar & Mimikyu-GX TEU` and `Trevenant & Dusknoir-GX SMP`. The candidate then declared **Poltergeist** at global turn **21**, root **149**, and again at global turn **23**, root **162**. The delay to first declaration was **10 global turns**, with nine source **Terminal Period** declarations earlier or during this interval.

The opt-in run reached a pinned-engine candidate win: `finished:true`, `winner:1`, final Prizes **[6,0]**, source with no Active Pokémon and candidate Mewtwo & Mew-GX Active. The baseline was **action-censored** at root 260, without a game result. This is a genuine **selected-action conversion** from an owner-only setup line. It does not prove a competitive counter to an opponent's earliest lock, and the censored original cannot be scored as a real loss.

## Remaining attack-effect and strength gate

The archived late packet reports **11 settled public attacks across both players** but only includes the **first two settled public transitions**, which belong to the source. It separately includes the two candidate Poltergeist **declarations**, without the per-attack settled damage, Knock Out, Trainer-count or actual opponent response packets for those declarations. Thus **printed Poltergeist effect validity and its resulting Prize transitions are not independently bound by this archive**. The engine result cannot cure that evidence gap. A future read-only change to the canonical runner could archive *all post-prompt-settled candidate declarations* with relevant pre/post public HP and Prize data, retaining source conservation and distinguishing attack resolution from declaration.

Likewise, the nine source Terminal Period uses, absence of early Tool-Garbodor in this selected source-second match, opponent action selection, clock, and full-field transfer remain unqualified. Rank6 New Moon remains zero-attack and censored on the matched old seed. Do not infer a 99.5% field win rate, a ranking of fixed candidate 60s, or a competitive advantage from this mechanistic development.

**Research decision:** preserve the candidate 60 and the unchanged baseline. Upgrade the common policy's copied-attack effect/reply instrumentation before conducting a fixed prospective cross-archetype evaluation. The independent classifier explicitly outputs `competitiveQualifiedGames:0` and rejects changed source fingerprints.

