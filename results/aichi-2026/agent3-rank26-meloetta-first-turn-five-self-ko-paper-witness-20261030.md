# A conditional complete paper first-turn Meloetta Donk using three Damage Pumps and two reusable Exeggcute

**Agent 3 | 30 October 2026 | deterministic printed-card state witness, NOT a randomly dealt native game, real opponent policy, or demonstrated donk rate.**

## Advancement from the earlier risk hypothesis

The [rank26 setup risk](agent3-meloetta-donk-lone-basic-setup-risk-20261030.md) established that losing the only Active Pokémon before a candidate's first turn ends the game. It had not established whether the original 60 could really grant the opposing candidate **five Prize cards** and then attack for 280 on the same first player-owned turn.

We now have an **explicit 21-action paper state-transition witness** backed by a [runnable CommonJS source-state checker](../../scripts/agent3-rank26-paper-donk-witness.cjs) and [three pure regression groups](../../tests/agent3-rank26-paper-donk-witness.test.cjs). These prove the *listed card-effect sequence can satisfy the stated card/resource/Bench/Prize constraints* **if the source has already made all required card identities accessible on its first turn**. The 21 decisions were checked with a V8 pure test harness, the source's printed 60, and the supplied Advanced Player's Rulebook. The original pinned Twinleaf Store has **not accepted or resolved these actions**, and the source has not demonstrated that it can actually find them quickly enough from an authentic deal. Do not count it as a gameplay win or first-turn donk frequency.

### Exact original source resources needed

Rank26, Hibiki Yamada: one **Active Bunnelby PRC121**, one Benched **Meloetta ex BLK44** and **Tapu Koko ◇ TEU51**, two distinct **Exeggcute PLF4**, one **Unown AOR30**, one **Risky Ruins MEG127**, three of its four **Damage Pump LOR156**, one of four **Battle Compressor PHF92**, both printed **Basic Lightning Energy**, the single **Double Colorless Energy SUM136**, one of two **Technical Machine: Crisis Punch PAF90**, and its single **Escape Rope BST125**. Every physical copy exists in the authenticated original sixty. A hypothetical candidate has **only Active Frillish WHT44 (80HP)**, no Bench and no protection effects.

Source has chosen to go **first**, its first valid seven includes Bunnelby and it has selected Bunnelby Active with no pregame Bench. All necessary other cards are assumed reachable in hand/deck/discard through earlier legal first-turn actions. The witness **does not establish** this hand/search probability, its supporting draw tree or tournament clock feasibility; it is a conditional line feasibility test.

## Printed-effect sequence

1. Play **Risky Ruins** before placing source Basics onto the Bench. Bench **Meloetta ex**, **Tapu Koko ◇**, **Exeggcute A** and **Exeggcute B**. Each is a Basic non-Darkness Pokémon so Risky Ruins places **two damage counters** on each; Exeggcute has only **30HP**, so it is not knocked out yet. Source Bench holds four Pokémon.
2. Play **Damage Pump #1**, moving **one damage counter from Meloetta to each Exeggcute**. Both reach 30 damage and are Knocked Out, so candidate takes **two Prize cards** (remaining four). Meloetta is now uninjured. Source Bench has two Pokémon.
3. Use each newly discarded Exeggcute's **Propagation** to return it to hand, then play both from hand onto Bench. Risky Ruins gives each two damage counters again. Play **Damage Pump #2**, moving **one damage counter from Tapu Koko to each egg**. Both are Knocked Out, candidate takes **two more Prizes** (remaining two). Tapu Koko is now uninjured. Source Bench again has two Pokémon.
4. Recover **Exeggcute A** from its new discard incarnation with Propagation; put it onto Bench (two damage counters). Put **Unown** onto Bench after Risky Ruins so Unown also receives two damage counters. Play **Damage Pump #3**, moving **one damage counter from Unown** to Exeggcute A, Knocking it Out for the **fifth** candidate Prize, leaving candidate **exactly one Prize**. Unown retains 10 damage. Source Bench never held more than four Pokémon at once.
5. Play **Battle Compressor** to put both Basic Lightning Energy from deck into discard, assuming both were still searchable. Use Tapu Koko's **Dance of the Ancients**, selecting the **two distinct Benched Pokémon** Meloetta and Unown. Attach **one Lightning Energy to each**, then put Tapu Koko into the Lost Zone. Crucial printing detail: Dance does **not** put both Lightning on Meloetta.
6. Make the turn's **one manual Energy attachment**: attach Double Colorless Energy to Benched Meloetta. Its Lightning + Double Colorless now supplies **three total Energy units**. Attach **Technical Machine: Crisis Punch** to Meloetta.
7. Play the one **Escape Rope**. Candidate with no Bench cannot switch; source with Benched Meloetta switches its Active Bunnelby to the Bench and promotes Meloetta. The full text expressly permits one player to switch when the other player has no Bench. Under **Debut Performance**, Meloetta ex may attack on the first player's first turn.
8. Candidate has **exactly one Prize card remaining**, so Meloetta may use the TM's **Crisis Punch** for **280 damage**. Candidate's lone Frillish has 80HP and no damage prevention, so it is Knocked Out; source takes one Prize and wins because the candidate now has **no Pokémon in play**, despite five candidate Prizes already taken.

### Exact program ledger, conditioned on card access

| Verification | Result |
| --- | --- |
| Exeggcute Knock Outs from successive Damage Pumps | **2 + 2 + 1 = 5** |
| Candidate Prize cards remaining immediately before Crisis Punch | **1** |
| Source Damage Pump copies consumed | **3 of 4** |
| Source Battle Compressor, Risky Ruins, Escape Rope consumed | **1 each** |
| Basic Lightning accelerated from discard | **1 to Meloetta + 1 to Unown** |
| Source manual attachment | **1 Double Colorless** |
| Attacking Meloetta's Energy units | **3 Colorless-equivalent** |
| Maximum occupied source Bench spaces during sequence | **4 of 5** |
| First-turn attack from the chosen Active | **Meloetta ex, 280 Crisis Punch damage, conditional on live Debut Performance** |
| Candidate Pokémon in play after Knock Out | **0**, giving source immediate game win |

The source state's 21 recorded receipts preserve source Active/Bench identities, Prize counts, source discard and Lost Zone, and Meloetta's Energy at each step. The source has **no played Supporter** so the going-first Supporter prohibition is respected; only one Stadium and one normal Energy attachment are used. All effects happen before the ending attack.

**Propagation zone-reset requirement:** the same physical Exeggcute is used for successive KO/return cycles. This is legal under the 2013 TPCi ruling quoted in a [PokéBeach 2014 discussion](https://www.pokebeach.com/forums/threads/exeggcute-propagation-question.119787/) and general once-per-zone rules: after Propagation returns a card from discard, its next entry into discard is a new game object, permitting that specific Ability again. A contrary machine-readable card guide claims “once per player per turn”; its summary is inconsistent with the earlier TPCi ruling and this must be checked against authoritative 2026 rules in native execution before certifying a true match.

## A hard first-turn card-access burden still separates paper feasibility from execution

The exact witness uses **14 distinct physical source card slots** which must become usable at some point in the source's first turn: 1 Bunnelby (starting Active), 1 Meloetta, 1 Tapu Koko, 2 Exeggcute, 1 Unown, 1 Risky Ruins, 3 Damage Pump, 1 Battle Compressor, 1 DCE, 1 TM Crisis Punch and 1 Escape Rope. The two Basic Lightning are additional distinct source physical cards which the witness assumes **remain searchable in deck** for Battle Compressor to move to discard. Since the source gets **only 7 starting hand cards plus one ordinary turn draw**, this precise line requires **at least six more card acquisitions** via legal search/draw/Abilities during its first turn, even if every original hand slot is already useful. More accesses may be necessary when search cards demand discards or particular costs. It is therefore impossible to execute the exact witness from its original 7+1 cards alone without any additional search/draw.

The six random source Prize cards independently threaten the line's critical energy and counter Item: [joint exact Prize analysis](agent3-rank26-cologne-dce-prize-hard-gates-20261030.md) gives **72.483928%** for the one DCE and **both** Basic Lightning to survive source's six Prizes, and **64.854040%** for those three cards **plus** the one Canceling Cologne needed in this line against lone Mimikyu or Iron Thorns. These are *necessary card-location events for the specific witness*, not source deck win probabilities or proof that alternative acceleration is impossible.

## Outstanding realism and opponent counter gates

1. **Finding all pieces in a real first-turn source hand is difficult:** one Bunnelby Active, one Melo ex, one Tapu ◇, two Exeggcute, one Unown, one Stadium, three Damage Pump, one Compressor, both Lightning *unprized and searchable*, a DCE, a TM and Escape Rope. The source has 4 Quick Ball,4 Trainers' Mail,4 Battle Compressor,3 Order Pad,4 Unown draw Abilities, Squawkabilly ex, Crobat V, Dedenne-GX and its other source cards. Simulating their actual access and competition is a separate problem; no win-rate or turn1 execution estimate is claimed.
2. **Candidate's chosen sole Active identity matters.** Lone Mimikyu PAF37's Safeguard prevents Crisis Punch damage from Meloetta ex; lone Iron Thorns ex TWM77's Initialization suppresses Meloetta ex's Debut Performance first-turn attack permission. The original one **Canceling Cologne ASR136** can disable either opponent Active Ability if accessible. Its separate [exact limited search study](agent3-rank26-safeguard-thorns-cologne-singleton-gate-20261030.md) found direct first-eight Cologne **12.659263%**, rising to **29.627342%** with specific held Mail and Order Pad probes, but did not show ability use, other source draw/search, payment or an actual game. A candidate second setup Basic prevents single Active Knock Out from immediately eliminating all its Pokémon, even though it can invite Counter Catcher or Guzma in other matchups.
3. **Twinleaf/store qualification is absent.** Need one pinned original rank26 source-first staged **accepted action transcript** with real six-Prize conservation, all five self-KO Prize receipts, full Ability reuse, exact source Bench and Energy, source's actual first-player attack permission, and true opponent removal. Then test real initial-deal success/failure and source policy without retrospectively selecting rare wins. If the simulator cannot implement some printed effect, preserve the first physical error rather than transferring this paper result to game strength.

**Decision:** the original rank26 archetype has a coherent **conditional** physical first-turn lethal route using its registered 60, overcoming the earlier uncertainty about five self-KO and Energy distribution. This makes its threat worth a genuine negative control for all candidate starters, while **not** establishing that the donor+draw combo is consistently realizable. The global fixed-60 objective still has **29/32 authenticated opponent sixties, zero competitively qualified games and no demonstrated 99.5%**.
