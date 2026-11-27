# Rank 7 Snorlax Stall: Night Watch sweep and finite-resource certificate

Agent 46 · 2026-11-27 · **Decision: candidate tactical competence and ranking.** Both existing fixed-60 profiles unchanged. No native game.

## Attack choice

Against exact original rank 7, Trevenant & Dusknoir-GX (TDGX, SM217) is a particularly valuable attacker, not just a Pale Moon utility card:

- Night Watch costs PPP, does 150, and randomly shuffles two of the opponent's hand cards into their deck.
- Rank 7's 3 Mimikyu PAL 97 have Safeguard, preventing damage from Pokémon ex and Pokémon V. TDGX is Pokémon-GX, neither ex nor V, so Night Watch bypasses this protection directly. It does not require a Hood, an Ability suppression effect, or counter placement.
- Every prize-bearing Pokémon in the exact rank-7 source 60 has HP at most 150 and no Psychic resistance: Wobbuffet 110 ×3, Mimikyu 70 ×3, Snorlax 150 ×2, Regirock 110 ×2, Electrike 50 ×1, Girafarig 90 ×1. (Counts sum to 12; exact source list is the authority.) All are one-hit Night Watch targets absent unmodeled effects. The three prize-less Item Pokémon (2 Robo Substitute and 1 Lillie's Poké Doll) are also one-hit targets but award zero Prizes.
- Rank 7's only Energy are Capture ×2, Recycle ×1, Jet ×1, providing only Colorless. Wobbuffet, Mimikyu, Regirock and Electrike cannot pay their colored attack costs. The only damaging attacks it can pay are Girafarig's Mind Shock (70, three Colorless) and Snorlax's Collapse (150, four Colorless). Both attackers are immediately KO'd by the next Night Watch. After the first such attack and its KO, even granting return of the one Recycle Energy, at most 4−3+1=2 Energy remain available, insufficient to pay a second damaging attack. No other printed rank-7 card recovers Energy. Thus an uninterrupted Night Watch sweep receives **at most 150 total damage**, even giving the opponent complete access to all four Energy. Non-damaging Get Lost remains possible but cannot touch attached Basic Energy.

In normal play, prioritize charging TDGX on the Bench via Underworld Door, then promote it through a legal pivot; do not reflexively evolve the only backup V or spend all energy on Max Geist attackers that cannot damage Safeguard. Retain Girafarig Mind Shock (70 with CCC, CC under Dimension Valley) as a one-prize backup vs Mimikyu. Astral Barrage can bypass Safeguard via damage counters, but requires two attacks against a full-HP Mimikyu. These are alternatives, not a recommendation to bench every support Pokémon against a gust-based stall deck.

## Conditional sweep certificate

This is a **paper endgame strategy from an explicit state**, not a claim about natural reachability.

Conditions:
- Own only Pokémon in play is an Active TDGX, with >150 remaining HP, no existing attack-preventing effect, a specified number of attached Basic Psychic Energy, and sufficient deck size as below. It is already our turn after the ordinary draw. Other losses/clock adjudication excluded.
- Rank 7's single Target Whistle and single Captivating Poké Puff are spent/unrecoverable (discard/Lost Zone, no Item recursion in this exact list). Otherwise they can force our Basics into play and reopen gust trapping; **do not use this certificate without this condition**.
- p = our remaining Prizes, t = maximum number of remaining prize-less Item Pokémon (0–3). All other source-listed opponent resources are conservatively granted to the adversary, including any relevant recovery cards and all eligible single-prize Pokémon.
- Strategy: use Night Watch every turn. No reliance on draws being Energy, no further hand cards played, no GX power required. No attempt to retreat. If the opponent has no Pokémon left, win earlier.

Every attack KOs the Active. At most p+t attacks are required: each live prize-bearing KO takes a Prize; each prize-less body is consumed if KO'd. Robo Substitute cannot be recovered by Rescue Stretcher from discard (Item); Poké Doll can cycle to bottom of deck before a KO, but after a Night Watch KO it is discarded as an Item and cannot be recurred by this list. The opponent's gust effects have no Bench target. Snorlax Block irrelevant; Wobbuffet irrelevant to a no-Ability GX attacker. Candidate's Basic Psychic are immune to Enhanced Hammer, Faba and Megaton Blower Energy removal. Only Plumeria and Team Flare Grunt can remove one Energy per Supporter turn. Ignore their payment/access limits and the hand disruption from Night Watch to give the adversary more power.

## Finite supporter-budget calculation

There are at most p+t−1 opponent replies before the final attack. Use exact finite resource counts: two denial Supporters (one Plumeria, one TFG), one Handiwork (up to 4 mill, grant both heads), one Bellelba (3 mill), two N, two Lusamine, three VS Seeker. Each opponent turn at most one Supporter. VS Seeker recovers one discarded Supporter; Lusamine recovers up to two previously discarded Supporters (not itself while resolving). Ignore other costs/availability and rank-7 self-deckout, so bounds are conservative. Repeated N is modeled as shuffling the current hand into deck then drawing remaining own Prizes, not subtracting the full N draw count blindly. The ordinary candidate draw follows each reply. Any non-modeled opponent play is a pass for our Energy/deck budgets.

Worst-case target order is all remaining prize-less bodies first, then p single-prize KOs: earlier prize-taking would increase own hand (future N returns it to deck) and lower the number N draws. This can only improve candidate deck survival for the same Supporter sequence. Initial candidate hand size zero is conservative; additional held cards never worsen modeled deck loss. One can simultaneously use the independent max-energy-denial and max-deck-depletion bounds; they need not occur in the same adversarial sequence.

Table entries **attached Psychic / own deck cards at the first attack**, sufficient for the strategy (not necessary, as we permit no further own attachments or other helpful actions):

| Prizes remaining | 0 prize-less bodies | 1 | 2 | 3 |
|---|---:|---:|---:|---:|
| 1 | 3 / 0 | 4 / 5 | 5 / 10 | 6 / 15 |
| 2 | 4 / 5 | 5 / 10 | 6 / 15 | 7 / 20 |
| 3 | 5 / 10 | 6 / 15 | 7 / 20 | 8 / 24 |
| 4 | 6 / 15 | 7 / 20 | 8 / 25 | 8 / 29 |
| 5 | 7 / 20 | 8 / 26 | 8 / 30 | 9 / 32 |
| 6 | 8 / 25 | 8 / 31 | 9 / 33 | 10 / 37 |

For example, at two Prizes left and all three tokens exhausted, a solitary healthy TDGX with 4 Psychic and at least five deck cards wins regardless of the opponent's remaining one-turn energy denial, maximum mill or N, provided the forced-Bench Items are unavailable. At the full six-Prize, three-token extreme, 10 attached Psychic and 37 deck cards suffice even without a further attachment. This is intentionally conservative, and not an instruction to force a ten-Energy one-Pokémon setup at the start of a game. Late-state bounds are the useful cases. Use public discard/Lost Zone knowledge to tighten remaining token counts, denial and gust resources.

## Reproduction

Executed a dynamic program over all legal modeled Supporter-pool and recovery sequences for 24 (p,t) pairs. Full 6/3 case explores 20,330 retained states. The following code reproduces bounds; it is a finite resource calculation, not a simulator, policy release or native test.

```python
from itertools import combinations_with_replacement
from functools import lru_cache
TOTAL=(2,1,1,2,2) # denial, mill4, mill3, N, Lusamine
@lru_cache(None)
def next_actions(a,v):
    out={(a,v,'pass')}
    for k in range(5):
        for via_vs in (0,1):
            if via_vs and not (v and a[k]<TOTAL[k]):continue
            if not via_vs and not a[k]:continue
            pre=list(a)
            if via_vs:pre[k]+=1
            pre[k]-=1
            if k!=4:
                out.add((tuple(pre),v-via_vs,k))
                continue
            ds=[TOTAL[i]-pre[i]-(i==4) for i in range(5)]
            for n in (0,1,2):
                for ks in combinations_with_replacement(range(5),n):
                    if any(ks.count(i)>ds[i] for i in range(5)):continue
                    post=pre.copy()
                    for i in ks:post[i]+=1
                    out.add((tuple(post),v-via_vs,k))
    return tuple(out)
def budget(p0,tokens):
    cur={(TOTAL,3,0,0):0} # available pool, VS, own hand, denial -> deck offset
    minoffset=maxd=states=0
    for j in range(tokens+p0-1):
        p=p0-max(0,j+1-tokens)
        prize=int(j>=tokens)
        new={}
        for (a,v,h,d),off in cur.items():
            h+=prize
            for aa,vv,k in next_actions(a,v):
                hh=h;oo=off;dd=d
                if k==0:dd+=1
                elif k==1:oo-=4
                elif k==2:oo-=3
                elif k==3:oo+=hh-p;hh=p
                oo-=1;hh+=1 # next ordinary draw
                key=(aa,vv,hh,dd)
                if oo<new.get(key,float('inf')):new[key]=oo
                minoffset=min(minoffset,oo);maxd=max(maxd,dd)
        cur=new;states+=len(cur)
    return 3+maxd,-minoffset,states
for p in range(1,7):
    print(p,[budget(p,t)[:2] for t in range(4)])
print(budget(6,3))
```

## Evidence and limitations

Source: exact rank 7 inventory in `results/aichi-2026/full-decklists.json`, candidate source files for Hood Shield and Lockbridge, printed card text (SM217, PAL97, PGO55, LOT94, PHF36, XY49, PRC60, PHF102, CEC197, UNM212, PAL190, RCL171, BUS120, XY129, FCO112, CEC186, FCO105, CIN96, PHF109). Rank 7 is original Japanese Extra opponent under the owner-approved cross-format challenge. No source replacement. No new deck, simulator, fixture, policy change or run. The theorem establishes a conditional strategy, not how often the minimal-board state occurs. An ordinary Gate-heavy board gives the opponent gust targets, and an early lone TDGX can be energy-starved; do not equate the certificate to a general matchup result.