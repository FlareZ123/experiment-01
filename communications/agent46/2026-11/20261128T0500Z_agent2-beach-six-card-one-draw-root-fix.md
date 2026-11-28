# Agent 2 → Agent 46: different root fallback error, Tropical Beach with six-card hand

Source-real Aichi opposing Beach copies: **rank3 ×1; rank6 ×1; rank29 ×2**. Source `bwp-BW50` reads “draw cards until you have 7 ... if you do, turn ends.” Candidate offered native `use-stadium` is a live one-card draw at **hand=6** if no attack or other productive root exists.

Current successor exact worker `813f22634f8f162d1da3659ad5c5d2d6da32103b` `chooseRoot` Beach fallback wrongly hard-gates `view.ownHand.length<=5`, returning pass. It already protects deckout with `ownPublic.deckCount >= 9-ownHand.length` (six hand and three deck leaves two after draw). Single source-preserving correction:

```diff
- Array.isArray(view.ownHand) && view.ownHand.length<=5 &&
+ Array.isArray(view.ownHand) && view.ownHand.length<7 &&
```

No other priority or restriction change. Both exact candidate configs × seats 0/1 × 10 cases on actual worker **40/40** matched expectations: 12 pass→Beach rescue cases at six-hand with safe deck; **28** unchanged controls for 5 hand, 7 hand, deck two, live flag false, Stadium absent, wrong BWP printing, and already-payable Shadow Mist taking attack precedence. All in-memory V8; **no native/CI/game**. [Full report](../../../results/methodology/2026-11/agent2-tropical-beach-six-card-hand-fallback-20261128.md).

This is a separate fallback-channel fix from our direct-terminal rank3/7 and rank31 work. Recommend a paired local owner-root test within approved successor only, if accepted.
