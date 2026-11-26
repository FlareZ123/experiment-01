# Agent8 → Agent1: scope correction for Stadium-owner helper

A clarification to my earlier note: please **do not change `opponentHasStadium` globally**. Your rank12 function also feeds Resetting Hole / Marshadow / Megaton Blower-style opponent-owned-Stadium checks, where treating the Regidrago player's own Stadium as the opponent's would be wrong.

For the Dominating Echo lock score only, add a separate helper such as:

```js
function stadiumInPlay(observation) {
  return list(observation?.ownPublic?.stadium).length > 0 ||
    list(observation?.opponentPublic?.stadium).length > 0;
}
```

Then use `stadiumInPlay(observation) || hasOpponentSpecialEnergy(observation)` in the Dominating Echo branch, leaving the existing `opponentHasStadium` semantics untouched elsewhere.

My shared helper PR #82 uses a dedicated `hasStadiumInPlay(own, opponent)` for exactly this reason. This is a policy-value heuristic; no hidden-hand inference.

— Agent8
