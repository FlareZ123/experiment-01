# Rank26: five self-KOs, zero Unown in play, one Lightning and first-turn Crisis Punch in one native Store

**Agent47 | 3 November 2026 | positive conditional native mechanical composition; zero qualified games**

## Result

A source-conserved prepared original **Aichi rank26 Meloetta ex 60** against the published original **rank6 Iron Thorns ex 60** completes the entire proposed **zero-Unown-in-play, one-Lightning** first-turn win line in **one continuing genuine pinned Twinleaf Store**, in both source physical seats.

[Manual compiled CI 41602865175](https://github.com/FlareZ123/experiment-01/actions/runs/41602865175) **passed** the new native run step in both seats and artifact upload, head `0832c184071fd4d614b0a551ac6115e1b9b8de1f`. Raw JSON archive [agent47-zero-unown-one-lightning-staged-native, artifact 13214817393](https://github.com/FlareZ123/experiment-01/actions/runs/41602865175/artifacts/13214817393), SHA256 `1a8cd3e802243da1a61b37620807e2e12eb84b0fbe41abc70c272898d5275519`. The experiment uses engine pin `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, unchanged vendor, and `simulation/twinleaf/agent47-rank26-zero-unown-one-lightning-native.cjs`.

This is a narrower resource requirement than the two-Lightning, dual-recipient example in [Agent50's zero-Unown paper ledger](agent50-rank26-unownless-crisis-punch-ledger-20261103.md), derived by combining that donor plan with [Agent3's independently proven one-Lightning native Koko and Tool settlement](agent3-rank26-one-lightning-koko-native-both-seats-20261102.md).

## Exact prepared physical setup

Original source physical 60, original rank6 opponent physical 60, each with unique IDs, are constructed from `planAichi(26,{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true})` and the source-conserved rank26 fixture. The source uses its **printed Squawkabilly ex as Active starter**, original Risky Ruins already in play, and exactly four originally owned Benched Pokémon:

| Prepared slot | Original Pokémon | Starting damage |
| --- | --- | ---: |
| Bench 0 | Meloetta ex | 20 |
| Bench 1 | Tapu Koko Prism Star | 20 |
| Bench 2 | Exeggcute A | 20 |
| Bench 3 | Exeggcute B | 20 |
| Bench 4 | Empty | 0 |

Original Unown cards are still physically accounted for in the registered source 60; none enters play in this line. The initial Bench arrangement, its Risky Ruins damage, and the source's three held original Damage Pumps are **synthetically prepared**. The exact seven-card opening, Bench-entry chronology, hand acquisition, deck-search effects and private Prize reachability are **not simulated**. This is explicitly a conditional, source-conserved state witness.

The defender has sole Active original Iron Thorns ex, **no Benched Pokémon**, and its original 60 remains physically conserved.

## Actual continuing native action and paper-resource ledger

1. **Pump 1**: real original `PlayCardAction(Damage Pump)` and its corrected single-donor `MoveDamagePrompt` move two counters from 20-damaged Benched Meloetta to the two 20-damaged Eggs. Both 30-HP Eggs are Knocked Out; a real native opponent `ChoosePrizePrompt` takes two Prizes, opponent **6→4**.
2. **Propagation, round 1**: both physical Eggs are recovered from the discard using two original `UseAbilityAction(Propagation)` roots, then re-Benched from the hand using real `PlayCardAction` roots. Risky Ruins' native card effect provides each entering Egg two damage counters.
3. **Pump 2**: second physical Damage Pump transfers two counters from 20-damaged Benched Tapu Koko to the two re-Benched Eggs. Both faint, and native opponent prizes advance **4→2**.
4. **Propagation, round 2**: recover and re-Bench the same two physical Eggs, each acquiring 20 actual native Risky Ruins damage again.
5. **Pump 3**: final Damage Pump moves **one counter from Egg B to Egg A**, reaching 30 damage on Egg A and leaving Egg B with only 10 damage. Egg A is Knocked Out and native opponent prizes advance **2→1**. The source stays alive with Squawkabilly Active, Meloetta and Koko Benched, and surviving Egg B.
6. **Energy and lock**: the source's unique original Cologne, DCE, Tool and Escape Rope are *repositioned* from physical source reserves to hand and **one**, and only one, original Lightning to discard. This preserves all source identities, but it does not certify legal first-turn access to those zones. Real `PlayCardAction(Canceling Cologne)` clears the opposing Active's Ability lock. Native Koko's original `AttachEnergyPrompt` accepts **one** original Basic Lightning transferred to Benched Meloetta, and native Koko moves to Lost Zone.
7. **Finisher**: real original DCE manual attachment and original TM: Crisis Punch Tool attachment to Benched Meloetta; original Escape Rope moves Meloetta Active; native `AttackAction('Crisis Punch')` during global turn **1**. After resolving native animation/Prize prompts, original 280 damage Knocks Out the sole 230-HP Iron Thorns ex. Native `GamePhase.FINISHED` and original source seat as winner are asserted.

The entire source physical ID multiset, all **60 unique copies**, is rechecked after the five self-KOs, after resource repositioning, and after the terminal. The defender's 60 physical IDs are checked both at setup and after the terminal. The source's third Pump was paid by a genuine separate Egg-to-Egg movement, **no Unown donor**, with a single prior Koko attachment used only for Meloetta's three-Colorless attack requirement. The research-side `installDamagePumpSingleSourceHook` enforces printed one-source movement. No upstream Twinleaf modification occurs.

## Validation and boundaries

| Question | Result |
| --- | --- |
| All three Pump effects, five own KOs and opponent 2+2+1 native Prizes in one source turn | **Passed, both seats** |
| Four original source Bench roles, no Unown in play and no sixth self-KO | **Passed, both seats** |
| One Koko Lightning recipient, paid original DCE and attached original TM | **Passed, both seats** |
| First-turn native attack, opponent sole Active KO, actual native winner | **Passed, both seats** |
| Complete unchanged original source and defender 60-card physical identity census | **Passed, both seats** |
| Actually drawing and obtaining all required opening resources on turn one | **Not tested; synthetic prepared state** |
| Opponent decision competence, real early owner selections, clock, field win rate | **Not tested; zero qualified games** |

The one-Lightning Koko partial use is supported independently by the [Agent3 official ruling and actual one-Lightning pinned native test](agent3-rank26-one-lightning-koko-native-both-seats-20261102.md). This result additionally composes it with the zero-Unown five-KO line in one uninterrupted Store. It establishes a **conditional mechanical possibility**. It does not estimate how often that condition arises in randomized games, and it does not show a 99.5% match win rate.

## Research implication

A future natural-source policy should model **one accessible Lightning** as enough for the Koko-to-Meloetta energy channel, keep the second Lightning available for alternate roles, and recognize Egg B as a possible **fifth-KO donor** after Meloetta and Koko each donated two counters. This requires both Eggs to become re-Benchable between Pumps and viable owner-held Items, Stadium timing and Tool access. Never infer that an owner merely holding Battle Compressor or discovering a card in deck can execute this complete line. The decisive next result is a preregistered original randomized source-first policy with physical source action, prompt-payment and acquisition receipts, including every failed deal.

**Field qualification remains 29/32 known originals, zero competitively qualified matches, no selected fixed 60 and no demonstrated 99.5%.**
