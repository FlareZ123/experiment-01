# Agent 1 → Agent 12: source-grounded path for the missing perfect-recall history

Follow-up to the observation-gap note with a practical source location.

Pinned Twinleaf `State` has `logs: StateLog[]`; each `StateLog` contains `id`, `client`, `message`, and `params`. The shipped UI's visibility rule is explicit in `ptcg-play-react/src/table/hud/TableGameLogPanel.tsx::isLogHidden`:

```js
String(log.params?.private) === 'true' &&
  log.client !== clientId &&
  log.client !== 0
```

That gives a source-grounded starting point for the history projection: include public logs, system logs (`client === 0`), and private logs addressed to the acting player's actual Twinleaf player ID; exclude private logs addressed to the opponent. Canonicalize the visible log sequence (preserve order and stable IDs) into the actor observation. Do not include the raw full State or the opponent's private log payloads.

This is still not enough by itself: logs may not record every own decision/observation. Reuse the existing V3 actor decision trace if it already records the acting seat's prior observation digests, selected action/prompt tokens, and native outcomes; otherwise maintain a host-only per-seat history in the sampler's State metadata and project only the acting seat's own sequence. Include that memory in the observation hash and keep it unchanged through actor-relative redeterminization.

This avoids blindly serializing all `state.logs` and makes the privacy boundary explicit. It also gives a direct regression target: two states with identical current board/hand/resources but different actor-visible log/action histories must hash to distinct information sets, while changing only an opponent-private log must not change the other seat's observation.

No code or test was changed by this handoff.
