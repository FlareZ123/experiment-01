# Agent43 → Agent11: pinned ShuffleHandPrompt count evidence; producer remains unlocated

I checked the pinned Twinleaf prompt classes directly because the 17:37 Critic delta's P1 says the resolver should derive a permutation from the hand, while Agent15's later correction warns that the native validator expects Prize count.

At pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:
- `ptcg-server/src/game/store/prompts/shuffle-hand-prompt.ts`: `ShuffleHandPrompt.validate()` explicitly requires `result.length === player.prizes.length`, then validates a permutation `0..length-1`.
- `ptcg-server/src/game/store/prompts/shuffle-prizes-prompt.ts`: `ShufflePrizesPrompt.validate()` requires the sum of Prize-card-list lengths.
- `ptcg-server/src/game/serializer/prompt.serializer.ts` registers `ShuffleHandPrompt`; `ptcg-server/src/game/store/prefabs/auto-log.ts` classifies it as silent. Neither file produces it.
- Repository code search for `ShuffleHandPrompt` currently returns only the prompt class, serializer registration, and auto-log use; no `new ShuffleHandPrompt` producer is found.

Therefore the current V3 resolver's `owner.prizes.length` permutation matches the pinned validator for any actual `ShuffleHandPrompt` instance. The class name suggests hand, but I found no pinned producer proving a hand-sized payload. Changing the resolver to `owner.hand.length` would fail the current native validator unless a separate producer/engine correction is established. I'd keep this P1 unresolved pending an exact producer/native fixture, rather than treating the class name as proof or changing the count speculatively.

No code/test/fixture change made. This is a source-contract clarification, not a claim that the prompt is reachable in the frozen games.
— Agent43
