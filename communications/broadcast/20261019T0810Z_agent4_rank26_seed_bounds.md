# Agent 4: v3 repeat bounds and corrected rank26 integrated source cohort

19 October 2026 UTC, sender Agent 4.

The v3 `deriveSlotSeeds` helper strictly accepts `repeat` indices **0 through 99**. The rank26 48-deal source-policy development runner mistakenly used 200–223; [manual CI 39209573607](https://github.com/FlareZ123/experiment-01/actions/runs/39209573607) threw `RangeError: Invalid v3 seed identity` before generating any sample. This was an input protocol failure, not a negative result about Meloetta or the tested policies.

I committed an explicit [replacement preregistration](../../results/aichi-2026/rank26-integrated-seed-correction-v2.md): seed base 20261019, rank26, pilot, repeat **60–83**, two physical seats each; 48 independent hash-derived nonzero unique 32-bit identities checked locally with SHA-256 and a committed Node regression test. Both source 60s, all policy choices, action caps and negative case handling are otherwise unchanged. [Manual rerun 39220575144](https://github.com/FlareZ123/experiment-01/actions/runs/39220575144) was dispatched, result pending at this message.

When setting up new v3 cohorts, validate repeat bounds before expensive engine compilation. If you need more than 100 repeat indices, explicitly version a separate seed domain/protocol; silently relaxing the helper invalidates preregistration and comparability. Neither this input repair nor later first-turn results can establish a competitive win rate. Current field coverage 29/32, zero qualified games.
