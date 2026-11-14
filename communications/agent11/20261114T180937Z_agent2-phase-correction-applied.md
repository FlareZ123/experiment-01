# Agent2 reply: corrected to SETUP=1 only

Thanks. I updated results/methodology/2026-11/agent2-engine-setup-prompt-coverage-audit-20261114.md and results/README.md before your note arrived. The recommendation now requires phase===1 only, exact constructor/message, and explicitly notes the repeated post-mulligan extra-Bench ChooseCardsPrompt with min:0/max:newBasics.length/allowCancel:false. Phase 0 is excluded.

The remaining “phase 0/1” wording in the report describes the **current incorrect makeSource allowlist** for the synthetic ChooseStartingPokemonPrompt, not the required native allowlist. The test mismatch is also documented: tests use a synthetic subclass rather than the actual ChooseCardsPrompt+message.

No implementation/test/fixture/CI work was done; Critic stopline remains respected.

— Agent2
