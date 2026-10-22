# Agent 45: preregistered rank4 native Bomb recipient test

**Registered 2026-10-21 01:54 UTC, before manual dispatch or result inspection.**

The completed matched source Compressor+Rope experiment and its read-only observer have verified two native `Extra Energy Bomb` usages but found relatively few Special Energy cards on the subsequent Active Alolan Raichu, despite many source Bench attachments. [Previous report](agent45-rank4-rope-pivot-pair-20261021.md), control [run 39528545399](https://github.com/FlareZ123/experiment-01/actions/runs/39528545399), artifact [12314621513](https://github.com/FlareZ123/experiment-01/actions/runs/39528545399/artifacts/12314621513).

New experimental source-only policy: [rank4-raichu-bomb-recipient-policy.cjs](../../simulation/twinleaf/rank4-raichu-bomb-recipient-policy.cjs). At a genuine Electrode-style discard-pile `AttachEnergyPrompt`, after source Rope establishes Active Alolan Raichu and Benched Electrode-GX, select the full corrected mandatory number of real owner-discard Energy instances and assign them to the eligible Active Raichu. Prefer Reversal, Counter, Unit Energy LPM to other present cards. Enforce `prompt.validate` and retain the existing native hook's target validation and five-card count. Fallback to upstream choices on any nonmatching prompt. The code does not read the opponent's hidden zones or source deck. New pure [unit tests](../../tests/rank4-raichu-bomb-recipient-policy.test.cjs) check constraints.

**Design:** one new frozen manual run versus the exact eight-control records in artifact 12314621513, keeping all original rank4 source 60, four candidate 60s, both physical seats, `decorrelated-slots-v3` seeds, source Compressor+Rope policies, corrected paper Electro Rain/Electrode-GX interactions, isolated randomness, observer flags and native matching protocol. The sole intended gameplay toggle is `rank4_raichu_bomb_recipient_source=true`. The new commit/revision metadata will differ, and the new policy/seat flag will be recorded. Preserve every attempt, error, no-trigger game, real root divergence, recipient targets, actual Raichu Energy cards, opponent Prize count, attack names and continuation.

Hypothesis: Concentrating more eligible Special Energy on Alolan Raichu after the two authentic Bomb activations may make the printed Electro Rain attack more impactful. **Falsifier:** no additional Active Raichu Energy despite the policy, native Store rejection, lost root integration, worse attacking follow-through or no genuine opponent continuation. Even a successful Energy routing change does **not** prove an Electro Rain knockout or match improvement. This is an eight-seed development diagnostic. Competitive-qualified games remain zero; no 99.5% strength claim.

---

## Executed matched native comparison and independent frozen-control closure (22 October 2026)

**Result: 8/8 paired full engine completions; two physically different source attack boards; one changed source attack trajectory; zero changed engine winners; zero competitively qualified games.** The registration above preceded the initial 21 October treatment run. Its outcome was recovered on 22 October and an independent frozen same-head OFF control was then preregistered at [agent45-rank4-bomb-samehead-control-20261022.md](registrations/agent45-rank4-bomb-samehead-control-20261022.md) *before* the control dispatch. The archived, already completed treatment was not treated as fresh held-out evidence.

### Reproducibility and complete evidence

| Arm | Original manual GitHub Actions run | Diagnostic artifact ID | Exact downloaded ZIP SHA256 |
| --- | --- | --- | --- |
| Historical OFF, different source revision | [39528545399](https://github.com/FlareZ123/experiment-01/actions/runs/39528545399) | `12314621513` | `dcf4e798de333db26868dbcb479d7b86c0f599b5973ace3af11eb39087116899` |
| **Frozen same-head OFF** | [39707262189](https://github.com/FlareZ123/experiment-01/actions/runs/39707262189), success | `12395269780` | `92e436a785aebe3d81e3c01b09294fc32d1634ba5e4afa5be45adc810a41352b` |
| **Frozen same-head ON** | [39529947887](https://github.com/FlareZ123/experiment-01/actions/runs/39529947887), success | `12314957636` | `9be1163933402292171b75d45d90340bdd0f91196959ca25373efed5a19e05b0` |

Both same-head arms ran frozen research SHA **`5ba44c1adbf9be07379d4f0cee7c83b8aee05eec`**, pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, published rank-4 opponent, unchanged champion/Hood/Temple/New Moon 60s, `decorrelated-slots-v3` registration, action cap 600 and plan digest `21fd5c47f6168f127f2e3dcad4b9d42bd79ed0c4b3801b261b5d8d667ef10cbf`. The full eight physical trial IDs, seeds, deck hashes, both actual starter slots, printed identity and all policy flags match, apart from the single predeclared `rank4RaichuBombRecipientSource` OFF/ON change. Active options shared: paper-corrected Electrode-GX attachments and Alolan Raichu Electro Rain, source prize-trade and Compressor/Rope policies, Battle Compressor mandatory-one guard, rank-4 observer, isolated randomness and public attack telemetry.

**Negative same-head control check:** historical OFF SHA `a47c7a4897682ebdc6156750b8ef5b1811860e5a` and frozen OFF SHA `5ba44c1...` have all eight equal root-ledger digests, chronological action digests, public attack transitions, final public states, winner indices, Prize totals, action counts and observed source Bomb uses. Introducing the disabled recipient module caused no observed native change in this full panel. A redundant ON manual run [39706801335](https://github.com/FlareZ123/experiment-01/actions/runs/39706801335) was promptly cancelled when the existing archived ON run was discovered, avoiding further duplicate computation.

### Per-trial failure-inclusive same-head results

All eight trials are marked `completed-engine-game` in **each** arm; none is a declared paper-clock or policy-qualified match. Source is rank-4 Alolan Raichu/Electrode-GX; candidate physical seat is the last character of trial ID. Opponent source seat is the other physical seat.

| Frozen candidate, physical seat | Source Bomb `UseAbilityAction` root ordinals OFF → ON | Native root labels change? | Public source attack board change? | Final Prizes remaining [seat A, seat B] OFF → ON | Engine winner changes? |
| --- | --- | --- | --- | --- | --- |
| Champion A | [171] → [171,205] | **Yes, first at 180** | **Yes** | [0,5] → [0,2] | No, candidate A |
| Champion B | none → none | No | No | [6,0] → [6,0] | No, candidate B |
| Hood A | none → none | No | No | [3,1] → [3,1] | No, source B |
| Hood B | none → none | No | No | [6,0] → [6,0] | No, candidate B |
| Temple A | none → none | No | No | [0,6] → [0,6] | No, candidate A |
| Temple B | none → none | No | No | [6,0] → [6,0] | No, candidate B |
| New Moon A | none → none | No | No | [6,6] → [6,6] | No, candidate A (engine outcome) |
| New Moon B | [179] → [179] | **No** | **Yes** | [5,0] → [5,0] | No, candidate B (engine outcome) |

**Champion A genuine native sequence:** Source Raichu in slot B completes `Extra Energy Bomb` at Store root ordinal **171**, `AttachEnergyPrompt` **173**, then attacks at **180**, turn **18**. Frozen OFF public attack board records **two** Active Raichu Energy: Unit Energy LPM + Reversal Energy, and `Electric Ball`. Frozen ON board records **six** attached Energy: Unit, Reversal ×2, Counter ×2 and Unit, followed by `Electro Rain`. The actual root-label sequence first differs at ordinal 180, *after* the Energy-recipient prompt difference, demonstrating that a root-label SHA cannot attest physical attachment actions. ON additionally invokes Bomb at root **205**, attacks with `Electro Rain` again on turn 20 and finishes after **244** actions versus **260** OFF. Rank-4 source remaining Prizes improved from **5 to 2**, corresponding to three additional native source Prizes taken in this one branch, while champion A still took all six and won. Attack counts are source `Electric Ball` three times OFF versus `Electro Rain` twice ON. This is a tactical mechanics/policy effect on a selected game, with no observed winner reversal.

**New Moon B genuine native sequence:** Source in slot A invokes Bomb at root **179** on turn **33**, resolves `AttachEnergyPrompt` root **181**, then uses `Electric Ball` at **183** in both arms. At the actual attack boundary, OFF Raichu carries **Reversal + Counter**, while ON carries **Reversal + Counter + Unit Energy LPM**. The compact root-action SHA is **identical** across OFF/ON, yet source public attack boards and chronological trace hashes differ. Both runs end after 220 actions with unchanged native Prizes [5,0] and unchanged winner.

All six other physical pairs retain equal action-ledger and chronological digests, equal public attack boards, and equal outcomes. The narrower observation is *no detected public effect in these six*, usually because the expected Bomb prompt did not occur; it is not evidence that full physical or hidden state is proven identical.

### Interpretation and limitations

The observed two-source-board exposure validates that the owner-discard recipient policy can increase actual Active Raichu Energy at a real native attack boundary; in one exposed arm this changes attack selection and ensuing Prize progression. **There is no evidence of improved engine win count across these eight matched cases.** A second exposed arm changes physical Energy without any root-label SHA change, independently reinforcing the accepted-target observer priority raised by Agents 8, 12 and Critic. The old frozen branch predates the new Store-accepted target sidecar, so exact prompt-selected `to` geometry at ordinals 173 and 181 remains unverified by that instrument; the public before-attack board is the authenticated downstream evidence. Do not present owner intent as a complete native recipient receipt.

Research-owned, reusable analysis: [`scripts/agent45-rank4-bomb-compare.cjs`](../../scripts/agent45-rank4-bomb-compare.cjs) enforces eight matched trial identities and one changed flag, compares complete chronological/root/physical public attack outputs, and refuses omitted trials or changed seeds; [four pure CJS regression tests](../../tests/agent45-rank4-bomb-compare.test.cjs) passed locally via `node --test`. Raw source archives remain linked above. This test belongs to source-policy coverage and physical-action observability; it leaves the canonical two-seat rank6/rank11 critical path untouched and creates no new workflow.

**Statistical/competitive boundary:** original source/candidate policy still uses strategically weak generic decisions, no realistic paper clock or independent all-field opponent competence is established, and the eight decks/seats are a selected diagnostic panel. The result does not qualify a match, certify printed-card fidelity beyond explicitly corrected bounded effects, or show any fraction of the desired 99.5% full-field win rate. Top32 full-list provenance remains **29/32** (23,25,28 missing) and independently competitive-qualified games remain **0**.
