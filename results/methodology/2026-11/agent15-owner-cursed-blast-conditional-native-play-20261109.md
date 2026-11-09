# Agent 15: owner-visible Cursed Blast Prize conversion and first native game integration

**9 November 2026. Development-only implementation; no certified competitive win-rate result.**

## The player decision now implemented

When the native acting owner would otherwise Pass, the opt-in policy checks that owner's **face-up Bench** for Dusclops SFA, Dusclops PRE, or Dusknoir PRE with `Cursed Blast`. It evaluates actual public opposing Active/Bench HP and existing damage, plus a deliberately small exact-printing Prize-award map. It proposes a self-KO only when its printed 50 or 130 damage counters would immediately Knock Out a target and the target's Prize award is positive after the opponent receives one Prize for the donor. An immediate last-Prize KO is the sole exception to rejecting a zero-net exchange. If the opponent has one Prize remaining, the policy abstains to avoid self-KO game loss. Unknown printings and nonlethal targets abstain.

The hook is intentionally **symmetric across the two physical seats**, inspects only real owner/public observations, and leaves any already chosen non-Pass native action unchanged. It constructs a genuine `UseAbilityAction` and answers the owner's real `ChoosePokemonPrompt` with the exact face-up target. Store dispatch and prompt validation remain authoritative. The implementation records accepted roots and replies; all other prompt and opponent actions retain the underlying policy. The hook is OFF in the canonical development policy and makes no assertion about stronger or weaker match win rates.

## Executable evidence

- Pure proposal: `simulation/twinleaf/agent15/owner-cursed-blast-prize-policy.cjs`; ten conditional and hidden-information tests at `tests/2026-11/agent15-owner-cursed-blast-prize-policy.test.cjs`.
- Real native Store action/target/Prize settlement bridge: `simulation/twinleaf/agent15/owner-cursed-blast-native-probe.cjs`; both physical-seat cases at `tests/2026-11/agent15-owner-cursed-blast-native-probe.test.cjs`. The original rank31 physical list has three Dusclops PRE; the fixture stages an evolved donor and **200 damage on a 210-HP Shadow Rider Calyrex V**, then Store accepts five counters, donor self-KO, two Prizes to source, one to opponent, and replacement Active promotion. Neither complete deck is physically shuffled or dealt in this test.
- Real-game hook: `simulation/twinleaf/agent15/owner-cursed-blast-after-pass.cjs`; four action-interception/priority/prototype-restoration regressions at `tests/2026-11/agent15-owner-cursed-blast-after-pass.test.cjs`.
- [CI run 42549648902](https://github.com/FlareZ123/experiment-01/actions/runs/42549648902) confirmed both native Store cases and the ten pure proposal cases. Its global result was failure from a separate Agent34 invalid owner-seat assertion's diagnostic precedence, fixed in commit `99b7daf`. [Native eight-game runner 42551349585](https://github.com/FlareZ123/experiment-01/actions/runs/42551349585) separately confirmed all sixteen new pure/mock/native tests passed; its original-physical paired stage returned a fail-closed status. The follow-up run adds concise per-trial reason logging and is not yet included in this report.

## Newly preregistered real-game test

`results/aichi-2026/registrations/agent15-first-actual-cursed-blast-four-group-20261109.json` freezes four **new** random physical seeds before any native run, covering original source ranks 11 and 31 in both candidate-seat orientations. `simulation/evaluation/agent15/fresh-original-cursed-blast-native-pair.cjs` compares eight native control/treatment attempts with identical source/candidate 60s and other native policies. It records matched deal fingerprints, every censored/aborted attempt, native terminal status and accepted Cursed Blast roots. The runner retains the same self-critical competitive qualification limit as other development studies.

## Unresolved competitive significance

A Stage-1 donor can exist in a real game while no profitable target or owner Pass presents itself. The native outcome of an early evolution can also disrupt the owner's later attacks. The policy currently excludes **Cursed Blast to enable Ace Trainer** when the Ability does not immediately secure a profitable Prize exchange; the deck has two Ace Trainers and a prior staged native proof establishes that distinct tactical line. Adding that multi-axis follow-through needs same-turn owner Supporter use, genuine availability, and a fair paired comparison rather than an inferred benefit. Neither test converts the current 29/32 published Aichi field into a 32/32 benchmark, and **zero qualified competitive games** are asserted.
