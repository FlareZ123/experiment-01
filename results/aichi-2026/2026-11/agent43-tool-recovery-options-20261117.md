# Candidate-side recovery options for the Hood Shield Tool package

**Agent 43 · 17 November 2026**

## Decision

The fixed Hood Shield Shadow Rider v1 list has no direct post-discard Pokémon Tool recovery. The current list's Acerola can preserve an attached Hood by returning a damaged Pokémon and all attached cards to hand **before** removal; it cannot recover a Hood after Field Blower or Megaton Blower has discarded it. Arven searches the deck, VS Seeker recovers Supporters, and Night Stretcher recovers a Pokémon or Basic Energy—not a Tool.

The Expanded card pool does contain several legal recovery effects. These are candidate-side design options for later controlled testing, **not recommendations to change the current fixed 60 before V3 acceptance and the first natural-terminal trace**.

## Current candidate boundary

The exact candidate [60-card list](../candidate-hood-shadow-rider.json) contains:

- Stealthy Hood ×2
- Forest Seal Stone ×1
- Float Stone ×1
- Acerola ×1
- Arven ×1
- VS Seeker ×2
- Night Stretcher ×1
- Battle Compressor ×1
- Unfair Stamp ×1 (ACE SPEC)

The candidate therefore has four Pokémon Tools. Field Blower and Megaton Blower send removed Tools to the discard pile; Faba puts one eligible Tool into the Lost Zone. The recovery options below act on the **discard pile**, not the Lost Zone. None of them reverses Faba's Lost Zone placement.

Current-list card-text checks in the repository card pool: Acerola (BUS 112 / sm3-112) returns a damaged Pokémon and all attached cards to hand; Arven (SVI 166 / sv1-166) searches one Item and one Pokémon Tool from the deck; Night Stretcher (ASC 196 / me2pt5-196) returns a Pokémon or Basic Energy from discard to hand; Unfair Stamp (TWM 165 / sv6-165) is the current ACE SPEC; VS Seeker (PHF 109 / xy4-109) returns a Supporter from discard to hand. These effects explain the current-list boundary above.

## Expanded-legal recovery options

| Card | Set / number | Exact relevant effect | Constraint | Candidate-specific assessment |
|---|---|---|---|---|
| **Lana's Fishing Rod** | Cosmic Eclipse 195 | Shuffle a Pokémon and a Pokémon Tool card from the discard pile into the deck. | Requires both a Pokémon and a Tool in the discard pile; returns the Tool to deck, not hand. | Best one-slot Item hypothesis for a Hood already discarded when a Pokémon is also in discard. Arven can then search a Tool from deck; VS Seeker can recover Arven if it was previously used. |
| **Eco Arm** | Ancient Origins 71 | Shuffle 3 Pokémon Tool cards from the discard pile into the deck. | Requires three Tools in discard; returns them to deck, not hand. | Strongest when at least three of the candidate's four Tools are attached and swept by Megaton Blower. It is not automatically live: Tools in hand or deck are not discarded, and Eco Arm requires three Tools in the discard pile. Arven is still needed to find a Hood. |
| **Dowsing Machine** | Plasma Storm 128 | Discard 2 cards from hand; put a Trainer card from the discard pile into the hand. | ACE SPEC; requires two hand discards and consumes the deck's single ACE SPEC slot. | Directly returns a Hood to hand without another search. It would replace Unfair Stamp, sacrificing the current post-KO hand-disruption ACE SPEC; that opportunity cost is substantial. |
| **Roseanne's Backup** | Brilliant Stars 148 | Choose one or more: shuffle a Pokémon, Pokémon Tool, Stadium and/or Energy from discard into deck. | Supporter; only one Supporter per turn; a later search is needed to take the Hood from deck. | Can recycle one Tool without requiring a Pokémon or three Tools in discard, but competes directly with Arven / Iono / Lillie's Determination / other Supporters and is slower than an Item recovery line. |
| **Sordward & Shielbert** | Battle Styles 135 | Choose a Trainer from discard; ask the opponent whether it may be put into hand. If refused, draw 3 cards. | Opponent can refuse the recovery. | Not a dependable Tool-recovery plan against a competent opponent. |
| **Molayne** | Unbroken Bonds 181 | Discard 2 Metal Energy from hand; shuffle a Trainer from discard into deck. | Requires two Metal Energy in hand, then a further search to recover the Tool. | Poor fit for the candidate's 11-Psychic-Energy base; would require a wider energy/engine redesign, not a one-card patch. |
| **U-Turn Board** | Unified Minds 211 | If this Tool is discarded from play, put this card into hand instead of the discard pile. | Protects only itself. | Could preserve its own retreat resource, but does not recover or protect Stealthy Hood. Do not count it as generic Tool recursion. |

All listed printings are marked Expanded-legal in the repository's card database. The card texts are in the corresponding files under resources/cards/en: sm12.json, xy7.json, bw8.json, swsh9.json, swsh5.json, sm10.json and sm11.json.

## Sequencing implications

### Lana's Fishing Rod line

If a Hood is in the discard pile and a Pokémon is also in the discard pile:

1. Play Lana's Fishing Rod as an Item to shuffle one Pokémon and one Pokémon Tool (the Hood) into the deck.
2. Play Arven as the Supporter to search for a Pokémon Tool from the deck, taking the Hood back into hand, plus an Item if useful.
3. Attach the Hood to the intended Shadow Rider.

If Arven is already in the discard pile, VS Seeker can recover it before the Supporter step. The candidate already has VS Seeker ×2. If no Pokémon is in the discard pile, Battle Compressor can create that target, but this competes with its existing Supporter-discard / VS Seeker role and must be charged to the resource ledger. Lana's Fishing Rod cannot recover a Hood in the Lost Zone.

### Eco Arm line

If Megaton Blower discards at least three of the candidate's four Tools from Pokémon in play, Eco Arm can shuffle three of them back into the deck. Tools in hand or deck are not discarded, so the line is not guaranteed to be live even against Megaton Blower. Arven can then search for a Hood. This line is specifically attractive against a sufficiently large Tool sweep; it is not a general answer to every two-Hood removal event. If Field Blower discards only both Hoods and the other two Tools remain in play or elsewhere, there are only two Tools in discard and Eco Arm cannot be played. It also cannot recover a Hood that Faba put in the Lost Zone.

### Dowsing Machine tradeoff

Dowsing Machine is the only option in this comparison that returns a discarded Hood directly to hand in one Item action. It also retrieves any other Trainer, so its ceiling is broader than Tool recovery. But the candidate currently uses Unfair Stamp as its ACE SPEC. The comparison is not "free recursion versus no recursion": it is **Dowsing Machine's direct recovery and two-card hand cost versus Unfair Stamp's post-KO hand disruption**. This requires full-field policy testing, not an unsupported substitution.

### Existing Acerola line

Acerola can return a damaged Pokémon and all attached cards to hand. If the Hood-bearing Pokémon has damage counters and Acerola is played before the opponent's Tool-removal effect, the Hood is preserved. This is a pre-removal bounce line; once Field Blower or Megaton Blower has already discarded the Hood, Acerola cannot retrieve it.

## Controlled hypotheses for later evaluation

Do not change the nominated deck on the basis of this static card-text analysis. After the current V3 acceptance sequence and Agent6's first natural-terminal trace are reviewed, the following are the only candidate variants worth putting into a controlled comparison:

1. **Lana's Fishing Rod for Night Stretcher:** tests general one-Tool recovery through Arven/VS Seeker. Explicitly charge the loss of Night Stretcher's Pokémon/Basic Energy recovery and the requirement for a Pokémon in discard.
2. **Eco Arm for Night Stretcher:** tests recovery after a full Megaton Blower sweep. Explicitly measure how often three Tools are actually in discard; do not assume Field Blower makes Eco Arm live.
3. **Dowsing Machine for Unfair Stamp:** tests direct Trainer-to-hand recovery. Treat loss of Unfair Stamp and the two-card hand cost as primary comparison variables, not incidental drawbacks.
4. **Roseanne's Backup for a Supporter slot:** only test if the policy can tolerate using its Supporter for deck recycling rather than Arven or hand refresh.

Keep these as separate variants; do not combine multiple recovery cards and then attribute the result to one effect. Rank30's three Field Blowers, rank7's Field Blower + Megaton Blower + Faba, and rank29's Field Blower + Megaton Blower are natural post-trace challenge cases, but the new access percentages in [the field exposure report](agent43-field-tool-removal-natural-access-20261117.md) are not game weights.

## Evidence classification and limitations

- Candidate counts and Expanded legality: repository deck JSON and card-database legalities.
- Card effects: exact local card text.
- Sequencing above: rules-text inference; validate search timing and card-zone transitions in the pinned simulator and against paper rules before production admission.
- Variant value, actual frequency of a recovery line, matchup effect and win-rate impact: **untested**.

This note does not change the fixed 60, frozen policies, simulator, fixtures, seeds, CI, or candidate nomination. It closes the static card-pool question and defers competitive evaluation until the existing acceptance/first-trace stopline clears.
