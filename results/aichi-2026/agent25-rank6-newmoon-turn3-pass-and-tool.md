# New Moon vs Aichi rank 6: exact turn-3 Pass and inert Forest Seal Stone

**Agent 25, 19 October 2026 UTC.** Evidence class: selected-source, pinned-Store retrospective *mechanical policy diagnostic*. One previously registered deal, **zero competitively qualified games**. No new candidate 60, tournament win, or statistical probability is claimed.

## Source and strict noninterference

- Original [preregistered Agent 41 rank6/rank11 pilot](registrations/agent41-crossrank-r6-r11-v1-20261019.json), exact arm `6:0:A:new-moon-lockbreaker-v1`, seed **407516727**, candidate New Moon English-proxy seat A/0; authentic rank6 Iron Thorns seat B/1, actually playing **second**.
- Original compiled [run 39193837824](https://github.com/FlareZ123/experiment-01/actions/runs/39193837824), artifact **12161805529**, 240 root actions, global turn30 engine terminal, rank6 opponent zero Prizes remaining.
- Independent targeted [manual compiled CI 39198932274](https://github.com/FlareZ123/experiment-01/actions/runs/39198932274) passed after correcting an initial local assertion that confused 35 quantity-bearing source rows with the **60 resolved physical cards**; artifact **12163001792**, file `agent25-rank6-newmoon-first-pass.json`, inner JSON SHA-256 `96c16197d7454fb548185bb3d3a7fc195c812535ae4a659db294045276790e25`.
- Exact original root-action-ledger SHA-256 **`9a9007f302a6e84084eb75c77f0a86db0e037c58384d7ff2076de828ba0ba913`** was recomputed on the observed replay and matched byte-for-byte. The 240 actions, game terminal and source 7 vs candidate 1 total logged attack declarations also match. The counterfactual attack announcement was attempted *only after the original bot selected Pass*, in a detached Store clone; no outcome was supplied to its policy.
- Reproduction: [single-arm fail-closed adapter](../../simulation/evaluation/agent25-rank6-newmoon-first-pass-audit.cjs), [unit tests](../../tests/agent25-rank6-newmoon-first-pass-audit.test.cjs); existing [manual source-campaign workflow](../../.github/workflows/aichi-source-locked-campaign.yml) with `agent41_crossrank_trial=true`, `agent25_rank6_newmoon_pass=true`. Engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## The exact owner hand and public board at Pass

The source-policy audit confirms rank6 completed global-turn-2 Guzma & Hala, obtaining **Double Colorless Energy + Thunder Mountain Prism Star**, attached DCE and proposed Volt Cyclone. The sampled original candidate turn3 actions were:

| Root ordinal | Executed candidate choice |
| ---: | --- |
| 30 | Attach **Telepathic Psychic Energy** to the Active Pokémon |
| 31 | Resolve the Energy's real Bench-search prompt: **Duskull VIV + Duskull VIV** |
| 34 | **PassTurnAction** |

At the moment of Pass, New Moon's *own visible hand* was **Counter Catcher PAR, Battle VIP Pass FST, Fog Crystal CRE, Telepath [P] Energy M3**. The opponent's hand was represented only by its **public size of 4**, without private contents.

**Candidate board:** Active **Latias ex**, already at **140 damage**, attached **Basic Psychic Energy, Telepathic Psychic Energy, Forest Seal Stone**. Candidate Bench: **Unown, Duskull, Duskull** without Energy. No own Stadium.

**Source board:** Active **Iron Thorns ex**, 0 damage, attached **Double Colorless Energy**, with **Thunder Mountain Prism Star** in the Stadium slot and empty Bench.

## Immediate attack is engine-ineligible

The printed [Latias ex Eon Blade](../../resources/cards/en/sv8.json) costs **Psychic + Psychic + Colorless** (three Energy units). The attached [Telepathic Psychic Energy](../../resources/cards/en/me3.json) supplies one Psychic Energy; together with one Basic Psychic Energy, this is **two units**. The after-choice detached Store explicitly attempted `AttackAction(owner,'Eon Blade')` and returned **`engineAcceptedAnnouncement:false`**. There were no other printed Active attacks found. This shows the candidate did not ignore a *currently available printed attack* when it passed. The clone does not certify all possible Bench-swapping, draw, acceleration, attack-copy or search sequences.

There is a second consequential simultaneous restriction. **Iron Thorns ex's Initialization** ([TWM 77](../../resources/cards/en/sv6.json)) suppresses Abilities of Pokémon with Rule Boxes, other than Future Pokémon, while it is Active. Latias ex is a Basic Pokémon ex with a Rule Box. Its normally helpful **Skyliner** free-retreat Ability is therefore suppressed in this board, making switching to a Benched attacker more expensive than simply assuming Latias is freely mobile. Its printed Retreat Cost is two Colorless. This board detail warrants its own live-legality testing if a proposed counterplay line relies on retreat.

## A separate concrete setup-resource error

The public snapshot places **Forest Seal Stone** on **Latias ex**. The printed Tool ([Silver Tempest 156](../../resources/cards/en/swsh12.json)) explicitly grants **Star Alchemy to the Pokémon V to which it is attached**. Latias ex is a Pokémon ex, and this Tool consequently grants it *no usable Star Alchemy*. The archived turn3 choices contain no Tool play, so the Tool was attached before this first response; attribution to an exact earlier root needs the full initial-turn action record.

This is a directly observed resource-allocation problem in the fixed generic bot's setup; its opportunity cost depends on whether an appropriate Pokémon V and search line could have been reached. It does **not** prove that another Tool assignment changes any match result.

Another potential owner action deserves a separate test: the Bench Unown is source-proxy **Unown AOR** (printed [Farewell Letter](../../resources/cards/en/xy7.json)). That single-Prize Pokémon lacks a Rule Box and hence is *outside* Iron Thorns Initialization's specified class. In principle, its Bench Ability can sacrifice itself to draw, subject to exact Store legality and deck availability. The observed turn3 action trace does not include a Farewell Letter activation. A separately versioned, opt-in **after-chosen-Pass cloned Ability probe** is under development to decide whether this is another missed valid action. Until it passes compiled validation, this is a **hypothesis**, distinct from the proved Eon Blade rejection.

## Decision and limitations

- **Confirmed:** the specific pass faced an underpowered Active; its visible Eon Blade attack was rejected by the pinned Store. The source produced 140 damage and maintained Ability suppression in the public state. Forest Seal Stone was attached to an incompatible Pokémon ex, leaving it without Star Alchemy access.
- **Unresolved:** whether any owner-information-safe alternative opening sequence could establish Mewtwo & Mew-GX, legally deploy Farewell Letter, allocate Energy differently, escape the Iron Thorns Active lock, or meaningfully improve this exact match.
- **Not admissible as winning evidence:** selected retrospective seed, unqualified generic bot, English-proxy Japanese-source mapping, incomplete attack-effect paper-rule qualification, tournament clock not represented. The original 24-arm denominator retains 10 caps and one historically rejected action. All 32 opponents must be considered for eventual single-60 certification; exact lists for ranks 23, 25, 28 remain absent.

**Highest-value next counterfactual:** at the already chosen turn3 Pass, test the *real cloned Store*'s acceptance of Benched Unown AOR `Farewell Letter`. Capture only legal acceptance and public zone counts, never the hidden top-deck card identity. Preserve the original root-action hash and do not reinterpret the archived winner.
