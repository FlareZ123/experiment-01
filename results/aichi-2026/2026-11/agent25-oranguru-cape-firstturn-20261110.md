# Asymmetric Oranguru V Cape Sentinel: authentic two-Tool opening, no shared Town Store

**Agent 25 | 10 November 2026 | original-print physical 60 versus original rank-1 60 | full games qualified: 0.**

## Structural idea and exact fixed 60

The [Oranguru V Cape Sentinel v1 60-card challenger](agent25-oranguru-cape-sentinel-v1.psv), [print-resolved JSON](agent25-oranguru-cape-sentinel-v1.json), replaces exactly **Temple of Sinnoh ASR 155 ×1** in [Cape Sentinel v1](agent25-cape-sentinel-v1.psv) with **Oranguru V ASR 133 ×1**. It retains **Artazon PAL 171**. The new Pokémon V's printed **Back Order** Ability searches two Pokémon Tool cards, providing a second Tool-search channel separate from Guzma & Hala's own Tool choice.

The difference from [Town Store Cape Sentinel v1](agent25-townstore-cape-sentinel-v1.psv) is strategic: the Town Stadium can also grant the opponent a searched Forest Seal Stone under Vileplume Item lock. Oranguru V's own Ability supplies the two-Tool access only to its controller, without making the Stadium symmetric. However, it requires **Oranguru V to start Active**, because **Jet Energy must later switch it out for the TM-bearing Bunnelby**. After switching, Oranguru V remains on the Bench as an exposed **two-Prize Pokémon**, and an opposing Ability lock can prevent Back Order. The Temple slot is still lost.

## Original-printed paid native action sequence

[Compiled pinned Twinleaf manual workflow 42727835379](https://github.com/FlareZ123/experiment-01/actions/runs/42727835379) reached a **successful native Oranguru step** in **both source seats**. [Executable test](../../../simulation/twinleaf/2026-11/agent25-oranguru-cape-backorder-native.cjs) uses genuine native cards, game actions and resolved prompts, with each printed candidate and original rank-1 source roster consisting of **60 unique real physical card objects**. It constructs a deliberately favorable *possible* deal, with Oranguru V Active and Oddish Benched, both from the fixed candidate 60, and a genuine original rank-1 source-printed counterposition.

1. **Back Order** on initial Active Oranguru V searches the original own deck for a real **Luxurious Cape PAR** and **TM: Evolution PAR**. Cape is not initially held.
2. A genuine **Guzma & Hala CEC** consumes two actual held discards and searches **Artazon PAL**, **Stealthy Hood UNB** (the Supporter's Tool category), and **Jet Energy PAL** from the same printed 60. The Ability and Supporter are separate action channels.
3. **Artazon** searches an original Bunnelby from the deck, with ordinary native Stadium/search prompts. Cape is attached to Oddish, TM to Bunnelby, and Jet to Bunnelby moves it from Bench to Active, sending Oranguru V to the Bench.
4. The active Barrage Bunnelby uses two genuine **TM Evolution** attacks, evolving the original Benched Oddish through Gloom into Vileplume AOR. Cape stays attached, yielding actual **230 HP**.
5. The actual original rank-1 source counterreply evolves its two Shadow Rider V to VMAX, uses two genuine paid Underworld Doors and one native manual Psychic Energy attachment to put four physical Psychic on a VMAX, pays **Guzma** to promote the 230-HP Vileplume and the attacker, then resolves **Max Geist** for **130 damage**. Both seats end with Vileplume surviving and **no Prize** taken.

The test uses the already established default-off [numeric deck-shuffle validation correction](../../../simulation/twinleaf/agent33-shuffle-prompt-numeric-validation.cjs) for a pinned vendor bug in 11+-card shuffles. All Pokémon, Tools and Energy are from the two unchanged original 60-card rosters; no emulated attack or forged extra card.

## Exact opening ceiling of the demonstrated line

The registered challenger has **15 Basic Pokémon** including exactly **one Oranguru V**. A legal starting seven must contain a Basic. Without any mulligan bonus, the exact chance that that singleton Oranguru occurs within the legal starting seven is

`[7/60] / [1 - C(45,7)/C(60,7)] = 13.220030789787085%`.

This is a hard **opening-location ceiling for the specific Back Order-first-turn setup** because the required Oranguru must be in the starting seven to begin Active. It is not the deck's overall chance to establish Vileplume through other lines, such as normal G&H / Artazon / a naturally held Cape. The first-eight resource corridor of this staged line additionally holds **Oddish** and one of **Guzma & Hala / Tag Call** by the eighth card. Conditioned on Oranguru in opening seven, the other six opening cards plus the first natural draw are a uniform seven-of-59 draw, so inclusion-exclusion yields

`P(Oddish≥1 and G&H/Tag≥1 | opening Oranguru) = 1 - C(57,7)/C(59,7) - C(51,7)/C(59,7) + C(49,7)/C(59,7) = 13.744443835327236%`.

Jointly among valid starts these two location gates occur in **1.8170197069152533%** of valid starts. This excludes the other necessary line pieces, Prize positions, paid discards, Bench space and opponents. It is a **necessary gate only for this exact demonstrated two-Tool path**, not an estimate of overall first-turn lock success. The result argues strongly against presenting the singleton-Oranguru-dependent branch as a broadly consistent primary plan.

## Competitive decision

**Promising asymmetric path, still unselected.** Oranguru V resolves the first-turn two-Tool contention without granting the original rank-1 opponent a mutual Town Store Tool search, and establishes a physical first-turn Caped lock on a printed candidate 60. The **mandatory start with the singleton Oranguru V** is a substantial deck consistency cost, and the 2-Prize support Pokémon creates a potentially attractive gust target. This test selected its favorable deal and rank-1 response, so it is neither a natural-first-turn probability nor a win-rate measurement. The opponent's strongest response to Oranguru V itself, Ability locks (notably Iron Thorns ex), the full 29 authenticated Aichi lists and missing original ranks 23/25/28 are unresolved. **No full-game competitive wins are established, and the 99.5% target remains unverified.**

Prior useful comparisons: [Cape original-rank-1 continuous Max Geist](agent25-cape-firstturn-continuous-rank1-reply-20261109.md), [Pale Moon-GX source response and owned second-Jet rescue](agent25-cape-firstturn-palemoon-and-jet-counterreply-20261109.md), [Town Store symmetric Forest Seal Stone source counterconnector](agent25-townstore-cape-firstturn-structural-20261110.md).
