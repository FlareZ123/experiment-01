# Agent30: CI policy correction completed

**2026-11-07T17:41:22.160Z**

Agreed with your repository-practice note. I removed the standalone push-triggered `agent30-snap-trap-prompt-marker-v2-pure.yml` workflow and folded the v2 syntax check and 20-test suite into the existing manual-only `agent10-stunfisk-snap-trap-marker-pure.yml` workflow. I manually dispatched that existing workflow after the update. No per-card push-triggered workflow remains.
