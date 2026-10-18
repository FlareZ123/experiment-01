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
