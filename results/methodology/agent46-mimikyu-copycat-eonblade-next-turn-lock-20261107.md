# Agent 46: Mimikyu Copycat inherits Eon Blade's next-turn attack lock

**7 November 2026 | Agent 46 | Manual workflow 42357724295**

## Question

Does Mimikyu GRI's printed Copycat preserve the donor attack's delayed restriction when the preceding opponent attack is Latias ex SSP's non-GX Eon Blade? Is the physical Mimikyu that copied the attack prevented from attacking on its next own turn? Do the existing Apex compatibility and declared-history hooks change this ordinary Eon Blade case?

Agent 3's current Copycat postgame audit had no observed Eon Blade Copycat event, so a native Store observer was needed. The existing [Agent37 Eon Blade regression](../../simulation/twinleaf/agent37-eonblade-next-turn-hook-regression.cjs) proves the direct Latias ex restriction, but does not test a copied attack.

## Native fixture and sequence

The test is [agent46-mimikyu-copycat-eonblade-lock-native.cjs](../../simulation/twinleaf/agent46-mimikyu-copycat-eonblade-lock-native.cjs). It uses the pinned compiled Twinleaf Store at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

For each physical seat:

1. Stage Latias ex SSP Active with three Psychic Energy and Mimikyu GRI on the Bench with two Psychic Energy.
2. Stage Mega Absol ex M1L Active on the Mimikyu player's side. It has 280 HP and two Psychic Energy, so it survives the donor's 200 damage and can retreat.
3. Dispatch the opponent's real native `AttackAction('Eon Blade')`. The Store settles 200 damage on Mega Absol and records Eon Blade as the opponent's preceding attack.
4. Dispatch the native `RetreatAction` to promote the same physical Mimikyu object, retaining its two attached Psychic Energy.
5. Dispatch the real `AttackAction('Copycat')`. The copied Eon Blade resolves for 200 damage against Latias ex.
6. Pass the opponent's turn with native `PassTurnAction`, then attempt Copycat again with the same physical Mimikyu.

Only native `WaitPrompt` animation prompts are resolved. Any unexpected discretionary prompt fails the fixture.

## Result

<badge color="success">Passed</badge> Both physical seat orientations passed with no unresolved prompts.

| Observation | Native result |
|---|---:|
| Donor's preceding attack | Eon Blade, non-GX |
| Donor damage | 200 |
| Mimikyu's own attached Energy | 2 Psychic |
| Mimikyu printed Copycat cost | Psychic + Colorless |
| Donor Eon Blade cost | Psychic + Psychic + Colorless |
| Copied payload damage | 200 |
| Declared last attack record | Copycat, source Mimikyu GRI |
| Mimikyu lock immediately after Copycat | Active |
| Lock after opponent passes | Still active |
| Repeated next-turn Copycat | Rejected: `BLOCKED_BY_EFFECT` |

The donor's three-Energy Eon Blade cost is not imposed on Mimikyu. Mimikyu pays its own two-Energy Copycat cost. The copied payload is Eon Blade, while the declared last-attack record remains Copycat by Mimikyu.

The lock was checked against the exact Mimikyu object after it moved from Bench to Active. The result is stronger than checking only an Active-card name: the physical identity remained unchanged through retreat, Copycat, the opponent's pass, and the rejected next-turn attack.

## Hook-scope A/B

The same staged native sequence was run in both seats under five conditions:

- no research hooks;
- declared-history hook only, with the Mimikyu target enabled;
- Mimikyu non-GX Apex compatibility hook only;
- both Mimikyu hooks enabled;
- the complete four-hook set required by the production headless policy: Mimikyu compatibility, Mimikyu declared history, Regidrago declared history, and pass-clears-last-attack.

All ten runs produced identical damage, declared history, active-card identity, lock state, and next-turn rejection. The full four-hook case additionally confirmed that the opponent's stale Eon Blade history is cleared after its subsequent PassTurnAction while Mimikyu's attack lock remains active.

This is consistent with the hooks' source-level scope:

- [copycat-compat.cjs](../../simulation/twinleaf/copycat-compat.cjs) only temporarily clears the internal copy flag for a Mimikyu Copycat whose preceding source is Regidrago VSTAR and whose declared attack is Apex Dragon. It does not match Latias ex or Eon Blade.
- [copycat-declared-history-hook.cjs](../../simulation/twinleaf/copycat-declared-history-hook.cjs) acts when a `ResolvePromptAction` resolves a pending `ChooseAttackPrompt` for the printed Mimikyu Copycat or Regidrago Apex declaration. This ordinary Eon Blade copy produced only `WaitPrompt` animations and no `ChooseAttackPrompt`, so the history hook had no dispatch to repair.
- The pinned delegation boundary in [copy-attack-delegation.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/copy-attack-delegation.ts) runs the donor's `reduceEffect` with `this` bound to the copycat Pokémon and sets the attack effect source to the copycat player's Active slot. The native result confirms Latias ex's Eon Blade restriction lands on Mimikyu.

The compatibility hook is Apex-specific. The history hook is broader than Apex, because it can repair any matching declared Copycat that opens a nested attack-choice prompt. This Eon Blade case does not open one. The complete headless four-hook set also includes the pass-clears-last-attack correction: it leaves the immediately preceding Eon Blade available after the opponent's attack ends the turn, then clears the opponent's stale record when that opponent later passes. That history cleanup does not remove the Mimikyu lock.

## CI and provenance

- Workflow: [Agent46 native copied-attack effect isolation](../../.github/workflows/agent46-copy-delegation.yml), manual dispatch only.
- Initial 8-case run: [42357724295](https://github.com/FlareZ123/experiment-01/actions/runs/42357724295), success.
- Final 10-case full-headless-hook run: [42359221578](https://github.com/FlareZ123/experiment-01/actions/runs/42359221578), success.
- Final tested repository commit: `e556c53a35fb956033cb1a86018f8c5e5caa6614`.
- Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Node.js: `20.19.0`.
- The new regression is the final native step in the existing workflow. No new workflow was created and no vendored Twinleaf source was changed.

The first test attempt failed at an incorrect expectation that the last-attack record would retain the donor payload name. The actual native record was `Copycat`, source Mimikyu. The assertion was corrected to distinguish the declared attack from its copied payload. The subsequent complete workflows passed. The final run includes all ten hook-comparison cases, including the full four-hook headless configuration.

## Limitations and interpretation

This is a staged native rules witness, not a naturally shuffled game:

- Mega Absol, Mimikyu, Latias ex, and their Energy were staged in known zones.
- Mega Absol's survival and retreat create a legal native route to make Mimikyu Active after Eon Blade. The complete deck access and timing needed to reach this board were not modeled.
- No Aichi original 60 was played, no opponent policy was used, and no competitive game qualifies.
- The test does not estimate how often a real match presents Eon Blade as the preceding attack or whether Copycat is strategically desirable.

**Conclusion:** The pinned Twinleaf implementation correctly carries Eon Blade's next-turn attack lock through Mimikyu's native Copycat delegation in both seats. The two existing Apex-focused research hooks leave this ordinary Eon Blade sequence unchanged. This validates one copied delayed-effect interaction only; it does not establish a matchup result or competitive win rate.
