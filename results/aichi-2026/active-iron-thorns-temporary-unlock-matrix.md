# Achi Iron Thorns: temporary Active Ability-unlock counter matrix

**Agent 15, 17 October 2026. Status: independently checked
printed-card-text hypotheses. No pinned engine Store fixture or
competitive game outcome has been demonstrated.** Do not change the
frozen Hood Shield v1 list based on this memo.

## Narrow common goal

Against an opponent's **Active Iron Thorns ex TWM77**, temporarily
suppress its Initialization, then execute the previously blocked
evolved Shadow Rider Calyrex VMAX **Underworld Door** or Basic
**Radiant Eternatus CRZ105 Climactic Gate** on the same turn. Iron
Thorns' Ability suppresses Rule Box Pokémon except Future Pokémon.
Underworld Door provides Energy from hand to a Benched Psychic Pokémon
and draws two; Climactic Gate puts up to two VMAX directly on the
Bench, after which the player's turn ends.

This matrix is limited to that exact Basic active lock. It does not
claim a universal answer to Benched evolved Garbotoxin, Vileplume
Item lock, Trainer denial, or simultaneous Ability suppression.

## Three distinct control mechanisms

1. **Canceling Cologne ASR136, Item:** Its effect makes the
   *opponent's Active Pokémon* have no Abilities until the end of
   **your current turn**, including replacement Active Pokémon. If
   Iron Thorns is Active, the player's Rule Box support should
   immediately regain Abilities for this turn. It costs an Item use
   and is blocked by an applicable Item lock, but does not require
   a Stadium slot, Bench place, Tool slot or manual retreat.
   [Official card text](https://asia.pokemon-card.com/ph/card-search/detail/2404/).
2. **Flutter Mane TEF78, Basic Pokémon:** Its *Midnight Fluttering*
   says the opponent's Active has no Abilities while Flutter Mane
   occupies **your Active Spot**. It is Basic without a Rule Box,
   hence Iron Thorns' Rule Box-specific lock would not disable it.
   While Flutter is Active, evolved Shadow Rider may accelerate
   Energy on the Bench. The player can subsequently retreat or
   switch Flutter to an attacker. On moving Flutter out of Active,
   Initialization resumes, but previously attached Energy and
   drawn cards remain. Position change, 90 HP, Bench access, and
   one normal retreat per turn are important constraints.
   [Official card text](https://asia.pokemon-card.com/sg/card-search/detail/13481/).
3. **Silent Lab PRC140, Stadium:** Removes all Basic Pokémon
   Abilities, including opposing Active Iron Thorns. It does not
   remove Abilities from evolved VMAX, though it also blanks the
   player's own Basic support and is open to opponent Stadium
   replacement. The [dedicated Lab analysis](silent-lab-thorns-response-hypothesis.md)
   contains source-specific Stadium and Item counters.
   [Official card text](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/xy-series/xy5/140/).

A fourth, independently demonstrated mechanism is to put Stealthy
Hood on the **VMAX itself** so that the opposing Initialization does
not affect that individual Pokémon. Hood does not directly restore
other Rule Box support Abilities. Its pinned fixture is covered in
[the original Hood research](hood-arven-interaction.md).

## Multi-axis Arven option and decisive sequencing

Arven SVI166 (already **one copy** in frozen Hood Shield v1)
fetches **an Item and a Pokémon Tool in a single Supporter play**.
A potential line in a *future, independently frozen* candidate is

`Arven -> Canceling Cologne + Stealthy Hood`.

Provided both targets remain in deck, the Supporter has not been
used that turn, Items and Tool attachment are permitted, and a
suitable VMAX is present without a Tool, this simultaneously permits:

- Temporary unlocking of *other* Rule Box abilities that Stealthy
  Hood on a single VMAX does not protect, while the Iron Thorns
  Active Ability is disabled by Cologne.
- Persistent Underworld Door protection on the VMAX after Cologne's
  end-of-turn expiry, as long as the attached Hood survives.
- Avoiding discard payments for these two search targets, while
  consuming the one Supporter opportunity and both search channels.

**Critical distinction with Climactic Gate:** Radiant Eternatus
played from the hand while Cologne is active may use the restored
Climactic Gate to place two VMAX onto open Bench spaces; using that
Ability **ends the turn**. The player cannot then attach a Hood or
use a newly summoned VMAX's Underworld Door during that same turn.
Attach any intended Tools, Energy, or perform other actions *before*
announcing Gate, or preserve the Hood in hand for the next turn. This
timing prevents a false imagined all-in-one-turn combo.

Another proposed line is
`Active Flutter Mane -> Underworld Door -> retreat Flutter -> VMAX attack`.
A Benched **Latias ex SSP76** (already one copy in Hood/Champion)
has Skyliner: Basic Pokémon have no Retreat Cost. If Flutter has
suppressed Iron Thorns and Latias is available, Skyliner should
also resume, making Flutter's once-per-turn retreat free.
Test this interaction with card effects in the pinned engine before
treating it as a usable line. If the player's Active is already VMAX,
a switch **into** Flutter plus a subsequent manual retreat (or other
legal switch) may be required to create this timing window.

## Source/legality boundaries

- Canceling Cologne and Flutter Mane are **absent** from Champion
  rank1, Hood Shield v1 and Temple v1 exact 60s. Adding either
  requires a new fixed 60, explicit slot subtraction and independent
  legality/printing validation. No existing deck has been edited.
- Canceling Cologne occurs once each in published Aichi rank9 and
  rank26 source lists. Flutter Mane's exact prevalence should be
  counted from the source inventory before making a comparative claim.
- The Pokemon Asia official trainer site verifies the above English
  effects; a forum report about Pokémon TCG Live behavior is not
  paper Expanded rules evidence. Engine hook behavior can diverge
  from paper semantics, so a printed-text result and actual Store
  observation should be recorded independently.
- Iron Thorns source opponents all have alternative Stadiums and
  Megaton Blower, and rank29 also has Field Blower. These can
  challenge permanent Hood or Lab lines on their turn. They do
  not generally preempt the player's immediate Cologne effect,
  but could disrupt the board before the next turn.
- Item lock can block Cologne; Garbodor's Benched Garbotoxin will
  still suppress Rule Box abilities when its Tool and other
  conditions remain valid. Active Flutter position may conflict
  with the deck's desired attacking Active VMAX.

## Required pinned Store / policy falsification

Set up a genuine legal board with *opponent Active Iron Thorns*,
*own Bench evolved Shadow Rider VMAX*, Psychic Energy in hand and a
suitable Benched Psychic Energy recipient. Capture actual
available actions and emitted state changes, not inferred outcomes.

1. Control: without intervention, attempted Underworld Door is
   unavailable or has no effect.
2. Play Canceling Cologne. Confirm Iron Thorns's Initialization no
   longer applies through this turn, Underworld Door attaches Energy
   and draws, and the Ability lock returns next turn. Repeat with
   Radiant Eternatus *played from hand*: Gate succeeds and ends turn,
   preventing any subsequent Tool attachment that turn.
3. Repeat using Active Flutter Mane; verify Latias ex Skyliner,
   Underworld Door, actual free retreat and post-retreat suppression.
   Check one-normal-retreat limit. Repeat with missing Latias,
   no legal Bench recipient and Item lock.
4. Repeat with Silent Lab versus Hood; show how opposing Megaton
   Blower, new Stadium, and Benched Garbotoxin affect each line.
5. Only after verified behavior and a playable new frozen candidate
   exist, compare the exact source opponents in both player seats
   under realistic search, Tool/Stadium response and turn priorities.

Record simulator revision, all hooks, source printings, both seats,
seed, complete decisions and state transitions; keep
`qualifiedForCompetitiveInference = false` until all independent
qualification gates pass.
