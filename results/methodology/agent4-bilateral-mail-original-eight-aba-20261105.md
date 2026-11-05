# Agent 4: bilateral owner-only Trainers' Mail policy, original-eight A/B/A native comparison

**2026-11-05 19:31 UTC | controlled native development | zero qualified games.**

## Question and registration

Does replacing an existing source-independent actor policy's **Pass** with a physically held, native-payable **Trainers' Mail ROS** help restore actual search decisions on either physical player seat, without disturbing baseline trials lacking the opportunity? Can the owner-only top-four prompt be completed in the real Store and the originally selected physical Trainer verified in hand?

The prospective, fixed-seed eight-arm A/B/A manifest is `results/aichi-2026/registrations/agent4-bilateral-mail-original-eight-aba-v1-20261105.json`. It preserves exact original source ranks 6 and 11, two candidates in both physical arrangements, and 48 native root actions per arm. The first and third runs execute the unchanged selected-v5 policy. Only the middle run inserts a **same-policy, both-seat, last-chance owner Mail root and owner-native top-four prompt handler**. It cannot read the opponent's hidden zones.

The policy considers an Item only when the existing decoder chooses `PassTurnAction`, the acting player has the original physical Mail in hand, Item lock is absent from their public and own-turn perspective, their own deck contains cards, and the card's actual native `canPlay` succeeds. A genuine pending Mail prompt permits one owner-deck top-four, native-validated non-Mail Trainer or an engine-valid zero-card selection. Actual card identities and Store post-resolution zones are audited.

## Actual pinned Store result

[Native GitHub Actions run 42094076121](https://github.com/FlareZ123/experiment-01/actions/runs/42094076121), [artifact 13446307139](https://github.com/FlareZ123/experiment-01/actions/runs/42094076121/artifacts/13446307139). Artifact's raw `agent4-bilateral-mail-original-eight-aba-native.json` SHA256 is **e1e2a5f4495c796b3c2d3bb73c00afee9ab7d04b6985ccf957a37f13f50e13ec**. The archived receipt contains the complete original-eight digest panel and aggregate native Store audit.

| Gate | Executed observation |
| --- | --- |
| Native original attempts per experimental arm | 8 |
| Whole physical starting deals, A/B/A | All 8 equal |
| Original source's physical deal, A/B/A | All 8 equal |
| Unmodified control A repeated after B | All 8 accepted action tapes identical |
| Source-independent native owner Pass roots inspected by B | 61 across 8 trials |
| New native owner Mail proposals | 4, all physical seat 1 |
| Real Store-accepted Mail `PlayCardAction` | 4 |
| Genuine native owner top-four `ChooseCardsPrompt` actions | 4 |
| Store-resolved top-four choices | **4** |
| Original physical Trainer cards moved into owner hands | **4** |
| Other top-four original physical cards returned to decks | **12** |
| Rejected prompt answers; unsettled answers | **0; 0** |
| Opponent hidden zones read by treatment | No |
| Full paper-qualified games | **0** |
| Demonstrated competitive win rate | **None** |

The four actual chosen Trainers were **Sidney FST 241**, **Guzma BUS**, **Sidney FST 241**, and **Guzma BUS**. Each rank6 source game selected Sidney followed by Guzma. Every one of the four original physical Trainer cards was independently witnessed entering the correct owner's hand, and each of the other three top-four cards returned to that owner's deck.

## Exact arm-level counterfactual

| Original trial | First B vs A root divergence | B native status |
| --- | --- | --- |
| 6:100:A:champion-reference | 14 | 48-root capped |
| 6:100:A:new-moon-lockbreaker-v1 | 14 | 48-root capped |
| 6:101:B:champion-reference | None | 48-root capped |
| 6:101:B:new-moon-lockbreaker-v1 | None | 48-root capped |
| 11:102:A:champion-reference | None | 48-root capped |
| 11:102:A:new-moon-lockbreaker-v1 | None | engine-error, 14 accepted roots |
| 11:103:B:champion-reference | None | 48-root capped |
| 11:103:B:new-moon-lockbreaker-v1 | None | 48-root capped |

The same two rank6 games changed at their first-owner-turn root14. Baseline control root tapes for the other six were reproduced exactly in treatment B, including the unrelated rank11 native error. That unchanged failure remains an explicit denominator and is not repaired or filtered away. Original opening fingerprints, baseline/treatment provenance and SHA256 action digests are preserved per arm in the artifact.

## Public action-tape follow-up, separate revision

A follow-up **readout-only** modification archived bounded, public native action roots for the two changed arms, with the same preregistered action treatment. The [repeated compiled A/B/A run 42095285003](https://github.com/FlareZ123/experiment-01/actions/runs/42095285003), [artifact 13446238055](https://github.com/FlareZ123/experiment-01/actions/runs/42095285003/artifacts/13446238055), inner JSON SHA256 **1c911d8241d010149403aa6de634202b8d16e560fc90c9df17af6eedf739ccaf**, reproduced the physical deals, the deterministic repeated controls, four accepted Mail roots, four settled owner prompts and physical Trainer transfers. The raw action chronology contains only public root attributes: ordinal, turn, physical seat, action name, publicly played card or attack.

| Original rank6 fixed candidate | A last observed game turn at 48 roots | B last observed game turn at 48 roots | Post-treatment source root decisions |
| --- | --- | --- | --- |
| Champion-reference | Turn 10 | **Turn 7** | Source played both Mail turn1, then still Passed on turns1,3,5,7 |
| New Moon Lockbreaker v1 | Turn 9 | **Turn 7** | Source played both Mail turn1, then still Passed on turns1,3,5 |

In the champion-reference candidate, the baseline and treatment had the same candidate **Shadow Mist attacks on turns 2, 4 and 6**. The baseline reached further Shadow Mist attacks on turns 8 and 10; B hit the root cap before those game turns. In the New Moon candidate, both arms played **Fog Crystal** and **Duskull** on turn2; the baseline additionally played **Klefki** on turn4, while the treatment's corresponding turn4 action was a Pass. The reason for that later candidate difference is unresolved and must not be inferred from the source Mail root alone.

The **48-root action cap is a moving game-time horizon**. Each extra Mail produced additional native prompt and shuffle actions, so B consumed the same fixed action budget while completing fewer game turns. Equal counts of 48 roots across controls and treatments say nothing about equal in-game progression or efficacy. No source attack, source Plumeria payment or source other-control payoff was observed in these particular rank6 public root tapes. A competing registered rank6 Plumeria fork showed that the two original physical Mail were used as payment for discarding an opponent's Psychic Energy in a different intervention. Spending them early on searches may therefore compete with a later Plumeria payment. This opportunity-cost issue remains untested directly here.

## Interpretation and limitations

This establishes a **reproducible native opponent-policy blind spot**: under the original selected common policy, rank6 source players declined genuine owner-held, native-payable Trainer search progress. A minimal owner-visible, physical-card and real-Store treatment changes the actual game trajectory and settles the search, without relying on private opponent information.

The sample has **two distinct fixed source openings and 4 correlated Mail activations**, not four independent game wins. It has not established comparative game strength, optimum timing of Mail use, quality of choosing Sidney versus Guzma, complete opponent decision competence, an accurate full paper rules simulator or a completed competitive match. The tested field remains **ranks 6 and 11 only**, though the original published list database shows **ten of the 29 authenticated source ranks** carrying 2–4 Trainers' Mail ROS: ranks **3, 5, 6, 9, 16, 17, 24, 26, 29, 30**. These additional eight ranks were not tested by this native experiment. The full Aichi original Top32 still lacks authenticated printed lists for ranks 23, 25 and 28.

The shared run still uses the v5 source-specific scripting, candidate-biased historical hooks, limited native decision policy and unverified paper clock. Native root acceptance and correct custody are local mechanistic evidence; they cannot certify a 99.5% single-deck game win rate.

## Files and next research

- Native root prerequisite: `simulation/twinleaf/agent4-bilateral-mail-root-choice.cjs`
- Same owner policy for both physical seats plus reversible late native decode/store hooks: `simulation/twinleaf/agent4-bilateral-mail-native.cjs`
- A/B/A runner: `simulation/evaluation/agent4-bilateral-mail-original-eight-aba-v1.cjs`
- Reproducible eight-arm source deal and control tape comparison: `simulation/evaluation/agent4-bilateral-mail-aba-compare.cjs`
- Pure tests: `tests/agent4-bilateral-mail-original-eight-aba.test.cjs`
- Earlier source-specific root/prompt diagnostic and native proof: `results/methodology/agent4-original-rank6-mail-source-first-turn-native-20261105.md`

Next, test the same common owner Mail root in other original-source ranks with registered opening deals and no source leakage, identify other recurrent native source Pass opportunities with physically payable Items, and expand to real terminal games under symmetric policies. Avoid counting original rank6 fixed-seed repetitions as independent outcomes.
