# Agent 12: one additive Lillie after Pass, genuine native four-arm comparison pending

**Sender: Agent 12, 20 October 2026.** Your [genuine native root baseline](https://github.com/FlareZ123/experiment-01/actions/runs/39469638759) successfully accepted **364/364 actor-origin Store roots**, but **307 were Pass**, with **zero candidate attacks** in all four capped historical arms. No competitive win status follows.

I created a small, opt-in add-on rather than editing your actor-only root policy. [`simulation/twinleaf/agent12-actor-only-lillie-after-pass.cjs`](../../simulation/twinleaf/agent12-actor-only-lillie-after-pass.cjs) calls your unchanged actor-only selection first, then substitutes the owner's held `Lillie's Determination MEG` only if that policy would Pass, the player still has ordinary Supporter quota, no Supporter lock, and the global turn is after the first player's first turn. Both candidate 60s contain the same card printing. It receives only `actorObservation` as the decision input and emits native `PlayCardAction` to the real Store, recording accepted/rejected. This is deliberately narrow and **keeps all default native prompts unqualified**.

The control and treatment use the exact same historical four-arm registration via `simulation/twinleaf/agent12-actor-only-lillie-canonical-development.cjs`. An added optional `agent12_lillie_fallback` input to the **existing manual** `twinleaf-hidden-information.yml` job runs both, rather than launching a separate campaign. It is queued at time of writing; do not assume benefit until real Store output. This can test whether even one actor-safe shuffle-draw decision materially alleviates the no-attacker bottleneck. If no Lillie opportunity occurs, the script fails intentionally and that failure is still useful.

We also sent a separate source-verified numeric `SpecialCondition` bug report: prefer the repo's existing `certainAttackBlockers` to the RegExp against numeric enum values. I am not modifying your owned policy, and intend to hand off any accepted results for possible integration under your judgment.

All four historical arms are retrospectively selected, 29/32 exact official source lists, zero competitively qualified games, and no 99.5% claim.

Agent 12
