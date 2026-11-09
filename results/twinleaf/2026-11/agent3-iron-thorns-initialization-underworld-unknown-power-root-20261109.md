# Underworld Door versus Active Iron Thorns ex Initialization: three exact source aborts repaired

**Agent 3, 9 November 2026.** Paper Expanded development with pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, fixed rank1 Shadow Rider champion source 60. A shared two-actor policy was proposing `UseAbilityAction('Underworld Door')` on a Rule Box Shadow Rider Calyrex VMAX despite an opponent's Active **Iron Thorns ex** and its printed **Initialization**. The pinned engine properly strips the Ability from available powers and throws `UNKNOWN_POWER` when the policy tries to use it. The owner-visible selection policy had never checked the opponent's existing Active lock.

## Actual fault in the prospective original-field evidence

The preceding fresh 29-rank control/treatment runs retained native errors instead of scoring those as wins. Among them, these three distinct historical original source + full-deal seed IDs failed identically under both arms:

| Aichi original rank | Original deck | Registered physical deal | Earlier native action/turn at error |
| --- | --- | --- | --- |
| 6 | Iron Thorns | `6:6111:B:champion-reference` | `UseAbilityAction`, root77, global turn17 |
| 24 | Iron Thorns | `24:6145:B:champion-reference` | `UseAbilityAction`, root28, global turn5 |
| 29 | Iron Thorns | `29:6150:A:champion-reference` | `UseAbilityAction`, root69, global turn15 |

The full preserved original reference is [Agent3 initial 116-native original-field run 42552656722](https://github.com/FlareZ123/experiment-01/actions/runs/42552656722), its [immutable read-only failure-reduction job 42553979054](https://github.com/FlareZ123/experiment-01/actions/runs/42553979054), and the archived native original seed/seat registration `results/aichi-2026/registrations/agent3-portable-champion-all29-ab-20261109.json`.

## Corrected shared owner policy

`simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs` now checks the acting owner's public opponent Active name and printed available abilities. When the opposing Active is **Iron Thorns ex** with **Initialization**, the proposed Shadow Rider VMAX Underworld Door action abstains before attempting a native Store Ability that has been removed by the lock.

This is a conservative, owner-information-safe filter of known public board data. It does not read concealed cards, mutate game state or invoke native hidden powers. Other effects may turn off Initialization or protect a power (for example Stealthy Hood), so this version intentionally abstains rather than making an unverified positive claim about an exception.

A source-only no-lock state continues proposing Underworld Door normally, and a Benched Iron Thorns does not trigger the veto. These two regressions plus the positive lock veto are in `tests/agent3-underworld-iron-thorns-initialization-owner.test.cjs`.

## Exact historical native replay result

Native retrospective regression [42556917307](https://github.com/FlareZ123/experiment-01/actions/runs/42556917307) ran the same three frozen original seed/seat physical deals, fixed champion 60, and unchanged root policy except the new printed Active-lock veto, with portable tactical policy toggles both off and on. All six baseline historical games had previously aborted with `UNKNOWN_POWER`.

| Native result | Original six arms | Six arms with owner-visible lock veto |
| --- | ---: | ---: |
| `UNKNOWN_POWER` errors | **6** | **0** |
| Other engine errors | Unspecified in old terminal-aborted cases | **0** |
| Natural terminal native games | **0** | **6** |

Corrected native terminal records (two arms per opponent, each with same final winner within its pair):

- Rank6, candidate seat B, `199` accepted native roots, winner physical seat1, both arms naturally terminal.
- Rank24, candidate seat B, `48` roots, winner physical seat1, both arms naturally terminal.
- Rank29, candidate seat A, `195` roots, winner physical seat1, both arms naturally terminal.

The regression produced **zero** engine errors and no 260-root cap among the six games. Results are still native developmental game-state outcomes, **zero qualified paper Expanded games**.

## Reuse and limitations

The fix is already in the shared owner-policy helper, so future invocations consuming this version automatically refrain from this specific visibly illegal Ability action. No Twinleaf vendor file was edited. The first 116-arm field and the fresh independent corrected-Celestial field each retain their own original checkout head and older errors. **Do not rewrite those immutable reports** or retroactively inflate their terminal sample sizes. This targeted six-game replay repairs a recurrent failure mode and enables stronger complete field coverage.

Related independent fix: [Regidrago Celestial Roar paper-custody correction](agent3-regidrago-celestial-roar-physical-card-custody-paper-hook-20261109.md), 6/6 matched seed/seat physical conservation passes. Together these demonstrate that common game-engine fidelity and public-board decision realism materially improve field evaluability before changing deck construction.
