# Reusable owner-only evolution and Garbotoxin Tool action path audit

**Agent41 | 7 November 2026 | Implementation audit, not a gameplay result**

## Question

Can the root93/rank11 source response reuse existing owner-only evolution and Tool action machinery, or does it require a new Store dispatcher?

## Finding

A new Store dispatcher is unnecessary. The repository already has a native-neutral natural-evolution selector, an actor-only root wrapper that constructs the native `PlayCardAction`, and a generic owner-only Tool candidate/action boundary. A Garbotoxin-specific Tool-target selector is still missing, and the existing Tool flag is not wired to one.

## Existing natural-evolution path

1. `simulation/twinleaf/agent1-actor-evolution-frontier.cjs` exports `chooseNaturalEvolutionIntent(view, catalog)`.
2. The selector reads the acting owner's hand and public Active/Bench. It fails closed unless the global turn is greater than two, Pokémon/evolution locks permit play, an Ability evolution is not blocked by the Ability-Pokémon play lock, the printed evolution chain and stage adjacency match, the target's `lastPlayedOrEvolvedTurn` is known and earlier than the current turn, and `cannotEvolveNextTurn` is false.
3. `simulation/twinleaf/agent34-actor-only-root-policy.cjs` invokes the selector only when `naturalEvolutionRoot:true`. Its existing action switch converts `evolve-pokemon` into a native `PlayCardAction` targeting the exact Active/Bench slot. Twinleaf does not require a separate `EvolutionAction` class for this ordinary play-from-hand evolution.
4. `simulation/evaluation/agent41-bilateral-v2-development.cjs` exposes `actorNaturalEvolutionRoot`, default false, requires actor-only composition, forwards the option to Agent34, and records it in the manifest. The option currently applies to both physical seats.
5. `simulation/evaluation/agent36-issue25-common-v8.cjs` does not set `actorNaturalEvolutionRoot`. The selected v8 developmental baseline therefore does not use this evolution root. The current v9 competence runner also leaves it disabled.

The generic selector returns the first eligible Evolution in hand order. It does not prioritize Garbodor, assess the strategic value of the Ability lock, or decide whether self-suppression is acceptable. A target-specific preference is only necessary if the real hand contains competing eligible evolutions or if the policy must reject other evolutions.

## Exact root111 fit

The independently inspected Agent43 artifact 13562043261 and report `results/methodology/agent41-root93-garbotoxin-source-reply-review-20261107.md` establish this source-owned state at turn 15 / root111:

- Source hand: Garbodor BKP x1, Float Stone BKT x2, Guzma BUS, Professor's Letter BKT, Forest Seal Stone SIT x2, and Shopping Center EVS.
- Source Active: Tapu Lele-GX.
- Source Bench: Mega Absol ex, Trubbish FST, Crobat V, Latias ex, and Mega Absol ex. The Bench is full.
- Candidate Bench: Mewtwo & Mew-GX with Perfection.
- The Trubbish was already present by turn 9 (root67); no later Call for Family appears before root111.

Garbodor BKP is the only Evolution card in the recorded source hand. The full Bench means the earlier generic bench-a-Basic intent has no available slot. Given the observed turn/lock fields, enabling `actorNaturalEvolutionRoot` should therefore select Garbodor BKP onto the eligible Trubbish. This is a code-path prediction, not a native execution result.

The source's own Ability losses must be considered. Garbotoxin suppresses Abilities on both players' Pokémon, so the source may also lose access to Tapu Lele-GX, Crobat V, Latias ex Skyliner, or other own Abilities. The source holds two Forest Seal Stone and two Float Stone, and Crobat V is on its Bench. Agent2's native pinned-Store test proves that Forest Seal Stone can be attached to non-V Garbodor BKP and activate Garbotoxin; Garbodor itself does not gain Star Alchemy because it is not a Pokémon V. A distinct branch is to attach one Forest Seal Stone to Crobat V and use Star Alchemy before the lock, then attach the second Forest Seal Stone or a Float Stone to Garbodor. An FSS on Garbodor could preserve both Float Stones for mobility/retooling. The root receipt does not certify whether VSTAR Power remains unused, whether Crobat V has a free Tool slot, or what Star Alchemy can search for. Compare this branch with Float Stone on Garbodor rather than assuming one is superior.

## Existing Tool candidate/action boundary

- `simulation/twinleaf/agent18-actor-tool-candidate-frontier.cjs` exports `enumerateActorToolCandidates(view, tools)`. It enumerates only Tools in the acting owner's hand and own Active/Bench targets with an empty Tool slot, and respects Tool-play locks.
- `simulation/twinleaf/agent18-native-tool-play-action.cjs` exports `buildNativeOwnerToolCandidateAction`. It verifies the exact owner hand index, printed Tool identity, and free own target before building a native `PlayCardAction`.
- Agent34's action switch already handles `attach-tool-candidate` intents through that builder. Its card catalog already exposes `toolPrintings` derived from pinned native card metadata.
- The enumerator is structural, not strategic. A selector still needs to choose an owner-held Tool → newly evolved Garbodor BKP candidate when the opposing public board has an Ability-dependent Pokémon and when suppressing the source's own Abilities is acceptable. It should consider both Float Stone BKT and Forest Seal Stone SIT: FSS can itself activate Garbotoxin on non-V Garbodor, while Star Alchemy is only available from a Pokémon V. If FSS is used on Crobat V, Star Alchemy must be evaluated before Garbotoxin suppresses it.
- Agent34 records and forwards a `nativeToolAttachRoot` option, but `chooseActorRootIntent` has no `options.nativeToolAttachRoot` selector branch. The flag must not be treated as a working Tool attachment policy.

The older `simulation/twinleaf/rank11-garbodor-tool-maintenance-policy.cjs` is not a substitute. It only retargets an already-selected Float Stone to an existing Benched Garbodor under a narrow Mega Absol / opposing Active Mewtwo & Mew condition. Root93 has Active Unown and Benched Mewtwo & Mew, so that guard misses the relevant state.

## Ability observation and candidate response

`simulation/twinleaf/agent41-live-garbotoxin-ability-window.cjs` is a read-only observer on the genuine Store. It checks printed Abilities on both the candidate Active and Bench, so it can witness Perfection suppression on Benched Mewtwo & Mew. Configure its source/candidate seats and actual candidate turn; the default is a turn-2 diagnostic. It does not select evolution or attach a Tool.

The existing candidate Field Blower response in `simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs` reads the candidate's own hand and the public Tool-bearing Garbodor. Its default Active-Mewtwo condition misses the root93 Active Unown / Benched Mewtwo & Mew state. A broader option exists, but it must be constrained by the public Ability-lock payoff and must never infer Field Blower from the candidate's registered 60 or unknown hand.

## Paper-rule boundary

The supplied Advanced Player's Manual §A-05 says an ordinary Evolution must match the printed evolution chain, neither player may evolve during their first turn, a Basic put into play that turn cannot evolve, and a Pokémon that evolved that turn cannot evolve again. It also says a Pokémon retains attached cards, including Pokémon Tools, through evolution. The root111 Trubbish timing is consistent with the ordinary turn restriction because it was in play by turn 9 and the response is on turn 15.

Garbodor BKP's Garbotoxin is Tool-dependent. Evolution alone does not activate the lock; a Pokémon Tool must be physically attached. Agent2's report `results/methodology/agent2-fss-garbotoxin-tool-trigger-20261107.md` records a native pinned-Store FSS→Garbodor attachment that activates Garbotoxin on both physical seats. It also found that the low-level `isAbilityBlocked` helper reports Garbodor's own Garbotoxin as blocked while `CheckPokemonPowersEffect` still exposes Garbotoxin. Do not use that low-level helper to test the self-exemption; use the actual power-check effect and opposing printed Ability checks.

The paper ruling for Star Alchemy on Crobat V while Garbotoxin is active remains unresolved. The pinned engine's `exemptFromAbilityLock` behavior is not a paper ruling. A paper-qualified report must separate (a) Star Alchemy used before the lock, (b) Star Alchemy attempted while the lock is active, and (c) FSS attached to non-V Garbodor solely as the Tool that activates Garbotoxin.

Native validation must distinguish the accepted evolution root from the actual public Trubbish→Garbodor stack change, accepted Tool attachment (Float Stone or FSS), and printed Ability suppression.

## Recommended experiment

1. Keep the original physical deal and first 93 accepted roots fixed. Register a separate prospective policy profile; do not rewrite v8 historical evidence.
2. Enable the existing bilateral `actorNaturalEvolutionRoot` for the common actor-only policy. Because it is symmetric, it is suitable for a common-policy experiment; a source-only diagnostic would require an explicit physical-seat gate.
3. Add a narrow Garbotoxin Tool-target selector that consumes the existing Agent18 enumerator and builder. It should use only the acting owner's hand/board and the opponent's public Ability board, consider both Float Stone and FSS, and preserve a usable pre-lock Star Alchemy line when the actual VSTAR state permits it.
4. Include negative controls for missing/new Trubbish, absent Garbodor, absent Tool, Tool-play lock, no opposing Ability-dependent Pokémon, and harmful own-Ability suppression.
5. On the live Store, require the accepted evolution action, physical stack mutation, accepted Float Stone attachment, and actual printed Ability checks on candidate Active and Bench.
6. Capture the candidate's own hand at its first post-draw decision. Use Field Blower only if physically held and selected. Then continue the full candidate/source game, including the source's spare-Float-Stone retool branch where legal.
7. Keep the immediate Box/Fog KO separate from delayed Powerglass. Latias ex Skyliner can affect the latter's timing; it cannot reverse a KO that already settled.

## Existing validation and limitations

- `tests/agent1-actor-evolution-frontier.test.cjs` tests the pure selector and a fake Store that accepts the typed action and mutates an evolution stack.
- `results/twinleaf/agent1-natural-evolution-root-paired-native-20261021.md` reports four changed typed evolution roots across three of four historical arms. It explicitly says typed counters do not authenticate the physical evolution stack or payoff and calls for a targeted native observation.
- `tests/agent18-actor-tool-candidate-frontier.test.cjs` tests detached owner-only Tool enumeration. The action builder is a construction boundary, not proof of native Store acceptance or a useful Garbotoxin attachment.
- Agent2's `results/methodology/agent2-fss-garbotoxin-tool-trigger-20261107.md` provides a native pinned-Store witness for FSS attachment to non-V Garbodor and Garbotoxin activation on both seats. It does not resolve the paper ruling for Star Alchemy while Garbotoxin is active.
- No compiled native root93 Garbodor evolution + Float Stone + Perfection-suppression sequence is established by this audit.

**Conclusion:** Reuse Agent1/Agent34 for natural evolution and Agent18 for Tool enumeration/action construction. Add only the missing owner-only Garbotoxin target selector, compare Float Stone and FSS sequencing, and capture the required native receipts. This is an integration path, not a matchup win result, deck recommendation, or evidence for the 99.5% target.
