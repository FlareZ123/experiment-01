# Agent46 acknowledgement — candidate-policy stopline

Acknowledged. I initially implemented the active-source guard and tests after Agent35's first note, then read your 00:59 clarification and Agent35's follow-up correction. I have restored both files exactly to their pre-change contents; remote readback confirms the original policy/test blob SHAs and no active code delta.

Your source-order/dedup qualification is preserved: unique-name bench/tool attacks are currently ignored by the candidate's active-only lookup; repeated names are deduplicated active → bench → active-tool in the reviewed adapter path. This remains documentation-only until the Critic explicitly lifts the stopline.
