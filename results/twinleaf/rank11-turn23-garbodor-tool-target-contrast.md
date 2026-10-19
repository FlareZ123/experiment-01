# One authentic rank-11 Float Stone target swap exposes meaningful Garbotoxin counterplay

**Agent 8, 18 October 2026.** A bounded **same-source counterfactual** of a single real bot-selected Tool placement. It is intended to challenge the weak opponent policy in a previously selected source-dealt positive-control game. **Zero independently qualified competitive games.**

## Provenance and exact intervention

- Opponent: published Aichi 2026 **rank 11 Wataru Yano Absol/Garbodor exact 60**, actual physical seat A (0), actually first.
- Candidate: original **New Moon Lockbreaker 60-card English-equivalent mechanics proxy**, physical seat B (1), actually second. Neither card inventory changes.
- Actual source seed `1111464409`, conditioned retrospectively on a previous favorable candidate terminal and therefore unsuitable for win-rate inference.
- Engine: pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Verified compiled regression: existing manual workflow [39160770372](https://github.com/FlareZ123/experiment-01/actions/runs/39160770372) **completed successfully** on code commit `7adc43a7c2a2fdc00f0c8b1bcb5b6c7c8042204b`. Authentic source JSON artifact `rank11-copied-attack-selection` **12149315474**, independently downloaded ZIP SHA256 `e395d50684ca7cbda96ad6807e85979822fb426995cc6b1d79c273f010656ba3`. The artifact includes `retrospectiveTurn23GarbodorToolTargetContrast` and prior uncensored source evidence.
- Reproduce with `simulation/twinleaf/rank11-turn23-garbodor-floatstone-fork.cjs`, wired to additive field in existing `simulation/twinleaf/newmoon-rank11-perfection-delegated-source.cjs`. The wrapper intercepts `SimpleTacticsAi.decodeNextAction` **only** when rank11 actually selects its own-hand Float Stone, at **global turn23**, targeting it to an **already-evolved, Tool-less Garbodor** on its genuine Bench instead of the engine policy's original Active Mega Absol ex. It uses real `PlayCardAction` through pinned Store with the same owner hand index and valid Bench index. Source actor identity and public board are checked before replacement. Every root action preceding **ordinal217** was asserted byte-equivalent on the selected fields between original and alternative game. Exact deck hashes and first-turn source validation match.

## Observed source and counterfactual outcomes

| Source property | Original generic rank11 bot | Float Stone onto Garbodor counterfactual |
| --- | --- | --- |
| Opponent Float Stone action | ordinal217 | same ordinal217, same own-hand card |
| Floated source Active Mega Absol ex at Pass | **yes**, holds one Darkness | **no**, still holds one Darkness |
| Benched Garbodor Pokémon Tool at source Pass | **none** | **Float Stone** |
| Tool still on Garbodor at first next candidate turn24 | absent | **present** |
| Final engine actions | 274 | 318 |
| Final global turns | 36 | 47 |
| Engine winner | candidate B | candidate B |
| Final source/candidate Prizes remaining | [2, 0] | [2, 1] |
| Candidate Perfection declaration count | 2 | 1 |

The alternative created a real source game with a Tool-equipped Garbodor at candidate's turn24; the original source had its Float Stone on the unable-to-attack Mega Absol ex. The model's subsequent outcome and root decision path changed materially. In the alternative, the candidate won with one Prize still unclaimed, emphasizing that raw win/Prize counts do not alone convey tactical quality or why the engine terminated.

This is **one source-dealt Store intervention**. It establishes action **availability and mechanical continuation**, not that the alternative was a game-winning lock against optimal play, that a particular candidate action was blocked by Garbotoxin in this replay, or that policy quality became competitive.

## Printed mechanism and competing uses

- Exact Garbodor BKP 57 **Garbotoxin** applies while it has any Pokémon Tool attached, suppressing every Pokémon Ability in play, hands and discards except Garbotoxin. It would suppress Mewtwo & Mew-GX's Ability-based **Perfection** if the candidate cannot neutralize the Tool or lock.
- Existing independent pinned staged actual-Store test `simulation/twinleaf/new-moon-lockbreak-ability-gates.cjs`, manually compiled [CI 39021653996](https://github.com/FlareZ123/experiment-01/actions/runs/39021653996), confirms equipped Benched Garbodor prevents Perfection visibility and Field Blower can restore it. That fixture does not by itself establish full continuous Ability status on the present source turn24.
- Lunatone OBF 92's **New Moon** concerns protection against Stadium effects when Solrock is present; it does not provide general immunity to Pokémon Ability lock.
- The original active-target Float Stone made Mega Absol's Retreat Cost zero, which might enable other tactical actions. But the source's turn23 completed with a Pass, and independent [energy-exhaustion proof](rank11-turn23-energy-conservation.md) establishes all eight Darkness committed to in-play attachments before the previous KO and no Darkness in the resulting own hand or deck. Neither printed Mega Absol attack was payable with its lone attached Darkness.
- Garbotoxin could also suppress useful **source player's own Pokémon Abilities**; the alternative's opportunity cost, Field Blower response, Tool bounce/replacement, multi-turn prize policy, and alternative early setup lines are not established.

## Evidence quality and next checks

The derived snapshot proves a Tool-equipped Garbodor survived Shopping Center and the candidate's first following decision. The next fidelity gate is to call the pinned `IS_ABILITY_BLOCKED` / printed-power availability check at that actual **live first candidate turn24**, with observer-on/off noninterference and source-objective consistency, and to preserve actual Mewtwo action/reply choices. Also record source Bench occupancy after removing Sky Field and final engine **endReason** so a Stadium-related board-rule or deckout artifact is not mistaken for a stronger attack line.

This result is a **specific counterexample to treating default generic-bot opponent replies as competent**, and a regression seed for future rank11-adversarial policy improvement. It does not add a prospectively sampled match to the target field. **29/32 exact lists; zero qualified competitive games; 99.5% target unproven.**

## Agent 6 follow-up: live next-turn Perfection blockade

The original same-source Float Stone target fork now includes a **detached cloned-Store `IS_ABILITY_BLOCKED`** probe at the candidate's first real non-prompt decision on global turn **24**. It uses the pinned `Simulator(state)` cloning boundary and never passes probe data into the bot action. Exact source seed, physical decks/seats, original prefix through ordinal 216, rank11 Tool placement at ordinal 217 and bot policies remain unchanged. The live candidate Active was **Mewtwo & Mew-GX UNM**, and its Ability-block check returned **`true`**, while Garbodor BKP on the opposing Bench still held Float Stone BKT. This closes the previously unverified actual-decision ability-suppression step.

[Manual compiled CI 39171792486](https://github.com/FlareZ123/experiment-01/actions/runs/39171792486) **passed** on head `2ebb2fd7e7eebab1b1d4f8ddeddd6ca8ca23cd2e`; artifact [12153081516](https://github.com/FlareZ123/experiment-01/actions/runs/39171792486/artifacts/12153081516), ZIP SHA256 `456cbe26d430f8d2922ef96078179d3f59f5da9f8f5c215775fe855c4fc06579`, JSON SHA256 `e1e223e367b440b833b844d939cee3b5959d2e7c957d6e7b7ffe54440f54e725`. The original and altered engine summaries exactly reproduce the prior 274/318 actions, 36/47 turns, respectively, with same winners and prizes. The probe establishes **one live in-engine block**, not full paper fidelity, optimal Tool allocation, observer-on/off complete root parity, a 25-minute paper-clock outcome, or statistically independent candidate performance. Zero competitively qualified games.

## Agent 6 follow-up: verified terminal cause and first candidate response (19 October 2026)

The compiled same-source comparator completed **successfully** in [manual CI 39172765316](https://github.com/FlareZ123/experiment-01/actions/runs/39172765316), head `d6b82042b677549443e5c9bf82568deb203008d2`. Its `rank11-copied-attack-selection` artifact [12153023720](https://github.com/FlareZ123/experiment-01/actions/runs/39172765316/artifacts/12153023720) has ZIP SHA-256 `4430bef3f867f2c5e94465533fd50837128fb86e1aba3fca982da69e30253eca` and contained JSON SHA-256 `5d558a23b281ba391ca69dd8e2d43f858012081f786cc937b2f7ea8f82b74213`. The recorded `retrospectiveTurn23GarbodorToolTargetContrast` object asserts byte-equal **entire root-action ledgers** between the read-only observer and uninstrumented original. It also asserts ordinary/alternative source prefix identity before the Tool choice. The same actual candidate Active Mewtwo & Mew-GX UNM on global turn24 is correctly observed **unblocked** under the original Tool target, **blocked** by Garbotoxin when Float Stone is on the opposing Garbodor.

The artifact now resolves the previously unspecified *reason* for the altered terminal. At the final source transition, global turn **46 → 47**, rank11 has **zero cards remaining in deck and two Prizes remaining**, while the candidate still has **one Prize remaining** and 14 deck cards. It follows candidate seat1's `PassTurnAction` and `WaitPrompt`, transitions into the opposing player's turn and immediately awards the candidate a win. The alternative is therefore a **source player deck-out at the next required opening draw**, matching the Advanced Rulebook §I.E; it is **not** a final attack KO or six-Prize victory. By contrast, the original game at turn36 resolves a copied attack's `WaitPrompt` with candidate Prizes **1 → 0** and opposing in-play Pokémon **6 → 5**. This is a meaningful change of end cause under a one-card Tool target choice. The source-retrospective scope and bot-policy caveats remain.

The immediately following **candidate turn24** produces *exactly the same three root actions in both source versions*: ordinal **226** `PlayCardAction(Powerglass)`, ordinal **227** `PlayCardAction(Path to the Peak)`, ordinal **228** `PassTurnAction`. The acting candidate's own five-card hand before these choices is `Powerglass SFA`, `Ace Trainer AOR`, `Hisuian Heavy Ball ASR`, `Path to the Peak CRE`, `Battle VIP Pass FST`. **There is no immediately held Field Blower** in that hand. The printed Path to the Peak CRE also removes Abilities from all in-play Rule Box Pokémon, including this candidate's Active Mewtwo & Mew-GX, while Path remains active. Thus the generic candidate policy independently chooses an Ability-suppressing Stadium that can conflict with its own Perfection plan, even in the branch where Garbotoxin was initially absent. These trace facts make turn24 an unsuitable standalone proof of adaptive, human-quality Garbotoxin counterplay.

The preceding copied Poltergeist reducer record shows candidate Prizes **4 → 1** against rank11's **2** at turn22, unchanged over rank11's intervening turn23: accordingly, held **Ace Trainer cannot be played** on candidate turn24 (its printed requirement is *more* remaining Prizes than the opponent), and held **Battle VIP Pass** is past its first-turn use window. Source public-board evidence at the first subsequent candidate decision has **neither Lunatone nor Solrock** on the candidate Bench (Shopping Center displaced Sky Field and contracted the Bench to five), so the candidate lacks the Lunatone OBF New Moon Stadium-protection combination. Under printed effects, Path to the Peak's own Ability suppression applies to the Active Rule Box Mewtwo & Mew-GX at that point. This records the decision's concrete resource and protection context; a full after-Path ability audit is a separate mechanical question.

Next discriminating test: freeze the already-observed source game and compare one **owner-visible, legal candidate response on the same first turn24** against both opponent Tool targets, while preserving all root decisions until the candidate intervention. First establish whether a consequential alternative is actually playable from the displayed hand and public board. If none is payable, document the negative and move to the first later turn where the candidate can reach a real Ability-unlock or alternative attacker. No extra games are justified merely by this retrospective positive-control terminal. **Competitive-qualified count stays zero**.

## Agent 6: source-legal candidate copied response at turn24 (19 October 2026)

The first counterfactual to the **candidate** response has now passed the real pinned-engine compiled manual [CI 39186067428](https://github.com/FlareZ123/experiment-01/actions/runs/39186067428), source revision `3122b194e93addc0fde1e10214e99f3f187b0d9d`, artifact [12157889212](https://github.com/FlareZ123/experiment-01/actions/runs/39186067428/artifacts/12157889212) (`rank11-turn24-candidate-copied-reply`). Artifact ZIP SHA-256 `e7f7429bb8a6122ceade51cc0f24b301857f9f87baf13ab977d8f682d9244c40`; contained JSON SHA-256 `9acb88b562720ea27a87dd9c87be6918aca8018fd0d1a0975814f4726bce96aa`. Reproducer: [`simulation/twinleaf/rank11-turn24-copied-reply-fork.cjs`](../../simulation/twinleaf/rank11-turn24-copied-reply-fork.cjs).

This is the frozen **original Tool-to-Mega-Absol branch**, where Garbodor is not Tool-equipped at the first candidate decision. At the first source-dealt turn24 opportunity, candidate Mewtwo & Mew-GX holds three Psychic-providing attached Energy from the prior turn and the printed Gengar & Mimikyu-GX TEU copy donor is in its own accessible card zones. Following the unchanged root actions up to ordinal **226** (candidate attached Powerglass), the ordinary AI's **ordinal 227 `PlayCardAction(Path to the Peak)`** is replaced with one **ordinal 227 `UseAbilityAction(Perfection)`**, under the same physical seat, source seed, card printing/deck identities, first-turn order, own-hand/public-board restrictions and all preceding root actions. The real prompted attack selection at ordinal **229** chose `Gengar & Mimikyu-GX TEU / Poltergeist` and passed actual `ChooseAttackPrompt.validate`; a corresponding real Store delegated attack declaration at ordinal229 was recorded. `WaitPrompt` ordinal231 ended the candidate turn and initiated global turn25. The first ordinary source response is a true **`PlayCardAction(Dark Patch)`** at ordinal233 on global turn25. The basic attack declaration and responsive action are established; the printed numerical damage reducer and independent paper-fidelity remain unverified in this run.

| Counterfactual element | Generic source baseline | Candidate copied-response intervention |
| --- | --- | --- |
| Source rank11 actual first | yes | yes |
| Candidate turn24 root ordinal227 | Path to the Peak | Perfection to printed Poltergeist |
| Candidate attack at turn24 | none | actual delegated copied Poltergeist |
| Next source turn | turn25 | turn25; Dark Patch first nonprompt root |
| Final engine action count | 274 | 251 |
| Final global turn | 36 | 28 |
| Terminal candidate Prizes | 0 | 0 |
| Terminal source Prizes | 2 | 2 |
| Terminal mechanism | copied attack knockout | copied attack knockout |

In the alternative, the **terminal** genuine Store copied-attack chain initiates another `UseAbilityAction` at ordinal247, selects attack via prompt ordinal249, then resolves the final KO/Prize at `WaitPrompt` ordinal250: opponent in-play Pokémon **6 → 5**, candidate Prizes **1 → 0**, deck remaining 9/19. That terminal and the original's turn36 one are both Prize-KO wins, but their timing differs. The alternative source continuation is **retrospective and conditioned**. The opponent response policy is unqualified, printed numerical effect is incompletely independently checked, and official timed-match equivalence remains open. **This is useful positive causal attack-and-response evidence, still zero qualified competitive wins**.

The next narrow test is to enable the existing read-only `capturePoltergeistEffectTrace` on both original and intervention under the exact same seed and replay, assert that it leaves the source root ledger unchanged, and inspect the printed 50×Trainer calculation at the source turn24 declaration. It must treat opponent hand as hidden to the candidate policy and reveal its count only retrospectively for evidence.
