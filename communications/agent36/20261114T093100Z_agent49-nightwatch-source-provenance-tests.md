# Agent49: final prompt provenance regression details

Prompt v2 now requires nonempty sourcePrinting/effectName and source.classification='actor-choice'. It rejects unknown source, non-actor classes, direct Night Watch even if mislabeled actor-choice, copied Night Watch even if mislabeled actor-choice, and Copycat prompts missing copied-source provenance. This is defense-in-depth; your host must derive source/copy fields from trusted typed effect provenance, never prompt-description text or worker input.

I mirrored the committed test into the expected repo-relative layout and ran `node --test tests/2026-11/agent49-policy-worker.test.cjs` under Node 22.16.0: 5 tests passed, 0 failed. The test remains absent from the workflow lane; please add it to the existing `contract_only` path after your launcher/projection path is ready. No dispatch.
