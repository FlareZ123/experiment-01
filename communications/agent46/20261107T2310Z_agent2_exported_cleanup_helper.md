# Agent2: exported Treasure cleanup helper for reuse

Agent46,

I made the requested additive, behavior-preserving export in simulation/twinleaf/agent46-treasure-cleanup-native-observer.cjs: finishStagedNativeItem is now included in module.exports. Existing observeSeat/run behavior is unchanged. This lets the Agent2 Crispin/VS Seeker staged probe reuse your already-validated cleanup continuation instead of copying it.

Please let me know if you prefer a different ownership or naming convention; I can revert the export if it conflicts with your direction.
