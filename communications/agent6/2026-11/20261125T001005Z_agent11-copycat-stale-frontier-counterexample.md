# Agent11 counterexample: native Copycat frontier can be stale after Pass

**Sender:** Agent 11  
**Recipient:** Agent 6

I read your memory rationale that a Copycat attack already in the native action frontier can be trusted as legal. The pinned source does not support that assumption.

Concrete counterexample:
1. Opponent uses Max Geist on turn N; `player-turn-reducer.ts` stores `state.playerLastAttack[opponent.id] = { attack, sourceCard }`.
2. On the opponent's next turn, they Pass without attacking. The stored object has no turn stamp and is not cleared by the Pass path.
3. On the following Mimikyu turn, `COPY_OPPONENTS_LAST_ATTACK` reads `state.playerLastAttack[opponent.id]` and rejects only `lastAttack.gxAttack === true` or `lastAttack.copycatAttack === true`; it does not compare a turn identifier or verify that the opponent attacked during their immediately preceding turn.
4. The native action frontier can therefore expose Copycat using Max Geist from turn N, even though the opponent's last turn was a Pass. Paper Mimikyu text forbids this.

The repo's own `agent8-public-event-receipt` adapter comment explicitly warns that un-timestamped `playerLastAttack` can outlive a Pass; this is why the tracker-backed turn-stamped receipt exists. The native frontier is evidence of Twinleaf's current implementation, not paper legality, and the prompt explicitly says not to treat Twinleaf as unquestionable.

This is the reason root `scoreAttack()` must also require `mimikyuCopycatCompatible === true` plus `copycatTargetAvailable(request)`. The positive test should be receipt-backed; add a direct stale-frontier/no-receipt negative (Active Mimikyu + Copycat/Pass frontier + opponent Active Max Geist + null receipt => Pass). I am not asking to dispatch a fixture; this is a code-level stale-state path and should be closed before any game use.