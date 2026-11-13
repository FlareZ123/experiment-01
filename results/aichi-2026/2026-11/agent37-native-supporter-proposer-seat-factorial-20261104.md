# Agent 37: original-source seat-factorial shows when fixing native Supporter proposal corruption suppresses or restores attacks

**4 November 2026 | historical original Aichi paper Expanded decks, pinned Twinleaf | developmental causal native-policy experiment, zero competitive games**

## Decision-relevant result

Restoring the normal Supporter quota after a **proposal-only** mutation makes the pinned native bot perform genuine previously missed Supporter plays. Those additional actions are not consistently strategically advantageous. In an exact **original rank 6 versus rank 9** full-deck physical deal, correcting only the **rank-9 actor (physical seat 0)** changes rank 9's turn-4 `Gengar & Mimikyu-GX` **Horror House-GX** into `Squawkabilly ex` **Motivate** after an earlier accepted `Guzma`. Correcting only the opposing **rank-6 actor (physical seat 1)** leaves rank 9's turn-4 Horror House-GX intact. Correcting **both** actors yields no attack through its 90-action, global-turn-8 observation horizon. This isolates a direct source-owner strategic opportunity cost and a genuinely bilateral action-path interaction in one fixed physical deal. It cannot establish which policy wins the game.

A second exact **rank-6 versus rank-9 fresh, preregistered seed** gives a contrasting case: correcting rank 6 alone produces a genuine turn-8 `Iron Thorns ex` **Volt Cyclone**, which also appears when correcting both seats. Correcting rank 9 alone leaves the observed source without an attack. Thus the policy correction has state- and seat-dependent tactical consequences.

All original source 60s remain unchanged. No scored game is admitted as paper-competitive or as evidence of a 99.5% field win rate.

## Attribution and fixed design

This explicitly extends **Agent 20**, who discovered native `PlaySupporterTactic` changing `supporterTurn` during a speculative proposal and proved a single Guzma rollback, then built a bilateral 8-source-group recovery hook. Agent 20's 3 November artifact **13278698258**, raw JSON SHA-256 `d97821d33f060c660e130f023581c3dbcfc4e3779c3521d67a64c398717709ea`, correctly classified **38 real Store acceptances plus 38 Simulator-clone validation acceptances**, after Agent 41's independent audit detected and helped resolve double counting. Agent 41 specifically proposed the 2x2 seat-factorial response to rank 9's early GX loss; this study implements that suggestion. It does not claim those prior findings as new.

The [frozen preregistration](../registrations/agent37-supporter-proposer-seat-factorial-v1-20261104.json) was committed **2aeadfcd624260bd8c66d01dc12a8627f5b8a78b** before triggering any new native run. The four original physical groups were selected based on prior evidence, so they are **not** new independent random metagame samples. Each has five arms, using the **same exact original two decklists, physical seat, RNG seed, native engine, action cap and actual Store**:

1. Native unchanged control.
2. Supporter proposal quota corrected only for physical seat 0.
3. Quota corrected only for physical seat 1.
4. Quota corrected for both seats.
5. Native unchanged control repeated.

The research-side correction runs only in a genuine live-owner tactic invocation, on a selected physical seat, after the source tactic visibly changed unspent `supporterTurn=0` to `state.turn` while returning a physical held Supporter `PlayCardAction`. It restores that proposal-side counter to 0 before validation. Actual Store dispatch then applies normal Supporter effect, turn quota and prompts. A cloned speculative Simulator Store is expressly excluded from acceptance counts. The hook neither edits the pinned vendor nor inspects hidden opponent hand, own deck, or Prize identities. It still relies on the native bot's selected proposal and on a native engine with known paper-fidelity gaps.

## Exact compiled CI and integrity

- [GitHub Actions success run **41747450226**](https://github.com/FlareZ123/experiment-01/actions/runs/41747450226); research HEAD **`34ae2d066a40d680f37a45a56f79f1b9e4c04dfd`**.
- Pinned upstream Twinleaf revision **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**.
- Artifact **13284980718**, name `agent37-original-source-supporter-proposal-factorial`, 90,231-byte ZIP, ZIP SHA-256 **`af17f1e4fab5e3d795a7677e8a4e041afcf8b18450d0d5bd909230d801ddfcbd`**. The `agent37-supporter-proposer-factorial-native.json` within is **1,995,382 bytes**, SHA-256 **`c669de138b6c0524898207c5a00950bbbb11d7789200f2dc927800a705eb0318`**.
- **4/4** preregistered source groups had the expected exact initial **whole physical deal SHA-256** in all five arms.
- **4/4** had completely identical original versus repeated-control native trace digests.
- **20/20** attempts executed without native runtime errors. **41** actual Store-accepted corrected Supporter proposals across the 12 treatment arms, **zero** real Store rejections, **zero** repeated corrected `(physical seat, global turn)` within any arm, and every accepted proposal had the Store-confirmed Supporter quota **1** afterward.
- The original control, both-seat-correction and repeated control from all four groups were individually byte-for-byte identical to the corresponding **12** original native action ledgers, decision traces, and attack traces in Agent 20's earlier artifact. This verifies the independent seat-scoped implementation reproduces previous combined-actor behavior on the same physical deal. It contributes **new single-seat arm comparisons**, rather than a new overall original sample.

A Store acceptance is still not an independent paper-rule certification. Native attack counts and native terminal conditions are developmental, with the official 25-minute clock, competent adversarial decisions, and full card legality still unresolved.

## Preregistered 2x2 observations

Each table row is **one arm of one fixed original physical deal**. These are correlated policy alternatives, not independent trials.

| Original ranks, seed and rank of seat 0 | Native control | Correct seat 0 only | Correct seat 1 only | Correct both |
| --- | --- | --- | --- | --- |
| **6 vs 9**, `1192664073`, rank 9 in seat 0 | 0 corrections; turn-4 **Horror House-GX** | 1 accepted `Guzma BUS`; turn-4 **Motivate** | 5 accepted Supporters; turn-4 **Horror House-GX** | 6 accepted Supporters; **no attack by turn 8** |
| **6 vs 9**, `809028196`, rank 6 in seat 0 | 0; no attack in observed 90 actions | 6 accepted; turn-8 **Volt Cyclone** | 1 accepted late; no attack | 6 accepted; turn-8 **Volt Cyclone** |
| **5 vs 11**, `912174767`, rank 5 in seat 0 | Native rank-11 terminal victory at 73 actions, turn 14 | 2 accepted; rank-11 native terminal victory at 55 actions, turn 6 | 2 accepted; rank-11 native terminal victory at 50 actions, turn 6 | 3 accepted; rank-11 native terminal victory at 52 actions, turn 6 |
| **5 vs 11**, `1914651848`, rank 11 in seat 0 | Native rank-11 terminal victory at 78 actions, turn 9 | 2 accepted; 90-action cap, unfinished | 2 accepted; 90-action cap, unfinished | 5 accepted; 90-action cap, unfinished |

The repeated control for every row reproduces the native control. "Victory" here is a **native engine terminal only**, deliberately excluded from competitive admission.

### Exact first-divergence account, original rank 6 vs rank 9, historic seed 1192664073

The initial physical deal SHA-256 is **`b9398dd0e9f4b93085cf1fb36595b17df72e602b3f8e69636c005b43929f2a9a`**, rank 9 as physical actor seat 0, rank 6 as opponent seat 1. Native actions match through ordinal **24**. At action **25**, global turn **2**, rank 9 held `Guzma BUS`, had Active `Gengar & Mimikyu-GX` and Bench `Sableye V` plus `Squawkabilly ex`; rank 6 had Active `Iron Thorns ex` and one Benched Thorns. The original and seat1-only runs chose native **Pass**. Seat0-only and both-seat correction each selected and actually played **Guzma**, resolving its switching prompts.

Immediately after the selected turn-2 action, the rank-9 board in the both-seat treatment had **Squawkabilly ex Active**, Gengar/Mimikyu on the Bench and Sableye still Benched. This is a direct Active-position consequence of Guzma, not an inferred tendency. In the seat0-only arm, rank 9 later attached `Prism Energy` and used **Squawkabilly ex's Motivate** on turn 4. Original baseline and seat1-only arm instead attached Prism to **Gengar & Mimikyu-GX** and used **Horror House-GX** that turn. Rank6-only first diverged on its own turn **3** (action ordinal **32**) with `Eri TEF`; it did **not** remove the opponent's turn-4 GX.

With both seats corrected, rank6 also played a turn-3 **Guzma**. On turn 4, rank9 played Prism and another **Guzma**, then passed with **Gengar & Mimikyu-GX Active but unpowered** and `Sableye V` holding Prism on the Bench. That is the immediate source of the zero-attack turn-4 difference in this branch. The combined arm ends the recorded 90-action sequence during global turn **8**, so no turn-4 observation is censored. Later potential attacks remain unknown.

The result demonstrates a **specific counterexample** to promoting "more native Store-accepted Supporters" into either a better attack count or a more competent opponent. A source-player-only repair was sufficient to change the crucial GX line; the opponent-only repair did not cause that same difference.

### Fresh original rank 6 vs rank 9 seed 809028196

The initial full deal SHA-256 is **`067aee12d2b8f89920d08eb4c3dd3cc49d52a3ba4d31d9917c972604018ffeba`**, with rank 6 as physical seat 0. Source rank 6's uncorrected action **17**, turn 2, was **Pass**; correcting seat0 proposed and Store-played `Guzma BUS` instead. Both the seat0-only and both-seat arms then used `Volt Cyclone` on turn **8** (native recorded attack, **no immediate Prize change**). Seat1-only policy first diverged as late as native turn **17**, action ordinal **87**, where rank 9 played Guzma; it did not produce a source turn-8 Volt. Original and both-correction action/attack trajectories match Agent20's earlier reproducible 8-group source in this physical deal.

This is a positive **attack-access** example at one frozen source deal, without demonstrated scoring, matchup success, or an independently skilled adversary.

### Rank 5 vs rank 11 original controls

Rank5 seat0 historic seed `912174767` had earlier native winner rank11 in every arm, but corrected policies shortened that native route dramatically and selected different early Supporters. Rank5 seat1 seed `1914651848` had a complete native rank11 win in the unmodified arm, whereas corrected variants exhausted their fixed 90-action caps with different source attacks. An action-capped unfinished arm cannot be scored as a loss or a win. The observed changes show why actor-specific and opponent-specific choices must be treated as coupled policies.

## Integration recommendation and qualification boundary

Keep the paper-sensible **proposal-side quota repair** available as an isolated research hook, with both-seat regression tests and actual Store receipts. It is not sufficient as a strategic selection policy: a correctly playable `Guzma` may reposition an unpowered attacker, alter future Energy placement, consume the only Supporter opportunity and eliminate a better imminent GX line. A shared paper-aware decision policy needs to compare legal alternatives and opportunity costs, not just unblock cards that native enumeration missed.

Before ranking a fixed deck, require the common candidate and opponent policy to preserve source-specific attack lines and credible defensive replies, then use fresh registered independent deals against all original field entries with actual game-clock adjudication. This experiment addresses one concrete policy quality risk and contributes **zero competitive wins**.

### Reproducibility locations

- Preregistration: `results/aichi-2026/registrations/agent37-supporter-proposer-seat-factorial-v1-20261104.json`.
- Seat-scoped reversible adapter: `simulation/twinleaf/agent37-seat-scoped-supporter-proposal-purity.cjs`, explicitly based on Agent20's validated proposal-purity principle.
- Mock seat-isolation and speculative Store regression tests: `tests/agent37-seat-scoped-supporter-proposal-purity.test.cjs`, pass in same CI.
- Original-sixty five-arm native runner: `simulation/evaluation/agent37-supporter-proposer-factorial-native.cjs`.
- Existing manual `.github/workflows/apex-spread-policy.yml` with this optional experiment appended only in the research branch.
- Exact output: CI run 41747450226 and artifact 13284980718 above; the raw artifact expires at provider retention and is re-creatable from the pinned source and registered seeds.
