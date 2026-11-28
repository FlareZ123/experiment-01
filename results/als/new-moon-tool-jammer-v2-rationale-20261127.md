# New Moon Tool Jammer v2: promote one structurally material swap over v1

**Agent 1 · 27 November 2026**

> **28 November 2026 — Agent38 Prize-clock correction (card-text/rules inference, not a played-game result).** The advertised two-Dusclops sequence spends **two candidate Prizes**: each use of Cursed Blast KOs its own 90-HP Dusclops, allowing the opponent to take one Prize under the general Knock Out rules. If the opponent has **one Prize left**, the first Cursed Blast self-KO ends the game before the intended Will-O-Wisp. If the opponent has **two Prizes left**, the second Cursed Blast self-KO awards their final Prize even if it also removes BUS Vileplume; simultaneous final-Prize situations require joint win/loss resolution, never an automatic candidate win. At **three or more opponent Prizes**, this conditional knockout still trades two of ours for a single non-Rule-Box Vileplume KO and may leave the opponent one Prize away from victory. The sequence therefore **must not be described as a generally favorable forcing unlock**, even when BUS stays Active. Score the opponent's Prize clock and conditional alternative actions before promoting this flex slot. A separate counterline worth comparing (not an admitted third 60) is **Boss's Orders BRS 132** to gust the **130-HP AOR Vileplume from Bench** into Active, instantly removing BUS's Active-only attack prohibition, followed by a funded, unsuppressed Mewtwo & Mew-GX Perfection → Trevenant & Dusknoir-GX **Night Watch 150**. This can remove the **Item-lock source** with no self-KOs and no Tool slot, but depends on Boss in hand, the Supporter slot, three Psychic, an available GX attack donor and live Perfection. Own **Stealthy Hood** on the attacking Mewtwo is another one-slot counterline to BUS but does not by itself remove AOR. Neither alternative has been tested in complete qualified games. [Supporting handoff](../../communications/agent1/2026-11/20261128T031500Z_agent38-boss-gust-aor-zero-selfko-counterline.md).

> **28-Nov stronger in-lock third action — Hooded Clefairy ex:** A Japanese Pokémon [official BUS Vileplume Disgusting Pollen / Stealthy Hood Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E9%9A%A0%E5%AF%86%E3%83%95%E3%83%BC%E3%83%89&page=2&regulation=all) explicitly answers **yes**, a Basic Pokémon with Stealthy Hood can attack under BUS's Ability. The unchanged New Moon parent already has **Lillie's Clefairy ex JTG56**, whose printed **Full Moon Rondo [Psychic][Colorless]** deals **20+20 per combined Bench occupant**. At **six combined Benched Pokémon**, a correctly paid, Active **own-Hooded Clefairy** directly KOs **140-HP BUS Vileplume** while AOR Item lock is live, without Powerglass, Perfection, Supporter, Stage-1 evolution, or either Cursed Blast self-KO. Own Hood is a Tool playable through AOR; source rank15's exact 60 has **no Field Blower, Faba, Megaton Blower or Tool Jammer** to directly remove or suppress it. Unlike Boss, this leaves AOR Item lock active; unlike Jammer's double-Dusclops sequence, it risks a **190-HP two-Prize Basic** and requires the six-Bench threshold (source can play sparsely). The named one-Hood+one-Clefairy unprized gate is **80.9143416%** conditioned on a Basic-valid opening, versus **72.3645394%** for two Dusclops+Jammer; these are not action probabilities. This updates the earlier narrower Hood-on-Mewtwo counterline. **Do not promote any 60 until owner compares these alternative lines in a real actor-visible decision with an adversarial source reply.** [Owner handoff](../../communications/agent1/2026-11/20261128T031500Z_agent38-boss-gust-aor-zero-selfko-counterline.md).
 
**Proposed fixed 60:** `results/als/new-moon-tool-jammer-v2-60.json`

**Change from retained v1:**

-1 Sky Field ROS 89
+1 Tool Jammer BST 136

This is a one-card change, but it is not cosmetic. It creates an action class the parent 60 does not possess: a **Pokémon-Tool-based answer to an opponent's Active Stealthy Hood while Item lock is already active**.

## Why the parent 60 reopened

The parent v1 was retained after a full authenticated-family paper pass, with Sky Field #2 named as the first reopen slot if a specific hard-state failure emerged.

Rank 15 supplies exactly that failure.

Authenticated rank 15 contains:

- 2 Vileplume AOR 3;
- 1 Vileplume BUS 6;
- 2 Stealthy Hood UNB 186;
- 1 Grand Tree, 1 Path, 1 Silent Lab;
- TM: Evolution / Bunnelby setup that can accelerate the Stage-2 lock.

Under current rules:

- AOR Vileplume prevents **Item** cards from being played;
- Pokémon Tools are a separate Trainer type, including older Tools that historically carried Item text;
- therefore rank 15 can attach **Stealthy Hood through its own AOR Item lock**.

Once BUS Vileplume is Active with Hood and AOR Vileplume is live:

- every Basic Pokémon in New Moon is forbidden from attacking;
- Cursed Blast is prevented from affecting the Hooded BUS Vileplume;
- Field Blower and Canceling Cologne are Items and cannot be played;
- Path does not suppress the non-Rule-Box Vileplume Ability;
- the parent list has no Supporter gust.

That is a real recovery collapse, not a low-probability damage breakpoint.

## Tool Jammer changes the legal action graph under the lock

Tool Jammer is itself a **Pokémon Tool**.

Its effect while attached to the candidate Active Pokémon:

> Pokémon Tools attached to the opponent's Active Pokémon have no effect, except Tool Jammer.

Therefore AOR Vileplume does not itself prevent New Moon from attaching Tool Jammer.

If candidate can establish an **Active Dusclops with Tool Jammer**, the opponent's Active BUS Vileplume loses Stealthy Hood's protection while Tool Jammer remains active.

That re-enables the exact Stage-1 recovery package.

## Deterministic two-Dusclops lockbreak when BUS stays Active

Assume:

- AOR Vileplume is in play;
- BUS Vileplume is Active at 140 HP with Stealthy Hood;
- candidate has one Active Dusclops with `[P][P]` and Tool Jammer attached;
- candidate has a second Dusclops in play;
- Cursed Blast Abilities remain unused.

Candidate turn:

1. Tool Jammer disables Stealthy Hood on Active BUS Vileplume.
2. Benched Dusclops uses Cursed Blast -> **50 counters** on BUS, then that Dusclops self-KOs.
3. Active Dusclops uses Will-O-Wisp -> **50 damage**.
4. BUS Vileplume has now taken 100 total.

Source turn:

- if BUS retreats/switches away, the Basic-attack lock is removed, which is already a successful lockbreak;
- if BUS stays Active and uses Downer Shock, Active Dusclops takes 60 and may become Asleep/Confused.

Candidate next turn if BUS stayed Active:

5. Active Dusclops uses **Cursed Blast Ability** for the final 50 counters.
6. BUS reaches 150 total and is Knocked Out.
7. Dusclops self-KOs as part of Cursed Blast.

Asleep/Confused does not remove the Ability, so the final Cursed Blast does not depend on winning an attack coin flip.

The KO branch is deterministic **once the stated board/resource prerequisites exist and BUS stays Active**. Exact rank15 counterplay can instead move BUS off Active with Guzma/Jet/retreat, yielding a temporary unlocked turn rather than a guaranteed permanent lockbreak. See `results/aichi-2026/2026-11/agent1-tool-jammer-v2-rank15-counterplay-stress-20261127.md`.

## Tool Jammer is searchable through a channel that also survives Item lock

New Moon already has Galarian Articuno V + Forest Seal Stone.

Under AOR Item lock:

- Forest Seal Stone is a Tool, so it can still be attached;
- Star Alchemy can search any card if its Ability is not separately suppressed;
- Star Alchemy can therefore search **Tool Jammer** inside the lock.

This is materially stronger than adding an Item-based Tool remover, which would remain unusable under AOR.

## Why Sky Field #2 is the cut

Sky Field remains useful, so v2 keeps one copy.

The second copy is the lowest marginal slot because the full-family pass repeatedly found wide Bench to be dangerous:

- Raichu converts extra bodies into Electro Rain Prize packets;
- rank-30 Clefairy gains +20 Rondo per Bench body;
- rank-31 Koffing/Roxie creates more movable damage counters on wider candidate boards;
- Snorlax gains more gustable trap targets.

Sky Field still has positive roles:

- neutral Stadium replacement when Path would self-lock;
- Grand Tree / Silent Lab / Temple replacement;
- deliberate Rondo threshold construction;
- emergency Bench-cap relief.

Keeping one copy preserves those roles. Removing copy #2 mainly reduces redundancy.

### Prize redundancy cost

With two identical Sky Field copies, the probability both are in six Prizes is:

`C(2,2)*C(58,4)/C(60,6) = 0.84746%`.

With one Sky Field, its probability of being Prized is exactly:

`6/60 = 10%`.

So v2 pays a **9.15254 percentage-point increase** in the pre-K1 chance that no Sky Field is outside Prizes.

That is a real cost, not ignored.

Against it, v2 gains a unique post-lock action class that v1 otherwise lacks.

## Why not cut a broader lockbreak card

### Field Blower #2

Rejected: multi-Garbodor / Tool states can require two removals; Field Blower has broad pre-lock value.

### Canceling Cologne #2

Rejected: covers Iron Thorns, Active Klefki, BUS Vileplume when Item play is still legal, Flutter Mane, Empoleon and other Active Ability states.

### Path #2

Rejected: Path is a multi-family denial card and core to asymmetric Thorns/Electrode/Genesect/Ursaluna lines.

### Powerglass #2

Rejected: Powerglass is the lock-resilient Energy engine and part of Horror House follow-ups; reducing its redundancy attacks more families than Tool Jammer repairs.

## Broader Tool Jammer utility

Tool Jammer's primary justification is rank 15, but it is not literally blank elsewhere.

When the opponent's relevant Tool is on its **Active** Pokémon, it can also suppress:

- Stealthy Hood on other Active locks;
- damage-modifying Tools;
- retreat/utility Tools where removing their effect changes the reply;
- an Active Garbodor's Tool if the source ever promotes it, although it does not disable a Benched Garbodor Tool.

Do not overstate this. The rank-15 Hooded BUS state is the decisive reason for the slot.

## New v2 acceptance delta

Before v2 can replace v1 operationally, require:

1. **V15-JAMMER-LEGAL-UNDER-AOR** — Tool Jammer remains playable while AOR Item lock is active.
2. **V15-JAMMER-HOOD** — Active candidate Tool Jammer disables Active BUS Stealthy Hood.
3. **V15-JAMMER-DUSCLOPS-SEQUENCE** — Bench Cursed Blast 50 + Active Will-O-Wisp 50 + next-turn Active Cursed Blast 50 removes BUS if it remains Active.
4. **V15-JAMMER-SOURCE-RETREAT** — if BUS retreats/switches to evade the final 50, recognize a temporary unlocked window, then score the source's strongest later BUS re-lock instead of calling the matchup solved.
5. **V15-FSS-JAMMER** — under AOR lock with Articuno V/FSS live, Star Alchemy may search Tool Jammer.
6. **V2-SKYFIELD-SINGLETON-K1** — if the sole Sky Field is Prized, remove neutral-Sky-Field continuations and use Path/other Stadium plans instead.

## Architecture recommendation update

**Historical 27-Nov recommendation: promote Tool Jammer v2 over its exact v1 parent as a paper challenger. This is now analytically disputed and must not be treated as an unqualified strength ranking or an operational promotion.**

The reason is not novelty or one-card iteration. The new card occupies a Trainer subtype that survives the exact Item lock which disables the parent's existing Hood answers, and it converts a near-hard authenticated lock state into a concrete Stage-1 recovery sequence.

**28-Nov comparative update:** the two-Dusclops line gives away two Prizes, has a 27.6355% Basic-valid *initial Prize configuration* obstruction for two Dusclops plus Jammer before first Prize-taking, and competes with a Boss's Orders Supporter gust path that can preserve an already funded Active Mewtwo, KO AOR for one Prize and disrupt two random opponent hand cards. Restricted opening-card access is Boss 24.0569% versus Jammer 14.2690%, but this does not evaluate the legal turn, funding, or strongest source response. Source Karen/Bunnelby double TM: Evolution can rebuild AOR after the KO, so neither line is proven decisive. See [one direct decision/evidence](2026-11/agent38-boss-vs-jammer-restricted-k0-access.md). **Current honest status:** v2 remains a candidate, not demonstrably stronger than the parent or the preexisting Guzma/Sky challenger; only an actual same-state owner-controlled actor decision plus opponent reply can distinguish them.

v1 should remain preserved as the parent/control list. v2 is still **unqualified**: the new 60 needs the same actor-visible policy discipline and eventually native/full-game evidence when that work is permitted.

No 99.5% or matchup-win claim follows.