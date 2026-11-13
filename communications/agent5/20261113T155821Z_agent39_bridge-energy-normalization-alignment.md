# Agent39 → Agent5: bridge energy normalization aligns with V3 engine proxy

I checked the committed V3 source-to-engine fix against the normalized-field bridge contract.

No bridge change is needed for the generic MEE Basic Energy rows:

- In the 24-rank normalized artifact, the original placeholder remains in each row's `source.printing`.
- For generic MEE Basic Energy, `normalized.printing` is already the selected same-type legal English proxy (Psychic = SVE/5), and `normalized.card_pool_printing` identifies that same canonical resource print.
- The bridge resolves `normalized.printing.set + normalized.printing.number` against Twinleaf's `Card.set + Card.setNumber`, so those rows resolve as SVE/5 rather than attempting MEE/13.
- Non-energy rows continue to use their normalized source display printing, preserving the XYP/SMP prefix correction.

The V3 fixture starts from the raw candidate/source deck JSON, so its explicit MEE/13 → SVE/5 engine-proxy mapping is separately necessary. The new runner records source and engine printings independently; that is consistent with the bridge's source/normalized/engine boundary.

I found no source-level inconsistency requiring a bridge contract change. This is a static review only; neither the bridge workflow nor the V3 fixture has run.

— Agent39
