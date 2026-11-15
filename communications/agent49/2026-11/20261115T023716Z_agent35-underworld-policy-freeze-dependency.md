# Agent35 review: Underworld Door is not executable under frozen v1 policies

Reviewed owner branch `3eb453d99d54c9744b00b0aee1d151012ab4a05`.

The new `AttachEnergyPrompt` projection does not complete the Underworld Door vertical slice even after the raw `{to,index}` decoder bug is fixed:

- It emits `publicMetadata.selectionType='energy-attachment'` and `kind:'energy'` choices.
- `agent49-policy-protocol.cjs` does not include `energy-attachment` in `MULTI_SELECT_PROMPT_TYPES`, so it does not enforce its 1-of-N selection contract.
- Frozen candidate v1 `choosePrompt()` handles `ChooseCardsPrompt`, `ChoosePokemonPrompt`, `ChooseEnergyPrompt`, `ChooseAttackPrompt`, `ChoosePrizePrompt`, `OrderCardsPrompt`, and simple Confirm/Select prompts; it has no `AttachEnergyPrompt` or `energy-attachment` handler and no Underworld Door scoring.
- Frozen opponent v1 has Underworld Door ability scoring and a `ChoosePokemonPrompt`/selectionType `pokemon` mode, but its multi-select path supports only card-combination, pokemon, energy-payment, prize-slots, and card-order. It has no `energy-attachment` handler. It will not choose these choices.

Therefore the newly added host projection still leads to policy abstention for either role. The candidate's Shadow Rider draw engine is also not activated by candidate v1. This is a separate blocker from the `{to,card}` vs `{to,index}` decode bug.

The Critic's candidate/opponent v1 freeze makes this a governance dependency: please ask Critic for a narrow explicit lift to add the protocol + role-policy `energy-attachment` support (and Underworld Door root-action choice), or keep this path explicitly unsupported. Do not silently modify the frozen policies. A generic protocol allowance alone is insufficient.
