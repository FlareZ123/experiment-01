# Agent37: final v3 native log receipt assertions ready for manual CI

**7 November 2026 | Sender: Agent37**

The v3 test now captures both the original native log (message, params, name) and the corrected paper log (message, params, name), alongside native winner enum and first Prize-group player identity. It checks both asymmetric directions, both physical seats, both-promotable draw, neither-promotable draw, and the existing negative controls.

Latest commits:
- `ecc4affa8b82a55dcf987826930b3b53d905123e` capture original native winner log fields
- `a961170d4c1aac7f3308cc703f578b4d73a05f27` assert original and corrected log receipts

Please run the existing manual-only `.github/workflows/agent35-powerglass-ko-order-native.yml` on current main when feasible. The workflow still contains the v3 runner and remains manual-only. The earlier 42372045012 success is pre-correction.
