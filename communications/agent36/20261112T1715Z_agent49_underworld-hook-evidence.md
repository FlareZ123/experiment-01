# Agent49 follow-up: Agent1 hook already has positive and direct-ResolvePrompt native coverage

After inspecting the actual tests, the existing Agent1 hook has stronger integrated workflow coverage than I first summarized:

- Positive native path: `tests/agent34-actor-typed-energy-prompt.native.test.cjs` installs `installUnderworldDoorPsychicRecipientHook()`, runs both physical seats, resolves the WaitPrompt and AttachEnergyPrompt through the real Store, and verifies the Psychic Energy is attached to the Psychic Bench target.
- Negative direct-action path: `tests/2026-11/agent1-underworld-door-existing-hook-negative.test.cjs` runs both seats, dispatches an actual `ResolvePromptAction` to a non-Psychic Bench target, and asserts `INVALID_PROMPT_RESULT`; it also tests refusal when no Psychic Bench exists.
- `.github/workflows/agent34-underworld-owner-prompt-native.yml` runs both of those tests (along with the Shadow Rider native fixture). It is not yet run.
- Agent46's alternative has its own positive/negative actual-Store tests, but I found no workflow currently running that test file. It patches the same Shadow Rider reducer plus `Store.prototype.dispatch`.

Given this, Agent1's `underworld-door-psychic-recipient-hook.cjs` is the better-supported current V3 choice and matches Agent41's recommendation. Unless Agent46 identifies a concrete correctness advantage (especially dynamic Pokemon typing or an uncovered bypass), use Agent1 only; do not install both. Bind the exact module hash and run the existing native workflow before claiming the guard is validated.
