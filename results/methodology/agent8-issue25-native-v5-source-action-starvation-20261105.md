# Agent 8: source-policy action starvation inside the selected v5 original eight

**5 November 2026 | Evidence class: exact reanalysis of published, complete native accepted-root ledgers.** This is a retrospective diagnosis of policy liveness under a 48-action cap. It is **not** a game win, a measured matchup rate or a paper-legal attack certificate.

## Source custody and denominator

Source: steward-selected Issue25 v5 native archive from [manual run 42059191496](https://github.com/FlareZ123/experiment-01/actions/runs/42059191496), provider artifact 13432225055. Actual inspected JSON **issue25-steward-v5.json** has exactly 147,651 bytes, SHA256 **22eacafb175bcc1ee365eeea3189c703c256f5555a8118dd68c988edda44cc17**. Native Twinleaf pinned revision is **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. All eight original rank6/rank11 registrations are preserved, including one engine abort and seven 48-root caps.

Each row's public action count equals its full accepted root-ledger length; the archive says no root truncation, original source-identity registrations exactly match, and every ledger digest checks. The source actor is the opposite physical seat from the precommitted candidate A/B registration: source seat1 for candidate A, source seat0 for candidate B. Seven rows have that seat recorded directly. The aborted New Moon rank11 seed102 row lacks direct seat fields, so its source seat1 is explicitly inferred **from registration**, while its four accepted source-side roots consist solely of setup prompts. Never silently treat the absent direct seat field as an observed physical assertion.

The method counts **only accepted public root actions where playerSlot equals the registered original-source seat**. A bot-decoder exception at ordinal14 without accepted action is excluded. It does not infer internal simulator suggestions, legal options, card identities in concealed zones, or paper-legitimate attacks from action names. This exact reusable sanity checker is [agent8-issue25-source-action-census.cjs](../../simulation/evaluation/agent8-issue25-source-action-census.cjs); its [unit regressions](../../tests/agent8-issue25-source-action-census.test.cjs) include malformed/archive-inconsistent negative controls.

## Failure-inclusive actual source-root distribution

| Registered arm (rank:seed:slot:contender) | Status | All accepted native roots | Source prompt answers | Source passes | Source card plays | Source AttackAction |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 6:100:A:champion-reference | 48-root cap | 48 | 16 | 5 | 1 | 0 |
| 6:100:A:new-moon-lockbreaker-v1 | 48-root cap | 48 | 18 | 4 | 2 | 0 |
| 6:101:B:champion-reference | 48-root cap | 48 | 17 | 5 | 0 | 0 |
| 6:101:B:new-moon-lockbreaker-v1 | 48-root cap | 48 | 17 | 4 | 0 | 0 |
| 11:102:A:champion-reference | 48-root cap | 48 | 14 | 5 | 1 | 0 |
| 11:102:A:new-moon-lockbreaker-v1 | **decoder error at root14** | 14 | 4 | 0 | 0 | 0 |
| 11:103:B:champion-reference | 48-root cap | 48 | 15 | 6 | 2 | 0 |
| 11:103:B:new-moon-lockbreaker-v1 | 48-root cap | 48 | 14 | 4 | 1 | 0 |
| **Entire eight-arm ledger** | **7 caps, 1 error** | **350** | **115** | **33** | **7** | **0** |

**There are 155 accepted original-source root actions**. Of these, 115 are prompt resolution, 33 are PassTurnAction, seven are PlayCardAction, and **zero are AttackAction**. The other 195 accepted roots belong to candidate-side play/setup. This is a root-action composition, not 155 independent decision opportunities.

### The seven actual original-source plays

| Source deck, registered arm | Native global turn | Public accepted action/card |
| --- | ---: | --- |
| Rank6, 100:A champion | 1 | Root13: Speed Lightning Energy |
| Rank6, 100:A New Moon | 1 | Root13: Speed Lightning Energy |
| Rank6, 100:A New Moon | 9 | Root45: Capture Energy |
| Rank11, 102:A champion | 8 | Root36: Squawkabilly ex |
| Rank11, 103:B champion | 2 | Root10: Darkness Energy |
| Rank11, 103:B champion | 10 | Root39: Crobat V |
| Rank11, 103:B New Moon | 2 | Root16: Darkness Energy |

**Diagnostic interpretation:** The shared source decision policy is frequently spending full turns passing after little board development, while action budget is consumed by setup and mandatory prompts. The source's action scarcity persists under both source seats, both candidate variants and both original ranks in this small historical sample. It is a credible immediate obstacle to qualifying a *source-owned paid attack followed by a meaningful candidate reply*. It does **not** establish the cause of any individual Pass: possible missing payment, control lock, native legality blocker, weak action enumeration or bad decision priorities each needs separate actor-visible root inspection.

The current root48 cap includes many setup/answer actions, so it may end before meaningful turn development even when the native engine stays live. Raising that cap alone risks collecting longer low-quality matches without improving source behavior. A necessary next test is to instrument **one precommitted real original-source non-prompt decision** with legal/priced options, current hand/public board, tactical attack availability, and accepted Store/attack resolution; if all legal attacking choices are absent, distinguish engine/card bottleneck from bot decision preference. Compare the same original printed 60 and source starting seat under controlled policy A/B, preserve every attempted seed/deal and report the genuine opposing response. This is a recommended **developmental diagnostic**, not an asserted source-play repair.

The [Critic release guidance](../../communications/broadcast/2026-11/20261105T160359Z_critic_v4_v5_release_gate_and_index_reconciliation.md) still applies: demonstrated source payoff and opponent reply are required; source paper payment, official event clock, all 32 authentic opponent lists, source-independent owner-safe policy and qualified games are unresolved. Current field status remains **29/32 original name/count lists**, zero admitted competitive games and no selected winning fixed 60.
