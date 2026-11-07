# Agent41 independent review: rank-11 source missed a Garbotoxin response after the Box/Fog knockout

**Agent41 | 7 November 2026 | retrospective native-artifact review with a paper-rule response audit.** This note adds an opponent-side response check to the Agent43 root93 Secret Box treatment. It does not qualify a competitive game or estimate matchup strength.

## Frozen evidence

- Trial: `11:1000:B:new-moon-lockbreaker-v1`; source seat 0, candidate seat 1; physical deal fingerprint `94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7`.
- Agent43 native artifact: Actions artifact **13562043261**, downloaded ZIP `agent43-root93-box-fog.zip`; extracted attempt JSON SHA-256 `d2dcd36933e710708bd79d0148c7fbd864fa41abdcd0f41663db1d8c9444929e`.
- Treatment root-ledger SHA-256: `a6d3eb071ec1571d925183900eb4c8838a97139114f886413ddb5a6dd5c4144e`; pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Agent43's read-only post-settlement audit verifies the first 93 accepted roots are identical to baseline. The treatment then pays Secret Box with two physical Battle VIP Pass and one Rescue Carrier, retrieves Fog Crystal, retrieves Basic Psychic Energy, attaches it to Active Unown AOR, and uses Hidden Power to Knock Out the 60-damaged Trubbish FST. Candidate Prizes move 6 to 5; the source promotes Tapu Lele-GX. The source later plays Mega Absol ex at root 110 and passes at root 111. The candidate uses Hidden Power again at root 114. The treatment reaches 260 accepted roots with no winner and Prizes [5,3]. The baseline is a separate 209-root unqualified source win. These outcomes remain retrospective and unqualified.

## Missed source-side response at root 111

The artifact's `nativeAllOwnerPassFrontier` records the source's own hand and both public boards at its actual turn-15 Pass. The source hand contains:

- Garbodor BKP x1
- Float Stone BKT x2
- Guzma BUS
- Professor's Letter BKT
- Forest Seal Stone SIT x2
- Carmine TWM
- VS Seeker PHF
- Shopping Center EVS

The source board has Active Tapu Lele-GX and Benched Mega Absol ex, Trubbish FST, Crobat V, Latias ex, and Mega Absol ex. The bench Trubbish has no Tool attached. None of the source Pokémon has Energy attached. The candidate board includes a Benched Mewtwo & Mew-GX with its Perfection Ability.

The source had a straightforward, paper-legal defensive action available:

1. Evolve the Benched Trubbish FST into the held Garbodor BKP.
2. Attach one held Float Stone to that Garbodor.
3. Garbotoxin becomes active and suppresses Pokémon Abilities in play, hands, and discard piles, with Garbotoxin itself exempt. This includes Perfection on the candidate's Benched Mewtwo & Mew-GX.

The Trubbish was already on the source Bench before turn 15. The source's last Call for Family attack occurred at root 67 on turn 9; root 111 is turn 15, and no later Call for Family appears in the action ledger. The board still shows Trubbish, so it had been in play for at least six turns. It was eligible to evolve. The source hand and public board establish the required physical Garbodor and Tool objects, and the Trubbish had no Tool. The line requires no Supporter and no manual Energy attachment.

Card identity and text are grounded in the local card pool: `resources/cards/en/xy9.json` entry `xy9-57` is Garbodor BKP 57, a Stage 1 that evolves from Trubbish and has Garbotoxin; the Ability becomes active while the Pokémon has a Pokémon Tool attached. `resources/sets/en.json` maps XY9 to BKP. The source's registered rank-11 60 contains two Trubbish FST, two Garbodor BKP, and three Float Stone BKT. The turn-15 source receipt records the required physical Garbodor and two Float Stones in hand.

This line would not prevent the already completed Hidden Power attack. It would change the candidate's next-turn Ability access by shutting off Perfection and other Abilities. The source instead played Mega Absol ex and passed. The source's no-attack turn is correctly recorded; the current evidence does not establish that this was its strongest response.

## Interpretation and next validation

This is a concrete source-policy competence gap in the historical treatment. It weakens any interpretation of the treatment's one-Prize lead as a robust tactical advantage. The source-side response is visible from the source's own hand and public board, so it is legitimate input for a source policy. It must remain unavailable to the candidate's actor observation.

Recommended next experiment:

- Fork the same frozen physical deal after the 93-root common prefix.
- Add a source-independent, owner-only response rule that considers evolving an eligible Trubbish into Garbodor BKP and attaching a Tool when the opponent has valuable Ability-dependent board pieces.
- Run the same rule for either physical seat, using only that seat's own hand, own board, and opponent public board.
- Record native Store acceptance and the actual Garbotoxin state. Include negative controls where Trubbish is too new, Garbodor or Tool is absent, or the Ability lock would disable more valuable own effects.
- Continue the candidate's full response and preserve the full game result. Do not infer a win from the one Prize or from the source's previous Pass.

The turn-15 receipt also contains Forest Seal Stone x2, Professor's Letter, Guzma, and VS Seeker. Dark Patch and Darkness Energy appear in the original source 60. Their exact current deck/Prize locations and VSTAR-use status are not certified by this artifact, so any energy-recovery or gust sequence remains a separate K1 audit question.

Two additional cross-agent constraints matter for broader Secret Box research. Agent49's registered-field audit finds Box plus Fog in 0/29 authenticated original source 60s. Agent21 finds Box plus Night Stretcher in 3/29 (ranks 8, 19, 22), and separately proves staged native Box-to-recovery-Item-to-Basic-to-KO/Prize paths on both seats. Those staged paths are mechanical controls, not natural source games. A reusable policy should generalize payment choice and Item target selection with owner-visible gates; the current Box/Fog recipe has narrow field compatibility.

**Status:** one retrospective native KO/Prize settlement; one source-side paper-legal counterline identified from owner-private evidence; no complete qualified matchup, no field win rate, no selected final 60, and no demonstrated 99.5%.


## Cross-checks against existing Garbotoxin work

This exact root111 omission is a new physical-state witness. The underlying source retool mechanic has prior native evidence: [Agent1's rank-11 turn-3 retool counterfactual](../aichi-2026/agent1-source-garbotoxin-turn3-native-retool-counterfactual-20261101.md) shows the original source reattaching Float Stone to Garbodor after a real Field Blower removal in a different physical deal. [The earlier rank-11 response study](../aichi-2026/rank11-garbotoxin-field-blower-response.md) also identifies the source's spare Float Stone and retool option. The current finding adds a distinct turn-15 state where the source had Garbodor and two Float Stones in hand and passed with an eligible Trubbish on Bench.

The candidate's fixed 60 contains two Field Blower. An existing candidate-side response module, [newmoon-garbotoxin-blower-autonomy.cjs](../../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs), already screens public Tool-bearing Garbodor and owner-held Field Blower. Any full same-deal fork should compose this existing candidate response with the source's Garbotoxin line and subsequent retooling, rather than create a duplicate Field Blower handler. The source's rank-11 list contains three Float Stone, so the exchange can continue beyond the first Tool removal.

Forest Seal Stone is a separate unresolved interaction. [Agent30's rule-fidelity review](../aichi-2026/agent30-garbotoxin-forest-seal-stone-rule-fidelity-gap-20261105.md) documents a paper/native discrepancy candidate for Star Alchemy under Garbotoxin. The Forest Seal Stone copies in the turn-15 source hand therefore do not establish a reliable search route while Garbotoxin is active. The immediate Garbodor-evolution plus Float Stone line above does not depend on Star Alchemy.


The preceding `Mega Absol ex` play does not close the source turn. The local card pool identifies `Mega Absol ex MEG 86` as a **Basic** Pokémon, with its Mega Evolution ex rule awarding three Prizes when it is Knocked Out. The supplied Advanced Player's Rulebook gives the same three-Prize rule and no turn-ending clause. The native action ledger then records an explicit `PassTurnAction` at root 111. The source still had a legal opportunity to evolve the existing Bench Trubbish and attach Float Stone before choosing to pass.
