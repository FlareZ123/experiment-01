# Rank-11 autonomous Garbodor versus fixed New Moon: copied Poltergeist effect and reply audit

**Agent 13, 18 October 2026. Evidence category:** one source-dealt, selected-seed, pinned-engine mechanical and weak-policy diagnostic. **No independently qualified competitive game or win-rate inference.**

## Fixed source and independent replay

- Source opponent: original Aichi 2026 rank **11**, Wataru Yano Absol/Garbodor, exact published 60 from `results/aichi-2026/full-decklists.json`, physical simulator seat **A (0)**, **actually first** according to the real first-draw log.
- Candidate: **New Moon Lockbreaker v1 English-mechanics proxy**, unchanged 60 in `results/als/new-moon-lockbreak-english-proxy-60.json`, physical seat **B (1)**, **actually second**. Printed ID/count hash `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`.
- Both physical engine-deck hashes, source/candidate order: `ca1a7ce02983c438146f30bf01f303cf8210836f9e442e0d21a2513850ffcb18`, `99969539010abfa11c4e671a5744ed4d97f23cf2f7f275399ac35f5bc1013c0f`.
- Seed **1244180408** previously chosen retrospectively as a source-positive Garbotoxin example. This report does **not** call it a predeclared random test or treat policy arms as independent games.
- Frozen engine revision **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**; `RANK11_AUTONOMOUS_PROFILE` executes the identical source player's **eleven real first-turn actions**, ending in equipped Benched Garbodor at the first opposing decision. `withNewMoonBlowerAutonomy` is opt-in and intercepts candidate decisions only. Both 60s, physical starting order, source opening and seed remain constant across baseline, Blower-only and Blower + low-hand Lillie candidate policies.
- Runner: [`simulation/twinleaf/newmoon-rank11-autonomous-blower-probe.cjs`](../../simulation/twinleaf/newmoon-rank11-autonomous-blower-probe.cjs). The first [manual CI 39172488253](https://github.com/FlareZ123/experiment-01/actions/runs/39172488253) passed and established actual `ChooseAttackPrompt`/real Store declaration matches, archive artifact **12153291802**, ZIP SHA256 `a571ad710d2110bd47fba29e92bae103bbf623ed931a7da1873bbb20e4d53d88`, JSON SHA256 `40ecee063414c1927e5e97f0d07bf38131e0bde4faf6649019a6d1bb1e51342a`.
- A second [manual CI 39173019118](https://github.com/FlareZ123/experiment-01/actions/runs/39173019118) **passed**, source research head `1e72dc9da51ff1c21b8de5545ed1ba9e1e07456b`. Artifact **12152683797** (`newmoon-rank11-held-blower-unqualified`), ZIP SHA256 `3b9f105ff35cd51bd5c79535882bcd46106b4f18e1529f771abba41f6cc1843d`, full JSON `newmoon-rank11-autonomous-blower.json` SHA256 `178c567398af2fc4300c459baa103f4e41dbd6f99a92ca36f3d3bd39e4df3bdb`.

## Actual printed copied attack, effect, and next source turn

The candidate variant autonomously played its own held Field Blower on turns **2** and **12**, each removing an opponent's public Garbodor Tool; after the first removal it legally chose Lillie's Determination with two cards in its hand, shuffling and drawing eight. The pinned generic policy supplied all other choices.

The **real** Mewtwo & Mew-GX `UseAbilityAction('Perfection')` selected `Gengar & Mimikyu-GX TEU` **Poltergeist**, using actual `ChooseAttackPrompt` and real Store attack log. Root `AttackAction` counting falsely shows zero candidate attacks, but these three source-pinned selected attacks each have a corresponding Store declaration. Immediately before each selected attack, the real candidate Active Mewtwo & Mew-GX had **two attached Telepathic Psychic Energy** cards, each providing one Psychic Energy, with **Powerglass** as its Tool.

| Candidate global turn / Store root ordinal | Rank11 actual Trainer count in hand | Printed base: 50 per Trainer | Source original Active before damage | Source printed HP and damage before | Observed source in-play loss | Candidate Prizes taken in effect chain |
| --- | ---: | ---: | --- | --- | ---: | ---: |
| **8 / 87** | **4** | **200** | Crobat V | 180 HP, 0 damage | 1 | **2** |
| **48 / 282** | **9** | **450** | Mega Absol ex | 280 HP, 0 damage | 1 | **3** |
| **50 / 297** | **10** | **500** | Mega Absol ex | 280 HP, 0 damage | 1 | **1 remaining Prize** |

Each printed base exceeds the defender's printed remaining HP before modifiers. The source in-play reduction and Prize changes were observed through the actual Store effect-window steps. The last knockout ends the game with one candidate Prize left to take, so its final **one** Prize transition is compatible with the game ending despite Mega Evolution ex being a nominal three-Prize Pokémon. The printed 50× count is independent of Weakness. These checks do **not** replay every resistance, prevention, board modifier, or engine reducer as an independent paper-rules verifier.

The two **nonterminal** copied attacks include authentic ensuing source-player turn actions:

- **Rank11 turn 9**, after turn-8 Poltergeist and two taken Prizes: source promotes following KO, places Mega Absol ex, uses Oranguru V **Back Order**, resolves source prompts, plays Float Stone and Forest Seal Stone, then **Passes** without a source attack.
- **Rank11 turn 49**, after turn-48 Poltergeist and three taken Prizes: source promotes, attaches Darkness Energy and declares **Claw of Darkness** through a real `AttackAction`; subsequent prompts were observed. It does not take a Prize in this response. The turn-50 copied attack then ends the engine game, so there is no subsequent source turn.

The source hand's actual Trainer names in the retrospective observer, useful for auditing hand-size vulnerability, were:

- Turn 8: Quick Ball, Secret Box, Guzma, Super Rod.
- Turn 48: Quick Ball, Secret Box, Guzma, Quick Ball, Carmine, Boost Shake, Carmine, VS Seeker, Quick Ball.
- Turn 50: the turn-48 nine plus Dark Patch. These are **opponent-hidden** information until the after-selection observational audit; the candidate policy never received them.

The candidate's **global-turn-50** end transition has root `UseAbilityAction('Perfection')` ordinal **295**, chosen copied Poltergeist ordinal **297**, source Mega Absol leaves play at **298** (`WaitPrompt`), and the final Prize moves from one to zero at **299** (`AttachEnergyPrompt`). Pinned source card **Powerglass SFA 63** activates at end of turn via `EndTurnEffect` and can create an `AttachEnergyPrompt`. The supplied Advanced Player's Rulebook E-21 describes the Powerglass end-of-turn timing; section D describes Knock Out and Prize handling. The **reason the final Prize transfer is delayed until that AttachEnergyPrompt**, instead of an explicit ChoosePrizePrompt as on turns 8 and 48, warrants a separate attack-KO/end-turn ordering fidelity test before interpreting prompt timing as paper-rules compliance.

## Noninterference and alternative arms

The same frozen Blower + Lillie candidate was replayed with and without read-only `capturePoltergeistEffectTrace`. The validator required exact equality of serialized full root-action ledger, individual decisions, attack declarations, all terminal fields, actions, turns, winner and Prize totals. The identical independent candidate owner-policy audit was also required. **All checks passed**. Thus this pair's recording did not change observed action or outcome, while making no general claim about unmodeled reference identities or all possible seeds.

| Policy arm | Candidate recorded printed Store attacks | Opponent's first-turn Garbodor | Engine winner / Prizes left (rank11, New Moon) |
| --- | ---: | --- | --- |
| Generic baseline | 0 | same completed source lock | rank11, **(0,6)** after 207 actions / 43 turns |
| Blower-only v1 | 0 | same completed source lock | rank11, **(0,6)** after 221 actions / 45 turns |
| Blower + low-hand Lillie v2 | 3 copied Poltergeist | same completed source lock | New Moon, **(6,0)** after 300 actions / 50 turns |

**Policy and time limitations are decisive.** The source rank11 Bot, once its custom first-turn opener was complete, recorded only **two ordinary AttackActions** in the entire v2 continuation (global turns **47, 49**) and took **zero Prizes**. This long period of limited pressure is an opponent-decision-policy qualification gap; we have neither proved those earlier attacks affordable nor validated its competing lines. Agent 10 has been asked in `communications/agent10/20261018T2242Z_agent13_newmoon-rank11-late-source-attack-policy.md` to investigate information-correct source pressure. The event's 25-minute paper clock is not simulated, and 50 engine turns are not an official-match victory without time evidence. The candidate's English proxy is still not fully Japanese printing-certified. Prospectively fixed independent seeds, both genuine starting orders, source competence, correct paper clock and all 32 exact opponents remain open.

**Field-wide status remains 29/32 exact opponent 60s, zero independently competitively qualified games, no demonstrated 99.5% fixed-list win rate.**
