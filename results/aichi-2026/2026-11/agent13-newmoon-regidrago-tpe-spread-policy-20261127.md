# New Moon vs Regidrago: TPE target count is a strategic choice, not an automatic +2

**Agent 13 · 27 November 2026**  
**Decision affected:** New Moon policy-competence disposition after the non-Shadow architecture selection.  
**Scope:** paper/card-text decision analysis using the unchanged New Moon Lockbreaker v1 and authenticated Aichi Regidrago lists. No game, CI, engine modification, or win-rate claim.

## Finding

The retained New Moon 60's Telepathic Psychic Energy (TPE) says to search for **up to 2** Basic Psychic Pokémon and put them onto the Bench. Against the authenticated Regidrago family, a policy that always takes two targets is strategically wrong.

The reason is a source-common Apex Dragon payload:

- every authenticated Regidrago profile contains **Dragapult ex TWM 130**;
- Apex Dragon can copy **Phantom Dive**, doing 200 damage to the Active and placing **6 damage counters** on the opponent's Bench in any distribution;
- New Moon contains **3 Unown AOR 30 at 60 HP** and **2 Duskull VIV 69 at 60 HP**.

Therefore a single Phantom Dive can Knock Out a freshly benched Unown or Duskull outright while also dealing 200 to the Active. TPE's second search target is not free value; it can create an immediate Prize liability. The policy must choose 0, 1, or 2 targets according to the actual line and the opponent's visible payload/board.

This is a direct example of Bench-capacity/AMR and connector-domination concerns: access to another Basic is not success if the added Basic is a worse use of the Bench and Prize map than leaving the slot empty.

## Why this matters against the actual Regidrago field

The authenticated Regidrago ranks are 10, 12, 13, 14, 18, 20, 21, 27 and 32. Their exact lists differ, but all use Regidrago V/VSTAR and Dragapult ex. Many also use Budew; ranks 12, 13, 14, 20, 21, 27 and 32 include a Noivern ex profile capable of supplying a protection/lock attack to Apex Dragon.

A competent Regidrago response to an indiscriminate New Moon setup is therefore:

1. use early Budew Item lock where available to narrow New Moon's Item counter/search window;
2. establish Regidrago VSTAR;
3. if New Moon widened with a low-HP TPE target, copy Phantom Dive and convert that target into a Prize while pressuring the Active;
4. if the Basic attacker is the larger threat, copy Noivern ex's Covert Flight where available so Regidrago is protected from damage by Basic Pokémon during New Moon's next turn.

The candidate cannot treat “TPE found two Basics” as a positive terminal heuristic.

## Candidate response tree

### A. Before Regidrago evolves: Horror House can buy the evolution turn

A particularly important starting-orientation line survives Budew Item lock.

Suppose New Moon already has Mewtwo & Mew-GX positioned to attack and TPE available. TPE can attach under Budew's Item lock because it is an Energy-card effect, not an Item. It can fetch Gengar & Mimikyu-GX if needed, and Perfection can copy **Horror House-GX** for one Psychic Energy.

Horror House prevents the opponent from playing cards from hand during their next turn. If Regidrago V has not evolved yet, this denies the normal hand-play evolution to Regidrago VSTAR for that turn. It also denies hand attachments and Trainers for the locked turn. This does not win the game, but it is a real tempo answer to the common Budew → evolve-next-turn plan.

The critical policy condition is **positioning**: the TPE must be attached to the Pokémon that will actually attack. Under a live Budew Item lock, searching Mewtwo to the Bench after attaching TPE somewhere else does not magically move the Energy or produce a legal switch. This is why the existing direct Mewtwo/TPE/Gengar access numbers are much smaller than TPE's general two-Basic setup rate.

### B. After Covert Flight: do not score the protected Regidrago as unreachable

If Apex Dragon copied Noivern ex's **Covert Flight**, damage from attacks by New Moon's Basic Pokémon is prevented during the next turn. That stops ordinary damage from Mewtwo & Mew-GX, Gengar & Mimikyu-GX and the other Basic attackers, but it does not erase all candidate actions.

The actor-visible response set includes:

- if GX is unused, **Horror House-GX** still has a non-damage player restriction worth considering; Covert Flight is damage prevention, not a blanket prohibition on all attack effects;
- a developed **Dusclops** is Stage 1, so its 50-damage Will-O-Wisp is not a Basic-Pokémon attack;
- Dusclops's **Cursed Blast** is an Ability that places damage counters and self-KOs; it is not attack damage, though other live Ability locks/Tools can change whether it works;
- **Escape Rope**, when Items are playable and the opponent has a Bench, can force the protected Regidrago out of the Active Spot; moving an Active Pokémon to the Bench removes attack effects on that Pokémon under the supplied rulebook;
- **Counter Catcher** can attack a different Benched target when its Prize condition is met rather than wasting a damage attack into the protected Active.

The correct action depends on GX availability, Prize map, Item lock, the opponent's Bench and whether sacrificing Dusclops is worth the counter placement. The policy should explicitly represent the protected-active state instead of collapsing it to “attack for zero” or automatic pass.

## TPE target-count rule

For the retained New Moon profile, a first policy implementation should use this qualitative target-count rule:

1. **Identify the intended attack/lock line first.** If two specific Basics are both required now (for example an attack donor and a separate lock/setup piece), two targets can be justified.
2. **Check visible Regidrago payload pressure.** If Dragapult ex is known available to Apex Dragon or the exact source profile contains it and the game state has made that payload accessible, price each 60-HP target as an immediate Bench-KO liability.
3. **Prefer one target when the second target is merely generic value.** An extra Unown for future Farewell Letter or an early Duskull with no near-term evolution can be worse than an empty Bench slot when Phantom Dive is online.
4. **Use zero targets when TPE is being attached primarily as Energy and every available Basic worsens the Prize/Bench map.** “Up to 2” permits this; access is optional.
5. **Do not discard the Duskull line entirely.** Against Covert Flight, a developed Dusclops is one of the few non-Basic attack/damage-counter channels. If the hand already contains Dusclops and the evolution can occur before Regidrago's spread converts Duskull into a Prize, fetching Duskull may be strategically necessary.
6. **After Phantom Dive becomes the opponent's likely best reply, target choice and Bench placement are one joint decision.** A policy that scores TPE and its target picker independently will overvalue board width.

## Held-out challenge states for the future actor-visible worker

These are development cases, not synthetic “wins”:

- **R12-Budew tempo:** New Moon has an attack-ready Mewtwo + TPE route; rank12 has Budew Active and Regidrago V in play. After Itchy Pollen, the policy should still find the Energy-card Horror House continuation if legal and should not require an Item merely because Item lock is active.
- **R12-Phantom-Dive target count:** Regidrago VSTAR can access Dragapult; New Moon has TPE attached and legal choices including Unown, Duskull, and a higher-HP line-relevant Basic. The target picker must be allowed to return fewer than two and should not take a second 60-HP Basic without a concrete immediate purpose.
- **R12-Covert-Flight response:** Regidrago has just copied Covert Flight. Candidate alternatives include Horror House effect, developed Dusclops, Item switch/gust if legal, and a nominal Basic damage attack. The worker must not select the Basic damage attack merely because its printed damage is highest.
- **R10-Dragapult without Noivern:** use a profile without Covert Flight to ensure the worker does not hallucinate protection and still prices Phantom Dive spread.
- **Duskull exception:** a 60-HP Duskull is fetchable and exposed, but the hand contains Dusclops and the projected next turn needs the Stage-1 line to answer a protected Regidrago. This prevents the anti-spread rule from degenerating into “never fetch Duskull.”

## Disposition

This finding **supports retaining New Moon for policy investment** because it exposes an implementable, source-specific strategic choice rather than a missing card or impossible line. It also raises the competence bar: a policy that automatically maximizes TPE search count is not adequate for the Regidrago family.

No candidate card changes are justified. Do not add HP techs, cut TPE, or make a one-card variant from this result. First implement/hold out the target-count and protected-Regidrago decisions on the unchanged 60; then use actual traces when owner-authorized execution becomes available.

No competitive matchup is qualified; the 99.5% target remains unproven.
