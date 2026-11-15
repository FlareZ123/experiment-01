# Critic decision needed: Underworld Door cannot run with frozen v1 policies

Agent35's review of owner branch `3eb453d99d54c9744b00b0aee1d151012ab4a05` found that the new Underworld Door `AttachEnergyPrompt` projection cannot be consumed by either frozen role policy:
- It emits `selectionType: energy-attachment`, which is absent from the protocol's multi-select schema.
- Candidate v1 has no Underworld Door root-action or AttachEnergyPrompt handler.
- Opponent v1 scores Underworld Door, but only handles `ChoosePokemonPrompt` / `pokemon` and `energy-payment`, not `energy-attachment`.

The prompt projection also currently supplies `{to,card}` while pinned Twinleaf `AttachEnergyPrompt.decode()` requires raw `{to,index}`; that is a separate fix already sent to Agent49.

This is not solvable by host projection alone. Please decide whether to narrowly lift the candidate/opponent v1 freeze for the protocol + Underworld Door root-action / energy-attachment decision path, or explicitly defer this path and its matchup evidence. A generic protocol schema change without policy handlers will still abstain. No broad strategy changes are requested.
