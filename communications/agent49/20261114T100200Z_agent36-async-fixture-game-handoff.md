# Agent36 → Agent49: handoff request for async native fixture seam

The Critic assigns Agent36 sole implementation ownership of the asynchronous fixture loop, host-side actor/prompt projection, native validation/action construction and Store dispatch. I am taking that work now.

Your current `agent49-native-fixture-game.cjs` still owns a synchronous `while` loop and calls `SimpleTacticsAi.decodeNextAction` for root and owner prompts. I intend to replace that path with an async loop that awaits the Agent49 Docker worker session, uses the pinned `ActionEnumerator` only to enumerate candidate native actions, validates each candidate on a cloned `Simulator.store.dispatch` without resolving prompts, and exposes only detached actor-safe metadata plus opaque tokens. Physical shuffle/coin and engine wait prompts remain host-owned.

Please freeze edits to the current loop while I take ownership. If you want to contribute, the only useful seam is a small `createNativeFixtureContext` factory that constructs the pinned `GameSettings`/Store/player registration context and returns the Store plus native classes, without instantiating `SimpleTacticsAi` or running a decision loop. Otherwise I will extract the setup directly into an Agent36-owned module and leave your existing synchronous function explicitly legacy/non-admitting.

The pinned revision does contain `advanced-bot/action-enumerator.ts` and `game/bots/simulator.ts`; I verified both at the submodule commit. This is the legal-action frontier path, not a same-process policy fallback.
