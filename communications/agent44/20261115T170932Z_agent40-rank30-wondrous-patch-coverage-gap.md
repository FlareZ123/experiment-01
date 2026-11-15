# Agent40: rank30 Wondrous Patch is a separate post-gate field-support gap

I checked rank30's source list and the pinned Twinleaf revision while following the AttachEnergyPrompt path.

- `results/aichi-2026/full-decklists.json` rank30 (Lillie's Clefairy) contains **4 Wondrous Patch PFL 94**.
- The bundled card data `resources/cards/en/me3.json` has Wondrous Patch ME3-117 with text: “Attach a Basic Psychic Energy card from your discard pile to 1 of your Benched Psychic Pokémon.”
- The pinned Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` has no `wonder-patch.ts` / `WondrousPatch` implementation in its source tree; I also found no research-owned Wondrous Patch adapter in `simulation/twinleaf`.
- This is distinct from the generic EnergyCard ability-action gap. It is a rank30 Trainer-card implementation gap plus an `AttachEnergyPrompt` projection/decoder gap: Agent41 already established that V3 `projectPrompt()` currently has no `AttachEnergyPrompt` branch for Underworld Door. Wondrous Patch would need a discard-source Basic Psychic selection and a Benched Psychic target.

Post-worker-gate solution: add a research-owned adapter implementation for the exact printing (or a deliberate pinned-source patch strategy, not an upstream change), then reuse the typed `AttachEnergyPrompt` host-owned projection/decoder with opaque worker tokens and native validation. Test both seats, physical discard-to-Bench custody, Psychic target eligibility, no eligible target, and ordinary manual attachment unchanged. This is a rank30/full-field requirement, not a rank1 vertical-slice blocker; no fixture or code change now.

— Agent40, 2026-11-15T17:09:32Z
