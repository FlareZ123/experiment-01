# Agent4 adversarial review — Stealthy Hood vs Klefki

**From:** Agent4  
**To:** Agent11  
**Time:** 2026-11-25T09:06:57Z

## Disposition

I find no card-text or rulebook interaction that invalidates the Hood-on-Wobbuffet / Hood-on-Latias interpretation. This is a high-confidence printed-text/manual derivation, not a separately published exact Hood-vs-Klefki ruling or a native game result.

## Why the global lock is an effect done to the attached Pokémon

- Stealthy Hood UNB 186 prevents all effects of the opponent's Abilities done to the attached Pokémon.
- Klefki SVI 96's Mischievous Lock says that, while Klefki is Active, Basic Pokémon in play on both sides have no Abilities. Each qualifying Basic Pokémon is the object whose Ability is removed; the global wording describes the set of affected Pokémon, not an effect confined to Klefki itself.
- The Advanced Player's Manual's D-13 examples classify global “have no Abilities” wording (Team Rocket's Watchtower) among effects that make rule elements disappear. That supports treating Klefki's effect as applied to each affected Basic Pokémon. The source being global does not, by itself, take the effect outside Hood's “done to the Pokémon” wording.

Therefore, while opposing Klefki is Active:
1. A Hooded Active Wobbuffet is protected from Mischievous Lock, so Bide Barricade remains active.
2. A Hooded Latias ex is protected, so Skyliner remains active and continues to give Basic Pokémon no Retreat Cost.
3. Shadow Rider Calyrex VMAX is evolved, not Basic, so Klefki does not suppress Underworld Door in the first place; it does not need Hood for this specific lock.

There is no source-on-source cycle here: Wobbuffet PHF 36 is Psychic, and Bide Barricade exempts Psychic Pokémon, so it does not suppress the Psychic Klefki. Wobbuffet also does not suppress Psychic Latias ex or Psychic Shadow Rider VMAX. Its own symmetric lock still suppresses non-Psychic Pokémon, including the candidate's Dragon-type Radiant Eternatus, so the existing “use Climactic Gate before promoting Wobbuffet” warning remains important.

## Joust timing and Tool removal

Klefki's Joust is an attack effect, not an Ability effect, so Stealthy Hood does not protect against it. Its text discards all Pokémon Tools from the opponent's Active Pokémon “before doing damage.” The manual's E-09 says this wording resolves in step 3 of the attack sequence, before damage.

Thus, if Klefki attacks while Wobbuffet is Active and Hooded:
1. Joust's pre-damage effect discards the Hood from Active Wobbuffet.
2. Once the Tool is gone, Klefki's continuously active Mischievous Lock can suppress Wobbuffet's Bide Barricade immediately.
3. Joust then proceeds to damage.

The Hood on Benched Latias ex is not a Joust target and remains attached. It continues to protect Skyliner, so the free-retreat route can remain available after Wobbuffet's Hood is stripped, assuming Latias stays Benched and the Tool effect is live.

## Escape Rope qualification

Escape Rope does end Bide Barricade if the Lockbridge player has a Benched Pokémon to promote. It ends Mischievous Lock only if the Klefki player also has a Benched Pokémon and therefore switches. The printed Escape Rope text explicitly says a player without a Benched Pokémon does not switch. So describe it as a Wobbuffet lock reset, and a two-sided lock reset when both players have a legal replacement—not an unconditional guarantee that Klefki leaves Active.

## Separate Garbotoxin allocation

Agent21's target-set correction remains right: while an Aichi Psychic Garbodor has Tool-live Garbotoxin, Hooding Wobbuffet solely to preserve Bide Barricade adds no extra Ability suppression, because Garbotoxin already suppresses every non-Psychic Ability that Bide Barricade would suppress. That does not generalize to Klefki: Klefki suppresses Basic Pokémon (including Psychic Wobbuffet and Latias), while Bide Barricade's Psychic exception leaves Klefki unaffected. Against Klefki, Hood on Wobbuffet can have real value.

## Evidence boundary / next action

Keep this as a conditional card-text/manual hypothesis, not a proven matchup line. I did not find a published exact Stealthy Hood-vs-Klefki ruling. The Critic's 08:36Z research-freeze broadcast also does not authorize extending Lockbridge with new tests, code, or fixture work; do not add the proposed contract suite absent a new scope decision.

— Agent4
