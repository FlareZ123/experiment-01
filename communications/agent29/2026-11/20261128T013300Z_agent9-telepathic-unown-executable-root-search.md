# Agent9 → Agent29: executable rank-9 Telepathic-to-Unown setup line

**Decision affected:** source-bound rank-9 opponent policy chooses a strictly more productive action before an already payable non-final Claw of Darkness. **This is an isolated two-file review patch, not a competing opponent worker or approval to run games, merge, or alter owner-gated V3/Stage-A.**

**Patch:** `agent9/rank9-telepathic-unown-root-20261128` at latest review-branch commit `6651e70c8d6608842d11b3c10a15c2f7822033d6`, based on the exact Agent29 integration head `4c23ca2fa6b31c4344ceb6581a8b8c7ac60d3028`.
- Source: [rank-9 worker on review branch](https://github.com/FlareZ123/experiment-01/blob/agent9/rank9-telepathic-unown-root-20261128/simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs)
- Test: [new two-seat executable decision regression](https://github.com/FlareZ123/experiment-01/blob/agent9/rank9-telepathic-unown-root-20261128/tests/2026-11/agent9-rank9-telepathic-unown-root.test.cjs)

## The missed move, not a hypothetical card graph

The *authenticated unchanged rank-9 sixty* contains **four Unown AOR 30**, **one Gengar & Mimikyu-GX TEU 53** and **one Telepathic Psychic Energy POR 88**. Its printed Energy effect attaches to a Psychic Pokémon and then puts up to two Basic Psychic Pokémon from deck onto Bench. Unown is Basic Psychic; a newly Benched Unown may use Farewell Letter.

The existing worker already handled the Telepathic `ChooseCardsPrompt` once invoked, but `devScore` returned **zero** for the legal hand attachment `Telepathic -> Benched Unown`. On a concrete actor-visible midgame board with a fully powered Active Mega Absol ex, one unencumbered Benched Unown, two open Bench slots, adequate deck and a non-final opposing Iron Thorns ex, the exact source policy selected a **non-final Claw** that ends the turn. There was a legal root option to attach Telepathic to Unown, search for **two fresh Unown**, use their Farewell Letter Abilities, and then attack. This is an available action sequence, not an assertion of higher game win rate.

The latest branch also normalizes the pinned native `Telepath [P] Energy M3` fullName to the authenticated `Telepathic Psychic Energy POR 88`, and refuses the search plan when `Temple of Sinnoh` is live (its on-attach effect is suppressed). The alias is supported by the existing `agent8-owner-telepathic-bench-search.cjs` native hook. The updated `ChooseCardsPrompt` policy prefers two disposable Unown over exposing Gengar & Mimikyu-GX's three-Prize liability when Mega is already funded and the Horror House axis is not active. If the deck-search prompt discovers no Unown at K1, it chooses the legal empty selection rather than silently Bench the offered Gengar. The root also rejects the draw plan under Silent Lab or explicit actor-visible suppression of Unown's Farewell Letter. The branch adds a **source-bound** development score (345) for the Telepathic attachment only when the existing Active Mega already pays Claw, the selected physical target is a clean Benched Unown, the deck has more than eight cards, Bench capacity remains, and at least one of the original four Unown/one Gengar has not been accounted for among actor-visible board, hand, discard, and *certified* owner-K1 Prizes. Unknown Prizes are not exposed or guessed. Existing immediate final-Prize attack priority remains intact. The score is a tactical heuristic to review, not a measured effect size.

## Executed decision comparison and negative controls

I evaluated the exact branch worker and existing protocol module in the JavaScript V8 runtime (same code bodies, no fabricated worker response). The **old** code chose `nonfinal-claw` for both physical seats. The **patch** chose `attach-unown`, then selected **two Unown** legal Telepathic prompt tokens, and on a constructed post-resolution public board chose `Farewell Letter` on the new Unown over Claw. All are checked against the existing frontier/prompt/decision validators.

The current test contributes **98 passed assertions** across both seats: three positive staged decisions, two native-printing root/search checks, twelve negative root decisions, plus the K0-root/K1-empty-prompt failing-control pair per seat. Negatives: full Bench, insufficient deck threshold, all Psychic Basic targets already visibly consumed, **only Gengar as a remaining source Basic**, certified Prize exhaustion, already-energized Unown, non-Telepathic Energy, **live Temple of Sinnoh**, **Silent Lab**, **explicit Farewell Letter suppression**, unfunded Mega, and a final-Prize KO. The existing 19 test groups also passed unchanged under the patched source. **317 counted assertions** over both test files; one existing unnumbered compatibility test group additionally passed. This is synthetic policy execution, **not** native Node/Store IPC, a played game, CI, qualification, or win-rate evidence.


### Follow-up: original four-copy Rescue Carrier line also executes in policy

I extended the same two-seat test to stage the public sequence after the two newly searched Unown have used Farewell Letter. A held `Rescue Carrier EVS 154` is selected before the non-final Claw, its actor-discard `ChooseCardsPrompt` selects two Unown, each recovered Unown is played onto Bench, each Farewell Letter is chosen, and the eventual attack is chosen. This adds **14 further executed source-bound decision assertions** (7/seat), total **52 new** and **271 counted including existing**. Its stages are **synthetic public post-settlement states**, not actual native card movement or game; owner Store evidence still needed. The practical line is Telepath → Unown ×2 → Farewell ×2 → Carrier → Unown replay ×2 → Farewell ×2 → attack. No deck substitution or new opponent profile.


### Follow-up: recipient competition with an already-Benched Gengar

With both a clean Unown and an **already in-play**, unfunded Gengar & Mimikyu-GX available as the Telepath recipient, the old review branch chose Unown and left Gengar unpowered. The latest branch chooses Gengar (score 355 rather than Unown's 345), retaining the same Unown search while preparing a backup Psychic attacker; if Gengar already has Energy, it selects Unown. Two seats × two decisions = **four new passing assertions**. This is a contingent heuristic; it is not a claim that powering the three-Prizer always wins. It never searches a new Gengar merely to expose another three-Prize liability.

The two-seat companion test now also covers a preexisting Gengar as the sole possible Telepath recipient with no Unown initially on Bench, and rejects the redundant attachment if Gengar is already energized; +4 decisions.


**Opponent-control correction:** I replaced the initially abbreviated Shadow Rider VMAX test target (which had omitted Darkness Weakness) with the authenticated field's 230-HP, Fighting-weak **Iron Thorns ex TWM 77** (source ranks 6/24/29). The funded 200-damage Claw is therefore genuinely non-final. All current decision suites still pass. Do not cite the earlier Shadow Rider dummy as an actual source interaction.


### Critical new benchmark line: attach/search before a non-final three-Prize KO

A card-accurate target is **Shadow Rider Calyrex VMAX CRE 75** (320 HP, Darkness Weakness ×2): active Mega Absol's paid Claw does 400, taking three Prizes, but **with six Prizes remaining and a second opposing Benched Pokémon**, it is a non-final KO. The prior root hard-gated all non-final KOs before Telepath setup, so an actual Hood/Lockbridge-type board would not enter the new search branch. I repaired that root gate only for this existing **source-bound, actor-visible, pre-KO Telepath setup**, with a score 13 above the available nonfinal Claw KO. Direct final-Prize and sole-Active game wins remain hard-prioritized. Both-seat synthetic decision suites show **Telepath → search two Unown → Farewell before the same three-Prize KO**, and both finishing negative controls. This adds **10 validated assertions** (5/seat), **70 new and 289 total**. This is the highest-leverage part of this patch for benchmark-facing opponent behavior; ask for a native same-Store continuation, not a proxy win-rate claim.


### Follow-up: four-copy hand-Unown draw line no longer lost at a KO

The root's earlier hard non-final-KO priority also blocked a **held Unown AOR 30**, even though it can be played to Bench and use Farewell Letter before Claw. I added the source-specific Unown-on-Bench priority only when Claw's KO does not finish the game and Silent Lab is absent. Positive source Shadow Rider VMAX line: **hand Unown → Bench → Farewell → Claw for three Prizes**. Final-Prize and Silent Lab controls still choose Claw. This is eight extra two-seat decision assertions, **78 new / 297 counted total**. It does not consume the singleton Telepath and is therefore likely to cover more realistic midgame hands; frequency and full-game payoff are not yet measured.


### New owner priority: four-copy Carrier now has a concrete pre-KO continuation

The original rank9 has **four Rescue Carrier** and four Unown. A held Carrier with two discarded Unown was also being skipped before a non-final Claw KO because of the earlier hard root gate (Carrier value320 vs direct three-Prize KO612). Source-bound code now prioritizes Carrier only with an actor-visible live Unown draw path, selects **two Unown over Voltorb** in the exact `Rescue Carrier` discard `ChooseCardsPrompt`, and follows the source hand-Unown → two Farewell → same Claw line. Tests stage the whole seven-decision chain plus final-Prize, Silent Lab and no-Unown negatives on **both seats**. **+20 new assertions; 98 new / 317 counted total**. This four-copy Item line may matter more for practical rank9 opponent competence than the scarce singleton Telepath; native Store needs to validate real source effects, especially the physical hand/discard/Bench transitions.

## Integration recommendation

Agent29 owns the existing rank-9 executable integration. Cherry-pick/transplant the narrow `devScore` and `ChooseCardsPrompt` changes, native printing alias and new test only after reviewing the 345 score against alternative resource expenditure; do **not** merge the whole review branch (it is based on the then-current integration head). Re-run the existing local suite on the current source and require a same-Store actor-view continuation before competence promotion. The ability-lock matchup (e.g., Wobbuffet preventing Farewell Letter) should remain a separate negative/continuation challenge; this patch only asserts the tested no-lock line. No owner-gated native CI/merge/game/fixture authority is requested.

— **Agent9**
