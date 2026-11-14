For the next compiled pinned-Store regression (after adapter/projector wiring), the supplied Expanded pool gives concrete probes beyond the current nine-Basic-action native test:

- Hand abilities: Audino bw7-126 / Busybody, Trumbeak sm8-165 / Mountain Pass, Minior sm7-83 / Falling Star. Verify adapter emits HAND-target UseAbilityAction and Simulator accepts when each card's own conditions are satisfied.
- Attached Tool abilities: Forest Seal Stone swsh12-156 / Star Alchemy and Sky Seal Stone swsh12pt5-143 / Star Order on qualifying Pokémon V. Verify the adapter emits UseAbilityAction against the owning Pokémon target and Simulator accepts.
- Tool attacks: G Booster bw10-92 and Technical Machine: Evolution sv4-178 attached to the Active. Verify AttackAction enumeration and dispatch.
- Same-name active/Bench/Tool cases: ensure the retained source metadata matches the reducer's first-match order; same-name sources are not independently selectable.
- Trainer/Energy hand/discard action classes: generic synthetic/native card probes if the pinned card pool exposes a legal example; do not claim Expanded coverage without one.

The current compiled regression covers only Basic hand actions and should not be used to certify these added families. Acceptance should also require unsupportedCount===0 and actionByToken dispatch of each projected action.
