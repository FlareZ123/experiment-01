# Haxorus Axe Blast is a direct effect-KO attack against eight exact original Aichi Basic-only 60s

**Agent1 · 28 November 2026.** Target fixed paper Expanded 60: [Apex Lockdown Regidrago VSTAR v1](agent1-apex-lockdown-v1.json), which **already contains** one exact **Haxorus zsv10pt5-70** Dragon donor. This changes the hypothesis from "deny the opponent's Special Energy long enough to win" to "**immediately take Prizes by copying an effect-KO attack**" against Basic-only decks. It is a candidate strategic direction, **not a result of played games and not a final-deck nomination**. Qualified Aichi matchups remain **0/32**; published original lists **29/32**, missing **23,25,28**.

## Exact donor and opponent field

- Haxorus \`zsv10pt5-70\` is a **Stage 2 Dragon Pokémon**. Its **Axe Blast** attack text: **"If your opponent's Active Pokémon is a Basic Pokémon, it is Knocked Out."** There is **no attack damage**. Haxorus's printed [Fighting][Metal][Colorless] attack cost does **not** become the paid cost when \`Regidrago VSTAR SIT136\` uses *Apex Dragon*: the Regidrago must pay its own [Grass][Grass][Fire] and choose the attack from the Dragon in its own discard. The copy action still counts as an attack and ends the turn.
- The unchanged original Aichi 60s contain **92 distinct Pokémon names**; the supplied English card pool verifies the Stage of each in context, including **Basic** Mega Absol ex and Mega Kangaskhan ex versus evolved Mega Lopunny ex and Mega Dragonite ex. A [source-stage classifier](../../../scripts/2026-11/agent1-aichi-basic-only-axe-opportunity.cjs) with [nine counterfactual checks](../../../tests/2026-11/agent1-aichi-basic-only-axe-opportunity.test.cjs) identifies exactly **eight** available ranks where *every source Pokémon is Basic*:

| Rank | Original Aichi archetype | Why Axe Blast is structurally relevant |
|---:|---|---|
| **3** | Snorlax Stall | Includes PAL97 *Mimikyu Safeguard*, which prevents **attack damage**, not this KO effect; paid Regidrago must first escape a potentially trapped Active |
| **6** | Iron Thorns ex | Four **Basic** Iron Thorns ex, 230 HP/2 Prizes; instant KO can bypass slower 100/140-damage Chaos/Echo attacks |
| **7** | Snorlax Stall | All Basics including PAL97 Safeguard Mimikyu; Wobbuffet active and Snorlax trapping can make funding/promotion difficult |
| **19** | Raging Bolt | All printed Pokémon are Basic, including ADP TAG TEAM GX; exact target Prize award still follows its Rule Box |
| **24** | Iron Thorns ex | Four Basic Iron Thorns ex; source Handheld Fan/Enhanced Hammer/Plumeria remains relevant before next attack |
| **26** | Meloetta Donk | All Basic Pokémon; the opponent's potential first-turn donk/Prize tempo remains a separate risk |
| **29** | Iron Thorns ex | Four Basic Iron Thorns ex; same direct-KO advantage but source Faba/Crushing Hammer can still break later Apex |
| **30** | Lillie's Clefairy | All Basic; precise source printing and protection/attachment state still matter |

The source-classification result is **8/29 available lists**, i.e. **27.6% of authenticated opposing inventories**, not 27.6% games won, and **8/32** of the full field are presently confirmed all-Basic. Three missing original inventories may or may not qualify; do not impute them.

## Important counterplay semantics: effect KO, not attack damage

**Handheld Fan TWM150** triggers if its Active holder is **damaged by an attack**, even if Knocked Out. **Spiky Energy JTG159** triggers when its attached Active is **damaged by an attack**. When *Axe Blast* KOs a Basic, it does **not deal damage**; absent a separate damage event, neither reactive damage-trigger condition is satisfied. The original Iron Thorns ranks carry Handheld Fan **1/2/1** (ranks 6/24/29) and Spiky Energy **1/0/1**, so this distinction is **material**. A damaging alternative such as *Chaos Wheel* or *Dominating Echo* can activate these triggers.

Likewise **Mimikyu PAL97 Safeguard** (source rank 3/7) prevents *damage* from opponent Pokémon ex and V; its text does not prevent a direct Knock Out by attack **effect**. This does **not** override separate "prevent all effects of attacks" protection, attack prohibition, Retreat trap, field lock, source Tool effects, or any other rule. The distinction follows the supplied Advanced Player's Rulebook's separate treatment of damage calculation, C-16 damage prevention, C-17 effect prevention, and Knock Out process.

**Axe Blast vs previously promoted lock story:** all-Special ranks 6/24/29 are only **three** opponents, and the old *Megaton+Chaos/Echo* plan is vulnerable to Faba, Plumeria, Enhanced Hammer, Megaton and other legal Resource removal even while Special attachment from hand is forbidden. See [source-locked counterplay](agent1-apex-lock-counterplay-screen-20261128.md) and [constructed replies](agent1-apex-iron-thorns-resource-denial-reply-20261128.md). A single paid Axe Blast on Iron Thorns ex **takes two Prizes immediately** without needing prior Megaton, and does not trigger the Fan/Spiky attack-damage conditions. However its second attack is not guaranteed: opponent can discard our Double Dragon or trap us before our next attack. The attacker is a **2-Prize VSTAR** and is exposed to opponent attacks/ability lock.

## Causal setup follow-up (not win-rate)

Our existing restricted two-own-turn proxy has a specific \`goal:"basic-ko"\`, tracking whether (by own turn 2) a paid Active Regidrago VSTAR has Haxorus in own discard. This is a **necessary opportunity**, not sufficient game competence. First seed-287115 screen of seven 60-card variants × clean/rulebox/t2-item/t2-dual × starting orientation, 2,500 trials per cell, produced:

| Own-T2 funded Apex + Haxorus donor | Unmodified Apex v1 | 2× Haxorus / −1 Field Blower |
|---|---:|---:|
| clean / going first | **931/2500** | **1104/2500** |
| clean / going second | **1278/2500** | **1451/2500** |
| rulebox-Ability suppression / going first | **419/2500** | **503/2500** |
| rulebox-Ability suppression / going second | **715/2500** | **852/2500** |
| hypothetical T2 Item+Supporter lock / going first | **285/2500** | **375/2500** |
| hypothetical T2 Item+Supporter lock / going second | **541/2500** | **714/2500** |

The alt gives up **Field Blower**, which is genuinely relevant against the four source Garbotoxin ranks and possibly other Tools. An extra Haxorus is redundant after the donor is already in discard and can also consume discard-connector capacity otherwise needed for another attack. No assertion that the changed 60 performs better in games is justified. A holdout with independent seed and competing donor objectives is next.

## Highest-value experimental action

For each of the **eight exact Basic-only opponents**, build **source-authenticated legal native state** with different Active targets, effects, paid attacker, discard Haxorus, and opponent response. Enforce *Axe Blast* effect-KO and Fan/Spiky non-trigger with a real native Store continuation, two physical seats, and opponent policy able to counter DDE on later turns. Explicitly compare with real *Echo/Chaos*, *Phantom Dive* (requires two attacks against 230HP Thorns) and any viable *Pernicious Poison* checkup KO (160 poison counters). The successful single KO does not imply an automatic win.

The stage classifier passed nine V8/CommonJS test groups against the **29 original exact JSON 60s**, not Node/native/CI. No stage-A/V3/frozen candidate or authorized game was touched.
