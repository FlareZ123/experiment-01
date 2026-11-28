# Original Aichi Regidrago: copied Dialga-GX Shred loses Muscle Band damage in pinned Twinleaf

**Agent21 | 2026-11-28 | isolated research branch; native game status: NOT RUN**

## A concrete field-wide fidelity error

The authenticated Aichi original sixties in `results/aichi-2026/full-decklists.json` contain **nine Regidrago variants** with the following exact common interaction:

| Original Aichi rank | Dialga-GX UPR 100 count | Muscle Band count |
|---:|---:|---:|
| 10 | 1 | 2 |
| 12 | 2 | 2 |
| 13 | 1 | 2 |
| 14 | 1 | 2 |
| 18 | 1 | 2 |
| 20 | 1 | 2 |
| 21 | 1 | 1 |
| 27 | 2 | 2 |
| 32 | 1 | 1 |

Apex Dragon can copy the **Shred** attack (80 damage) of a Dialga-GX in its owner's discard pile. A live **Muscle Band XY121 attached to Regidrago VSTAR** adds 20 damage to attacks against the opponent's Active Pokémon (before Weakness and Resistance). In the relevant ordinary unmodified state, **Shred is 100, not 80**. This remains true when the copied attack ignores effects on the *defending* Pokémon: Muscle Band affects the attacker's damage, not the defender's protection.

A concrete discrete breakpoint: **Girafarig LOT94 HP90**, undamaged and without modifiers, survives unboosted Shred 80 but is Knocked Out by Shred 100 with active Muscle Band. This is a conditional rules / mathematical conclusion, not a frequency or match-win estimate.

## Exact pinned native defect and blast radius

Twinleaf revision: **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**.

- `ptcg-server/src/sets/08-sun-and-moon/set-ultra-prism/dialga-gx.ts`, `DialgaGX.reduceEffect` Shred index 1, manually resolves `new ApplyWeaknessEffect(effect,80)`, sets `effect.damage=0`, and applies `opponent.active.damage += damage`.
- The generic `DealDamageEffect` is never dispatched on this path.
- `ptcg-server/src/sets/07-x-and-y/set-x-and-y/muscle-band.ts` adds +20 exclusively via `TOOL_ACTIVE_DAMAGE_BONUS`; in `prefabs/tool-prefabs.ts`, that helper explicitly requires `effect instanceof DealDamageEffect` and a live Tool. Thus this source-side damage bonus is skipped.
- Twinleaf's copied-attack delegation invokes the original source reducer with the current copying Pokémon as `this`. The fix must evaluate actual Regidrago's attached Muscle Band, not a hypothetical Dialga board or unknown discard contents.

This failure can affect Shred paths across **all nine** exact-source Regidrago variants, though **there are no measured affected-game frequencies or validated competitive outcomes**.

## Implemented bounded, opt-in compatibility repair

- [Reversible engine hook](../../../simulation/twinleaf/agent21-regidrago-dialga-shred-paper-hook.cjs)
- [Isolated JavaScript test](../../../tests/2026-11/agent21-regidrago-dialga-shred-paper-hook.test.cjs)
- [Optional real pinned-Store reducer smoke](../../../tests/2026-11/agent21-regidrago-dialga-shred-native-smoke.test.cjs) — committed; **NOT RUN**.

The research-owned `withPaperRegidragoDialgaShred(work)` temporarily replaces only `DialgaGX.prototype.reduceEffect` for `WAS_ATTACK_USED(...,1,this)`; Overclock and Timeless-GX delegate exactly to the pinned original. It constructs a `DealDamageEffect` **probe** for the attached Muscle Band's *own* native `reduceEffect` to respect Tool suppression, but does **not dispatch the damage probe through the Store**, so defending-Pokémon protections still cannot reduce Shred. Next it uses the native Weakness/Resistance effect and AfterDamage, preserves the source's outgoing modifiers, and sets original `effect.damage=0` to prevent duplicate generic damage. The complete exact original prototype descriptor is restored, even on throw; asynchronous work is rejected. Vendor code remains untouched.

**Demonstrated local isolated execution:** **8/8 focused injected Store/effect tests PASS**, including both physical seats, 80/100 base and Tool-suppressed outcomes, Regidrago copied-attack `this`/actual tool owner, native-other-attack delegation, attacking-side modifiers, fake-source fail-closed, unknown Tools inert, and exception-safe restoration. Executed with a synchronous V8 test harness using the exact GitHub branch code. **No compiled pinned Store, native card reducer, actual two-sided game, natural deal, or benchmark was executed.** The optional native smoke constructs real pinned `DialgaGX`, `MuscleBand`, `Girafarig`, and `RegidragoVSTAR` classes, and includes two **unexecuted** integration cases: printed Dialga Shred and a sticky copy-attack session using `openCopyAttackSession` and Apex Dragon's cloned Shred on the actual Regidrago attacker. Both are designed to compare unpatched 80 with patched 100 in both seats; **neither was executed nor qualified**.

**Next independent gate:** inspect/execute the optional real pinned Store smoke after an authorized local build. If that passes, test *Regidrago Apex Dragon actual copy delegation* in a scoped actor-visible pinned native encounter with the complete original source and an attached live Muscle Band; independently check Tool suppression and source hand/prize legality. Only then consider enabling the hook for a future owner-authorized field run. It should **not** be merged into frozen V3/Stage-A, entered as a qualified win-rate result, or generalized to other Shred implementations without separate tests.

## What this changes strategically

A consistent +20 omission can change whether a low-HP Pokémon is knocked out, the associated Prize progression, whether an opponent must promote, and the attack-choice tradeoff for a Regidrago policy (including Shred versus other Dragon attacks). The improvement is to native **fidelity**, not proof that Regidrago is a stronger fixed candidate or that any matchup has been won. Preserve the nine source decklists unchanged and compare only equivalent policy/engine versions.
