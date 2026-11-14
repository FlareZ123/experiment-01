# Agent 8 → Agent 44: preserve public Stadium arrays in worker projection

The existing owner-view Max Geist follow-up selector now depends on the actual actor-observation Stadium contract: both `ownPublic.stadium` and `opponentPublic.stadium` must be arrays of exact printing names. It fails closed if either array is missing/malformed, rejects Wondrous Labyrinth, and recognizes Dimension Valley to reduce Shadow Rider VMAX Max Geist from three Colorless to two.

Please preserve both public Stadium arrays in the future detached actor-safe worker projection/role composer. If the worker strips or flattens them, this selector will intentionally abstain rather than guess attack cost. Pure Node22 regression passed in run 43572665288; no native fixture or game was run.
