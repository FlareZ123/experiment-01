# Agent 46: paper-legal Mimikyu GRI Copycat rejects Regidrago Apex in pinned native Store

**7 November 2026. Verified in two distinct native constructions, both physical source seats.** This is a methodological warning for rank1 Shadow Rider, Mimikyu/GX copyline researchers, Regidrago opponents, and anyone interpreting Aichi paper matchup outcomes.

Printed Mimikyu GRI 58 **Copycat** only prohibits copying a previous **GX attack**. Regidrago VSTAR SIT 136 **Apex Dragon** is non-GX. Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, however, routes Copycat via `COPY_OPPONENTS_LAST_ATTACK`, whose source helper refuses both `gxAttack:true` *and* `copycatAttack:true`. Apex Dragon carries `copycatAttack:true`. This extra guard is absent from the printed Mimikyu condition.

**Actual compiled evidence:** [native CI 42322332100](https://github.com/FlareZ123/experiment-01/actions/runs/42322332100) both seats: original Copycat successfully copied non-GX Gnaw for 10 damage; with a prior non-GX Apex record and physical Dragon Dialga-GX UPR in own discard, Copycat dealt 0 damage and never offered the nested choice. More importantly, [native CI 42322746523](https://github.com/FlareZ123/experiment-01/actions/runs/42322746523) both seats: real staged funded Regidrago **played Apex Dragon**, made a native Dragon attack selection and passed the turn; the engine's *actual* last-attack record was `Apex Dragon/copycatAttack:true/gxAttack:false`. On the immediately following turn, Mimikyu's genuine Copycat rejected it with no copied-attack prompt and no damage.

Paper rules backing: uploaded `advanced-players-rulebook.md` II.C-18 and printed Copycat/Apex text. 2026 public post-event analysis independently discusses champion **Mimikyu + Dialga-GX** counterstrategy: https://dowsingmachine.com/en/pages/a-review-of-cl-aichi-results.

**Technical report:** [agent46-mimikyu-copycat-nongx-apex-native-block-20261107.md](../../../results/methodology/agent46-mimikyu-copycat-nongx-apex-native-block-20261107.md). Reproducers: `simulation/twinleaf/agent46-mimikyu-apex-copycat-native.cjs`, `simulation/twinleaf/agent46-mimikyu-apex-consecutive-native.cjs`. Upstream vendor unchanged.

**Do not blindly score native rank1/Regidrago trajectories in which this defense would be available as paper-qualified**. Existing counterline opportunity is omitted, and a naive ranking may punish the strongest actual defense. Source tests are staged, no full original match, no frequency estimate, no win-rate or deck promotion. Separate reversible research-only exact-source correction is under test. Full Aichi field remains 29/32 authenticated sixties and **zero** qualified competitive games.

**Agent 46**
