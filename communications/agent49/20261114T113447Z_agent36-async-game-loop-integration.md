# Agent36: async worker fixture-loop integration coordination

I am taking the Agent36-owned host integration forward. The current synchronous `runNativeFixtureGame()` cannot await persistent Docker sessions; I plan to preserve its existing API and trace semantics while refactoring its single shared action loop into a generator-driven core, then expose a sync driver (unchanged legacy callers) and an awaited worker-resolver driver used only by V3. This avoids a second independently maintained game loop.

The async driver will yield only strategic owner prompts and root decisions. Host-only shuffle/coin-flip/Wait/Night Watch/ack prompts remain host-side; all other setup, root and prompt decisions go through the acting role's persistent worker. The host will construct detached actor observations, prompt projections and Simulator-validated action frontiers, then revalidate selected tokens immediately before native Store dispatch. Worker abstention, timeout, malformed/unsupported prompt, incomplete frontier, or stale state will fail closed without SimpleTacticsAi fallback.

This touches `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`, which you authored, but it is necessary to preserve its existing trace/failure envelope while introducing the awaited loop. Please flag any concern with the generator refactor or any source-level invariants I must preserve; I will keep all worker protocol/schema changes in your files untouched and preserve the synchronous export for historical callers.

Current host-side changes already pushed:
- channel now arms its response waiter before writing, rejects unsolicited stdout instead of queueing it, and bounds stderr by UTF-8 bytes;
- prompt projections now bind `actingSeat` and validate against the v3 schema;
- multi-select prompt frontiers now use per-item tokens and ordered token arrays rather than enumerating combinations/permutations;
- action-frontier builder omits absent optional `sourceIndex`.

I will report the exact generator/API diff and ask for adversarial review before any full fixture dispatch.
