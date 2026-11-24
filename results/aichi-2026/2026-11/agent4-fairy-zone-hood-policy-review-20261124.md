# Agent4 review — Fairy Zone and Stealthy Hood resolver

**Reviewed:** PR #69 candidate-policy head `5ba750ff6f17400ffb02e8541ee43718e461a46e`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No code or PR changes made.

## Executive assessment

The card-scope mapping in `fairyZoneSourceTargetsHolder()` is broadly faithful for the listed Ability sources. The material defects are in the test fixture, source-order semantics, unknown-state propagation, and the separate Hood/Radiant-Gate threat helpers.

## 1. Definite test error: Alolan Muk is Psychic, not Darkness

`tests/2026-11/agent46-candidate-policy.test.cjs:347-389` constructs `Alolan Muk SUM 58` with `types: ['Darkness']`. The pinned implementation at `ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon/alolan-muk.ts:18,24-26` declares `cardType: [P]` and Power of Alchemy. Wobbuffet PHF's Bide Barricade explicitly exempts Psychic Pokémon (`set-phantom-forces/wobbuffet.ts:23,29-34`).

With the real Psychic type:
- Wobbuffet does **not** suppress Alolan Muk.
- Alolan Muk's Power of Alchemy **does** suppress Basic Wobbuffet.
- This is a one-way suppression edge, not a mutually suppressive pair.

The test currently fabricates a cycle and calls it an activation-order conflict. Correct the Muk type to Psychic and assert the one-way result. It should not require activation-order evidence.

## 2. Source-order resolver is too broad

`fairyZoneLockSources()` assigns `activationOrder` from the slot field to every source, including Alolan Muk and Garbodor. Neither has `abilityLock: true`; neither receives the native Active-lock stamp. The field is valid only for a tracked Active `abilityLock: true` source. In addition, `orderAbilityLockSources()` sorts every multi-source set by numeric order; zero is accepted as a valid earliest order.

Recommendations:
- Treat order as known only for a positive safe integer on an Active source whose Power has `abilityLock: true`.
- Bench/global sources (Muk, Garbodor) have unknown order in this contract.
- Do not require order for a one-way suppression relationship. A directed source-suppression graph can resolve acyclic/one-way relationships; require first-in-effect order only within mutually suppressive cycles. If a cycle's order is unknown, remain fail-closed.
- The reproduced TPCi Garbotoxin-versus-Slaking FAQ is a genuine mutual-source example, but the existing Aichi lock synthesis does not identify Slaking in the known field. Do not add a broad host field solely for this generic case.

## 3. Stealthy Hood: known behavior versus tri-state gaps

Correct:
- `hasEffectiveStealthyHood()` returns unknown when the target's `tools` array is unknown.
- It correctly disables Hood when Jamming Tower is live.
- It correctly disables Hood when a live Tool Jammer is attached to the opposing Active Pokémon and the Hood target is that player's Active Pokémon.
- `abilityLockSourceSuppressesTarget()` correctly applies Hood only against an opponent-owned Ability; own Abilities are not stopped by your own Hood.
- Snorlax PGO 55's Block is a legitimate Hood-relevant effect: it prevents the opponent's Active Pokémon from retreating, which is an effect done to that Pokémon.

Gaps:
- In `hasEffectiveStealthyHood()`, if the opposing Active Pokémon's `tools` array is missing, the Tool Jammer check defaults to “not attached” and returns Hood effective. That should be unknown.
- `hasActiveStealthyHoodThreat()` collapses unknown target Tools, unknown `stadiumAndToolEffectsLive`, and unknown Ability status to false/no threat. Its Tool Jammer check treats an unknown opposing Active Tools array as “no Tool Jammer,” which can overstate Hood effectiveness. Preserve null/unknown rather than treating incomplete state as known.
- `fairyZoneLockSources()` drops Garbodor entirely when `slot.tools` is unknown (`!Array.isArray(slot.tools)`), rather than retaining an unknown Garbotoxin source.
- `hasOpponentFairyZoneThreat()` treats an unknown opponent Fairy Zone status as false and skips a potential target when its Tools are unknown. This is another false-negative path.

## 4. Silent Lab is incorrectly treated as disabling all Hood use

`hasActiveStealthyHoodThreat()` returns false if either Jamming Tower **or Silent Lab** is present. Jamming Tower disables Pokémon Tools; Silent Lab suppresses only Basic Pokémon's Abilities. Shadow Rider Calyrex VMAX is not Basic, so Silent Lab does not suppress its Ability and does not disable Stealthy Hood. The blanket Silent Lab check creates a false negative for a VMAX target. If the target is Basic Shadow Rider V, Silent Lab itself is a Stadium suppression that Hood cannot override; distinguish V from VMAX rather than treating both identically.

## 5. Threat helpers omit several text-relevant sources

`fairyZoneLockSources()` includes the requested source families and its target scopes are correct for an in-play Fairy Zone holder:
- Klefki: Active, Basic Pokémon on both sides, except Mischievous Lock.
- Iron Thorns ex: Active, Rule Box Pokémon on both sides, except Future Pokémon.
- Flutter Mane: Active, opponent's Active Pokémon only.
- Galarian Weezing / Neutralizing Gas: Active, opponent's Pokémon in play.
- Slaking / Lazy: Active, opponent's Pokémon in play.
- Wobbuffet: Active, non-Psychic Pokémon.
- Alolan Muk / Power of Alchemy: anywhere in play, Basic Pokémon on both sides.
- Garbodor / Garbotoxin: anywhere in play with a Tool attached, Pokémon on both sides.

But the other decision helpers are narrower:
- `hasAbilityLockThreat()` only includes opponent Iron Thorns and Garbodor. It misses opponent Active Galarian Weezing / Slaking for Shadow Rider VMAX, and misses Klefki / Alolan Muk for a Basic Shadow Rider V.
- `hasRadiantGateLock()` includes Path to the Peak, Silent Lab, Iron Thorns, Wobbuffet, and Garbodor. It omits Klefki and Alolan Muk (both suppress Basic Radiant Eternatus), and opponent Active Galarian Weezing / Slaking (both suppress an opponent's Benched Radiant Eternatus). Do not add own Weezing/Slaking as suppressors of your own Radiant Eternatus: their text is opponent-only. Flutter Mane does not suppress a Benched Radiant Eternatus, so it is correctly absent from this particular helper.

These are general coverage gaps. Agent35's current Aichi lock synthesis identifies Garbodor, Iron Thorns, and Silent Lab as the known field axes, not the omitted sources; ranks 23, 25, and 28 remain unauthenticated. Treat these as field blockers only if an exact recovered Aichi list contains them.

## Recommended narrow changes

1. Fix the Alolan Muk fixture type and change the test from a false mutual-lock/order case to the actual one-way Muk -> Basic Wobbuffet interaction.
2. Normalize order to positive-safe-integer only for Active `abilityLock: true` sources; never treat zero or Bench/global sources as ordered.
3. Preserve tri-state for unknown Tool/effect/Ability state, especially opposing Active Tool Jammer.
4. Remove the blanket Silent Lab Hood suppression for VMAX targets.
5. Extend the Radiant-Gate and Hood threat helpers only for source cards present in the authenticated Aichi field; otherwise keep generic additions separate from the current benchmark gate.

No code, tests, deck, or PR branch was modified.


## Minimal regression matrix for the owner

1. **One-way Muk/Wobbuffet:** use Alolan Muk SUM 58 with Psychic type. Muk suppresses Basic Wobbuffet; Wobbuffet does not suppress Psychic Muk. With no activation-order fields, resolve Muk as the surviving source and do not return unknown.
2. **True mutual cycle:** use Neutralizing Gas versus Wobbuffet (TPCi first-in-effect precedent) or the TPCi Garbotoxin/Slaking pair. Known order selects the first source; unknown order must remain unknown, never treat zero as earliest.
3. **Active-only versus Bench scope:** Flutter Mane suppresses only the opponent's Active; it must not suppress a Benched Fairy Zone holder or Benched Radiant Eternatus. Klefki and Iron Thorns apply their printed global in-play scopes from the Active Spot; Muk/Garbodor can source from the Bench under their own conditions.
4. **Hood target scope:** target Active + opposing Active Tool Jammer -> Hood ineffective; target Bench + opposing Active Tool Jammer -> Hood remains effective; live Jamming Tower -> Hood ineffective; unknown target Tools or unknown opposing Active Tools -> Hood status unknown.
5. **Silent Lab distinction:** Silent Lab suppresses Basic Shadow Rider V, and Hood cannot override that Stadium; Silent Lab does not suppress Shadow Rider VMAX and must not blanket-disable its Hood protection against other Abilities.
6. **Hood threat coverage:** opponent Active Weezing/Slaking threatens Shadow Rider VMAX; opponent Klefki/Alolan Muk threatens Basic Shadow Rider V but not VMAX; Wobbuffet does not suppress Psychic Shadow Rider; Flutter Mane threatens only when the Shadow Rider is opponent's Active Pokémon.
7. **Radiant Gate scope:** opponent Active Weezing/Slaking suppresses a Benched Radiant Eternatus; own Weezing/Slaking does not suppress own Radiant; Klefki/Power of Alchemy suppress Basic Radiant on either side; Flutter Mane does not suppress a Benched Radiant.
8. **Unknown opponent Fairy Zone:** `opponentFairyZoneStatus === null` must not collapse to “no threat”; the Hood search need should remain unknown until the holder's status and target Tool state are known.


## Fairy Zone source/target orientation is correct

Pinned `Lillie's Clefairy ex JTG 56` text says Fairy Zone changes the Weakness of **each of your opponent's Dragon Pokémon in play** to Psychic. Its implementation calls `CAN_APPLY_ABILITY_TO_TARGET` for the Dragon target; that probe respects effects such as Stealthy Hood. The reviewed policy's orientation is correct here: `opponentFairyZoneStatus(view)` is used when checking the actor's own Dragon targets, while `fairyZoneStatus(view)` represents the actor's source affecting opponent Dragons. No source-seat inversion was found in this path.
