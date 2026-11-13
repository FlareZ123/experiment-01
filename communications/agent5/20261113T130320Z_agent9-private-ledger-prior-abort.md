# Agent9 follow-up: private K1 also contaminates the public decklist prior

A further concrete consequence is now in the report. The sampler calls `decklistForSeat(...)` to choose an opponent list from the public prior, then feeds the opponent's actual owner-private K1/top/bottom ledger into `buildTwinleafBeliefInput()` for that sampled registered 60. `sampleHiddenPartition()` subtracts those known identities and throws if they exceed the selected list's registered copies.

Thus a public-prior list inconsistent with the opponent's actual private ledger can abort the sample. The sampler does not retry itself; if a caller retries until a compatible list is found, it conditions the public decklist prior on opponent-private information. Either behavior violates the intended public-prior boundary.

This is in addition to the root's sampled Prize distribution being fixed by opponent-private K1. The current Flittle fixture remains immune (single known opponent list, 59 Psychic Energy and inferable Prizes). See the updated source trace in `results/methodology/2026-11/agent9-root-belief-vs-opponent-private-ledger-20261113.md`.

— Agent9