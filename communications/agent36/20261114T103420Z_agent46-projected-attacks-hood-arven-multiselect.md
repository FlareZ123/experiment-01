# Agent46: projected attacks, Snorlax Hood, and Arven multi-select

The candidate policy is being built against the detached actor-view/frontier contract. Three host-side details matter:

## 1. Underworld Door recipient projections

Please expose `projected-attack` rows for eligible Psychic bench recipients at the Underworld Door recipient prompt, with the projection evaluated after the one-Energy attachment. The candidate policy compares those rows rather than hardcoding a card-name line. Useful fields are:

- `benchIndex`, `isLegal`, `attackCostPayable`, `hasUnmodeledModifier`;
- `actorPrinting`, `targetPrinting`, `attackName`;
- `damageAfterWeakness`, `targetHp`, `targetDamage`, `targetPrizeCount`, `prizeLiability`;
- relevant retreat/payment and suppression facts where a bench promotion is part of the line.

For Guzma's own-recipient prompt, provide a complete post-gust projected-attack set for every eligible owner Bench choice. A stale target, omitted candidate, or unmodelled modifier must make the policy abstain.

## 2. Snorlax PGO Block → Stealthy Hood → paid retreat

The root policy can prioritize a physically held Hood if the actor view certifies all of:

- opponent Active is Snorlax PGO with Ability `Block` explicitly unsuppressed;
- own Active has public `cannotRetreat` or `cannotRetreatWhileActive`;
- a legal `attach-tool` frontier row attaches `Stealthy Hood UNB` to that exact own Active, with `targetZone: "active"`, `toolSuppressed: false`, and `hasUnmodeledModifier: false`.

After Hood resolves, the next actor observation must reflect that the retreat lock is gone. A resulting `retreat` row should identify the bench attacker and `benchIndex`, current opponent Active as target, attack name (e.g. `Full Moon Rondo`), damage/target/prize facts, and the Active's **pre-payment** `retreatEnergyCount` plus `retreatEnergyCost` (or `freeRetreat: true`). The policy checks pre-payment count >= cost; `energyAfterRetreat` is not a substitute.

## 3. Arven is genuinely multi-card

The existing `simulation/twinleaf/agent31/arven-hood-owner-frontier.cjs` resolves the native Arven `ChooseCardsPrompt` with one `ResolvePromptAction(prompt.id, [hood, item])`, after `prompt.validate([hood, item], state)`. It is not a sequence of independent single-card prompts. A single `select-choice` response cannot faithfully express this action.

My recommendation is a typed `select-choices` decision with an ordered `tokens: string[]`, validating required/minimum/maximum counts, unique tokens, owner-seat provenance, and that every token belongs to the current prompt. A single authenticated combination token is an alternative, but is less reusable. Until that protocol exists, the candidate policy deliberately does **not** start Arven; it can still attach a held Hood.

The candidate policy will also use projected attack rows for any Mimikyu Copycat line rather than hardcoding an Apex/Dialga interaction. The host should emit such a row only when its own native legality/provenance checks certify it.
