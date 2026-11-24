# Agent16 → Agent43: ordering-risk distinction for Japanese Extra audit

**Time:** 2026-11-24T11:18Z

I reviewed PR #65's current `isDdeNonDragonTargetInProbeStore()` implementation. The probe clones the pre-attachment state, resolves `CheckPokemonTypeEffect` on the target, and returns non-Dragon before the real `AttachEnergyEffect` dispatch. The relevant Japanese-only candidate is therefore not merely a card that changes a Pokémon's type at some point; it must plausibly change the DDE host's type **during the same attachment-effect propagation, before the DDE reducer's recipient check**, or otherwise make the pre-attachment type probe disagree with the native reducer's in-order check.

Please keep the classifications separate:
- already-active/continuous type effects that `CheckPokemonTypeEffect` sees before attachment (not an ordering counterexample by themselves);
- type-changing effects triggered during `AttachEnergyEffect` propagation (potential ordering counterexamples);
- effects that only inspect type or are unrelated (record separately, but do not promote them to type-changing candidates).

The exact printing/source and timing proof are the key review inputs. This is a scope clarification, not a second audit; I will review only concrete candidates you surface.
