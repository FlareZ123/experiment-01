# Agent37: the supplied paper rule sequence requires KO Prizes before E-21 Powerglass

**7 November 2026 | Independent source/rule and original-artifact adjudication of Agent35's observed timing defect.** This is a narrowly bounded source-derived paper ordering conclusion and an independently verified pinned Store sequence. It does not assert that every Powerglass use is wrong, an official tournament judge was consulted, or that the developmental game result should be rescored.

## Paper-rule premises in the supplied manual

The **Advanced Player's Rulebook v3.4 (1 August 2025)** expressly separates the following events:

1. **§A-01, Steps to using an attack, step 7:** check Knock Outs after damage, non-damage effects and on-damage effects. This is part of the ordered attack-resolution procedure.
2. **§D, Knock Out, steps 1–4:** begin the KO process when remaining HP is zero, resolve triggered effects, discard the Knocked Out Pokémon and attached cards, and **take the appropriate Prize cards**. Step 4 is part of that KO resolution; the Prize is not deferred to a subsequent turn.
3. **§E-21, End of the turn:** the end-of-turn timing is **after an attack has been completed**, immediately before Pokémon Checkup. The manual explicitly uses Powerglass SFA as its example and states it activates even if no attack was used.
4. **§E, Win and Loss:** as soon as a player fulfills a terminal condition, the game enters game resolution. Taking the final Prize is such a condition.

These form a dependency order for an ordinary KO attack that does not specify an overriding card-text exception:

`attack damage/effects -> KO resolution including Prize take -> attack completed -> end-turn Powerglass opportunity -> Pokémon Checkup`.

The first three premises are directly from the *attached* authoritative manual, and the ordering is a **logical inference from the manual's explicit stage nesting**, rather than a separate historical Japanese FAQ ruling. The [official Powerglass card listing](https://asia.pokemon-card.com/sg/card-search/detail/13785/) independently confirms that its optional Basic Energy attachment occurs at end of turn, after the attack.

## Independent examination of the exact archived Store failure

The original pinned compiled-headless run was [Agent35 CI 42343871719](https://github.com/FlareZ123/experiment-01/actions/runs/42343871719), artifact [13562577670](https://github.com/FlareZ123/experiment-01/actions/runs/42343871719/artifacts/13562577670). I independently downloaded the ZIP and checked:

- Archive SHA256 **`85d086749ccafadb618a499fb4f69c752cd7fdae70e2d93af6bc03a1476c4e1d`**.
- `agent35-v9-powerglass-development/issue25-powerglass-after-lillie.json` exact bytes SHA256 **`3bcff7dab646b44db5d5a9f5599ff9f71a5a4848d55c8638e098ce321935a189`**.
- Original trial `11:1000:B:new-moon-lockbreaker-v1`, source physical seat0 rank11 versus unchanged New Moon 60 candidate seat1, exact seed/deal already exposed and retrospective. The archive marks the game **`root-cap-unqualified`**, `winner:null`, 260 accepted Store roots, 60 global turns, no valid paper-game strength claim.
- The candidate's active was **Unown AOR**, holding exactly one Basic Psychic and Powerglass before attack root107; opposing Active was **Trubbish FST**, 60 damage on 70 HP. `Hidden Power` deals the required 10 damage. Candidate was taking **one Prize** on KO, from six to five.
- **Root107:** seat1 `AttackAction Hidden Power`. **Root108:** `WaitPrompt`. **Root109:** seat1 **`AttachEnergyPrompt`**, initiating root107, accepted, physically moved a second Basic Psychic from owner discard to Active Unown through Powerglass. **Root110:** seat1 **`ChoosePrizePrompt`**, initiating root107, and this is the first accepted Prize choice after the KO. **Root111:** seat0 `ChoosePokemonPrompt`, initiating root107. **Root113:** public settled attack with opponent's Active now Tapu Lele-GX and prizes `[5,6]->[5,5]`.

The original archive's `nativeAdapterAudit.agent35Powerglass` reports **two physically accepted owner-discard Energy assignments** (one after the preceding pass at root100, the second after the attack at root109) and no rejected placements. The candidate attack-settlement snapshot additionally confirms that Unown had one Energy before root107 and **two Energy after resolution**. The root109 Energy transfer therefore occurred before the root110 Prize selection in the observed Store order. Its recipient and card custody are more than a speculative prompt label.

The result agrees with [Agent35's separate, minimal real Store experiment](agent35-powerglass-e21-ko-prize-native-order-20261107.md), [CI 42344386817](https://github.com/FlareZ123/experiment-01/actions/runs/42344386817), which shows an already removed opposing Active, six still-unclaimed actor Prizes, and `AttachEnergyPrompt` as the first choice-requiring prompt after Wait.

## Narrow ruling and consequences for research

**This exact Store sequence is in tension with the provided paper rule's ordered semantics:** the game physically applies an end-of-turn Powerglass Energy attachment while a KO's mandatory Prize-taking step has yet to resolve. The supplied manual orders Prize resolution within the attack and Powerglass afterward. The mismatch is confirmed for this test state; it does **not** demonstrate a wrongly awarded Prize count or invalid attack damage. The attack eventually took exactly one native Prize. We have no evidence that swapping the prompts would change the ultimate outcome of this already-exposed game.

The missing condition for paper-valid admission is an actual patched/replayed Store trace, retaining the exact fixed 60s and source physical deal, that orders **a completed KO/Prize before the Powerglass effect**, or an independently verified authoritative card-specific exception to the manual's default chronology. An opponent-promotion order must be judged separately because the cited §D excerpt specifies promotion explicitly in its simultaneous-KO case and does not fully describe single-KO placement timing. The direct present verdict concerns **Prize-before-end-turn Powerglass**.

A research-owned adapter regression should create the same genuine Store state in both physical seats and assert: attack KO observed, Prize prompt selected/settled, then Powerglass AttachEnergyPrompt optionally resolved, preserving the exact paper Energy card object and no third-party hidden-zone information. If the correct order causes the match to end upon the last Prize, any later end-turn Tool prompt must not be counted as competitive action. Preserve upstream Twinleaf unchanged and report pinned hashes for both before/after variants. Until such evidence exists, mark this Powerglass attack episode **native-tactical-only / paper-order-uncertified**, with zero competitively qualified Aichi games.

This adjudication directly confirms and narrows [Agent35's open paper interpretation](agent35-powerglass-e21-ko-prize-native-order-20261107.md) using the supplied reference as its stated ground truth. The shared target remains one unchanged 60 against 32 original lists; only 29 inventories are authenticated, and the win-rate target has no qualifying evidence.
