# Authentic rank-10 copied Kaiser Tackle effect and opponent's next turn

**Agent 12, 18 October 2026.** Mechanically verified, source-dealt, fixed-seed **positive-control** packet. This is a legal-in-engine interaction and subsequent weak-bot response audit, **not** a competitive game-win observation. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Frozen source and observer noninterference

- The original Aichi 2026 exact published print-resolved 60-card lists are rank **10** Haruku Yoshioka Regidrago, engine physical A, and rank **1** Yasunori Kato Shadow Rider Calyrex, physical B. Both source manifests resolve as playable 60s under existing engine translation.
- Fixed historical seed `4246551499`. Actual first turn belongs to physical **B**, proven from Twinleaf source draw logs, so rank-10 Regidrago goes second.
- The earlier archived Double Dragon v3 flags, other research flags and the original generic bot are held fixed within the paired comparison. **169 real root Store actions**, terminal at global turn **16**, rank10 engine winner with remaining Prizes `[0,4]`.
- [Executable research observer](../../simulation/twinleaf/copy-session-ranked-effect-reply.cjs) intercepts **only the first AddPlayerAction Store**, recording physical public-board snapshots after policy has already chosen a root action. It does not inspect hidden opponent cards for decisions or submit actions.
- A separate ordinary run and read-only-observed run have the **same** SHA `271bd422a07676c0da12ecb9f2d1c94e0735f35f1d1f4ab546496e31d0cd423a` over 169 root actions, source attack declarations, selected decision details, terminal transition, final Prizes and engine winner. The observer captured exactly **169/169** root dispatches.
- [Manual compiled Apex CI 39169445003](https://github.com/FlareZ123/experiment-01/actions/runs/39169445003) **passed**, including the new positive-control source effect-to-reply test and previous session regressions. The test's raw structured log is prefixed `SOURCE_COPY_EFFECT_REPLY`.

## Exact source-selected attack

| Authentic Store ordinal | Actor/action | Direct recorded consequence |
| ---: | --- | --- |
| 146, global turn 14 | Rank10 Regidrago VSTAR **AttackAction: Apex Dragon** | Attack declared, `ChooseAttackPrompt` opens |
| 147 | Source-choice `ResolvePromptAction` | Chose **Koraidon ex TEF, Kaiser Tackle**, attack index 1; opponent's Active Trevenant & Dusknoir-GX takes **0 → 280** damage; copying Regidrago VSTAR takes **200 → 260** damage |
| 148 | `WaitPrompt` resolution | Knocked Out opponent Active Trevenant & Dusknoir-GX leaves play |
| 149 | `ChoosePrizePrompt` | Rank10 remaining Prizes **4 → 1**, consistent with three Prize cards from a TAG TEAM Knock Out |
| 150 | `ChoosePokemonPrompt` | Rank1 promotes **Dialga-GX** from the Bench |
| 151 | `WaitPrompt` | Turn transition without further public-board change |

The Regidrago had **Grass, Fire, Grass** Energy attached when Apex Dragon was declared. Its printed 280 HP, beginning damage 200 and copied self-damage 60 leave it at 260 damage and **20 HP remaining**, as the public source snapshots confirm.

Independent supplied card-list printings cross-check these narrow mechanical expectations:

- **Regidrago VSTAR, SIT 136:** `Apex Dragon` costs Grass + Grass + Fire; it uses an attack from a Dragon Pokémon in the player's discard pile.
- **Koraidon ex, Temporal Forces 120:** `Kaiser Tackle` deals **280 damage** and does **60 damage to its own attacker**.
- **Trevenant & Dusknoir-GX, SM217:** **270 HP**, TAG TEAM rule awards **three Prize cards** when Knocked Out.
- Supplied *Advanced Player's Rulebook* C-18 explains using another Pokémon's attack including damage and effects without paying that selected attack's Energy cost unless otherwise specified. C-01, A-01 and the Knock Out section determine the observed step order. These source descriptions support this one printed base interaction; modifiers, source-card coverage and other cases remain separate questions.

The actual source game recorded exactly the expected unmodified **280 target damage / 60 self-damage** at the **source-choice prompt**, then explicit later Knock Out and Prize transitions. An effect-to-GameEnd conclusion would be incorrect here: this attack was **nonterminal**.

## Actual ensuing opponent response

The following full **opponent global turn 15** is present in the same source, with root ordinals **152–156**:

1. Root 152: `ResolvePromptAction`;
2. Root 153: rank1 plays **Marshadow**, adding it to the Bench;
3. Root 154: rank1 plays **Forest Seal Stone**;
4. Root 155: rank1 chooses **PassTurnAction**, making no attack;
5. Root 156: `ResolvePromptAction` finishes the ensuing turn transition.

At the previous source turn's root150, rank1's new Active **Dialga-GX** had **zero Energy**. The observer proves what the generic bot did and its public-board consequences. It does **not** establish that passing was strategically optimal, forced by all legal alternatives, or representative of a competent human playing rank1's source list. Rank1's exact hand at its Pass and the root decision legal-option set need a separate postchoice information-set audit before labeling that reply competent.

## Where this upgrades research evidence

This is a coherent **attack declaration → exact printed copied-source selection → observed physical damage/self-damage → actual Knock Out → three Prize transfers → real opponent's subsequent actions** packet on a fully dealt published-source matchup, under one versioned policy and with explicit observer noninterference. It advances beyond an injected Card effect or an attack log disconnected from its consequences.

**Unclosed qualification gates:** full root-input/reducer replay independent of these selected observations; paper-rule interaction coverage beyond the printed direct base values; ability/tool/damage modifier completeness; opponent's legal opportunities and hidden-information-safe action evaluation; candidate/opponent autonomous tactical competence; representative both-turn-order cohorts; the three unpublished 60s of the full Aichi Top32 field. The completed engine game is **not** eligible as a competitive win-rate datum, and the 99.5% target remains unproven.


## 19 October 2026: full-game bot-decision source Card mutation and opt-in detachment

**New compiled result; scope remains mechanical and diagnostic.** The original reproducible exact rank10-versus-rank1 seed `4246551499`, identical v3 flags, original pinned engine and source 60s were audited across every synchronous `SimpleTacticsAi.decodeNextAction` in `simulation/twinleaf/copy-session-ranked-effect-reply.cjs`, using the existing research-owned `bot-decision-card-boundary-observer.cjs`. The observer snapshots own primitive / flat primitive-array properties on **physical Card objects in the live game zones**, immediately before and after the bot chooses an action. It does not submit a new policy action.

[Compiled CI 39236181875](https://github.com/FlareZ123/experiment-01/actions/runs/39236181875) passed and established that adding the read-only observer maintained the existing 169 genuine Store roots, first-player draw-log verification and the original versus observed root/effect/outcome digest equality. It did **not** prove that the bot's decisions were pure. A subsequent **intentional red integrity assertion** in [CI 39236870524](https://github.com/FlareZ123/experiment-01/actions/runs/39236870524) exposed **47 surviving physical Card property changes during decisions**:

| Field | Changed instances |
| --- | ---: |
| `movedToActiveThisTurn` | 17 |
| `damageTakenLastTurn` | 8 |
| `cannotUseAttackUntilLeavesPlay` | 11 |
| `whileInPlayOpponentWeakness` | 11 |
| **Total** | **47** |

The latter two fields were **added with undefined values**. At decision 5 on global turn 1 the observer found newly added fields on Tapu Lele-GX. At decision 8, `movedToActiveThisTurn` changed from false to true on Tapu Lele-GX, Mimikyu and Trevenant & Dusknoir-GX while the returning bot action was `PassTurnAction`. These are source-card mutations during action *selection*. Source damage history and turn-movement fields can be relevant to later rules or scoring, so the distinction matters. The exact observed trajectory was unchanged by *watching* those decisions; these records do not establish that the writes actually altered this game or any match winner.

The third arm installs existing reversible `installPostSuperAliasRepairHook` for speculative `Simulator` copies, retains the same fixed decks, historical seed, initial deck hash and authentic start seat, and independently observes its bot Card boundaries. [Compiled CI 39237410975](https://github.com/FlareZ123/experiment-01/actions/runs/39237410975) **passed a strict assertion of zero primitive Card-field changes** across all observed decisions in that opt-in arm, with positive real-decision coverage. The script emits both trajectories' digests and an explicit `rootLedgerSameAsRaw` comparison. Matching *initial inputs* was asserted; **identical downstream actions or outcomes were not a passing precondition**, so this test must not be cited as proving repaired and stock game equivalence. The opt-in hook is not enabled in ordinary headless tests or bilateral-v2 evaluation by this result.

**Limitations:** physical Card scalar snapshots exclude references nested outside canonical scanned zones, effects that mutate and restore before the decision returns, module-level registries, hidden-information use, incomplete printed card rules and independent opponent policy competence. Forty-seven is a count of detected field changes in this single frozen source game, not an exhaustive engine-wide mutation count. The repaired zero is bounded by the same observer. This source match is a retrospective regression fixture; no competitive win-rate sample or 99.5% claim follows.
