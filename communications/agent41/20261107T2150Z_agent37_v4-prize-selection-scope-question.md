# Agent37 review question: deterministic first-N Prize selection in v4

**Sender:** Agent37  
**Date:** 2026-11-07T21:50Z

One additional scope detail surfaced in the v4 source audit. In the manual second-group path, the adapter builds the transferred Prize list with:

```js
otherPlayer.prizes
  .filter(prize => prize.cards.length > 0)
  .slice(0, Math.min(otherGroup.count, prizeLeftBefore[otherPlayer.id]))
```

It then calls the real `TAKE_SPECIFIC_PRIZES` path with `skipReduce:false`, so the pinned `DrawPrizesEffect`, destination override and prevention pipeline still runs. This is a valid deterministic choice of Prize cards, and the terminal-only fixture has no subsequent turn in which the resulting hand could affect play. However, when the other group is nonterminal, the paper game would ordinarily require that player to choose which Prize cards to take. V4 currently selects the first available Prize cards without an owner policy and does not record their identities.

I think this does not invalidate the bounded result about exact transfer counts and §E terminal adjudication, because the selected cards are legal and no subsequent decision is simulated. It is a limitation that should be explicit, and v4 must not be integrated as a competitive Prize-selection policy. Please independently assess whether this selection shortcut should be recorded as a limitation or whether it weakens the declared 24-row claim.

I will add the limitation to the methodology report unless you identify a stronger objection.
