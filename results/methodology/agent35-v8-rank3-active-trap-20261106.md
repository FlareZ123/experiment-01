# Agent35: independent native rank-3 Snorlax Block Active-trap and stranded Psychic Energy audit

**6 November 2026 | Agent 35 | Evidence class: observed final native boards + accepted public-root census + checked printed card text. Developmental analysis only.**

## Question

Why did both original-rank-3 source contexts in the v8 + Telepath/Confirm-false same-eight run reach the 128-root cap with **zero AttackAction roots and unchanged six-Prize counts**, even though candidates continued playing Energy and developing their Benches?

## Exact artifact and reproduction

- Input is Agent36's archived manually dispatched compiled run [42287771647](https://github.com/FlareZ123/experiment-01/actions/runs/42287771647), artifact **13538082892** (`agent32-issue25-v8-telepath-confirm-default-false-same-eight-native`). Its ZIP SHA256 is `36d759b28ae75bb120d94c30a6faa2ae79bd1e03ddb0df902a94418e2ba47882` and the extracted `treatment/issue25-steward-v8.json` SHA256 is `6ed9db1568aaf546e3165ddae2a2fa21fd1224f7d50e1e2dc8b8c6f578bb5a45` (both independently recomputed from connector-downloaded bytes).
- Recorded checkout is `a5d3657ac4cdbccd79cced59c133dd6d7d35a6a4`; pinned Twinleaf is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is the *retrospective combined* owner Telepath search and default-false Confirm treatment of the frozen original v8 eight IDs at the same 128-root horizon. The treatment is not the originally selected v8 common policy, and competitive qualification remains false.
- New independent, read-only audit: [`simulation/evaluation/agent35-v8-rank3-active-trap.cjs`](../../simulation/evaluation/agent35-v8-rank3-active-trap.cjs). It verifies each rank-3 attempt is unique, exactly 128 recorded native roots, source/candidate seat roles, the absence of both players' attack declarations, six remaining Prize cards each, actual Active printings, Energy names and printed native attack costs. Its Basic-Psychic payment check is scoped to the actual all-Psychic attached-Energy observations. A native `node:test` regression is [`tests/agent35-v8-rank3-active-trap.test.cjs`](../../tests/agent35-v8-rank3-active-trap.test.cjs).

## Exact verified result

| Frozen original source / fixed contender | Source Active at cap | Candidate Active at cap | Candidate Active attached Energy | Candidate printed attack and observed payment | Candidate Pass / source Pass roots | Game result |
| --- | --- | --- | --- | --- | --- | --- |
| `3:213:A:champion-reference` | Snorlax PGO | Radiant Eternatus CRZ | **5 Basic Psychic** | Power Beam requires Fire + Darkness + Colorless: **cannot pay with five Psychic** | 16 / 17 | 128-root action cap; **0 attacks**, Prizes `[6,6]` |
| `3:213:A:new-moon-lockbreaker-v1` | Snorlax PGO | Lunatone OBF | **2 Basic Psychic** | Moon Press requires Psychic + Colorless + Colorless: **one Energy short** | 17 / 18 | 128-root action cap; **0 attacks**, Prizes `[6,6]` |

Both real original-source attempts used source seat **1**, candidate seat **0**, with the same original source-deal fingerprint `309ae22205a78c639e7c2782a0c536d6ae5ecd94c9178315bb815d1726722c20`. The printed candidate sixties and their full-physical-deal fingerprints differ. The highest observed public global turn was **33** for champion and **35** for New Moon. These two contexts each had zero `AttackAction` roots across both players, not merely zero *source* attacks.

On champion, accepted public `PlayCardAction` roots played **five Psychic Energy cards** from candidate seat0 (ordinals 17, 67, 87, 94, 101), and the final public board has exactly those five Psychic attached to the Active Radiant Eternatus, with **zero Energy on the five Benched Pokémon**, including Latias ex. The root ledger omits per-action target identity, so do not claim it proves the individual attachment recipient at every intermediate ordinal. It does prove the physically observed final concentration and total accepted card-play count. The published champion reference printed 60 has **11 Basic Psychic Energy and no other Energy names**.

On New Moon, candidate seat0's final Active Lunatone has **two Psychic Energy**, while all five Benched Pokémon have no attached Energy. Final opponent source Active Snorlax has **no attached Energy** in either context. The source is therefore pursuing a no-attack trap/deck-out line consistent with its printed Block design, but intent and optimality are inferences and are not certified by these final-state snapshots.

## Independent printed-card and rule check

The bundled English card JSON identifies:

- **Snorlax PGO 55**: *Block* says that while Snorlax is Active, the opponent's Active Pokémon **cannot retreat**. The rulebook's `C-14 Can't retreat` explicitly distinguishes a prohibited ordinary retreat from a switch effected by another card. The observed Source Active Snorlax in both final snapshots is therefore a concrete retreat-lock threat.
- **Radiant Eternatus CRZ 105**: Power Beam costs **Fire, Darkness, Colorless**. Five Psychic Energy cannot satisfy either colored requirement. Its *Climactic Gate* Ability is conditional on playing it from hand onto the Bench and is irrelevant to paying this printed attack.
- **Lunatone OBF 92**: Moon Press costs **Psychic, Colorless, Colorless**. Two Basic Psychic supply only two of the required three Energy symbols.
- **Latias ex SSP 76**: Eon Blade costs **Psychic, Psychic, Colorless** and does 200 damage. The championship Bench contained Latias without Energy, while the Active Radiant Eternatus was holding five Psychic. Latias's Skyliner normally removes Basic retreat costs, but **Snorlax's explicit no-retreat effect still prevents ordinary retreat**. Do not label a future Latias route automatically executable; it additionally needs an authentic switch/promotion or Knock Out and a playable Energy recipient.

The benchmark reference list is [`results/aichi-2026/benchmark-shadow-rider.md`](../aichi-2026/benchmark-shadow-rider.md). The uploaded Advanced Player's Rulebook's Bench, retreat and C-14 sections support the paper separation between attaching Energy, retreating, and switching. These checks establish a specific observed payment impossibility at cap, not all-card legality of the match or its intermediate decisions.

## Why this changes the next policy experiment

This is an **Active-lock and resource-placement failure**, not an isolated low raw attack-count result. A policy may correctly choose legal `PlayCardAction` Energy attachments while directing them onto a Basic attacker whose printed attack is permanently off-color within its own fixed 60. The opposing Active's Block makes the ordinary retreat escape unavailable. A generic policy that always attaches to its current Active can therefore sink turns and resource access, even if it later learns to answer all Confirm/ChooseCards prompts.

**Suggested prospectively registered decision test:** in this same rank-3 source matchup, introduce an owner-visible Active-payability and Bench-attack access rule for selecting the Energy recipient, with a separate, paper-verified switch-out path. Preserve the original 60s, source physical deal, actual first player, and all root actions. Preflight target identity and energy payment against live Store, not just prompt/proposal text. Test on independent fresh deals in **both seats** and compare the existing policy under identical physical source openings where supported. Count a source or candidate's first genuinely settled, funded attack, subsequent opponent choice and native terminal/cap/error separately. Do not infer the performance of an unexecuted counterfactual.

This observation should inform the Issue25 common-policy steward. Its effect on final deck choice, field strength, actual win rate or matchup distribution is **unknown**. No original source 60 was changed. There is still no competitively qualified game under the project acceptance contract.
