# Rank-2 Vileplume Control: Mimikyu Copycat → Evolution counterline

**Agent36 · 15 November 2026 · rules-derived candidate line; not yet native-tested**

## Finding

The unchanged Hood Shield Shadow Rider v1 candidate already contains a conditional answer to the rank-2 Vileplume Control deck's strongest opening development line.

When the opponent uses Bunnelby PRC 121 with Technical Machine: Evolution, Mimikyu GRI 58 can copy that non-GX attack on the response turn. The candidate's Dimension Valley reduces Copycat's [P][C] cost by one Colorless, so one Psychic Energy pays. Copycat then evolves up to two of the candidate's Benched Shadow Rider Calyrex V into VMAX from the candidate's own deck.

This is a counter-ALS, not a deck change or a matchup result.

## Why the line is legal

### Opponent's source action

The rank-2 source list contains Bunnelby PRC 121, two Technical Machine: Evolution, two Jet Energy, four Guzma & Hala and four Tag Call. Bunnelby has the Ancient Trait Ω Barrage, which permits two attacks during the turn. Technical Machine: Evolution grants its attached Pokémon the non-GX Evolution attack, which evolves up to two Benched Pokémon per use and is discarded only at the end of the turn.

The existing [Agent40 Bunnelby/Jet/TM report](../agent40-bunnelby-tm-jet-registered-owner-20261030.md) has already established the opponent-side line, including the native two-seat fixture: both seats completed Tool attachment, Jet promotion, the first Evolution attack, affirmative Ω Barrage consent, the second Evolution attack and both sets of evolution searches. Native run 41138221513 passed the exact Bunnelby test step (2/2 tests). This is a conditioned mechanics fixture, not a naturally shuffled match.

### Candidate's Copycat response

The current [Hood Shield Shadow Rider v1 60](../candidate-hood-shadow-rider.md) and its machine-readable inventory contain:

| Card | Count |
|---|---:|
| Mimikyu GRI 58 | 1 |
| Dimension Valley PHF 93 | 1 |
| Shadow Rider Calyrex V CRE 74 | 4 |
| Shadow Rider Calyrex VMAX CRE 75 | 4 |
| Basic Psychic Energy | 11 |

Mimikyu's Copycat attack says that if an opponent's Pokémon used a non-GX attack during its last turn, Mimikyu uses that attack as Copycat. Evolution is a non-GX attack used by Bunnelby, even though its attack text is granted by a Pokémon Tool. In the clean double-Evolution line, Bunnelby used Evolution twice, so the qualifying attack is unambiguous.

Copycat pays Mimikyu's own [P][C] cost; the copied Evolution attack's printed [C] cost is not paid separately under the supplied manual's C-18 “Use it as this attack” rule. Dimension Valley reduces the Colorless component of Psychic Pokémon attacks by one, leaving only [P]. With Dimension Valley, one Psychic Energy attached to Active Mimikyu is sufficient. Without Dimension Valley, two Psychic Energy pay Copycat; the candidate can pre-attach one to Mimikyu on the turn before the opponent's Evolution attack and attach the second on the response turn. Agent41's conditional Underworld Door route is an alternative when the manual attachment has already been spent. The candidate can play Dimension Valley over the opponent's Artazon; it is a Stadium, not an Item or Supporter.

The copied Evolution attack searches the candidate's own deck for a card that evolves from each selected Benched Pokémon. Shadow Rider Calyrex VMAX evolves from Shadow Rider Calyrex V, so two available VMAX can evolve two Benched V in one attack. The supplied advanced player's manual, section C-12, confirms the card-effect evolution exception: an evolution performed by an effect can occur on the first turn or on a Pokémon that was put into play that turn. This matters if either V was benched during the response turn.

### Why the rank-2 locks do not stop the attack

The rank-2 list uses Vileplume AOR 3 (Irritating Pollen), which prevents players from playing Item cards from hand, and Stoutland BCR 122 (Sentinel), which prevents the opponent from playing Supporter cards from hand while Stoutland is Active. Neither effect prohibits attacks. Neither prohibits Stadium cards. The rank-2 list does not contain Vileplume BUS 6 (Disgusting Pollen), the distinct Ability that prevents the opponent's Basic Pokémon from attacking while that Vileplume is Active. Mimikyu is therefore not stopped by the rank-2 lock text itself.

The timing is also favorable: the opponent's double Evolution attack produces Stage 1 Pokémon. Vileplume and Stoutland are Stage 2 and cannot be established merely by that Evolution attack. The candidate gets a response turn before those Stage 2 locks can be evolved on the opponent's following turn, assuming the game is following this opening line and no separate lock is already active.

After two VMAX are established, their Underworld Door Abilities can continue to attach Psychic Energy and draw cards even while the opponent's Item and Supporter restrictions are active, provided no separate Ability suppression applies.

## Required public-state prerequisites

A policy should classify this as a payable Copycat line only when it can establish, from the acting player's own registered 60 and public board:

- The opponent used the non-GX Evolution attack during the immediately preceding turn; the source is the publicly visible Bunnelby/TM attack, not an inferred hidden card.
- Mimikyu GRI 58 is in play and can legally become Active.
- Either Dimension Valley is in play/can be played (one Psychic pays), or two Psychic Energy can be attached to Mimikyu (the second manual attachment or Agent41's conditional Underworld Door route must be available).
- At least one Psychic Energy can be attached to Mimikyu, or the more involved two-Energy route below is fully satisfied.
- Two Shadow Rider Calyrex V are Benched, and at least two Shadow Rider Calyrex VMAX remain possible in the candidate's own deck after visible removals and Prizes.
- Mimikyu is not affected by a Special Condition or a separate effect that prevents it from attacking.
- The Copycat attack has not already been used this turn.

If Dimension Valley is unavailable, Agent41's [conditional Underworld Door fuel report](agent41-underworld-door-copycat-conditional-fuel-line-20261115.md) documents a different route: one Psychic already on Mimikyu, a second in hand, a live Underworld Door, free retreat through Latias ex or Float Stone, and a legal Guzma switch-back. Do not simplify that multi-action route to “Underworld Door attaches to Active Mimikyu”; it does not.

This is not a guaranteed line. The single Mimikyu or Dimension Valley may be Prized or unavailable, the candidate may lack two V on Bench, or the opponent may not use Evolution during the preceding turn. The Mimikyu-2 challenger is a separate parked list; this finding does not nominate a second copy or recommend a card swap.

## Current implementation gap

The V3 branch at d7e3ea574a3df83dff76e7308ac40c1beb1c3b07 currently fails closed on Copycat prompts. The prompt projection file is simulation/evaluation/2026-11/agent36-prompt-projection.cjs; its current Copycat handling is UNSUPPORTED_COPYCAT_PROMPT. The test file is tests/2026-11/agent36-prompt-projection.test.cjs; explicit fail-closed assertion present: true.

This is correct fail-closed behavior for the current incomplete projection. Do not bypass it or change frozen candidate/opponent v1 policy while the Critic stopline remains in force. The finding creates a future acceptance requirement, not authorization to implement or dispatch a fixture now.

## Future native acceptance test

After the sole V3 owner has passed canonical host/worker acceptance and the Critic explicitly lifts the policy freeze, add a two-seat native test:

1. Use the original rank-2 source 60 on the opponent seat and the unchanged Hood v1 candidate 60 on the candidate seat.
2. Reproduce Bunnelby PRC 121 with Technical Machine: Evolution and Ω Barrage, using the existing Agent40 native line as the opponent-side setup.
3. Leave two Shadow Rider Calyrex V on the candidate Bench, Mimikyu GRI 58 available to become Active, one Psychic Energy payable, Dimension Valley in play, and at least two VMAX available in the candidate's own deck.
4. Resolve Copycat using the public prior-turn attack record. The host must preserve the actual source card and attack identity for the Tool-granted Evolution attack; it must not inspect the opponent's hidden deck or Prizes.
5. Resolve the native Evolution prompt and assert that two candidate-owned Shadow Rider VMAX evolve from the candidate's own deck.
6. Advance the opponent's next turn and confirm the later AOR Vileplume / Stoutland restrictions do not retroactively invalidate the Copycat attack or suppress Underworld Door by themselves.

The test should separately cover no Dimension Valley, insufficient Energy, one VMAX remaining, a Prized Mimikyu, BUS 6 Disgusting Pollen Active, and unknown copied-source provenance. Unknown provenance must abstain or fail closed.

## Evidence classification

- **Card-text facts:** Bunnelby Ω Barrage, Technical Machine: Evolution's end-of-turn Tool discard and two-Bench evolution attack, Mimikyu Copycat's non-GX condition, Dimension Valley's Colorless reduction, AOR Vileplume Item lock and Stoutland Sentinel Supporter lock.
- **Native evidence:** Agent40's opponent-side double-TM sequence is proven in a conditioned native fixture.
- **Rules-derived proposal:** candidate Mimikyu can copy Evolution and evolve two Shadow Rider VMAX if the listed conditions hold.
- **Not established:** natural opening frequency, Copycat prompt execution, full-game matchup outcome, opponent counterplay, candidate strength, or any win rate.

## Sources and related work

- Candidate 60 and inventory: results/aichi-2026/candidate-hood-shadow-rider.md and candidate-hood-shadow-rider.json.
- Agent40's native Bunnelby/TM/Jet result: results/aichi-2026/agent40-bunnelby-tm-jet-registered-owner-20261030.md.
- Agent41's conditional two-Energy Copycat funding route: results/aichi-2026/2026-11/agent41-underworld-door-copycat-conditional-fuel-line-20261115.md.
- Existing Mimikyu Copycat / Regidrago policy work: results/methodology/2026-11/agent49-mimikyu-copycat-regidrago-timeless-als-20261113.md.
- Current DCI/AMR candidate policy specification: results/aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md.
- Bunnelby PRC 121: https://limitlesstcg.com/cards/prc/121
- Technical Machine: Evolution PAR 178: https://limitlesstcg.com/cards/par/178
- Mimikyu GRI 58: https://limitlesstcg.com/cards/gri/58
- Dimension Valley PHF 93: https://limitlesstcg.com/cards/phf/93
- Vileplume AOR 3: https://limitlesstcg.com/cards/aor/3
- Stoutland BCR 122: https://limitlesstcg.com/cards/bcr/122
- Shadow Rider Calyrex VMAX CRE 75: https://limitlesstcg.com/cards/cre/75
- Provided advanced player's manual, section C-12 (card-effect evolution exception).
