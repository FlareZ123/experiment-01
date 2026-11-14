# Hood Shadow Rider v1 — matchup-conditioned DCI/AMR policy notes

**Agent 50 · 13 November 2026 · heuristic policy specification, not a validated bot**

This note applies to the nominated Hood Shield Shadow Rider v1 list, which retains Dialga-GX and Mimikyu. It translates the repository's human concepts—UDP, DCI, AMR, K0/K1, Supporter contention and ALS—into concrete policy state and sequencing requirements. It is not a static card-value ranking.

## State the policy must track

At minimum, a deck-aware policy needs:

- Opponent archetype/posterior and confidence, updated from mulligan reveals and early board state.
- Whether the opponent is Regidrago and whether its last attack was Apex Dragon.
- Whether at least one Lillie's Clefairy ex is in play with Fairy Zone active; this changes opposing Dragon Weakness to Psychic ×2 and is required for the 150-base Timeless-GX to reach 300 damage against a 280-HP Regidrago.
- Dialga-GX location: deck, hand, discard, Prizes, in play or otherwise unavailable.
- Mimikyu location and whether it can attack this turn.
- Whether the GX attack allowance has already been used; which GX attack was used.
- Whether the nested Timeless-GX copy line remains possible.
- Known Prize composition: use the supplied human-concept K0/K1 distinction (K0 before the first full deck search; K1 after searching and inferring Prize contents).
- Psychic Energy in hand, attached to each Pokémon, in discard and in Prizes.
- Shadow Rider V / VMAX counts in hand, deck, play, discard and Prizes; whether two VMAX targets remain for Radiant Eternatus.
- Hood count/location, attached Pokémon, opposing Ability-lock pieces, and opposing Tool/Stadium removal.
- Bench occupancy and remaining bench capacity; Active/Bench retreat state; Latias ex and Float Stone availability.
- Supporters in hand/discard/deck, VS Seeker availability, and whether a Supporter has already been played this turn.
- Whether each one-of tech's matchup-specific target/effect is currently relevant.

A scalar DCI alone is insufficient. Use conditional states or a vector keyed by matchup, turn, prize map, zone state and intended ALS.

## Critical Regidrago ALS

The counter-line is:

**Opponent uses Apex Dragon → Mimikyu Copycat → nested Apex Dragon chooses Dialga-GX Timeless-GX from your discard.**

The card-text/rule basis and remaining GX-allowance uncertainty are documented in the [Dialga counter-ALS audit](agent50-hood-shadow-rider-dialga-slot-audit-20261113.md).
The exact candidate printings are paper-legal for this non-GX Copycat → Apex Dragon → own Dialga Timeless-GX line. The pinned vanilla Twinleaf resolver nevertheless rejects the non-GX Copycat path through an unprinted `copycatAttack` veto; source-faithful evaluation therefore requires the research-side non-GX Copycat compatibility and declared-attack-history hooks. Keep paper legality separate from the engine's default behavior; see the [paper/engine boundary audit](agent49-mimikyu-copycat-regidrago-timeless-als-20261113.md) and [staged Store progression](../../twinleaf/mimikyu-extra-turn-progression.md).
The bundled card pool confirms Dialga-GX UPR 100 is Dragon-type (`resources/cards/en/sm5.json`, ID `sm5-100`) and Mysterious Treasure's printed rule searches Psychic or Dragon Pokémon (`resources/cards/en/sm6.json`, ID `sm6-113`). This makes Treasure a direct deck-to-hand Dialga connector as well as a Dialga-to-discard cost that can fetch Mimikyu; do not model it only as a discard outlet.

### Regidrago-conditioned policy

| Piece | DCI/UDP state | Policy |
| --- | --- | --- |
| Dialga-GX | Effectively UDP while counter-line live | Preserve in discard; do not treat its unpayable normal attacks as evidence it is expendable |
| Lillie's Clefairy ex | Very high DCI while Regidrago KO line is live | Keep Fairy Zone active; it changes Dragon Weakness to Psychic ×2, making the copied 150-base Timeless-GX deal 300 to Regidrago VSTAR |
| Mimikyu GRI 58 | Effectively UDP while Apex Dragon counter is live | Preserve access and fund two Psychic Energy (Psychic + Colorless); its Copycat attack receives Fairy Zone's ×2 Weakness against Regidrago |
| Battle Compressor | High AMR when Dialga is still in deck | Consider discarding Dialga among the three cards, but account for the other two cards' DCI |
| Mysterious Treasure | High DCI while the Dialga/Mimikyu line is live; AMR depends on the missing target and current hand | It can search Dragon-type Dialga-GX UPR 100 directly from deck, or discard Dialga from hand as its cost while finding Psychic Mimikyu/Clefairy (or another Psychic/Dragon target). Preserve it while either access route is needed; reevaluate after the line is secured or impossible |
| Night Stretcher | High DCI with Dialga in discard | Do not recover Dialga before the Copycat line unless deliberately resetting/rebuilding the line |
| GX attacks on Tapu Lele / Trevenant & Dusknoir | Preserve the once-per-game allowance | Do not spend a GX attack before Timeless-GX if the counter-line is intended; verify nested-copy ruling |
| Mimikyu Copycat timing | Conditional AMR | It can copy Apex Dragon only if the opponent used that non-GX attack during their last turn; the opponent can deny the line by choosing another attack |

After the line is executed or made impossible, recompute Dialga's DCI. Do not permanently classify it as “never discard” or “always discard.”

### Counter-ALS connector map by card zone

The relevant search/recovery effects create different routes depending on the component's current zone. The card-pool rules are in `resources/cards/en/sm5.json` (Dialga-GX UPR 100, Dragon), `sm6.json` (Mysterious Treasure: Psychic/Dragon search), `swsh10.json` (Hisuian Heavy Ball: Basic Pokémon from Prizes), and the corresponding candidate printings for Fog Crystal, Quick Ball, Battle Compressor and Night Stretcher.

| Component / zone | Available route | DCI/AMR consequence |
| --- | --- | --- |
| Dialga in deck | Mysterious Treasure searches it as a Dragon; Quick Ball can search it as a Basic; Battle Compressor can put it directly into discard | Preserve at least one live access route while the counterline is intended; Treasure is not merely a discard outlet |
| Dialga in hand | Mysterious Treasure can discard Dialga as its cost while searching a Psychic Mimikyu/Clefairy or another Dragon/Psychic target | Treasure may convert a stranded payload into the required discard state and find the partner; compare against other legal discard costs |
| Dialga in discard | Mimikyu Copycat can use the copied Apex Dragon choice to select the candidate's own Timeless-GX | Preserve the payload; Night Stretcher returning Dialga to hand removes it from the intended discard line unless deliberately rebuilding |
| Dialga in Prizes | Hisuian Heavy Ball can retrieve a Prized Basic Pokémon | One Heavy Ball cannot recover two simultaneously Prized Basic roles; see the Prize-only multiplicity sensitivity above |
| Mimikyu in deck | Mysterious Treasure or Fog Crystal searches it as a Psychic Pokémon; Quick Ball can also search it as a Basic | Keep a connector available if Mimikyu is the missing partner |
| Mimikyu in discard | Night Stretcher can recover it as a Pokémon | Recovery is useful only if Dialga's payload remains in discard or can be restored |
| Mimikyu in Prizes | Hisuian Heavy Ball can retrieve it as a Basic Pokémon | Heavy Ball competes for the same one-per-use recovery resource as Prized Dialga |

This map is a zone-access contract, not a complete policy: it does not establish that the opponent will expose Apex Dragon, that the board can fund Copycat, that Fairy Zone is active, or that the line is strategically superior to the best alternative. The policy must re-evaluate after each zone transition and must not use concealed opponent identities or unlearned Prize contents.

### Prize-only access multiplicity: a challenger hypothesis, not a deck change

The fixed 60 currently has one Mimikyu, one Dialga-GX and one Hisuian Heavy Ball, with 14 total Basics. Agent21's exact model gives a **2.36690910% conditional Prize-only cut** for the two required Basic roles being inaccessible from the six Prizes, even under the optimistic assumption that every unprized Heavy Ball and every core card outside Prizes is otherwise available. The model is deliberately only a Prize-zone obstruction: it does not require Heavy Ball to be in hand or drawn, and it does not model the actual draw/search route, opponent, Energy, Bench, Ability or attack constraints.

| Copies (Mimikyu / Dialga / Heavy Ball) | Total Basics in Agent21 model | Conditional Prize-only cut | 11/32 field contribution if every cut were a loss |
| --- | ---: | ---: | ---: |
| 1 / 1 / 1 (current) | 14 | 2.36690910% | 0.81362500 percentage points |
| 2 / 1 / 1 | 15 | 0.94357297% | 0.32435321 percentage points |
| 1 / 2 / 1 | 15 | 0.94357297% | 0.32435321 percentage points |
| 2 / 2 / 1 | 16 | 0.11659566% | 0.04007976 percentage points |
| 1 / 1 / 2 | 14 | 0.21949187% | 0.07545033 percentage points |

The 1/1/2 configuration adds a second Heavy Ball while preserving the 14-Basic count; in this model it reduces this isolated cut by **10.78×** without increasing the Basic count. The field calculation uses 11 Regidrago archetype entries among 32 (nine published exact lists plus two unavailable original lists). If every occurrence of the cut were a loss, the current 1/1/1 obstruction alone would exceed the entire 0.5% equal-weight aggregate loss budget; the 1/1/2 obstruction would contribute 0.07545 percentage points. The difference is **0.73817467 percentage points** of field loss under that all-cuts-are-losses mapping; this is a useful ceiling for the variant's whole-field slot-cost comparison, not an expected benefit. This is a deliberately pessimistic stress bound, **not** a prediction that every cut loses or that a second Heavy Ball improves actual games.

**Disposition:** preserve the current 1/1/1 fixed 60 unchanged through the pending first native baseline game. After that baseline, register a separate 1/1/2 Heavy Ball whole-deck challenger against the same nine published Regidrago lists and the full 32-opponent field, with both seats, competent fixed opponent policies and explicit opportunity-cost accounting for the card cut. Do not make an untested one-card swap from this Prize-only model. Full source: [Agent21 Prize-access multiplicity sensitivity](agent21-copycat-prize-access-multiplicity-sensitivity-20261107.md).

### Convert the extra turn into a second attack

After Mimikyu's Copycat/Timeless-GX resolves and the extra turn begins, **do not hard-code Max Geist as the follow-up**. Compare at least two live routes from the same public state:

1. **Skyliner → Max Geist:** if Latias ex is in play, its Skyliner Ability gives Basic Pokémon free retreat. Retreat Mimikyu into Shadow Rider VMAX; the two Psychic Energy attached to Mimikyu remain on the board and still contribute to Max Geist, which counts Psychic Energy attached to all of your Pokémon. Agent42's projection regression (commit `5c40f386`) checks that energy-retention calculation. This is a projection/test, not a full-game policy result.
2. **Second Copycat → Apex Dragon → Power Beam:** if the opponent's last attack remains Apex Dragon and Radiant Eternatus CRZ is in your discard, Mimikyu may Copycat again and choose Radiant Eternatus's **Power Beam (200 damage)** through Apex Dragon. Agent1 identified natural donor-prospective seed `2098059327`: on turn 17, after the Timeless-GX extra-turn state, Mimikyu was Active with two Energy and selected Power Beam on a second Copycat decision. The final snapshot had two Shadow Rider VMAX and Latias ex on the Bench, but the artifact did not record VMAX Energy counts or the exact decision-time target/HP, so this does not prove Max Geist was payable or inferior. Power Beam is 200, not the earlier mistaken 130.

**Raw-damage crossover (mathematical derivation, not a game result):** with (n) Psychic Energy attached across all of your Pokémon, Max Geist is (10+30n). At (n=5,6,7), that is **160, 190, 220** base damage. Power Beam is **200** base damage. Thus, before other modifiers, Power Beam is higher at five or six total Psychic Energy; Max Geist becomes higher at seven or more. If Fairy Zone doubles the target's Dragon Weakness to Psychic, the corresponding values are 320/380/440 versus 400, so the crossover remains at seven. Count all Psychic Energy on the board, including Mimikyu's two if it retreats; the natural seed's snapshot did not preserve the VMAX attachments, so do not assume (n=5).

Agent1's matched staged native gate now compares both follow-ups from the same post-Timeless board in both physical seats: Skyliner/Max Geist versus second Copycat/Power Beam. The manual workflow has not been dispatched, and the gate deliberately does not assert which route is better. The actor policy must compare the exact target's HP and Weakness, damage after applicable effects (including Fairy Zone where relevant), Prize outcome, and retained resources; choose Max Geist only when it is actually better than the second-Copycat route. Also compare active liability: the second Copycat leaves one-Prize Mimikyu Active, whereas the Skyliner route promotes three-Prize Shadow Rider VMAX; evaluate the opponent's next-turn response and prize map, not only raw damage. Do not infer a 400-damage Power Beam or any route superiority without the exact target/Weakness state.



## Non-Regidrago DCI

Against a matchup without a relevant Dragon attack-copy line, Dialga may become a high-DCI discard target because its printed attacks are not payable and it has no Ability. It can still have value as a 180-HP Basic pivot, so the policy should compare that value against the immediate search/discard need.

Mimikyu is also matchup-dependent: Copycat can use other non-GX attacks from the opponent's last turn, but its value may be low if the opponent's attacks are poor copy targets. Identify the opponent's attack menu before discarding either piece.

## Turn sequencing and AMR

### Shadow Rider engine

1. Establish Shadow Rider V before spending search resources on secondary Pokémon, unless the matchup demands an immediate tech.
2. Use Fog Crystal first when it can find the required Basic Psychic Pokémon or Psychic Energy without a discard. Mysterious Treasure is more flexible (Psychic or Dragon Pokémon) but requires a discard; its AMR depends on having a sufficiently high-DCI card in hand.
3. Underworld Door is once per Shadow Rider VMAX per turn: attach a Psychic Energy from hand to a Benched Psychic Pokémon, then draw two. Choose the recipient based on the next evolution/attack and Max Geist's total attached Psychic Energy, not merely the first available Bench target.
4. Attach Stealthy Hood to the intended Shadow Rider V before evolving when the protected evolution line is planned; the repository's earlier hook test reports the Tool survives evolution. Hood protects against opponent Abilities, not opposing Tool removal. Treat it as temporary protection, not permanent immunity.
5. Use Arven with Supporter contention in mind: it can find an Item and a Tool, often Hood plus Fog Crystal/another Item. Tapu Lele-GX can find Arven, Guzma, Ranger, Teammates or Raihan with Wonder Tag, but that Ability can be suppressed.
6. Radiant Eternatus's Climactic Gate searches up to two Pokémon VMAX and ends the turn. Sequence other useful Supporters, Items, attachments and Underworld Door activations first; play Radiant Eternatus only when the bench and remaining VMAX targets make the Gate worthwhile.
7. Forest Seal Stone is a once-per-game broad search. Preserve its VSTAR Power until a genuine bottleneck; do not spend it on a card that Fog Crystal or Mysterious Treasure can obtain cheaply.

### Matchup tech and resource timing

| Card | State-dependent use / DCI rule |
| --- | --- |
| Stealthy Hood (2) | Very high value against relevant Ability lock; after sufficient protection is attached and no further lock threat exists, remaining copy can become discardable. Tool-removal answers remain live. |
| Pokémon Ranger | Removes attack effects, not Abilities. Do not treat it as a direct answer to Iron Thorns/Garbodor Ability lock. Preserve for relevant attack-based effects. |
| Field Blower | Preserve while opposing Tools/Stadiums matter; use against actual counter pieces rather than for low-value thinning. |
| Marshadow UNB 81 | Resetting Hole is a play-from-hand Stadium reset; time it against a relevant Stadium. |
| Girafarig LOT 94 | Get Lost is matchup-dependent: wait until high-value recovery cards are in the opponent's discard, then Lost Zone them. |
| Unfair Stamp | Preserve until its Knock Out condition is met; it is the ACE SPEC and cannot be replaced. |
| Teammates / Raihan | Their high AMR is conditional on a Pokémon having been Knocked Out during the opponent's last turn. Avoid treating them as generic early Supporters. |
| Acerola | Use on a damaged Pokémon when returning it and its attached cards to hand materially preserves the attacker/energy package. |
| Guzma | Spend the Supporter slot when the gust/switch changes the Prize map or creates a decisive target; account for Supporter contention. |
| VS Seeker (2) | Reuse the Supporter whose condition and timing are currently live; preserve the last copy if it is the only route to a matchup-critical Supporter. |
| Float Stone | Latias ex gives Basic Pokémon no Retreat Cost, not VMAX. Float Stone remains important for a VMAX or other non-Basic pivot when needed. |
| Sky Field | Play when the expanded Bench materially improves Full Moon Rondo or engine capacity; do not expose it early if the Bench is not ready. |
| Dimension Valley | Play when the one-Colorless reduction changes a Psychic attack breakpoint/turn; it does not reduce Dialga's Dragon attacks. |
| Tapu Lele-GX | Wonder Tag is a high-value Supporter access trigger when live; do not count it as unconditional under Ability lock. Its GX attack competes with the Regidrago Timeless-GX line. |

## Discard policy for search effects

For Mysterious Treasure, Quick Ball and Battle Compressor, select discard targets by current DCI rather than card type:

- First check K0/K1 Prize uncertainty and whether the card is a singleton whose effect is not yet used.
- Preserve matchup-critical ALS payloads (Dialga vs Regidrago; Mimikyu if Copycat is live).
- Preserve Unfair Stamp, unspent Forest Seal Stone, relevant one-of Supporters/techs and required V/VMAX targets.
- Preserve enough Psychic Energy to fuel Underworld Door and the next attack; excess Energy becomes more discardable when recovery/attachment lines are secured.
- Duplicate VMAX can become discardable only after the desired VMAX board is established and remaining deck/prize counts show no further need.
- Use Battle Compressor when the three discarded cards have a plan (e.g. Dialga payload plus recoverable resources), not as generic thinning.
- Night Stretcher can recover Pokémon or Basic Energy, but recovering Dialga from discard can break the Regidrago line; model the lost payload value before using it.

### Quick Ball donor exposure: duplicate count is not DCI

Agent42's exact opening-hand enumeration fixes the candidate's Quick Ball root exposure at 16,687,315 / 332,682,240 keepable seven-card subsets (5.0160%). Agent12 then evaluated the helper's actual order-sensitive selection rule: take the first duplicated non-Energy printing in hand order, otherwise take Psychic Energy. The resulting expected selected-donor distribution over the 16,687,315 root-eligible hands is:

| Selected donor class | Expected hand-equivalents | Share of root-eligible hands | Share of non-Energy branch |
| --- | ---: | ---: | ---: |
| Psychic Energy | 9,134,158 | 54.7371% | — |
| Basic Pokémon (Shadow Rider V / Lillie's Clefairy ex) | 2,437,439.5 | 14.6065% | 32.2705% |
| Evolution (Shadow Rider VMAX) | 1,445,093.6667 | 8.6598% | 19.1323% |
| Search Items (Mysterious Treasure / Fog Crystal / VS Seeker) | 3,150,332.8333 | 18.8786% | 41.7088% |
| Supporter (Lillie's Determination) | 260,145.5 | 1.5589% | 3.4442% |
| Tool (Stealthy Hood) | 260,145.5 | 1.5589% | 3.4442% |

The fractional hand-equivalents are exact expected values over uniformly random permutations of each unordered six-card subset; they are not integer counts of distinct subsets. The category numerators sum to the non-Energy branch, 7,553,157, and the Energy branch, 9,134,158, exactly partitions the eligible set. See [Agent42's opening-coverage derivation](agent42-v17-quickball-opening-coverage-20261113.md) and [Agent12's order-aware donor breakdown](../../../communications/agent42/20261113T2334Z_agent12-quickball-donor-category-breakdown.md).


The exact per-printing selection exposure is now reproduced by [Agent50's order-aware enumerator](../../methodology/2026-11/agent50-v17-quickball-donor-by-printing-20261113.py), using the same fixed 60 and the helper's first-duplicate-in-hand-order rule:

| Selected printing | Expected hand-equivalents | Share of non-Energy branch | Share of root-eligible hands | Joint share of keepable openers |
| --- | ---: | ---: | ---: | ---: |
| Basic Psychic Energy | 9,134,158 | — | 54.7371% | 2.7456% |
| Shadow Rider Calyrex V | 2,061,998.6 | 27.2998% | 12.3567% | 0.6198% |
| Shadow Rider Calyrex VMAX | 1,445,093.6667 | 19.1323% | 8.6598% | 0.4344% |
| Mysterious Treasure | 1,445,093.6667 | 19.1323% | 8.6598% | 0.4344% |
| Fog Crystal | 1,445,093.6667 | 19.1323% | 8.6598% | 0.4344% |
| Lillie's Clefairy ex | 375,440.9 | 4.9706% | 2.2499% | 0.1129% |
| Lillie's Determination | 260,145.5 | 3.4442% | 1.5589% | 0.0782% |
| VS Seeker | 260,145.5 | 3.4442% | 1.5589% | 0.0782% |
| Stealthy Hood | 260,145.5 | 3.4442% | 1.5589% | 0.0782% |

The expected hand-equivalents are fractional because each unordered six-card subset is weighted by the exact probability that a printing is first among all duplicated non-Energy physical cards in a uniformly random hand order: (n_i / M_D), where (n_i) is the count of that printing and (M_D) is the total number of cards belonging to duplicated non-Energy printings. They are not integer counts of distinct subsets. The script asserts the exact 7,553,157 non-Energy and 9,134,158 Energy branches and the category totals above. The helper's implementation is in [Agent49's physical continuation](../../../simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs).

Notably, the current selector chooses Mysterious Treasure in **8.6598% of root-eligible hands**, or **0.4344% of all keepable opening hands**. This is an explicit exposure of a two-way Dialga/Mimikyu connector, not a claim that the payment is always wrong; its marginal cost depends on whether the remaining Treasure/Fog Crystal/Quick Ball routes still satisfy the planned counterline. Shadow Rider V and VMAX are also selected often enough that “duplicate” must not be treated as “expendable.”

This is a selection-exposure calculation, not a card-value judgment. In particular, the helper selects a Search Item in 18.8786% of all root-eligible opening hands (41.7088% of its non-Energy branch), and a Basic Pokémon in 14.6065%. A duplicate Search Item may still be the only remaining connector for the planned line; a duplicate Basic may be the needed Bench target or matchup tech; a duplicate Energy may be cheap or expensive depending on the live Underworld Door and attack plan. The exact v17 fixture hand has no duplicated non-Energy card and therefore pays one Psychic Energy, leaving two in hand; that exact multiset is only 1 in 504,064 keepable seven-card subsets. Do not tune a competitive policy to this deterministic seed.

**Required next policy contract:** enumerate the physically legal owner-hand donor objects, hold the Quick Ball target and all non-discard effects fixed, and compare each resulting state under the same non-anticipative candidate continuation and declared opponent policy. Rank by the continuation-value difference, not card type or duplicate count; include the fallback value if the search line fails, the opponent deadline, current Bench/Supporter/attachment constraints, and K0 Prize uncertainty. Protect any live ALS payload or sole remaining connector, and abstain if every donor exceeds the declared opportunity-cost threshold. The current v17 duplicate-only selector remains unchanged until its first complete native baseline game; this section does not authorize a policy or deck change.

## Existing native evidence and what it does not establish

The following work already exists; policy development should build on it rather than duplicate the basic Copycat/turn fixture or isolated donor-payment tests.

- `results/twinleaf/mimikyu-extra-turn-progression.md` exercises actual Store attack dispatch and the real WaitPrompt chain. It confirms the staged Mimikyu Copycat → Apex Dragon → Dialga Timeless-GX choice, the copied effect's turn-skip flag, and a real turn-5-to-turn-6 transition with the same player active. This is mechanics evidence, not a legal full-game result.
- Agent12's copied-GX reuse regression (commit `430237d7`) characterizes the once-per-game allowance in the pinned engine: unused GX allowance permits the Timeless-GX effect; after another GX attack, the copied Timeless-GX choice is rejected without damage or an extra turn.
- The fresh Agent46 Mysterious Treasure donor panel (`results/aichi-2026/2026-11/agent46-mimikyu-donor-prospective-source-ab-20261110.md`) ran 16 matched source pairs. Both arms had 25 opponent Apex Dragon declarations and 3 Copycat attacks. Treatment produced two real donor Treasure payments but no Copycat increase.
- The fresh Agent46 Battle Compressor donor panel (`results/aichi-2026/2026-11/agent46-compressor-donor-prospective-source-ab-20261110.md`) ran 16 matched source pairs. Control/treatment had 27/28 Apex declarations and zero Copycat attacks in either arm; treatment produced three real donor searches but no Copycat increase.
- The selected historical Compressor-donor Copycat (`results/aichi-2026/2026-11/agent46-mimikyu-compressor-donor-native-20261110.md`) selected Dialga's Timeless-GX and dealt 150 base damage to a full-health 280-HP Regidrago VSTAR. The board snapshot shows Lillie's Clefairy ex in play; Fairy Zone changes opposing Dragon Weakness to Psychic ×2, so Psychic Mimikyu's copied Timeless-GX deals 300 and the two-Prize Knock Out is legal. The raw observer recorded printed weakness only, not the dynamic Ability-modified Weakness. Do not treat this as a damage bug.

**Policy implication:** Dialga/Mimikyu is a supported staged counter-ALS, but the current weak native policies rarely execute it. Donor payment alone is not the bottleneck: the joint state (Mimikyu available and Active, two Psychic Energy, Dialga in discard, opponent's last attack Apex Dragon, GX allowance unused, and Fairy Zone active) is rare. Improve joint sequencing/promotion and preserve Lillie's Clefairy ex; the historical 150-base/280-HP KO is explained by Psychic Weakness ×2, not a damage bug. Do not repeat isolated Treasure/Compressor donor A/Bs; they have prospective null Copycat results.

## Policy evaluation requirements

Any implementation derived from this note should be evaluated against at least:

1. Regidrago lists with and without an Apex Dragon last-turn opportunity, and with Fairy Zone active versus absent.
2. Ability-lock matchups where Tapu Lele Wonder Tag is suppressed and Hood protection is contested by Tool removal.
3. Matchups where Girafarig, Marshadow, Mimikyu, Ranger or Field Blower are dead/low-value.
4. Bench-constrained states and turns where Radiant Eternatus ends the turn.
5. K0 vs K1 states, including prized Dialga/Mimikyu and the use of Hisuian Heavy Ball.

Report action legality, policy decisions, failures and full-game outcomes by opponent. This specification is a heuristic starting point, not a validated playing policy or win-rate result.


## Related formalization

For a general state-conditioned treatment of DCI, AMR, connector domination, resource constraints, and hidden information, see [Agent5's state-conditioned action-realism model](../../methodology/2026-11/agent5-state-conditioned-action-realism-model-20261113.md). This document is one concrete post-Timeless line comparison; it does not compute general AMR/DCI values or establish a validated playing policy or matchup result.
