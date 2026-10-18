# Agent 45: frozen rank-4 Extra Energy Bomb policy exposure experiment

## Predeclared question (18 October 2026 UTC)

Does the opt-in immediate-Prize-response `ElectrodeSourcePrizeTrade-v1` policy alter a genuinely dealt published Aichi rank-4 Alolan Raichu/Electrode-GX opponent game, now that the printed Extra Energy Bomb and Electro Rain corrections are enabled?

Both experiment arms must use the same frozen revision, the same candidate 60s, the same published rank-4 opponent 60, the same three/four candidate schedule as encoded in the checked-in campaign, the same v3 seed schedule and both physical candidate seats. Only `electrodeGXPrizeTradePolicy` may differ. The **control also enables both paper-rule corrections**, so their effect is not attributed to policy.

- Fixed experiment branch: `agent45-raichu-prize-trade-20261018`, created at commit `8ef91873c937834a0fec8ca7de88c40eea178466`.
- Workflow: manual `.github/workflows/aichi-first-game.yml`, `pilot_ranks=4`, `seat_seed_protocol=decorrelated-slots-v3`, `expanded_action_policy=false`.
- Shared corrections: `electrode_gx_energy_correction=true`, `electro_rain_damage_correction=true`.
- Control: `electrode_gx_prize_trade_policy=false`.
- Alternate: `electrode_gx_prize_trade_policy=true`.
- Both workflows must finish; compare per-trial original seed, card-list hashes, recorded first player, action trace and disposition, observed Extra Energy Bomb attempts, earliest policy divergence, and actual outcome.
- Treat zero use/opportunity and incomplete games as informative **negative/no-exposure results**; do not discard or replace their denominator.
- A divergence at a possible activation is *not* evidence of increased win probability until legal resource availability, correct target selection, rule mechanics, and opponent decision quality are separately checked.

### Predicted failure modes and falsification

1. No source-dealt run reaches a board eligible for the narrow heuristic. Record zero exposure and stop short of judging policy strength.
2. The tactic declares Bomb but the mandatory selection hook attaches Energy to a different eligible recipient, violating the tactic's assumption that projected Lightning powers Active Alolan Raichu. This requires a target-allocation audit, not a victory claim.
3. Bot's `SimpleTactic` policy evaluates speculative states with live Card aliases. Opponent and candidate `Simulator` isolation is unqualified, so do not present terminal outcomes as paper-competitive results even if traces complete.

Baseline source: [prior same-revision corrected-vs-uncorrected rank-4 pair](../twinleaf/agent45-electrode-gx-empty-selection-chain.md) observed 0 Bomb actions in six source-dealt traces; the policy remained stock in both arms. Rule constraints are supported by the [official Japanese Extra Energy Bomb FAQ](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%9E%E3%83%AB%E3%83%9E%E3%82%A4%E3%83%B3GX&regulation_faq_main_item1=all).

## Observations: paired compiled engine runs passed (18 October 03:50 UTC)

Both arms ran from exact research revision `4138ad3965a3b3f15f200a6c739f9aba819b08da`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, plan digest `21fd5c47f6168f127f2e3dcad4b9d42bd79ed0c4b3801b261b5d8d667ef10cbf`, and max 600 actions per game. Workflow [control 39094858235](https://github.com/FlareZ123/experiment-01/actions/runs/39094858235) (artifact `12123863878`) and [alternate 39094861015](https://github.com/FlareZ123/experiment-01/actions/runs/39094861015) (artifact `12124437238`) each passed all preflight, compilation, diagnostic and postprocessing steps.

**Primary observation:** both runs returned `completed-engine-game:8`, with eight matching trial identities. All eight pairs had exactly equal `traceSummary` objects, including every chronological meaningful action entry, SHA-256 trace fingerprint, attack counts, final state, Prizes and terminal transition; `actions`, `turns`, `winnerIndex`, starting player, deck digests, rule flags, and seeds matched as well. The only per-record differences were the deliberately changed `policy` string and `observedPolicyFlags.electrodeGXPrizeTradePolicy`.

| Candidate and seat | Seed | Actual candidate turn | Actions | Engine turns | Terminal Prizes A/B | Chronological trace SHA-256 prefix |
| --- | ---: | --- | ---: | ---: | --- | --- |
| Champion reference A | 2596731003 | First | 143 | 11 | 0/6 | `ed86bef3ba22a424` |
| Champion reference B | 2791877160 | Second | 157 | 18 | 6/0 | `92c119214e5f6520` |
| Hood Shield A | 2596731003 | First | 134 | 17 | 0/6 | `64efeb558d492430` |
| Hood Shield B | 2791877160 | Second | 205 | 30 | 6/0 | `c0065bf638c50bb6` |
| Temple A | 2596731003 | First | 180 | 19 | 0/6 | `b78edf4281f8ed37` |
| Temple B | 2791877160 | Second | 112 | 12 | 6/0 | `e5006412d15fec5c` |
| New Moon A | 2596731003 | First | 385 | 71 | 4/3 | `20a3dfe20385465c` |
| New Moon B | 2791877160 | Second | 390 | 62 | 1/0 | `8c501a6e3b98a4b0` |

All eight source-opponent traces in **both arms** contain **zero `UseAbilityAction('Extra Energy Bomb')`**. Across the eight *control* opponent traces, `PlayCardAction('Alolan Raichu')` occurs four times; `PlayCardAction('Electrode-GX')` occurs six times in five trials. They overlap only in Temple A and New Moon A. Two Electro Rain attacks occur in trials without an Electrode-GX played, and two of eight trials have zero opponent attacks. The raw action trace does not capture all full-board policy-decision states, so mere nonuse cannot distinguish insufficient discard Energy, wrong Active positioning, a lock, an opponent win before the tactic could act, or an inadequate heuristic trigger.

**Interpretation:** this is a precisely paired *non-exposure diagnostic*, not a test proving the Prize-trade tactic weak or strong. Even the unchanged engine winner outcomes are not qualified as competitive wins: speculative-State cloning and source-opponent decision quality remain unverified.

### Reproduction and preflight history

The full `aichi-campaign-diagnostic.json` files in the named workflow artifacts contain all 16 game records. Compare records by `trialId`, verify matching `researchRevision`, `planDigest`, `candidateDigest`, `opponentDigest`, seed and actual starting turn, then compare the full `traceSummary` objects. The changed policy must be echoed exactly and all other policy flags held equal. Archive `aichi-quality-screen.json` distinguishes raw engine termination from tactical/policy qualification.

Two earlier dispatch pairs at [39094549012](https://github.com/FlareZ123/experiment-01/actions/runs/39094549012), [39094551630](https://github.com/FlareZ123/experiment-01/actions/runs/39094551630), [39094785744](https://github.com/FlareZ123/experiment-01/actions/runs/39094785744), and [39094788235](https://github.com/FlareZ123/experiment-01/actions/runs/39094788235) failed in **preflight** because three existing campaign test files still hard-coded the legacy three-candidate schedule. Agent 45 corrected those tests to derive expectations from the actual candidate rows and repeat count. No game records from those failed runs were counted.

**Next discriminating experiment:** detect source-dealt turns with Active Alolan Raichu, a Benched Electrode-GX, available discard Special Energy, a non-GX/EX attachment target and a plausible immediate opponent KO, logging a no-opportunity denominator. In games where the ready board actually exists, compare both Prize-trade policy arms again under a source-locked, paper-faithful multi-target attack and validated opponent decisions. A constructed board can additionally test the greedy attachment resolver's target selection when a second eligible Pokémon competes with Active Raichu. Retain all non-triggering games in the denominator.

