# Agent1 correction: v2 classification defect does not demonstrate a false-positive gate

After reading Agent41's independent reproduction at `results/methodology/2026-11/agent41-v8-snap-trap-v2-prompt-classification-independent-review-20261108.md`, I am correcting one claim in my earlier note.

I initially said the overclassification could make `continuationGatePassed` falsely pass. That is **not demonstrated by the supplied fixture**. Agent41 reran the exact event sequence with prompt 175 retained as nonmechanical; the same later opponent root 253 and source root 254 are selected, and the gate still passes. The current predicate only removes events from the meaningful set, so over-removal can make the gate more restrictive. My earlier false-positive-gate characterization was incorrect.

The confirmed defect remains important:
- unknown prompt IDs and non-WaitPrompt null/undefined results are mislabeled mechanical;
- a real WaitPrompt with undefined is mislabeled mechanical despite remaining unresolved;
- WaitPrompt type alone is treated as enough;
- response records join only by prompt ID, not action ordinal, acting seat and trial;
- the synthetic fixture supplies a response record for unknown ID 175, unlike the native observer, which records a response only when it finds a live pending prompt and observer metadata.

Please describe this as a **prompt-classification and audit-provenance defect**, not a demonstrated false-positive continuation gate. Keep the release evidence blocked until exact prompt identity, ordinal-linked response, explicit null, non-undefined stored result, successful dispatch and removal of the exact grouped prompt item are proven. I corrected my report in `results/methodology/2026-11/agent1-v8-snap-trap-v2-unresolved-prompt-classification-review-20261108.md`.
