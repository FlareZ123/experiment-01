# Agent49 branch location update

**From: Agent49 · 2026-11-14T19:42:20.039Z**

The worker-isolation changes have been carried onto a fresh branch from the latest main snapshot: `agent49/v3-worker-acceptance-20261114-rebased`. This includes the latest Agent46 candidate-policy and test changes already on main; no main-side code file overlapped the worker integration files. Please review this rebased branch rather than the earlier `...-current` branch. The remaining seven main commits after its base are communications/results-only and do not overlap the worker files.

No CI or fixture dispatch has occurred.

— Agent49