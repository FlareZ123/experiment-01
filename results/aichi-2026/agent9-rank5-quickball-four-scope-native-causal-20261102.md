# Rank-5 Quick Ball role-isolation: 32 native attempts, four exact physical deals

**Agent 9 | 2 November 2026 | registered causal development | zero competitively qualified games**

## Executed artifact

- [Registered before execution](registrations/agent9-rank5-quickball-four-scope-20261102.json), [reproducible native runner](../../simulation/evaluation/agent9-rank5-quickball-four-scope.cjs), [fixture test](../../tests/agent9-rank5-quickball-four-scope.test.cjs), existing [manual workflow](../../.github/workflows/agent9-rank5-quickball-same-revision-pair.yml) with `fourScope=true`.
- First complete execution: [GitHub Actions **41424333037**](https://github.com/FlareZ123/experiment-01/actions/runs/41424333037), exact head `b88cb5975b9363934165b0384f05831ac883feb0`, archived **artifact 13131282058**, ZIP SHA256 `454f89593f1d89d9c4bb3c2169f75258c8fb0b270caf04639c10d837d59ba7df`. All 32 original Store attempts and per-root ledgers were successfully written. CI *job* reported failure because its **post-run `node -e` summary line had a syntax error** after the native runner finished; 13/13 fixture tests passed, pinned Twinleaf compiled, archive upload succeeded. The summary syntax was fixed in later workflow commit `da7842ae`; do not count the reporting failure as a native execution failure.
- Native pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source original rank5 Mew/Genesect original printed60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. Four registered original physical deals, each repeated across two treatment/control policy modes and four Quick Ball scopes. **All eight mode/deal four-scope blocks had exact matching source/full physical deal fingerprints**.

## Genuine native root action outcomes

The following table shows the **four distinct physical trials** from `integratedV3Control`. The second mode `integratedV3FusionMobility` produced exactly the same rootActionLedger SHA256, engine outcome and counts for every trial/scope here. Consequently the eight mode/block comparisons are only four distinct deals, each doubled, and **must not be treated as independent samples**.

| Trial (source physical seat) | Scope | Source accepted Quick Ball | Candidate Quick Ball | Source AttackAction | Source Mew VMAX evolutions | Native end / winner |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| A / reference (1) | OFF | 0 | 0 | **4** | 2 | turn 50, source winner |
| A / reference (1) | Source-only | **3** | 0 | **0** | 2 | turn 43, candidate winner |
| A / reference (1) | Candidate-only | 0 | **1** | **4** | 2 | turn 48, source winner |
| A / reference (1) | Both | 1 | 1 | 0 | 0 | turn 45, candidate winner |
| A / New Moon (1) | OFF | 0 | 0 | **2** | 1 | turn 63, action cap |
| A / New Moon (1) | Source-only | **3** | 0 | **0** | 1 | turn 51, candidate winner |
| A / New Moon (1) | Candidate-only | 0 | 0 | **2** | 1 | turn 63, action cap |
| A / New Moon (1) | Both | 3 | 0 | 0 | 1 | turn 51, candidate winner |
| B / reference (0) | OFF | 0 | 0 | 0 | 0 | turn 35, candidate winner |
| B / reference (0) | Source-only | **1** | 0 | 0 | 0 | turn 23, candidate winner |
| B / reference (0) | Candidate-only | 0 | 0 | 0 | 0 | turn 35, candidate winner |
| B / reference (0) | Both | 1 | 0 | 0 | 0 | turn 23, candidate winner |
| B / New Moon (0) | OFF | 0 | 0 | 0 | 0 | turn 33, candidate winner |
| B / New Moon (0) | Source-only | **2** | 0 | 0 | 0 | turn 33, candidate winner |
| B / New Moon (0) | Candidate-only | 0 | 0 | 0 | 0 | turn 33, candidate winner |
| B / New Moon (0) | Both | 2 | 0 | 0 | 0 | turn 33, candidate winner |

**Distinct-deal subtotal (one mode):** OFF 6 source attacks, source-only 0, candidate-only 6, both 0. The source-only toggle, without candidate Quick Ball, independently reproduces the original-source attack collapse in both A trials. Candidate-only preserves source attacks and native winner/censor category in those trials, although it changes the A/reference terminal from global turn 50 to 48. This materially resolves the earlier **bilateral attribution ambiguity** for these fixed deals.

**State-level qualification:** In A/reference source-only the original player still executed **two Mew VMAX evolution roots**, yet never announced an attack. Its root ledger has **zero Double Colorless Energy hand attachments** versus two in OFF and two in candidate-only. The source-only Quick Ball payments were Muscle Band, Guzma and Karen, not Double Colorless Energy. Thus its failed attack line is associated with changed access/turn sequencing and loss of Energy attachments, rather than simply failed evolution or directly discarding the Energy. No counterfactual claim about the precise cause of missed Energy draws is established without more state tracing.

## Physical Quick Ball prompt chains

All source-only Quick Ball payments/searches are genuine accepted original Store roots with `ChooseCardsPrompt` follow-ups:

- A / reference and A / New Moon: **Muscle Band XY -> Dedenne GX UNB**, then **Guzma BUS -> Genesect V FST**, then **Karen XYP -> Genesect V FST**.
- B / reference: **Double Colorless Energy SUM -> Crobat V DAA**.
- B / New Moon: **Double Colorless Energy SUM -> Crobat V DAA**, then **Secret Box TWM -> Dedenne GX UNB**.

Candidate-only A/reference paid **Mysterious Treasure FLI** for **Dialga-GX UPR** before the source began its first turn. All other candidate-only deals had no Quick Ball action. Both-seat treatment altered subsequent source Quick Ball count in A/reference from 3 to 1, demonstrating interaction between actors even when source-only root activation is decisive for these native outcome differences.

The source rank5 original 60 has one Secret Box TWM, four Double Colorless Energy, two Guzma, two Karen, and two Muscle Band. Quick Ball's conservative proposer requires a duplicate non-Quick-Ball hand printing, but the subsequent independent native discard prompt selected the singleton Secret Box. The proposer does **not** enforce its implied low-cost discard. See [payment-search original archive](agent9-rank5-quickball-native-payment-search-chain-20261102.md) and the [Agent41 integration handoff](../../communications/agent41/20261102T0956Z_agent9_quickball_root_payment-disconnect.md).

## Inferential limits and recommended gate

This is a matched **same-original-deal controlled intervention** on an incomplete native opponent policy. Role-gated source-only and candidate-only conditions are causal probes, and **cannot** be promoted as identity-conditioned competitive policy. The eight blocks reuse four known deals selected in earlier research; there is no independent prospective matchup sample. In the A/New Moon OFF and candidate-only arms the action cap is censoring, not a settled game. The observed native winners are not tournament win-rate estimates; a paper 25-minute clock, complete live card effects, owner-private legality and genuine opponent decision quality remain unqualified.

Before any common both-seat Quick Ball admission, link the root decision with a legal owner-only payment policy and Basic search policy, and run fresh same-policy/same-seat prospective holdouts with turn-level attack/energy/evolution and terminal/censor receipts. The existing `agent47-actor-hand-discard.cjs` is an implementation candidate but needs direct Quick Ball prompt tests.

**Global benchmark status: 29/32 original opposing 60s authenticated, ranks 23/25/28 missing, zero competitive-qualified games, no demonstrated 99.5% fixed deck.**
