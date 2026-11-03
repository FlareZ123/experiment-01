# Agent 14: physical post-Claw response, accepted Counter Catcher, and native action-cap censoring (3 November 2026)

**Status: archived, repeated-source-deal native developmental comparison. Zero paper-competitive-qualified games and no demonstrated win rate.** All observations in this document concern the **one retrospectively chosen** 2171744612 physical opening for the **New Moon Lockbreaker v1** challenger against the exact rank-11 Mega Absol/Garbodor original, with two separately selected counterfactual interventions plus baseline. The distinct champion-reference deck was run in the same six-arm registered suite but must not be collapsed with the New Moon full-deal pair.

## Reproducible evidence

- Frozen native registration: [`agent14-post-claw-native-v1-20261103.json`](registrations/agent14-post-claw-native-v1-20261103.json), registration Git blob `cb21990df2922ec0c488c47d57429cf625c109ab`.
- Source: [six-arm runner](../../simulation/evaluation/agent14-original-rank11-postclaw-six-native.cjs), [symmetric opt-in response adapter](../../simulation/twinleaf/agent14-behind-counter-response-native.cjs), [pure opportunity tests](../../tests/agent14-post-claw-response-opportunity.test.cjs), and [adapter tests](../../tests/agent14-behind-counter-response-native.test.cjs).
- Compiled [manual GitHub Actions run **41585051181**](https://github.com/FlareZ123/experiment-01/actions/runs/41585051181), completed **success** on 3 November 2026 at 05:40 UTC; artifact [**13208060321**](https://github.com/FlareZ123/experiment-01/actions/runs/41585051181/artifacts/13208060321), 306,811-byte ZIP, SHA-256 `2ada428ca24da23f4c533be36d99c5eb309a96d6e97e8b5d308b9d6a0dfdc199`.
- ZIP contains `agent14-original-rank11-postclaw-native-six.json`, 9,344,900 bytes, SHA-256 `6f334b4f540b8b73be3e70c7d41b3c23afabd91030bdad0c4d264bc5b7c78a79`; the separate [independent archive auditor](../../scripts/aichi-rank11-postclaw-native-archive-audit.cjs) checks these bytes, original physical deals, native roots, prompts, opposing Active changes, later source decisions, and censoring.
- Engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; frozen selected joint-v2 profile, candidate seat 0, source seat 1, source actually went first. **All three modes have identical full physical deal fingerprint** `c71a31bedacad7631d1f1923f6af67163ca55fe1a1ab555547b79376c530c643`, source deal fingerprint `9729f263853796e3774f787075edfbea1742dfa225c91bfdf030718f90f4bdee`, first source own-hand hash and native first-player selection. No mulligan compensation occurred. Champion-reference's distinct full physical deal is `0b1f1a9b6139e62d16fe1206aee474d69ee8f53d9b7dc0614ec9548ab8508724`.

## One exact physical fork, three actually selected responses

| Mode | Native selected root at candidate T32 | Post-response source Active | Original source attacks through end | Subsequent outcome |
| --- | --- | --- | --- | --- |
| **observe** | Squawkabilly ex Bench, Pass | Mega Absol ex with 3 Darkness | 8 Terminal Period, **5 Claw of Darkness** | Source seat 1 wins via native game end at turn 39; actions 186; Prize counts `[6,0]` |
| **catcher** | **Counter Catcher PAR**, target prompt, Squawkabilly ex Bench, Pass | **Squawkabilly ex without Energy**; 3-Darkness Mega Absol moves to Bench | 8 Terminal Period, **1 Claw of Darkness** | **260-action cap at turn 64; unfinished, no winner**; Prize counts `[6,5]` |
| **lillie** | **Lillie's Determination M1L**, shuffle prompts, Gengar & Mimikyu-GX Bench, Pass | Mega Absol ex with 3 Darkness | 8 Terminal Period, **4 Claw of Darkness** | Source seat 1 wins via native game end at turn 37; actions 181; Prize counts `[6,0]` |

All 8 original-source Terminal Period attacks and the first Claw precede the fork in each New Moon mode. Source's first Claw was the settled T31 attack ordinal 139. At T32 the acting New Moon controller had 6 Prizes remaining, the rank-11 source 5, the printed Counter Catcher and Lillie's Determination both in owner-visible hand, and three source Benched targets. For both treatment modes, the real native `canPlay` check and Store action succeeded once (`nativeEligible=1,accepted=1,rejected=0`). The **observe** policy recorded five eligible *root evaluations*, rather than five different experimental deals.

**Counter Catcher physical witness:** the opponent's post-prompt Active at candidate T32 was Squawkabilly ex, attached Energy 0. Their powered Mega Absol ex remained on the Bench with three Darkness Energy. On the immediately following source turn T33 the native selected root was **PassTurnAction**, whereas in the control it was **AttackAction**. Later source turns also passed while the trapped Squawk remained Active; no terminal win arose before the action cap. These are native physical observations, and they are materially stronger than a speculative `canPlay` or mere action-count delta.

**Lillie physical witness:** real `ShuffleDeckPrompt` was resolved after native Supporter selection; the T32 board then had Gengar & Mimikyu-GX on the New Moon Bench, with seven cards left in the owner's hand at Pass. The source still retained its powered Active Mega Absol and selected **AttackAction** at T33. The extra Bench Pokémon and new hand did not yield an observed attack or Prize rescue before the native source win.

## Why Lillie's four attacks lost faster than the five-attack control

The card pool's **Gengar & Mimikyu-GX (Team Up 53)** carries the printed **TAG TEAM three-Prize KO rule**. The accepted Lillie line put this 240-HP Pokémon onto New Moon's Bench on T32 with no attached Energy. After the T33 Claw knocked out Unown, this newly Benched TAG TEAM was promoted. The original source's next **Claw of Darkness T35** knocked out that Gengar & Mimikyu-GX, and the native Prize state changed **`[6,4] → [6,1]`**, a **three-Prize swing**. At T37, another Claw took the final Prize.

Compare the settled per-Claw source Prize gains:

- **observe:** `[1,1,2,1,1]` (T31, T33, T35, T37, T39). The two-Prize victim at T35 was Squawkabilly ex.
- **catcher:** `[1]` (T31); the ensuing turn-33 source pass and action cap make later payoff **censored**, never a win.
- **lillie:** `[1,1,3,1]` (T31, T33, T35, T37). The three-Prize victim at T35 was Gengar & Mimikyu-GX.

Every native Claw had a one-card opponent-hand `ChooseCardsPrompt` (minimum 1, maximum 1, one actual selected card) and a settled Prize transition. This is a concrete **Prize-liability regression**: a Supporter that native-played and drew cards also caused the autonomous policy to expose a three-Prize target without an attack payoff. A planner that scores only draw volume, card access, accepted Supporters or fewer opponent attacks would misrank this line.

## Prize-chain follow-up: Lillie's four attacks accelerated the source victory

Printed Gengar & Mimikyu-GX (Team Up 53) yields **three Prizes** when Knocked Out. Lillie's native-accepted draw line placed it on the New Moon Bench at T32 with no Energy. The source knocked out Unown with Claw T33, then the promoted Gengar & Mimikyu-GX with Claw T35: exact Prize state **[6,4] to [6,1]**, a three-Prize KO. T37 took the final Prize. The comparison has distinct per-Claw source Prize gains: observe **[1,1,2,1,1]** (T31–39); Catcher **[1]** (later game censored at action cap); Lillie **[1,1,3,1]** (T31–37). Each actual Claw had a native one-card opponent-hand ChooseCardsPrompt with one selected card. This is an observed **three-Prize Bench liability caused by an otherwise successful draw play**, and shows why fewer opponent attacks or more accepted Trainers is a poor proxy for game performance. No competitive result follows.

## Hidden weakness of the pre-fork source-policy evidence: eight legal zero-payoff Terminal Period attacks

The supplied card database identifies **Mega Absol ex M1L 86**, whose **Terminal Period** attack knocks out the opposing Active Pokémon **only if it already has exactly six damage counters** (60 damage). The frozen native archive separately records source Terminal Period at **T15, T17, T19, T21, T23, T25, T27 and T29**, each against **Klefki with 0 damage** before and after. The source attacker had **two Darkness Energy** attached, sufficient for Terminal Period but below the three Energy needed for Claw of Darkness. Every one of those eight attack declarations left both Prize counts at `[6,6]`.

This is a definitive **zero immediate damage and Prize payoff** for those eight settled attacks. Because Claw of Darkness was unavailable on the observed two-Energy board, the mere choice to use Terminal Period is **not itself proof of a tactical misplay**. However, spending eight turns at that state without improving the required Energy count is a serious source-policy competence diagnostic. The native trace's eight accepted attack declarations must **never** be advertised as eight damaging or strategically consequential attacks. The independently rerun auditor now verifies all eight target/board/Prize nonchanges in all three arms.

## Critical counter-evidence: the source's trapped turns were a policy failure

The source-owner native observer `sourceOwnerPostPassMobility.observations` captures **16 opponent Pass roots after Counter Catcher**: source turns **33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61 and 63**. Every one records **at least one Float Stone** and **one Guzma** physically held in the *source owner's own hand*. A powered Mega Absol ex with **three Darkness Energy** remained on that owner's Bench.

On T33, T35 and T37, the source's Active **Squawkabilly ex had zero Energy, no Tool, and a printed one-Energy Retreat Cost**. The archived own-hand gate reports one **Float Stone**; the card database's `bw9-99` printing says the attached Pokémon **has no Retreat Cost**. Under the Advanced Player's Rulebook B-02, even historical Tools with `Item` printed at the top are **Pokémon Tools**, with one per Pokémon, and normal B-02 attachment is allowed when the slot is empty. Therefore each of those three turns presents a **strong apparent zero-Energy escape sequence**: attach held Float Stone to Active Squawkabilly ex, retreat for zero Energy, promote the benched powered Mega Absol ex. An independently validated native legal-action transaction remains necessary to rule out any undisplayed Tool-play or retreat restrictions; the public board shows no obvious such lock.

By source T39, the actual Squawkabilly ex Active had **Muscle Band attached**. It remained attached through T63; the source accumulated **up to three unused Float Stones** in hand. The one-Tool rule removes the simple Float Stone route without an intervening Tool-removal action, and the source instead passed **13 more times**. The continued Guzma holding indicates a separate **potential Supporter-based switch**; verify the actual Supporter quota, legal target, and relevant player-level lock before calling it paper-legal.

**Correct interpretation of the Catcher outcome:** the first turn's Counter Catcher disrupted an automated attacker, but the 16 repeated native Passes primarily expose the **source's own mobility-selection deficiency**. The unfinished 260-action terminal cannot support a forced-lock, matchup-dominance, or field-win claim. The paper-valid float-retreat and Guzma responses are the first adversarial continuations the general bilateral release must be able to perform.

## Interpretation and limitations

1. The printed Counter Catcher Prize condition **6 > 5** and opponent Bench presence were visible and valid at the fork, and the native prompt selected the observed target. Full paper legality still requires independent confirmation of any persistent lock effects and payment, and the native Store is known to accept certain paper-invalid interactions elsewhere.
2. The two independent **within-New-Moon** comparisons share one exact physical deal and selected joint-v2 policy. Their outcomes are not six independent wins, field-level evidence, or randomly selected prospectively held-out games. Different candidate 60s have different full physical deals, even with the same source fingerprint, so **cross-candidate causal claims are excluded**.
3. Counter Catcher demonstrates **tempo denial and a policy-competence gap**, not a winning line. A 260-action cap under an untimed engine cannot be scored as win, draw, or official 25-minute paper match outcome.
4. Lillie's successful native Supporter draw does not by itself improve the line. The policy still passed instead of delivering a selected paid attacker after the shuffle. This is a precise counterexample to using accepted Trainer counts as a performance metric.
5. Neither intervention is the finally selected common bilateral policy. Their after-Claw owner-visible gate remains a **diagnostic opt-in**, which must compete with search, draw, Energy, available attacks, lock effects and Bench occupancy in a generic owner-root planner. A single targeted post-Claw card hook does not establish general rank-11, much less 29-source, competence.

## Decision-relevant next action

Send this verified fork to the shared policy integration stewards as a **positive native control** for generic owner-turn option comparison: on the same owner-visible T32 state, recognize both affordable options, compare their strategic opportunity costs, select one, settle the correct native prompt and payments, and track the opponent's immediate response. Keep the baseline and the Lillie negative control, plus the capped Counter Catcher trace. Test transfer on preregistered independent physical deals before promoting anything to the immutable bilateral release. Do **not** make rank-11-specific forced-Catcher logic the general integration.

**Project-wide boundary:** 29/32 authenticated original opponent sixties (missing ranks 23/25/28); no competitively qualified games; no selected fixed 60; no demonstrated 99.5% field win rate.
