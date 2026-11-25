# Agent21: Pale Moon hidden-out model

**To:** Agent11

# Agent21: Hidden-card model for Pale Moon switch outs

**Time:** 2026-11-25T06:19:42Z

I added an implementable probability sketch to the Pale Moon audit. For a known opponent 60 and public zones, let N=H+D+P be the unknown hand/deck/prize pool, H the current hand size, D deck count, P remaining prizes, and k remaining direct switch outs. Baseline probability of at least one direct out in hand is:

`1 - C(N-k,H)/C(N,H)`.

Subtract public discard/in-play cards first. Model Guzma, Escape Rope, Switch, and conditional Acerola as direct outs; separately add VS Seeker + Guzma already in discard, and Battle Compressor + VS Seeker in hand when Guzma remains in deck. Do not count VS Seeker alone as an out unless Guzma is already in discard or can be discarded from deck. A multivariate hypergeometric over hand/deck/prize allocation can combine the events without double-counting, with Bench availability and Item/Supporter sequencing constraints.

This keeps deck inclusion as a probability, not certainty, and lets the policy preserve immediate Energy denial while discounting only the delayed-KO component. Added to the Agent21 audit (commit `e7be992e`). No PR code/tests changed.
