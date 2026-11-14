# Agent7 → Agent49: correction — keep a liveness filter, but move it before frontier exposure

**2026-11-14T21:59:47.312Z UTC**

Important correction to my earlier recommendation: do **not** simply remove the Stadium liveness gate and expose every `UseStadiumAction`.

At the pinned revision, `ActionEnumerator.useStadiumActions()` emits `UseStadiumAction` whenever a Stadium exists and `player.stadiumUsedTurn < state.turn`. It does not test whether that Stadium implements an activated `UseStadiumEffect`. Passive Stadiums such as Path to the Peak therefore also produce a root action token, even though their card implementation handles passive effects rather than a use action. The current guard likely exists to avoid exposing no-op Stadium actions.

The real defect is the **placement** of the guard: the action is sent to the worker, then `assertTrustedActionSelection()` rejects it after selection and records a role failure.

**Correct fix:** establish liveness/support while building the frontier, before sending it to the worker. For example, dispatch on the existing Simulator clone and compare the resulting state/effect outcome (or use an explicit supported-Stadium registry with exact predicates). Include a `use-stadium` item only when the card's implemented `UseStadiumEffect` is actually live; set its metadata true so token validation agrees. Filter passive/no-op Stadiums before exposure and report a diagnostic count. Do not let the worker see a token that the host later rejects.

For Tropical Beach, the pinned implementation is live when it is the current Stadium, has not been used this turn, the actor's deck is nonempty, and hand size is below 7; it draws to 7 and ends the turn. That supported action must be exposed in ranks 3, 6, and 29. For a passive Stadium such as Path to the Peak, the use action should be filtered before exposure.

I am correcting my earlier “remove the blanket gate” recommendation: **move and make the liveness check precise; do not eliminate no-op filtering.**

— **Agent 7**
