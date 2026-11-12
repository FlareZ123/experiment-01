# New Moon Lockbreaker: native witness for Telepathic Psychic Energy

**Agent20 | 12 November 2026.** This is a read-only audit of the already completed 116-game New Moon-versus-Shadow Rider panel, not a new experiment.

## Determination

The pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` demonstrably recognizes the candidate's `Telepathic Psychic Energy` and resolves its search-and-shuffle effect in real native games. This is a **positive engine-support witness**, not a complete card-rules certification.

The official Japanese printing is **M3 079/080, card ID 49712** ([official Japanese card page](https://www.pokemon-card.com/card-search/details.php/card/49712)). The English proxy uses `me3-88` (`resources/cards/en/me3.json`). The printed effect attaches as Psychic Energy and, when attached from hand to a Psychic Pokémon, permits a search for up to two Basic Psychic Pokémon to Bench, followed by a shuffle.

## Existing native evidence

Source: [Agent3 all-29 116-game report](agent3-dual-fixed60-all29-paperprofile-20261109.md), manual CI [42574658791](https://github.com/FlareZ123/experiment-01/actions/runs/42574658791), artifact `agent3-dual-fixed60-all29-paperprofile-native` (ID `13654836844`). Downloaded archive SHA-256:

`b6c9dfb39416e89acbd579d2659b3b74f0451a4510c6e1ead86a04d14dfee556`

The New Moon candidate used the same deck fingerprint `99969539010abfa11c4e671a5744ed4d97f23cf2f7f275399ac35f5bc1013c0f` and the pinned Twinleaf revision above. In its 58 registered candidate attempts:

- **97** `PlayCardAction` roots played `Telepathic Psychic Energy` across **51** distinct trials.
- All 97 had a matching accepted Store target receipt; every recorded owner-hand printing was `Telepath [P] Energy M3`.
- **34/97** plays were followed by a `ChooseCardsPrompt` from the deck and then `ShuffleDeckPrompt`.
- All 34 prompts reported `min=0`, `max=2`, and `allowCancel=true`.
- **28** prompts selected two cards; **6** selected one; 62 cards total were selected.
- All 62 selected cards were Basic Psychic Pokémon in the repository card pool: Duskull VIV/PRE, Galarian Articuno V CRE, Gengar & Mimikyu-GX TEU, Klefki SVI, Latias ex SSP, and Lillie's Clefairy ex JTG.
- All 34 search prompts occurred when the energy was attached to a Psychic Pokémon. The other **9** attachments to non-Psychic targets (8 Squawkabilly ex PAL, 1 Minior PAR) had no search prompt.

This establishes that the engine can trigger the attachment search, present a 0–2-card deck-selection prompt, accept Basic Psychic selections, and proceed to shuffle. It is stronger than merely observing that the card can be loaded into a deck.

## What this does not establish

- The 54 attachments to Psychic targets without a recorded search prompt are not explained by this artifact. Empty legal target supply or no available Bench space may account for some or all, but the necessary per-root deck/Bench availability was not captured here.
- `nativePromptChoices` records selected cards, not the complete set of offered options. Therefore this audit does not prove that non-Psychic Basic Pokémon were excluded from the prompt's selectable set.
- No deliberate negative fixture tests attachment to a non-Psychic Pokémon, attachment from a non-hand zone, or mixed-type deck-option filtering.
- This was an uncontrolled developmental policy in a 260-root-capped panel, not a rules adjudication or a paper-qualified game. It does not certify the rest of the candidate's card text, Japanese Extra legality, policy competence, or competitive strength.

## Release-path implication

Do not classify Telepathic Psychic Energy as wholly unsupported by Twinleaf: the existing artifact contains 34 real native search-and-shuffle resolutions. Retain a **partial positive support** status, with negative/type-filter coverage still open. A focused manual regression should test:

1. attach from hand to a Psychic Pokémon with multiple Basic Psychic and non-Psychic Basics in deck; only Basic Psychic targets may be selected, with 0–2 permitted;
2. attach from hand to a non-Psychic Pokémon; no search trigger;
3. attach from discard/deck or another non-hand source; no hand-attachment trigger;
4. one and two selected targets both shuffle correctly, including a full-Bench/no-legal-target boundary.

This existing witness can inform the 4410 engine review without dispatching another isolated panel. It does not waive the integrated V2 builder, hook/policy, clock, paper-legality or independent-review gates.
