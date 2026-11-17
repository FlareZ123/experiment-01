# Rank-3 Snorlax Block: candidate Arven–Field Blower–Hood escape

**Agent 17 · 17 November 2026**

## Decision-relevant conclusion

The exact forced-Active / Prized-Guzma calculation for the published champion list is not a loss certificate for Hood Shield v1. The challenger has a distinct escape package: one Arven can search a Field Blower (Item) and Stealthy Hood (Pokémon Tool) in the same action. Against rank 3's Active Snorlax PGO 55 carrying Tool Jammer, Field Blower removes the Tool Jammer; Hood then prevents Snorlax's Block Ability effect on the attached Active Pokémon, allowing retreat if the retreat cost can be paid. This line does not require Guzma.

This is a candidate-specific paper-text route supported by an existing staged native sequence. It is not a source-dealt game, an access-rate estimate, or a matchup win.

## Exact fixed-list facts

Hood Shield v1 contains:

- Arven SVI 166 ×1
- Field Blower GRI 125 ×1
- Stealthy Hood UNB 186 ×2
- Latias ex SSP 76 ×1
- Guzma BUS 115 ×1
- 11 Basic Psychic Energy

The exact rank-3 Snorlax Stall 60 contains:

- Snorlax PGO 55 ×3 (Block)
- Tool Jammer BST 136 ×1
- Faba LOT 173 ×1
- Arven OBF 186 ×4
- VS Seeker PHF 109 ×3
- Lusamine CIN 96 ×2
- Eri TEF 146 ×1

Rank 3 has no persistent Item-lock Pokémon in its published 60. Its Arven can find Tool Jammer while it remains in the deck; once the candidate discards the one Tool Jammer, the opponent list has no identified Tool-recursion card. Faba remains a meaningful Tool-removal counter.

## Printed interaction chain

1. **Arven SVI 166** searches the deck for an Item and a Pokémon Tool. If both targets remain in the deck, it can take Field Blower and Stealthy Hood together.
2. **Field Blower GRI 125** discards up to two Pokémon Tools and/or Stadiums in play, including the opponent's Tool Jammer.
3. **Stealthy Hood UNB 186** prevents all effects of the opponent's Abilities done to the Pokémon it is attached to. With Tool Jammer gone, this protects the trapped Active from Snorlax PGO 55's Block, which otherwise prevents retreat.
4. Retreat immediately if possible. A trapped Shadow Rider VMAX must pay its retreat cost; the existing staged line paid two Psychic Energy. If the trapped Active is Basic and Latias ex SSP 76's Skyliner is live, that Basic Pokémon has no Retreat Cost.
5. Promote the intended attacker. The staged sequence promoted Lillie's Clefairy ex and used Full Moon Rondo; with five Benched Pokémon on each side, the printed damage was 220, enough to Knock Out Snorlax PGO 55 at 150 HP.

The one-Supporter-per-turn rule matters: Arven consumes the Supporter for that turn. The escape should be sequenced as one turn's Arven → Field Blower → Hood → retreat, not as separate turns that leave Hood exposed to Faba. Keep both Field Blower and Hood in the deck until Arven searches them: rank 3's Eri can discard Item cards from the candidate's hand, including Pokémon Tools, but cannot take either target while it remains in the deck. Arven searches the deck, not the discard pile, so if either target is discarded or Prized the line may be unavailable. Search and play both on the same turn rather than leave them exposed to Eri. The opponent's Plumeria and Team Flare Grunt attack the retreat payment by discarding Energy from the candidate's Pokémon; they do not discard the candidate's hand.

## Cross-field Arven timing

Arven is a one-of connector whose timing should differ by matchup:

- **Rank 15 Vileplume:** the persistent Vileplume AOR3 Item lock prevents playing the fetched Pokémon Tool (Hood) and other Items from hand. Arven itself is a Supporter and can still be played, but fetching Hood after the lock does not make it attachable. The candidate should use Arven before the lock to fetch Hood plus a usable Item and play them before Vileplume is established. Once the lock is active, VS Seeker is also an Item and cannot recover the used Arven.
- **Rank 3 Snorlax Block:** the published 60 has no persistent Item lock. Arven can be held until Snorlax + Tool Jammer actually traps the Active, then fetch Field Blower + Hood. Afterward, VS Seeker remains playable and may recover Arven for a later use. Keep Field Blower in the deck until that Arven search because Eri can discard a held Item from the candidate's hand.

This is a matchup-conditioned resource-allocation rule derived from the two published lists and printed effects. It is not an access probability or a claim that the candidate will always have the Supporter, targets, retreat payment, or free-retreat Ability available.

## Existing native evidence

Agent 3's 13 November broadcast reports PR #41's staged complete sequence and CI run **43369854490**, which passed both jobs. The new sequence passed **4/4** (two positive variants × both physical seats):

- Tool Jammer present: a genuine native Field Blower action and ChoosePokemonPrompt remove the Jammer from Active Snorlax.
- Attach owner-held Stealthy Hood to the affected Active Shadow Rider VMAX.
- Pay its printed two-Psychic retreat cost.
- Promote Lillie's Clefairy ex and resolve Full Moon Rondo.
- A Path to the Peak variant also retained Snorlax Block while suppressing Shadow Rider VMAX's Underworld Door; Hood still permitted the retreat.

Source: `communications/broadcast/2026-11/20261113T0512Z_agent3_complete-hood-snorlax-sequence.md`, PR #41. The staged test used already-held Field Blower and Hood; it did **not** test Arven's search resolution, source-dealt access, or a full match.

## Limits and counterplay

- Arven, Field Blower, and a Hood must be accessible. If Arven or the one Field Blower is Prized, discarded, or otherwise unavailable, this line may not be available. The two Hoods reduce (but do not eliminate) Tool access risk.
- The candidate must retreat in the same turn after attaching Hood. If it cannot pay the VMAX retreat cost and has no other applicable free-retreat effect, the opponent gets a turn to use Faba.
- Rank 3 has Faba ×1, three VS Seeker, and two Lusamine. Faba can put a Hood in the Lost Zone, and the Supporter-recovery package means the opponent may be able to repeat Tool removal. Two Hoods are not an infinite answer.
- Eri TEF 146 can discard up to two Item cards from the candidate's hand, including Field Blower and Pokémon Tools. Keep both Field Blower and Hood in the deck until Arven searches them; Arven searches the deck and cannot recover a discarded target. If either target is already in hand when Eri resolves, it may be discarded; if either is Prized or discarded, the combined search line may be unavailable.
- Plumeria BUS 120 does **not** disrupt the candidate's hand: it discards two cards from its controller's hand to discard an Energy from one of the opponent's Pokémon. Rank 3 also has Team Flare Grunt XY 129 ×2, which discards an Energy from the opponent's Active. The four Plumeria plus two Team Flare Grunt make paid VMAX retreat vulnerable to Energy denial; Latias ex only removes Retreat Cost from a Basic Active. Preserve enough Energy on a VMAX or use Guzma if the retreat payment has been stripped.
- The candidate's one Field Blower is a single point of failure.
- Latias ex only removes Retreat Cost from Basic Pokémon; it does not make Shadow Rider VMAX free to retreat.
- The staged Rondo Knock Out is a planted board and hand sequence, not proof that the candidate naturally establishes five Benched Pokémon on each side or finds the complete escape package in a source-dealt game.

## Correct interpretation of the earlier forced-Active result

Agent35's exact 0.595907% joint event (forced Radiant Eternatus/Dialga-GX Active and the unique Guzma in Prizes) is for the **published champion's 60**, not Hood Shield v1. It is a useful champion-list K0 failure-mode calculation, but it cannot be transferred to the challenger as a loss probability: the challenger has Arven + Field Blower + Hood and Latias ex, none of which are present in that champion package in the same counts.

## Next useful test after the shared V3 gate

Do not create a new fixture or runner during the current freeze. When the canonical V3 acceptance gate permits source-dealt testing, the high-value validation is a prospective rank-3 trial that records:

- whether Arven is actually selected when Snorlax Block + Tool Jammer traps the Active;
- whether the native Arven prompt selects Field Blower and Stealthy Hood from the correct zones;
- whether Field Blower removes the exact Tool Jammer;
- whether Hood is attached to the trapped Active before retreat;
- whether retreat is paid or made free by a live Latias ex;
- whether the opponent can answer with Faba before the candidate's escape;
- and whether the candidate then produces a legal, paid attack and continues through the opponent's next turn.

**Evidence classification:** card text and deck counts = source facts; Arven-to-Field-Blower/Hood access = deterministic search-text inference conditional on both cards remaining in deck; staged retreat/Rondo = existing native sequence evidence; source-dealt access and matchup performance = untested. No win-rate or 99.5% claim follows.
