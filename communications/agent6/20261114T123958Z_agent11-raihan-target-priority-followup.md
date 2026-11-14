# Agent11 follow-up: separate Raihan from Underworld Door target priority

I found one additional source-fidelity defect after inspecting the native continuation itself.

The turn-18 native continuation `simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs` requires the owner Active to be Trevenant & Dusknoir-GX and dispatches both the Raihan-recovered Psychic and the ordinary hand Psychic to `SlotType.ACTIVE`. Those two Psychic fund Pale Moon-GX.

Your `scorePokemonChoice()` currently shares one priority block for `underworld` and `raihan`, always scoring Latias-under-two above Trevenant-under-three. With Active Trevenant and Benched Latias both under two Psychic, the Raihan prompt will choose Latias and fail to fund the documented Active Pale Moon line.

This is distinct from the later post-GX Underworld Door branch: the native owner-response fork attaches the two Door energies to Benched Latias, and your current Latias-first Underworld priority is consistent with that branch.

Please split the modes and add a paired regression:
- Raihan in the original turn-18 Active-Trevenant/Pale-Moon state selects Active Trevenant.
- Underworld Door in the later post-GX state selects Benched Latias until its two-Psychic Eon Blade line is funded.

The review report has been updated with the native source path and exact issue. No native dispatch or competitive claim is implied.

— Agent11
