# ADP → Thorton → Regidrago VSTAR: a structurally independent fifth fixed-60 challenger

**Agent 5 | 2 November 2026 | Candidate admission packet | 0 competitively qualified games**

## Provenance and fixed artifact

This is a whole-mechanism proposal independent of the current champion Shadow Rider shell and New Moon alteration. It remains **provisional and unranked**. The selected current form is [v2 with two Field Blower](candidates/agent5-adp-thorton-regidrago-60-v2.json); its 60-card printing inventory has canonical UTF-8 SHA-256 **bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b**. The [original v1 60](candidates/agent5-adp-thorton-regidrago-60-v1.json) remains an unchanged diagnostic control with SHA-256 27f9e4d41910fda647426642be6f2789a4e78d87736b8eb1e997849ffdfea99e. Candidate v2 exchanges exactly one Quick Ball and one Pokégear 3.0 for two Field Blower. This is the only change.

Both inventories contain only provided card-list English printing IDs marked Expanded: Legal. The event was CL Aichi Open League 2026-05-10. The paper Japanese event ban list and older-print equivalence still require final event-admission confirmation; bundled database legality is necessary but not sufficient. The relevant official source is https://www.pokemon-card.com/rules/regulation/ and the 2026-01-16 Japanese notice adding Medicham V from 2026-02-20 is https://www.pokemon-card.com/info/005353.html. All card names in the printed v2 list are outside that identified banned-name set. The 60-list is static; no matchup-specific substitution is permitted.

### Human-readable 60, exact chosen English printing

| Pokémon (16) | Copies | Printing |
| --- | ---: | --- |
| Arceus & Dialga & Palkia-GX | 2 | SM12 156 |
| Regidrago V | 3 | SWSH12 135 |
| Regidrago VSTAR | 3 | SWSH12 136 |
| M Charizard-EX, **Wild Blaze** | 1 | XY2 69 |
| Dragapult ex, **Phantom Dive** | 1 | SV6 130 |
| Haxorus, **Bring Down the Axe** | 1 | SV6.5 46 |
| Haxorus, **Axe Blast** | 1 | ZSV10.5 70 |
| Hisuian Goodra VSTAR, **Rolling Iron** | 1 | SWSH11 136 |
| Noivern ex, **Covert Flight / Dominating Echo** | 1 | SV2 153 |
| Tapu Lele-GX | 1 | SM2 60 |
| Crobat V | 1 | SWSH3 104 |

| Trainer (33) | Copies | Printing |
| --- | ---: | --- |
| Tag Call | 4 | SM12 206 |
| Quick Ball | 3 | SWSH1 179 |
| Ultra Ball | 4 | SWSH9 150 |
| Battle Compressor Team Flare Gear | 4 | XY4 92 |
| Thorton | 4 | SWSH11 167 |
| Guzma & Hala | 3 | SM12 193 |
| Field Blower | 2 | SM2 125 |
| Viridian Forest | 2 | SM9 156 |
| Switch | 2 | SV1 194 |
| Hero's Cape, ACE SPEC | 1 | SV5 152 |
| VS Seeker | 1 | XY4 109 |
| Pokégear 3.0 | 2 | SV1 186 |
| Boss's Orders | 1 | SWSH2 154 |

| Energy (11) | Copies | Printing |
| --- | ---: | --- |
| Double Dragon Energy | 4 | XY6 97 |
| Basic Grass Energy | 4 | SWSH12.5 152 |
| Basic Fire Energy | 3 | SWSH12.5 153 |

The machine-readable JSON and card-text tests specify exact printings and preserve the 4-of rule, the single ACE SPEC restriction and 60-card total. There are seven Basic Pokémon and one active Pokémon at game start. The chosen printings and attacks are reproducible without card-name guessing.

## Novel central line and precise costs

**Going second, first personal turn (T1):** Prefer to start Arceus & Dialga & Palkia-GX in the Active Spot. Use Tag Call to find it and/or the TAG TEAM Supporter Guzma & Hala. Guzma & Hala searches Viridian Forest; it additionally searches Double Dragon Energy and Hero's Cape if its optional cost of discarding **two other cards** can actually be paid. Attach Double Dragon Energy to ADP, then use **Altered Creation-GX**. One Double Dragon supplies a Metal Energy plus an extra Water Energy, satisfying the enhanced GX line. Its effect persists for the game: later attacks gain +30 damage against the opposing Active and take **one extra Prize only for a knockout by attack damage**. Only one Supporter and one manual attachment are assumed. Tag Call is an Item, so still needs to be usable under any applicable lock.

A non-ADP opening Active requires a genuine legal Switch/retreat and Bench slot; reaching ADP in hand does not imply an Active GX attack. If the first personal turn is going first, the GX T1 is unavailable under ordinary first-turn rules. Both actual starting orders must be evaluated. A Prize-card or hand discard may also block the purported Tag Call/Guzma & Hala path. There are precisely four Double Dragon Energy copies; each can be stranded under Temple of Sinnoh or removed by Energy disruption.

**T1 preparation:** Battle Compressor can search the deck and discard up to three cards. Discard at least one **Regidrago V** for Thorton and **M Charizard-EX** for Apex Dragon. Discarding Dragon attack payloads is beneficial, while some search connectors and ACE SPEC cards are effectively protected and may make Ultra Ball's two-card cost unusable. Guzma & Hala can sometimes discard a Regidrago V and the Dragon payload directly from hand, but doing so excludes other card preservation and pays the Supporter for that turn. Viridian Forest can fetch a Basic Grass/Fire for T2, at a further one-card discard cost. These effects compete for actual physical hand resources, so theoretical connector availability alone is insufficient.

**Second personal turn (T2):** If ADP survives, play **Thorton**, replacing that in-play Basic ADP with a Basic Regidrago V from discard. The replacement preserves the number of turns in play, damage counters, attached Double Dragon Energy and Hero's Cape. Because Regidrago V inherits ADP's first turn in play, Regidrago VSTAR may be evolved from the hand on T2 under the stated Thorton and evolution rules. Manually attach one **Basic Grass or Fire Energy**. Two Energy units supplied by Double Dragon plus the Basic make the VSTAR's printed Grass, Grass, Fire attack cost. Use **Apex Dragon** to copy Wild Blaze from the Dragon-type M Charizard-EX in discard, dealing printed 300 plus ADP's 30 damage, subject to the opposing Pokémon's modifiers. Wild Blaze discards the top five cards of the deck, so recurring 330 attacks are not resource-free.

**Prize and damage consequences when this exact line has already resolved and no preventing modifier applies:** Wild Blaze 330 can take four Prizes from a 3-Prize 320-HP Shadow Rider Calyrex VMAX, 310-HP Mew VMAX, 280-HP Mega Absol ex, or 330-HP Mega Lopunny ex; three from 280-HP Regidrago VSTAR or 230-HP Iron Thorns ex; and two from a 1-Prize 140-HP Stoutland or 130-HP Item-lock Vileplume. HP, Prize rule boxes and attacks were checked against the provided card pool. Those are **conditional tactical results**, with no frequency or win-rate claim. Haxorus's knockout effect attacks do not deal damage and therefore do **not** activate the extra-Prize clause. Hero's Cape is a single ACE SPEC that makes 280-HP ADP or Regidrago VSTAR 380 HP while attached. It can be discarded by Tool removal and cannot prevent knockout by applicable non-damage attack effects.

**Alternative lines:** If a Regidrago V starts Active, attach Double Dragon Energy on turn one, evolve on turn two and attach a Basic Energy for a rapid 300 damage without ADP's +30/Prize bonus. This works even when the GX/Thorton package is missing but still needs VSTAR access and a Dragon payload in discard. A copied Dragapult ex Phantom Dive provides 200 Active damage plus six Bench damage counters, Hisuian Goodra VSTAR's Rolling Iron gives a 200-damage defensive attack, and Noivern ex can delay Basic attacks or Special Energy/Stadium plays. Haxorus supplies two distinct situational knockout effects for targets whose damage protection or HP makes 330 damage unsuitable. Those effects cannot produce the extra Prize from Altered Creation. ADP itself can use **Ultimate Ray** for 150+30 damage and Basic Energy acceleration on T2 if its DDE remains and one other Energy is attached, a possible route to break Supporter lock before attempting Thorton.

## Source-specific adversarial cases that must be tested

| Original field | Registered hard counter and immediate falsifier |
| --- | --- |
| Rank 1 Shadow Rider Calyrex | Original printed 60 contains **Mimikyu and Dialga-GX**. The human-concepts source describes Mimikyu Copycat using Regidrago's copied Apex Dragon to select a Dialga-GX Timeless-GX attack for an extra turn. Model this actual opponent line before claiming the 330 attack is safe, including current energy, bench and remaining GX quota. |
| Rank 2 Vileplume Control | Original 60 contains AOR Vileplume Item lock, BCR Stoutland Supporter lock and Plumeria. If Item lock closes before Compressor/Ultra Ball or if Stoutland is Active on T2, the one-T1 GX / one-T2 Thorton / one-T2 Apex path can be disabled. Direct Ultimate Ray is a conditional escape if sufficient Energy and target remain. |
| Rank 6 Iron Thorns | Original source includes **four Plumeria, two Team Flare Grunt and two Enhanced Hammer**. After DDE is removed between ADP's GX and the T2 attack, one Basic attachment cannot replace two colored Energy units. Initialization also disables the chosen Rule Box draw Abilities of Tapu Lele-GX and Crobat V. An owner-visible original policy exploiting this is an especially important reject test. |
| Ranks 8, 11, 16, 22 Absol Garbodor | Each original 60 contains **two Temple of Sinnoh**, with Tool-conditional Garbotoxin also present. Temple collapses Double Dragon's colored/multiple Energy supply. **V2's two Field Blower are a targeted structural correction**: an Item can discard a Temple and Garbodor's attached Tool in the same action, without using the T2 Thorton Supporter. A second opposing Stadium after our first Viridian can still leave T2 Apex unavailable unless Field Blower is actually in hand. Opponent Item denial also defeats this answer. |
| Rank 9 Absol Electrode | Mega Absol ex has the effect knockout **Terminal Period** against an Active Pokémon with exactly six damage counters and can discard a revealed hand card with Claw of Darkness. Hero's Cape does not protect against the conditional effect knockout. Verify authentic Energy Bomb, hand disruption, and the exact T1/T2 survival window rather than assuming a benign opponent. |
| Ranks 10, 12–14, 18, 20–21, 27, 32 Regidrago | Their printed Dragon payload sets can threaten 280-HP ADP, Tool-assisted 380 HP, and Energy continuity. Their copied attacks can also impose Special Energy/Stadium or future-turn constraints. Test an adversarial mirror with both opponents using actual deck contents; a 330 attack in a favorable replay is insufficient. |
| Rank 15 Lopunny Vileplume | Original list has Vileplume evolution routes and a 330-HP Mega Lopunny ex. Exact damage threshold is favorable after GX, while a one-turn Item lock can prevent the required discard and Stage 1 acquisition. |
| Rank 26 Meloetta Donk | Potentially ends a game before the main GX turn. Test exact starting Active, mulligans, full actual starting order and legal knockout rather than granting this candidate its desired first attack. |

## Mathematical falsification: physically Prized prerequisite groups

A reproducible [BigInt exact combinatorial enumerator](../../simulation/evaluation/agent5-adp-thorton-prize-availability.cjs) conditions on a seven-card opening hand containing at least one Basic Pokémon, then treats six Prizes as physical cards taken from the remaining 53. The exact calculation enumerates the multivariate hypergeometric allocation of all groups, with each draw weighted by the number of legal Basic-containing opening hands. It does not assume that one specific ordering of cards makes a favorable hand or that the first search can always be performed.

For the **one-Wild-Blaze fixed 60**, the exact opening-conditioned chance that at least one ADP, Regidrago V, Regidrago VSTAR, DDE, Thorton and the singleton Wild Blaze payload all remain **outside Prizes** is **0.8914309022096687**. If the singleton Hero's Cape must also be unprized, it is **0.7994542679885778**. Those are necessary identity-access conditions for the proposed immediate line. They are **optimistic ceilings on that particular pre-Prize-draw chain**, before requiring ADP to be Active, any Item, discard target, Supporter, Stadium, Energy attachment, T2 evolution, opponent survival, or a Wild Blaze attack. They are neither turn-two setup probabilities nor win rates.

The singleton M Charizard-EX is physically Prized in **about 10.1159%** of legal-Basic-opening hands. An **unregistered structural counterfactual** replacing the sole VS Seeker with a second Wild Blaze printing raises the necessary six-identity unprized probability to **0.9834075364307595**, while removing a potentially important Supporter-recovery route. This isolated mathematical improvement cannot establish that the swap improves games. The original 60 and the v2 60 both retain the single Wild Blaze. A second payload is worth a prespecified physical/prize-access comparison when qualified simulation can distinguish the costs.

A separate exact seven-card calculation gives **36.85746%** as the chance that a legal opening hand contains ADP when the list has two ADP and seven total Basic Pokémon. A forced initial non-ADP Active needs a Switch, retreat, or other actual Active-promotion line to execute the T1 GX. This is a major measurable setup risk and motivates testing an additional ADP against alternative resource slots, rather than silently assuming Tag Call moves ADP to Active.

## Required admission and experimental contract

1. **Text/rules demonstration:** Validate, with the original pinned Twinleaf Store and independent printed text, the full live GX with one DDE, the lasting extra-Prize flag, the Thorton swap preserving original turns and DDE, legal T2 Regidrago VSTAR evolution, Apex Dragon copying the actual discarded M Charizard-EX, and attack resolution + five-card mill. A failure here blocks any strategic claim. Read-only card-text tests are a preflight only.
2. **Paper cost and counterexamples:** Prove actual two-card Guzma & Hala discard, 2-card Ultra Ball discard, Item lock, Thorton one-Supporter contention, available board slots and Energy timing under Temple/Plumeria. Record the first failing action with owner-visible legal alternatives; do not substitute scripted card arrival, artificial hand setup or direct post-Store injection for a natural deal.
3. **Frozen equal policy:** Against the champion 60 and New Moon 60, compare this *exact v2* under the same frozen, owner-visible, competent two-player policy. Register actual opponent printing, candidate slot, seed, first-player choice and full source physical deals before examining outcomes. A shared PRNG seed alone does not guarantee an identical source setup after changing the candidate's cards and mulligans. Report full physical-deal fingerprints and avoid paired deltas for unmatched deals.
4. **Adversarial hard cluster first:** Predeclare sufficient both-seat, both-start trials on original ranks **1, 2, 6, 8, 9, 10, 11, 15, 16, 22, 26**, then independently admit **all 32** original opposing sixties, including ranks 23, 25, 28 only after they are authenticated. Preserve every action cap, engine failure, illegal prompt, paper violation, clock and absent game. Identify each concrete opponent line that defeats the plan; do not censor it from the denominator.
5. **Competitive game judgment:** Only after source-owned opponent competence, complete paper-card interactions, full Prize handling, both physical seats and official event-time game adjudication are independently qualified may a game enter a win-rate estimate. Paired contrasts should use genuinely matched physical opponent deals and carefully account for differing candidate draws and policy decisions. Nothing in this packet is a verified win or a candidate promotion.

## Current decision

**Retain v2 as a falsifiable distinct proposal, with no proof of superiority.** The v1→v2 two-card response to the actual Temple/Garbotoxin cluster has specific source grounding and a testable opportunity cost. The one-off M Charizard Prize risk, DDE energy-denial chokepoint, low native GX-ready opening frequency, and rank-1 copied extra-turn threat are substantial reasons for skepticism.

The code and reports introduce an independent whole-deck hypothesis while the shared release engineers continue to qualify real games. Do not elevate this candidate to the current strongest-deck index until a prospective, paper-correct evaluation justifies that judgment. The global benchmark remains **29/32 authenticated original lists and zero competitively qualified games**.
