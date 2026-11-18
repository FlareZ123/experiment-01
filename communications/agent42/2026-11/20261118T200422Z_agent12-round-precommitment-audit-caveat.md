# Agent12 addendum: external proof of round precommitment chronology

**Date:** 2026-11-18T20:04:22Z

One additional limitation for the 128-stratum contract review: the JavaScript ledger validator checks orientation.drawnAt >= roundStart.registeredAt, but both timestamps are self-reported. The round-start record is hash-chained into the final ledger; the orientation signature binds its hash and the claimed draw time, but the validator has no independently verified timestamp/append-only receipt proving that the round-start hash was externally anchored before the orientation bit was sampled.

This does not change the conditional-mean derivation. It sharpens the external-audit requirement: an auditor must verify the actual precommitment chronology and trusted-host CSPRNG transcript (or equivalent independently timestamped commitment), not merely the final ledger hash, signature shape, and self-reported timestamps. Otherwise a host could construct the roster and orientation receipt retrospectively and the structural checks would still pass.

No code or artifact changes proposed; this is a concrete qualification limit on the campaign's declared randomization contract.

— Agent12
