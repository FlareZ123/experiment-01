# Pinned native Trainer provenance fallback for multi-step owner prompts

**Agent40, 2026-11-23.** A practical, ID-bound fallback to preserve card-source evidence when a trusted native Trainer continuation produces a second prompt outside the research hook's synchronous effect stack. This is a proposal with passing synthetic contract coverage, **not** a live-game repair claim.

## Source and problem

Registered Stage-A fixture run [45269501931](https://github.com/FlareZ123/experiment-01/actions/runs/45269501931) on accepted SHA `7fb4d0398eb53b6ab37ff8f2a1b32c883d5b6517` advanced both seats past the earlier root failures. Candidate in seat 1 encountered a new failure: opponent physical seat 0 played a card at action ordinal 36, resolved one `ChooseCardsPrompt` at ordinal 37, and failed to project a second `ChooseCardsPrompt` at ordinal 38 with `PROMPT_SOURCE_PROVENANCE_MISSING`. Public sanitization establishes this prompt sequence but does not identify the played card. Separately, candidate seat 0 had an `ERR_ASSERTION` on an `AttachEnergyPrompt`; that is a distinct unresolved failure.

The pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` `ptcg-server/src/game/store/store.ts` already maintains a typed `trainerPromptSources: Map<number, ResolvingTrainerSource>`, populated in `stampTrainerPrompt` when a real `TrainerEffect` is resolving. That map links each prompt ID to the actual native `{player, trainerCard}`; `reducePrompt` carries its `resolvingTrainer` through callbacks. The research `installPromptProvenanceHook` previously looked only at a JS reducer stack and continuation stack and would miss a native-stamped prompt when both custom stacks were empty.

## Narrow patch

On `agent40/native-trainer-prompt-stamp-20261123`, `trustedNativeTrainerPromptSource(store,prompt)` reads the **native Store-owned ID-keyed map after native prompt registration** only if research reducer/continuation stacks are empty. It requires a real mapped Trainer card and agreement with native `prompt.sourceCard`. It never trusts `prompt.sourceCard` alone. It preserves the existing higher-priority active nested reducer provenance, skips synthetic playability prompts, and leaves downstream `makeSource` actor-visibility checks unchanged. It does not modify the vendor submodule, worker, seed, deck, policies, or accepted Stage-A branch.

Regression in `tests/2026-11/agent36-prompt-provenance.test.cjs` exercises a lost JS stack with trusted native ID stamp, rejects forged `prompt.sourceCard` without a map, rejects map/field mismatches, and confirms nested reducer priority.

## Evidence and limits

Exact code/test SHA `437fdff89961afc15e0af3cb8d09a44c28e92afa`: [contract-only workflow run 45271519411](https://github.com/FlareZ123/experiment-01/actions/runs/45271519411) passed. The synthetic tests do **not** replay the failing registered second prompt on native Twinleaf. That source may be a Trainer card or a different source; the privacy boundary forbids guessing card identity from action order. This fallback can repair the named native-Tracker source gap **only if** the actual source map is populated. Verify via private owner-only type-safe trace and exact-head registered Stage-A fixture after coordinated integration. Preserve fail-closed behavior if no trustworthy mapped origin exists.

**Related:** the other action-63 `AttachEnergyPrompt` failure has `AssertionError/ERR_ASSERTION`, and cannot be attributed to the 85-character `requirePolicyAudit` message because that branch explicitly throws a plain `Error` with a different code. Its typed stackSite remains to be established.
