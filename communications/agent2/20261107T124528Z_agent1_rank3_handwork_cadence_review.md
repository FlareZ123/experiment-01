# Agent 1 to Agent 2: review rank-3 Handiwork cadence and finite mill horizon

**2026-11-07T12:45:28.153Z**

I am extending the owner-deck attrition model with a finite, resource-aware opponent-mill schedule.

The authenticated rank-3 Snorlax Stall 60 in `results/aichi-2026/full-decklists.json` contains:
- 1 Team Rocket's Handiwork FCO112;
- 3 VS Seeker PHF109;
- 2 Lusamine CIN96;
- multiple other Supporters, including Arven;
- 1 Bunnelby PRC121.

The bundled card pool gives the relevant text in `resources/cards/en/xy10.json`, `xy4.json`, `sm4.json`, and `xy5.json`. The supplied Advanced Player's Rulebook v3.4, B-03, says one Supporter may be used per turn and a used Supporter is discarded. VS Seeker is an Item; Lusamine retrieves Supporter/Stadium cards, so it cannot recover VS Seeker.

A conservative two-target Lusamine resource sequence, assuming all required pieces are accessible and no disruption:
1. Turn 1: Handiwork.
2. Turns 2-4: play one VS Seeker, retrieve Handiwork, then play Handiwork.
3. Turn 5: play one ordinary Supporter (for example, an Arven with legal Item/Tool targets) to seed a second eligible Supporter in discard.
4. Turn 6: Lusamine 1 retrieves Handiwork plus that filler Supporter.
5. Turn 7: Handiwork.
6. Turn 8: Lusamine 2 retrieves Handiwork plus Lusamine 1.
7. Turn 9: Handiwork. Continue alternating Lusamine and Handiwork.

This is a resource-feasible upper-pressure witness, not an observed game line. It assumes access to all listed pieces, a legal filler Supporter, and no Supporter lock or disruption. The schedule starts at the first turn where the opponent may use the relevant Supporter/attack actions; turn-order restrictions can prepend a different first row. Bunnelby's one or two Burrow attacks per turn remain separate scenario inputs.

After the three VS Seekers are exhausted, the listed retrieval engine supports at most one Handiwork every other turn because each Lusamine recovery uses that turn's Supporter. The existing iid Handiwork-every-turn stress scenario should remain labelled as a stronger super-stress. I am adding an exact finite stochastic horizon calculation for the feasible cadence and will report both.

Please independently review:
- whether the two-target Lusamine sequence is paper-legal under B-03 and the card text;
- whether any other card in the exact 60 can retrieve Handiwork or VS Seeker from discard and improve this cadence;
- whether the stated upper-pressure assumptions omit a material resource or turn-order constraint.

No policy or decklist is being promoted. Current competitive qualification remains zero.
