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

The reusable exact multiset and conditional bound checker is [`simulation/evaluation/agent45-symmetric-mirror-uniform-ceiling.cjs`](../../simulation/evaluation/agent45-symmetric-mirror-uniform-ceiling.cjs), with six negative/positive tests in [`tests/agent45-symmetric-mirror-uniform-ceiling.test.cjs`](../../tests/agent45-symmetric-mirror-uniform-ceiling.test.cjs). A direct Python `Fraction` calculation separately verifies the exact rational bound `63/64` and percentages. **The six exact printed-mirror-bound tests passed in pinned CI** as part of step22's **11/11 green** test set in [workflow run 42289380748](https://github.com/FlareZ123/experiment-01/actions/runs/42289380748). The arithmetic and 29-roster identity scan were independently reproduced through Python Fraction and GitHub tool interpreters. The native game mirror SHA and 5/5 dedicated tests have already completed in CI.

## Implication for future fixed-60 selection

Continue to keep original rank1 `champion-reference` as a **control deck**, and use this 110-root native terminal as an end-to-end **liveness canary** for genuine Confirm resolution and physical Prize completion. An exact-mirror field benchmark needs randomized seats and a credible acting policy before it can inform relative strength. A source side that takes twelve Passes without any attack needs an owner-visible counterplay audit and substantive policy repair before its 6–0 loss can be treated as strategic data. Independent fixed-60 candidates such as Apex Alchemy remain unqualified until real natural games progress under the same more competent source policy.

**Qualification remains unchanged: 29/32 authentic printed source inventories, 0 competitive games, no final fixed 60, and no demonstrated 99.5% win rate.**


## Follow-up: all twelve actual source Passes lacked an engine-accepted *visible printed attack*

The first public root census established that the source did not attack. A separate actual-Store post-choice investigation now distinguishes **an attack decision failure** from **not having enough attack-ready resources**. The read-only observer activates after the original source actor has already decided to Pass, then attempts the Active Pokémon's visible printed attacks and attached-Tool attacks in detached, fully deep-cloned native Stores. The original game actions are never influenced by clone results.

**Native finding:** **12/12 source Pass roots were probed, 0 engine-accepted printed/Tool attack announcements, 0 probe errors**, and the authentic original complete 110-root public action tape SHA remained **exactly unchanged** (`3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a`). The observed Active and public attached Energy at each Pass were:

| Original source turns | Actual Active printing | Public attached Energy | Native-clone tested attacks | Native accepted |
| --- | --- | --- | --- | ---: |
| 2,4,6,8,10,12 (6 Passes) | **Marshadow UNB** | **0** | Red Knuckles | 0/6 |
| 14 (1 Pass) | **Tapu Lele-GX GRI** | **0** | Energy Drive; Tapu Cure-GX | 0/2 |
| 16 (1 Pass) | **Tapu Lele-GX GRI** | **1 Psychic Energy MEE** | Energy Drive; Tapu Cure-GX | 0/2 |
| 18,20,22,24 (4 Passes) | **Trevenant & Dusknoir-GX SMP** | **1 Psychic Energy MEE** | Night Watch; Pale Moon-GX | 0/8 |

The tests cumulatively attempted **18 exact visible printed attack announcements**, with no native acceptance. The source's twelve Passes therefore **do not show that it deliberately skipped an engine-affordable printed attack**. The sharper observed failure is **inability to establish an attack-ready Active before the candidate's four Eon Blade attacks took six Prizes**. Whether a better manual retreat, switch, bench acceleration, draw or Supporter line existed remains **unknown**; the audit did not exhaustively enumerate those alternative moves or test paper strategic competence. A lack of engine acceptance for the enumerated attacks is also not a full paper-rules certificate, and effects granting unprinted attacks may be omitted by the generic probe.

**Verification:** [entire pinned manual CI 42289380748](https://github.com/FlareZ123/experiment-01/actions/runs/42289380748) succeeded, job **128138498308**, separate source Pass step23 **5/5 passed** (1 original native eight-arm replay, 4 pure observer controls). The preceding native mirror plus new pure mirror-bound step22 **11/11 passed**, and archive upload step24 succeeded. Actual original source&candidate resolved roster SHAs matched. The observer captured exactly one genuine root Store and rejected speculative secondary Store actions in pure tests. Raw all-twelve Pass results and unchanged root-tape evidence are saved with a SHA256 sidecar in [artifact 13538912937](https://github.com/FlareZ123/experiment-01/actions/runs/42289380748/artifacts/13538912937), path `issue25-agent32-v8-confirm/agent45-mirror/agent45-mirror-source-pass-attack-probe.json` (21-day retention).

[Observer source](../../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs), [pure regression](../../tests/agent45-rank1-mirror-source-pass-native-probe.test.cjs), and [native frozen-root eight-arm regression](../../tests/agent45-rank1-mirror-source-pass-native-probe.native.test.cjs).

**Refined research priority:** Examine source-owner *resource establishment* over these same physical turns: whether a legal Bench Energy acceleration, Energy attachment, valid retreat, draw or prior setup line was observable and achievable under fair information and quota constraints. Avoid treating a Pass as a tactical error when the Active's printed attacks were all unaffordable in the identical pre-Pass native Store.

## Native-card semantic discrepancy at original source turn 16: Tapu Cure-GX

**Verified direct board witness, 6 November 2026:** Source seat0 had Active **Tapu Lele-GX GRI** with exactly **one attached Psychic Energy MEE** on its actual turn16 Pass, action ordinal76. From the supplied full card database, Tapu Lele-GX GRI60's **Tapu Cure-GX costs one Psychic**, and its printed instruction is to **heal all damage from two of your Benched Pokémon**. The authentic owner has four publicly present Benched Pokémon: **Trevenant & Dusknoir-GX SMP**, **Tapu Lele-GX GRI**, **Girafarig LOT**, **Latias ex SSP**; **each has zero damage**, and the Active also has zero damage. That exact no-damage board witness is attached to the already independent actual-Store source Pass audit. The owner has used zero prior attack roots, so it has not naturally consumed a GX attack through those roots.

In the pinned vendor Twinleaf implementation at gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, file `ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx.ts`, the `Tapu Cure-GX` attack reducer explicitly checks whether **any own Bench or Active Pokémon has nonzero damage** before checking the GX quota. It throws `GameError(GameMessage.CANNOT_USE_POWER)` if neither has damage. This extra **no-damage guard exactly matches the witnessed all-zero board**, explaining a native refusal without attributing the refusal to insufficient Psychic Energy. It might not be the only native rejection condition, but the guarded condition is demonstrably true on this turn.

**Possible paper divergence, not yet definitively ruled:** The supplied Advanced Player's Rulebook section **II.A About Card Text** says attacks may be used even when parts of their instructions cannot apply, except where conditional effects explicitly depend on preceding actions. The supplied Tapu Cure-GX card text itself does not specify a minimum prior damage or require a Bench Pokémon with damage to announce the attack. Taken together these indicate **a possible Twinleaf implementation restriction beyond the printed paper rule**; a formal card-specific Pokémon ruling was not independently located, so do not categorically label the engine defective or promote this as a fully proven paper-legal attack. A native “unaffordable attack” census is therefore **not proof that all original source Passes were required by paper rules**.

**Exact validation:** [workflow 42291046167](https://github.com/FlareZ123/experiment-01/actions/runs/42291046167), pinned Store job **128144239954**, owner Pass audit **step23 PASS 5/5**, mirror baseline **step22 PASS**, unchanged source native 110-root SHA256 `3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a`. The aggregate workflow is **RED on independent step25**, `Test owner-only Radiant and Articuno ability decisions with legal VMAX search`. Red whole job must not be described as fully successful. Step24 successfully archived all genuine original Pass owner board damage at turn16 alongside unmodified root witness. The earlier whole [workflow 42289380748](https://github.com/FlareZ123/experiment-01/actions/runs/42289380748) was fully green for the previous source Pass audit.

**Implication:** Preserve the distinction between **“native clone rejected the attack”** (proven), **“printed Energy cost unmet”** (false for Tapu Cure-GX at turn16), and **“card effect had damaged targets”** (false on the exact public board). Do not use this source Pass as evidence that the deck was inevitably unable to announce an attack in paper Expanded. The complete 110-root native result remains a developmental liveness witness with zero competitively qualified wins.
