# Preregistered native first-match arbitration fixture, 29 October 2026

**Owner:** Agent 5. **Purpose:** Test a bounded, owner-information-safe first-return conflict in the existing shared actor-only policy, using genuine pinned Store actions. This is intentionally a staged single-decision mechanics check and is **not a natural field cohort**.

## Frozen staged initial state

Use both physical owner seats 0 and 1. Exactly the same physical zones will be constructed for two same-seat branches, prior to seeing either branch's outcome:

- Owner Active: printed **Venonat MEW** (first attack `Gnaw`, one Colorless, 10 printed damage), with exactly one properly attached **Psychic Energy SVE**.
- Owner Bench index 1: printed **Regidrago V SIT**, no Energy.
- Owner hand: exactly one printed **Double Dragon Energy ROS**, no other cards. All other Bench slots empty.
- Opposing Active: **Pidgey MEW**, no attached Energy, enough remaining HP to survive 10 damage.
- Genuine native `Player`, `Store`, five `PokemonCardList` Benches per player, staged nonempty deck and six Prizes per player. Expanded format, player turn 2 and active owner seat as specified. No forced additional held cards or altered cards between arms.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Predeclared two forks

1. **First-return attack branch:** use `chooseActorRootIntent` with `publicContextSpecialEnergy:true`. Expect the existing earlier `attack` priority to select Venonat's `Gnaw`. Dispatch that exact native `AttackAction`. Attest genuine attack resolution/damage and whether the owner turn ends; no attachment.
2. **Alternative resource branch:** at the **same detached actor observation**, independently call `choosePublicContextSpecialEnergy`. Expect `attach-special-energy` on Regidrago V at Bench index 1. Dispatch its native `PlayCardAction`. Attest printed Double Dragon Energy physically attached to the intended Bench and absent from hand, with unchanged Active Energy, correct public-zone witness, no unresolved prompts. Then check whether the exact same printed `Gnaw` is still payable and can settle as a native attack on the same turn, without a changed opponent board prior to the attack.

Both seats and all attempted branches must be retained, including rejected actions, pending prompts, unexpected native restrictions, and mismatches. Native success must be demonstrated by real post-dispatch State mutation, not a nonthrow or root intent alone.

## Hypothesis and limits

This fixture is a proposed counterexample to the claim that an earlier attack priority always allows the policy to consider a later useful Special Energy root in that same turn. The expected mechanical opportunity is `attach Special Energy -> attack`; it is **not a claim that using Double Dragon Energy now is strategically superior** to holding it for the following turn. Future resource value, target loss, opponent tactics, naturally dealt action options, and all Aichi matchup outcomes remain unqualified. An accepted alternative without continuation, or a failed baseline attack, cannot be counted as a complete arbitration contrast.

This registration precedes the native comparison implementation, its compiled results and any outcome-based decision about the fixture. Competitive-qualified games remain zero.
