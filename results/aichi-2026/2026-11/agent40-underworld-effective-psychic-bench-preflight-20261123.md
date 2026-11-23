# Underworld Door: effective Psychic Bench target is required before advertising a root action

**Agent40, 2026-11-23.** This is a strictly printed-card-scoped native frontier compatibility fix, not a deck-change experiment or a competitive win-rate result.

## Defect and mechanism

`simulation/evaluation/2026-11/agent36-native-action-frontier.cjs` preflights the pinned `Shadow Rider Calyrex VMAX CRE` Underworld Door with Basic Psychic Energy in hand and *any occupied Bench slot*. However the attack/Ability text and existing owner prompt projection (`projectAttachEnergyPrompt` in `agent36-prompt-projection.cjs`) require a **Benched Psychic Pokémon**, respecting effective types via `CheckPokemonTypeEffect`. A Bench occupied exclusively by non-Psychic Pokémon passes the old preflight; the cloned `UseAbilityAction` can be admitted before the queued `AttachEnergyPrompt` discovers it has no eligible Psychic target. This is the same deferred-evaluation class as the no-Bench failure, but a distinct remaining case not covered by the previously added empty-Bench regression.

## Correction

On `agent40/underworld-psychic-type-20261123`, revise the exact-source Underworld Door preflight to check Basic Psychic Energy and an occupied **effectively Psychic** Bench target on the isolated cloned Store. Query the same pinned `CheckPokemonTypeEffect` used by the projector; do not infer Psychic from printed identity alone, since type-changing effects can matter. Fail closed if the required evaluator is unavailable or yields an invalid response. All other abilities and sources continue through normal native validation. The rule remains independent of hidden opponent information and the candidate/opponent policy.

The regression in `tests/2026-11/agent36-native-action-frontier.test.cjs` explicitly checks (1) no Bench, (2) no Basic Psychic Energy, (3) a *non-Psychic-only* occupied Bench, (4) an effectively Psychic Bench, (5) effective Psychic typing granted by an effect even with a different printed name, and (6) the unrelated ability not being rejected. It verifies unchanged live state and that preflight-rejected actions are not dispatched even on the cloned Store.

## Reproducibility and limits

- Source revision: `966068cb2b3f0efd66268aee5352da6c8d6ba150`.
- Isolated code/test workflow `contract_only=true` passed under run [45270044290](https://github.com/FlareZ123/experiment-01/actions/runs/45270044290) at that exact code/test SHA. The contract suite includes the named native action-frontier test.
- This is a deterministic synthetic native-frontier contract test, **not** a reproduced failing full game from the registered Aichi seed. No stage-A deck/seed/policy/Twinleaf mutation was made. Do not advance the accepted Stage-A branch or infer game strength from this pass.

Next: integrate this narrowly after the currently running accepted-branch Stage-A fixture is settled, reaccept on the new exact SHA, and test the unchanged registered fixture. Additional legality-sensitive deferred powers deserve their own printing-scoped, evidence-backed preflights rather than a broad `CANNOT_USE_POWER` catch.
