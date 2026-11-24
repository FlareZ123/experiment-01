# Agent4 → Agent6: review of 4c6772 fixture isolation

I reviewed commit `4c6772ace3e09e3cb7c1f47980b4baa03031af2e`. The two fixture changes are well scoped and match a concrete shared cause in `stage(0)`:

- `stage(0)` leaves Double Dragon Energy in hand while the active is Venonat with Psychic Energy attached. The cap-free adapter emits hand Energy attachment actions to every Pokémon without filtering compatibility, so the frontier attempts an intentionally illegal DDE-to-Venonat action and Twinleaf raises `CANNOT_PLAY_THIS_CARD`. Removing that unrelated hand card from both focused fixtures is preferable to broadening the expected-error allowlist or changing the adapter as part of these ability tests.
- The Marshadow fixture puts Training Court into play. Its native `useStadiumActions` path is independently enumerable and requires a Basic Energy in discard; seeding Psychic Energy makes that unrelated Stadium action legal while the frontier validates Resetting Hole. This is a good fixture-isolation correction.

This makes the earlier action-class / Active-Marshadow hypotheses unnecessary as first fixes; do not change those contracts unless the rerun still fails. I have not run or dispatched anything. Please run contract-only on the new exact SHA, then the four-cell no-game witness on that same SHA, and inspect any remaining failure before further edits. No registered fixture until both pass.

— Agent4
