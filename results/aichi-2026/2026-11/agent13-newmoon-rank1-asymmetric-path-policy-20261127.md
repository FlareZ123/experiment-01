# New Moon vs rank 1: asymmetric Path control, and why late Klefki is a self-lock

**Agent 13 · 27 November 2026**  
**Decision affected:** retained New Moon policy competence against the published rank-1 Shadow Rider Calyrex source.  
**Scope:** exact source-list/card-text decision analysis plus one previously preserved authentic-source failure state. No new game, CI, or win-rate claim.

## Finding

Against an evolved Shadow Rider board, New Moon should **not** treat Active Klefki as a generic Ability-lock answer.

Klefki SVI 96's Mischievous Lock removes Abilities from **Basic Pokémon**. Shadow Rider Calyrex VMAX is an **Evolution Pokémon**, so Underworld Door remains active. At the same time, Mewtwo & Mew-GX is Basic, so an Active Klefki suppresses New Moon's own Perfection.

This failure has already appeared in an authentic-source preserved state: after rank 1 Knocked Out Lunatone and New Moon promoted Klefki, the candidate used Joust for 10 while the source had two evolved Shadow Rider VMAX and retained its engine. That was not a proven “best alternative unavailable” state, but it is enough to reject any policy rule that scores Klefki as broad Ability lock after VMAX is established.

The stronger source-specific control line is **directional Stadium asymmetry**:

1. establish **Solrock + Lunatone OBF 92**;
2. play **Path to the Peak**;
3. Lunatone's New Moon Ability prevents Stadium effects done to New Moon's Pokémon, so New Moon's own Rule-Box Pokémon retain their Abilities;
4. rank 1's Rule-Box Shadow Rider VMAX are not protected by New Moon and therefore lose Underworld Door to Path;
5. when legal and strategically justified, use **Horror House-GX** to prevent rank 1 from playing hand cards on its next turn, protecting the Path window from ordinary Stadium replacement / hand-played outs.

This is not a permanent lock. Rank 1 has Marshadow UNB 81, whose Resetting Hole can discard a Stadium from the Bench, plus Field Blower and three alternative Stadiums. The policy must distinguish **Marshadow already on the Bench** from **Marshadow only still in hand/deck**.

## Exact card-text basis

### Shadow Rider Calyrex VMAX

Underworld Door:

- once per turn per eligible VMAX, attach a Psychic Energy from hand to a Benched Psychic Pokémon;
- if attached, draw two.

Rank 1 uses **four Shadow Rider VMAX**, so allowing multiple Underworld Door activations can both accelerate Energy and increase hand size.

Max Geist then scales by total Psychic Energy in play.

The matchup therefore has a direct feedback loop:

`Underworld Door -> more Energy + more cards -> larger Max Geist + more future options`.

Path attacks both acceleration and draw at once.

### Path to the Peak

The Stadium makes Pokémon with Rule Boxes have no Abilities.

Shadow Rider VMAX has a Rule Box and loses Underworld Door while the Path effect applies.

### Lunatone OBF 92 + Solrock

Lunatone's New Moon Ability says that if Solrock is in play, prevent all effects of Stadiums done to New Moon's Pokémon.

The retained candidate uses Solrock CES 62 and Lunatone OBF 92. The condition is by Pokémon name, so the CES Solrock satisfies it.

This makes Path **directional**:

- opponent Rule-Box Pokémon can lose Abilities;
- New Moon's own Pokémon are protected from the Stadium effect.

The actor policy must evaluate Stadium effects from the perspective of the recipient seat. An opponent's Solrock/Lunatone pair would not shield New Moon, and vice versa.

## Marshadow is the critical reply

Rank 1's exact source contains one Marshadow UNB 81 with Resetting Hole:

> if this Pokémon is on the Bench, discard any Stadium in play, then discard Marshadow and attached cards.

Two cases are strategically different.

### Marshadow already Benched

Horror House does not stop the in-play Ability. If New Moon plays Path and ends the turn with Marshadow already on the source Bench, rank 1 can use Resetting Hole without playing a hand card.

A policy that calls Path + Horror House a protected Stadium window in this state is wrong.

### Marshadow not in play

If New Moon can establish Path and then Horror House, the opponent cannot **play Marshadow from hand to the Bench** during the locked turn, and cannot play Field Blower or a replacement Stadium from hand either.

This can create one protected suppression turn, assuming no other in-play Stadium removal exists.

The state distinction is actor-visible: Marshadow's presence on the public Bench is known. The policy need not inspect the opponent's hidden hand.

## Starting-orientation implications

### New Moon going second

If the Mewtwo/TPE/Gengar Horror House line is available before Shadow Rider VMAX has evolved, Horror House can deny the opponent's next hand-play evolution turn entirely.

This is a tempo line separate from the later Path lock.

### New Moon going first

Rank 1 gets the first attacking turn and can evolve before New Moon attacks. The policy should prioritize whether Path + own New Moon pair can suppress Underworld Door before the source converts multiple Abilities into Energy and draw.

The exact preferred order depends on what is already in play:

- if Solrock/Lunatone are established and Marshadow is not Benched, Path → Horror House can create the strongest asymmetric window;
- if Marshadow is already Benched, Path without an answer to Resetting Hole may be temporary enough that another line dominates;
- if the candidate has not established its own New Moon pair, playing Path can self-disable Mewtwo & Mew-GX Perfection and other Rule-Box Abilities, so the policy must not deploy Path just because the opponent has VMAX in play.

## Avoiding the late-Klefki trap

Once one or more Shadow Rider VMAX are operating:

- **do not promote Klefki merely to “Ability lock.”**
- score the fact that Underworld Door remains active because the VMAX is Evolution;
- score the fact that Perfection turns off because Mewtwo & Mew-GX is Basic;
- only choose Klefki Active for another concrete purpose, such as Joust removing a relevant Tool from the **Active** opponent or a Prize/retreat buffer that outweighs the self-lock.

An earlier authentic-source state showed why this matters: the opponent's Float Stone was on a **Benched** VMAX, so Klefki's Active-target Joust did not remove it. “Klefki has lock + Tool removal” was doubly misleading in that board.

## Rank-1 held-out policy states

1. **VMAX online, Klefki promotion available:** worker must not label Klefki as Underworld Door lock; it should recognize candidate Perfection self-lock.
2. **New Moon pair + Path, Marshadow absent from board:** candidate should recognize asymmetric suppression of source Rule-Box Abilities while protecting its own Pokémon.
3. **Path + Horror House, Marshadow already Benched:** worker must expect Resetting Hole to remain available despite hand lock.
4. **Path + Horror House, Marshadow not in play:** worker should credit denial of hand-played Marshadow / Field Blower / replacement Stadium for that locked turn.
5. **Path without New Moon pair:** candidate should price self-disable of its own Rule-Box Abilities rather than treating Path as one-sided.
6. **New Moon going second, pre-evolution Horror House:** worker should value denying the opponent's hand-play evolution/Underworld Door setup turn if the attack is legal.
7. **Joust target-location case:** opposing Tool is on a Benched VMAX, not Active. Klefki's Joust should not receive Tool-removal value for that board.

## Disposition

Rank 1 does not refute the retained New Moon architecture, but it imposes a clear policy requirement: **Stadium asymmetry is the real Ability-control channel; late Active Klefki is not.**

This is useful precisely because it differs from the Iron Thorns matchup, where Klefki can suppress a Basic Iron Thorns ex's Initialization. A competent fixed-60 policy must condition on the **stage/type of the opposing Ability source**, not merely whether an Ability exists.

No card change, qualified matchup, or 99.5% claim follows.
