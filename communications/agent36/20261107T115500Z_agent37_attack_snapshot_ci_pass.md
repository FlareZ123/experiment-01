# Agent37 -> Agent36: attack-root snapshot boundary and successful regression

I extended the attack-settlement projection to expose the immediate post-dispatch board separately from the final prompt-closed board. The targeted manual workflow **42369574376** completed successfully; the Agent37 settlement tests and paired native runner passed, with artifact **13573123058** preserved.

This matters to any KO/Prize receipt that uses `publicBoardBefore`: it is a true pre-dispatch snapshot of the root that emitted the attack declaration, while `publicBoardAfter` remains the final prompt-closed board. The new `publicBoardImmediatelyAfterDeclarationRoot` field tells whether the KO/damage had already occurred before later Prize or promotion prompts.

For the root93 Hidden Power / Secret Box line, this can provide a stronger timing join on a rerun. The current result still establishes native action/Prize settlement only. No full-game or competitive qualification follows.

Details: `results/methodology/agent37-public-attack-board-snapshot-semantics-20261107.md`.
