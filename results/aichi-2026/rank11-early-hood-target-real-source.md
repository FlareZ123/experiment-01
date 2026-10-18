# Source rank11: early Stealthy Hood target repair, real Tool and evolved Ability state

**Agent 7, 18 October 2026. Evidence:** one original-dealt paired policy-action experiment on the pinned Twinleaf Store. **No competitive game or win-rate qualification.**

## Question and frozen controls

Against the actual source-ranked rank11 Wataru Yano Absol Garbodor opener, the unchanged Hood Shield v1 bot previously used a held **Stealthy Hood** on Radiant Eternatus. Could an **owner-hand/public-board-only, seed-independent** Tool-target policy attach the same Hood to an actual Shadow Rider Calyrex V, preserve it through evolution, and remove the VMAX's Ability block while the opposing Garbodor remains equipped?

Frozen physical ranks and inventory: published rank11 60 in seat 0; source-checked Hood Shield v1 60 in seat 1, **seed `1244180408`**, with the original source Rank11 autonomous opener, unchanged engine/rules hooks and all other generic decisions. The real draw log identifies seat 0 as actually starting first. The seed is a previously selected positive control and cannot be treated as a random independent matchup trial.

**Implementation:** [public-state Tool priority](../../simulation/twinleaf/early-shadow-rider-hood.cjs), [actual source runner and replay](../../simulation/twinleaf/rank11-hood-target-counterfactual.cjs), [five pure tests](../../tests/early-shadow-rider-hood.test.cjs), [manual-only compiled CI workflow](../../.github/workflows/rank11-hood-source-opportunity.yml). The adapter uses the candidate's actual hand, own board and opponent's public attached-Tool Garbodor. It seeks an untooled Shadow Rider VMAX, then an untooled Shadow Rider V, selects the physical Tool card, constructs a genuine `PlayCardAction` with a real target and applies the pinned bot's legality filter. It does not read opponent-private zones, hardcode a turn, alter upstream vendor code or attempt to make other decisions.

## Actual compiled result

[Manual CI 39143330088](https://github.com/FlareZ123/experiment-01/actions/runs/39143330088) **passed** on repository commit `f4c36655217ce7302edee10dfeddbf4de5dbbfab`, pinned simulator `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Exact artifact **12142363274**; uploaded ZIP SHA256 `7b32765435699cd0e1b47edee45cc27358a3ec9814f533eddbccd8e13c694586`; JSON `hood-target-counterfactual.json` SHA256 `0887743239ba39c975e5c6bfc9b30bbb1ba6a1a292dbc5671b2b69bf9a450556`.

| Authentic observation | Original bot | Early-Hood target policy |
| --- | --- | --- |
| Turn-2 first Stealthy Hood | Attached to **Radiant Eternatus CRZ** | Selected from actual hand and **attached to Benched Shadow Rider Calyrex V CRE**, slot 0 |
| Turn-4 evolved VMAX | Unhooded; Underworld Door **blocked** by opposing Tool Garbodor | Same Hood now on **Shadow Rider Calyrex VMAX CRE**; `IS_ABILITY_BLOCKED=false` with opponent still equipped |
| Second Hood | Original bot attaches to a VMAX on turn 40 | Generic bot later attaches another Hood to another VMAX on turn 40 |
| Engine outcome | Finished; remaining Prizes `[0,6]` | Finished; remaining Prizes `[0,6]` |

The source opponent's live Garbodor had **Float Stone BKT** when the intervention was selected. The changed target was confirmed by the actual Store observer *after dispatch*, not just an AI proposal. For the alternative on turn 4, the live VMAX's actual Underworld Door Ability check returned **unblocked** while one opposing equipped Garbodor remained. The untouched baseline was run again after the temporary policy wrapper restored the prototype, with **identical ordered decision trace and Hood attachment observations**; source deck digests were equal across original and alternative.

**Critical distinction:** This establishes an earlier *available* protected Ability, not that the bot announced and successfully resolved Underworld Door, converted its extra draw into a consequential attack, or answered the opponent. The unchanged engine outcome explicitly prevents treating this single corrected action as a demonstrated win improvement. The decision-policy, authentic-attack completion, opposing retool/removal response, full simulator fidelity and Japanese-paper card legality require separate evidence.

## Next falsification gate

Capture the existing Store's **selected candidate ability actions, attack declarations and pass turns** under the two arms, preserving actual hand and board perspective. Determine whether the protected turn-4 Underworld Door was chosen, whether a Psychic Energy attachment and draw were observed, and what blocked an attack. Then test the policy in prospectively selected both-start deals, retaining all no-Hood/no-Garbodor/no-Shadow-Rider opportunities. The current one-source positive result cannot support any frequency claim.

**Project-wide status:** 29/32 exact Aichi Top32 opponent lists; zero independently qualified competitive games; no demonstrated 99.5% fixed-deck win rate.


## Follow-up: authentic turn-4 Underworld Door is executable (compiled 18 October)

The original diagnostic above established an unblocked power but did not show its use. A **third** matched, real-deal policy branch now addresses that missing step. New `simulation/twinleaf/protected-underworld-door.cjs` (and four independent pure predicate tests) adds one **autonomously selected, original-root `UseAbilityAction`** only when: the candidate actually holds Basic Psychic Energy, an own Benched Shadow Rider VMAX has Stealthy Hood, an opposing Garbodor publicly wears a Tool, no prompt is pending and it is the candidate's turn. A legitimate **owner `AttachEnergyPrompt`** then selects that same real Psychic Energy for the protected VMAX, without reading opponent-private cards or hidden Prize contents. This composes with the previously tested original-deal Hood attachment and retains a byte-identical restored original-source control.

**[Manual compiled CI 39144421126](https://github.com/FlareZ123/experiment-01/actions/runs/39144421126) PASSED**, source head `d216e1607371b83e52779d4a660637eb4e48952f`, source-tested code committed as `ddbbe0d` / `ed0cfe9` / `3a2aa10`. Artifact **12142778258** ZIP SHA256 `874c6577cf90f00f69ea495affb25ab291412201b916637f5fa5a05911fe916a`, JSON SHA256 `6f3dc80bb470052f550254493360c41bd217c99fb23588c67fc85f3219f4a0ee`.

The engine-selected candidate actions and post-prompt effects are:

1. Candidate global turn **2**: genuinely held Stealthy Hood attached to Benched Shadow Rider V before it evolves.
2. Global turn **4**: Shadow Rider V evolves into Hooded VMAX. The candidate plays Fog Crystal and searches actual Psychic Energy, just as in the untouched source.
3. At the live root after that legitimate owner search, with **Psychic Energy MEE** in hand and opposing Garbodor still wearing **Float Stone BKT**, candidate policy dispatches `UseAbilityAction('Underworld Door')` from its **Benched** Hooded VMAX.
4. Original `AttachEnergyPrompt` accepts and dispatches the real Psychic Energy onto that VMAX. The actual Store checks: **one Psychic Energy attached**, **two cards drawn**, **Hood still attached**, **opponent Garbodor still Tool-equipped**. The resulting hand contains Field Blower GRI and Teammates PRC from the extra draw.
5. The generic policy subsequently passes with Radiant Eternatus still Active. Neither this branch nor the original/corrected-Tool-only arms declared an attack through the audited early turns. All **three engine games still finish as rank11 wins** with remaining Prizes `[0,6]`.

**Inference:** a staged mechanical Availability/real Store resolution gap is now closed for this single genuine source deal. It is demonstrably possible to execute a protected early Underworld Door, including the full Energy-and-draw effect, under live Garbotoxin. The visible remaining bottleneck is **Active positioning and successful attack conversion**, with a potentially significant competing use of the searched Psychic Energy. Neither the one-source result nor its retrospective selection measures actual game-win probability. The exact physical printing/complete simulator-policy fidelity issues remain open, and a representative both-start follow-up still requires an autonomous opponent and candidate attack/reply.
