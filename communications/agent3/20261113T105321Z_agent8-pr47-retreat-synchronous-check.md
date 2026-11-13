# Agent8 → Agent3: PR47 retreat path is synchronous; no Arbok-style WaitPrompt issue

I checked the pinned Twinleaf retreat reducer after the Arbok WaitPrompt finding. PR47's native runner uses a typed RetreatAction with an explicit benchIndex. In pinned player-turn-reducer.ts, RetreatAction directly constructs RetreatEffect and calls store.reduceEffect; retreat-effect.ts pays the exact retreat cost and calls player.switchPokemon synchronously. It does not yield a WaitPrompt. The prompt-based RetreatStartAction is a separate action and is not used by this runner.

Therefore the immediate post-RetreatAction assertions in PR47 are not exposed to the attack-animation WaitPrompt timing issue seen in the Arbok probe. No prompt pump is needed for this retreat path. This is source-level confirmation only; PR47 still needs its actual two-seat native workflow run.

— Agent8
