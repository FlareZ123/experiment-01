# Rank-11 autonomous New Moon response: actual Tool removal without attack conversion

**Agent 13, 18 October 2026.** Evidence: authentic-source, pinned-engine **single-seed decision-policy regression**, not a qualified competitive game. [Compiled manual CI 39099451713](https://github.com/FlareZ123/experiment-01/actions/runs/39099451713) passed all pure tests and both source runs, head 90ae79773e76412824f28042c6b1cdda584945df. [Artifact 12125997564](https://github.com/FlareZ123/experiment-01/actions/runs/39099451713/artifacts/12125997564) includes autonomous JSON, SHA256 e6971230bbcaa98d1b997b397d5d6d4183b03fa7eb1afb9fb93fe074966ef192.

## Immutable source and autonomous policy

- Aichi 2026 rank 11 Wataru Yano Absol/Garbodor **seat A**, New Moon Lockbreaker v1 fixed 60 **seat B**, seed **1244180408**; rank11 **actually first**, verified through first-draw log. Candidate English proxy hash a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4. Both same-seed arms' exact resolved deck hashes matched.
- Twinleaf pinned a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. Source opponent research policy rank11-autonomous-boostshake-v1 built its **11-action real first-turn equipped-Garbodor** sequence in both arms. Original source opening actions remained identical.
- Candidate policy [newmoon-garbotoxin-blower-autonomy.cjs](../../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs), regression [newmoon-rank11-autonomous-blower-probe.cjs](../../simulation/twinleaf/newmoon-rank11-autonomous-blower-probe.cjs), [six pure tests](../../tests/newmoon-garbotoxin-blower-autonomy.test.cjs).
- At any own ordinary decision, the opt-in policy checks its **own hand** for Field Blower GRI, Active Mewtwo & Mew-GX, and **public opposing Benched Garbodor BKP with Tool**. It checks the proposed PlayCardAction using the pinned upstream legality filter, then resolves the real owner-valid ChoosePokemonPrompt targeting Garbodor. No hardcoded seed or turn appears in its decision function, and it uses no hidden opposing or face-down Prize information. The original bot method is restored in a finally clause; complete baseline decision trace was exactly reproducible afterward.

## Passing source-game decision evidence

The automatic policy saw one opportunity at candidate global turn **2**, selected the printed Field Blower from its actual hand, chose the opposing real Tool-bearing Garbodor in a validated prompt, and observed its public Tool count drop to zero. The opponent's complete turn-one source opener was identical to the untreated baseline.

| Identical source deal | Generic New Moon | Automatic Field Blower v1 |
| --- | ---: | ---: |
| Opponent 11-action opener | Complete | Complete |
| Own-turn Field Blower uses | 0 | **1** |
| Verified removal of Garbodor Tool | No | **Yes** |
| Candidate AttackAction count | **0** | **0** |
| Candidate Perfection calls observed | **0** | **0** |
| Engine winner | Rank11 | Rank11 |
| Root actions / global turns | 207 / 43 | 221 / 45 |
| Final Prizes (rank11/New Moon) | 0 / 6 | 0 / 6 |

On the very next opponent turn, rank11 played **Darkness Energy, another Float Stone, and Shopping Center**. This captured summary does not establish the target of that second Tool attachment, so whether Garbotoxin was restored at turn three is not confirmed.

## Tactical interpretation and limits

The early Item can legally clear the public Tool; spending it alone did not produce a copied attack. The candidate Active Mewtwo & Mew-GX had only **one Psychic Energy and Powerglass** at its first Pass; Bench contained **Lunatone and Tapu Lele-GX**, without Gengar & Mimikyu-GX. Its first-turn trace showed no Battle Compressor or Gengar discard action. The archived record lacks a fully asserted discard-zone witness, so absence of a viable Perfection payload is strongly suggested by the observed actions and board rather than formally proven by this report.

The v1 policy does **not** evaluate attack payload accessibility, legal copied attacks, opportunity cost, how long the lock release lasts, opponent retooling, or alternate Ability usage. It is a **successful legal-action policy regression with zero evidence of recovered playing strength**. A more promising version would delay an expendable lock answer until it can enable a meaningful line or until future Item access is threatened. That hypothesis requires source-action testing. Agent11 separately owns the initial-turn Horror House/Perfection source adapter, and coordination is required.

Next: measure public opponent retooling after turn three; model genuine payload/attack-ready states and follow-up, then prospectively test held-out source openings stratified by actual starter and record failures. This positive source seed is a regression exam, never a game-win sample. Japanese paper print fidelity, full replay and competent bot behavior remain unresolved.

**Field status:** 29/32 exact opposing lists; ranks 23,25,28 unknown; zero independently qualified competitive games and no demonstrated 99.5% win rate.

## 18 October additional actual-zone witness: source Tool stayed off, Gengar unavailable

A read-only extension of the **same unqualified source seed** and same automatic v1 behavior passed compiled manual [CI 39099986951](https://github.com/FlareZ123/experiment-01/actions/runs/39099986951), head **4467fca0ecd44c92d557b5e77cab8b2b942fe9a7**; [artifact 12126640117](https://github.com/FlareZ123/experiment-01/actions/runs/39099986951/artifacts/12126640117), automatic JSON SHA256 **aca8659aa3bc625753a4436e452147acce341fecf0216c7af76d91f7af37ce0f**. The adapter inspects **own** Bench/discard and Energy and **opponent public** Garbodor Tool at the earliest non-prompt ordinary decision on each candidate turn; it never exposes hidden opposing information to the bot.

| Actual candidate decision turn | Candidate Active | Active attached Energy at first decision | Gengar & Mimikyu-GX in own Bench | In own discard | Opponent Garbodor Tool |
| --- | --- | --- | --- | --- | --- |
| 2 | Tapu Lele-GX | none | **No** | **No** | Float Stone BKT, before Blower |
| 4 | Mewtwo & Mew-GX | one Psychic | **No** | **No** | **none** |
| 6 | Mewtwo & Mew-GX | one Psychic | **No** | **No** | **none** |
| 8 | Mewtwo & Mew-GX | one Psychic | **No** | **No** | **none** |

At turn 2 the same live match subsequently moved Mewtwo Active by Escape Rope, attached Psychic Energy, removed the Tool, and passed. The opponent did play an additional Float Stone and Shopping Center on its next turn, but **Garbodor was still publicly untooled at each observed candidate turn through turn 8**. Therefore the previous caveat about an unverified threat of immediate Garbotoxin restoration must be narrowed: the additional Tool did **not** restore Garbotoxin on the observed board states. The true **Gengar GX attack source was absent from both legal Perfection attack-source zones** at each of the four observations. This now positively confirms missing Gengar payload as an observed local obstruction, independently of Tool removal. Other available copied attacks and full attack legality remain unqualified.

These are repeated time points in one source game and share its seed/decisions. They provide **zero new independent games**, do not justify any estimated match win probability, and cannot establish that retaining Field Blower would dominate spending it.
