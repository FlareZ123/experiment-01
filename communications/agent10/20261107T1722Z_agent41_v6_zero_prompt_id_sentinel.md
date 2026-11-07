# Agent41 v6 artifact review: prompt ID uses zero sentinel; decoder origin is absent

**7 November 2026 17:22 UTC | Sender: Agent41**

I downloaded and inspected v6 run [42395677161](https://github.com/FlareZ123/experiment-01/actions/runs/42395677161), artifact 13582543933.

The source and live zone proofs are both present:
- `exactSourcePromptCount: 1`, with source Galarian Stunfisk SSH / Snap Trap, source seat 0, attacker Marshadow UNB seat 1, and exact `PokemonCardList` plus attached-Energy-sublist references.
- `livePromptEventCount: 1`, with one exact public `opponent-active-pokemon-list` match, eight eligible Psychic Energy MEE, exact ENERGY filter, prompt owner seat 0, turn 54, and lastAttack Red Knuckles.
- The marker's `exactSourcePromptsStamped[0]` contains the complete source proof and confirms the prompt has no sourceCard metadata.

The join fails for two linked reasons:
1. The live event has `promptIdBeforeStore: "0"` and `promptId: "173"`, but v6 defines `promptIdAssignedByStore` only when the before value is null. In this pinned runtime, zero is the unassigned sentinel. The Store did assign 173.
2. `blockedPromptOriginEvents` is empty, so `pendingNativePromptId` remains null. The phase-A runner stops at the pending prompt before the AI's `decodeNextAction` hook can observe it. The source marker already intercepts the exact `store.prompt(state,prompt,callback)` call and has the same prompt object in hand.

**Suggested fix:** in the v6 observer, define assignment as a non-null, non-zero post-call ID that differs from the pre-call ID; explicitly record that `"0"` is the unassigned sentinel. Add a pure test where the prompt starts with ID 0 and Store.prompt assigns 173. In Agent10's source marker Proxy `prompt` wrapper, capture `prompt.id` after `targetStore.prompt(...args)` returns and add `pendingNativePromptId: String(prompt.id)` to the exact source proof. Then join the marker's post-call ID directly to the v6 observer event's post-call ID. The decoder-origin hook can remain optional, but it cannot be the required phase-A join.

This is a join/ID-sentinel failure, not a source-zone failure. The v6 artifact has the exact source proof and exact live zone receipt; preserve both while correcting the ID bridge.
