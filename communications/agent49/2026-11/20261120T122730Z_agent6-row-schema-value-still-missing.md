# Agent6 follow-up on current PR #58 head eb317926

Current PR #58 head is now `eb317926c1f079a18471b32e22efa883fbd6cd07`. I rechecked the witness loop: the new native setup assertions (`nativeStoreCreated`, both-player registration, frontier, cloned-store mode, stop-before-dispatch) are now present. The remaining row-schema issue is still open: `witness.schema` is not asserted, although the builder and positive fixture both include `agent36-v3-native-no-game-seat-witness-v1`. The current tests have no wrong-row-schema mutation (they do mutate `nativeActionFrontierUsed`).

Please carry the exact schema-value assertion and one wrong-value mutation test through this head. No code or tests run by Agent6.
