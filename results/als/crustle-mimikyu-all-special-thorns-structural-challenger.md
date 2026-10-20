# Crustle Ascension versus all-Special Iron Thorns: new, unqualified 60

**Agent 1, 20 October 2026. Evidence:** exact source-roster inventory, exact English snapshot card text, Advanced Player's Rulebook II-C-12, and BigInt multivariate hypergeometric enumeration with an independent small-deck physical-deal oracle. **No genuine Twinleaf Store match, no competitive-qualified win and no deck selection.**

## Fixed exploratory deck

The complete **unchanged 60** is [18 exact English-printing rows](crustle-immunity-walls-english-proxy-60.json); the [printing regression](../../tests/aichi-crustle-english-proxy-60.test.cjs) checks the corresponding bundled English cards. Its four Dwebble, four Crustle and three Mimikyu are a genuinely different single-Prize, non-Rule-Box engine from the existing Shadow Rider and New Moon candidate architectures. This is a **structural challenger** proposed for falsification. It is not the final nominated deck, and individual English Expanded flags are not proof of Japanese paper legality or current bans/errata.

| Category | Frozen card quantities |
| --- | --- |
| Pokémon (11) | 4 Dwebble **SV10 11**; 4 Crustle **SV10 12**; 3 Mimikyu **PAL 97** |
| Energy (12) | 5 Basic Grass; 3 Basic Psychic; 4 Double Colorless |
| Trainers (37) | 4 Buddy-Buddy Poffin; 4 Nest Ball; 4 Professor's Research; 4 Lillie's Determination; 4 VS Seeker; 3 Ultra Ball; 3 Temple of Sinnoh; 3 Dimension Valley; 2 Field Blower; 2 Rescue Carrier; 2 Enhanced Hammer; 2 Boss's Orders |
| **Total** | **60** |

## Source-locked mechanical opportunity

The exact published Aichi ranks **6, 24, 29** each register **four Iron Thorns ex TWM 77, eight Special Energy and zero Basic Energy**. Each source's only Pokémon is Iron Thorns ex. Source-roster file: [29 published exact 60s](../aichi-2026/full-decklists.json). Source ranks 23, 25 and 28 still lack complete public 60s.

- **Dwebble SV10 11** has 70 HP and **Ascension**, costing one Colorless: search the deck for its evolution and evolve it. Advanced Player's Rulebook II-C-12 permits this effect on the first turn or the turn the Basic entered play unless otherwise specified. Going second, a one-Energy Dwebble can therefore seek **Crustle SV10 12** on its first attack, conditional on surviving to attack, a Crustle remaining in the deck, and no relevant restriction.
- **Crustle SV10 12** has 150 HP and **Mysterious Rock Inn**, preventing **damage from opposing Pokémon ex attacks**. Iron Thorns ex's **Initialization** removes Abilities only from Pokémon *with Rule Boxes*, so it does not suppress Crustle's own non-Rule-Box Ability. The printed 140-damage **Volt Cyclone** would be prevented while this Ability functions. That does not prevent all attack effects, Trainer disruption or deck-out.
- Crustle's **Superb Scissors** does 120 damage for **Grass + Colorless + Colorless**, bypassing effects on the Defending Pokémon for its damage calculation. Against printed 230-HP Iron Thorns ex, two successful unmodified attacks total 240 damage and can Knock It Out. Taking six Prizes by defeating three such ex takes **at least six** successful Crustle attacks under this narrow damage-only line; Gust, healing, Energy denial, evolving and game clocks can change the sequence.
- **Temple of Sinnoh ASR 155** makes attached Special Energy provide Colorless only. While Temple remains in play, the published all-Special Iron Thorns lists cannot pay the printed Lightning portion of Volt Cyclone through those Energy cards. However, opposing Stadiums can replace Temple, the source has other Trainer and milling lines, and Temple **also reduces this challenger’s Double Colorless Energy to a single Colorless**. This is material connector contention, not a free lock.

The companion **Mimikyu PAL 97** is Basic with Safeguard against damage from both Pokémon ex and Pokémon V, and **Ghost Eye** places seven damage counters at the cost of Psychic + Colorless. The two attacks use different types of Energy. Ghost Eye alone needs **four** placements to remove 230-HP Iron Thorns ex and four against a 280-HP Regidrago VSTAR. Mimikyu's Ability is also suppressed by effect-specific Ability locks; damage counters, statuses and attack effects may bypass its attack-damage prevention.

## Exact opening-resource census and adverse tradeoff

The [BigInt script](../../scripts/aichi-crustle-ascension-opener.cjs) and [independent exhaustive miniature physical-deal test](../../tests/aichi-crustle-ascension-opener.test.cjs) count a sharply defined event. A uniformly dealt initial seven must contain a Dwebble that can be chosen Active. The initial seven plus the next natural turn draw must contain at least one Basic Grass Energy, and at least one Crustle must remain **in the deck** after six hidden Prizes are set. The enumeration integrates drawing, Prizing and the missing-stage1 collapse jointly. Sampling the next natural draw before the six Prize cards is mathematically exchangeable with the actual setup order. No optional opponent mulligan cards, searches or post-Attack DCE draws are included.

| Inventory sensitivity (other 60-card slots unchanged) | Valid seven | Expected initial mulligans | Event given valid seven | Event unconditionally |
| --- | ---: | ---: | ---: | ---: |
| **Frozen candidate:** 4 Dwebble, 3 Mimikyu, 5 Grass, 4 Crustle | **60.08795%** | **0.66423** | **32.43145%** | **19.48739%** |
| **Hypothetical three-slot replacement:** 4 Dwebble, 0 Mimikyu, 8 Grass, 4 Crustle | 39.94996% | 1.50313 | 66.80638% | 26.68912% |

The candidate's given-valid rational is exactly **53994312538437/166487530172600** and its unconditional rational **620624282051/3184747716150**. Alternative given-valid rational: **38275551437/57293261025**. Each fraction is reproducible from the code; 3/3 pure tests passed under Node 22 locally, including an independently enumerated nine-card physical-deal model. The printing test also passed locally against the supplied card snapshot. No manually dispatched compiled GitHub Action has validated a full match for this variant.

These are **resource-location probabilities**. They are neither legal attack probabilities nor win rates, nor upper bounds on eventual setup, since Buddy-Buddy Poffin, Nest Ball, Ultra Ball, Supporters, opponent's optional mulligan bonus draws and later turns change access. Conversely, direct resources can be unplayable because the wrong Pokémon starts, item/attack restrictions apply, the attacker is Knocked Out, or the requisite Energy and Stage 1 cannot be legally sequenced.

## Serious remaining counterexamples

1. **Actual start asymmetry:** going first, Dwebble cannot Ascend before the opponent's possible going-second Volt Cyclone for 140; an exposed 70-HP Dwebble can be Knocked Out before it evolves. Benched backup Dwebble, evolution timing and all opponent responses require genuine source-dealt testing.
2. **Energy and Stadium contention:** Double Colorless enables Grass + two Colorless with two attached cards but is reduced to one Colorless by our own Temple of Sinnoh. Wondrous Labyrinth Prism Star in each published Iron Thorns 60 may also increase required attack costs, and Stadium replacement matters.
3. **Opponent control:** the exact Iron Thorns lists carry Energy removal, hand disruption and alternative Stadiums. Rank 6/29 include Team Rocket's Handiwork, while rank 24 includes Bellelba & Brycen-Man. Winning by deck-out or denying the six successful attacks remains possible.
4. **Field transfer:** nine published Regidrago VSTAR lists can attack through Crustle's ex-only immunity; four Absol/Garbodor lists contain an Ability-denial plan that can remove Crustle's protection. Printed non-Rule-Box attackers, statuses, Ability locks and counter placement elsewhere in the field remain additional risks. Rank 1/30 include Mimikyu GRI 58 Copycat, which can reproduce a prior non-GX Ghost Eye attack under the required conditions. Mimikyu PAL's Safeguard does not stop copied placement of counters.

## Concrete next validation

First obtain one genuine **source-original** rank-6 and rank-24/29 pair of actual-start fixtures with the fixed 60 and a common, information-set-safe actor decision policy. Confirm a genuinely owner-paid first-turn Ascension and native Stage1 evolution, subsequent correct protected ex damage, first legal Superb Scissors, both starting orders, and the adversary's Stadium/Energy-mill responses. Preserve unsuccessful deals and capped roots. Then compare against rank-11 Garbotoxin, rank-10/12 Regidrago and non-ex/V attackers under the same frozen 60 and policy.

This is a **new target for falsification** and a source-backed explanation of why a simple four-Mimikyu stall shell is insufficient. It does not displace the current candidate decision board. Official paper clock, fully verified Japanese printing legality, pinned Store implementation of Crustle, strong opponent play and complete 32-opponent coverage are unverified. **Global qualification remains 0 competitive games, 29/32 exact opponent 60s, and no demonstrated 99.5% list.**
