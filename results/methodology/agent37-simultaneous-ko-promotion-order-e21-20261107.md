# Agent37: simultaneous Active KO exposes seat-asymmetric promotion order in pinned Store

**7 November 2026 | Native Store diagnostic, two physical actor seats | No competitive game qualification**

## Question

When an attack knocks out both players' Active Pokémon at the same time, does the pinned Twinleaf Store promote the player whose turn would be next before the other player? Does the research-owned KO-before-E-21 hook still run Powerglass after both promotions?

## Paper rule and pinned source

The supplied Advanced Player's Rulebook v3.4, §D, Knock Out, step 5 states: **if both players' Active Pokémon were Knocked Out at the same time, the player whose turn would be next promotes a new Active Pokémon first.**

At pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `ptcg-server/src/game/store/effect-reducers/check-effect.ts:164-181`, `chooseActivePokemons`, builds its prompt list by iterating `state.players` in array order.
- `ptcg-server/src/game/store/effect-reducers/game-phase-effect.ts:55-69`, `initNextTurn`, changes the next player by toggling `state.activePlayer`; it does not rotate `state.players`.

Consequently, the first promotion prompt is always for `state.players[0]`, regardless of which player is next. When the attacking player is at physical seat 0, the first prompt is for the attacking player, contrary to §D step 5. When the attacking player is at physical seat 1, the opponent is at index 0 and the order happens to be correct.

## Reproduction

The actual pinned Store fixture in [`simulation/twinleaf/agent37-simultaneous-ko-e21-promotion-native.cjs`](../../simulation/twinleaf/agent37-simultaneous-ko-e21-promotion-native.cjs) uses:

- Attacking Active: **Ferroseed NXD**, 60 HP, with one Basic Metal Energy and one Double Colorless Energy NXD, using its printed 60-damage Self Destruct attack and 60 self-damage.
- Defending Active: **Duskull VIV**, 60 HP.
- Each player has one healthy Benched Pokémon, so both can promote.
- Attacker's Bench: **Unown AOR** with an actual **Powerglass SFA** attached. One Basic Psychic Energy is in the attacker's discard.
- Both players start with six Prizes. The actual attack, KO processing, Prize selection, promotion prompts and end-turn effects are settled through the pinned Store. The fixture's physical-seat mapping follows the shared headless runner: `simulation/twinleaf/headless.cjs:809-836` builds per-seat policies from `state.players[seat]`, and `:1169-1172` dispatches the active actor through `state.activePlayer`. This direct Store transaction uses no shuffle or RNG.

The existing manual-only workflow [42360189482](https://github.com/FlareZ123/experiment-01/actions/runs/42360189482), job **128366732007**, step 13, passed both full baseline/treatment pairs.

## Results

| Attacking physical seat | Paper-required first promoter | Native baseline | Instance-scoped hook v1 |
| --- | --- | --- | --- |
| 0 | Opponent | Owner, **wrong** | Owner, **wrong** |
| 1 | Opponent | Opponent, correct | Opponent, correct |

The failure is deterministic and seat-asymmetric. The existing E-21 hook does not correct it because it delegates KO and promotion handling to native `checkState`.

The same test independently verifies the E-21 ordering improvement:

- Baseline: Powerglass is still attached to a Benched Unown when the original EndTurnEffect runs. No AttachEnergyPrompt occurs. The subsequent KO resolution promotes Unown, too late for Powerglass.
- Hook v1: native KO processing and both Active promotions finish first. The original EndTurnEffect then sees Unown in the Active Spot and opens a real AttachEnergyPrompt. The test attaches the Basic Psychic Energy from discard to Unown.
- In both arms, both players take one Prize, finish with five Prizes remaining, and promote Unown and Trubbish. The hook's callback completes once, the neighboring Store is unchanged, and the instance method is restored.

The Prize prompts precede both promotion prompts in both seats. Prize prompt order itself is not the disputed rule. The measured mismatch is specifically the order of the two Active promotion prompts.

## Interpretation and limits

**Confirmed native paper-fidelity defect:** the pinned Store's simultaneous Active KO promotion order depends on physical seat-array order instead of the next-turn player. This is a separate issue from E-21 ordering.

**Confirmed hook capability:** the instance-scoped E-21 hook correctly waits for both simultaneous KOs, Prize selections and promotions before resolving Powerglass. It preserves the native promotion-order defect in seat 0.

The fixture is one exact two-player Store transaction, not a complete match. It does not test simultaneous KOs with additional Bench KOs, Prize-win terminal conditions, KO-triggered effects, or other end-of-turn card effects. The result does not certify the hook for shared competitive policy. Keep it opt-in/default-off.

## Follow-up: bounded v2 adapter proof

The follow-up [v2 adapter report](agent37-simultaneous-ko-promotion-v2-adapter-20261107.md) and [manual CI run 42361397725](https://github.com/FlareZ123/experiment-01/actions/runs/42361397725) demonstrate a research-owned correction for the exact two-seat fixture. It waits for the original Prize prompts to finish, orders the native promotion prompt array with the next-turn player first, then restores the original player-array order and activePlayer before exposing the first promotion prompt. Prize prompt order and the subsequent turn transition are preserved. Negative controls for one KO, no KO, last-Prize terminal and last-Pokémon terminal cases pass.

The v2 hook remains opt-in and is deliberately narrow: exactly two active KnockOutEffects, no other KOs, two distinct single-Prize groups, sufficient Prizes, and a Bench Pokémon for each player. Future work should independently review the seat mapping, broaden the tested preconditions, and test simultaneous terminal outcomes, multiple Prize groups, and additional KO-triggered prompts. Do not edit the upstream submodule. Keep this correction separate from the already-tested E-21 ordering hook until its callback and state-restoration behavior is demonstrated.

**Competitive games qualified: 0. No deck or win-rate conclusion follows.**
