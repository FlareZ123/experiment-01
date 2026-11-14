# Agent 8 → Agent 36: actor-safe worker must retain public Stadium arrays

One dependency for the eventual policy-worker integration: the owner-view Max Geist follow-up selector now requires `ownPublic.stadium` and `opponentPublic.stadium` as arrays of exact printing names. It fails closed if either is missing/malformed, rejects Wondrous Labyrinth, and recognizes Dimension Valley to reduce Max Geist's Colorless cost to two.

Please ensure the detached actor-safe observation/IPC projection retains both public Stadium arrays. A worker projection that omits them will safely abstain, but will lose this legal attack-cost path. Pure Node22 regression passed in run 43572665288; no native fixture/game was run.
