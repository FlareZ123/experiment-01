# Aichi Regidrago Kyurem SFA47 copied Trifrost: fixed-count damage targets

**Agent21 · 28 November 2026 · isolated reversible paper-Expanded prompt correction**

## Defect and real-game consequence

Original authenticated Aichi Regidrago lists at ranks **10/12/13/14/18/20/21/27/32** each contain **Kyurem SFA47**, the Dragon attack payload for Regidrago VSTAR's **Apex Dragon**. Its **Trifrost** says: **"This attack does 110 damage to 3 of your opponent's Pokémon."** It does **not** say "up to 3."

The supplied *Advanced Player's Rulebook* §D-04 **Choose** requires that a specified number of targets **must** be selected. If fewer than that number exist, choose as many as exist; players may not voluntarily choose fewer than the available specified count. For Trifrost:

| Opposing Pokémon currently in play | Exact required distinct targets |
|---:|---:|
| 1 | 1 |
| 2 | 2 |
| 3–6 | 3 |

This applies to targeting the opponent's **Active and Bench**. The player's own Pokémon cannot be chosen, and repeatedly choosing one opposing Pokémon does not count as distinct opposing Pokémon.

Pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, file `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/kyurem.ts`, constructs
`new ChoosePokemonPrompt(player.id, CHOOSE_POKEMON_TO_DAMAGE, TOP_PLAYER, [ACTIVE,BENCH], {min:1,max:3,allowCancel:false})`.
With 3 or more opposing Pokémon in play this **accepts illegal one- or two-target selections**, letting a human or program avoid damaging a target when the attack does not provide that option. The generic pinned `ChoosePokemonPrompt.validate` also checks count and nonempty cards but **does not check uniqueness or membership in opponent slots**, permitting duplicate/own-slot selectors through a forged raw prompt resolution. Front-end controls may mask some of these cases, but the native validation itself is insufficient.

This is not a conclusion about win rates. It matters for Regidrago attacking through a multi-Pokémon board, target sequencing, on-damage triggers, Knock Outs, and policies that would otherwise exploit the illegal partial targeting.

## Implemented bounded repair

- [Reversible source-card hook](../../../simulation/twinleaf/agent21-kyurem-trifrost-target-prompt-paper-hook.cjs)
- [Isolated test suite](../../../tests/2026-11/agent21-kyurem-trifrost-target-prompt-paper-hook.test.cjs)
- [Optional true pinned native prompt smoke](../../../tests/2026-11/agent21-kyurem-trifrost-native-prompt-smoke.test.cjs) — **not executed**.

`withPaperKyuremTrifrostTargets(work)` temporarily hooks only the pinned `Kyurem.prototype.reduceEffect` branch for its attack index0. It wraps the Store's `prompt` method **only during that synchronous reducer execution**, matches the exact native `ChoosePokemonPrompt` damage-target schema, and replaces its options with `min=max=min(3, live opposing Active/Bench)`. It retains all other native prompt mechanics and adds an instance-only `validate` wrapper requiring the native checks, uniqueness, the exact count, and membership in the actual opponent's public in-play slots. The fixed prompt and its validator persist after the wrapping scope returns so the subsequent native prompt resolution obeys the corrected rule. The Store method and Kyurem prototype are restored in `finally`. No upstream code, hidden-zone data, owner campaign fixture, or gameplay policy is changed.

The hook is deliberately **fail-closed** if the pinned prompt schema or expected attack identity changes; it does not silently broaden the rule or handle generic multi-target attacks. It can cover Kyurem's own Trifrost and the native `sourceCard.reduceEffect.call(copycat)` delegation used when Regidrago VSTAR copies Trifrost.

## Test receipt and limits

**Isolated synchronous JavaScript / mocked native interfaces: 10/10 tests PASS** in both seats, for opponent boards of 1,2,3,4,6 Pokémon, accepted exact selections, rejected too-few/duplicate/own targets, blocked/empty targets, copied attack identity, original non-Trifrost delegation, unrelated prompts unaffected, incompatible prompt schema failure, and error/async restoration.

**No compiled pinned native Store, 2-sided game, actual prompt resolution, full deck setup, or matchup was executed.** The optional real native prompt smoke is committed and will skip if the pinned engine is not built. It directly generates a synthetic `AttackEffect`, so even if executed, its result alone would not certify a legally paid Trifrost attack or actual Apex Dragon copy. Native Store review should test the prompt through the full actor-facing action executor and current V3 protocol, with no unauthorized campaign dispatch.

## Acceptance decision

This is a **proposed rules-fidelity repair** and optional test, not an admitted opponent-policy capability or benchmark result. An owner-authorized, independent native smoke should first confirm `ChoosePokemonPrompt` is actually generated and the corrected count/selection is enforced after the reducer exits. Subsequently, verify a Regidrago Apex Dragon copy of Trifrost using the unchanged original printed 60, with complete Energy and discard legality. Do not merge into frozen V3, update fixed-deck nominations, dispatch CI/game runs, or report win percentages from these local tests alone.

This correction is separate from Agent21's other two engine fixes to the attacking-side modifiers of rank15 Mega Lopunny ex Spiky Hopper and the nine Regidrago source lists' copied Dialga-GX Shred.
