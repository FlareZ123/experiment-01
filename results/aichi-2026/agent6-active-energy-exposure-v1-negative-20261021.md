# Aggressive one-turn Energy-exposure guard harmed source-first champion despite delaying a KO

**Agent 6, 21 October 2026.** Paired native pinned Twinleaf evaluation, **0 qualified games**. This documents a failed hypothesis on branch `agent6-public-energy-threat-guard-20261021`, preserved for falsification. Do **not** integrate the v1 guard into the common research policy on the basis of these results. The [preregistration](registrations/agent6-sourcefirst-energy-exposure-guard-20261021.md) preceded implementation and dispatch.

## Frozen actual Store comparison

| | Baseline generic direct-KO priority | Add generic unconditional Active-Energy scaling exposure guard |
| --- | --- | --- |
| Workflow checkout SHA | `93cea353a91a079c435331526a8156fa3f922b95` | `4c0a9ee5bc69148bddce772775a34f8f0cfd00ca` |
| Manual existing workflow | [39657318876](https://github.com/FlareZ123/experiment-01/actions/runs/39657318876) | [39657328620](https://github.com/FlareZ123/experiment-01/actions/runs/39657328620) |
| Archive | [12371619293](https://github.com/FlareZ123/experiment-01/actions/runs/39657318876/artifacts/12371619293) | [12370789960](https://github.com/FlareZ123/experiment-01/actions/runs/39657328620/artifacts/12370789960) |
| Provider ZIP SHA256 | `df6e65fed4c2ac1c638608c242b718e4c2499af6de7cec72adffff53c7fe35e6` | `6701dd8e1e1a6407cc3fe4b2e0499ab79efab771f90d179096b0033b17651d6e` |
| Original four, source-first four | 3/4 audited + known original rank6 epoch rejection; 4/4 separately source-first audited | Same total audit coverage, retained failure |
| Competitive-qualified | 0 | 0 |

The prior generic nominal direct-KO selector, frozen candidate and exact opposing 60-card lists, physical deals, seed, starter seats and Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` were unchanged. The only gameplay difference is a public attack-text-matched Basic attachment guard: when any credited Active attack remains short after attaching, and the opponent has a face-up printed attack gaining damage for each Energy attached to our Active, choose a credited Bench alternative or hold the Energy. The guard uses neither the opponent's hand nor card-specific Articuno/Oranguru names. Both jobs run the same read-only source-first observer; the v1 pure test group passed before native execution. Both whole workflows correctly end **failure** at the existing strict original rank6 audit.

## All eight attempted outcomes

| Trial | Control actual action roots, final [source,candidate] Prizes, engine winner seat | Guard v1 result |
| --- | --- | --- |
| Rank6 original vs champion | **Engine error**: malformed root ordinal38, unaudited | Identical engine error, root digest |
| Rank6 original vs New Moon | 94, `[6,0]`, seat1 | Exact same full root digest and finish |
| Rank11 original vs champion | 224, `[0,6]`, source seat0 | Exact same full root digest and finish |
| Rank11 original vs New Moon | 222, `[0,6]`, source seat0 | Exact same full root digest and finish |
| Rank6 source-first vs champion | 94, `[6,2]`, candidate seat1 | Identical root digest and finish |
| Rank6 source-first vs New Moon | 248, `[0,6]`, source seat0 | Identical root digest and finish |
| **Rank11 source-first vs champion** | **89, `[6,1]`, candidate seat1 engine win** | **246, `[0,6]`, source seat0 engine win** |
| Rank11 source-first vs New Moon | 239, `[0,6]`, source seat0 win | 246, `[0,6]`, source seat0 win |

The source-first rank11 exact source physical fingerprint on both arms is `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`. The final physical original/deal and actual first starter stay matched. Original baseline rank11 source-first champion complete root SHA `7ed490f4b84073ab8102c8d239bef5fb18302d4542a1b8c9b87220cb6a807aec` changes to `ebecd7adca24e5abb06fca307464c13c0fc63c4f58a0b612be4a`; rank11 New Moon `a15d8d3b11908b8c8ab5dc634b36384003ea8ccb00e60e208e82c394e22d2b57` changes to `2378833ea1dd1bb367c96df466919ff603ae4ba20866868b63cc358ddd3f0651`. Native root acceptances in corresponding source-first rank11 rows: champion **25 -> 81**, New Moon **71 -> 74**, zero rejected roots in either. These are different actual Store decisions and downstream game trajectories; the new engine winner reversal is an **unsafe decision-policy regression**, not a true physical match win-rate estimate.

## Native attack/Prize mechanics: the narrow benefit and the hard failure

The read-only source-attacker attack settlement shows baseline rank11 New Moon's opposing Oranguru V Psychic at turn **19** facing **Lunatone with two attached Energy cards** (Telepathic Psychic + Basic Psychic) and directly taking one Prize: source Prizes `[6,6] -> [5,6]`; candidate promotes zero-Energy Galarian Articuno V. Under v1, turn19 Oranguru Psychic faced Lunatone with **only Telepathic Psychic Energy attached**, deposited **80 damage** and took **no Prize** `[6,6] -> [6,6]`. A second source Psychic attack at turn **21** then finally knocked Lunatone out, taking the Prize and promoting Articuno. This is a real, same-source-deal delayed KO. Later source Psychic from turn23 through turn33 put repeated **30** on zero-Energy Articuno, and both branches still produced a full source game-ending six-Prize completion. Candidate at source-first T22 **passed** without a Basic attachment in the *current frozen control*, in contrast to the earlier Agent45 flag combination; the intervention must not be credited as stopping a T22 Active attachment that did not exist here.

The much worse champion outcome invalidates a blanket rule against making future attack-Energy progress whenever the opponent's damage rises. An unready attacker may need repeated turns of normal attachments to become functional, especially under early lock. Avoiding a small immediate exposure can destroy the only way to begin taking Prizes. This is an explicit counterexample to an overly local survival/one-turn risk metric. It does not establish that every hold or Bench alternative is wrong; it establishes that **this broad trigger** is unsafe in the observed native policy.

## Follow-up falsifiable narrower alternative

Only consider withholding/rerouting the Energy if the opposing publicly printed scaling attack's nominal damage is **below the defending Active's remaining printed HP without attachment and at least that HP with one extra Basic Energy**. This one-hit lethal-threshold condition should preserve nonlethal multi-turn setup attachments while preventing an immediate extra-Prize donation. It still ignores modifiers, Weakness, Resistance, lock, Energy units and future sequencing, so must be independently pure-tested and natively paired under the *same exact original/source-first fields* with all errors. Testing it is a hypothesis, not a validated fix. Until then retain v1 solely as a negative study.

All 8 games are retrospectively chosen development seeds, incomplete actor-owned prompts and paper clock, missing exact source ranks23/25/28, zero qualification, 99.5% target unverified.
