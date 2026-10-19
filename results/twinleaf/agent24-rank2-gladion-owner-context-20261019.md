# Source rank-2 Gladion turn-5 owner-board context: retrospective qualification audit

**19 October 2026, Agent 24. Evidence class: source-dealt, retrospectively selected decision-observation replay.** This follows Agent 40's frozen eight-attempt Gladion source cohort and its owner-revealed, post-choice Prize inventory. It is a **development fixture**, excluded from all candidate-versus-field win-rate denominators.

## Question and registered test

The unchanged rank-2 Vileplume original 60, facing unchanged rank-1 Shadow Rider original 60, genuinely played Gladion on original source seed **20261024**, rank-2 physical seat **1**, global turn **5**, and selected **Relicanth TEF** at root choice ordinal **47**. The already owner-revealed Prize options included **Technical Machine: Evolution PAR**, **Gloom UNB**, **Vileplume-GX CEC**, **Herdier SUM** and **Lusamine CIN**. Can we establish from the *same owner's visible board, hand and discard at that exact legal root* whether an alternate evolution-related selection had a present strategic route? We must inspect current Active/Bench Pokémon and existing tools, evolve stages, Supporter use, own visible resources, opponent public board and the subsequent actual actor actions. Printed card presence alone does not establish an improved line.

The [read-only owner-context extension](../../simulation/twinleaf/gladion-root-prize-choice-evidence.cjs) is enabled only through `runMatch({captureGladionRootPrizeChoices:true,captureGladionRootChoiceContext:true})`. It executes only after a real `ChoosePrizePrompt` with Gladion staged and the entire owner's Prize inventory actually revealed. It snapshots own hand and discard and both **public** boards immediately before and after the selected response. It does not read hidden deck order, concealed opponent hand or unseen Prize cards for a decision. There is no replacement of the generic selected choice.

The [frozen replay](../../simulation/twinleaf/agent24-rank2-gladion-turn5-context.cjs) executes this one authentic source deal twice with the exact same original 60s, seed, profile, corrections, action limit (300), and game label. Only the opt-in observer differs. It asserts equality of actual first turn, deck hashes, full live-root action ledger, card plays, attack declarations, terminal state, action count, and previously existing Gladion Prize-selection evidence after omitting the added contextual field. It fails closed if actual root **47** is absent, the selected Relicanth printing differs, the legal owner choice contains no TM: Evolution, or context is missing. The [pure tests](../../tests/agent24-gladion-owner-context.test.cjs) verify that context is detached, optional, inaccessible before full Prize revelation, and never touches hidden own deck or opponent hand.

### Falsification and interpretation before execution

- **Observer interference, a missing real prompt, or a different physical source decision** invalidates this replay. Record the failure, preserve the original source cohort and do not infer an alternative tactical opportunity.
- **Board and hand do not support an immediate TM: Evolution line:** record that as an explicit negative for immediate evolution advantage. A later strategic use remains possible and untested.
- **Some public/owner-visible line appears promising:** preserve its exact constraints, but treat TM/Gloom preference as an untested, retrospectively generated hypothesis. Demonstrating superiority would require a separately executed and prompt-closed legal alternative followed by a genuine source continuation and opposing response. This record alone cannot make that conclusion.
- The generic opponent and actor policies remain unqualified, hidden-information-safe full gameplay and official clock are unresolved. **Competitive-qualified games = 0.** No 99.5% claim.

The pre-dispatch commitments are the seed and actor slot above, first observed response ordinal **47**, one paired two-arm replay, all comparator assertions, and one archived JSON. This is not a fresh prospective game sample. The bounded job is manual-only `.github/workflows/aichi-tm-attack-policy.yml`, input `rank2_gladion_turn5_context:true`; do not infer outcome skill from successful CI.

## Execution and analysis

### First compiled execution and a discovered telemetry defect

Manual [workflow 39311590506](https://github.com/FlareZ123/experiment-01/actions/runs/39311590506) **passed** at head `542c42c289ca55899d22077311e2d3369a7a2764`, including three new pure tests, two original-deal replay arms and unchanged 285-root-action/terminal-equivalence assertions. Archived JSON: [artifact 12216091430](https://github.com/FlareZ123/experiment-01/actions/runs/39311590506/artifacts/12216091430); ZIP SHA-256 `a8e08494d21cb6ffb850cdb1c14a01784ea7310512b3abb8b5995d1dc539a326`, JSON SHA-256 `bfbe351d11ec9747dc7f4f05be509da53852ec63abcea106d9ba2e34a4f7948d`.

The first capture showed **Fan Rotom SCR Active with Jet Energy PAL**, **Lillipup CEC and Mr. Mime PLF** Benched, **Great Tree SCR** Stadium in play, hand `Tag Call CEC, Pidgeotto TEU, Pidgeot ex OBF, Artazon PAL`, and discard `Guzma & Hala CEC`. Opponent's public Active was Marshadow UNB; the five public Benched Pokémon included Shadow Rider Calyrex VMAX. The generic Gladion action selected **Relicanth TEF** at ordinal 47; the next real own nonprompt action at ordinal 48 played **Relicanth**, and the first later opponent nonprompt action at ordinal 58 attached **Psychic Energy**. Six source Prizes genuinely revealed at the root were `Relicanth TEF`, `Technical Machine: Evolution PAR`, `Herdier SUM`, `Vileplume-GX CEC`, `Lusamine CIN`, and `Gloom UNB`.

**Correction identified on critical review:** the initial observer incorrectly interpreted `player.supporterTurn` as an absolute turn number (`===state.turn`). Pinned [Play Trainer reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/play-trainer-effect.ts) increments this field as a per-turn **count** (`+=1`). Consequently the original JSON's `supporterAlreadyPlayed:false` was a telemetry error and **must not be interpreted as actual Supporter availability**. The observer has been corrected to `supporterTurn>0`; the fixed extension also records the actual once-per-turn `stadiumUsedTurn===state.turn` and public own Lost Zone, with extra regression tests. Reexecute the identical fixed source seed only as a corrected replay; no new sample or independent evidence.

### Tactical interpretation and remaining gates

The live root contains **no Oddish on the Bench**, making a retrieved Gloom of no immediate normal-evolution use. The **Lillipup** could be a Stage-1 evolution target if its remaining Herdier is available. `Technical Machine: Evolution` is a Tool granting a Colorless-cost attack that could evolve eligible Benched Pokémon from the deck. At the same time, **Grand Tree was already in play** and its printed effect can evolve one eligible Basic Pokémon by searching for a Stage 1 and optionally its Stage 2, subject to turn-in-play and access constraints. Whether Grand Tree's use was available or already spent on that source turn, whether the relevant Herdier and Stoutland remained in deck, and how the source/defending player would respond are **not established by the first capture**. A straight substitution to TM or Gloom is therefore not justified.

Both arms retain **zero competitively qualified games**. This single real-root diagnostic is a potential development fixture for Stadium-action decision-policy quality, not an unbiased demonstration of superior Gladion selection.



### Corrected second execution and stage-opportunity follow-up

Manual [workflow 39312542980](https://github.com/FlareZ123/experiment-01/actions/runs/39312542980) **passed** at head `cdb503711657332e0881303ecec39e38837d3a75`. Its [corrected archive 12215673119](https://github.com/FlareZ123/experiment-01/actions/runs/39312542980/artifacts/12215673119) has ZIP SHA-256 `025fb7e1e4f606afee3a968376d0ec4ce51cf5341aa35d04753a6fde8ee479ab` and JSON SHA-256 `5b81b28d9951a9afdb6c25e86373c19fe063ca52c5e6acca2adac5d7f4f9ec40`. The baseline and observed source game still have identical root ledger SHA-256 `0a4ff8e373a47d71a70699ace31ad409485850ad503f7949c1b26b4b73b39b40`, 285 root actions, chosen Relicanth and next actions.

The corrected **turn-5 root** metadata now records:
- `supporterAlreadyPlayed:true`, correctly indicating that Gladion spent the Supporter for the turn.
- `stadiumEffectUsedThisTurn:false`, so the original player had **not yet used** the Grand Tree Stadium's once-per-turn effect when choosing a Prize.
- `stadiumPlayedThisTurn:false`, meaning Grand Tree was established before this turn.
- An **empty own Lost Zone**, and a complete owner-visible hand, discard, field and revealed Prize set containing neither the source's only Stoutland nor its second Herdier. Subject to accurate printed source registration and no omitted zone, those evolution cards would therefore still be in the deck.

One unresolved eligibility variable is whether **Lillipup entered play during global turn 5**. The printed Grand Tree effect forbids evolving a Basic placed that turn. The source has Lillipup Benched and unused Grand Tree, but the board snapshot alone omitted Pokémon entry-turn history. The third, **identical-seed read-only replay** is registered specifically to append the public `pokemonPlayedTurn===state.turn` field to each displayed Pokémon and the full actor's already-executed pre-Gladion root `PlayCardAction` history. It again compares the unmodified physical game and selected Gladion, with no changed decision policy. If Lillipup was just played, reject the immediate Grand Tree/Stoutland opportunity. If Lillipup was present from a prior turn, this supports a **candidate** legal Grand Tree `Lillipup → Herdier → Stoutland` action line that still needs a real Store action and a consequential opponent response before any improvement claim. One same-source read-only replay is appropriate for this eligibility question; do not initiate broader Gladion sampling.

This is a mechanical-competence investigation of a ranked **opponent policy**, and no player-list advantage or competitively qualified game result follows from it.
