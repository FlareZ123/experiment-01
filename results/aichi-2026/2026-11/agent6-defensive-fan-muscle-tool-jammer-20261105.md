# Agent6: defensive Handheld Fan ownership bug and physical-owner Tool Jammer adapter

5 November 2026. **Native mechanical staging, zero competitive games.** Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

**Specific source defect.** The pinned [Handheld Fan reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/handy-fan.ts) is triggered by `AfterDamageEffect` of an attacker while Fan belongs to the defending Active. It constructs `new ToolEffect(effect.player,this)`, where `effect.player` is **the attacker**. The already-installed [headless Tool Jammer correction](../../../simulation/twinleaf/tool-jammer-hook.cjs) requires `effect.player===opponent`, which can therefore miss defensive Handheld Fan. The Tool's true owner is its **physical attachment holder**.

**New correction.** [`withBilateralActiveToolJammerPaperGuard`](../../../simulation/twinleaf/agent6-bilateral-tool-jammer-paper-guard.cjs), now v2, resolves the Tool owner by which actual player has the queried Tool on their Active, checks the *other* player's Active for an unblocked Tool Jammer, and raises a native ToolEffect-block signal. It preserves exception-safe Store.prototype descriptor restoration, Tool Jammer self-exemption, Benched Tools, the Jamming Tower countercontrol and both physical seats. It is opt-in and changes no vendor source.

**Verified original pinned Store results.** [CI run 41961498956](https://github.com/FlareZ123/experiment-01/actions/runs/41961498956) passed the new pure unit step and staged native step. [Artifact 13385279503](https://github.com/FlareZ123/experiment-01/actions/runs/41961498956/artifacts/13385279503), independently downloaded: ZIP SHA256 `45192b9aa9147deb602c40df0b51f8bd584ffab4ff60012c5de5f403d270cb8b`, matching published digest. JSON: **48/48 staged native checks passed**, containing 36 prior mobility/Stadium/Bench checks plus 12 new genuine native reducer calls across two physical seats and three lock states.

| Printed Tool | No Jammer | Opposing Active Jammer, no new repair | With v2 |
| --- | --- | --- | --- |
| Defending Handheld Fan TWM150 | One AttachEnergyPrompt | One incorrect AttachEnergyPrompt | **Zero prompts**, blockedToolEffect=1, effect-player/physical-owner mismatch=1 |
| Attacking Muscle Band XY121 | Base20 grows to 40 | Incorrectly remains 40 | **20**, blockedToolEffect=1 |

A staged Fan prompt is *not* a completed Energy transfer. A staged Muscle Band modifier is *not* a settled attack. This test excludes initial shuffles, tactical decisions, complete opponent response and paper-clock enforcement. The existing original 29 opponent inventories contain **23 Muscle Band** and **4 Handheld Fan** copies. These counts establish potential relevance, with no proof that a complete natural source game encountered either lock.

**Next control:** source-level inspection predicts the repository's already-installed research Tool Jammer hook suppresses the attacking Muscle Band but misses the defending Fan. [Native contrast script](../../../simulation/twinleaf/agent6-tool-jammer-fan-muscle-native.cjs) now includes separate legacy-hook and legacy-plus-v2 arms. That additional comparison must be assessed on its own CI result before stating success. Original-field status remains 29/32, missing ranks23/25/28, zero competitively qualified wins, no final fixed 60, no evidence of 99.5%.
