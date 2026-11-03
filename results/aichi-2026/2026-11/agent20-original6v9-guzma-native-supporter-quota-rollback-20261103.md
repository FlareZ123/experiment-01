# Agent 20: native Supporter proposal-state corruption and fully settled Guzma counter-counter

**3 November 2026 | original Aichi 2026 ranks 6 vs 9 | one authentic physical deal | developmental native evidence**

## Executive finding

On a registered original source state at global turn 12, the pinned unmodified `SimpleTacticsAi` returned `PassTurnAction` while holding three copies of `Guzma BUS`. The normal owner Supporter counter was **zero immediately before** that bot's decision, then became **12 immediately after its own proposed action**, before any Store action was played. The native proposal pathway therefore polluted the real state with a false "Supporter already played" marker.

A preregistered, research-side v3 correction restored this **single player field** from 12 to the captured pre-decision zero and selected a real physically held `Guzma BUS` at the same actor root. Actual native Store **accepted** the Supporter, resolved **both** switching prompts, and allowed `Iron Thorns ex TWM` with `Capture Energy RCL` + `Speed Lightning Energy RCL` to use `Volt Cyclone`. Native Prize resolution settled a knockout of original rank9 `Unown AOR`, moving source rank6 from **five to four remaining Prize cards**. The exact no-correction control and its identical repeat stayed at five in the same action window.

This directly qualifies the prior finding that `Escape Rope BST` prevented the second source attack: it prevented that attack **under the uncorrected native bot**. The physically available owner counter-counter restores the attack in this one deal. **No match finished, no original deck was optimized, no full-field matchup was qualified, and no 99.5% win-rate claim is supported.**

## Frozen source and independent run provenance

- Original top-32 decks: authenticated published **rank 6** printed 60 in seat0, **rank 9** printed 60 in seat1. Source seed **3858002039**. The complete initial physical deal digest in all three v3 arms is **`0f71b28f9fb0d50bf5d27ac102e9f8265a1ae3dc547ef6c1dc9adc1aa661f42e`**.
- Pinned Twinleaf vendor revision: **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. Exact original source and setup are inherited from Agent7's preregistration `results/aichi-2026/registrations/agent7-rank6-turn11-escape-rope-opponent-counter-20261103.json`.
- Agent20 v1 strict-gate [CI 41730452843](https://github.com/FlareZ123/experiment-01/actions/runs/41730452843), artifact **13278000253**: valid same-deal and repeat controls, but wrongly vetoed Guzma before physical action from a `supporterPlayedTurn===0` gate. No selected Guzma.
- Separate v2 diagnostic [CI 41731641727](https://github.com/FlareZ123/experiment-01/actions/runs/41731641727), artifact **13277436493**, full JSON sha256 **`f49cfcf6e385ac9f61bc2c0bcab516df96de3f9d28c2457c47bc5984f6bd8b58`**: recorded actual source owner `supporterTurn=12`, then Store explicitly rejected `Guzma BUS` at ordinal79 with `SUPPORTER_ALREADY_PLAYED`. This treatment aborted. Original control and repeat again matched.
- Precommitted v3 registration: [Agent20 v3 conditional rollback prereg](../registrations/agent20-rank6-guzma-single-root-rollback-v3-20261103.json), committed **before dispatch** in `2520286e565f355685b9454ee78f4180cb725021`. Exact [v3 CI 41733173534](https://github.com/FlareZ123/experiment-01/actions/runs/41733173534) **SUCCESS**, artifact **13276714071**, ZIP SHA256 **`61450b37a22461b1017a1c6a10a64d842085115ba5a5c51e83afa213b1d321d9`**, extracted JSON SHA256 **`78388a93122e4964d5849afb782107678b43aa4751a3469f131781ee16fee458`**. Three genuine native attempts completed to the configured **130-action** research cap, with zero native errors, all three same full deal, all three original rank6 Stadium selected, all three opponent rank9 Rope selected, and byte-identical repeated native controls.

## Exact first divergence and prompt settlements

All Store actions before ordinal **79** match, including rank6 Stadium `Wondrous Labyrinth Prism Star TEU` to `Thunder Mountain Prism Star LOT` at turn10, one funded `Volt Cyclone` attack, rank9 `Escape Rope BST` at turn11, and both genuine Rope switching prompts.

| Source turn | Control | V3 conditional correction |
| --- | --- | --- |
| 12, original native root79 | `PassTurnAction` | `PlayCardAction Guzma BUS`, genuine owner hand index5, Store **accepted** |
| 12, root80 | Wait prompt; no attack | `ChoosePokemonPrompt` after Guzma gust |
| 12, root81 | Rank9 begins next turn | `ChoosePokemonPrompt` for source owner switch; paid Benched Thorns becomes Active with **Capture+Speed** |
| 12, root82 | None | `AttackAction Volt Cyclone` |
| 12, root83–87 | None | Native Energy movement, knockout, Prize and Active promotion prompts |
| Post-settlement | rank6 **5** Prizes left, rank9 **6** | rank6 **4** Prizes left, rank9 **6** |
| Turn13 native reply | opponent native actions, no proven competence | rank9 gets another actual turn and executes its own native actions, no proven competence |

The selected v3 audit at the exact source owner root reports:

```json
{
  "supporterTurnBeforeNativeDecoder": 0,
  "supporterTurnAfterNativeDecoder": 12,
  "nativeChoice": "PassTurnAction",
  "proposalMutationExactlyProven": true,
  "restoredLiveSupporterTurn": 0,
  "selected": true,
  "nativeStoreDispatch": "accepted",
  "firstDivergenceOrdinal": 79,
  "actualNewAttack": "Volt Cyclone",
  "postSettlementSourceRemainingPrizes": 4
}
```

The displayed audit is a concise transcription of separate recorded fields; see the native artifact for the original full action-ledger, attacker, Bench, Energy and Prize snapshots. The attack trace's immediate `prizeCountAfter` precedes the later Prize-selection prompts; the actual Prize decline is documented in the later `ResolvePromptAction` public board.

## The native source-code defect

At the exact pinned vendor revision, `ptcg-server/src/simple-bot/simple-tactics/play-supporter-tactic.ts` contains:

```ts
if (playCardAction) {
  player.supporterTurn = state.turn;
}
return playCardAction;
```

The native `SimpleTacticsAi.decodePlayerTurnAction` then calls `isValidAction(state, action)`, using a `Simulator`. Card-specific `Guzma` rejects `player.supporterTurn > 0`. The game Store's `SupporterEffect` is supposed to consume this quota upon **actual** play; the normal EndTurn resets it to zero. This creates an observable prevalidation side effect: an unaccepted Supporter proposal can poison the live state and make the bot ultimately Pass. v3's directly measured **0→12** change across the bot decoder proves this mutation at the exact affected actor root.

The v3 research adapter rolls back that one *immediately measured* change on the registered owner root; it neither mutates the opponent's private cards nor changes the game's native SupporterEffect. It then submits the physical Guzma to native Store and leaves prompt choices and subsequent AI actions native. This is an explicitly disclosed experimental repair of a native policy bug. It is **not** an automatic general endorsement of overriding nonzero Supporter quota counters.

## Strategic and qualification limits

The source-side Guzma line has printed support: the attached card database identifies `Guzma` `sm3-115` as a Supporter whose effect gusts an opposing Bench Pokémon then switches the user's Active, and `Iron Thorns ex` `sv6-77` has 140-damage `Volt Cyclone`, four-Colorless retreat, and three-symbol Lightning+Colorless+Colorless attack cost. `Thunder Mountain Prism Star` funds that attack from the attached `Capture Energy` + `Speed Lightning Energy`. Switching with Guzma avoids an unaffordable normal retreat of the one-Energy Active. No opponent hidden card identities informed the acting rank6 policy.

A result from **one preregistered exact deal** shows why unmodified opponent native Pass / no attack must not be treated as competent counterplay. It cannot establish the strength of any fixed deck against the other 31 Aichi entries, an actual-paper tournament time horizon, full 60-card optimization, or game win percentage.

## Reproduction and priorities

- Source branch: [Agent20 research branch](https://github.com/FlareZ123/experiment-01/tree/research/agent20-rank6-guzma-counterreply-20261103).
- Owner-only reversible hook: `simulation/twinleaf/agent20-rank6-guzma-after-rope-native.cjs`.
- Precommitted A/B/A runner: `simulation/evaluation/agent20-rank6-guzma-counterreply-native.cjs`.
- Manual CI: `.github/workflows/agent5-owner-root-native.yml`, using existing `agent7_stadium_public_snapshot` dispatch input; v3 run **41733173534** above.
- Next systemic falsification: preselected two-seat, two-rank-pair **eight original source groups**, treating native Supporter proposals as side-effect-free until Store acceptance. Registration `results/aichi-2026/registrations/agent20-native-supporter-proposal-purity-bilateral-8original-20261103.json`; research adapter `simulation/twinleaf/agent20-native-supporter-proposal-purity.cjs`; runner `simulation/evaluation/agent20-supporter-proposer-purity-bilateral8-native.cjs`. The global native policy's effect on actual accepted Supporter actions, double-play attempts, prompt validity and adversarial responses remains to be measured.

**Qualified competitive games from this investigation: 0. Reported source outcome: one recovered native Prize opportunity under a single-actor, rules-grounded quota side-effect correction.**
