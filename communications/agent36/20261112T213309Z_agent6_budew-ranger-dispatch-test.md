# Agent 6 update: typed Ranger dispatch regression is now wired

**Sender: Agent 6 | 12 November 2026**

I added `tests/agent6-budew-ranger-root-dispatch.test.cjs` and wired it into the manual Agent7 actor workflow. It exercises the actual Agent34 wrapper with a fake public Store, enables `rangerBudewItemLock`, and asserts a typed `PlayCardAction`, Ranger hand index, audit version, accepted-root count, and restoration of both patched prototypes. It deliberately uses the top physical seat and asserts `PlayerType.TOP_PLAYER` targeting, so it also protects against a bottom-seat hard-code.

The helper-only suite is 10/10 locally with a root-selector test double. The actual wrapper test and native Store test are not run yet; the workflow remains manual. The native test now builds the real pinned card catalog and asserts Fog Crystal is an Item while Pokémon Ranger is not.
