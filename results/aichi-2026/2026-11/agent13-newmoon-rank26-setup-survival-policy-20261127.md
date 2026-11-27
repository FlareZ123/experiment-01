# New Moon vs rank 26: the donk answer is setup survival, not Horror House

**Agent 13 · 27 November 2026**  
**Decision affected:** retained New Moon candidate-side policy against the authenticated rank-26 Meloetta donk source.  
**Boundary:** this does not duplicate Agent21's rank-26 opponent-policy worker. It defines New Moon's own setup/first-turn priorities. No game, CI, or win-rate claim.

## Correction

A previous informal intuition that New Moon could use Horror House before a rank-26 first attack is wrong in the hardest orientation.

The exact rank-26 source uses **Meloetta ex BLK 44**, whose Debut Performance Ability allows it to attack during its first turn **if it goes first**. If it goes second, the ordinary rules already allow an attack on its first turn.

Therefore rank 26 can threaten a first-turn attack in either starting orientation:

- **rank 26 goes first:** New Moon gets **no normal turn** before the attack; only setup choices, opponent-mulligan bonus Basics, and passive setup Abilities matter;
- **rank 26 goes second:** New Moon gets one setup turn, but New Moon itself cannot attack on that first turn, so Horror House still cannot precede the first rank-26 attack.

The candidate-side answer must therefore be built around **surviving the first attack**, not pre-empting it with a GX attack.

## Why a Bench changes the whole objective

Technical Machine: Crisis Punch does 280 only while the opponent has exactly one Prize remaining. The rank-26 source is built to donate five Prizes through its self-KO engine, then attack.

If New Moon has **no Benched Pokémon**, a 280-damage KO of its sole Active can end the game immediately through the “no Pokémon in play” loss condition.

If New Moon has at least one Benched Pokémon, the same Active KO does **not** end the game. New Moon promotes a replacement and, after the opponent has donated five Prizes, needs only one more Prize to win.

That makes the first defensive priority unusually discrete:

> **Before the first rank-26 attack, create at least one surviving Benched Pokémon whenever legally possible.**

This is more important than preserving ordinary setup efficiency. Spending a search card or TPE target merely to create a Bench can be correct even when that target would be inefficient in a normal matchup.

## Setup-phase rule: bench the second Basic

The supplied setup rules allow a player with extra Basic Pokémon in the opening hand to put up to five of them face down on the Bench before the game starts. Opponent-mulligan bonus cards can also add Basics before the game starts.

Against rank 26, a candidate setup policy should therefore:

1. if the opening hand contains at least two Basics, **put at least one on the Bench** rather than intentionally starting with a lone Active;
2. if opponent-mulligan bonus cards reveal another Basic before the game starts, use that opportunity to create a Bench when the candidate was otherwise lone-Active;
3. prefer a low-opportunity-cost one-Prize Basic as the expendable Active when a Bench exists, unless Klefki is available as described below.

The existing exact setup study already gives the structural baseline: after rank-26 optional mulligan bonuses, the unchanged New Moon 60 is lone-Active in **27.4628%** of valid openings. This is the hard residual risk when pre-game Bench construction cannot solve the state.

## Klefki is the preferred Active lock in this matchup

New Moon contains one **Klefki SVI 96** with Mischievous Lock:

> while Klefki is Active, Basic Pokémon in play have no Abilities except Mischievous Lock.

That matters against several rank-26 core pieces simultaneously.

### Rank 26 goes first

Active Klefki suppresses Meloetta ex's Debut Performance, so Meloetta cannot use that Ability to bypass the normal first-player attack restriction unless Klefki's Ability is first removed/suppressed.

The source contains one **Canceling Cologne**, which can suppress the opponent's Active Ability for the turn, so Klefki is not an absolute stop. It converts the donk into an additional resource requirement.

### Either orientation

Klefki also suppresses **Exeggcute PLF 4's Propagation** while Klefki remains Active. Propagation is the source's reusable discard-to-hand engine for its low-HP Exeggcute. Suppressing it attacks the self-KO resource loop independently of Meloetta's attack-permission Ability.

Klefki also suppresses other Basic Pokémon Abilities in the source while Active, increasing the cost of its draw/search engine.

Thus, when Klefki is available in the opening setup and the matchup is identified, the candidate policy should strongly prefer **Klefki Active**, with at least one other Basic Benched when possible.

The policy must still recognize Canceling Cologne as the opponent's legal counter; it should not mark the donk impossible merely because Klefki is Active.

## New Moon goes first: use the setup turn aggressively

When rank 26 is going second, New Moon receives one normal turn before the first attack but cannot attack itself. This is an AMR-overriding survival state: preserving “normal” card economy is secondary to creating a Bench.

Strong defensive actions include:

- play Battle VIP Pass / Fog Crystal / Mysterious Treasure / other legal Basic search before ending the turn;
- attach **Telepathic Psychic Energy** to a Psychic Pokémon when possible and use its “up to 2 Basic Psychic Pokémon” search to create Bench occupants;
- if Klefki is Active, TPE can be attached to it to build the Bench even though losing that Energy with a later Klefki KO may be inefficient in ordinary play;
- do not save a searchable Basic merely because its later role is uncertain if failing to bench it leaves an immediate no-Pokémon loss condition.

Risky Ruins is not in play during pre-game setup. Basics placed on the Bench during setup therefore avoid its later “when put onto the Bench during your turn” damage trigger entirely.

## Active selection when a Bench already exists

If New Moon can guarantee a Bench before the first attack:

1. **Klefki Active** is preferred when available because it taxes the opponent's Ability engine and Cologne access.
2. Otherwise prefer a **one-Prize Basic** whose loss does not remove the core next-turn attack plan.
3. Avoid unnecessarily exposing Mewtwo & Mew-GX or Gengar & Mimikyu-GX as the sacrificial Active when a one-Prize option exists. A Crisis Punch KO of a TAG TEAM gives three Prizes instead of one and removes a central attacker, while the candidate only needs to survive and convert the five donated Prizes into a final Prize on its next opportunity.

This is not a universal “never start TAG TEAM” rule. If the TAG TEAM is the only Basic, it must start; if its specific line is required after the failed donk and no alternative exists, the opportunity cost changes.

## What Horror House is actually for here

Horror House is a **post-survival conversion** tool, not the first defensive layer.

If rank 26 fails to end the game and New Moon reaches its first attacking turn, Horror House can be valuable to prevent the opponent from rebuilding its hand-based combo, Rescue Carrier lines, Tools, Stadiums, Energy and other resources. But the candidate must first have survived the opening attack.

A worker that chooses Horror House in a pre-attack state New Moon cannot actually reach is modeling an impossible action sequence.

## Held-out candidate-side states for Agent21 / future integrated policy

These states can be used without opening a competing rank-26 opponent worker:

1. **Pre-game two-Basic hand:** candidate setup must Bench at least one Basic; a deliberate lone-Active choice is a failure.
2. **Pre-game Klefki + second Basic:** choose Klefki Active and Bench the other Basic unless a stronger explicit reason exists.
3. **Rank26-first sole Klefki:** no candidate turn exists before the attack. The response is passive Mischievous Lock; worker must expect Cologne as the opponent's counter rather than invent a search action.
4. **NewMoon-first lone Active + TPE/search:** candidate gets a setup turn and should burn enough resources to create a Bench before passing.
5. **NewMoon-first Klefki Active + TPE:** TPE target selection should prioritize at least one surviving Bench occupant even if that is not the normal ALS target pair.
6. **Bench exists, TAG TEAM and one-Prize Active both available:** prefer the one-Prize/Klefki buffer unless the concrete continuation demands the TAG TEAM Active.
7. **Failed donk / five Prizes donated:** candidate's next-turn objective changes sharply—one Prize ends the game. Policy should stop pursuing long setup lines and find the cheapest legal Prize conversion.

## Disposition

This result makes rank 26 a **setup-policy qualification test**, not merely a matchup simulation.

It also improves the retained New Moon case relative to a five-Basic architecture: New Moon has 17 Basics and substantially lower lone-Active exposure, while TPE and eight first-turn Basic-search Items provide additional board-building routes when New Moon receives a turn. The residual 27.4628% lone-Active setup exposure remains real and cannot be erased by policy when rank 26 goes first.

No card changes are justified from this result. Coordinate the candidate-side held-out states with Agent21's opponent-policy work; do not create a second rank-26 worker.

No qualified game or 99.5% claim is created.
