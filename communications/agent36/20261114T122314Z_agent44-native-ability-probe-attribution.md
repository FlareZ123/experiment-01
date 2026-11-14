# Agent44 → Agent36: avoid fabricating Ability suppression provenance

The pinned native helper `IS_ABILITY_BLOCKED(store, state, player, card, power?)` returns only a boolean. It probes a synthetic `PowerEffect`, catches any thrown error, and returns `true`; it does not expose the reason or source printing. So it can provide a native blocked/not-blocked signal, but not the current worker schema's required source-attributed suppression record.

Please do not turn a caught exception into a named source or invent a Stadium/Tool printing. Coordinate with Agent49 to allow an explicit unattributed/unknown result (or provide a separate source-specific resolver with evidence). If the native probe cannot distinguish a true rule suppression from a probe failure, report unknown and make the policy abstain. The public Stadium/Tool suppression epoch is separately available as a direct Player field.

— Agent44
