# Six exact original rank-11 source openings execute Star-Alchemy-fetched VIP into equipped Garbodor

**Agent 32 | 30 October 2026 | Evidence: preregistered, source-dealt, owner-authenticated native Twinleaf one-turn mechanics.** This experiment demonstrates executable first-turn setup in six selected original Aichi source openings. It does **not** demonstrate opponent lock persistence, autonomous common-chooser competence, a matchup win, or competitive win probability.

## Why this test was registered

[Agent 7's exact resource model](rank11-oranguru-firstturn-tool-lock-exact.md) previously quantified rank11's Oranguru V direct-Active search and retreat routes. [The incremental exact model](agent32-rank11-oranguru-boost-shake-exact-window-20261030.md) identified another **disjoint** first-turn line: held Boost Shake, no held/Benched Trubbish and no held Battle VIP Pass, with Forest Seal Stone's one VSTAR search used to obtain VIP instead of Shake.

The frozen [512-attempt source-owned opening screen](rank11-conditional-K0-screen.md) furnished eight retrospective hand-only candidates. A **separate preregistered** [eight-source original-Bench native replay](agent32-rank11-native-eight-setup-bench-20261030.md) then proved six had the exact original seven plus ordinary first-turn draw, Oranguru V selected Active, no Trubbish in the source hand or Bench, held Boost Shake, no held VIP, no opponent action yet, and at least one free Bench slot.

Before looking at any of those six post-Prize decks, the source-only continuation registration was committed as [agent32-rank11-six-k0-star-vip-native-20261030.json](registrations/agent32-rank11-six-k0-star-vip-native-20261030.json), SHA256 **64ccdc1a46b92bf661541542630e989142746fac7fc426112386f762467df580**, commit **374fc6328c272b3fd9ad1f680eadc9ccdd8993b4**. This fixes exactly the original six source physical deals and their owner-hand hashes, without inspecting the native search results.

## Native Store setup and proof boundary

- **Pinned simulator:** Twinleaf revision **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**.
- **Original unchanged 60s:** Aichi rank11 Wataru Yano Absol/Garbodor in physical seat A, rank1 original Shadow Rider Calyrex in seat B, using original fixed source registration.
- **Source seat and turn:** physical seat0, actually first, native draw-log verified. No opponent first-turn interference because rank11 starts.
- **Versioned experiment:** [research-only six-source native continuation](../../simulation/twinleaf/agent32-rank11-six-star-vip-k1-native.cjs) with [pure owner-prompt tests](../../tests/agent32-rank11-six-star-vip-k1-native.test.cjs). It drives the **source player's** specific fixed line through actual typed native Store actions and native validated owner prompts, stopping at the next real opponent player root. It does **not** install a general autonomous policy, look at opponent hand, inspect owner deck/Prizes before a lawful search, or complete a whole match.
- **Native CI:** [manually dispatched GitHub Actions 40987263665](https://github.com/FlareZ123/experiment-01/actions/runs/40987263665), complete workflow **SUCCESS**, frozen tested source head **6bad668247b0108e0d8079d3beeeb2b9f8799f01**. The native action step and pure tests passed. Full JSON [artifact 12946914878](https://github.com/FlareZ123/experiment-01/actions/runs/40987263665/artifacts/12946914878), downloaded ZIP SHA256 **d56fa131acf4a9d3e156972e25ef7eb173f2d1f7b3842fb581f512182d3c07cd**.
- **Owner information:** source's original first-root owner hand SHA and initial public Bench must match the preregistration. First available source-deck membership is observed only when Back Order creates a legitimate source-owned deck-search prompt. Subsequent searches choose physical card objects from the actual owner deck only after their prompt becomes active and only when the pinned native Store validates the targets.

## Complete six-attempt native result

| Source first-turn index | Fixed original physical seed | At first Back Order deck search, remaining Forest / Float / VIP / Trubbish / Garbodor | Native 11-step setup | Opponent-root witness |
| ---: | ---: | --- | --- | --- |
| 2 | 1462371689 | 1 / 3 / 4 / 2 / 2 | **All accepted** | Garbodor equipped, VSTAR used |
| 232 | 2301458581 | 1 / 3 / 3 / 2 / 2 | **All accepted** | Garbodor equipped, VSTAR used |
| 299 | 2387754768 | 2 / 3 / 3 / 2 / 2 | **All accepted** | Garbodor equipped, VSTAR used |
| 376 | 2549346519 | 2 / 2 / 3 / 2 / 2 | **All accepted** | Garbodor equipped, VSTAR used |
| 440 | 1518908781 | 2 / 3 / 4 / 2 / 1 | **All accepted** | Garbodor equipped, VSTAR used |
| 458 | 2375861161 | 2 / 2 / 4 / 2 / 2 | **All accepted** | Garbodor equipped, VSTAR used |

**Original preregistered attempts:** 6. **Exact first-root owner hand and Bench parity:** 6/6. **Legitimate source-owned K1 deck searches:** 6/6. **Native successful opponent-next-root equipped Garbodor + used VSTAR witnesses:** **6/6**. **Missing required K1 cards:** 0/6. **Native rejection or exception blockers:** 0/6. **Competitive-qualified games:** 0.

The exact sequence below was physically executed on each seeded original source deal, with the normal game engine resolving every step:

| Native ordinal within the deliberate line | Physical action or prompt |
| ---: | --- |
| 0 | UseAbilityAction: Active Oranguru V **Back Order** |
| 1 | ResolvePromptAction: obtain missing Forest Seal Stone and Float Stone from the actual source-owned deck |
| 2 | PlayCardAction: attach Forest Seal Stone to Tool-free Active Oranguru |
| 3 | UseAbilityAction: **Star Alchemy**, consuming the VSTAR resource |
| 4 | ResolvePromptAction: search original source deck for Battle VIP Pass |
| 5 | PlayCardAction: use the retrieved Battle VIP Pass |
| 6 | ResolvePromptAction: put original printed Trubbish onto the source Bench |
| 7 | PlayCardAction: attach Float Stone to that Trubbish |
| 8 | PlayCardAction: use already held **Boost Shake** |
| 9 | ResolvePromptAction: select original source Garbodor BKP from the deck |
| 10 | ResolvePromptAction: choose the eligible Benched Trubbish to evolve, ending source's turn |

At the **first genuine opponent root**, the native source board displayed Garbodor with **Float Stone attached**, and Oranguru V with **Forest Seal Stone attached**. Source VSTAR power had been used. The first player turn advanced through real Boost Shake resolution. A *public-board equipped Garbodor* is the directly tested witness; a subsequent damage/Ability suppression probe and live opponent counterplay are outside this experiment.

## What this establishes, and what it cannot establish

This is a **positive native original-source line**, which closes a meaningful mechanism gap left by the previous exact combinatorics and first-owner-root observations. It demonstrates that the full printed sequence is **actually runnable** in at least these six exact native original-source setups while preserving each owner's legitimate information boundary and all six original printed physical deals.

The six were **retrospectively selected from 512 old seeds using source-K0 information** and are rich in the required first-turn resources. Therefore **6/6 must never be reported as a 100% opening success rate**, a policy execution rate, a win rate, or a representative field result. The source line is deliberately scripted and is not selected autonomously by Agent41's common chooser. It stops before a genuine opponent action; it does not prove lock persistence or survival against Shadow Rider, Iron Thorns, or any other original Top32 strategy. It uses a bounded research simulation whose paper Expanded coverage and playing policy remain unqualified. Garbotoxin BKP is an **Ability lock** conditional on its Tool; it is **not an Item lock**.

## Integration acceptance target

[Agent41's bilateral chooser](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) has one validated original-source exact starting-state/positive-effect fixture set. Integrate an owner-visible, resource-aware candidate for the action sequence. Test it against the existing first-return baseline, preserve competing choices and hold alternatives, require genuine native prompt ownership, Tool recipients and the turn-ending Boost Shake result, and allow the other original source actor to respond under the **same versioned two-player policy**. Introduce a **negative** fixture where the route must be held or is disabled, including opposing Iron Thorns Initialization when going second. Then assess the source's next action and the candidate's actual response without knowing hidden Prize card identities before legitimate source search. Avoid using these selected source-positive setups as matchup denominator or creating a second full-game chooser.

**Global research qualification unchanged:** **29/32 complete original source 60s**, ranks **23/25/28** missing, **zero qualified competitive games**, **no demonstrable fixed deck with 99.5% game-win rate**.
