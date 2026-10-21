# Actual source-owned T7 Marnie versus Pass after candidate Rope: accepted, no recovery

**Agent 43 | 21 October 2026 UTC | evidence class: same-physical-deal native Store counterfactual, retrospectively chosen game.** This is one mechanical decision-policy result with **zero competitively qualified games**.

## Question

The source opponent's rank-11 Garbodor was forced Active by New Moon's real turn-6 `Escape Rope` and could not immediately pay its three-Colorless Retreat Cost. [Agent 23's independently authenticated source-owned T7 hand](https://github.com/FlareZ123/experiment-01/blob/agent23-sourcefirst-turn7-owner-recovery-audit-20261021/results/twinleaf/agent23-sourcefirst-rank11-crobat-confirm-20261021.md) held `Marnie SSH` and no direct held Float Stone, Guzma, own Rope, VS Seeker or Secret Box. After playing Crobat V, the source originally declined the optional draw and **Passed with Marnie in hand**. Can one genuinely held legal Supporter refresh the source's hand and rescue the stranded attacker?

## Preregistration and controls

The intervention was [registered before native execution](https://github.com/FlareZ123/experiment-01/blob/agent43-sourcefirst-t7-marnie-native-20261021/results/aichi-2026/registrations/agent43-sourcefirst-t7-marnie-native-20261021.md) on an [isolated reproducible experiment branch](https://github.com/FlareZ123/experiment-01/tree/agent43-sourcefirst-t7-marnie-native-20261021), based on Agent 23's frozen source-first owner-audit branch. Same rank-11 Absol/Garbodor source 60 and New Moon Lockbreaker v1 60; source actually goes first in seat 0, candidate in seat 1, seed **482443328**. Native Twinleaf pin **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. The original source-game fingerprint **`60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`** and the original 175-root-action ledger SHA-256 **`b6810151644e298d8a4bdfcd766e8adf509a5c25e6a73a0f4aa02c4c8fd9f5a6`** are mandatory gates for the control.

The only new decision wrapper [`agent43-source-t7-marnie-after-pass.cjs`](https://github.com/FlareZ123/experiment-01/blob/agent43-sourcefirst-t7-marnie-native-20261021/simulation/twinleaf/agent43-source-t7-marnie-after-pass.cjs) checks a *source-authenticated owner-root observation*. It activates only after the existing source policy proposes Pass on T7 with Marnie actually in its own hand, unused Supporter entitlement, own deck stock, Energy-empty Garbodor Active, Energy-equipped own Bench and no public Supporter lock. It picks the real source hand index and returns the normal native `PlayCardAction`. No candidate concealed cards are inspected to choose the action. The existing canonical policy and rank11 source-first candidate Rope intervention are unchanged. The pinned Store is the legality authority. Hook installation and restoration plus decision exclusion cases were covered in four passing pure tests.

## Native result

[Manual compiled CI run 39684213195](https://github.com/FlareZ123/experiment-01/actions/runs/39684213195) **SUCCESS** at experiment commit `1ba27c0327001bed5337f4be3a756add209e0ae7`; the existing `twinleaf-smoke.yml` was manually dispatched, with no new on-push workflow or vendor edits. [Complete full-ledger JSON artifact 12385925312](https://github.com/FlareZ123/experiment-01/actions/runs/39684213195/artifacts/12385925312), ZIP SHA-256 **`1180b0ee20f648941a79747d04b4e64ac52ceb695a612a5bf90cd45f5d99b102`** (verified independently against downloaded bytes). The artifact contains one `agent43-marnie-paired.json` with both entire root-action ledgers.

| Metric | Original source Pass control | Source plays held Marnie |
| --- | --- | --- |
| Actual first-player / physical source deal | source seat0 / original authenticated | same |
| First divergent root | T7, action ordinal 46: `PassTurnAction` | T7, ordinal 46: `PlayCardAction Marnie` |
| Native Store acceptance | original Pass | **1 accepted Marnie; 0 rejected** |
| Source's next own action on T7 | no further action | **Darkness Energy attachment**, then Pass |
| Source settled attacks | **0** | **0** |
| Candidate settled attacks | 8 | 6 |
| Total root actions / global turns | 175 / 36 | 153 / 32 |
| Native game terminal | candidate seat1, remaining Prizes **[6,0]** | candidate seat1, remaining Prizes **[6,0]** |

The source owned hand index selected was **0** in a five-card hand; `ownTurnResources.supporterPlayedTurn` was **0**, its original T7 source action was a Pass, and the Store accepted the replacement. The first **46 ledger actions** match the control, from setup through the declined source Crobat V confirmation. The altered source turn then contained **`Marnie` at ordinal46, a source `Darkness Energy` at ordinal49 and a Pass at ordinal50**. This proves both a real legal Supporter action and later source action change, without drawing any conclusion from the transient source-hand size immediately after the Store dispatch. Source action records on the treatment later include `Tapu Lele-GX` at T11 and a `Latias ex` at T29, but they never produce a source attack.

## Interpretation and remaining gate

The previously held Marnie was a **genuinely accessible bot-omitted legal action**. The narrower hypothesis that this *single* owner-root Supporter play restores the source's attacks or prevents New Moon's native terminal is **falsified for this one physical game**. Together with Agent23's failed accepted Crobat-draw intervention, the evidence documents two genuine source-owned development alternatives that change game action traces without reversing the outcome.

The source's broader search/prompt decisions, Energy recipient choice, attack choice, and physical card locations after the Marnie redraw remain weakly modeled. This intervention does **not** prove all source recovery routes were exhausted, a competent opponent would lose, the Rope route generalizes, or that New Moon wins a measurable fraction of competitive games. Neither the original nor the treatment has tournament-clock qualification. **Zero qualified games, 29/32 official registered opponent 60s recovered, no established 99.5% fixed 60.**

The next useful adversarial test should apply a *state-general, actor-only source recovery policy* to both control/Rope arms under fresh preregistered physically paired games, preserving all rejected, uncensored and censored arms. This single historical Marnie negative must not be promoted into a win-rate denominator.
