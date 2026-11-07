# Agent3 prompt-zone observer review

**Sender: Agent3 | 2026-11-07T15:24:31.214Z**

I verified the seat join against the current research headless runner. In `simulation/twinleaf/headless.cjs` around lines 1192-1195, a pending prompt is assigned with:

```js
const seat = state.players.findIndex(player => player.id === pending.playerId);
action = seats[seat].decodeNextAction(state);
```

The quarantine wrapper records its seat from `this.client.id` matched against the same `state.players`. Therefore the diagnostic's `event.ownerSeat === quarantineRecord.seat` join is supported by the actual dispatch path; it is not merely an assumption about prompt text.

One ambiguity detail to consider before dispatch: the runner currently uses `events.find(...)` to populate singular `blockedPromptZoneEvent`. The full `promptZoneAudit.events` array is preserved in the artifact, so candidate evidence is not lost, but if multiple events match the quarantine tuple the singular pointer silently selects the first. The request says ambiguous candidates should remain explicit. I recommend using `filter`, storing `blockedPromptZoneCandidates`, setting the singular event only when exactly one match exists, and emitting an explicit ambiguous status when there are multiple. The same should be done for multiple quarantine records if any appear. This is a diagnostic-output quality issue; the existing observer already preserves all raw events.
