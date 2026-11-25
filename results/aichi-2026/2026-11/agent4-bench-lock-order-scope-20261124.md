# Bench/global Ability-lock activation order is not covered by the v4 Active-order field

**Checked:** 2026-11-24, against the repository's pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Question

Does `actorObservation.visiblePokemon[].abilityLockActivationOrder` represent when a Bench/global Ability suppressor enters play or becomes effective, or only Active-lock activation order?

## Pinned-source conclusion

**It is Active-entry order for Pokémon whose Power is explicitly marked `abilityLock: true`. It does not represent activation order for Bench/global suppressors such as Garbodor's Tool-conditional Garbotoxin or Alolan Muk's Power of Alchemy.**

Evidence:
- `ptcg-server/src/game/store/state/pokemon-card-list.ts:78-84` documents the slot field as the last activation of an `abilityLock` Ability **while Active**; zero means no established ability locker.
- `ptcg-server/src/game/store/prefabs/ability-lock.ts:457-469` documents `STAMP_ABILITY_LOCK_ACTIVATION` as stamping when an `abilityLock` Pokémon becomes Active and returns unless `card.powers.some(p => p.abilityLock)`.
- `ptcg-server/src/game/store/store.ts:140-148` stamps only on `MovedToActiveEffect` and clears on `MovedFromActiveToBenchEffect`.
- `ptcg-server/src/game/store/effect-reducers/game-effect.ts:896-900` resets/restamps only when the evolving slot is Active. `setup-reducer.ts:299,576` stamps starting Active lockers together.
- Basic Pokémon placement from hand, deck, and discard is handled by `play-pokemon-effect.ts:52-56`, `play-pokemon-from-deck-effect.ts:28-35`, and `play-pokemon-from-discard-effect.ts:27-35`; those paths move the Pokémon into the target slot and set `pokemonPlayedTurn`, but do not stamp activation order.
- Alolan Muk SUM's `Power of Alchemy` is a global Basic-Pokémon suppressor that checks for Muk anywhere in play; its Power does not declare `abilityLock: true` (`set-sun-and-moon/alolan-muk.ts:22-25,72-103`).
- Garbodor DRX's `Garbotoxin` is a global suppressor when the Pokémon has a Tool; its Power likewise does not declare `abilityLock: true` (`set-dragons-exalted/garbodor.ts:29-37,57-84`). Its effective-onset condition is Tool attachment plus the ability being able to activate.
- By contrast, Slaking CES's `Lazy` declares `abilityLock: true` and is Active-only; Klefki SVI and Flutter Mane TEF also declare `abilityLock: true` with Active-scoped text.

The v4 observation adapter correctly projects the slot property (not the Pokémon card object). That fixes the Active-lock projection bug, but does not broaden what the pinned engine records.

## Paper-ruling update

A reproduced **TPCi Rules Team Celestial Storm FAQ** directly establishes a mixed Active/Bench+Tool source-order case: Slaking's Active-only `Lazy` versus Bench-capable Garbodor's Tool-conditional `Garbotoxin`. The answer says the result depends on which Ability activates first; when one is active, it prevents the other, and if it is disabled (Slaking leaves Active or Garbodor loses its Tool), the other can activate even if it was previously prevented. The reproduction attributes the FAQ to 2018-08-02. See the PokéBeach thread's quoted FAQ answer: https://www.pokebeach.com/forums/threads/lunatone-kecleon.150999/ (post #6, lines 190-194 in the opened page).

A second reproduced TPCi ruling for Galarian Weezing's Neutralizing Gas versus Wobbuffet's Bide Barricade says whichever Ability comes into effect first takes priority: https://www.pokebeach.com/forums/threads/please-explain-to-me-this.153648/ (quoted 2022-03-31 TPCi Rules Team ruling). A related reproduction of the 2018 FAQ says that if the two Abilities activate simultaneously, the turn player's Ability activates first: https://www.reddit.com/r/ptcgo/comments/m1elss/battle_styles_rulings_questions/.

**Therefore the Garbotoxin/Slaking mixed-source order is a confirmed paper interaction, not merely a hypothetical.** The current v4 field can carry Slaking's Active order, but it cannot carry Garbodor's Tool-conditioned effective activation order or its later reactivation after Slaking stops suppressing it.

### Correction: Alolan Muk versus Wobbuffet is not a mutual-lock example

An earlier Agent11 example described Bench Alolan Muk versus Active Wobbuffet as mutually suppressive. That example is incorrect: Alolan Muk SUM is Psychic type, while Wobbuffet PHF's Bide Barricade explicitly exempts Psychic Pokémon. Pinned card implementations confirm Alolan Muk's `cardType: [P]` and Wobbuffet's Psychic type / exemption. Do not use this pair as a source-order regression.

This correction does not establish every possible Power of Alchemy interaction. Any other mixed Muk/Active-lock pair should be evaluated against its actual type and scope rather than inferred from the invalid Wobbuffet example.

## Consequence for the candidate resolver

- Do not use `abilityLockActivationOrder` to order Garbodor/Alolan Muk or any other Bench/global source that is not stamped by the pinned engine.
- Do not treat zero as an established order or use `turnSeat` as a fallback for an untracked source.
- For the confirmed Garbotoxin/Slaking interaction, the model needs the moment Garbotoxin **actually becomes effective**, including reactivation after the competing lock is disabled. Stamping only when the Tool is attached is insufficient if Garbotoxin is itself prevented at that time.
- Keep the mixed-source result unknown/fail-closed until the exact fixed matchup requires it and the observation layer can supply the required effective-activation history.

If the current Aichi fixed-pair policy needs this interaction, the research-side solution is a separate effective-suppressor activation ledger that records false-to-true transitions (including Tool attachment/removal and later reactivation). Keep it in research-owned hooks/adapters; do not overload `abilityLockActivationOrder` or modify upstream Twinleaf. Do not add a broad new host field unless the fixed matchup demonstrates that it changes the current policy decision.

## Limits

The pinned-source lifecycle finding and reproduced TPCi rulings establish the Garbotoxin/Slaking precedence rule, but the linked FAQ reproductions are not the original official TPCi document. The exact Aichi fixed-pair incidence still needs to be shown before expanding the shared adapter. No code, test, workflow, deck, fixture, or game was changed or run.


## Aichi benchmark scope check

The existing [Agent35 Aichi lock-architecture synthesis](results/aichi-2026/2026-11/agent35-lock-architecture-field-synthesis-20261117.md) identifies the published field's relevant lock axes as Garbodor (ranks 8, 11, 16, 22), Iron Thorns (ranks 6, 24, 29), and Silent Lab (ranks 9, 13, 15, 32). It does not identify Slaking as an Aichi source, and the current leading Hood Shield Shadow Rider candidate is not itself an Ability-suppressor deck. The synthesis also establishes the relevant asymmetries: Garbodor is Stage 1 and is not suppressed by Iron Thorns' Rule-Box-only lock; Wobbuffet's Psychic exception prevents it from suppressing Psychic Garbodor; Alolan Muk and Spiritomb do not suppress Stage 1 Garbodor.

Accordingly, the TPCi Garbotoxin/Slaking ruling is a **general rules/fidelity requirement**, but the current Aichi fixed-60 benchmark has not demonstrated a matchup in which both mutually suppressive sources are present. It does **not** currently justify expanding the shared actor-observation schema or blocking PR #69 on a new effective-source ledger. Keep the existing Active-order field's zero sentinel as unknown (the separate zero-to-null projection fix is still required), and add a broader effective-source ledger only if an exact Aichi candidate/opponent pair demonstrates that the missing order changes a current policy decision.


## Observation-contract test discrepancy

The current `tests/actor-observation-contract.test.cjs:197-227` fixture injects positive order values into:
- Active Mewtwo & Mew-GX and Active Garbodor (neither fixture Power declares `abilityLock: true`);
- Benched Wobbuffet (an `abilityLock: true` Pokémon, but not Active);
- Benched Alolan Muk (not an `abilityLock: true` source).

It then asserts that all four values are publicly exposed, including the Bench values. That proves only that the adapter copies an arbitrary slot integer; it does **not** validate native activation-order semantics and conflicts with the pinned source lifecycle. The field is stamped only for `abilityLock: true` Powers while Active, and the Store clears it on Active-to-Bench movement.

Recommended semantic contract: expose a positive safe integer only for the current Active slot when its card has an `abilityLock: true` Power; return null for zero, non-lock Pokémon, and all Bench slots. If the adapter deliberately remains a raw slot-field serializer, the test and field documentation must say so, and the worker resolver must independently enforce Active + `abilityLock: true` + positive safe integer before using an order. The regression should cover a valid Active Slaking/Klefki/Wobbuffet order, zero -> null/unknown, non-lock Active -> unknown, and Bench source -> unknown even if a poisoned positive value is present.


## Current rank-1 observation/policy check (2026-11-25)

**Question:** can the current rank-1 Shadow Rider policy derive a source-attributed suppression result for Fairy Zone and Climactic Gate from the current actor-observation fields?

**Answer: no, not generally. Keep the policy fail-closed; do not claim source-attributed resolution or policy competence from the current fields.**

Checked rank-1 policy branch `agent6/rank1-policy-v3-review-20261124` at report head `3009eed98f40d2a523f67a887c2ff8e5aa44a531` (tested policy/test blobs remain `89a3e93c0f804713509e924ba76c5df7ccf9e96e`).

- `simulation/twinleaf/actor-observation-contract.cjs` initializes each `abilitySuppressions` entry with `suppressed:null`, `reasonCode:null`, and `sourcePrinting:null`. These are unknown placeholders, not source-attributed engine results.
- The observation exposes `turnSeat` and the raw slot `abilityLockActivationOrder`, but the latter only has valid semantics for a current Active Pokémon whose Power declares `abilityLock:true`, with a positive safe-integer order. Zero means no established Active locker. It does not timestamp Bench/global sources or later transitions such as Garbotoxin becoming effective when a Tool is attached, or reactivating after a competing source is disabled.
- The existing observation contract test at `tests/actor-observation-contract.test.cjs:197-227` is a raw-copy test and deliberately injects positive values into Bench and non-`abilityLock:true` fixtures. It is not evidence that those values are semantically valid. The resolver must independently enforce Active + `abilityLock:true` + positive safe integer; `turnSeat` is only a simultaneous Active-lock tie-break, never a substitute for missing source activation history.
- In the rank-1 policy, `abilitySuppressionStatus()` / `abilityIsSuppressed()` preserve null. `fairyZoneActive()` requires an explicit `suppressed === false`, so unknown Clefairy status does not grant Fairy Zone. Conversely, `isGateAbilitySuppressed()` treats a possible suppressor as live unless it is explicitly known suppressed, so an unknown suppressor conservatively blocks Gate. This asymmetry is fail-closed, but it can undercount Fairy Zone and over-block Gate. It is not a source-attributed result.

The printed scopes in the earlier source matrix still support direct reasoning when all conditions are known: Path to the Peak suppresses Rule-Box abilities; Silent Lab suppresses Basic-Pokémon abilities; Wobbuffet's Psychic exception means it does not suppress Psychic Clefairy or Shadow Rider but does suppress Dragon Radiant Eternatus; Iron Thorns suppresses Rule-Box Pokémon except Future; Klefki suppresses Basic Pokémon; Garbotoxin suppresses other abilities while its Tool condition is live; Flutter Mane affects only the opponent's Active Pokémon. Fairy Zone works from a Benched Clefairy; it is not Active-only.

However, the current observation does not say which suppressor is itself effective, and its `sourcePrinting` / `reasonCode` fields are null. It therefore cannot resolve a general source graph. One-way edges can be reasoned about without activation order. Wobbuffet does not suppress the Aichi Psychic-type Garbodor printings because Bide Barricade exempts Psychic Pokémon; Tool-live Garbotoxin can suppress Wobbuffet, so that pair is one-way, not a cycle. The confirmed mixed-source cycle is Active Slaking versus Tool-live Garbodor, as documented above; it remains a general rules-fidelity case, not an Aichi source-list blocker, because the Aichi field has no Slaking or Alolan Muk lists. Alolan Muk versus Wobbuffet is also one-way: Muk suppresses Basic Wobbuffet, while Wobbuffet exempts Psychic Muk. The field does contain Garbodor (8, 11, 16, 22), Iron Thorns (6, 24, 29), Wobbuffet (7, 10, 21), Silent Lab (9, 13, 15, 32), Klefki (4, 17), and Flutter Mane (19).

**Precise missing facts:** either an engine-resolved source-attributed effective status for each Ability (including why and which source suppresses it), or a complete effective activation ledger for all sources, including Bench/global condition changes and reactivation. The current fields provide neither. Keep null as unknown; do not coerce it to false for Fairy Zone or to a proven active/inactive status for a suppressor. If the fixed Aichi matchup does not require a mixed-source cycle, do not expand the shared observation schema just to solve a generic cycle.

This is a static observation/policy review only. It does not validate a native interaction, establish a matchup result, or authorize code changes. No test, workflow, fixture, game, or deck was changed or run.


### Test/adapter boundary

The rank-1 policy's explicit suppression tests are synthetic branch tests, not actor-observation integration. For example, `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs:4140-4170` hand-constructs a Benched Clefairy with `abilitySuppressions: [{ abilityName: 'Fairy Zone', suppressed: false }]`; the corresponding unknown fixture omits that field. The live actor-observation adapter instead emits `suppressed:null`, `reasonCode:null`, and `sourcePrinting:null` for every ability entry. Thus the passing explicit-false test proves only that the policy's known-unsuppressed branch behaves as authored; it does not prove the real adapter can ever supply that branch. No current end-to-end test demonstrates an actor-observation record with source-attributed Fairy Zone or Gate suppression reaching the rank-1 policy. Keep this distinction explicit: branch logic is contract-tested, live source attribution is not.


### Symmetric Wobbuffet scope

Wobbuffet PHF's Bide Barricade is **symmetric**: if Wobbuffet is Active, each Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities except Psychic Pokémon. It suppresses non-Psychic Pokémon on both sides, including its controller's own Radiant Eternatus. It does not suppress Psychic Garbodor, Psychic Alolan Muk, Psychic Clefairy, or Psychic Shadow Rider. This is distinct from opponent-only locks such as Flutter Mane and Slaking, and from both-side locks such as Path to the Peak, Silent Lab, Iron Thorns, and Tool-live Garbotoxin.


### Rank-1 Gate helper: Wobbuffet's both-side scan is correct

Static review of `agent6-rank1-shadow-rider-opponent-policy.cjs:346-349` found that `isGateAbilitySuppressed()` scans `[own, opponent]` for Active Wobbuffet. This is consistent with the exact Bide Barricade text in `resources/cards/en/xy4.json`: “each Pokémon in play, in each player's hand, and in each player's discard pile” has no Abilities except Psychic Pokémon. An own Active Wobbuffet therefore does suppress its controller's own non-Psychic Radiant Eternatus; do not change the helper to opponent-only. Klefki and Iron Thorns are also both-side sources, while Neutralizing Gas and Slaking are opponent-only.

This is not a policy bug. The current regression `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs:3660-3692` verifies opponent Active/Bench Wobbuffet but does not explicitly test the symmetric own-Active positive case. Adding that test would improve coverage if separately authorized, but the missing test is not evidence that the implementation is wrong.


The current regression `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs:3660-3692` verifies opponent Active/Bench Wobbuffet but lacks an own-Active positive case. Add one if separately authorized to lock in the symmetric printed scope.
