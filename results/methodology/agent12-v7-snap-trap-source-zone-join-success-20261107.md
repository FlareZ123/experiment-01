# v7 Snap Trap source-to-public-zone join established

**Agent 12 | 7 November 2026 | phase-A integration diagnostic**

## Result

The v7 integration successfully joined the exact Galarian Stunfisk Snap Trap reducer prompt to the live Store prompt and its public attached-Energy zone. The previous v6 source-to-live identity gap is resolved for this observed event.

- Workflow run: https://github.com/FlareZ123/experiment-01/actions/runs/42398449855
- Run: **42398449855**, run number 10, manual dispatch, conclusion success
- Head commit: `eb53177105ea4583e60a0c06c070749f15c117e0`
- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- v10b source runner: `e4ea259dbfedc623b90c2f06321432368c89e8f5`
- Agent30 marker v2: `daf66d330a441523fee4a74d9f5087ad97298434`
- Agent36 observer v7: `5d559586c418697188ffea4d3e82e82b0baf9f5e`
- Frozen registration SHA: `24d2a8a11044e9c0325e56313af677b67fcc7501`
- Artifact ID: `13584092763`
- Artifact ZIP SHA-256: `906ea4d8817c7afed07f391332287cb3c739b7fe4cb677be53537657e28d0067`
- Artifact JSON SHA-256 (from the included checksum file): `3309f9413bcd18b17bad9d21fe5fd876369d64812428987ee181a146e529daef`
- Pure tests: **93/93 passed**, including marker v2, observer v7, strict same-object runner join, public-zone checks, selection and quarantine tests.

## Exact source and prompt

The diagnostic observed one exact source invocation:

- Source: **Galarian Stunfisk SSH**, ability **Snap Trap**, active on seat 0.
- Attacker: **Marshadow UNB**, active on seat 1.
- Turn: **54**.
- Last attack fingerprint: **Red Knuckles**, seat 1, turn 54, phase 2.
- Prompt: `ChooseCardsPrompt`, message `CHOOSE_CARD_TO_DISCARD`.
- Prompt parameters: minimum 1, maximum 1, cannot cancel, non-secret.
- Filter: exact `SuperType.ENERGY`.
- Prompt's `cards` is the attacking PokemonCardList; `cards.energies` is the exact attached-Energy sublist.
- Offered cards: eight Psychic Energy MEE, all from the opponent Active Pokemon's Energy subzone.

The observer matched exactly one public zone: the opponent Active PokemonCardList, with exact container and attached-Energy sublist references, public visibility, and eight eligible Energies. The live board snapshot recorded Galarian Stunfisk active with one Capture Energy RCL and Marshadow active with eight Psychic Energy MEE.

## Identity join

The key v7 proof is:

- Pre-Store prompt ID: `0` (unassigned sentinel).
- Post-Store prompt ID: `173`.
- `promptIdAssignedByStore: true`.
- Marker `pendingNativePromptId: "173"`.
- Observer event `promptId: "173"`.
- `sourceOriginSameObject: true`.
- `promptEventsByIdCount: 1`.
- `zoneAndPromptIdProof: true`.
- Selection status: `FALLBACK_CAPTURED_SOURCE_AND_PUBLIC_ZONE_MATCHED`, one candidate, complete join, no missing fields.

The marker's `blockedPromptOriginEvents` remains empty because the Agent4 fail-closed quarantine intercepts the decoder. This is expected: v7 obtains the source origin from the marker's scoped WeakMap callback on the same prompt object inside the Store.prompt observer. The quarantine record is independent and separately captured: seat 0, turn 54, phase 3, pending prompt, ChooseCardsPrompt. The selection helper joined that record to the one source/zone event.

## Limitations

This is a **phase-A diagnostic**, not a completed game:
- Eight native attempts were run; six native terminals, one root cap, and one engine error were recorded.
- The observed prompt remained quarantined. No card was selected or discarded by this diagnostic.
- No competitive game qualified.
- `treatmentAttributionComputed=false`.
- `winRateEstimate=null`.

Therefore, v7 establishes that the pinned engine's Galarian Stunfisk SSH / Snap Trap reducer generated this exact mandatory one-Energy prompt against Marshadow UNB, and that the prompt's offered Energy cards came from the opponent Active Pokemon's public attached-Energy sublist. It does **not** establish the effect's completed resolution, the downstream game-state change, a matchup win, or any deck win-rate estimate.

## Next research actions

1. Preserve this v7 source/zone identity join as the current diagnostic baseline; do not regress to the v6 decoder-only origin path.
2. Keep Agent4 quarantine fail-closed until the exact ChooseCardsPrompt response contract and paper Snap Trap timing/effect have been independently verified against the pinned rules/card text.
3. Add a narrowly scoped, actor-owned resolver only after that contract is verified; test that it selects exactly one legal Energy from the same public sublist, settles the prompt, and records the resulting energy removal.
4. Then test complete native games with the same pinned engine, registration, candidate lists and decision policies before claiming any competitive result.


## Namespace verification rerun

After moving Agent12's new observer and tests into the required research namespaces, the existing manual workflow was rerun successfully:

- Workflow run: https://github.com/FlareZ123/experiment-01/actions/runs/42399320595
- Head: `451d828b2d4f5f31c61132bd4af9fc4cae828dad`
- Updated frozen registration SHA: `114796347b81fe2f1baae5fe752f9e77067b6e01`
- Namespaced observer: `simulation/twinleaf/agent12/issue25-public-prompt-zone-audit-v7.cjs`
- Namespaced tests: `tests/2026-11/agent12-issue25-public-prompt-zone-audit-v7.test.cjs` and `tests/2026-11/agent12-issue25-public-prompt-zone-diagnostic-v7.test.cjs`
- Artifact ID: `13585146038`
- Artifact ZIP SHA-256: `2c347366b8b917a18d79433a2d8eb01d8ac9e0fa3b676c6f0bafd611bc5933c2`
- Artifact JSON SHA-256: `16f74562d79eadb5dbdaa1ceea10fa36f80fb83189bd612a70775fcf687d6707`
- The 93-test suite, compile, syntax checks, and phase-A runner all passed again. The artifact reproduced `FALLBACK_CAPTURED_SNAP_TRAP_SOURCE_AND_ACTIVE_ENERGY_ZONE_MATCHED`, with the same `0 -> 173` prompt ID, same-object source origin, one public attached-Energy zone match, one independent quarantine match, and selection status `FALLBACK_CAPTURED_SOURCE_AND_PUBLIC_ZONE_MATCHED`.
- Phase-A limitations are unchanged: eight attempts, six native terminals, one root cap, one engine error; zero competitive games; no prompt resolution or win-rate estimate.

This rerun confirms the namespaced paths preserve the v7 diagnostic result. Agent30's new marker/observer files are still pending their separate namespace move; the current registration continues to pin the existing marker v2 path and SHA.


## 2026-11-07 18:39 UTC: Agent30 namespace migration and v7 phase-A rerun

The remaining new Agent30 v7 files were moved out of the oversized flat roots. The original v7 registration and its exact marker dependency were preserved for historical reproducibility.

- Namespaced marker copy: `simulation/twinleaf/agent30/stunfisk-snap-trap-prompt-marker-v2.cjs`, blob SHA `be6b7d4d8bbd881e1980b93047b337a7fbb8a5b1`.
- Namespaced Agent30 observer: `simulation/twinleaf/agent30/issue25-public-prompt-zone-audit-v7.cjs`, blob SHA `5fe29325af623b6c7e2b8cc6a3262a68806c1d12`.
- Agent30 pure/integration tests now live under `tests/2026-11/`; the marker test import was updated.
- Historical compatibility: the original flat marker remains byte-identical at `simulation/twinleaf/agent30-stunfisk-snap-trap-prompt-marker-v2.cjs`, blob SHA `daf66d330a441523fee4a74d9f5087ad97298434`, because the original frozen v7 registration and earlier artifact identify that exact path/SHA. The superseded flat Agent30 observer and two flat tests were deleted.
- New namespace-only frozen registration: `results/aichi-2026/registrations/agent36-issue25-public-prompt-zone-diagnostic-v7-namespace-20261107.json`, blob SHA `9787aa2ea7b1fd9d49072fbbe502bab2c2be2f8b`. It records the new marker path/SHA and explicitly supersedes the original registration by path and SHA. The original registration file remains unchanged.
- The Agent36 v7 runner now pins that new registration SHA and writes the new registration path into its artifact. Both existing manual-only workflows were updated for the new marker/test paths; no new workflow or push trigger was added.

**Namespace migration verification run:** [GitHub Actions run 42402401871](https://github.com/FlareZ123/experiment-01/actions/runs/42402401871), run 12, head `5ebc19f6ea53b0f12bfc2556d44a0ad58b775a82`, conclusion **success**. The pinned Twinleaf compile, syntax checks, 93-test suite, and frozen v10b phase-A runner all passed. Artifact ID `13586390604`, ZIP digest `sha256:40b970ae0fb65af81b912aa88d51c53c7c9cb98683f51c25d45961bfb22c3ef9`.

The experiment remains strictly phase A. This rerun confirms the namespaced code and frozen registration resolve correctly. It does not resolve the prompt, attribute a treatment effect, qualify a competitive game, or estimate a win rate. The earlier statement that Agent30's namespace migration was pending is superseded by this section.
