# Rank-11 source-first New Moon: actor-visible Powerglass/Basic Psychic missed window

**Agent 41 | 21 October 2026.** Development-only replay and root-policy diagnosis. No competitive game, matchup win rate, or claim of a 99.5% deck.

## Narrow falsifiable question

In the prior actual-deal source-first rank-11 New Moon root-cap case, genuine Active Mewtwo & Mew-GX failed to pay for Perfection's Gengar & Mimikyu-GX copied attack. Was the absence of an Energy card in play caused by missing discard resources, or by the owner policy leaving an already visible recovery Tool unused?

## Inputs, execution, and provenance

- Fixed candidate: `new-moon-lockbreaker-v1`, English simulator equivalent digest `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`; exact published rank-11 Absol/Garbodor source 60. Original historical source-first rank-11 seed is **482443328**, candidate physical seat **B**, source begins first. Rank-11 source-first seed is retrospectively selected because source Tool-Garbodor establishment had been observed. All outcome evidence is development-only.
- Research runner: `simulation/evaluation/agent41-bilateral-v2-development.cjs` from main, existing manually dispatched `.github/workflows/agent7-canonical-actor-bilateral.yml`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source-first `AGENT41_SOURCEFIRST_RETRO_DEV=true`, `AGENT5_COMPR_OPPORTUNITY_AUDIT=true`, `AGENT44_ACTOR_ENERGY_RECIPIENT_DEV=true`, `AGENT6_PAID_RETREAT_ROOT_DEV=true`, `AGENT3_SPECIAL_ENERGY_ROOT_DEV=true`, `AGENT30_PERFECTION_ROOT_DEV=true`, `AGENT3_PAPER_TERMINAL_ATTACK_KO_DEV=true`, native generic attribution ON. All four attempted source-first arms retained.
- Successful manual compiled [read-only audit run 39607740709](https://github.com/FlareZ123/experiment-01/actions/runs/39607740709), run head `c78d984cf2b0a8cc7cd905926bcf467bb9efd30e`, archived artifact [12350100655](https://github.com/FlareZ123/experiment-01/actions/runs/39607740709/artifacts/12350100655), ZIP SHA256 `7c862372172215f8eecf38e9215edfabbcd7546f23aa1ef086edde7f01a5251c`. Read `agent7-canonical-sourcefirst.json`, last row.
- Prior successful comparison [read-only-intended historical run 39577688962](https://github.com/FlareZ123/experiment-01/actions/runs/39577688962), branch head `253d584b6e14e183a5d9cd3844777c9f81ea37e7`, artifact [12335186668](https://github.com/FlareZ123/experiment-01/actions/runs/39577688962/artifacts/12335186668), ZIP SHA256 `0d2cdb0d914fb3785fbf7bb7106dc6594c451fa6dd19d3d327db87534db9bca6`. Its source-first step did not pass the Energy opportunity-audit input. Historical-arm audit in that run therefore does not establish the source-first conditions.

## Genuine owner-window observations

The `agent5-owner-compressor-opportunity-readonly-v1` observer recorded **42 normal-turn owner-root decisions across 29 distinct turns** on the rank-11 source-first New Moon arm. Its repeated snapshots on the same turn are correlated observations and are not independent attempts. Nine distinct observed turns had Mewtwo Active and six distinct observed turns had it Benched.

- Starting at global **turn 30**, the player's **own publicly inspectable discard contained three Basic Psychic Energy**, and **two Powerglass SFA** were held in the player's hand. The recorded owner-window data continued to show those resources.
- On global **turns 42, 44, 46, 48, 50, 52, 54, 56 and 58**, Mewtwo & Mew-GX was Active with **zero attached Energy**, **no Powerglass equipped**, both Powerglass in the owner hand, and three Basic Psychic Energy in the own discard. A Battle Compressor entered the hand at turn 48, but a Compressor is unnecessary to establish that existing discard Energy was available.
- No `Powerglass` `PlayCardAction` occurs in the genuine 260-root history. On turns 42, 44, 46 and 48, independent post-Pass Perfection clones accepted Ability initiation and reached a `ChooseAttackPrompt`, but found **zero payable copied attacks**. The genuine game produced only two candidate attack declarations before its 260-root censor.
- Earlier source Tool-Garbodor was genuinely set up at global turn 1, and the turn-2 owner-visible Field Blower path removed its Tool. The turn-42 public snapshot has Garbodor in the source Bench without a Tool and no Stadium, with Gengar & Mimikyu-GX on the candidate Bench. This eliminates the naive explanation that there was no donor or no discard Energy during the observed late period; native legal applicability and opponent response still need an action replay.

The provided card database specifies Powerglass SFA 63 as an Active-only Pokémon Tool effect: at end of turn, after attacking, its player may attach a Basic Energy card from the discard pile to the Active holder. At the observed late window Mewtwo had no existing Tool, and the owner possessed two Powerglass plus eligible discard Energy. This creates a **specific plausible actor-visible line**: equip Powerglass to Active Mewtwo, end turn to trigger one Basic Psychic attachment, and reassess a copied one-Psychic Horror House-GX on the next owner's turn after a genuine opposing turn. Whether the native Store accepts that Tool play, executes the end-turn trigger, keeps Perfection enabled, and permits a subsequent copied attack after the opponent's response **has not been tested**. The observer did not intervene in decisions.

## Replay comparison and retained negative evidence

Against the previous source-first diagnostic, both archives have the same exact initial source-deal fingerprints, root-action-count trajectories, and SHA256 of all **three completed/capped** root-action ledgers:

| Actual source-first trial | Root ledger SHA256 | Disposition |
| --- | --- | --- |
| Rank 6, champion reference B | `39a0e489145fddf60b96aef814ac086b03bd7ee8da6cae442a22df4fd25526ae` | 93-root engine terminal, development only |
| Rank 6, New Moon B | No completed ledger | Same genuine engine error at action 133, `LABEL_GX_USED`; never silently omitted |
| Rank 11, champion reference B | `7ed490f4b84073ab8102c8d239bef5fb18302d4542a1b8c9b87220cb6a807aec` | 89-root engine terminal, development only |
| Rank 11, New Moon B | `360dc984997a7774f1ac00f1ad6c08f3026697779766f16f0afc302a65962c18` | 260-root censor, no competitive result |

The archived run heads differ and the earlier branch version had the source-first audit disabled. Matching real-game root ledgers are **bounded noninterference evidence** for the read-only comparison. They do not establish all-State equivalence, future policy quality, or a randomized matchup success rate.

## Direct next falsification

On the exact preserved rank-11 source-first physical deal, add one narrowly opt-in, owner-visible `Powerglass` action at the first Active-Mewtwo owner root with held Powerglass and own discarded Psychic. Require a genuine native `PlayCardAction` acceptance, actual Tool attachment and end-turn transfer of one discarded Basic Psychic, then a legal later Perfection donor selection and settled attack if it remains available. Preserve the intervening opponent turn and every original action/Prize/censor difference. Retain an unchanged same-head control. Existing `simulation/twinleaf/owner-energy-window-audit.cjs` provides richer Store-level follow-through evidence. Test with the existing manually dispatched workflow; do not add a per-commit job. Communicate to Agent30/44 for donor-aware recipient policy coordination.

**Boundary:** one retrospectively selected replay, source decision policy unqualified, official paper match clock not modeled, three Top-32 opponent exact lists still missing, **0 competitively qualified games**.

## Pure actor-root prototype and pinned source bounds (same-day continuation)

An **opt-in-only** actor-visible root was added to `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, with the pure policy extracted into `simulation/twinleaf/agent41-powerglass-root-frontier.cjs` and narrow `tests/agent41-actor-powerglass-root.test.cjs`. The new opt-in flag is `AGENT41_ACTOR_POWERGLASS_ROOT_DEV=true`; it remains **OFF** by default. Its exact owner-visible predicate checks Active Mewtwo & Mew-GX UNM, an empty Active Tool slot, no visible Tool-play lock, Gengar & Mimikyu-GX TEU on the owner's Bench or in its discard, at least one owned discarded Basic Psychic Energy, and Powerglass SFA in the owner's hand. It chooses the first matching Tool's real owner-hand index and translates it to `PlayCardAction` on the Active Pokémon. `simulation/twinleaf/agent5-owner-root-slice.cjs` now checks genuine Tool occupancy and hand-count change after native dispatch. Reversible actor hook ownership and paper Store legality are unchanged otherwise.

The exact GitHub pure module blob `523c7c3d22ef868b9baac3547d543a5092bf0da5` was reconstructed byte-for-byte in a local Node 22 harness and the Git blob SHA matched. **2/2 local pure test groups passed**, covering positive deterministic selection and Tool occupied, no discard Energy, no donor, Tool lock, missing Tool, wrong actor phase and wrong Active Pokémon. This proves only the pure decision; the integrated root policy and actual Store response **have not yet been compiled or replayed**.

The pinned `a9905a76...` Twinleaf source clarifies the expected engine line: `ptcg-server/src/game/store/reducers/player-turn-reducer.ts` applies `EndTurnEffect` after `PassTurnAction`; `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/power-hourglass.ts` sees that same `EndTurnEffect`, checks the Tool is on Active, reduces `ToolEffect` for applicability, and opens an optional (`min:0,max:1`) `AttachEnergyPrompt` from the Basic Energy discard pile. Importantly, `ptcg-server/src/simple-bot/prompt-resolver/attach-energy-prompt-resolver.ts` explicitly offers an **empty choice with baseline score** before scoring attachment choices. Thus even if Powerglass equips successfully and produces the prompt, the unmodified native resolver **might decline to attach**. An owner-only positive choice in an actual prompt and subsequent real-game attack are outstanding. A manually edited existing CI workflow to expose the opt-in was blocked by connected-tool safety checks; do not route around this block. No source-game replay of the opt-in exists as of this report.

**Qualification unchanged:** one retrospective source-first case, 29/32 exact Aichi opponents, zero competitively qualified games, no evidence that this candidate attains the requested win-rate target.

## Paper-rule confirmation of the no-attack trigger

The repository-provided **Advanced Player's Rulebook v3.4, section E-21, page 62** explicitly resolves this precise question and uses **Powerglass SFA** as its own example. End-of-turn effects activate whether a player completes an attack or simply announces the end of their turn; parenthetical “after your attack” wording does not require an attack. Thus the proposed **equip Powerglass → pass turn → Powerglass optional Basic Energy attachment** is a *paper-legal timing sequence* when no other card restriction intervenes. This supersedes any interpretation that lack of an attack prevents its trigger. The chosen Basic Energy remains optional; native actor prompt selection is independently unverified. A late opponent response can still remove Mewtwo or Tool before a useful subsequent attack. No game result follows from this ruling alone.
