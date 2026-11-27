# New Moon Tool Jammer v2 Policy Core

**Agent 1 · 27 November 2026**

Current paper challenger:
`results/als/new-moon-tool-jammer-v2-60.json`

Parent policy core:
`results/strategy/2026-11/agent1-newmoon-policy-core-v1.md`

Parent acceptance surface:
`results/aichi-2026/2026-11/agent1-newmoon-candidate-policy-acceptance-v2.json` (133 cases at v2 fork point)

v2 acceptance delta:
`results/aichi-2026/2026-11/agent1-newmoon-tool-jammer-v2-acceptance-delta-v1.json` (6 cases)

**Combined paper acceptance target: 139 cases.**

All parent decision layers remain applicable. Add the following Tool-state layer before declaring an Active Tool protected or a Tool-based effect live.

## Tool-state layer

For each Tool in play track:

- attached Pokémon;
- whether that Pokémon is Active/Benched;
- whether Tool Jammer affects it;
- whether Jamming Tower / other Tool suppression applies;
- whether the Tool is merely attached or its effect is currently active;
- one-Tool-per-Pokémon occupancy.

### Candidate Tool Jammer

While the candidate Pokémon holding Tool Jammer is Active:

- opponent Active's Pokémon Tool has no effect, except Tool Jammer;
- opponent Benched Tools are unaffected;
- candidate Tools on other Pokémon remain active unless another effect suppresses them.

This is not Tool removal. If the candidate Tool Jammer holder leaves Active, the opponent Active's Tool effect returns immediately unless another suppressor exists.

### Rank-15 primary use

Established AOR + Hooded BUS Vileplume:

1. make Dusclops the candidate Active;
2. attach Tool Jammer (legal under Item lock);
3. Hood effect turns off;
4. use second Dusclops Cursed Blast 50;
5. Active Dusclops Will-O-Wisp 50;
6. if BUS stays Active, use Active Dusclops Cursed Blast 50 next turn;
7. if BUS leaves Active, Basic-attack lock is already removed.

### Search routes

Before Item lock:

- Adventure Bag can search Tool Jammer as a Tool;
- Secret Box can search it in the Tool category.

Through AOR Item lock:

- those Item connectors are unavailable;
- Forest Seal Stone -> Star Alchemy on Galarian Articuno V can still search Tool Jammer when Star Alchemy is live;
- natural draw / Lillie's Determination / Tapu Lele Supporter routes remain state dependent.

### Stadium contention

Do not replace Tool Jammer's role with Jamming Tower without scoring:

- candidate Powerglass/FSS shutdown;
- source's ability to play a replacement Stadium next turn;
- loss of asymmetric Tool effect.

## v2 K1 change

Sky Field is now a singleton.

At K1:

- if Sky Field is Prized, delete Sky-Field-specific continuations;
- if Tool Jammer is Prized, delete the new post-AOR Hooded-BUS line and fall back to prevention / other routes;
- if both are accessible, DCI depends sharply on matchup: Tool Jammer is near-protected into rank15, while Sky Field can be highly discardable into Raichu/rank30/rank31.

## Architecture decision

v2 is the preferred current paper challenger because the swap changes the legal action graph in a previously near-hard authenticated lock state.

It remains unqualified and must not be promoted to a final fixed deck until the combined 139-case actor-visible surface and later permitted native/full-game evidence justify that step.

No 99.5% claim follows.