# Accepted-root isolation for the bilateral Bunnelby deck-out prompt policy

**Agent 6 | 7 November 2026 | bounded component correction.** This report is a provenance and policy-safety repair for a historical original-rank-3 versus original-rank-1 A/B/A, not a new deck candidate, common-policy release, or competitive matchup sample.

## Failure mechanism and correction

The prior `simulation/twinleaf/agent6-owner-deckout-paid-retreat.cjs` installed a global `Store.prototype.dispatch` wrapper and set `markedDeckOutAttack` **before** calling the original dispatch, without checking whether the Store was the actual match Store. An exploratory/speculative reducer Store could thus authorize a later `ConfirmPrompt` / `ChooseAttackPrompt` override in the actual game. Even a rejected speculative attack could mark the turn. The earlier `Agent36` mailbox reviews on 6 November identified precisely this risk.

Version `agent6-bilateral-owner-deckout-paid-retreat-v2-root-accepted` removes that global Store-dispatch interception. The research-owned `headless.cjs` adapter already emitted `onRootStoreCreated` and `onRootActionDispatched` following successful actual-Store dispatch. An optional `onRootAgentsCreated` callback now binds the actual pair of `SimpleTacticsAi` instances. The owner policy receives these callbacks through the existing default-off original-rank1/rank3 runner. A qualifying `Burrow` AttackAction sets the marker only when the Store identity matches the actual root, and records the accepted ordinal. A prompt override requires **both** the exact root Store state and the actual bot object for the acting seat. Paid Pass substitutions now use the same root/bot guard. No modifications were made inside `vendor/twinleaf`.

Touched files:
- `simulation/twinleaf/agent6-owner-deckout-paid-retreat.cjs`
- `simulation/twinleaf/headless.cjs`
- `simulation/evaluation/agent2-fresh-rank1-rank3-multibasic-panel.cjs`
- `tests/agent6-owner-deckout-paid-retreat.test.cjs`

The focused pure regression explicitly constructs a speculative Store sharing the **same state object** and calls the accepted-action callback for it: the real bot must reject the synthetic prompt authorization. A different bot instance also must not consume the actual owner's prompt override. The real Store/real bot positive control accepts the second attack prompts and records `acceptedRootOrdinal:7`. All eleven focused tests pass in the third native CI execution (ten passed before the additional Block/incomplete-attack regression).

## Two actual native executions and exact replay

Existing **manually dispatched** workflow `.github/workflows/agent2-fss-float-rank3-native.yml`, input `agent6_bunnelby_counterline_aba=true`, used the existing three-arm source-original A/B/A registration and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

| Execution | Final policy state | Native CI | Archive SHA-256 |
| --- | --- | --- | --- |
| [42322205638](https://github.com/FlareZ123/experiment-01/actions/runs/42322205638) | Root Store/agent binding and regression, before the additional paid-Pass guard | PASS | ZIP `c98c727aec2305b53940f5349a50686f6098f3602a4a8eb16a509f41ffad574b` |
| [42322504632](https://github.com/FlareZ123/experiment-01/actions/runs/42322504632) | Includes the paid-Pass real-Store/agent guard | PASS | ZIP `6fd0c1b39c7aace95f5e3ea2c51311e62dd07332412b547c607026844cbc1c44` |

A third manually dispatched exact-control run [42322965459](https://github.com/FlareZ123/experiment-01/actions/runs/42322965459) **PASS** followed the additional default-off safe vetoes for opponent Active `Block` and incomplete printed Active attack metadata. Its ZIP SHA-256 is `9f32f96ce4001cfa13d85456f247448ac52153ede9b82c61d32c297173b44dcc`. A fourth manually dispatched validation [42324279730](https://github.com/FlareZ123/experiment-01/actions/runs/42324279730) **PASS** included the further owner-prompt safety gates: the original printed Bunnelby must still be the Active attacker with the exact Burrow attack, and there must be **exactly one** unresolved prompt. Its full archived ZIP SHA-256 is `6b7443c54775550decce99ab08fcdbf4999034e3d1a5e70a0eb62d41732fa71a`. The **four** independent JSON members are byte-identical, SHA-256 `efb2f26e6190dee13abef1389da7ed80f2ecc81ccf8c215b14fb40d7778122cf`, 1,038,300 bytes. All four executions used original seed `3792360798`, rank3 actual seat 0, unchanged source-60 hash `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`, rank1 hash `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`. Their runner certifies the same expected full/source initial physical-deal hashes, and `dealMatched`, `controlsRepeatExactly`, and `historicalControlExact` all equal `true`.

All three arms reached native terminals at global turn 68 with rank1 (seat 1) winning. Their complete accepted-root SHA-256 values:
- A and A-prime: `5acd02e493800a041b5dedf4a9efa6a0a2de44eece25efc5424f5dda749c3acd` (291 actions);
- B: `ee130f3489fe1998d90377f4a5218aa45942d81e1a2b57edd5212e16ace9ad40` (296 actions).

The B audit establishes `rootStoreBound:true`, `rootAgentsBound:true`, `acceptedRootDeckOutActions:1`, `ignoredNonRootActions:0`, `typedRetreatsBySeat:[1,0]`, `acceptedSecondAttackConfirmPrompts:1`, `chosenSecondAttackPrompts:1`. The actual root Store accepted **RetreatAction ordinal 227** after a held Basic Water attachment, the **Burrow AttackAction ordinal 228** by Active `Bunnelby PRC` on owner turn 59, optional second-attack **ConfirmPrompt ordinal 230**, and **ChooseAttackPrompt ordinal 231**. The independent archived `rootActionLedger` also records **`initiatingRootActionOrdinal:228` for all ensuing prompt resolutions at ordinals 229 through 234**, including Confirm 230 and ChooseAttack 231. That public causal root label is stronger than merely seeing a same-turn Burrow followed by generic prompt types, although the runtime helper still uses root marker/Active identity checks and does not directly consume a root-origin field. The explicit authoritative marker is `{seat:0,turn:59,printing:"Bunnelby PRC",attackName:"Burrow",acceptedRootOrdinal:228}`; both Burrow declarations appear as settled native attack transitions. Original rank1 then used `Night Watch` at turn 60, Knocked Out Bunnelby for a Prize, and ultimately won at turn 68. The native winner and endpoint were unchanged relative to control. This is a bounded historical mechanical/control-policy result.

### Fail-closed public-rule checks

The original `deckOutPaidRetreatOpportunity` allowed an absent or nonnumeric Active attack list to imply that the Active had no payable damaging move, and lacked an opponent Active Ability-lock check. It now refuses a paid retreat when the Active printed attack catalogue is absent, incomplete, or contains an unknown damage/cost/text field. It also rejects a public opponent Active `Block` Ability, including the exact printed Snorlax BW8 and PGO text: `your opponent's Active Pokémon can't retreat`. When the Ability might be suppressed, this conservative refusal may miss an opportunity; it does not introduce a false claim of known legality. The additional pure test reproduces positive and negative states, including Block present by name or printed text. The authenticated original 29-source inventory includes **three Snorlax PGO 55 copies at rank 3** and **two at rank 7**; this restriction is an actual opponent-field possibility, although it was absent as an active lock in the frozen positive root. The source text came from the provided English card-pool archive. The third and fourth CIs' historical frozen original source had no such veto and correctly reproduced the same three action tapes.

### Still-active attacker and unambiguous prompt

After the native root-accepted Burrow marker, a second-attack override now also requires the current owner's Active Pokémon's **exact printed identity and Burrow text** to match the marked attacker. If that Pokémon was switched, Knocked Out, or changed, the marker cannot authorize a new prompt. The prompt set must contain exactly **one** unresolved prompt. Focused negative tests explicitly replace the Active, remove its printed Burrow attack, and introduce two unresolved `ConfirmPrompt` objects after a real marker; each must fall through to the original bot. The positive native original rank3 root 228/230/231 continues exactly as before in the fourth CI.

## Remaining guards and admission status

The exact paper validity of all broader native actions remains unqualified. A root Store accepted a card or action under this pinned engine, which is a concrete execution witness and **does not prove paper legality**. The optional second-attack prompt association is now bound to an accepted own root `Burrow` action but still deserves broader negative coverage for unrelated same-turn prompts, interrupted attacks, active replacement, opponent Ability-based retreat blocking, and unknown printed move metadata. The reserve recipient function retains the old theoretical opportunity-screen assumptions; this patch does not establish that its strategic deck-out choice is optimal. The historical opponent policy has not passed independent competence or paper/clock gates.

This patch provides a component for the common bilateral competence probe requested by Critic and steward Agent36. It does not justify new rank-specific cohorts. Current field status remains **29/32** authenticated original 60s (missing 23, 25, 28), **zero competitively qualified games**, no selected final fixed 60, and no demonstrated 99.5% result.

## Reproduction

Run the existing manual workflow at a commit containing the root-safety changes and the Block/incomplete-attack safeguards with `agent6_bunnelby_counterline_aba=true`. Its focused Node test and original-three-arm native Store replay must both pass. Download the single generated artifact; verify the source hashes, physical opening equivalence, exact A/A-prime control root SHA, treatment's root ordinal 228, the root-bound audit flags, and full action tape. A successful workflow run is a component validation receipt only.
