# Agent32: exact prompt classification for the v8 native aborts

**6 November 2026 | Agent32 | Development-only diagnosis.** This report does not qualify any competitive game, select a deck, or estimate a win rate.

## Question and provenance

What exact owner-visible prompt envelopes and last accepted public roots precede the five native decoder errors in the broader v8 eight-arm Issue25 run?

Source: [manual workflow run 42228565414](https://github.com/FlareZ123/experiment-01/actions/runs/42228565414), artifact 13506238955, checkout `46d6775ab50c90fa290a7d51c5d0cb142ffa6e3a`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. I independently downloaded and parsed `issue25-steward-v8.json`: 505,775 bytes, SHA256 `d30132ced995f6f0577937de501e86c0e3c51a9bd116b1891b42506118d81ce0`.

All five error rows carry the same redacted native-failure digest `2dc3a55f9b6d7dbc60aaa8883b43982e213957c44179b1baf52cb1139effe11f`. The adapter source `simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs` constructs the error with message `Native raw-State decision fallback reached before owner-safe policy closure` and code `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`. The archive retains the digest rather than the full thrown detail; the visible message/code above come from the exact pinned research adapter source.

## Five aborts, joined to their public accepted-root ledgers

| Registered attempt | Abort ordinal / turn / owner seat | Pending prompt | Public envelope | Last accepted root |
| --- | --- | --- | --- | --- |
| `6:210:B:new-moon-lockbreaker-v1` | 118 / 22 / 1 | `ChooseCardsPrompt` | `CHOOSE_CARD_TO_PUT_ONTO_BENCH`; min 0, max 2, cancelable | 117: candidate seat1 `PlayCardAction`, `Telepathic Psychic Energy` |
| `11:211:A:new-moon-lockbreaker-v1` | 88 / 17 / 0 | `ChooseCardsPrompt` | `CHOOSE_CARD_TO_PUT_ONTO_BENCH`; min 0, max 1, cancelable | 87: candidate seat0 `PlayCardAction`, `Telepathic Psychic Energy` |
| `1:212:B:champion-reference` | 98 / 22 / 0 | `ConfirmPrompt` | `WANT_TO_USE_ABILITY` | 97: `PlayCardAction`, `Radiant Eternatus` |
| `3:213:A:champion-reference` | 106 / 27 / 1 | `ConfirmPrompt` | `WANT_TO_USE_ABILITY` | 105: `PlayCardAction`, `Articuno-GX` |
| `3:213:A:new-moon-lockbreaker-v1` | 93 / 27 / 1 | `ConfirmPrompt` | `WANT_TO_USE_ABILITY` | 92: `PlayCardAction`, `Articuno-GX` |

The two ChooseCards rows are **strong Telepath candidates**: the exact public message and the preceding Telepathic Psychic Energy play align with the previously validated Agent8 owner-deck search component. They are not yet an exact source join. This v8 envelope omits `prompt.cards` object identity, the source CardList/zone, and the filter; the preceding accepted action alone does not prove causation.

The three Confirm rows are unresolved `WANT_TO_USE_ABILITY` prompts. Their source abilities are not identified by this artifact. The preceding Radiant Eternatus or Articuno-GX PlayCardAction is only the last accepted root, not proof that it caused the prompt.

## Reuse and next experiment

Agent8's existing `simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs` is a narrow owner-only handler for a genuine from-hand Telepath attachment followed by its fresh owner-deck prompt. Agent10's independently downloaded v5 cross-archive audit reports two actual Telepath attachments, two settled owner searches, four physical Basic Psychic Bench transfers, no custody/shuffle/native rejection errors, and unchanged initial deals across the original eight. See [Agent10's v5 result](agent10-issue25-telepath-v5-cross-archive-native-custody-20261105.md). That v5 result is mechanism precedent, not evidence that the v8 prompts are the same source.

A separate v8 treatment is now implemented in:
- `simulation/evaluation/agent32-issue25-v8-telepath-development.cjs`
- `tests/agent32-issue25-v8-telepath-development.test.cjs`
- `tests/agent32-issue25-v8-telepath-development.native.test.cjs`

It wraps the actual `headless.runMatch` boundary, reuses Agent8's handler without modifying it, and compares the unchanged v8 eight-arm registration and 128-root horizon against a treatment. The native test requires identical initial physical deals and exact accepted-root prefix parity, then requires actual owner prompt matching, Store settlement, physical Bench custody, and shuffle evidence for the two suspected rows. It retains all failures and remains explicitly unqualified. It is wired into the existing manual `twinleaf-completion.yml` Telepath lane under the existing input; no new workflow or workflow input was added. The first compiled treatment has now completed; its result and the follow-up audit-preservation rerun are recorded below.

The three ConfirmPrompt failures remain explicit. A separate source/owner-zone audit and specific, tested prompt policy are required before changing those decisions. Do not substitute default raw-State resolution or assume that a generic false/empty response is strategically sound.

## Limits

This classification establishes the public pending prompt class, message, options, owner seat, last accepted root and quarantine path. It does not establish prompt CardList identity for v8, exact ability origin for the Confirm prompts, a paper-valid game, a meaningful opponent response, or any competitive result. Current benchmark remains 29 authenticated original 60-card inventories, zero competitively qualified games, and no demonstrated 99.5% win rate.



## First v8 Telepath treatment result

Manual run [42258948231](https://github.com/FlareZ123/experiment-01/actions/runs/42258948231) executed both the existing v5 Telepath step and the new v8 treatment step successfully on checkout `6cfc129ada0d76d8fc34b3f6179055dca172c4e9`, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Artifact 13523941921 (`agent32-issue25-v8-telepath-same-eight-native.zip`) has ZIP SHA256 `9734ad73e6567b60a5f203c3d36f62c4828757367a394822692482bae5ee646c`. The control and treatment JSON sidecars independently match SHA256 `22b6efd5c77ca432a9ed17b78eb8df9d8c885d627d3877e6e830e87abcf4ebe1` and `f79e97c535b4be6bc09c9330516df0abb0fc02e1207728c023958faa9010b820`, respectively.

| Attempt | Control | Telepath treatment |
| --- | --- | --- |
| rank6 / New Moon | engine-error at root118, `ChooseCardsPrompt` | `ResolvePromptAction` at root118, followed by `ShuffleDeckPrompt` and `WaitPrompt`; reaches root128 cap |
| rank11 / New Moon | engine-error at root88, `ChooseCardsPrompt` | `ResolvePromptAction` at root88, followed by `ShuffleDeckPrompt` and `WaitPrompt`; reaches root128 cap |
| rank1 / champion | engine-error at root98, `ConfirmPrompt` | same engine-error at root98 |
| rank3 / champion | engine-error at root106, `ConfirmPrompt` | same engine-error at root106 |
| rank3 / New Moon | engine-error at root93, `ConfirmPrompt` | same engine-error at root93 |

The other three arms remained at 128 roots. Aggregate engine-error rows fell from 5/8 to 3/8; 5/8 treatment rows reached the 128-root cap. For **all eight** registered IDs, the treatment's complete public accepted-root ledger begins with the exact control ledger; the two Telepath rows then add the prompt, shuffle and later actions. Both the source-deal and full physical-deal fingerprints matched within each paired arm. The native test's per-target assertions passed for fresh owner-deck prompt matching, native prompt settlement, physical Basic Psychic Bench custody, shuffle witness, zero custody failures, and progression beyond the old abort root.

The first archive did not preserve the per-match Telepath audit object because the public receipt writer copied the manifest but not the additional diagnostic field. To make the detailed audit reproducible rather than relying only on passing assertions, the runner now also records the complete `nativeOwnerTelepathicAudit` in the actually executing manifest, and the native test asserts that manifest/diagnostic copies agree. A second run, **42259934232**, completed at checkout `8e9672b6e2f9291e3be0cd7ccb82e85b8b96114f` with the same inputs and preserved the full audit in the manifest. Artifact 13524921310 has ZIP SHA256 `adcfed62f4a2e42cb4405e480dc792522d1276c86c30f7228c7c37cc0825eac0`; control JSON SHA256 `7bc84b6a99f9e8bda68cc56801d8dda8f3aed1b6ebda9df78a668f8e5140af2c`; treatment JSON SHA256 `6c21758aeb4b2af65d2635440849d9787174d2b2257b4c20b4c937826d11f8b7`. Both JSON sidecars match their computed digests.

The first workflow's overall `abort-custody` job concluded failure after the two Telepath steps had succeeded. Later, unrelated Agent42 paid-Retreat tests had 2 passes and 6 failures (missing proposal-version metadata, a missing compiled `retreat-action` module, and a dependent fixture assertion). Post-job cleanup also warned that nested submodule path `vendor/twinleaf/vendor/pokemon-cards-css` has no URL in the root `.gitmodules`. This does not negate the successful v8 step/artifact, but the workflow as a whole was **not green**. Agent42's lease was active, so I did not alter its tests or workflow gating.

This is a useful **liveness** improvement only. It does not demonstrate a completed game, terminal outcome, opponent response quality, paper-rules completeness, or any win rate. The three ConfirmPrompt aborts remain unresolved.



### Exact Telepath audit from the second artifact

The actually executing manifest now embeds `nativeOwnerTelepathicAudit` (`nativeMatchCalls=8`):
- `6:210:B:new-moon-lockbreaker-v1`: one accepted from-hand Telepath attachment, one fresh owner-deck prompt, one submitted/settled selection; two cards (`Klefki SVI`, `Latias ex SSP`) physically moved to Bench; shuffle offered; no rejection, unsettled prompt, custody failure, or missing shuffle.
- `11:211:A:new-moon-lockbreaker-v1`: one accepted attachment, one owner-deck prompt, one submitted/settled selection; one card (`Gengar & Mimikyu-GX TEU`) physically moved to Bench; shuffle offered; no rejection, unsettled prompt, custody failure, or missing shuffle.
- Other six arms had zero Telepath attempts/searches.
- Across the eight matches, `readsUnopenedDeck=false`, `readsOpponentHidden=false`, and `competitiveGamesQualified=0`.

This proves the two original ChooseCards aborts were the Telepath owner-deck search. The v8 treatment did not merely bypass the quarantine: the owner-only handler observed the real from-hand attachment, matched the exact fresh owner deck prompt, submitted a selection, verified the native Store settled it, verified the selected card(s) physically entered Bench, and observed the shuffle prompt. The two rows progressed from 118/88 accepted roots to the 128-root cap.

### Exact source of the three remaining Confirm prompts

The pinned Twinleaf card implementations resolve the source ambiguity:
- Rank1 champion-reference row `1:212:B:champion-reference`: last accepted root97 is `PlayCardAction Radiant Eternatus` at seat0/turn22; the pending owner prompt is `WANT_TO_USE_ABILITY` at seat0/turn22. In the pinned [Radiant Eternatus CRZ implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus.ts), `reduceEffect` on `PlayPokemonEffect` creates exactly this ConfirmPrompt for **Climactic Gate**. If accepted, it creates a VMAX deck-search prompt with `allowCancel:false`, then a shuffle and ends the turn.
- Rank3 champion-reference row `3:213:A:champion-reference` and rank3 New Moon row `3:213:A:new-moon-lockbreaker-v1`: last accepted roots105/92 are `PlayCardAction Articuno-GX` at seat1/turn27; the pending owner prompts are `WANT_TO_USE_ABILITY` at seat1/turn27. The pinned [Articuno-GX CES implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/articuno-gx.ts) creates exactly this ConfirmPrompt for **Legendary Ascent** on `PlayPokemonEffect`; if accepted, it switches Articuno with Active and may create a Water-Energy `MoveEnergyPrompt`.

The root actor seat and pending prompt owner seat match in all three rows. These are card-specific source matches, not generic Wonder Tag prompts. The default pinned `ConfirmPromptResolver` returns `ResolvePromptAction(prompt.id, false)` for every ConfirmPrompt. A prompt-only owner-safe false resolver would reproduce the existing SimpleTacticsAi baseline without reading hidden state, but it remains an unimplemented/unvalidated follow-up. A stronger affirmative policy would need separate evidence and should not be conflated with this baseline.
