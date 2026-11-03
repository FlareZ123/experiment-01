# Exact-energy Regidrago Apex → Ryuno Glide: successful pinned native Store receipt on both ASC printings

**Agent 12 | 3 November 2026 | real pinned Twinleaf Store in a staged board, two actual card printings, no complete source-dealt game.**

## What was newly verified

The previous [Agent21 overfunded native Ryuno receipt](../twinleaf/agent21-m2a232-asc271-native-apex-ryuno-20261022.md) already established that a copied Mega Dragonite ex attack can discard one Double Dragon Energy (DDE) card as the required two Energy units. Its attacker held **three Basic Energy plus DDE**, so that fixture did not reproduce the proposed ADP v2's exact minimum attack Energy.

The **same pinned native Store code** now passed an exact-resource fixture on **both physical Mega Dragonite ex printings**:

| Native Store observation | ASC 152 | ASC 271 |
| --- | --- | --- |
| Regidrago VSTAR attached before Apex | **1 Basic Grass + 1 Double Dragon** | same |
| GGF Apex attack cost accepted | Yes | Yes |
| Source attack chosen with actual `ChooseAttackPrompt` | Ryuno Glide | Ryuno Glide |
| Store's `ChooseEnergyPrompt` offers | DDE two units and Grass one unit | same |
| One DDE as the mandatory two-Energy discard | **Accepted** | **Accepted** |
| Alternative two Basic Energy cards available | No | No |
| Damage recorded on staged target | **330** | **330** |
| Physical attached Energy after attack | **one Basic Grass only** | same |
| Spent DDE present in discard | **Yes** | Yes |

The exact payment shows a **genuine one-attack Energy tradeoff**: with only DDE plus one Basic Grass attached, copying Ryuno Glide via Apex Dragon consumes the DDE to fulfill its two-Energy discard, and leaves Regidrago with one Basic Grass. A subsequent Apex Dragon cannot be used at the original Grass, Grass, Fire cost on that board until it acquires additional legal Energy. The exact first-hit 330 damage and final Energy state are native Store observations, unlike the earlier full-HP/Goodra shield deductions that were paper-conditional.

## Reproduction and provenance

Added read-only native regression [`tests/agent12-apex-ryuno-exact-three-energy-native.test.cjs`](../../tests/agent12-apex-ryuno-exact-three-energy-native.test.cjs) as an optional step of the existing [manual Agent21 source-photo workflow](../../.github/workflows/agent21-dragonite-photo-native.yml), input `agent12_exact_apex_energy:true` (default **false**). It calls the already present `simulation/twinleaf/apex-mega-dragonite-energy-discard.cjs` with `energyScenario:'exact-apex'`, no change to vendor code, paper decklists or fixture source. The established helper makes an exact 1 Grass + DDE attacker before `AttackAction('Apex Dragon')`, uses real emitted attack/energy prompts, records physical Energy zones and damage, then asserts all specific observations for ASC 152 and the alternative artwork ASC 271.

The [manual CI run **41579957340**](https://github.com/FlareZ123/experiment-01/actions/runs/41579957340) at repository head `989bf18fb702395876eecfbc2a235cdbbea2751b` compiled the pinned `vendor/twinleaf` engine and completed **SUCCESS**. The exact new Node TAP regression recorded **2 tests passed, 0 failed**, with the actual Store log showing DDE `units:2`, Grass `units:1`, `ChooseEnergyPrompt` cost `[9,9]`, DDE payment accepted and the after-attack single Grass. CI also reran Agent21's prior overfunded two-print receipt successfully; its original artifact was retained as [artifact 13205248789](https://github.com/FlareZ123/experiment-01/actions/runs/41579957340/artifacts/13205248789). Minor submodule cleanup warnings came after test completion and did not alter the success status.

The underlying upstream vendor revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` as recorded in existing fixture/Agent21 integration. This fixture is a staged established VSTAR Active with injected source card, resources, filler prizes and target; its **330 observed damage** is against the existing unprotected staged target, not an actual 280-HP Rolling Iron-defended Regidrago. It does not execute enhanced ADP-GX or real opponent gameplay. Keep qualification `false`.

## Decision relevance

The [new five-original-source Goodra shield 280-damage breakpoint](../aichi-2026/agent12-adp-rollingiron-defensive-ko-breakpoint-five-originals-20261103.md) establishes a potential *extra immediate Prize* from a Dragonite attack that current Wild Blaze cannot get in a specific shielded board. The present native receipt establishes the **opportunity cost of spending DDE** when the attacker has exactly its original minimum attack Energy. Both mechanisms must be modeled together.

A candidate that swaps the M Charizard attack donor for Mega Dragonite may win a specific Prize exchange one turn earlier while becoming less able to attack on the next turn. Since 4 DDE in the original fixed60 are limited, losing one to the 330 attack can be expensive against Item/Supporter lock and Temple/Energy denial. A native original-source head-to-head with a specific board showing both payoffs is still needed. There are **zero competitively qualified game wins**, no ranked fixed deck promotion and no demonstrated 99.5% against 29/32 currently authenticated originals.
