# Deoxys repeat-Drain terminal: remove needless Ranger and retreat contention

**Agent 15 | 27 November 2026 | conditional combat-state solution; no native competitive game or win-rate evidence.**

## Decision

In the existing [three-attack Eon relay](agent15-eon-relay-20261127.md), the A3 policy was too complicated. After A1 Latias ex Eon Blade and A2 Deoxys VMAX Max Drain take four Prizes from two Regidrago VSTAR attackers, a funded and surviving Deoxys VMAX can usually **repeat Max Drain** on a third fresh Dragon VSTAR for the final two Prizes. The prior instruction to force a Pokémon Ranger, Float Stone or paid retreat in response to Covert Flight was **incorrect as a necessity**. Covert Flight's immunity is against attacks by **Basic Pokémon**; Deoxys is VMAX and its Max Drain has no next-turn cooldown.

This changes the real policy preference: check the already-active attack's lethal damage and survivability **before** invoking a multi-card alternate attacker/recovery chain. Both Shadow Rider candidate lists keep their existing card counts. No new deck slot, GX action or added Supporter is needed.

## Exact conditional sequence

The candidate has a live Dimension Valley, Clefairy's Fairy Zone, Skyliner, Protective DNA from its in-play Deoxys VMAX, Latias ex Active with two Psychic attached, and a healthy Deoxys VMAX Benched. One Shadow Rider VMAX on Bench can use Underworld Door. The candidate also holds two Psychic for A2 and has not used that turn's manual attachment. Three separate opposing 280-HP Regidrago VSTAR attackers can arrive Active in succession, with attack payloads accessible, and no source bench/gust/lock interference beyond the specified replies.

1. **A1:** Latias Eon Blade (200 × Dragon Weakness =400) KOs VSTAR#1 for two Prizes; Eon's next-turn restriction is now on Latias.
2. **Source 1:** Second VSTAR uses Apex Dragon to copy Noivern ex's Covert Flight, doing 70 damage, or 90 with Muscle Band. Protective DNA subtracts30 from the VSTAR's attack; healthy Latias survives 60 or 40. Covert protection prevents only Basic Pokémon's attack damage to its user on the next turn.
3. **A2:** Underworld Door attaches one Psychic from hand to **Benched Deoxys**; the normal manual attachment adds the second Psychic to it. Under Dimension Valley, Max Drain's PCC cost is reduced to PC and is payable. Latias (a Basic) uses a legal zero-retreat move through Skyliner; promoting Deoxys also removes Latias's attack restriction by moving it to Bench. Max Drain does 160 × Psychic Weakness =320 and KOs VSTAR#2 for two more Prizes.
4. **Source 2:** The third VSTAR's attack is chosen; see response matrix. **A3:** If Deoxys still lives and the target remains a fresh 280-HP Dragon VSTAR without reduction, attack with **Max Drain again**, 320, taking the last two Prizes. No A3 Supporter, no retreat, no new Energy.

This is a complete *conditional three-KO construction* but not a claim that all its events occur in one naturally played game or that a competent Regidrago policy hands over three VSTAR knockouts.

## Adversarial second reply (with Muscle Band and Protective DNA)

| Source second reply | Deoxys damage | Is Deoxys alive? | Candidate A3 if other conditions held |
|---|---:|---|---|
| Covert Flight | 60 | Yes, 270 HP | Repeat Drain 320; no Ranger needed |
| Phantom Dive | 190 + six Bench damage counters | Yes, 140 HP | Repeat Drain 320 if Clefairy survives |
| Trifrost | 100 to Active, 80 to each chosen Benched target | Yes, 230 HP | Repeat Drain 320 if Clefairy survives |
| Ryuno Glide | 320 | Yes, 10 HP | Repeat Drain 320 if no other damage |
| Rolling Iron | 190, plus 80 attack-damage reduction on Regidrago | Yes, 140 HP | **Ranger** can remove 80 reduction; then repeat Drain 320 |
| Timeless-GX then Phantom Dive | 140 +190 =330 | No, exactly KO | Only if source has at most two previously taken Prizes, promote the funded, unrestricted Latias and finish with Eon 400; otherwise source reaches six Prizes first |

The source's Band adds 20 to attack damage to the **Active Pokémon**, not to Phantom's damage counters or Trifrost damage to Benched Pokémon. The DNA reduction is for actual damage from VSTAR attackers, not effects placing counters. Max Drain's heal30 cannot protect Deoxys from two opponent attacks if it does not have a candidate attack turn in between. Multiple simultaneous KOs, pre-existing damage and source extra actions can destroy the stated lines.

**New failure gates:** (i) missing Valley means two Psychic don't pay Deoxys's printed PCC cost; (ii) Fairy Zone not live means 160, not lethal; (iii) no Door or fewer than two held Psychic prevents the specified A2 funding; (iv) Skyliner unavailable blocks the stipulated free Latias retreat; (v) a damaged or Bench-KO'd Clefairy removes weakness; (vi) Rolling Iron remains live without Ranger so Drain hits only240; (vii) Timeless+Phantom KOs Deoxys and source reaches its sixth Prize before the final Eon; (viii) opponent may gust or lock or remove a needed Stadium or use other attacks. The final Regidrago may also be no longer a fresh VSTAR and the line is no longer identical.

## Executed limited state regression

The [reproducible JS checker](../../../scripts/2026-11/agent15-eon-drain-repeat.cjs) and its [tests](../../../tests/2026-11/agent15-eon-drain-repeat.test.cjs) were executed locally with Node 22. Branch checks succeeded for Covert, Phantom, Trifrost, Ryuno, Rolling (with Ranger), and conditional Timeless+Phantom, and rejected all specified setup/health/reduction/Prize failures. Every successful branch takes six modeled Prizes; source takes three on the Timeless branch.

The checker **is deliberately not Twinleaf or an end-to-end Pokémon game**. It stipulates each source attack, three available Regidrago VSTAR targets, own starting board, attached and held Energy, Access to Supporters, four-Prize transition, source Bench choices, and no unmodeled actions. It tracks own and source Prizes, HP, Energy and core attack choice. This yields falsifiable tactical preconditions, not a frequency, player-policy result or strength estimate.

## Practical integration and comparison

A strong candidate worker should, after A2 Drain, first test whether the **currently active Deoxys** can take two Prizes with a repeat Drain, including current Energy, damage-reduction effects, Fairy Zone and expected immediate game termination. If yes, **do not consume** scarce Pokémon Ranger, Acerola, VS Seeker, Float Stone or extra retreat Energy. If no, compare the other Eon, Guzma/VS reset, and Ranger options under the actual Supporter slot, Tool slot, retreat and opposing immunity. The [manual-first Latias guard](agent15-latias-manual-attachment-guard-20261127.md) and [Guzma double-bounce](agent15-guzma-vs-seeker-eon-six-prize-relay-20261127.md) are additional conditional policy branches, not additive unconditional successes.

This fixes an overvaluation of a flashy connector chain: **a second existing Max Drain dominates the unnecessary A3 Ranger→Latias path on Covert**, conditional on the board. The former [relay report](agent15-eon-relay-20261127.md) was corrected in place, retaining historical constructed alternate-pivot cases.

**Status:** No fixed 60 nominated, no game authorized/played, no V3/Stage-A/CI/engine change, 29 authenticated Aichi source sixties, zero qualified matchups. The 99.5% target remains unproved.
