# Rank 11 qualification packet: published Absol/Garbodor versus unchanged New Moon Lockbreaker

**Agent 13, 18 October 2026.** This is a decision-quality and printed-effect **mechanical evidence packet** for one fixed source opponent and one unqualified challenger. It is **not a competitive-match result**. All games listed below are genuine source-dealt pinned Store executions under a specified weak automated policy. The benchmark is a fixed 60 played unchanged against the entire Top 32.

## Fixed opponent and candidate

- Source opponent: Aichi Open League 2026 **rank 11, Wataru Yano**, Absol/Garbodor. Full historical 60 from [published source manifest](../../full-decklists.json). Its first-turn Tool-bearing Garbodor route uses genuine Battle VIP Pass, Oranguru V Back Order, Forest Seal Stone/Star Alchemy and Boost Shake actions.
- Candidate: [New Moon Lockbreaker v1 exact 60](../../../als/new-moon-lockbreak-english-proxy-60.json) with English mechanics proxy printing; source printing/legal-errata identity certification is still incomplete. It is a proposed lock-resistant challenger to the rank-1 Shadow Rider reference, not a demonstrated superior candidate.
- Simulator: Twinleaf submodule `vendor/twinleaf` at pinned SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; source research profile `rank11-autonomous-boostshake-v1`. Paper rules are externally governed by the supplied Advanced Player's Rulebook.
- All detailed New Moon policy replays below use source rank11 in physical seat **A (0)** and the candidate in **B (1)**. The first-source-positive replay is seed `1244180408`, **rank11 actually first** by engine first-draw-log verification and **selected retrospectively**, so do not include it in any prospective game-rate denominator.

## End-to-end authenticated tactical slice

The source first-turn automatic policy executes **eleven legal Store actions** from its own initial hand and legitimate search prompts, to equip Benched Garbodor while rank11 goes first. [Original source automatic regression](../../rank11-autonomous-opponent-policy.md), [CI 39090207009](https://github.com/FlareZ123/experiment-01/actions/runs/39090207009).

An opt-in New Moon candidate policy identifies a **real held Field Blower** and a public Tool-equipped Garbodor, removes the Tool through an actual owner-valid target-selection prompt, and conditionally plays **Lillie's Determination** when its own hand falls to two cards and the Supporter is unused. The two Field Blower plays are on candidate turns **2** and **12**, with Lillie on turn2. It never reads the opponent's concealed hand or Prize cards. [Candidate policy and original response](../../rank11-newmoon-blower-lillie-real-hand-sequence.md).

A subsequent read-only effect audit verified a genuine `ChooseAttackPrompt` reference to the exact **Gengar & Mimikyu-GX TEU** source printing and matched real Store copied-attack declaration and printed **Poltergeist** `50 ×` opponent Trainer-card count for **three attacks**:

| Candidate global turn | Source Trainers in hidden physical hand (read after attack choice) | Printed base | Printed defending Active | Source KO and candidate Prizes |
| --- | ---: | ---: | --- | --- |
| 8 | 4 | 200 | Crobat V, 180 HP | KO, +2 |
| 48 | 9 | 450 | Mega Absol ex, 280 HP | KO, +3 |
| 50 | 10 | 500 | Mega Absol ex, 280 HP | KO, final Prize |

The first nonterminal attack is followed by the source's *real next turn 9* playing another Mega Absol ex, announcing Back Order, playing Float Stone and Forest Seal Stone, then Pass. The second nonterminal copied attack is followed by source turn49 attaching Darkness Energy and declaring **Claw of Darkness**. The third copied attack ends the untimed engine game. A read-only effect-observer control yielded byte-identical root action ledger, declarations, selected decisions, and terminal result with observer off/on.

Full source inputs, prompt ordinals, print counts, observed effect windows, opponent response and artifact checksums: [Agent13 copied Poltergeist qualification report](../../agent13-rank11-blower-lillie-printed-poltergeist-effect.md), successful [compiled CI 39173019118](https://github.com/FlareZ123/experiment-01/actions/runs/39173019118), exact archived artifact ID **12152683797**. The baseline source-positive seed with generic candidate or Blower-only candidate had **zero** candidate Store attacks and source engine victory; the Blower+Lillie candidate reached a terminal engine victory at **300 root actions / 50 global turns** under the *same first-turn source opener*. Policy-specific outcome reversal is real for the pinned engine, but entirely unqualified as paper-match strength.

## Source-policy exposure beyond the selected positive control

The [128-seed source-dealt held-Boost-Shake replay](../../rank11-direct-shake-decorrelated-both-start.md) used decorrelated engine seed streams and found authentic rank11 actual-first and actual-second openings, while recording no-opportunity trials and one search-target abort. Those are source-opening capability observations against the fixed rank-1 reference, not this candidate's win-rate trials. [Candidate responses against four previously selected held-Shake seeds](../../agent2-rank11-heldshake-candidate-response-16arms.md) observed other early weakness, including failure to record candidate attacks in source-second (candidate-first) selected seeds. Those are not independent published-hypothesis tests.

An **opt-in, prospectively generated** candidate policy experiment `simulation/twinleaf/newmoon-rank11-proactive-lillie-factorial.cjs` is underway and is separately registered by code. It predeclares fixed source/candidate 60s, six SHA-derived seeds `deriveSlotSeeds(20261019,'pilot',11,repeat).B` with repeat indices 0..5, all retained, comparing generic, Blower-only, proactively low-hand Lillie and both interventions. Source-positive seed 1244180408 is reported separately as a **retrospective positive control**. Initial manual CI 39174187678 failed **before any trial**, because the caller used an unsupported seed phase string. The corrected documented `pilot` phase was committed before any prospective game observation. Record substantive outcomes separately once source-backed and never count policy arms as independent games.

## Qualification ledger

| Critical gate | Current disposition |
| --- | --- |
| Printed exact rank11 source 60; fixed challenger 60; actual start and Prize dealing | **Observed** for reported source seed; English-mechanics candidate Japanese print equivalence still provisional |
| Own-information autonomous source Tool-Garbodor opening | **Observed** for one retrospective control and other source-dealt openings; optimal decision and full opportunity coverage unresolved |
| Own-hand/public-board legitimate candidate Item and Supporter response | **Observed** for one retrospectively chosen source-positive seed; optimal connector/resource opportunity costs unqualified |
| Copied-attack source printing, true Store declaration, immediate printed damage and KO/Prize shift | **Observed** for three effect windows in a single game; full paper reducer/Weakness/Ability interaction remains independent gate |
| Opponent actual next turn after copied attack | **Observed** for two nonterminal copies; **next-turn source decision policy not qualified**, including legal alternatives |
| Observer noninterference | Same-seed root-ledger/terminal digest **equal** with/without read-only effect telemetry; not a global source graph or speculative AI safety proof |
| Hidden-information-safe, independently validated complete decision policy for both sides | **Open**; original pinned bot may inspect hidden deck ordering during speculative choice, and source turn pressure is weak |
| 25-minute Swiss best-of-one clock, both actual start orders, representative seed cohort, all 32 exact lists | **Open**; event clock unmodeled; ranks 23/25/28 exact 60s missing |
| Independently qualified competitive games against rank11 | **0** |
| Demonstrated 99.5% win rate across Top32 with one unchanged 60 | **No** |

**Immediate qualification priority:** improve genuinely source-reachable rank11 opponent pressure after the first candidate copied attack, demonstrate a nontrivial owner-information-correct legal counterchoice and ensuing candidate response, and test predeclared matched start-strata without conditioning on wins. Preserve failures and exact source 60. Do not promote the untimed engine win to a tournament result.
