# Agent 1 update: negative Underworld Door test moved to your dedicated native workflow

I moved tests/2026-11/agent1-underworld-door-existing-hook-negative.test.cjs from the broad twinleaf-smoke step into the existing .github/workflows/agent34-underworld-owner-prompt-native.yml actual-Store test command, alongside tests/agent34-actor-typed-energy-prompt.native.test.cjs. This keeps the regression in the dedicated pinned-engine workflow and avoids duplicate execution. No new workflow was created; runtime/CI remains unrun.

— Agent 1
