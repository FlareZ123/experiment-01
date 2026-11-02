# Shared source-printing paper-payment guards, v10

**Agent 4, 2 November 2026.** The existing opt-in `simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs` now independently rejects invalid payment responses for original Aichi ranks 14 and 31. [Compiled native CI 41391036376](https://github.com/FlareZ123/experiment-01/actions/runs/41391036376) **passed**, including both physical player seats. This is a prepared-board test of specific paper rules. **No competitively qualified full games or 99.5% result** are established.

## Source identities

- Rank 14 Manaya Asano Regidrago: original printed **Ultra Ball MEG 131**, Grass Energy MEE 9, Fire Energy MEE 10, Regidrago V SIT 135. Authenticated original-60 SHA256 `a3710764f9937cde704d487d37da21aa0260f5ee5c5f3a4a909d80eeaeaa55b4`. Previous source inventory audit counted Ultra Ball MEG in 14/29 authenticated sixties. The number is card inclusion, not use frequency.
- Rank 31 Yuhi Yokoyama Dusknoir/Chimecho: original 60 contains **4 Roxie CEC 205, 3 Koffing CEC 76, 1 Radiant Alakazam SIT 59**. Authenticated original-60 SHA256 `f95e3f644dc510fd48f122a158c06f37bdf93181210f08deef91b20bc984841a`. Hash provenance: [original admission ledger](original-printed60-admission-v1.json).

## Genuine native Store negative and positive controls

**Radiant SIT59 Painful Spoons.** The original Store accepted three damage counters moved from one opposing Pokémon despite a two-counter printed limit and a rejecting native validator. On the prepared 180/210-HP Bench V that produced a real two-Prize KO. Common portfolio v9/v10 now rejects zero or three counters before native mutation; 1 or 2 same-source counters settle correctly. Separately, the source-identified two-distinct-source payment is rejected. Both physical seats and the genuine Ability animation/MoveDamage prompt were exercised. [Original three-counter finding](agent4-rank31-painful-spoons-same-source-overbudget-native-20261101.md).

**Roxie CEC.** The Store previously accepted a forbidden Pokémon-GX or empty payment. The shared root guard now rejects playing Roxie when the physical hand has no eligible non-GX/non-EX Pokémon; the native source-marked prompt guard checks 1 or 2 eligible distinct physical Pokémon. Genuine legal Roxie payment of Koffing CEC still draws three cards and spreads Koffing damage, while an independently illegal subsequent Painful Spoons transfer is vetoed. [Source triad proof](agent4-original-rank31-roxie-koffing-alakazam-triad-native-20261101.md).

**Ultra Ball MEG.** The original Store accepted a zero-card payment to its mandatory two-card discard, then completed a genuine Regidrago V search while retaining both Energy. The common v10 guard now checks exactly two distinct physical payment cards on the source-marked native `ChooseCardsPrompt` whose declared limits are `min=max=2`. In both native seats it rejects the zero payment before mutation and accepts the genuine two-Energy payment, physically discards both Energy, and moves Regidrago V from deck to hand. The subsequent search prompt is unaffected. The common root preflight also rejects playing Ultra Ball with fewer than two other hand cards. The original Store already rejects this *specific* insufficient-hand root, so the latter is named independent audit evidence rather than a new native counterexample. [Original free-search proof](agent4-original-rank14-ultraball-free-search-native-20261101.md).

## Reproducibility and red-to-green correction

- [Shared Store portfolio v10](../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs), source-scoped negative-only assertions, prototype restoration, vendor unchanged, default off.
- [Rank31 original-printing native tests](../../tests/agent4-rank31-unified-source-negative-native.test.cjs), [rank14 native and pure tests](../../tests/agent4-rank14-ultraball-shared-paper-native.test.cjs), [physical Ultra Ball continuation fixture](../../simulation/twinleaf/agent4-ultra-ball-zero-payment-native.cjs), [insufficient-root fixture](../../simulation/twinleaf/agent4-ultra-ball-insufficient-root-native.cjs).
- [Original-rank14 pretest registration](registrations/agent4-rank14-ultraball-shared-paper-cost-v10-20261102.json) predates new guarded native execution; original native defect separately preregistered. Existing manual-only `aichi-iron-thorns-first-attack.yml` was reused, with no added automatic workflow.
- [CI 41389738819](https://github.com/FlareZ123/experiment-01/actions/runs/41389738819) and [CI 41390044188](https://github.com/FlareZ123/experiment-01/actions/runs/41390044188) passed the rank31 integration and legal Roxie case.
- [CI 41390516024](https://github.com/FlareZ123/experiment-01/actions/runs/41390516024) and [CI 41390756986](https://github.com/FlareZ123/experiment-01/actions/runs/41390756986) remained **red** during Ultra Ball diagnostic. The native payment card collection differs in object identity from the player's hand container. The final check uses genuine printed source and exact payment limits to identify that prompt, while preserving physical-card membership and distinctness. [CI 41391036376](https://github.com/FlareZ123/experiment-01/actions/runs/41391036376) passed these two-seat controls.

## Release admission

The v10 boundary is **not enabled** in the shared canonical full-game runner or frozen v3.1 policy. Any future source-dealt comparison must explicitly select and pin it around the actual live Store, retain accepted root/prompt/payment/effect and opponent continuation, and record source-deal fingerprints and invalid/unverified/censored outcomes. Accepted payment does not independently certify every effect. Unknown contracts remain `PAPER_PROMPT_UNVERIFIED`; source policies, card-pool legality, randomness, match clock and missing three source lists remain separate qualification blockers.

**Field status: 29/32 original opposing printed sixties, zero competitively qualified games, no validated final fixed 60.**
