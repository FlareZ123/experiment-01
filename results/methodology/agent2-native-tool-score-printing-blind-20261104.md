# Agent 2: pinned native Tool scorer is printing-blind and first-Tool constrained

**4 November 2026. Native source code and two-seat Store test.** This is a developmental policy-competence finding, with zero competitively qualified games.

## Exact code mechanisms

Pinned Twinleaf revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05:

- [AttachToolTactic.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/attach-tool-tactic.ts) extracts own held Tools and examines **only the first held Tool**. Its native target search temporarily places that card on every untooled own Pokémon and compares total generic StateScore.
- [ToolsScore.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/state-score/tools-score.ts) considers only target Active position and remaining HP, with a minimum threshold. Its default coefficients are Active bonus 50, HP remaining coefficient 1, minimum score 70, per [simple-bot-definitions.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-bot-definitions.ts).
- The Tool scoring component never reads the Tool's name, attached effect, mobility effect, damage increase, VSTAR eligibility, lock interactions, or target payoff. All other StateScore components see identical underlying Pokémon and hand state when the *same* target receives different hypothetical Tools without actually playing them.

**Enumerating all held Tools without improving this state scorer will still fail to rank materially different printed effects.** The first-Tool limitation and effect-blind scoring are separate policy weaknesses.

## Real native original rank11 printed Tool counterexample

The deterministic native Store test constructs matching 60-card-source-present pieces in both owner physical seats: Active Mega Absol ex M1L with three Darkness Energy MEE, Bench Latias ex SSP, opponent Active Mega Absol ex M1L, and owner hand ordered Forest Seal Stone SIT, Float Stone BKT, Muscle Band XY. The rank11 original registered source includes all these cards and quantities.

Each hypothetical Tool is temporarily inserted in the same Active Tool slot for the **actual pinned StateScore.getScore** call. Float and Muscle are separately attached by a **real native Store PlayCardAction** in fresh but identical staged states, then each accepts a real Claw of Darkness attack. The opponent remains Active after damage, avoiding forced endgame ambiguity.

| Actual native receipt, both seats | FSS SIT | Float Stone BKT | Muscle Band XY |
| --- | ---: | ---: | ---: |
| Score of identical board with Tool hypothetically attached | **462** | **462** | **462** |
| Before any Tool, same board score | 132 | 132 | 132 |
| PlayCardAction and Claw of Darkness executed by Store | Score only | Yes | Yes |
| Damage dealt to identical opponent Active | Not measured | **200** | **220** |

The same generic attachment score increases **+330** for every Tool, despite the **20-damage** difference between Float and Muscle. FSS-on-Mega Absol was a *scoring* counterfactual; it is not asserted to be a strategically sensible attachment. Both source Tool attachments were accepted in the actual native Store; no hypothetical native hand scores were substituted for attack damage.

Other states can favor Float's retreat benefit, so this result is a proof of **Tool-effect-blind ranking**, not proof Muscle Band is universally stronger.

## Reproducibility and custody

- [Two-seat real Store and native-score test](../../tests/agent2-tool-score-card-identity-blind.native.test.cjs) checks same state, genuine card objects, three exact score equalities, legal Tool attachment, and printed attack damage 200 versus 220.
- [Manual-only native CI](../../.github/workflows/agent2-fss-float-rank3-native.yml) compiles the exact pinned Twinleaf submodule and runs the Tool score tests plus [earlier FSS-first native mobility stages](agent2-fss-first-tool-staged-native-20261104.md).
- [Successful CI 41899317603](https://github.com/FlareZ123/experiment-01/actions/runs/41899317603), research checkout **4ef3699cdd639c912076831db11e599ebf3481bb**, eight native test cases PASS. Downloadable [artifact 13355669332](https://github.com/FlareZ123/experiment-01/actions/runs/41899317603/artifacts/13355669332) ZIP digest **sha256:6bb9400f21d17390d80f86a64f6d767b437eac525345f8480a0be081bc703ebd**.
- Native log has two independent seat receipts with same exact numeric scores and damage values.
- [Earlier source 29 exact collision census](agent2-original29-fss-first-tool-starvation-20261104.md) found 12 of 29 original decks have FSS plus other Tools, with a rank11 starting-seven FSS-first/no-V opportunity frequency 2.1419%.

## Recommended research test

A generally strong source-independent policy must compare Tool/eligible-recipient pairs using the printed effects and tactical board state while preserving owner information restrictions and native Store action validation. Immediate payoff and future alternative costs both matter. First check if [Agent14's strategically gated generic funded Float policy](../../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs) runs *before* native first-Tool and FSS holder wrappers in actual selected Issue25 policy. Do not double-install a simplistic greedy Float wrapper when this stronger owner-root policy already covers the case.

Use registered original source decks and natural full game sequences, including opposing replies and paper eligibility, before measuring actual win effects. These two-seat constructed tests do not establish policy strength.

**Global release remains FAIL:** 29/32 original source decks authenticated, zero competitively qualified full games, no final fixed proven 60, no 99.5% demonstrated field win rate.
