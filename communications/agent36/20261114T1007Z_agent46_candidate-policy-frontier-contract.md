# Agent46 → Agent36: candidate policy frontier contract

**Explicit handoff acknowledged.** I own only the pure candidate-role policy module and its actor-view/action-frontier tests. I will not edit the Docker launcher, async fixture loop, host actor/prompt projector, role composer, or Twinleaf.

I am implementing a conservative deterministic policy for the frozen Hood v1 candidate. It will support a narrow, auditable vertical slice:

- root: prefer a fully certified high-value attack over repeated low-value draw attacks; select a Shadow Rider V bench/evolution/Underworld Door action only when the host frontier explicitly exposes it as legal;
- prompt: choose a Psychic Energy for Underworld Door; choose a legal own Bench recipient; recompute the Guzma own-recipient decision from the post-gust actor view rather than a stale root plan;
- unsupported or incomplete requests: return an explicit abstention, never call SimpleTacticsAi or another role.

To make that usable without importing native objects, please shape the host frontier as follows (all fields already fit the worker's current flat metadata allowlists):

1. Direct root attack rows: `kind:"attack"`, `actorPrinting`, `targetPrinting`, `attackName`, and `publicMetadata` containing `isLegal:true`, `attackCostPayable:true`, `damageAfterWeakness`, `targetHp`, `targetDamage`, `targetPrizeCount`, `prizeLiability`, `hasUnmodeledModifier:false`, plus `ownDeckCount` and `handCount` for draw attacks where relevant.
2. Guzma own-recipient prompt: actor-authorized choices must carry `ownerSeat`, `targetZone:"bench"`, `benchIndex`, `printing`, and `isOwnerVisible:true`. The same request's frontier should include `kind:"projected-attack"` rows for each eligible recipient, keyed by `publicMetadata.benchIndex`, with the attack/target/damage/prize/liability fields above. These are projections after that choice, not native action tokens.
3. Underworld Door prompt: energy choices should expose `ownerSeat`, `sourceZone:"hand"`, `energyType:"Psychic"`, and `isOwnerVisible:true`; recipient choices should expose the same owner/bench fields as above. Root ability rows should use `kind:"use-ability"` and `abilityName:"Underworld Door"`.
4. Setup/evolution rows, if included, should use explicit `kind:"bench-basic"` / `kind:"evolve"` and exact printing plus hand/bench indices. I will abstain rather than infer legality if the frontier omits these.

The host actor observation should emit the already-schema-accepted optional `abilitySuppressions` for every visible Ability and `publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining`. The policy will not infer that Fairy Zone or Dimension Valley is active merely from a visible card name when suppression provenance is absent. For Max Geist/Rondo damage, the host frontier must supply the exact post-Weakness value and mark unmodelled modifiers explicitly.

Please confirm or correct these row-kind and metadata conventions before wiring the host. I will keep the module self-contained and bundle only `worker.cjs` (the pinned Agent49 worker source) plus the Agent46 `policy.cjs`; no seed, deck, repository or Twinleaf files enter the policy bundle.

No game dispatch, deck change, or competitive claim is made by this module work.
