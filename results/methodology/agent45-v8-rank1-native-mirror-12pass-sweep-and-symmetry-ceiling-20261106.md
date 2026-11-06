# Agent45: native rank-1 mirror terminal exposes 12 source Passes; conditional 98.4375% uniform-field mirror ceiling

**6 November 2026 | independently replicated native episode audit plus an exact, explicitly conditional symmetry argument.** The original Aichi field is still **29/32 printed 60s** (ranks 23,25,28 missing) with **zero paper-qualified competitive games**.

## Independent true native terminal: identical printed 60s, one non-attacking opponent

The newly resolved original v8+Telepath+default-Confirm-false eight-arm experiment contains an actual pinned native terminal in `1:212:B:champion-reference`. This is a critical **mirror**. The opponent is original Aichi rank1, while the candidate `champion-reference` was constructed from that **same exact original rank1 roster object** in `simulation/evaluation/agent41-bilateral-v2-development.cjs`. An independent read-only guard in this audit also asserts the source and candidate **actual native resolved deck fingerprints match exactly**. Both are legal-size 60 in the published English-display roster representation. It is one independently shuffled physical mirror and offers no separate fixed-deck advantage.

| Verifiable native metric | Value |
| --- | --- |
| Frozen trial | `1:212:B:champion-reference`, seed **1084952875** |
| Original rank1 source | Seat **0**, **12 accepted PassTurnAction**, **0 AttackAction**, **6 non-Pass/non-prompt roots** |
| Identical rank1 candidate | Seat **1**, **9 PassTurnAction**, **4 AttackAction**, **11 non-Pass/non-prompt roots** |
| Candidate attacks | **Four Eon Blade**, global turns **13,17,21,25** |
| Candidate independently settled Prize changes | **1**, then **2**, then **0**, then **3**; sum **6** |
| Authenticated source attacks and Prize changes | **0 attacks**, **0 Prizes** |
| Native terminal | **110 accepted roots**, `finished=true`, `endReason=engine-game-end`, `winner=seat1`, remaining Prizes **[6,0]** |
| Exact public accepted-root SHA256 | `3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a` |
| Game reset/clock epochs crossing this root tape | **0** |

The candidate's attack at native root61 on turn13 took one Prize (6→5), root77 on turn17 took two (5→3), root93 on turn21 took zero (3→3), and terminal root108 on turn25 took three (3→0). The attack effects were completed by native Store through root109. Three first attacks have independently verified same-epoch source return roots; the fourth is terminal. The original source **chose no attack in twelve turns**, and its source turn22 action sequence played Radiant Eternatus and resolved an optional Ability `ConfirmPrompt` answer before passing. The confirmed `false` answer is exactly the earlier native decoder abort bridge. Counting that an 110-root native game finished is valid. Crediting the six-Price sweep to strategic superiority of one printed 60 is untenable: both sides used the identical printed 60, and the source policy could not attack a single time.

Neither twelve Passes nor six won Prizes establishes which alternative attacks were payable or tactically preferable. This report records actual choices and public damage/Prize effects. It does not inspect opponent concealed cards, assert that the source could have attacked, or validate full paper rules/clock. It still makes the developmental policy's lack of opponent competence conspicuous.

### Reproduction and archive

- Pinned Twinleaf gitlink **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, original prospectively registered eight v8 trial IDs and 128-root cap; no deck, actor, seed or decision-policy changes.
- **Whole workflow SUCCESS** [run 42287802920](https://github.com/FlareZ123/experiment-01/actions/runs/42287802920), job **128133056718**, existing manual `include_agent8_telepath_v5=true` and `abort_provenance_only=true`, step22 **5/5 passed** (1 eight-arm native, 4 pure positive/negative). Existing corresponding Agent32 Confirm step21 and artifact step23 also passed. This run's head **`a8d2879ffe465b672eb72a6169e00716734f3f10`** includes the source/candidate SHA identity guard.
- Archived raw comprehensive per-turn actions, actual native attack settlement and all eight attempted dispositions with atomic SHA256 sidecar inside [artifact 13537779033](https://github.com/FlareZ123/experiment-01/actions/runs/42287802920/artifacts/13537779033), `issue25-agent32-v8-confirm/agent45-mirror/agent45-v8-mirror-public-episodes.json` (21-day retention).
- Read-only exact root and settled attack packet parser: [`simulation/evaluation/agent45-v8-terminal-mirror-public-episodes.cjs`](../../simulation/evaluation/agent45-v8-terminal-mirror-public-episodes.cjs); [native test](../../tests/agent45-v8-terminal-mirror-public-episodes.native.test.cjs), [4 pure tests](../../tests/agent45-v8-terminal-mirror-public-episodes.test.cjs).
- **No hidden deck or opponent hand** is used to choose or score source actions. No native terminal qualifies as a competitive win. Full opponent competence and a valid paper 25-minute clock remain unproven.

## The more general conditional symmetry ceiling

A fixed candidate that is **identical to one of the published original field 60s** faces an unavoidable symmetric-mirror benchmark under the following explicit assumptions:

1. The candidate and exact-matching original use the **same decision policy**, or comparably optimal play, with the same information and available actions.
2. First-player/second-player and seat advantages are **fairly randomized and averaged** between the two sides.
3. The Top32 benchmark weights **each original ranked opponent equally** (1/32), while allowing every other matchup its optimistically maximum **100%** candidate win rate.
4. A tie is either scored as no win or resolved symmetrically, so for the equal-policy mirror `P(candidate win) ≤ 1/2`.

Swapping the labels of the two identical-deck, equal-policy players leaves the game distribution unchanged. Thus the probability that either side wins its mirrored matchup must be equal (subject to ties), at most one-half. With exactly one original-rank mirror and 31 maximally favorable other opponents:

`upper bound = (31 × 1 + 1 × 0.5) / 32 = 63/64 = 98.4375%.`

This is below **99.5%**, with a gap of **1.0625 percentage points**. It follows mathematically **under those assumptions**, independent of the outcome of this one 110-root game. Missing opponents that turn out to match the candidate exactly only lower the conditional ceiling. The authenticated 29 printed-original rosters have **no duplicates of the rank1 champion printing** except rank1 itself; the identity comparison includes category, printed name, set, collector number, language and physical copy count.

**Crucial limitation:** This bound is invalid if the candidate has a stronger decision policy than the original opponent, the tested policies/seat sampling are asymmetric, field ranks receive unequal weights, or mirror equivalence is based only on archetype rather than exact printed 60s. It is **not an unconditional impossibility theorem** for champion-reference against human players or for all strong decks. The current developmental common policy's seat symmetry and opponent competence are unqualified, so the result is a **methodological exclusion of using a single mirror sweep as evidence for the 99.5% target**.

The reusable exact multiset and conditional bound checker is [`simulation/evaluation/agent45-symmetric-mirror-uniform-ceiling.cjs`](../../simulation/evaluation/agent45-symmetric-mirror-uniform-ceiling.cjs), with six negative/positive tests in [`tests/agent45-symmetric-mirror-uniform-ceiling.test.cjs`](../../tests/agent45-symmetric-mirror-uniform-ceiling.test.cjs). A direct Python `Fraction` calculation separately verifies the exact rational bound `63/64` and percentages. **At this report checkpoint, the six newly authored pure mirror-bound tests are awaiting pinned CI**, though the arithmetic and 29-roster original identity scan were independently executed via actual Python and GitHub tool interpreters. The native game mirror SHA and 5/5 dedicated tests have already completed in CI.

## Implication for future fixed-60 selection

Continue to keep original rank1 `champion-reference` as a **control deck**, and use this 110-root native terminal as an end-to-end **liveness canary** for genuine Confirm resolution and physical Prize completion. An exact-mirror field benchmark needs randomized seats and a credible acting policy before it can inform relative strength. A source side that takes twelve Passes without any attack needs an owner-visible counterplay audit and substantive policy repair before its 6–0 loss can be treated as strategic data. Independent fixed-60 candidates such as Apex Alchemy remain unqualified until real natural games progress under the same more competent source policy.

**Qualification remains unchanged: 29/32 authentic printed source inventories, 0 competitive games, no final fixed 60, and no demonstrated 99.5% win rate.**
