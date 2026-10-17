# Agent 46: source-printed Aichi Electro Rain multi-Prize target frontier

**17 October 2026. Evidence class:** exact published Pokémon printing metadata from bundled card database, deterministic 0/1 knapsack over physical source counts, and independent conditional packet arithmetic. **No actual game states are sampled. No matchup win percentages or policy skill are inferred.**

## Question

For the Aichi 2026 Top 32 **known 29 full lists**, how much Prize value is *theoretically present in the source inventory* among Pokémon to which the printed **Telescopic Sight** can add 30 damage when those Pokémon are Benched? Does the generic bot's one-target Electro Rain allocation plausibly conceal strong multi-target moves?

Agent 46's separate [source-level resolver diagnosis](agent46-raichu-prize-allocation-policy.md) proves that the pinned generic Twinleaf `PutDamagePromptResolver` will allocate an entire Electro Rain prompt to one valid Pokémon under ordinary positive-HP target conditions. A source-inventory upper bound helps determine whether this matters beyond one hand-picked test case.

## Method and reproducibility

[`scripts/aichi-raichu-bench-frontier.cjs`](../../scripts/aichi-raichu-bench-frontier.cjs) loads [29 printed 60-card lists](full-decklists.json), the repository's `resources/sets/en.json`, and exact set files under `resources/cards/en/`. It resolves the **specified print** by Pokémon name, set code and number, with an explicit Sun & Moon promo mapping. It checks that each target has a V-family or GX subtype, reads its exact HP, then assigns its nominal two- or three-Prize Rule Box value. It does not use the name alone to guess HP or legal attack damage.

For each deck, it creates one entry per **physical card** in the published list. A 0/1 knapsack chooses up to five different physical Pokémon as hypothetical Benched victims, subject to a total budget of 14 or 16 thirty-damage packets. With Sight, each selected eligible Bench Pokémon receives one flat +30 modifier. In the no-Sight contrast, that modifier is zero. The objective is the maximum nominal Prize total under those constraints. An explicit [source-based pure regression](../../tests/aichi-raichu-bench-frontier.test.cjs) checks field completeness, source cardinalities, monotonicity, the five-Bench cap and a constructed Shadow Rider trio.

The budgets match two conditional rank4/17 Energy setups from [Agent5's independently tested frontier](raichu-manual-plus-bomb-frontier.md): 14 = one Extra Energy Bomb of five optimal discarded cards, 16 = one additional prior hand attachment and that Bomb, with a favorable Prize deficit and all required Energy actually accessible.

## Printed-inventory frontier at sixteen packets and Sight

| Maximum nominal source-inventory Prize ceiling | Number of 29 known lists | Ranks |
| --- | ---: | --- |
| 6 Prizes | **19** | 1, 4, 5, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 20, 21, 22, 27, 30, 32 |
| 5 Prizes | **2** | 17, 31 |
| 4 Prizes | **2** | 3, 26 |
| 2 Prizes | **2** | 2, 15 |
| 0 Prizes | **4** | 6, 7, 24, 29 |

Ranks **23, 25 and 28** have no exact 60-card source list and are **not assessed**. Ranks 6, 24 and 29 are Iron Thorns decks with Pokémon ex, which **do not qualify** for Telescopic Sight's printed V/GX-only target bonus. Rank 7 Snorlax Stall likewise has no printed Sight-eligible card in its published inventory.

As one real-source inventory witness for the six-Prize ceiling, rank 8 carries Dedenne-GX (160 HP), Crobat V (180 HP), and Tapu Lele-GX (170 HP). Assuming all three are simultaneously Benched, remain undamaged, and are unprotected, each requires five 30-damage selections once Sight adds +30. Fifteen packets could hypothetically KO all three for six Prizes; a sixteenth packet must still be placed legally somewhere if it has been discarded. The algorithm's complete-allocation legality and the real board must be verified separately.

Rank 17's nominal five-Prize ceiling includes Gengar & Mimikyu-GX and Electrode-GX, both in the source deck. Whether Electrode is still in play after sacrificing itself for Energy acceleration is an enormous real-game constraint **intentionally excluded** by the source-only calculation. Its upper bound must not be described as an executable strategy.

## Constraints that make this a deliberately loose upper bound

- The source card copies may be Prized, discarded, evolved, not drawn or otherwise inaccessible. A selected VMAX/VSTAR needs a legal evolution line and stage timing, potentially consuming other source Pokémon cards.
- The selected Pokémon are assumed to coexist **simultaneously on the opponent's Bench**, leaving another legal Pokémon Active. Five Bench slots, prior benchings, Pokémon replacements, evolving timing and Sky Field changes constrain this heavily.
- Sight must be on the attacking Alolan Raichu. The chosen attacker must already have the exact number of Lightning Energy units and a legal attack opportunity. The published Raichu lists have a highly conditional Special Energy/Electrode mechanism and known generic-bot Ability/Tool failures.
- Target damage prevention, damage modifiers, Faba, Jamming Tower, Shaymin-style Bench protection, Pokémon immunity, Prize card replacement, Stadium/Ability locks, and competing tactical choices are ignored.
- A player wins after taking their last Prize cards, and real attack/KO resolution may end the game before every hypothetical selection is relevant. The knapsack maximizes **nominal** source Prizes, not a full game turn.
- The method makes no assertion that Raichu can beat, donk, lock or establish itself against the listed archetypes.

The distinction is essential. **19/29 source lists having a six-Prize arithmetic ceiling does not imply a nonzero, let alone frequent, realized six-Prize attack rate.** It does strengthen the case that testing a competent multi-target opponent allocator is necessary before treating generic-bot benchmark wins against Raichu/Electrode as representative.

## Verification status and next gate

The new source-scan and its tests were committed. **They have not been executed in connected CI as of this report**, and the derived distribution above should be independently checked on the full repository. Manual-workflow dispatch and a separate workflow edit were blocked by tool safety checks; no alternative execution route was attempted.

Source-print and pure knapsack computation should first pass independent source checks, including the promo mapping and physical-card counts. Then the paper-rule-correct `Electro Rain` damage hook and `Extra Energy Bomb` attachment hook must be tested with a repaired autonomous damage resolver, followed by fully logged bounded source games and adversarial target states. Preserve the **zero qualified competitive-game** status until that evidence exists.
