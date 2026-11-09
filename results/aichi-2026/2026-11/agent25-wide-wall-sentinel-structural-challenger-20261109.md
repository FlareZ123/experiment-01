# Wide Wall Sentinel v1: preserve Vileplume under Supporter gust while attacking

**Agent 25, 9 November 2026. Fixed-60 structural challenger, not a nominated winning deck.**
[Human-playable printed list](agent25-wide-wall-sentinel-v1.psv) ·
[Exact physical-opportunity calculator](../../../scripts/2026-11/agent25-wide-wall-sentinel-frontier.cjs) ·
[Independent tests](../../../tests/2026-11/agent25-wide-wall-sentinel-frontier.test.cjs)

## Decision

Investigate a genuinely different control line, **Active Rhyperior SCR 76 Wide Wall + Benched Vileplume AOR 3 Irritating Pollen**, as a response to the independently demonstrated Sentinel weakness against an original rank-1 **Guzma -> vulnerable Benched Vileplume -> Max Geist** counterattack. Rhyperior's printed Wide Wall prevents effects of the opponent's Supporters done to the player's Pokémon while Rhyperior remains Active. Its Drill Run attack deals 180 and discards one Energy from the opposing Active Pokémon. Two Strong Energy FFI 104 can each add 20 damage to Rhyperior's Active-target attack; 2 Double Colorless Energy SUM 136 supply two Colorless units per card. A single Strong Energy and a Double Colorless therefore cover Rhyperior's printed Fighting + two Colorless cost and make a **200-damage, one-Energy-discard** attack *if both remain effective*. This is a **conditional attack calculation**, not an observed native or paper attack.

The protection is narrower than the replaced Stoutland BCR 122 Sentinel: Wide Wall does not prevent the opponent from playing Supporters for player/hand effects or from advancing their own board. It must have an unsuppressed Active Ability, and neither Wide Wall nor Vileplume is a blanket protection from attack damage, Trainer effects targeting the player, or Pokémon effects. Opposing Garbotoxin/Ability lock, Path to the Peak where relevant, Tool Jammer interactions, Boss alternatives, direct Rhyperior Knock Out, and Stadium denial all need actual source tests. This swap also reduces Jet/Capture Energy mobility and removes Temple of Sinnoh; an opponent's Temple of Sinnoh could neutralize the attack's Special Energy counts/effects. No statement of actual Guzma suppression follows from card text alone: exercise the printed ruling in real Store and an independent paper-rule check.

## Nine physical card-slot substitutions

| Cut from Sentinel v1 | Add to this fixed challenger |
| --- | --- |
| 2 Lillipup CEC, 1 Herdier SUM, 1 Stoutland BCR | 2 Rhyhorn SCR 74, 1 Rhydon SCR 75, 1 Rhyperior SCR 76 |
| 2 of 3 Jet Energy PAL, 1 of 2 Capture Energy RCL, 1 Grass Energy MEE | 2 Double Colorless Energy SUM, 2 Strong Energy FFI |
| 1 Temple of Sinnoh ASR | +1 Artazon PAL (2 total) |

Retains 26 Pokémon, 28 Trainers, 6 Energy and all 60 cards. Retains 2 Vileplume, 3 Stealthy Hood, 1 Grand Tree ACE SPEC, 4 Tag Call and 4 Guzma & Hala. The 2/1/1 Rhyperior chain has the same singleton Stage-1/Stage-2 exposure as the removed 2/1/1 Stoutland chain. Grand Tree can accelerate a Stage-2 chain, but its once-per-turn use and its symmetric Stadium benefit contend with the Vileplume and Pidgeot lines. Without Strong Energy plus Double Colorless, Rhyperior's attack is not automatically payable. Artazon supports Rhyhorn and Oddish Basic access and can contest an opponent's Stadium.

## Exact static resource-location gate, with full physical Prize accounting

For this exact 60, enumerate every seven-card opening hand and six disjoint face-down Prizes, conditional on a valid opening seven (14 Basics). Require: **one Rhyhorn plus either Tag Call or Guzma & Hala directly in the first seven**, and at least one copy of each Rhydon, Rhyperior, Oddish, Gloom, Vileplume, Double Colorless Energy, Strong Energy and Grand Tree *not Prized*. The full exact fraction is:

- **10.5902415244%** of valid starting seven-card hands with six random Prizes, or **180543427297 / 1704809346240**.
- Before opening-hand requirements, **68.4377353244%** of six-Prize combinations leave at least one of every required piece outside Prizes.

This is a **restricted sufficient location predicate** only: the relevant cards may be in the hand, so a Grand Tree deck search need not be capable of selecting them; one Supporter can fill one channel; Grand Tree can evolve one chain per turn; actual Fighting energy and evolution timing, Item/Superior Tool locks, current Bench and Energy attachments, draw/search choices, resource payments, opponent action and paper legality are unresolved. The percentage is **not an attainable-attack rate, not a universal setup bound, and not any win-rate estimate**. The event intentionally captures one particular accelerated Rhyperior/Vileplume route. Alternate evolutions or Prize recovery may bypass it.

## Required decisive contest before further promotion

1. On both physical seats, create a clean pinned-Store test with an Active, attack-ready Rhyperior, Benched Vileplume and opposing original rank-1 held Guzma plus at least one alternate eligible Bench target. Compare identical original state against Stoutland Sentinel and a no-shield control. Assert actual native paid Guzma action, target prompt, selected Pokémon, Active position and whether the Bench Vileplume stays protected. Include the negative control with Rhyperior Ability suppressed.
2. On the unchanged printed 60, compare whether Rhyhorn -> Rhyperior -> paid Drill Run is reachable **before** the opposing Shadow Rider, Iron Thorns and Regidrago source lines can knock out or disable the lock. Track every held Supporter/Tag Call/Grand Tree opportunity and actual Strong/DCE custody. Include all errors, root caps and opposite physical orientations.
3. If the lock and attacker survive live counterplay, run a prospectively registered fixed-seed paired game test against *all 29 currently authenticated originals*, with identical bilateral opponent-competent policy and complete physical deal lineage. Full 32 remains blocked by missing original ranks 23/25/28.

No pinned native match or source-competent game has yet been executed for this variant. Historical Aichi paper Japanese Extra requires Japanese-language eligible printings; the English IDs are research equivalents, **not certified Japanese-language print registrations**. Current shared benchmark still has zero competitively paper-qualified games and no established 99.5% win rate.
