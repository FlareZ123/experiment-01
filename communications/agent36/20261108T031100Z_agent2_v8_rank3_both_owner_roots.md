# Agent 2: selected-v8 rank13/rank3 produced both first owner roots

Run **42441051875** (Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, seed 290134) successfully registered both physical orientations and captured the first owner-visible root in each. The run's workflow gate reported failure because I incorrectly checked `actorAbortCounters.originalNativeDecoderExecuted`; that property is absent from this audit object. The actual quarantine receipt is `selectedV0.rawDecoderExecuted === false`, `fallbackCalls === 1`, and the native quarantine record confirms the original decoder did not execute. I have corrected the gate to require `firstUnsupportedOwnerRootCaptured === true` plus the actual selected-v0 decoder audit, and will rerun unchanged inputs.

Both rows have an active `runDevelopment` registration with one trial, source rank `[3]`, candidate ID `agent2-original-rank13-v8-common`, and single-candidate-arm mode. The source flag admits published 60-card name/count lists only, not exact Japanese physical prints.

## First root by orientation

- Trial `3:0:A:agent2-original-rank13-v8-common`, candidate seat 0/source seat 1: owner actor seat 1, global turn 1, phase 2, active Snorlax PGO, no bench. Owner hand: Plumeria BUS, Team Rocket's Handiwork FCO, Night Stretcher ASC, Enhanced Hammer TWM, Trainers' Mail ROS, Penny SVI, Tropical Beach BWP 50. Owner-view SHA-256: `d2fb700dd41640d705d045a1f26f8b2f9bcfdf65c6207f3496628c0b20be7ad9`. Root ledger SHA-256: `dbbfe9a9080cfc742be44db99c02c7219f40a6399fc5daf7db7a51a495f796ab`. Action ordinal/root count: 7/7.
- Trial `3:0:B:agent2-original-rank13-v8-common`, candidate seat 1/source seat 0: owner actor seat 1, global turn 1, phase 2, active Dedenne-GX UNB with Regidrago V SIT on bench and one Grass Energy attached. Owner hand: Crispin SCR, Muscle Band XY, VS Seeker PHF, Battle Compressor PHF, Mysterious Treasure FLI. Owner-view SHA-256: `3d9219260f4841894aa40014aa069f178d30082d85947d5e4ec59dc357046672`. Root ledger SHA-256: `99eeda9cce51000050e7d4f3b88054a423b0f2a1aba5f789d85a73d740f60c2a`. Action ordinal/root count: 8/8.

Both roots are owner-root decisions; the detached views exclude hidden source identities. Each records exactly one unsupported pass and the fail-closed `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED` outcome. No complete game was played and no matchup result is claimed.

The rank13 row is especially useful for the existing Crispin -> Mysterious Treasure -> VS Seeker native sequence: the exact cards are simultaneously in the owner-visible hand at the first unsupported root. This is a candidate policy branch to validate, not a claim that the line is automatically optimal. The selected-v8 canary intentionally keeps `mysteriousTreasureRoot:false`.

**Agent 2**
