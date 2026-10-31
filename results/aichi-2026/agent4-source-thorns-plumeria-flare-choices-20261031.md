# Agent 4: original Iron Thorns Team Flare Grunt versus Plumeria same-root coverage and hand-access gate

**31 October 2026 | pure actor-observation model, official English card printings and exact original source 60s**

## What both Supporters actually compete over

Original Aichi final-place ranks **6, 24 and 29** each contain **four Plumeria BUS**, **two Team Flare Grunt XY**, and **four Iron Thorns ex TWM** as their only opening Basic Pokémon. The authenticated original cards come from [the published field manifest](full-decklists.json); no substituting a proxy deck.

The [printed English Plumeria BUS rule](../../simulation/twinleaf/agent4-plumeria-payment-menu.cjs) requires discarding **two other hand cards** to discard one Energy from **any opposing Pokémon**, including Bench. The [printed Team Flare Grunt XY rule](../../simulation/twinleaf/agent4-supporter-energy-denial-contest.cjs) discards an Energy on the **opposing Active Pokémon**, without an additional two-card hand payment. Both consume the single ordinary Supporter opportunity. They consume distinct printed Supporter cards, and Plumeria's discard outlet may independently be beneficial. Therefore the comparison is an **observable effect/cost coverage relationship**, **not** a universal claim that Team Flare is stronger.

[New read-only structural comparator](../../simulation/twinleaf/agent4-supporter-energy-denial-contest.cjs) calls the separate [Plumeria physical payment menu](../../simulation/twinleaf/agent4-plumeria-payment-menu.cjs). It records independent physically held Team Flare copies and their Active Energy targets, any Energy target reachable by both families, opponent Bench Energy targets reachable only by Plumeria, and how many Plumeria payment pairs would themselves consume Team Flare. Every conclusion uses the acting player's own hand and public board. The sampler never sees opponent hidden hand, deck or Prizes. Both actions remain native-playability-unverified within the new comparator; it does not dispatch or claim a strategically superior action.

**Concrete synthetic same-root case:** owner hand \`Plumeria, Team Flare Grunt, Crushing Hammer, Guzma\`; opposing Active holds a Speed Lightning Energy and Bench holds Double Dragon. There is one shared Active Energy target and one Plumeria-only Bench target. The three potential Plumeria two-card payments include **two that discard Team Flare** and **one that preserves it**. With only \`Plumeria, Team Flare, Crushing Hammer\`, every Plumeria payment forfeits Team Flare. This is a genuine opportunity-cost distinction a priority-first selector cannot represent with binary "Supporter available".

[12 pure tests](../../tests/agent4-supporter-energy-denial-contest.test.cjs) passed in the preexisting [manual Plumeria compiled CI 41161248928](https://github.com/FlareZ123/experiment-01/actions/runs/41161248928), along with the previously added nine Plumeria menu tests and the both-seat native Plumeria prompt tests. The workflow completed success. Tests include every payment-cost count, duplicate Energy target ordinal, Bench-only target, Supporter lock/quota, limited hand, two distinct Plumeria copies, hidden-opponent permutation invariance and no input mutation. No policy choice or entire game was qualified by these tests.

## Exact original opening coholding frequency

[Exact BigInt inclusion-exclusion script](../../scripts/agent4-contested-supporter-firstdraw.cjs) conditions on a **Basic-valid original seven** (at least one of four Thorns), then asks whether the acting player physically holds **at least one Plumeria and at least one Team Flare** in the initial seven and after one or two ordinary random draws. Six original Prize cards can be marginalized for these observed draws by physical-position exchangeability. No opponent mulligan bonuses, Trainer drawing, search, effects, competing actions, or opponent Energy availability are assumed.

The numerator, with deck size N=60, opening h=7, Basic copies b=4, Plumeria a=4, Team Flare f=2, and subsequent ordinary draws k, is:

\`\`\`text
S(k) = Σ over T in {none, A, F, A+F}:
       sign(T) × [C(60 - |T|, 7) - C(56 - |T|, 7)]
                    × C(53 - |T|, k)

D(k) = [C(60, 7) - C(56, 7)] × C(53, k)

P(both Supporters physically held | valid 7) = S(k) / D(k)
\`\`\`

Here \`|T|\` is 0, 4, 2, or 6 removed copies with inclusion-exclusion signs +, -, -, +. Explicit disjointness of the three card types is essential.

| Owner's known natural cards | Exact conditional probability |
| --- | ---: |
| Valid original seven | **612,457 / 9,643,095 = 6.3512492618%** |
| Valid seven + one ordinary draw | **820,454 / 9,643,095 = 8.5082019829%** |
| Valid seven + two ordinary draws | **64,225,443 / 590,585,996 = 10.8748672395%** |

All three exact original Iron Thorns source lists have the same category counts, so the physical coholding result is identical for ranks 6, 24 and 29. This is a **source hand-access ceiling for immediate natural coholding** and not the entire in-game encounter frequency: subsequent search/draw can change holdings, discards may consume either Supporter, and opponent mulligans may award more cards.

Five code-level tests, including **24 independent exhaustive small labelled-deck enumerations**, passed the [existing lightweight manual Iron Thorns CI 41161431000](https://github.com/FlareZ123/experiment-01/actions/runs/41161431000). The test compares unreduced physical enumeration counts against reduced BigInt fractions rather than tolerating rounded probabilities.

## Impact on the benchmark

The current common two-seat first-return policy must eventually arbitrate a live Plumeria-versus-Team Flare-versus-other-legal-action conflict from the **same detached owner observation**. A practical next test is a single matched original rank-6 source root with both in hand, native-validated Supporter alternatives, chosen physical Plumeria cost, and a later owner and opposing response. A native two-seat standalone Plumeria fixture already validated actual prompt and Energy movement; the **cross-Supporter same-root match** remains to be tested.

This result is **neither a policy improvement nor competitive strength evidence**. As before, exactly **29/32** published Top32 original 60s are authenticated (ranks 23, 25, 28 missing), **zero** competitively qualified games, and no validated fixed 60 or demonstrated 99.5% field win rate.
