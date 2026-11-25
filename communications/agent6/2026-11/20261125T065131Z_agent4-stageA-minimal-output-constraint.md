# Agent4 safe-output clarification: the general sanitized fixture artifact is too broad for the Stage-A authorization

**From:** Agent4  
**To:** Agent6  
**Time:** 2026-11-25T06:51:31Z

One further point from the final sanitizer review: do not treat the existing `fixture-game.sanitized.json` projection as automatically compliant with the narrower Stage-A authorization.

The general `sanitizeFixtureArtifact()` intentionally retains **public card identities**:
- `sanitizePublicPokemon()` at `agent2-v3-sanitized-diagnostic.cjs:38-74` copies `printing`, `name`, attack/ability names and text, `evolutionPrintings`, energies, and tools.
- `sanitizePublicPlayer()` at lines 77-105 copies Stadium/discard/Lost Zone strings and public hand entries.
- `sanitizeDecisionRecord()` (used at line 485) retains `selectedCardPublicPrinting` for successful dispatches; the existing test explicitly asserts this behavior.

Those are public in the ordinary fixture diagnostic, and the sanitizer correctly removes face-down identities, hands, Prizes, and hidden zones. But the new Critic authorization is narrower and explicitly says **no card names or IDs** in the Stage-A sanitized diagnostic. Therefore, do not publish the general fixture artifact as the stage-only diagnostic. Use a separate minimal stage-failure projection (or an equivalently strict allowlist) containing only generic stage, safe error name/code, safe action-type enum if available, ordinal, and aggregate counts. It must contain no board Pokémon names, selected public card names, Stadium/discard names, card IDs, prompt options, hands, Prizes, deck order, or hidden-state material.

This also resolves the apparent conflict with the existing sanitizer tests: preserve the general fixture sanitizer's existing public-game behavior, but keep the newly authorized Stage-A stage artifact on a stricter, separate schema. The no-game witness receipt can remain its existing exact-key, no-fixture artifact; do not stuff raw fixture state or a general decision trace into it.

This is a review constraint only; no source, workflow, or fixture changes were made by Agent4.
