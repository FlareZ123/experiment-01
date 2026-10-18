# Authentic rank-11 Poltergeist printed multiplier and terminal consequence

**Agent 35, 18 October 2026.** This is a mechanically bounded source-dealt effect witness with a retrospective positive-control seed, **not** an independently qualified competitive game.

## Source, identities and reproducibility

- Opponent: **Aichi Open 2026 rank 11, Wataru Yano, Absol/Garbodor**, exactly published in `results/aichi-2026/full-decklists.json`; candidate: **New Moon Lockbreaker English mechanics proxy**, immutable 60 defined by `results/als/new-moon-lockbreak-english-proxy-60.json` and the source adapter.
- Actual first player: rank11 physical seat **A (0)**; candidate physical seat **B (1)** actually second, source draw-log verified.
- Fixed replay seed `1111464409`, **selected retrospectively from a favorable engine finish** by the prior positive-control research. It does **not** belong in a prospective game-rate denominator.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, GitHub main run head `acca0a5d137cef0f0a11b9f46fe5c196750c8367`, existing manual [Aichi board workflow 39157217087](https://github.com/FlareZ123/experiment-01/actions/runs/39157217087); both exact source and candidate deck hashes, active hooks, source selection and terminal lineage are embedded in the archived JSON.
- Validated source test and pure observer tests reported success in that workflow. The raw evidence is [artifact `rank11-copied-attack-selection`, ID 12147317928](https://github.com/FlareZ123/experiment-01/actions/runs/39157217087/artifacts/12147317928), ZIP SHA-256 `31016b9cda9b53b7f5b114586c14b383a46b89b953817384fcd788a7218d5e23`. Original pre-observer control artifact `12141997099`, ZIP SHA-256 `7a9e98ed99dc3877f4f9493e637b9e100abaad6de032759ab35d3dbfca401b81`.

## Verified source-mechanics observation

At **global turn 36**, the candidate's root `UseAbilityAction('Perfection')` action ordinal **270** led to a selected copied attack from actual **Gengar & Mimikyu-GX TEU 53**, `Poltergeist`, at `ResolvePromptAction` ordinal **272**. The ensuing terminal `WaitPrompt` resolution is ordinal **273**.

The new independent *post-bot-choice, pre-Store-declaration* physical source-hand inventory contains **six Trainers out of eight cards**:

| Actual printed Trainer in rank11 hand | Copies |
| --- | ---: |
| Temple of Sinnoh | 1 |
| Carmine | 1 |
| Boost Shake | 2 |
| Secret Box | 1 |
| Escape Rope | 1 |
| **Total** | **6** |

Gengar & Mimikyu-GX's printed attack reads 50 damage per Trainer in the opposing hand. Thus printed base damage is **300**. The defending original source Active was **Mega Absol ex**, printed **280 HP**, with **zero pre-attack damage**. Printed base damage alone reaches the required Knock Out threshold (`300 >= 280`). The frozen source Mega Absol ex code confirms 280 HP, Grass Weakness and no damage-reduction effect in either printed attack. There is no Psychic Weakness multiplication required for this threshold. Source deck includes no identified persistent damage-reduction Tool; exact board-wide modifier/effect resolution was not independently audited.

The live Store then removed **one source Pokémon from play (6 to 5)** and the candidate took the final Prize (**1 remaining to 0**). The exact root assessment is stored in `poltergeistEffect`; it observes the printed sufficient-damage condition and the engine consequence without rewriting its damage reducer. The candidate engine won with source/candidate remaining Prizes `[2,0]`. This is an engine result only.

## Read-only observer noninterference

The same immutable source 60s, physical seats, actual seed, policy flags, original native-Gengar pivot and initial deals were replayed twice: observer **off** and **on**. For both, a SHA-256 digest of complete root-action ledger, real Store attack declarations, terminal transition, action/turn counts, Prize outcome and winner was exactly:

`92f7c09bebdab02b116df094c0582ff50a359706c86b97703207053382ed3034`

This proves matching serialized evidence and terminal outcome for this pair. It does **not** prove all hidden engine reference graphs were unchanged, that the engine matches all paper rules, or that the bot's tactical choices were competent. The observer reads opponent hand only after bot decision and never passes this hindsight inventory into the active decision policy.

## Authentic nonterminal copied attack and ensuing opponent actions

A second read-only source replay, [manual compiled CI 39157953757](https://github.com/FlareZ123/experiment-01/actions/runs/39157953757), **passed** at head `5142bcbdf6e6ad38fbb571223daf597155736d6a`, archive [12147582845](https://github.com/FlareZ123/experiment-01/actions/runs/39157953757/artifacts/12147582845), ZIP SHA256 `bac2dbdf29bebc2d5cfa2cd1db6bbe2834fe46232b1bde2301a23557931bfc91`.

In that **same authentic game**, an earlier `UseAbilityAction('Perfection')` chain copied printed Poltergeist at root ordinal **210**, global turn **22**. This is **not terminal**. Immediately before the Store attack declaration the rank11 hand held six of eight Trainers: Battle VIP Pass, Quick Ball, Professor's Letter, Marnie, Shopping Center and Float Stone. Thus the printed base was **300**; the defended Active **Mega Absol ex** had 280 printed HP and **150 prior damage**, leaving only **130**. The subsequent real Store transition removed that Active Mega Absol and awarded the candidate **three Prizes**, consistent with the Mega Evolution ex Rule. The source Active was replaced by another Mega Absol ex. The attacking Mewtwo & Mew-GX was physically in the Active Spot with one Telepathic Psychic Energy and one Psychic Energy; the printed copied attack's two-Psychic cost was represented in the real source board. Garbodor was on the source Bench with **no Pokémon Tool** at this exact decision.

Unlike the terminal turn36, this copied attack has a real ensuing opponent turn. The complete source-ledger next opponent turn **23** recorded:

- Root **217**: play Float Stone;
- Root **218**: replace candidate Sky Field with Shopping Center;
- Root **219**: candidate resolves a `ChoosePokemonPrompt` stemming from Sky Field's removal;
- Root **220**: play Marnie, with subsequent hand-resolution prompts;
- Root **223**: Pass, followed by end-of-turn root224.

At the attack boundary the candidate had **eight Benched Pokémon under Sky Field**. Replacing Sky Field is a potentially consequential counter-move: its printed text requires discarding excess Benched Pokémon down to five. A new same-source check is pending to independently verify the following candidate-turn public Bench count and exact survivors. The Marnie also represents real opponent hand disruption, although tactical competency and the counterfactual benefit of each chosen play have not been established. No opponent attack was observed in turn23.

This is an **ordered authentic engine opponent response** and a genuine turn-after-copied-attack example; it does not establish a strategically optimized opponent policy, a full paper-rules replay or a prospective natural-play success probability.

## Boundaries and next discriminating test

The source printed multiplier, actual target HP, recorded KO and final Prize now form a reproducible mechanic-consequence witness. The attack's **full damage reducer, Weakness/Resistance/active modifiers, and the exact public board at the attack instant** have not been independently replayed or audited. The copied terminal attack also ends the game, so it has **no next opponent turn**. To close the Critic-requested response gate, the same source game also contains a **nonterminal copied Poltergeist on global turn 22, ordinal 210**. Investigate its true predecision public board, physical Trainer count, damage/effects, end-of-turn and the rank11 player's next autonomous action. A selected-successful seed remains a **mechanical positive control**; prospectively fixed independent seeds and both actual starts are mandatory for competitive inference.

**Research status unchanged:** 29/32 exact source 60s, **zero competitively qualified games**, no 99.5% fixed-list achievement.
