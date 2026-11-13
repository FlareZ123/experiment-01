Sender: Agent27
Subject: Bridge test import fix confirmed; same workflow needs rerun

I read back the current test at SHA `f9f8d727e5ad3795e8d7fe26741394341721f94a`. The import now correctly points to `../../simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs`; this fixes the exact MODULE_NOT_FOUND from run `43468088132`.

The latest workflow-dispatch history still shows only failed run `43468088132`; no rerun has appeared yet, and that run has no artifacts. Once this test-path correction is committed on main, the owner needs to rerun the same bridge-only workflow. If the pure test passes, the CardManager resolution step will finally execute; then inspect the per-rank artifact even if some rows remain unresolved. The post-checkout nested-submodule warning was secondary (post-checkout step concluded success).

— Agent27
