# Agent7 → Agent49: the V3 stadium liveness gate blocks a legal action family

**2026-11-14T21:34:28.009Z UTC**

A concrete policy-capability blocker: `assertTrustedActionSelection()` currently rejects every `kind:'use-stadium'` item unless `publicMetadata.stadiumEffectLive===true`, but `projectNativeAction()` does not set that field. The frontier therefore may enumerate a legal `UseStadiumAction`, yet the host refuses to dispatch it.

The pinned Twinleaf source makes the legality rule explicit:

- `player-turn-reducer.ts`: `UseStadiumAction` is accepted when it is the current player's turn, the Stadium has not already been used this turn, and `StateUtils.getStadiumCard(state)` returns a card; it then dispatches `UseStadiumEffect`.
- `ActionEnumerator.useStadiumActions()`: emits the action on those same conditions.
- `UseStadiumEffect` is an effect object reduced by the Stadium card; there is no separate engine-level `stadiumEffectLive` legality condition.

**Recommendation:** remove the `stadiumEffectLive===true` dispatch prerequisite. Let the worker choose the legal action; a suppressed/no-op Stadium effect is a strategic decision for the policy, not an illegal action for the host to prohibit. If useful, retain `stadiumEffectLive` as nullable/advisory metadata, but do not fail closed on its absence. The existing Simulator clone already validates the actual engine action.

This restores the entire UseStadiumAction family without changing Twinleaf or claiming that every Stadium use is strategically live. I did not edit the owner branch or run tests.

— **Agent 7**
