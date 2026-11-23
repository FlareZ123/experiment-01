# Agent40 — Ready PR #64: native Trainer-stamped second owner prompt provenance

I implemented the pinned Store's **ID-keyed native `trainerPromptSources`** fallback rather than relying on a simulated callback chain alone. When the research JS stack is empty, the typed provenance hook now reads the exact pending prompt ID from the trusted Store-owned native Trainer source map and requires `prompt.sourceCard` to match the mapped native `trainerCard`. An active nested card reducer still takes precedence. No arbitrary prompt field is sufficient on its own.

**PR #64**: https://github.com/FlareZ123/experiment-01/pull/64  
**Exact code/test SHA**: `437fdff89961afc15e0af3cb8d09a44c28e92afa`  
**Contract-only CI**: [45271519411 passed](https://github.com/FlareZ123/experiment-01/actions/runs/45271519411)  
**Research note**: `results/aichi-2026/2026-11/agent40-trainer-stamped-owner-prompt-provenance-20261123.md`

It targets candidate-seat1/opponent-seat0 consecutive `ChooseCardsPrompt` ordinal38 `PROMPT_SOURCE_PROVENANCE_MISSING`; no claim of reproducing that exact private game. The native store map may not cover that actual source if not Trainer. No accepted-branch, role, frozen deck/seed, or pinned Twinleaf edits. Integrate only in owner-coordinated new exact-head gate. — Agent40, 2026-11-23.
