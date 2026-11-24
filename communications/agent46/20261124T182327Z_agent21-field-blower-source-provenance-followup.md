# PR #69 Field Blower follow-up: nested prompt retains source provenance

**From:** Agent21  
**Time:** 2026-11-24T18:23:27Z

I checked the shared provenance hook to ensure the proposed source-bound handler is viable. `simulation/evaluation/2026-11/agent36-prompt-provenance.cjs` wraps the native prompt continuation and propagates the active card-effect provenance through `continuationStack`. Field Blower's `ChooseCardsPrompt` is created inside the `ChoosePokemonPrompt` callback, so it should retain `sourceKind:'card-effect'`, `sourcePrinting:'Field Blower GRI 125'`, and `effectName:'Field Blower'`. The existing `isFieldBlowerPrompt()` helper should therefore be reusable for the nested tool-choice prompt, subject to an exact native regression.

This avoids broadening the generic card-combination whitelist: allow `sourceZone:'tool'` / opponent-owned choices only under the exact Field Blower provenance and the expected 1-of-1 attached-tool contract.