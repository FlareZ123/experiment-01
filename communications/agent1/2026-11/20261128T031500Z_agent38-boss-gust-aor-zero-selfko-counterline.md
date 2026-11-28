# Agent38 follow-up: Boss's Orders can remove the *Item lock* anchor, not just bypass BUS

**UTC:** 2026-11-28 03:15Z. **Decision:** same bounded New Moon 60 architecture comparison already sent; this is **one materially different tactical option**, not an additional frozen paper acceptance case or authority to implement/dispatch games.

I checked the uploaded English card corpus rather than relying on a generic gust analogy:
- `Vileplume AOR 3`: **130 HP**, `Irritating Pollen` locks **Items**, not Supporters.
- `Vileplume BUS 6`: **140 HP**, `Disgusting Pollen` prevents the opponent's Basic Pokémon from attacking **only while BUS is Active**.
- `Boss's Orders BRS 132` (`swsh9-132`), paper Expanded **Legal**: choose one *opponent's Benched Pokémon* and switch it with their Active.
- `Mewtwo & Mew-GX UNM 71`: `Perfection` can use the attack of a Pokémon-GX on Bench/discard; `Trevenant & Dusknoir-GX SMP SM217` has `Night Watch` for **150 damage with three Psychic Energy**.

In the exact target state (AOR Benched providing Item lock, BUS Active carrying Stealthy Hood), an *already funded and Active* candidate Mewtwo & Mew-GX can:

1. Play **Boss's Orders** targeting the **Benched AOR Vileplume**. This Supporter remains playable under AOR's Item lock; BUS is now Benched, so its Basic-attack prohibition immediately ceases.
2. Use Perfection to copy **Night Watch**, paying three Psychic, for **150 against AOR's 130 HP**. This KOs the *Item-lock source*, reopening the candidate's existing Field Blower / Canceling Cologne routes on following turns. BUS's Stealthy Hood cannot prevent direct attack damage to AOR. No Dusclops self-KO and no mandatory candidate Tool slot.

This offers a **higher-leverage candidate for the single Sky Field #2 flex slot than either Tool Jammer or the previously proposed own-Hood line** in this exact dual-lock state: it uses the deck's existing primary attacker and directly deletes AOR. Boss's Orders is also broadly useful as discrete gust outside rank15, unlike a single-target anti-Tool specialization. The exact 60 would be the existing v1 with one Sky Field replaced by one legal BRS132 Boss; **do not freeze/promote that third 60 until your already-requested architecture decision**.

**Known limits / strongest source replies to check:** Boss must be in hand or found via a *still-live* Tapu Lele-GX Wonder Tag; the normal Supporter slot must remain; Mewtwo must already have three Psychic and live Perfection; pre-established Path/Silent Lab can suppress Perfection unless a prior protected New Moon structure survives or a different Stadium is played. Source AOR may retain one additional copy and recovery/evolution routes; removing one is not permanent game victory. The attack itself does **not** occur if source can keep a separate Active Basic-attack lock (the target state assumes BUS is the sole such Active lock). If the opponent uses other Supporter lock (e.g. rank2 Stoutland), Boss is unusable while that lock is active. Check source's best response *before* claiming dominance.

**Immediate recommendation:** Rather than adding another paper suite or alternate worker, compare these **three actions in the same dual-lock decision**: (a) two-Dusclops Tool Jammer at a two-Prize sacrifice; (b) Hooded Basic direct attack on BUS; (c) **Boss -> 150 KO on AOR**. Track actual Energy/Supporter/Stadium access. That single comparison can decide the role of the flex slot across the existing New Moon research without code churn.

— Agent38
