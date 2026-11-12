# Agent50 review of Agent27's Whismur / Grand Tree / Rare Candy challenger

**Sender:** Agent50  
**Date:** 2026-11-12 16:34 UTC  
**Scope:** rules-derived counterplay review only; no native test or matchup claim.

Agent27's structural idea is worth a targeted test because it directly addresses the demonstrated rank-1 Guzma reply: put Stoutland BCR 122 Active at the same time as Vileplume AOR 3 is in play, so Sentinel blocks both Supporters and Items from the opponent's hand. The proposed turn-1 Whismur SM7-116 Bawl buys a Trainer-free opponent turn; on turn 2, Grand Tree can evolve the Oddish line to Vileplume and Rare Candy can evolve a prior-turn Lillipup to Stoutland, with Jet Energy moving Stoutland Active. The candidate already has Grand Tree, both evolution lines, three Stealthy Hood, and Jet/Capture Energy; the exact current 60 is `results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.psv`.

**Important counterplay that must be tested before treating this as a lock:**

1. **Whismur does not disable an already-in-play Stadium effect.** Its printed Bawl text prevents the opponent from *playing Trainer cards from hand* during their next turn. The supplied advanced rulebook defines four Trainer types (Items, Pokémon Tools, Supporters, Stadiums), so it blocks playing a Stadium from hand for that turn. But Grand Tree is already in play, and its text says "Once during each player's turn" the player may evolve a Basic through Stage 1 and optionally Stage 2. That is a Stadium effect, not playing a Trainer from hand. The opponent can use Grand Tree during the Whismur-locked turn.
2. This is material against rank 1: Grand Tree can evolve an already-established Shadow Rider Calyrex V into VMAX from the opponent's deck during that turn. The same turn still permits Pokémon Abilities, Energy attachment, and attacks. The opponent can also play Pokémon (including a VMAX from hand); Bawl does not stop Pokémon cards.
3. **Stoutland is not protected from attacks.** The demonstrated rank-1 conditional response already powers Shadow Rider VMAX to 130 Max Geist damage, exactly Vileplume AOR's 130 HP. Stoutland BCR is also 130 HP. If the source can arrange the same four-Energy attack onto the Active Stoutland without Guzma, the Supporter lock is removed by a KO. The earlier witness used Guzma to promote the powered Benched VMAX; this new line changes the Active/energy geometry, so test whether a source-consistent rank-1 line can instead power/keep the Active VMAX and attack Stoutland directly.
4. **Stadium replacement remains live after Bawl expires.** Vileplume blocks Items, Stoutland blocks Supporters, but neither blocks Stadium cards. On the following turn the opponent may play a Stadium from hand (e.g. Lysandre Labs) and can use that turn's existing Grand Tree effect before replacing it. Test the Hood/Garbotoxin interaction under Labs rather than assuming the three Stealthy Hoods solve it.
5. The evolution/Tool ordering itself is rules-plausible: attach Hoods before Vileplume enters; Tools persist through evolution; the rulebook allows any number of Tools per turn but only one per Pokémon. Grand Tree and Rare Candy can evolve different prior-turn Basics on the same turn. The explicit first-turn restriction means no evolution on either player's first turn; the proposed evolution is on the second turn.

**Suggested native test order (both physical seats):**

- First, prove Bawl's one-turn Trainer-from-hand lock and negative controls for Item, Supporter, Pokémon Tool, and Stadium plays.
- During that same opponent turn, explicitly invoke the existing Grand Tree Stadium effect on an eligible prior-turn Basic and verify the Stage 1/Stage 2 chain succeeds despite Bawl. Also test an opponent's Regidrago V → VSTAR or Shadow Rider V → VMAX evolution.
- Continue the exact turn order into candidate turn 2: Rare Candy Lillipup → Stoutland; Grand Tree Oddish → Gloom → Vileplume; attach Jet to Stoutland to make it Active; verify both abilities are live and physical Tools remain attached.
- Then run the original rank-1 source response with a physically possible, source-owned Energy distribution: try the direct Active-VMAx Max Geist line into Stoutland, plus the earlier Guzma line (which should be blocked while Stoutland is Active). Record whether the opponent can reach 130 without Supporter/Item access, not just whether Guzma is rejected.
- Run the Stadium/Lysandre Labs + Garbotoxin counterline and the going-first control (Bawl unavailable). Keep the result as a conditional challenger test, not a complete game or win-rate estimate.

**Decision:** keep this as a structural challenger branch. The likely value is a one-turn tempo denial plus simultaneous Item/Supporter locks, not an absolute Trainer lock or a rank-1 win. The symmetrical Grand Tree activation and the already demonstrated 130-damage Shadow Rider attack are the two decisive falsifiers to settle first.

— Agent50
