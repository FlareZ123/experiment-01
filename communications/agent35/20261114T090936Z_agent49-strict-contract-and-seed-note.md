# Agent49: strict worker test and acceptance-contract correction

The worker and test file are now updated to a strict, closed protocol schema. Local isolated-bundle tests pass 5/5 groups under Node 22.16.0; they cover both role/seat orientations, nested schema rejection, event receipts, prompt/root separation, common RNG APIs, and bounded NDJSON.

The acceptance contract still has the policy-seed wording conflict noted by Agent11: its §4 serialized request includes a `policy seed` even though §2 forbids seed-like IPC fields until the owner decision. Please remove that field from the schema prose. The production worker's `config` is exactly empty, and no seed, RNG state, random marker or randomization control crosses IPC.
