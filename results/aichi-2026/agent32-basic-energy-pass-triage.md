# Agent 32: first-turn and Bench attack-cost triage

**16 October 2026.** Evidence: source-locked diagnostic actions, with unqualified simple-bot policies. No competitive win-rate claim.

The [six-game CI run 38842936054](https://github.com/FlareZ123/experiment-01/actions/runs/38842936054) passed, with Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, research commit `9d4acb1b9172364a1c9dd747c3850c3998e10803`, and `independent-slots-v2` seeds. Its archive artifact ID is `12022625370`, SHA-256 `fb0e64400f7b075631810d3be2b8889462f946d036f63585d7e23209d8ab9b29`.

| Candidate / engine slot | Attacks | Passes | Active cost covered | Bench cost covered |
| --- | ---: | ---: | ---: | ---: |
| Champion / A | 0 | 21 | 1 | 2 |
| Champion / B | 4 | 22 | 0 | 19 |
| Hood / A | 1 | 24 | 1 | 0 |
| Hood / B | 0 | 21 | 0 | 17 |
| Temple / A | 4 | 16 | 1 | 15 |
| Temple / B | 5 | 18 | 0 | 0 |
| **Total** | **14** | **122** | **3** | **53** |

All three Active-covered passes were on global turn one, when the first player could not attack. The Active Pokémon was Shadow Rider Calyrex V holding one Psychic Energy, sufficient for Shadow Mist's printed cost. These three are expected first-turn passes.

For the two zero-attack games, Champion / A had a Benched Shadow Rider V covering Shadow Mist on turns 5 and 7, with Dialga-GX Active. Hood / B had a Benched Shadow Rider V covering Shadow Mist on turns 2, 4, 6, followed by Mimikyu covering Filch on turns 8 through 34 at two-turn intervals. These snapshots say nothing about availability of legal switching actions.

Other cases include Tapu Lele-GX's Tapu Cure-GX and Energy Drive. A GX attack may already be spent, and utility attacks can be unhelpful. The 53 Bench observations include repeated states and cannot be treated as 53 independent opportunities.

The [public Basic-Energy checker](../../simulation/twinleaf/printed-basic-energy-audit.cjs) ignores Special Energy, cost changes, locks, attack text, status, GX history and movement feasibility. [Pass reporter](../../scripts/aichi-basic-covered-passes.cjs) and [Bench reporter](../../scripts/aichi-benched-basic-pass-triage.cjs) retain action ordinals for later replay. The Bench reporter tests passed [manual CI 38843893054](https://github.com/FlareZ123/experiment-01/actions/runs/38843893054).

**Next evidence gate:** reproduce one flagged state in the pinned engine, establish a legal and desirable attack plus feasible Active promotion, then compare the bot's choice. The existing six generic-bot outcomes cannot rank candidates, and the 99.5% target remains unmeasured.
