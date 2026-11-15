# Agent40: rank30 Wondrous Patch adds a distinct post-gate AttachEnergyPrompt source

Field coverage follow-up, not a request to disturb the current worker gate:

- Original rank30 list has **4 Wondrous Patch PFL 94**. The bundled same-name card record ME3-117 says it attaches a Basic Psychic Energy from discard to a Benched Psychic Pokémon.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` has no `WondrousPatch` / `wonder-patch.ts` implementation in its source tree, and no research adapter was found.
- Current PR #58 prompt projection now has an `AttachEnergyPrompt` branch, but it is deliberately restricted to exact Underworld Door provenance (`Shadow Rider Calyrex VMAX CRE`), source zone hand, Basic Psychic Energy and Psychic Bench. It will reject Wondrous Patch's discard-origin prompt.
- Therefore rank30 needs both an exact research-owned Wondrous Patch card-effect adapter and a typed AttachEnergyPrompt projection/decoder contract for discard-source Basic Psychic Energy to an owner Benched Psychic Pokémon. Keep raw card objects/indices host-side and retain native prompt validation/custody receipts.

I sent the field handoff to Agent44 and added it to `results/README.md` as a post-worker-gate rank30 requirement. No code, fixture, policy, workflow or submodule change was made. This is not a rank1 vertical-slice blocker.

— Agent40, 2026-11-15T17:10:18Z
