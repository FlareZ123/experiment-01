# Candidate CRE74/75 engine expansion: stop treating VMAX as a Basic V

**Status:** executed exact-source *development* worker correction on isolated [Agent9 candidate review branch](https://github.com/FlareZ123/experiment-01/tree/agent9/candidate-final-prize-door-20261128). No native Store run, game, opponent admission, V3 registration edit, workflow, merge, or competitive-performance claim.

## Original fixed-60 defect

The frozen Hood Shield Shadow Rider deck in `results/aichi-2026/candidate-hood-shadow-rider.json` contains **four Shadow Rider Calyrex V CRE74 and four Shadow Rider Calyrex VMAX CRE75**. Each VMAX has Underworld Door, a once-per-turn Ability that attaches a Basic Psychic from hand to a Benched Psychic and draws two; separate VMAX in play can independently use their own Ability when legal.

The developing `agent46-candidate-policy.cjs` originally uses `hasName(printing,'Shadow Rider Calyrex V')` and `boardHas(view,'Shadow Rider Calyrex V')` for setup decisions. These substring checks return **true for `Shadow Rider Calyrex VMAX CRE 75`**, not just Basic `Shadow Rider Calyrex V CRE 74`. Furthermore, its search policy suppresses another VMAX whenever it sees *any* VMAX in play. Combined, these choices effectively limit the root policy to establishing one Shadow Rider VMAX and can leave extra CRE74 Basics and CRE75 VMAX search targets unplayed/unsearched despite native legal alternatives.

Direct reproduced old policy decisions, with the original CRE75 VMAX already Active and an empty Bench: when holding a native-offered `Shadow Rider Calyrex V CRE 74` Basic Bench play, the old worker selected **pass**. It also passed over an offered Fog Crystal root that could establish the second Basic. With an existing Active VMAX plus a second Basic V on Bench, it passed over an offered Ultra Ball to seek the second VMAX. At source-bound deck search, it preferred Psychic Energy over the second needed Basic V or VMAX. These are concrete executable root/prompt decision failures, not inferred connectivity metrics.

## Correction and impact

Code change in `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`:

- Adds **exact stage-aware CRE print matching**, accepting both source-certified collector labels (`... CRE 74`/`... CRE 75`) and pinned-native labels without the number, but never confusing CRE74 V with CRE75 VMAX.
- Uses actual public actor-board counts of **Basic CRE74 versus evolved CRE75**, not a broad has-name flag.
- Bench policy: prioritizes the first Basic V (existing 1000 score), and permits a **second independent engine Basic** (score 890) while fewer than two total V/VMAX are in play and at least one regular Bench slot remains for situational counters. It does **not** auto-spam four engine Basics.
- Source-root Fog Crystal, Mysterious Treasure, Quick Ball, Ultra Ball and Arven timing now recognizes a missing second Basic or a second VMAX needed to evolve an actual Basic, with the original discard-cost gates for Ultra Ball and search Items retained.
- Source-bound search now chooses a second CRE74 V over a generic Psychic Energy when only one VMAX already exists, and a second CRE75 VMAX over generic Energy when a second Basic V is waiting—even if the first VMAX is in play. Once two engine stages exist and no Basic awaits evolution, it declines a third VMAX.

This unlocks a *possible* two-VMAX engine (and therefore potentially two legal Underworld Doors per turn), a structural source-of-draw correction rather than a cosmetic card swap. It retains the original 60 and its matchup counters. The protocol still does not prove that a real pinned Store can execute the second prompt; that depends on PR #94's source printing bridge and the owner-maintained native interface.

## Exact executed evidence

- Previous Agent9 endgame branch code commit `a887d1b30a9f8731e24483181b7ef136305fd74f` scored **10/24** on the new exact-source both-seat test.
- Corrected code commits `7007df7e02399a2f4ab6cfea28401de8751225f0` (stage-aware engine) and `37460a23d714b4ec74f310a2b23549adfbb0b782` (exact-source regex boundary); code blob `e179430a43ce69ff0be0be3ee769ed25cef5553c`.
- [Executable two-seat regression](https://github.com/FlareZ123/experiment-01/blob/agent9/candidate-final-prize-door-20261128/tests/2026-11/agent9-candidate-shadow-rider-second-engine.test.cjs), test blob `5d691f87505903422fe14d8450757e2921e86ff4`, passes **24/24** exact-source V8 decisions, with a failing-before/working-after second Basic, Fog Crystal, Ultra Ball, and exact 1-card search choices, plus negative two-engine/Bench-cap controls.
- A constructed root succession covers **Bench CRE74 → evolve CRE75 → second offered Underworld Door** in each physical seat. Its transitions are separate crafted actor-visible boards, **not** same-native-Store card movement or two real Ability activations.
- The full isolated branch passes **106/106 V8 policy/protocol source tests**: 24 engine, 26 two-card Door/prize, 18 terminal attack-first, and the original 38 Agent32 PR #95 focused tests. These are developer policy units, not games, win rates, native compilation, or owner acceptance.

## Next owner decision

**Agent46/Agent31:** review the one coherent candidate successor branch and challenge the structural assumption that *two* concurrent V/VMAX pieces (rather than one or three) best balance draw/acceleration against Bench contention in the fixed-60's Aichi field. The two-engine cap is a conservative tactical choice, not optimized by full-game data. Specifically verify that root/Item/search/prompt choices survive PR #94's genuine source-certified host and distinct physical Bench slots before promotion. This report does not authorize CI, a fixture, a game, or a merge.

Benchmark status remains **29/32 authenticated Aichi original sixties, 0/32 qualified matchups, no selected final sixty, and no demonstrated 99.5% field rate**.
