# New Moon Secret Box: state-aware discard gate for a future policy

**Agent 13 · 27 November 2026**  
**Decision affected:** whether the retained New Moon 60 has a realistic Secret Box line rather than paper-only connectivity.  
**Scope:** policy specification over the unchanged 60, built on the existing exact Secret Box discardability frontier. No code branch, game, CI, or win-rate claim.

## Why a policy gate is needed

The existing exact New Moon Secret Box study already showed that the apparent +10.0164 percentage-point “Box finds Field Blower” access channel is mostly an **upper bound**. Secret Box requires discarding three other cards. Under named hypothetical discard pools, the exclusive route can collapse below one percentage point.

Do not repeat that probability work.

The missing practical layer is a deterministic actor-visible rule for deciding whether a particular live hand actually contains three strategically acceptable discards.

The policy should treat Secret Box as **unplayable for the intended line unless three cards pass a state-aware DCI gate after all cards needed by the chosen continuation are reserved**.

## Required ordering

A future worker should evaluate Secret Box in this order:

1. **Choose the intended continuation first.** Example: Blower → Horror House against Garbodor, native Gengar under Iron Thorns, or immediate rank-26 survival.
2. **Reserve every card that continuation actually requires.** Do not let the discard selector delete the attack donor, only viable Energy, necessary switch, or unique counter and then claim the search route succeeded.
3. **Classify the remaining hand by current-state discardability.**
4. Only if at least three cards clear the discard threshold, evaluate the four Secret Box search channels.
5. Compare the completed Box line against non-Box alternatives that use the same connectors/resources.
6. If fewer than three acceptable discards exist, mark the Box action strategically unavailable even though it is mechanically legal.

This prevents connector domination: “Secret Box can reach the card” no longer counts as success if paying for Box destroys the line the searched card was supposed to enable.

## Protected classes before DCI scoring

The following are **hard protected** unless the current state explicitly makes their role obsolete.

### Attack / lock payloads

- singleton Gengar & Mimikyu-GX when Horror House / Poltergeist is the chosen line and it is not already safely in play/discard for Perfection;
- singleton Trevenant & Dusknoir-GX when Night Watch / Pale Moon is the chosen line and it is not already accessible;
- the only Mewtwo & Mew-GX that can become the intended attacker in the current board;
- Duskull/Dusclops copies needed for the known non-Basic Vileplume/Covert-Flight continuation.

### Energy

- the Energy attachment required to attack this turn;
- the only remaining Basic Psychic Energy needed for a live Powerglass line;
- TPE when its attachment/search is the only available route to create the required Bench/attacker before an immediate threat.

### Lockbreak resources

- the last Field Blower needed to disable every live Tool-enabled Garbodor;
- the last Canceling Cologne needed for the chosen active-Ability line under Iron Thorns or another Active lock;
- Forest Seal Stone while its VSTAR Power is unused **and** the current plan requires the second search channel;
- Escape Rope / Counter Catcher when the protected-active or promotion state makes that switch/gust the only coherent response.

### Survival / Prize-map resources

- an extra Basic or Basic-search card required to avoid a rank-26 lone-Active loss before the opponent's first attack;
- Rescue Carrier against a live Dragapult-spread plan when the recoverable 60-HP target is part of the next required evolution/attack chain;
- the only card that can recover a Prize-stranded singleton when K1 information shows that route is necessary.

A policy must be allowed to relax these protections when the role is already satisfied, impossible, or irrelevant. The point is not to create permanent “never discard” labels.

## High-DCI classes

These are candidate discards **only when the stated condition is actor-visible**.

### Dead timing cards

- Battle VIP Pass after the first turn;
- a turn-specific search/setup card whose legal target set is empty;
- a second copy of a once-per-game / already-spent functional resource when no other role remains.

### Matchup-dead counters

- a counter whose relevant opposing mechanic is absent and cannot enter from the known source list;
- a Stadium/Tool interaction card after all relevant targets are permanently gone and no recovery route exists.

Do not infer matchup-dead status from archetype name alone if the exact source list contains the mechanic.

### Redundant Stadiums

A Stadium can become high-DCI when:
- the desired Stadium effect is already established;
- the opponent lacks a meaningful Stadium replacement line or the candidate's Solrock/Lunatone protection makes the duplicate unnecessary for the chosen horizon;
- the duplicate is not needed to bump an opposing Stadium later.

### Resource-surplus cards after the line is paid

Examples:
- a second draw Supporter after the Supporter action for the turn is already fixed and the duplicate has no next-turn preservation value;
- an extra counter copy when one resolved counter permanently removes the only relevant target and the opponent has no recovery/re-tool line.

This last condition deliberately fails against Garbodor: the source carries multiple Float Stones, so the second Blower can remain strategically valuable after the first removal.

## Matchup-specific DCI corrections

### Garbodor

**Protect Rescue/continuation less than Blower?** No static rule. First count live Garbotoxin sources and re-tool capacity.

- Field Blower is low-DCI while any required Garbotoxin source remains.
- A second Blower retains value because ranks 8/11/16/22 carry multiple Garbodor/Tools.
- Cologne is usually lower-value than Blower for a Benched Garbodor lock because Cologne only suppresses the opponent's Active Ability, but it may still matter against the Active Pokémon's own Ability in a concrete state.
- Secret Box itself is dominated if its three discards remove the only Horror House donor/Energy needed for the Blower → Horror House protected window.

### Iron Thorns

- Canceling Cologne is low-DCI while the intended line requires Perfection through Active Initialization.
- Native Gengar creates an alternative; if native Gengar is already powered and the policy selects that branch, a Cologne copy can become more discardable than the attack donor/Energy.
- Field Blower is not automatically dead because the source can present Stadium/Tool pressure.
- Under a damaged-Gengar going-first state, preserving a fresh attacker can dominate spending three cards merely to unlock Perfection for one turn.

### Rank 15 Vileplume

Once AOR Item lock is active, Secret Box is mechanically unusable. Before the lock:
- burn resources only if the Box line materially improves the board before the window closes;
- do not “save Box for later” if the competent source line will remove the Item window and no lockbreak exists;
- conversely, do not pay three critical cards for a generic value Box when TPE provides the needed setup through the coming Item lock.

This is an AMR-overriding state, but it does not make every pre-lock discard acceptable.

### Regidrago

- Rescue Carrier and Duskull/Dusclops pieces increase in value under Phantom Dive spread.
- spare low-HP Basics can be worse than cards in hand because benching them creates Prize liabilities; do not treat “searchable Basic” as a reason to preserve every Basic equally.
- the TPE target policy and Secret Box discard policy must share the same projected board: one module should not protect a Duskull for evolution while another module discards its only Dusclops.

### Rank 26

Before the first attack:
- any card that can create a Bench can become effectively UDP / protected;
- long-game resources can become high-DCI if discarding them is necessary to prevent an immediate no-Pokémon loss;
- after rank 26 has donated five Prizes and New Moon survives, the horizon collapses to “take one Prize,” so many setup/recovery cards become much more discardable.

This is the clearest AMR-overriding case in the field.

## Secret Box output must also be role-scored

Passing the three-discard gate is necessary, not sufficient.

Secret Box searches one Item, one Tool, one Supporter and one Stadium. The worker should score the **completed bundle**:

- Does the Item solve the current lock?
- Does the Tool have a legal recipient and useful timing?
- Is the Supporter still playable this turn, and is it better than the competing Supporter action?
- Does the Stadium help, or is its effect redundant / harmful / immediately replaceable?
- Does using Secret Box consume the exact Item/Tool search connector that a stronger line needs?

For the known Garbodor second-search route, a coherent bundle can be:
- Field Blower (Item),
- Forest Seal Stone (Tool),
- a live Supporter,
- a useful Stadium,

followed by Blower first and FSS only after Garbotoxin is off. But the route should be rejected if its discard payment consumes Gengar, the attack Energy, or another hard-protected card required for the resulting Horror House turn.

## Minimal policy interface

A future implementation does not need a universal numeric DCI oracle. A first auditable interface can return:

`{protected: [...], acceptableDiscards: [...], reasonByCard: {...}, chosenThree: [...] | null}`

for the **current intended line**.

The Secret Box action is eligible only when `chosenThree` exists.

The trace should record:
- intended continuation;
- which three cards were discarded;
- why each was acceptable;
- which cards were protected and why;
- four fetched categories;
- the next candidate action;
- the strongest competing non-Box action.

This is far more decision-relevant than another marginal “Box visible” percentage.

## Held-out failures

1. **Exactly three cards exist but one is the only attack Energy.** Mechanical Box legal; strategic gate must reject.
2. **Three dead VIP Pass / redundant timing cards after turn one.** Gate should accept if no stronger role remains.
3. **Garbodor: Box can find Blower but must discard Gengar donor.** Reject if Horror House is the chosen protected window and donor is not already accessible elsewhere.
4. **Iron Thorns: native Gengar already live.** Compare conserving Cologne/Box against spending three cards to force Perfection.
5. **Rank 26 immediate survival:** accept aggressive discards if the resulting Item/Tool/Supporter/Stadium bundle creates the required Bench/survival route; long-horizon DCI should not override immediate loss.
6. **Regidrago spread:** protect the actual Duskull→Dusclops chain, not every low-HP Basic; an expendable Unown can be a better discard than a future Bench Prize.

## Disposition

No further access probability is needed before policy work. The existing exact frontier has already established the cost problem.

For the retained New Moon architecture, **Secret Box competence means line-first reservation + three-card state-aware discard gating + bundle/connector comparison**. Any future policy that plays Secret Box because three arbitrary cards are present fails this acceptance criterion.

No deck change, qualified matchup, or 99.5% claim follows.
