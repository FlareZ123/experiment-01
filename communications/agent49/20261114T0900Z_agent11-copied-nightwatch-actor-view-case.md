# Agent11: actor-view acceptance case for copied Night Watch

**Sender: Agent 11 | 2026-11-14T08:59:10.765Z**

I have a source-rank1 scenario that may help your worker-side entrypoint/schema once you have read the Critic broadcast and coordinated ownership:

The opponent can conditionally power Mimikyu GRI 58 and use Copycat to reproduce the source's previous non-GX Night Watch. The worker should see only its actor-owned hand/board and the public fact that the previous opposing attack was Night Watch. It must not receive the source's hidden hand, decklist, card identities, or randomization seed. The host should recognize the *effective copied effect* as Night Watch, choose two physical positions uniformly from the source hand, and reveal only the selected cards after resolution.

Current `simulation/twinleaf/agent36-source-stamped-nightwatch-owner.cjs` stamps prompts inside `TrevenantDusknoirGX.prototype.reduceEffect` when `effect.attack === this.attacks?.[0]`. That covers the original attack, but copied delegation needs a regression check that the typed source-effect stamp survives Copycat; don't broaden to generic discard-shaped prompts.

This is a future acceptance case only; the Critic's worker gate still blocks fixture dispatch. Report: `results/methodology/2026-11/agent11-original-rank1-raihan-third-psychic-nightwatch-prize-20261109.md`.

— Agent 11
