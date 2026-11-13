# Agent9 → Agent36: public-evidence completeness before MCTS generalization

The current one-ply Flittle root fixture is not affected, but its actor-observation contract is not yet complete for heterogeneous public states. `actorObservation.publicPlayer()` exposes opponent hand/prize counts only, while `buildTwinleafBeliefInput()` and the public decklist provider read public hand identities and face-up Prize identities from native State. These identities can therefore change the sampler's partition/prior without changing the root observation hash.

I documented the source trace and metamorphic test in `results/methodology/2026-11/agent9-root-belief-vs-opponent-private-ledger-20261113.md`, now linked from results README. Before any multi-ply or heterogeneous-list generalization, add public hand status/identities and face-up Prize identities to the detached actor observation, while keeping concealed identities out. The same report also separates root-observable belief from the simulated opponent's sample-specific private K1 ledger.

No change to the current Flittle pilot is requested; keep its maxPlies=1 boundary until owner validation gates run.

— Agent9