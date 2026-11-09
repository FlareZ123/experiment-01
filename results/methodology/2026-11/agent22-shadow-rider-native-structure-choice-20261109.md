# Two independent Shadow Rider fixed-60 candidate experiments

**Agent 22, 9 November 2026.** Two fresh prospective original-60 native panels against four Aichi Top32 source ranks. Each panel compared one unchanged structural candidate to the published rank-1 champion. All 64 genuine native Store attempts were retained. **These are developmental engine outcomes, with zero paper-qualified games.**

## Concrete deck-selection decision

**Keep the published champion as the current strongest reference. Do not promote Hood Shield v1. Continue developing Temple v1 specifically for its Regidrago interaction.** The Temple source-game execution path requires a demonstrated, actually paid Stadium play and opponent attack denial or counter-Stadium reply.

| Panel, 16 groups each | Champion native wins | Alternative native wins | Champion capped | Alternative capped | Exact source+starter matches | Alternative minus champion possible wins, all groups | Matched-only interval |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Hood Shield v1 | **11** | 7 | 2 | 5 | 15 | [-6, +1] | [-5, +1] |
| Temple Shadow Rider v1 | 9 | 9 | 6 | 3 | 15 | [-6, +3] | [-5, +3] |

The difference intervals conservatively allow every capped native game to be either a win or a loss. They are algebraic bounds for the tested games, with no confidence or paper win-rate interpretation.

| Original opposing rank | Hood panel champion | Hood | Temple panel champion | Temple |
| --- | ---: | ---: | ---: | ---: |
| 5 Mew Genesect | 3/4 | 1/4 | 2/4 | 2/4 |
| 6 Iron Thorns | 0/4 | 0/4 | 1/4 | 0/4 |
| 11 Mega Absol/Garbodor | 4/4 | 3/4 | 4/4 | 4/4 |
| 13 Regidrago | 4/4 | 3/4 | 2/4 | **3/4** |

The champion columns differ because the panels used independent random seeds. Rank11 results reveal potential weakness in the original-opponent bot, and zero wins versus rank6 in the Hood panel identify the active lock matchup as a problem for both lists.

## Executed tests and artifacts

- **Hood:** [preregistered 16 independent new seed/seat/source groups](../../aichi-2026/registrations/agent22-hood-shield-vs-champion-20261109.json), [native runner](../../../simulation/evaluation/2026-11/agent22-hood-vs-champion-native.cjs), [four passing tests](../../../tests/2026-11/agent22-hood-vs-champion-native.test.cjs), [passed CI run 42575300514](https://github.com/FlareZ123/experiment-01/actions/runs/42575300514), [raw native artifact 13655221360](https://github.com/FlareZ123/experiment-01/actions/runs/42575300514/artifacts/13655221360). Uploaded ZIP SHA-256: 6784204745cac53830b8f8d5f010ba962af253c0891cc4e7170d991bcf86d806.
- **Temple:** [separate prospective 16 independent groups](../../aichi-2026/registrations/agent22-temple-vs-champion-20261109.json), [native runner](../../../simulation/evaluation/2026-11/agent22-temple-vs-champion-native.cjs), [four passing tests](../../../tests/2026-11/agent22-temple-vs-champion-native.test.cjs), [passed CI run 42575998883](https://github.com/FlareZ123/experiment-01/actions/runs/42575998883), [raw artifact 13655048229](https://github.com/FlareZ123/experiment-01/actions/runs/42575998883/artifacts/13655048229). Uploaded ZIP SHA-256: 23ada4be3a160032972520f1f343bb0bd1b522f5b8ba6ce47f76651751430d0e.

Both runs used pinned Twinleaf revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, frozen Agent41 bilateral actor policy, Agent19 common actor options and composed Celestial Roar/Mew Energy Mix/Energy-target paper profile, both real native seat orientations, fresh 16 group seeds, full original source ranks 5,6,11,13, a 260 accepted-action cap, and every raw result including failures. The competing 60s were unchanged and candidate/original used the same actor policy. Matching seeds alone were not treated as paired evidence: one group in each panel lacked an exact original physical opening plus first-player match.

**Critical missing capability:** the common actor policy in these runs did not enable Agent4's physically held Hood targeting or protected Underworld Door exception. Thus Hood's inventory failure is not proof that its proposed protective tactical line is valueless. The [Agent4 specialized original-rank6 trial](agent4-hood-owner-rank6-fresh32-no-protected-line-20261109.md) already found zero protected Ability activations; independent source-dealt tool preparation work is ongoing. Temple's 2 Stadium copies can turn Double Dragon Energy into one Colorless, but the present native outcome ledger does not by itself certify this line was actually chosen under source play.

## Next decisive test

Use a **new prospective source-dealt Regidrago group** with the exact Temple 60 and a source-owner-visible policy intervention that plays a physically held Temple when an opposing Active Regidrago has Double Dragon Energy. Log the accepted native Stadium payment, resulting Energy map, opponent's next attempted attack, whether a genuine Marshadow/Stadium removal answers it, and final game status. Keep original physical openings paired across treatment and control. This tests whether the observed rank13 advantage is real rather than whether two Stadium cards exist in the list.

**Field qualification:** Only 4 of 32 opposing ranks were included here; original ranks 23/25/28 remain inaccessible. Strong opponent competence, full paper Japanese legality, official clock and complete game adjudication remain unverified. No 99.5% claim is supported.