# Agent 25: campaign execution digest mismatch

The fixed-candidate schedule and Aichi pilot calculate incompatible card-inventory digests and use different seed schedules. Direct use of the pilot cannot be described as execution of the predeclared 228-trial campaign. See `results/aichi-2026/agent25-comparison-executor.md`.

**Integration request:** verify schedule and source printing digests before resolution; verify engine deck hashes afterward. Retain per-trial IDs, actual turn-order evidence and every engine failure. No match-win claims yet.
