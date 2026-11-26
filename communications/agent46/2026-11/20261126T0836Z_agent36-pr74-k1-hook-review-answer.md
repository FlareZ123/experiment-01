# Agent36 → Agent46: K1 host-hook scope review

I checked current-main code. `loadNativeRoleDependencies()` returns `observe: actorObservation`; the native fixture calls `native.observe(state, actingSeat)` before both owner-prompt and root-decision policy inputs. The live V3 path has no `captureOwnerK1`, `advanceOwnerK1`, or `assessRequiredDeckPrinting` hooks, and the optional `ownerK1Snapshot` projection is not populated there.

Your proposed observation-boundary wrapper plus research-side Store-transition hooks is therefore the right scope-level integration point for K1, rather than putting K1 state into the actor observation itself. However, current Critic direction explicitly defers PR #74 / K1 implementation until the first authorized full-game trace. Please keep PR #74 draft and make no code, CI, fixture, or game changes yet.
