# Agent 9 independent archive audit: complete late14 copied-Poltergeist effects and source response

**Date:** 20 October 2026 UTC. This report is an independent second-reader verification of [Agent 37's canonical read-only settled-attack observer](../../simulation/evaluation/agent37-late14-public-replay.cjs), using the **original compiled GitHub Actions artifact**. Agent 37 deserves credit for the implementation. I did not change the canonical policy or rebuild the game engine.

## Immutable source and integrity

- [Manual GitHub Actions run 39342977706](https://github.com/FlareZ123/experiment-01/actions/runs/39342977706), source commit `ec5b6e570`, successful.
- Original artifact **12229209367** `agent5-late14-canonical-compressor-dev`, ZIP SHA256 **`ee0b86330ba6513baabc8439268b3a23a38f51d9f39dd474b9c7bbd36c94699f`**.
- Inner `agent5-bilateral-late14-compressor.json` SHA256 **`1bd89dc99fb069015be81c8e89572d03c7e90b2b071145a1c742f4cdc6f6f0e7`**.
- Inner `agent37-late14-public-settlement.json` SHA256 **`73d356bb40e817acd3bff909e673deb0026a85f229b82097ac21480e6ad5808c`**.
- The original policy four-arm JSON is the same payload independently audited in [Agent 6's late14 paired comparison](agent6-late14-paired-compressor-qualification.md). I parsed both original inner JSON documents using `zipfile` and `json`, verified SHA256, counted **four exact trial IDs**, `errors=0` and `competitiveQualifiedGames=0`, and cross-checked each observer's claimed source start, root SHA, candidate declaration and settlement counts against its matching canonical row.

## Full four-arm effect and response coverage

| Historical development arm | Candidate declarations | Actually settled public attacks | Documented next source action | Outcome caveat |
| --- | ---: | ---: | --- | --- |
| rank6, champion-reference, candidate A | 3 | 3 | 2 after nonfinal attacks | Engine terminal, earlier source attack completed |
| rank6, New Moon, candidate A | 0 | 0 | none to assess | **260-root action censor** |
| rank11, champion-reference, candidate B | 1 | 1 | 1 | Source-next-turn Tool-Garbodor line completed |
| rank11, New Moon, candidate B | **2** | **2** | **1** after first, game ends after second | **Source initially second; early Tool-Garbodor not completed** |

For the **rank11 New Moon** changed arm (historical ID `11:2:B:new-moon-lockbreaker-v1`, seed `623585882`), the opponent's source full-deal fingerprint is `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`, matching the archived comparisons. Candidate B actually went **first**. Source A's `rank11-direct-boostshake-k0-k1-v3` policy recorded `completed:false`, `opportunityTurn:null`, no early lock witness. A genuine Combo Compressor donor choice occurred earlier in the same archived treatment, per [Agent 6](agent6-late14-paired-compressor-qualification.md).

### Candidate copied Poltergeist 1

- **Native logged attack declaration root 149**, global turn **21**, `triggerAction=ResolvePromptAction`, `delegatedCopy=true`.
- Store's attack prompt chain closed with **settled completion at root 154**.
- Retrospective, diagnostic-only look at defending owner's *own* hand after the original bot choice: **6 Trainer cards**. Printed Gengar & Mimikyu-GX Poltergeist base `6×50=300`.
- Defending Active **Mega Absol ex, printed 280 HP**, zero damage before. Its Active slot was replaced by the completed attack effect and the defending in-play count fell by **1**.
- Candidate's remaining Prizes **6 → 3**. A real source root **155** on global turn **22** played **Tapu Lele-GX**, and the packet retains **four** actions across that genuine source return.
- This is a full post-prompt public KO/Prize/source-reply packet. It does **not** independently verify Weakness, Resistance, printed priority modifiers, or an official timed match.

### Candidate copied Poltergeist 2

- **Native declaration root 162**, turn **23**, again `ResolvePromptAction` and `delegatedCopy=true`.
- **Settled root 163**, defending owner hand **7 Trainer cards**, printed base **350**; another defending **Mega Absol ex, 280 printed HP**, had zero existing damage.
- The remaining defending Active disappeared, in-play count fell **1**, candidate Prizes **3 → 0**, engine declared the candidate winner. No following source action existed because the Store game ended.
- Both retrospective printed-base assessments are numerical diagnostics. The observer deliberately omits private hand card identities from exported packets.

## Implication for collective research

Agent 37's completed **four-arm compiled archive now closes the former 'candidate Poltergeist was only declared, not settled' evidence gap**. This is an observable candidate attack-conversion and two authentic 3-Prize knockouts against an opponent that did not establish its early lock. It cannot establish an actual hard-lock counter: on this changed arm the opponent's `completed:false` means the attack line never faced the intended earliest Source Tool-Garbodor pressure. The other rank6 New Moon source-first arm remains zero-attack censored.

The next highest-value acceptance test is therefore an **actually completed, first-turn source-owned lock with a causally linked candidate response**, alongside hidden-hand-safe candidate decision policies. Preserve the same source 60, root logs, and all failed source locks; use any forced lock only as an explicitly labeled development fixture. Keep the old 260-root control as censored, without treating it as a loss.

**Global status:** 29/32 original published opponent 60s; zero competitively qualified games and zero evidence for the extreme 99.5% target.
