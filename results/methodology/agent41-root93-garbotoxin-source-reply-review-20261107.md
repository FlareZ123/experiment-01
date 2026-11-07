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


## Candidate-side Garbotoxin answer in the competing Lillie branch

I independently downloaded Agent44's four-seed native Lillie KO artifact **13564455521** (ZIP SHA-256 `3edeca8e10f653fa74ce58c6d7527b2635ab108c700a87ea306f90406afe65e7`). Seed 101's actual eight-card Lillie hand contains `Field Blower GRI`; after the Energy attachment and Hidden Power KO, Field Blower remains in the candidate's hand. This gives that specific exposed shuffle a direct candidate-side answer if the source later establishes Garbotoxin. Seeds 202, 303 and 404 do not draw Field Blower; seeds 303 and 404 do retain Secret Box in hand, so a later search for Field Blower is a possible line whose discard cost and availability have not been tested.

All four Lillie branches leave the source's `ChoosePokemonPrompt` for promotion unresolved. They do not execute the source turn or a Garbotoxin response. The seed-101 Field Blower is therefore a concrete available candidate response in the frozen hand, not an observed removal. The candidate remains Active Unown AOR in these branches. The existing `newmoon-garbotoxin-blower-autonomy.cjs` default Active-Mewtwo predicate would miss the held Field Blower in this position unless its broader option is enabled and constrained by the public Ability-lock payoff.

This makes the same-root choice a genuine AMR/DCI tradeoff, consistent with the human-concepts model in `human_concepts.md`: Secret Box guarantees a targeted line when Fog and Basic Psychic are in the deck, at the cost of the ACE SPEC and three discards; Lillie uses the Supporter and eight-card shuffle, preserves Secret Box and both Rescue Carriers, and has a 72.40717% conditional chance of drawing at least one of the three Energy or three Fog Crystal from the exact 44-card pool. The four seeded Lillie branches each took the Prize, but the sample is post-exposure and has no source turn. Future comparison must include the source Garbotoxin response, the candidate's Field Blower/Secret Box answer, and subsequent source retooling before ranking either line.


## Original-field prevalence of the Garbotoxin interaction

I counted card identities directly in the repository's authenticated `results/aichi-2026/full-decklists.json` (29 source 60s; ranks 23, 25 and 28 remain missing). Four source lists contain the Trubbish/Garbodor package:

| Rank | Garbodor | Trubbish | Float Stone | Field Blower |
| --- | ---: | ---: | ---: | ---: |
| 8 | 2 | 2 | 4 | 1 |
| 11 | 2 | 2 | 3 | 0 |
| 16 | 3 | 2 | 4 | 0 |
| 22 | 2 | 2 | 4 | 1 |

That is **4/29 (13.79%)** of the currently authenticated field, with 3-4 Float Stone in each list. Two of those four also contain one Field Blower. Across the full 29-list inventory, nine lists contain Field Blower. The New Moon candidate contains two Field Blower, so Garbotoxin/Tool exchange is a real field-facing interaction for this candidate. These are inventory counts only; they do not establish the source's opening access, the matchup result, or the missing three opponents.


Agent44's complete same-root action comparison is [here](agent44-root93-lillie-versus-secretbox-randomized-20261107.md). A further untested hybrid remains available: pay Secret Box with VIP/VIP/Carrier (or VIP/VIP/Lillie), search Fog Crystal and Basic Psychic, attach the Energy, then play the remaining Lillie before attacking. This can preserve the deterministic attack setup while drawing a new hand that may contain Field Blower for the source's next-turn Garbotoxin. The physical deck changes after the two searches, so Agent44's 72.40717% Lillie-only probability does not apply. Test this as a separate same-prefix arm and rank it by the downstream source response and card-custody cost.


## Keep the delayed Powerglass branch separate from the immediate Box/Fog KO

Agent36 correctly identified a separate source response against the delayed Powerglass line. The rank-11 source has Benched `Latias ex SSP 76` with Skyliner, whose printed Ability gives the source's Basic Pokémon no Retreat Cost. The damaged Active `Trubbish FST` is Basic. If the candidate passes at root 93 and waits for a later Powerglass/Hidden Power attack, the source can retreat that Trubbish for free before the attack, preserve it on the Bench, and potentially evolve it into Garbodor with a held Tool. A delayed Powerglass line must therefore model this retreat and subsequent Garbodor setup.

That retreat cannot undo the **immediate** Box/Fog Hidden Power KO, which settles on the candidate's turn before the source receives another turn. The root111 Garbodor response documented above is a different event: after the immediate KO, the source's other Trubbish is already on the Bench and can evolve. Keep the two source responses and their timing separate in any same-deal response tree.


## Consolidated root93 action frontier

| Candidate branch | Immediate evidence | Resource cost | Source response coverage |
| --- | --- | --- | --- |
| Secret Box → Fog Crystal → Basic Psychic → attach → Hidden Power | One real native KO and physical Prize; source promotion and turn-15 Pass were recorded | ACE SPEC plus three discards. Agent43 used two VIP and one Carrier; Agent44 also tested two VIP and one duplicate Lillie | Source turn 15 was played, but the eligible Garbodor + Float Stone response was missed. Candidate response to the resulting lock remains untested |
| Lillie → eight-card draw → Energy/Fog → attach → Hidden Power | Four seeded native branches each settled the KO and physical Prize | One Supporter and an eight-card shuffle; preserves Secret Box and both Rescue Carriers | Source promotion prompt remains unresolved in all four branches. Seed 101 holds Field Blower; seeds 303/404 hold Secret Box. No source turn or lock response was played |
| Secret Box → Fog Crystal → Basic Psychic → attach → Lillie → Hidden Power | Untested same-root hypothesis | ACE SPEC, three-card payment, then Supporter and eight-card draw; may improve the next-turn answer to Garbotoxin | Requires a full source Garbodor turn, candidate Tool removal, and source retooling |
| Pass → delayed Powerglass/Hidden Power | No reliable paper KO witness | Preserves the immediate hand but delays the attack | Source Latias ex Skyliner can retreat the damaged Basic Trubbish before the attack; Powerglass E-21/KO ordering also has a separate paper/native dispute |

This frontier is a retrospective decision comparison, not a strategy ranking. The immediate Box/Fog and Lillie branches both prove a narrow one-Prize opportunity. Their different resource costs and unplayed source replies prevent a strength conclusion.


## Secret Box category constraint for any pre-emptive Field Blower line

The local card-pool entry for Secret Box (`sv6-163`, TWM 163) searches for **one Item, one Pokémon Tool, one Supporter, and one Stadium**. Fog Crystal and Field Blower are both Items, so a single Secret Box resolution cannot select both. The root93 policy comparison must choose its Item slot: Fog Crystal for the deterministic Basic Psychic route, or Field Blower for a pre-emptive Garbotoxin answer with Energy supplied through another legal route such as Lillie or the FSS/Articuno branch. A Box/Fog line may still use the other categories for a Tool, Supporter and Stadium. This corrects Agent36's initial proposed Box/Fog plus Box/Field Blower prompt arm; the exact native prompt must enforce the category limit.


The current Agent43 adapter's `choosePhysicalOwnerSearchOrWhiff` returns a one-card selection, and its artifact records the Fog Crystal prompt but not the full Secret Box category maxima or any Tool/Supporter/Stadium selections. This may leave up to three legal Secret Box categories unused. The next native audit should record the complete prompt contract and physically offered cards in all four categories. A policy can then select Fog Crystal as the single Item and consider one useful Tool, Supporter and Stadium. Field Blower remains mutually exclusive with Fog Crystal in the Item slot.


The four field packages above are confirmed as **Garbotoxin** printings, not merely cards named Garbodor: rank 8 uses LTR 68 (`bw11-68`); rank 11 uses BKP 57 (`xy9-57`); rank 16 uses two LTR 68 and one BKP 57; rank 22 uses two BKP 57. The local card pool gives both `bw11-68` and `xy9-57` the Garbotoxin Ability text. Across these four lists there are nine Garbotoxin copies in total.


## Additional candidate-side Powerglass line on Active Unown

The root93 candidate owner hand also contains `Powerglass SFA`; the candidate's public discard has two Basic Psychic Energy, and Active Unown AOR has no Tool attached. Powerglass's printed end-of-turn effect applies to any Pokémon it is attached to that remains Active. Attaching it to Unown before Hidden Power should expose an owner-only prompt to attach one of those Basic Psychic Energy after the attack, Knock Out and Prize sequence. This can happen before the source's next-turn Garbotoxin response. The extra Energy attaches to Unown, so its retreat/next-turn utility must be measured separately; it does not directly power Benched Mewtwo & Mew-GX.

The current `agent41-owner-powerglass-attach-prompt.cjs` requires Active Mewtwo & Mew-GX, and the staged `agent41-powerglass-after-pass-native.cjs` covers only Mewtwo. The shared v9 profile does not invoke the owner prompt hook. Root93 Active Unown therefore falls outside the current policy. This is a candidate-side action hypothesis requiring a native owner-prompt test with Active Unown, both-seat observation checks, and the existing paper order of attack → Knock Out/Prize → end-of-turn Powerglass. Garbotoxin should be tested against the Tool effect directly; it suppresses Pokémon Abilities, and the Powerglass trigger is a Tool effect. Do not infer a Mewtwo attack from the Energy attached to Unown.
