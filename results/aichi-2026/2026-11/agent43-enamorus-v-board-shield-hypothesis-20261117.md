# Enamorus V as a non-Tool board-wide Ability shield for Shadow Rider

**Agent 43 · 17 November 2026 · Hypothesis, not a tested interaction**

## Why this is worth testing

The current Hood Shield candidate uses two Stealthy Hoods to protect individual Pokémon from effects of the opponent's Pokémon Abilities. The Expanded-legal Enamorus V (Lost Origin 82; repository card ID swsh11-82) has a potentially broader protection ability that is not itself a Pokémon Tool:

> Prevent all effects of your opponent's Pokémon's Abilities done to each of your Pokémon that has any Psychic Energy attached to it, except any Enamorus V.

This is a potentially useful fit for Shadow Rider because:

- Shadow Rider Calyrex VMAX is Psychic type, and Underworld Door naturally attaches Psychic Energy to Benched Psychic Pokémon.
- The current candidate has 11 Psychic Energy, 4 Fog Crystal and 4 Mysterious Treasure. Fog Crystal searches a Basic Psychic Pokémon; Mysterious Treasure searches a Psychic or Dragon Pokémon. Enamorus V is a Basic Psychic Pokémon and can be reached by existing search cards.
The fixed list currently has 18 Pokémon and 14 Basics. Adding Enamorus while cutting a Trainer/Energy would make 19 Pokémon and 15 Basics; replacing a Basic Pokémon would keep 18/14; replacing a non-Basic Pokémon would keep 18 Pokémon but raise the Basic count to 15. The displaced slot and revised mulligan distribution must be recorded in any variant.
- Guardian of Love is not a Tool and is not conditional on Enamorus V being Active. If it functions as written, it can protect every one of the candidate's Pokémon that has Psychic Energy attached, rather than only the Pokémon carrying an individual Stealthy Hood.
- Enamorus V itself is expressly excluded from its own protection. A Stealthy Hood attached to Enamorus V may therefore be the relevant way to keep the shield active against an opposing global Ability-lock effect.

This suggests a different allocation of the existing two-Hood package: one Hood on Enamorus V to protect the board-wide shield, with the second Hood retained as a reserve. It is a structural hypothesis, not evidence that the candidate should add Enamorus V.
Do not assume Enamorus must always carry a Hood. The anchor Hood is relevant when the opponent's Ability effect would suppress or directly affect Enamorus itself (notably Initialization / Garbotoxin); against an Ability effect aimed only at another Psychic-Energy-attached Pokémon, Guardian of Love may work from an unhooded Enamorus. Enamorus is excluded from its own protection, so it remains a valid target for effects such as Dusknoir's Cursed Blast. The test matrix separates these states.

## Field relevance

Agent17's exact field-pressure inventory identifies ranks **6, 24 and 29** as Iron Thorns lists with Initialization, and ranks **8 and 22** as Absol/Garbodor lists. Those are direct reasons to test this architecture: the candidate's main acceleration is Shadow Rider's Underworld Door, and Guardian of Love may protect Psychic-Energy-attached Shadow Riders from the opponent's Ability suppression. This is distinct from the direct Tool-removal threat: Enamorus does not stop Field Blower, Megaton Blower or Faba.

For Iron Thorns specifically, Enamorus V is itself a Rule Box Pokémon and would be subject to Initialization. A Hood on Enamorus is therefore the proposed anchor. Agent17's evidence reconciliation now records a successful pinned native Store/effect test of Stealthy Hood on Shadow Rider VMAX under Active Iron Thorns (workflow run 38829270890, pinned Twinleaf revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05), plus the official Mega Clefable ex Q&A for the identical prevention clause. That existing test validates the Hood/Initialization mechanism on Shadow Rider, not the Enamorus architecture. The new, untested extension is whether Guardian of Love prevents Initialization from suppressing the other Psychic-Energy-attached Pokémon while Enamorus itself is protected by Hood. Do not rerun or duplicate the existing Hood test; test the Enamorus layer separately.
 
Rank 31 adds a second concrete target: its Dusknoir Chimecho list contains three Dusknoir and one Field Blower. The official Japanese [Dusknoir Cursed Blast Q&A](https://www.pokemon-card.com/rules/faq/search.php?sc_group_id=917) rules that Cursed Blast may select a Pokémon protected by Mega Clefable ex's Luminous Wing, but places no damage counters on that Pokémon; Dusknoir is still Knocked Out and processing ends. This is strong analogous support for Guardian of Love preventing Cursed Blast damage counters on a Shadow Rider with Psychic Energy attached, but no direct Enamorus/Cursed Blast ruling was found. The board-wide shield could therefore be relevant to rank31 as well as ranks 6/24/29 and 8/22.

## Critical interaction to resolve

The repository card text for Garbodor (Breakpoint 57; xy9-57) says that while it has a Pokémon Tool attached, each Pokémon in play, in each player's hand and in each player's discard pile has no Abilities except Garbotoxin.

That creates a precise interaction question:

1. Enamorus V is explicitly excluded from Guardian of Love's own protection.
2. Garbotoxin's text includes Enamorus V among the Pokémon whose Abilities are suppressed.
3. Stealthy Hood prevents effects of an opponent's Pokémon's Abilities done to the Pokémon it is attached to.
4. If a Hood on Enamorus prevents Garbotoxin from suppressing Enamorus, does Guardian of Love then prevent Garbotoxin's suppression effect on the other of the candidate's Pokémon that have Psychic Energy attached?

The official Pokémon Asia [Enamorus V Q&A](https://asia.pokemon-card.com/ph/rules/search/?keyword=Enamorus) confirms the general prevention scope: it rules that Hatterene VMAX's Ability can be activated but its effect on a protected Pokémon is prevented, and that Radiant Charjabug's Ability effect is prevented when Psychic Energy is attached to a protected Pokémon. The Q&A does **not** address Garbotoxin specifically.
The official Japanese [Stealthy Hood Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E9%9A%A0%E5%AF%86%E3%83%95%E3%83%BC%E3%83%89) separately confirms that Quick Shooter cannot place damage counters on a Hooded Pokémon. Its Garbotoxin example also shows the boundary: a Hood attached to your Garbodor does not protect an opposing Slaking from Garbotoxin. The proposed architecture is different—the Hood protects Enamorus itself, and Enamorus's own Guardian of Love would protect the other Psychic-Energy-attached Pokémon. No direct official Hood-on-Enamorus / Garbotoxin ruling was found.


### Rules-based resolution: strong compositional support, not a direct Enamorus FAQ

The official Japanese Pokémon Card Game Q&A for **θ Stop versus Garbotoxin** asks whether Golurk's Double Type Ability works while an opposing Garbodor's Garbotoxin is active. The official answer is yes: θ Stop prevents Golurk from receiving Garbotoxin's effect. See the [official θ Stop Q&A search](https://www.pokemon-card.com/rules/faq/search.php?freeword=%CE%B8%E3%82%B9%E3%83%88%E3%83%83%E3%83%97&page=3&regulation=all). This establishes an important paper-rules precedent: Garbotoxin's global Ability-suppression effect can be prevented on an individual Pokémon by a qualifying prevention effect.

The [official Stealthy Hood card text](https://www.pokemon-card.com/card-search/details.php/card/36191/regu/all) says the attached Pokémon does not receive effects of the opponent's Pokémon's Abilities. This is the same relevant prevention class as the θ Stop precedent. Stealthy Hood is a Pokémon Tool effect, not a Pokémon Ability, so Garbotoxin / Initialization does not itself switch off the Hood effect. The proposed two-layer composition is therefore strongly supported by printed text and the official analogy:

1. Stealthy Hood prevents Garbotoxin / Initialization from affecting Enamorus V itself, preserving Guardian of Love.
2. Guardian of Love then prevents those opposing Ability effects from affecting each other one of your Pokémon with any Psychic Energy attached. Its exclusion of Enamorus V means the anchor still needs Hood; **Enamorus itself does not need Psychic Energy**, while every other protected Pokémon does.

This is also a strong paper-text inference for Iron Thorns ex's Initialization: Hood protects the Enamorus Rule Box Pokémon, and Guardian protects the other Psychic-Energy-attached Rule Box Pokémon. The existing Hood / Initialization native test on Shadow Rider validates only the first prevention mechanism on Shadow Rider; it does not validate this Enamorus composition.

**Evidence-status update:** classify Hooded Enamorus preserving Guardian through Garbotoxin / Initialization, and Guardian protecting other energized Pokémon from those locks, as a **strongly supported paper-rules inference**, not as an unresolved interaction from first principles. No direct Enamorus-versus-Garbotoxin official Q&A was located, so do not describe this as a direct ruling. Keep the pinned Twinleaf test behind the canonical V3 first-trace stopline. The remaining novel dynamic uncertainty is whether a newly energized VMAX regains Underworld Door soon enough for the same-turn seed-and-spread cascade.

The [official Enamorus V Q&A](https://asia.pokemon-card.com/ph/rules/search/?keyword=Enamorus) remains useful corroboration for Guardian of Love's broad prevention scope, but does not mention Garbotoxin specifically.

## Boundaries and costs

- Guardian of Love protects only against effects of the opponent's Pokémon's Abilities. It does not prevent Item, Supporter, Stadium, attack or Tool effects.
- Each protected Pokémon must actually have Psychic Energy attached. A Shadow Rider VMAX without Psychic Energy is not covered.
- Spreading Psychic Energy across every Pokémon you want protected competes with attack setup and hand resources. Underworld Door can supply Psychic Energy to Benched Psychic Pokémon, but the policy must measure whether the energy distribution needed for protection delays attacks or leaves a key target uncovered.
- Enamorus V itself is excluded. It may need a Stealthy Hood to survive a global Ability lock such as Garbotoxin.
- Stadium effects such as Silent Lab or Path to the Peak are not Pokémon Abilities and are not stopped by Guardian of Love or Stealthy Hood. Enamorus V itself is vulnerable to those Stadiums: it is both a Basic Pokémon and a Rule Box Pokémon V, so Silent Lab or Path to the Peak can shut off its Ability.
- Enamorus V is a 210-HP, two-Prize Basic Pokémon V with a two-Energy retreat cost. It adds a gust/KO target and a deck slot; the candidate's existing 2-Prize map must be reassessed.
- Guardian of Love works from the Bench, but Enamorus consumes one Bench slot. The current 60 has only Sky Field ×1 and Dimension Valley ×1; Agent17's field inventory counts Stadium-removal cards in 20/29 exact lists. If Sky Field is removed, the Bench limit returns to five and the player must discard excess Benched Pokémon, potentially forcing a choice between Enamorus, Shadow Rider engine pieces and other support. Measure the actual Bench plan with and without Sky Field rather than assuming the extra slot is free.
- The variant's displaced card matters to setup math: replacing a non-Basic card raises the candidate from 14 to 15 Basics; replacing a Basic keeps it at 14. Under a uniform seven-card opening, the exact probability of at least one Basic rises from 86.14% at 14 Basics to 88.25% at 15 Basics (+2.11 percentage points), using 1 − C(60−B,7)/C(60,7). This is only the opening-Basic component, not a net consistency result: the displaced trainer/VMAX, Prize placement, searcher competition and mulligan-draw effects still need paired evaluation.
- **Restricted Enamorus direct-searcher baseline (Prize-aware; not a ceiling):** with one Enamorus and only the eight direct searchers (Fog Crystal ×4 + Mysterious Treasure ×4), exact sequential enumeration of a seven-card opening, six Prizes, and zero / one / two natural draws gives **63.4162% / 67.9846% / 71.8415%** access without conditioning on a playable opening. The access event is Enamorus in the seen cards, or Enamorus still in the deck plus at least one direct searcher in the seen cards. The opening-seven figure matches the earlier calculation, but the previous **68.51% / 72.71%** draw figures were overstated: the closed-form draw terms incorrectly assumed all eight searchers remained among the 47 post-Prize cards, ignoring that one or more searchers can themselves be Prized. The exact enumeration accounts for Prize placement of both Enamorus and every searcher. Conditioning on a valid opening with Enamorus included among the Basics gives **62.7313% / 67.4476% / 71.4294%** for 15 total Basics (Enamorus added by cutting a non-Basic), or **62.7157% / 67.4410% / 71.4304%** for 14 total Basics (Enamorus replaces a Basic). These are access figures for the isolated eight-searcher route, not a true ceiling or a setup probability. The candidate also contains Hisuian Heavy Ball ×1 (Prized Basic recovery), Forest Seal Stone ×1 (conditional any-card VSTAR search), Arven ×1 (Tool + Item search), and Tapu Lele-GX ×1 (possible Wonder Tag route to Arven); those routes are excluded. The model also excludes opponent mulligan bonuses, Item / Supporter lock, Mysterious Treasure discard costs, searcher competition, VSTAR / board setup, and the separate need to find and attach Stealthy Hood. The route-specific figures should not be used as an upper bound on Enamorus access or as the probability of establishing the anchor.
- **Joint Enamorus + Hood anchor access (restricted direct-route enumeration):** I enumerated a hypothetical 60 with one Enamorus, two Hoods, eight direct searchers, one Arven, and the existing fourteen other Basics (15 total Basics, assuming Enamorus replaces a non-Basic Trainer). After a valid opening seven, six Prizes are dealt, then one natural draw is included by the candidate's turn two when going first or two when going second. Access requires (a) Enamorus in the seen cards, or Enamorus still in deck plus a direct searcher seen; and (b) a Hood in the seen cards, or a Hood still in deck plus Arven seen. The exact conditional joint-access results are **21.7762% going first** and **25.9664% going second**; the valid-opening rate is 88.2499%. If Enamorus instead replaces a Basic (14 total Basics), the corresponding conditional joint access is **21.6962% / 25.8880%**, with an 86.1409% valid-opening rate. The extra Basic therefore improves the opening-Basic component but barely changes this restricted joint-access percentage. These are route-specific access calculations, **not anchor-establishment probabilities or strict bounds**: they exclude Heavy Ball, Forest Seal Stone, Tapu Lele-GX → Arven, opponent mulligan bonuses, and all game-state setup; they assume direct searchers are playable, Mysterious Treasure's discard cost can be paid, Arven is usable, and no Item / Supporter lock or resource competition prevents the line. The omitted search routes and optimistic use assumptions pull in opposite directions. Reproduction (standard-library Python; categories are Enamorus, Hood, direct searcher, Arven, other Basic, and all remaining cards):
  
  ```python
  from math import comb

  def bounded(total, caps, prefix=()):
      if len(caps) == 1:
          if 0 <= total <= caps[0]:
              yield prefix + (total,)
          return
      for x in range(min(total, caps[0]) + 1):
          yield from bounded(total - x, caps[1:], prefix + (x,))

  def joint_access(other_basics, draws):
      counts = (1, 2, 8, 1, other_basics,
                60 - 1 - 2 - 8 - 1 - other_basics)
      valid = success = 0
      for hand in bounded(7, counts):
          if hand[0] + hand[4] == 0:
              continue
          hw = 1
          for n, k in zip(counts, hand):
              hw *= comb(n, k)
          valid += hw
          after_hand = tuple(n-k for n, k in zip(counts, hand))
          for prizes in bounded(6, after_hand):
              pw = 1
              for n, k in zip(after_hand, prizes):
                  pw *= comb(n, k)
              if not pw:
                  continue
              after_prizes = tuple(n-k for n, k in zip(after_hand, prizes))
              for drawn in bounded(draws, after_prizes):
                  dw = 1
                  for n, k in zip(after_prizes, drawn):
                      dw *= comb(n, k)
                  seen = tuple(h+d for h, d in zip(hand, drawn))
                  deck = tuple(n-h-p-d for n, h, p, d
                               in zip(counts, hand, prizes, drawn))
                  has_enamorus = (seen[0] > 0 or
                                  (deck[0] > 0 and seen[2] > 0))
                  has_hood = (seen[1] > 0 or
                              (deck[1] > 0 and seen[3] > 0))
                  if has_enamorus and has_hood:
                      success += hw * pw * dw
      denominator = valid * comb(53, 6) * comb(47, draws)
      return success / denominator, valid / comb(60, 7)

  for basics_other in (14, 13):
      for draws in (1, 2):
          print(basics_other, draws, joint_access(basics_other, draws))
  ```

  Expected output: `14 1 (0.2177619771, 0.8824992053)`, `14 2 (0.2596642905, 0.8824992053)`, `13 1 (0.2169622025, 0.8614093191)`, `13 2 (0.2588797667, 0.8614093191)`.
- **Joint access with the candidate's Hisuian Heavy Ball included:** extending the same exact enumeration with Heavy Ball ×1 adds the route where Enamorus is Prized and Heavy Ball is either already seen or can be fetched by Arven; when both Hood and Heavy Ball remain in deck, Arven can fetch the Pokémon Tool and Item together. This raises the restricted joint-access result to **23.1853% going first / 27.5942% going second** for 15 total Basics, or **23.0929% / 27.5024%** for 14 total Basics. Relative to the eight-searcher + Arven baseline, Heavy Ball contributes only about **1.41 / 1.63 percentage points** in this model. This extension still excludes Forest Seal Stone and Tapu Lele-GX → Arven, and retains the same no-lock, no-mulligan-bonus, playable-Item / payable-discard and no-resource-competition assumptions. It is still a restricted route, not a bound or anchor-establishment probability.
- If Enamorus V is Knocked Out, the board-wide protection disappears. Night Stretcher can recover a Pokémon, but it does not recover a discarded Hood.
- The candidate already has Acerola ×1 and VS Seeker ×2. If Enamorus has damage counters, Acerola can return Enamorus and all attached cards (including its Hood) to hand before it is Knocked Out; VS Seeker can later recover Acerola. This preserves the Tool but costs the Supporter turn and temporarily removes the board-wide shield, so test it as a tempo / resource line rather than assuming it is free.
- Field Blower and Megaton Blower can still remove the Hood attached to Enamorus V. The second Hood is a reserve, not immunity to repeated removal.
- The reserve must be kept out of play to function as redundancy: Field Blower can discard up to two Pokémon Tools and/or Stadiums, so attaching both Hoods at once lets one Field Blower remove both. Tool Jammer on the opponent's Active Pokémon can suppress only the Hood attached to the candidate's Active Pokémon; a Hood on a Benched Pokémon remains effective. This is a board-position constraint, not global suppression. The candidate's Field Blower is a direct answer to Tool Jammer and should not be counted as additional shield redundancy ([Active-only Tool Jammer scope](agent35-tool-jammer-active-only-tool-scope-20261120.md)).
- The fixed 60 also has Guzma ×1. Because Tool Jammer only suppresses Tools attached to the candidate's Active Pokémon while its carrier is Active, Guzma can switch that carrier to the Bench and restore the previously suppressed Active Hood without playing an Item; a Benched Hood was never suppressed. This may remain available under Budew Item lock if Guzma is already in hand; VS Seeker ×2 can recycle Guzma only when Items are playable. It is a conditional Supporter line, not guaranteed redundancy (and it fails under a Supporter lock or if no legal switch is available).
- The card's attack can attach up to two Basic Energy from discard to Benched Pokémon, but that attack is not assumed to be a meaningful substitute for the candidate's current energy engine.

## Energy coverage, candidate targets, and Stadium trade-off (Agent43 + Agent41, 18 November)

The card-text alignment makes the Enamorus hypothesis more attractive than treating Psychic Energy on support Pokémon as a pure diversion from the attacker, but the attack cost and actual board capacity still bound the coverage.

- **Protection target versus Energy-acceleration target:** Guardian of Love protects any of your Pokémon with any Psychic Energy attached, except Enamorus V; it does not require the protected Pokémon itself to be Psychic type. Underworld Door is narrower: it can attach only to a Benched Psychic Pokémon. A non-Psychic Pokémon can therefore be protected if Psychic Energy reaches it through the normal attachment or another suitable effect, but Underworld Door cannot directly seed it.
- **Candidate-specific Fairy Zone value:** Lillie's Clefairy ex in the fixed 60 is Psychic type (sv9-56, resources/cards/en/sv9.json) and is therefore an Underworld Door target. Its Fairy Zone Ability changes the Weakness of each opposing Dragon Pokémon in play to Psychic. This is important to the candidate's Mimikyu Copycat → Apex Dragon → own Dialga-GX Timeless-GX counter-line: preserving Fairy Zone may preserve the Psychic Weakness that makes the copied attack threatening. If Guardian protects an energized Clefairy from Initialization / Garbotoxin, Enamorus may protect both the Shadow Rider engine and this counter-ALS. The interaction remains untested.
- **Candidate Pokémon-type census:** 16 of the fixed 18 Pokémon are Psychic type and can therefore be Underworld Door targets while Benched. The two non-Psychic Pokémon are Dialga-GX (Metal) and Radiant Eternatus (Dragon); Guardian can still protect either if Psychic Energy is attached by the normal attachment or another effect, but Radiant Eternatus's on-play Climactic Gate cannot be rescued if the lock is already active when it is played.
- **Candidate-specific Skyliner value:** the fixed 60's Latias ex (SSP 76; resources/cards/en/sv8.json) is Psychic and has the continuous Ability Skyliner, which gives the player's Basic Pokémon in play no Retreat Cost. It is another Underworld Door target. If Guardian protects an energized Latias ex from an opposing Ability lock, Enamorus may preserve free retreat for Basic support Pokémon as well as Underworld Door and Fairy Zone. Skyliner does **not** give free retreat to Shadow Rider VMAX, which are evolved Pokémon. This is untested.
- **Max Geist damage and the attack-conditioned coverage ceiling:** let E be the number of Psychic Energy attached to all of your Pokémon. Max Geist deals 10 + 30E, regardless of which Pokémon carry that Energy. Energy attached to Enamorus still adds 30 damage even though Enamorus is excluded from Guardian's protection. This candidate has only Basic Psychic Energy. Let m be the number of non-Enamorus Pokémon in play that could be protected, including the Active Shadow Rider attacker. Without Dimension Valley, Max Geist needs 3 Psychic Energy; one qualifies the attacker for Guardian and the other two are attack-payment overhead, so the ideal bound is C_max = min(m, E - 2) for E >= 3. Dimension Valley reduces each Psychic Pokémon's attack cost by one Colorless, so Max Geist needs only 2 Psychic Energy and the bound becomes C_max = min(m, E - 1) for E >= 2. If no Max Geist attack is required that turn, the pure allocation ceiling is min(m, E). These are arithmetic ceilings, not setup probabilities or proof that each target can be reached in time. The ceiling assumes the Active VMAX carries exactly the minimum attack-payment Energy (3 without Dimension Valley, 2 with it); any additional Psychic Energy stacked on the attacker instead of another target lowers distinct-target coverage by the same amount.
- **Stadium trade-off:** Sky Field and Dimension Valley are mutually exclusive. With Enamorus on the Bench, the normal five-Bench limit leaves at most m = 5 non-Enamorus Pokémon in play; Sky Field raises the limit to eight Bench Pokémon and thus at most m = 8. Dimension Valley saves one Energy for Max Geist but retains the five-Bench limit. At full board capacity:

| Total Psychic Energy E | Max Geist damage | Sky Field: maximum protected | Dimension Valley: maximum protected |
|---:|---:|---:|---:|
| 3 | 100 | 1 | 2 |
| 4 | 130 | 2 | 3 |
| 5 | 160 | 3 | 4 |
| 6 | 190 | 4 | 5 |
| 7 | 220 | 5 | 5 |
| 8 | 250 | 6 | 5 |
| 9 | 280 | 7 | 5 |
| 10 | 310 | 8 | 5 |
| 11 | 340 | 8 | 5 |

  If the actual board has five or fewer non-Enamorus Pokémon, Dimension Valley is never worse for this coverage ceiling and can protect one more target when Energy is the binding constraint. Sky Field becomes valuable when the plan genuinely needs more than five non-Enamorus Pokémon in play; it does not reduce Max Geist's cost. Underworld Door still cannot directly seed non-Psychic targets, and a Sky Field board must survive the Stadium-removal / forced-discard line already described above.
- **A five-Bench target board without Sky Field:** Active Shadow Rider Calyrex VMAX; two Benched Shadow Rider VMAX; two Benched Lillie's Clefairy ex; and Hooded Enamorus V. This is six Pokémon total (one Active plus five Bench), so it fits the ordinary five-Bench limit. The three VMAX and two Clefairy are the five non-Enamorus protection targets; all four Benched targets are Psychic and can receive Energy through Underworld Door. Three Psychic Energy on the Active VMAX plus one on each of the four Benched targets gives E = 7, 220 Max Geist damage, and protection for all five targets. The same coverage can coexist with 340 damage at E = 11 by stacking the remaining Energy after each target has one. This is deterministic card-text arithmetic, not evidence that the six-Pokémon board or Energy count is consistently assembled.
- **Ability-lock bootstrap hypothesis:** if Hooded Enamorus keeps Guardian of Love active through Garbotoxin / Initialization while the lock is already in play, a normal Psychic attachment to one Shadow Rider VMAX may make it protected immediately and restore its Underworld Door. That first protected source can seed a second Benched VMAX; once energized, the second may use its own unused Door to seed a third target, and the third VMAX can continue the chain. The first VMAX needs only one Psychic Energy to become Guardian-eligible and use Door; it need not already be attack-ready. Its Max Geist attack cost can be completed separately (two Energy with Dimension Valley, three without). **Attachment accounting matters:** in the three-VMAX boards above, if the normal attachment is spent on the initial Active seed, only three Door activations remain for four Benched targets, so one target remains unseeded until a later turn. If the first VMAX is already energized/protected, three Door activations plus the normal attachment can cover all four Benched targets that turn. A four-VMAX board has a different ceiling (next bullet). Max Geist attack readiness is separate: the Active needs two total Psychic Energy with Dimension Valley or three without it. The crucial dynamic-lifting / same-turn activation sequence is unverified and must not be treated as established. One additional official timing boundary is now sourced: the Japanese Pokémon Card Game Q&A for Garbotoxin says that if a once-per-turn Ability (Blissey's Egg Laying) is used, then Garbotoxin suppresses Abilities, and Garbodor is later removed, Egg Laying still cannot be used again that turn; making the effect stop working does not reset the once-per-turn usage. See the [official Garbotoxin Q&A search](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%80%E3%82%B9%E3%83%88%E3%83%80%E3%82%B9&page=3&regulation=all&regulation_faq_main_item1=all). For the proposed cascade, each Shadow Rider VMAX's Underworld Door is therefore available only if that copy has not already been used earlier in the turn. This ruling does **not** directly answer whether an unused Door can be activated immediately after Guardian of Love restores it. A second official Japanese Pokémon Card Game Q&A provides a complementary restoration precedent: when Alolan Muk's Power of Alchemy removes Wobbuffet's Bide Barricade, the previously suppressed Abilities of non-Basic Pokémon start working again (the remaining Basic-Pokémon suppression still applies). See the [official Wobbuffet / Alolan Muk Q&A search](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%BD%E3%83%BC%E3%83%8A%E3%83%B3%E3%82%B9&page=2&regulation=all&regulation_faq_main=all). Together with the θ Stop / Garbotoxin precedent, this supports the paper-rules inference that an unused Underworld Door should become available when Guardian makes its Pokémon protected from the lock. It is still an analogy, not a direct ruling on Guardian of Love or the exact same-turn attachment → protection → Door sequence; keep that sequence unverified until the pinned native test.
- **Ability timing boundary:** the shield should not be credited with rescuing every Ability in the 60. Tapu Lele-GX's Wonder Tag and Radiant Eternatus's Climactic Gate are on-play triggers; neither Pokémon can receive Energy before that trigger, so a lock that actually suppresses the Ability when the Pokémon is played cannot be undone by attaching Psychic Energy afterward. Iron Thorns ex's Initialization suppresses Pokémon with a Rule Box (except Future Pokémon), not merely Pokémon V and Pokémon ex: it therefore suppresses both Tapu Lele-GX (GX Rule Box) and Radiant Eternatus (Radiant Pokémon Rule Box; see advanced manual D-18). Radiant Eternatus is Dragon, so Underworld Door cannot target it, although Guardian's text could protect it after a Psychic Energy is attached by another means. The shield is more naturally useful for Abilities on Pokémon already in play: Underworld Door, Fairy Zone, Skyliner, and potentially Marshadow UNB 81's activated Bench Ability Resetting Hole. Marshadow is Psychic and can be energized by Underworld Door; Guardian may preserve Resetting Hole against Garbotoxin if Marshadow has Psychic Energy attached. Marshadow is not a Rule Box Pokémon, so Iron Thorns Initialization and Path to the Peak do not suppress it; Silent Lab does suppress it because it is Basic. Thus Resetting Hole can remove Path to the Peak when otherwise active, but cannot remove Silent Lab, and Path to the Peak plus Garbotoxin can leave both Guardian and Marshadow suppressed. Using Resetting Hole discards Marshadow and all cards attached to it, including that Energy; it is a conditional one-shot Stadium-removal line, not free value.
- **Alternative five-Bench board including Skyliner:** Active Shadow Rider VMAX; two Benched Shadow Rider VMAX; one Benched Lillie's Clefairy ex; Latias ex; and Hooded Enamorus V. This is six Pokémon total and fits the ordinary five-Bench limit. The five non-Enamorus targets are the three VMAX, Clefairy and Latias. With Dimension Valley active, Max Geist costs two Colorless, so two Psychic Energy on the Active VMAX plus one on each of the four Benched targets gives E=6, 190 damage and protection for all five. With Sky Field instead (and no Dimension Valley), the Active needs three Energy, so E=7 gives 220 damage and the same coverage. Three VMAX Door activations plus the normal attachment can seed the four Benched Psychic targets once a protected source VMAX is established. This trades the second Clefairy (and redundant Fairy Zone) for Skyliner protection; choose according to the matchup and retreat-state value. This is arithmetic and a target board, not a demonstrated line.
- **Maximal Door-source board:** Active Shadow Rider VMAX; three Benched Shadow Rider VMAX; one Benched Lillie's Clefairy ex; and Hooded Enamorus V. This is six Pokémon total and fills the ordinary five-Bench limit. The five non-Enamorus targets are four VMAX plus Clefairy, and all four Benched targets are Psychic. If the Active VMAX has no Psychic Energy while the lock is already active, the normal attachment can seed the Active; its Door can seed the first Benched VMAX, and the three newly energized Benched VMAX can in turn use their Doors to seed the next VMAX and finally Clefairy. Four Door activations can therefore cover all four Bench targets after one normal Active seed, if same-turn ability restoration works. The Active will not yet be attack-ready from that single Energy; it still needs 2 total with Dimension Valley or 3 without. If the Active was already energized/protected, four Door activations seed all four Bench targets and the normal attachment remains available for attack payment or an extra Energy. This board trades the second Clefairy / redundant Fairy Zone and the Latias / Skyliner option for the fourth Door source; it is a card-text upper bound, not a setup-rate claim.
- **Connector cost remains real:** Fog Crystal's Enamorus line competes with Shadow Rider V and Psychic Energy; Mysterious Treasure's line competes with the other Psychic/Dragon targets and consumes a discard. Enamorus should be accessed when the observed Ability-lock threat and current resource state justify it, not automatically because a search route exists. This is candidate-specific connector domination, not free access.

All five-Bench, Energy-count, and damage examples above are rules/card-text derivations only. They do not establish the Guardian / Hood interaction with Garbotoxin or Initialization, Fairy Zone preservation, setup probability, field-wide value, or a stronger deck.

The attached-Energy ceilings above are separate from the deck-copy / Prize-zone question. Agent6's [Max Geist 11-Energy Prize-ceiling analysis](agent6-max-geist-energy-prize-ceiling-20261118.md) estimates the probability that 11 Energy copies remain outside Prizes and compares a 12th-Energy challenger; it also quantifies the lower Dragon damage thresholds when Fairy Zone is active. Those are availability calculations, not probabilities of attaching the Energy by a given turn, and the Dragon breakpoints depend on Fairy Zone actually remaining active.

## Controlled interaction matrix

Do not add Enamorus V to the nominated 60 before the V3 acceptance and first natural-terminal trace stopline clears. Afterward, test this as a separate candidate variant, retaining both Hoods initially and recording which card is displaced.

| Scenario | Required observation |
|---|---|
| Enamorus V in play, Hood attached to Enamorus, Garbotoxin active; Shadow Rider has Psychic Energy | Does Hood preserve Enamorus's Guardian of Love, and does Guardian prevent Garbotoxin from suppressing the protected Shadow Rider? |
| Hooded Enamorus; Psychic-Energy-attached Lillie's Clefairy ex; Initialization / Garbotoxin active | Does Guardian preserve Fairy Zone on Clefairy, retaining Psychic Weakness on opposing Dragon Pokémon for the Mimikyu Copycat counter-line? |
| Hooded Enamorus; Psychic-Energy-attached Latias ex; Initialization / Garbotoxin active | Does Guardian preserve Skyliner and free retreat for Basic Pokémon (not Shadow Rider VMAX)? |
| Garbotoxin / Initialization already active, Hooded Enamorus present, Shadow Rider VMAX initially has no Psychic Energy; attach one Psychic Energy normally | Does Guardian immediately prevent the existing lock effect on that Shadow Rider and restore Underworld Door? |
| After the first Shadow Rider is protected, use its Underworld Door to energize a second Benched VMAX | Does the second VMAX become protected and regain its own unused Underworld Door in the same turn, allowing the cascade? |
| Four-VMAX maximal Door board; normal attachment seeds an unenergized Active VMAX, then use all four Underworld Door abilities in sequence | Can the three newly energized Benched VMAX regain Door in the same turn and complete the four-target cascade to Clefairy; is the Active still short of attack payment? |
| Hooded Enamorus; a non-Psychic Pokémon such as Dialga-GX receives Psychic Energy through the normal attachment; Garbotoxin active | Does Guardian protect the target based on attached Psychic Energy despite its non-Psychic type? |
| Hooded Enamorus; Psychic-Energy-attached Marshadow on the Bench; Garbotoxin active | Does Guardian preserve Resetting Hole? If used, does Marshadow discard itself and all attached cards after discarding the Stadium? |
| Marshadow on the Bench; Path to the Peak versus Silent Lab, with Garbotoxin layered as a separate condition | Confirm Resetting Hole is not suppressed by Path to the Peak (Marshadow has no Rule Box) but is suppressed by Silent Lab (Marshadow is Basic); Path plus Garbotoxin suppresses Enamorus's Guardian and Marshadow, so the ability cannot be assumed available. |
| Tapu Lele-GX or Radiant Eternatus played while a suppressing lock is already active | Confirm an on-play Wonder Tag / Climactic Gate trigger cannot be recovered by later Psychic attachment; Initialization's Rule-Box scope suppresses both (neither is a Future Pokémon). |
| Tool Jammer attached to the opponent's Active Pokémon, with Item lock active; candidate uses Guzma to move that carrier to the Bench | Does Tool Jammer stop suppressing the Hoods and restore Guardian without an Item? Confirm the line is unavailable if a Supporter lock prevents Guzma. |
| Same board, then Field Blower removes Hood from Enamorus | Does Guardian cease protecting the Shadow Rider? Can the reserve Hood restore the shield on the same turn? |
| Enamorus V in play without a Hood, Garbotoxin active | Confirm Enamorus is suppressed because it is excluded from its own protection. |
| Opponent's Basic Ability lock / Wobbuffet | Check whether Enamorus remains active under the exact Ability text and whether protected Shadow Riders remain covered. |
| Silent Lab or Path to the Peak | Confirm these Stadium effects are not prevented by Guardian or Stealthy Hood; record the candidate's Stadium answer. |
| Shadow Rider with no Psychic Energy attached | Confirm the Pokémon is not protected until Psychic Energy is attached. |
| Rank31 Dusknoir Cursed Blast targets a Shadow Rider with Psychic Energy | Are damage counters prevented by Guardian while Dusknoir still self-KOs, matching the official Luminous Wing Q&A? |
| Dusknoir targets Enamorus V itself | Confirm Enamorus is excluded from its own protection and Hood is required to protect it. |
| Enamorus V damaged, Acerola used before KO | Does Acerola preserve Enamorus and its attached Hood; what Supporter/tempo cost and rebench timing result? |
| Enamorus V Knocked Out or gusted | Measure the two-Prize cost and loss of the board-wide shield. |
| Field Blower / Megaton Blower / Faba | Distinguish discard, full attached-Tool sweep, and Lost Zone placement; do not conflate their recovery options. |

## Evidence status

- **Card-text facts:** repository card database entries for Enamorus V (swsh11-82), Stealthy Hood (sm10-186), Garbodor (xy9-57), Fog Crystal (swsh6-140), Mysterious Treasure (sm6-113), Shadow Rider Calyrex VMAX (swsh6-75), Dimension Valley (xy4-93), Sky Field (xy6-89), Lillie's Clefairy ex (sv9-56), Mimikyu (sm2-58), Dialga-GX (sm5-100), Latias ex (sv8-76), Marshadow (sm10-81), Tapu Lele-GX (sm2-60), Radiant Eternatus (swsh12pt5-105), Silent Lab (xy5-140), Path to the Peak (swsh6-148), and Iron Thorns ex (sv6-77).
- **Candidate facts:** current fixed 60-card JSON; 11 Basic Psychic Energy, 4 Fog Crystal, 4 Mysterious Treasure, 2 Stealthy Hoods, 4 Shadow Rider V, 4 Shadow Rider VMAX, 2 Lillie's Clefairy ex, 1 Latias ex, 1 Tapu Lele-GX, 1 Radiant Eternatus, and 1 Marshadow.
- **Hypothesis:** a Hood-protected Enamorus V may provide a board-wide ability shield to the candidate's Psychic-Energy-attached Pokémon. The separate Stealthy Hood / Iron Thorns mechanism on Shadow Rider already has a pinned native test; the Enamorus extension does not.
- **Unresolved:** whether Guardian of Love prevents Garbotoxin / Initialization on protected Pokémon while Stealthy Hood preserves Enamorus; whether the dynamic seed-and-spread sequence works in the same turn; whether Guardian preserves Fairy Zone on energized Clefairy and Skyliner on energized Latias; whether Resetting Hole is preserved under Garbotoxin; simulator support, setup rate, field-wide value, slot cost, prize liability, and win-rate effect.

This is a high-value interaction to test, not a deck change or a claim of competitive improvement.


## 19 November 2026 — discard-aware anchor/core access addendum

A new exact prize-aware model uses Arven's full printed search effect rather than treating it only as a Hood finder. Arven can fetch **Stealthy Hood + Fog Crystal** in one Supporter play when Enamorus remains in the deck, or **Stealthy Hood + Hisuian Heavy Ball** when Enamorus is Prized. This route avoids assuming that Mysterious Treasure's discard cost is payable.

For a hypothetical 15-Basic 60 that adds one Enamorus by cutting a non-Item Trainer, the model uses Fog Crystal ×4, Heavy Ball ×1, Arven ×1, Hood ×2, and the two other Tool targets (Float Stone and Forest Seal Stone). It excludes Mysterious Treasure and Quick Ball as search routes, as well as Forest Seal Stone's Star Alchemy and Tapu Lele-GX → Arven. Exact finite-population results, conditional on a valid opening seven:

| Resource event | Going first | Going second |
|---|---:|---:|
| Enamorus + Hood access without Arven dual search | 15.5040% | 19.0264% |
| Enamorus + Hood access with Arven dual search | 22.4001% | 26.1390% |
| Shadow Rider V by turn 1 + VMAX by turn 2 | 18.6496% | 22.5528% |
| Joint anchor + V/VMAX access with Arven dual search | 3.3014% | 4.8498% |

Going-first timing correctly allows no natural draw on the candidate's first turn; going second allows a draw on each of the candidate's first two turns. The 3.3014% / 4.8498% joint figures are piece-access events only, not probabilities of establishing Guardian of Love, attaching Energy, attacking, or winning. They do not establish that Enamorus is worth a slot.

The previous 23.1853% / 27.5942% eight-searcher figure remains the output of its earlier route model. It assumes Fog Crystal + Mysterious Treasure as eight direct searchers and does not include Arven's Hood + Fog Crystal line. The new model uses only Fog Crystal plus Arven's dual search and Heavy Ball; the similar outputs arise from different route assumptions and are not evidence that Mysterious Treasure's cost is immaterial.

Full methodology, category counts, exact ratios, limitations, and reproduction are in [the discard-aware anchor/core access report](agent43-enamorus-anchor-core-access-20261119.md) and [its C++17 enumerator](agent43-enamorus-anchor-core-access-20261119.cpp). This is an analytic correction/addition only: no candidate, policy, fixture, simulator, workflow, CI, or competitive-status change.


## 19 November 2026 — Forest Seal Stone / Star Alchemy access extension

A second exact route model adds Forest Seal Stone's once-per-game Star Alchemy. Forest Seal Stone is a Pokémon Tool, **not an Item under manual B-02**, despite the legacy `Item` subtype label in the card-pool metadata; Arven can fetch it only as the Tool target. Its second target must be a true Item. If neither Enamorus nor Hood is directly accessible, Arven can fetch Forest Seal Stone + Fog Crystal (or Heavy Ball if Enamorus is Prized); Star Alchemy finds Hood and the Item finds Enamorus **only when that Item is playable**. Under AOR3 Item lock, Fog Crystal / Heavy Ball cannot be played, so this two-piece line is not available; the access model below assumes no Item / Supporter lock. If one anchor piece is already accessible, Star Alchemy can find the other without needing to play an Item.

The model requires a Pokémon V in play by turn two for anchor-only access, and by turn one for the joint Shadow Rider V/VMAX event. It assumes an open Tool slot on a Pokémon V. Mysterious Treasure and Quick Ball remain excluded as search routes; Tapu Lele-GX → Arven and other omitted routes are not included.

Conditional on a valid opening seven:

| Resource event | Going first | Going second |
|---|---:|---:|
| Enamorus + Hood access without Star Alchemy | 22.4001% | 26.1390% |
| Enamorus + Hood access with Star Alchemy | 24.8928% | 29.3519% |
| Shadow Rider V by turn 1 + VMAX by turn 2 | 18.6496% | 22.5528% |
| Joint anchor + core access without Star Alchemy | 3.3014% | 4.8498% |
| Joint anchor + core access with Star Alchemy | 4.0990% | 6.0508% |

Star Alchemy adds 2.4927 / 3.2130 percentage points to anchor-only access and 0.7976 / 1.2009 points to the joint anchor-plus-core event. These remain access probabilities, not Guardian establishment, attacks, games, or win-rate evidence. The model also does not resolve Tool-slot conflicts, Supporter/Item lock, sequencing, Energy, or opponent disruption.

Full assumptions and reproduction are in [the Forest Seal Stone access report](agent43-enamorus-forest-seal-access-20261119.md) and [its C++17 enumerator](agent43-enamorus-forest-seal-access-20261119.cpp). No fixed candidate, policy, fixture, simulator, workflow, CI, or competitive status changed.


**Ability-lock ruling boundary for Star Alchemy:** official Japanese Pokémon Card Game Q&A confirms that Forest Seal Stone's Star Alchemy remains usable under Path to the Peak and Spiritomb's Basic-Pokémon Ability suppression. Iron Thorns Initialization has the same Rule Box suppression scope as Path to the Peak, so the strong paper-rules inference is that Star Alchemy remains usable under Initialization even if the attached Pokémon's own Ability is suppressed; it does not require Guardian of Love or Psychic Energy on the attached Pokémon merely to preserve the VSTAR Power. No direct Garbotoxin + Forest Seal Stone Q&A was found, so keep that claim inferential. This does **not** mean Guardian itself is active under Initialization: Enamorus is excluded from its own protection and may still need Hood. Stadium suppression of Guardian (e.g. Silent Lab / Path to the Peak) is not prevented by Guardian or Hood, but Star Alchemy is a separate Tool-granted VSTAR Power. The access model does not require the Guardian / Energy state and its figures remain no-lock resource-access results, not lock-proof setup rates. See [Agent35's official-ruling note](agent35-forest-seal-stone-ability-lock-ruling-20261120.md).
