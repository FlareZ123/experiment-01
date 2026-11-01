# Agent 32: 33 original rank-11 Terminal Period attacks had a printed-payable nominal KO alternative

**1 November 2026 | read-only analysis of Agent41's already completed frozen v2 original-source archive; no fresh games and no competitive-qualified result.**

## Why this closes an old evidence gap

[Agent1's 21 October native known-dead attack toggle audit](agent1-known-dead-attack-frozen-null-20261021.md) observed repeated dead `Terminal Period` attacks, but **could not know whether `Claw of Darkness` was payable during those earlier turns**. At the very end of its separately selected games, Mega Absol had only two Darkness on Active, so an attack preference override could not switch to a three-Energy Claw. The warning against extrapolating a final snapshot was correct.

The new [Agent41 frozen original-v2 32-arm archive](agent41-frozen-bilateral-v2-32-original-source-energy-20261101.md), run [41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584) / complete ZIP artifact [13072623187](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584/artifacts/13072623187), includes **full per-attack public boards**, their printed attacks, the real native accepted `AttackAction` root ledger, and actual Energy on the *Active attacker*. Archived ZIP SHA256 `cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b`. The archived original rank-11 physical seed-2 side-B source-deal fingerprint is `7749a2461e06f6c6d4bfe7cdf0a34ef75806b0575f68b6bf345e2bbdf33915ba` in both candidate arms. Source seat is 0 and original rank11 actually starts **second**.

The authentic `Mega Absol ex` printed attacks in those Store boards are `Terminal Period` (cost Darkness + Colorless, conditional exact **six damage counters** on defender) and `Claw of Darkness` (cost Darkness + Darkness + Colorless, **200 base damage**). Source Active held exclusively Basic Darkness Energy. Target Pokémon were **Tapu Lele-GX** in the unchanged champion-reference 60 and **Unown** in the New Moon Lockbreaker v1 60. The supplied card ZIP confirms the relevant `Tapu Lele-GX GRI60` has **170 HP** and `Unown AOR30` has **60 HP**. The target's existing damage was zero throughout all 39 selected native `Terminal Period` attacks.

## Reproduced exact two-source-game result

| Frozen original-source game | Actual `Terminal Period` attacks | Same public board afterward | Active Mega Absol with at least 3 Darkness; target not at 60 damage | Nominal 200-damage KO before modifiers |
| --- | ---: | ---: | ---: | ---: |
| `11:2:B:champion-reference` | 12 | 12 | **9** | **9**, versus 170-HP Tapu Lele-GX |
| `11:2:B:new-moon-lockbreaker-v1` | 27 | 27 | **24** | **24**, versus 60-HP Unown |
| **Total, two correlated games** | **39** | **39** | **33** | **33** |

In the remaining **six** attacks (three per game), source Mega Absol had exactly **two** Basic Darkness attached; the Claw alternative was **unpayable** by ordinary printed cost. The other 33 had **three, four, or five** attached Basic Darkness and a payable nominal alternative. All 39 `Terminal Period` actions were accepted in the genuine native `Store` and their terminal public boards were equal to their initiating public boards. All had `settledPromptChain=true`, no cross-epoch settlement and matching actor-seat/turn/action-ordinal root receipts. This confirms **observed no-progress selected attacks** and a **cost-payable printed alternative**. It still does **not prove** that an actual alternate native `AttackAction` would settle for 200 against every original continuous board, since damage prevention/reduction, status and other card effects are not independently ruled out by this public-board excerpt.

The champion-reference game ended with a candidate-seat native engine win, final Prizes **[6, 0]**, after 179 accepted roots. New Moon's game capped at 260 accepted roots with remaining Prizes **[6, 3]**. Neither result is competitively qualified, and a hypothetical turn-nine or later `Claw` KO must **not** be asserted to reverse a completed game without an actual paired Store fork and subsequent native opponent reply.

The 33 opportunities **are repeated decisions along just two correlated trajectories**. Both physical games share the *same original rank11 source setup fingerprint* but face distinct candidate decks and then diverge. The observations therefore do not supply a Bernoulli sample of 33 wins or a candidate-vs-candidate comparison.

## Exact executable reproduction

[Read-only Python ZIP auditor](../../scripts/agent32_original_terminal_payability.py) consumes the original run's zipped `agent41-frozen-bilateral-development-v2-native.json`, refuses any archive without exactly 32 distinct attempts, verifies original-source turn/seat/attack-ordinal/native Store root receipts and all relevant printed attack costs, counts attached Basic Darkness specifically **on Mega Absol Active**, and cross-tabulates true native public before/after identity and target HP from the bundled card pool. It never reads the opponent's concealed hand, does not mutate any game state and keeps all action caps. The raw 33 accepted root ordinals per two original games are emitted for future Store forks.

[Seven independent synthetic tests](../../tests/test_agent32_original_terminal_payability.py) exercise payable and two-Energy negative cases, defender exactly 60 damage, unknown target print, corrupt native root, incomplete/duplicated attempts and mismatched printed attack text. **7/7 local Python unit tests passed on 1 November 2026**. Running the auditor against the actual 32-arm ZIP reproduced every number in the table. The [shared manual GitHub Actions run 41332569686](https://github.com/FlareZ123/experiment-01/actions/runs/41332569686), tested head `18ed2ed6520407356a4cb1271f5068d46cb9abae`, subsequently finished **SUCCESS** and explicitly passed the `Regress archived original rank11 Terminal Period printed-payability receipt audit` test step. This CI ran the synthetic tests, **not** the 32MB original archive's native Store replay.

## Policy implications and next native gate

A fully **default-off** `knownDeadAttackRoot` path for `Mega Absol ex M1L` already exists in [the shared actor helper](../../simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs). Its first-attack alternative checks the exact public defender damage and whether `Claw of Darkness` is among **already payable** attacks. A staged [native opponent-HP fixture](../../simulation/twinleaf/agent7-known-dead-attack-native.cjs) independently proved Claw's effect on one injected low-HP board; it is no replacement for the authentic original source states here.

The immediate high-value test is to fork **one original turn with 3+ Active Darkness from each of these two originally shared source-deal arms**, keeping source/candidate exact 60s, actual physical native root state, opposing current damage/effects and the same start/deal. Compare `Terminal Period` control against a legitimate source-owner `Claw of Darkness` selection, with real paper-prompt checks, settled damage/Prize cards, the next opponent response and no hypothetical invented state. A single actual accepted native damage/KO counterfactual could strongly change the developmental policy interpretation. Then test this selector in the **one shared two-seat actor**, with existing profile changes versioned and the old v2 archive untouched.

**Status remains:** 29 of 32 original source 60s authenticated, missing ranks23/25/28; **0 qualified competitive games**, no evidence of a fixed 60 with a **99.5%** field-win rate.
