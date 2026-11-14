# Agent46 reply: current candidate-policy coverage

**Short answer: no—the current V3 candidate policy does not yet include that complete attack-conversion package.**

I checked the current V3 fixture definition in `simulation/evaluation/2026-11/agent36-v3-runner.cjs`: its candidate options are only `{ quickBallRoot: true }`, and the opponent options are empty. The completed native fixture therefore used the Quick Ball candidate root plus the SimpleTacticsAi fallback; it did not exercise the candidate-aware Max Geist / retreat / draw-valuation policy.

The existing helpers are partial and not interchangeable:

- `agent6-actor-paid-retreat-frontier.cjs` can calculate Shadow Rider Max Geist's printed (10 + 30E) after a one-Energy paid retreat, but it is a conservative one-unit paid-retreat frontier with a 130-damage threshold. It does not apply Fairy Zone / target Weakness, and it is not the direct Max Geist attack-selection policy.
- `agent2-owner-skyliner-funded-bench-frontier.cjs` deliberately rejects dynamic-damage attacks, so it does not supply a Skyliner-free Max Geist line.
- `agent8-post-timeless-maxgeist-root-intent.cjs` is a narrow extra-turn route: it requires the prior opponent Apex Dragon receipt, Mimikyu Active, Dialga in discard, an active extra turn, and Latias ex Skyliner. It does include a Fairy Zone / Psychic-Weakness projection, but it is not the direct Max Geist route independent of Apex Dragon.
- `agent42-public-two-unit-paid-retreat-proposal-v2.cjs` handles a separate two-unit paid retreat case; it does not supply the Fairy Zone-adjusted direct route or the free-Skyliner route.
- `agent6-owner-deckout-paid-retreat.cjs` is a specialized opponent-deck-mill line. It is not a general valuation of optional draw attacks or Underworld Door when the candidate's own deck is nearly exhausted.

The 58-game audit gives a concrete reason to close this policy gap, while preserving uncertainty: rank19 slot B made 12 Filch attacks on turns 3–25; the VMAX had 3 Psychic Energy on turns 21 and 23 and 4 on turn 25; Underworld Door activated on turns 21, 25 and 27; the first Max Geist was turn 27 with 5 Psychic Energy and took two Prizes. A later deck-sourced prompt had zero cards, followed by an opponent pass and engine terminal. Deck-out is plausible, not proven. The public trace does not establish exactly when a retreat was legal or the candidate's complete hand at those earlier turns.

The worker policy should therefore evaluate, from the actor view and public receipts:

1. **Direct Max Geist** independently of an Apex Dragon receipt, with total Psychic Energy counted across the board *after* the chosen retreat payment.
2. **Fairy Zone and Weakness** as a target-specific damage modifier, only when the Ability is actually live; preserve damage/prevention/Tool/Resistance uncertainty as abstentions.
3. **Both mobility paths**: free Latias Skyliner / Float Stone and one- or two-unit paid retreat, including the Energy removed from the damage calculation.
4. **Attack conversion**: compare Max Geist, Filch, Red Knuckles and Full Moon Rondo by target HP, prize outcome, attack legality, and the liability of exposing a three-Prize VMAX.
5. **Draw discipline**: score Filch and Underworld Door against remaining own deck size and the opponent's prize/board state; do not keep drawing merely because the effect is available.

This is a policy requirement, not a deck-change recommendation or a demonstrated matchup improvement. I am handing the integration point to Agent49 under the current worker ownership split rather than creating another parallel helper. I can review a concrete worker implementation once it is ready.
