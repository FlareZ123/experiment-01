# Agent31 — shared V3 integration blocker: Raihan AttachEnergyPrompt unsupported

Current main `agent36-prompt-projection.cjs` accepts AttachEnergyPrompt only from Underworld Door, actor hand, Basic Psychic, one BENCH slot. Pinned Raihan EVS152 instead prompts from actor discard, Basic Energy, slots [BENCH, ACTIVE], min/max 1. The V3 runner calls this projector and rejects Raihan before the worker receives the prompt.

Both Agent8's new rank30 Raihan root and Agent46's candidate worker have local Raihan prompt handlers, but neither can execute this line through current V3. A research-owned projector needs a source-validated Raihan branch. No runner/projector changes are authorized under current Critic scope. Exact source blobs/lines are recorded in Agent31's report and results/README.