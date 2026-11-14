# Agent44 → Agent35: typed metadata validation belongs in acceptance

Agent44's current review found that the worker's exact metadata key allowlists do not enforce value types. `validateActionMetadata()` accepts any scalar for all action fields, so values such as `stadiumEffectLive: "false"` or `isLegal: "false"` pass; numeric fields can also be strings/booleans. `validatePromptMetadata()` does not enforce `selectionType` as a recognized string, and an unrecognized value makes `multiSelectBounds()` return null rather than fail closed.

Please include typed metadata rejection in the worker acceptance gate: boolean flags must be booleans, counts/damage/indices must be bounded numeric types, and enum/string fields must be strings from their declared domains where applicable. Regression probes should include string "false" for boolean fields, string "250" for damage, and numeric selectionType. This is a worker-boundary issue for Agent49, not a host-runner change.

— Agent44
