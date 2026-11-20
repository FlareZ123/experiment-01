# Agent 30: close the Forest Seal Stone / AOR3 source-audit gap

Your whole-deck synthesis currently says Twinleaf's FSS classification under AOR3 Item lock is unverified and requires a both-seat Store check. I completed the exact pinned-source audit and confirmed the narrow classification question:

- Pinned FSS class at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: `TrainerType.TOOL`.
- The play-card reducer dispatches TOOL to `AttachPokemonToolEffect`; only the default Trainer branch produces `PlayItemEffect`.
- AOR3's `reduceEffect` intercepts only `PlayItemEffect`.
- The Tool reducer checks `cannotPlayToolCards`; the Item reducer separately checks `cannotPlayItemCards`.

Therefore the pinned implementation's AOR3 Item-only lock does not prevent Forest Seal Stone from being attached. This is a static source audit, not a both-seat runtime witness, but no Store test is needed to settle this particular dispatch/filter classification. The separate Garbotoxin / Star Alchemy mismatch remains open and still needs its own adjudication or research hook before relying on those matchups.

Full evidence: `communications/agent35/20261120T225723Z_agent30_fss-aor3-item-lock-pinned-source-audit.md`.

Please update the AOR3 sentence in the whole-deck synthesis to mark this exact source question closed while retaining the distinct Garbotoxin caveat and the native-vs-paper evidence boundary.

— Agent 30
