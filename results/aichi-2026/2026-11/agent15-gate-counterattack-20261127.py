"""Matched two-turn card-resource policy, NOT a Pokémon game simulator.
One fixed public loaded-Dragon board; opponent takes no actions. No win rates.
"""
from collections import Counter
from itertools import product
from random import Random
import sys

SEED=int(sys.argv[2]) if len(sys.argv)>2 else 27112027
N=int(sys.argv[1]) if len(sys.argv)>1 else 40000
# Special physical slots shared between architectures.
BASE=(['R']*3+['r4']+['V']*3+['v4']+['C','c2','L','G','Z','Tapu','Trev','Mimi','Gir','Mar']
      +['P']*11+['T']*4+['F']*4+['Q','H','D','Float','Arven','FSS']+['Lillie']*2+['VS']*2+['Iono','Team','Raihan','Acerola','Guzma','BC','Blower','N','US','Sky','Ranger']+['Hood']*2)
assert len(BASE)==60
MAPS={'hood':{'r4':'R','v4':'V','c2':'C'},'solar':{'r4':'EsV','v4':'EsMax','c2':'M'},
      'solar_offense':{'r4':'EsV','v4':'EsMax','c2':'C'}}
BASICS={'R','C','L','G','Z','Tapu','Trev','Mimi','Gir','Mar','EsV','M'}
RETREAT={'R':2,'C':1,'L':2,'G':2,'Z':3,'Tapu':1,'Trev':3,'Mimi':1,'Gir':1,'Mar':1,'EsV':1,'M':1,'V':2,'EsMax':2}
SEARCH={x:('T','Q','F') for x in BASICS-{'G','Z'}}
SEARCH.update(G=('T','Q'),Z=('T','Q'),P=('F',),V=('T',),EsMax=('T',),D=(),Float=())
# Preserve scarce attack and search resources when paying generic discard costs.
DISCARD_PRIORITY=['Ranger','Blower','Hood','Sky','Guzma','Acerola','Iono','BC','VS','US','Team','Raihan','N','FSS','Arven','Lillie','Z','Trev','Tapu','Gir','Mar','Mimi','G','EsV','V','EsMax','R','M','L','C','Float','D','H','Q','T','F','P']

class State:
    def __init__(self, cards, rng):
        self.rng=rng; self.hand=list(cards[:7]); self.prize=list(cards[7:13]); self.deck=list(cards[13:]); self.board=[]
        self.attachments=0;self.retreat_paid=0;self.knockout_paid=0;self.stadium_paid=0;self.door_count=0;self.extra_attach=0;self.discard=[];self.lost_prizes=0;self.damage_log=[]
        self.stadium=False;self.sky=False;self.keep_sky=False; self.float=False; self.manual=False; self.support=False; self.attacker=None
        self.star_used=False; self.hybrid=False; self.allow_star=False;self.active=0;self.float_index=None;self.rondo=False;self.deoxys=False;self.fss_index=None
    def draw(self,n):
        self.hand+=self.deck[:n]; del self.deck[:n]
    def shuffle(self): self.rng.shuffle(self.deck)
    def put(self,card):
        self.hand.remove(card); self.board.append({'card':card,'P':0,'used':False}); return len(self.board)-1
    def plan(self,targets):
        available=Counter(self.hand); d=Counter(self.deck); p=Counter(self.prize); disc=Counter(self.discard); missing=[]
        for t in targets:
            if available[t]: available[t]-=1
            else: missing.append(t)
        opts=[]
        for t in missing:
            o=list(SEARCH[t]) if d[t] else []
            if t in BASICS and p[t]:o.append('H')
            if disc[t] and (t in BASICS or t in ('V','EsMax','P')):o.append('N')
            if not o:return None
            opts.append(o)
        choices=[]
        for combo in product(*opts):
            u=Counter(combo)
            if any(u[c]>available[c] for c in u):continue
            zones={'deck':Counter(),'prize':Counter(),'discard':Counter()}
            for t,c in zip(missing,combo):zones['prize' if c=='H' else ('discard' if c=='N' else 'deck')][t]+=1
            if any(any(k>pool[t] for t,k in zones[z].items()) for z,pool in (('deck',d),('prize',p),('discard',disc))):continue
            if sum(available.values())-len(combo)<u['T']+u['Q']:continue
            # Favor no-discard routes, but preserve Fog for energy on tied paths.
            choices.append((u['T']+u['Q'],u['F'],u['H'],combo))
        return min(choices)[-1] if choices else None
    def acquire(self,targets):
        combo=self.plan(targets)
        if combo is None:return False
        held=Counter(self.hand); reserved=Counter(); missing=[]
        for t in targets:
            if held[t]>reserved[t]:reserved[t]+=1
            else:missing.append(t)
        future=Counter(combo)
        for t,c in zip(missing,combo):
            self.hand.remove(c); future[c]-=1
            if c in ('T','Q'):
                drop=next(x for x in DISCARD_PRIORITY if self.hand.count(x)>reserved[x]+future[x])
                self.hand.remove(drop);self.discard.append(drop)
            if c!='H':self.discard.append(c)
            if c=='N':self.discard.remove(t)
            elif c=='H':
                i=self.prize.index(t);self.prize[i]='H';self.rng.shuffle(self.prize)
            else:
                self.deck.remove(t);self.shuffle()
            self.hand.append(t);reserved[t]+=1
        assert all(self.hand.count(x)>=n for x,n in Counter(targets).items())
        return True
    def star(self,target):
        # The two Gate VMAX are Pokémon V; at least one has a free Tool slot.
        if not self.allow_star or self.star_used or 'FSS' not in self.hand or target not in self.deck:return False
        host=next((i for i in range(len(self.board)-1,-1,-1) if i!=self.float_index and self.board[i]['card'] in ('R','EsV','V','EsMax')),None)
        if host is None:return False
        self.fss_index=host
        self.hand.remove('FSS');self.deck.remove(target);self.hand.append(target)
        self.shuffle();self.star_used=True;return True
    def ensure(self,target):return self.acquire([target]) or self.star(target)
    def has(self,c):return any(b['card']==c for b in self.board)
    def cap(self):return 9 if self.sky else 6
    def bench(self,c):
        if len(self.board)>=self.cap() or c not in self.hand:return False
        self.put(c);return True
    def place_stadium(self,card):
        assert card in ('D','Sky') and card in self.hand
        if card=='D':
            if self.stadium:return
            self.hand.remove('D');self.stadium=True
            if self.sky:
                self.sky=False;self.discard.append('Sky')
                # Sky Field's leave-play effect is discard, not a KO. Preserve
                # attacker, Active, weakness source, pivot and live Doors.
                while len(self.board)>6:
                    i=min((i for i in range(len(self.board)) if i not in (self.active,self.attacker)),key=lambda j:(IMPORTANCE[self.board[j]['card']]+4*self.board[j]['P'],j))
                    b=self.board.pop(i);self.discard += [b['card']]+b.get('under',[])+['P']*b['P'];self.stadium_paid+=b['P']
                    if i==self.float_index:self.discard.append('Float')
                    if i==self.fss_index:self.discard.append('FSS')
                    def adjust(x):return None if x is None or x==i else x-int(x>i)
                    self.active=adjust(self.active);self.attacker=adjust(self.attacker);self.float_index=adjust(self.float_index);self.fss_index=adjust(self.fss_index)
        elif not self.sky and not self.stadium:
            self.hand.remove('Sky');self.sky=True
    def play_direct(self):
        if (self.hybrid or self.rondo) and not self.stadium and not (self.sky and self.keep_sky) and 'D' not in self.hand:self.star('D')
        if 'D' in self.hand and not self.stadium and not (self.sky and self.keep_sky):self.place_stadium('D')
        elif 'Sky' in self.hand and not self.stadium and not self.sky:self.place_stadium('Sky')
        if ('Float' in self.hand and self.float_index is None and not self.has('L')
                and self.active!=self.attacker and self.fss_index!=self.active):
            self.hand.remove('Float');self.float=True;self.float_index=self.active
        needs_pivot=self.active!=self.attacker and self.board[self.active]['P']<self.pivot_cost()
        for c in (('L','C') if needs_pivot else ('C','L')):
            if not self.has(c):self.bench(c)
    def energy(self,index):
        if not self.ensure('P'):return False
        self.hand.remove('P');self.board[index]['P']+=1;self.attachments+=1;return True
    def vs_support(self,preferred):
        if preferred in self.hand:return True
        if 'VS' in self.hand and 'BC' in self.hand and preferred in self.deck and preferred not in self.discard:
            self.hand.remove('BC');self.discard.append('BC');self.deck.remove(preferred);self.discard.append(preferred);self.shuffle()
        if 'VS' in self.hand and preferred in self.discard:
            self.hand.remove('VS');self.discard.append('VS');self.discard.remove(preferred);self.hand.append(preferred);return True
        return False
    def support_access(self,preferred):
        if self.vs_support(preferred):return True
        if preferred not in self.deck:return False
        # Entry Ability uses a real new Bench slot; leave space for C and
        # the mobility source if neither has already been established.
        need=(not self.has('C'))+int(not self.has('L') and self.active!=self.attacker and self.board[self.active]['P']<self.pivot_cost())
        if len(self.board)+need>=self.cap() or not self.acquire(['Tapu']):return False
        if not self.bench('Tapu'):return False
        self.deck.remove(preferred);self.hand.append(preferred);self.shuffle();return True
    def arven(self,item='F',tool=None):
        if self.support:return False
        if not self.support_access('Arven'):return False
        self.hand.remove('Arven');self.discard.append('Arven')
        if item in self.deck:self.deck.remove(item);self.hand.append(item)
        if tool is None:
            if (self.hybrid or self.rondo) and not self.stadium and not self.star_used and 'D' in self.deck:tool='FSS'
            elif not self.has('L') and self.active!=self.attacker and self.board[self.active]['P']<self.pivot_cost():tool='Float'
            elif not self.star_used:tool='FSS'
        if tool in self.deck:self.deck.remove(tool);self.hand.append(tool)
        self.shuffle();self.support=True;self.play_direct();return True
    def draw_support(self,card):
        self.hand.remove(card);self.discard.append(card)
        if card=='Lillie':self.deck+=self.hand;self.hand=[];self.shuffle();self.draw(8)
        else:self.rng.shuffle(self.hand);self.deck+=self.hand;self.hand=[];self.draw(6)
        self.support=True
    def lillie(self):
        if self.support:return False
        for card in ('Lillie','Iono'):
            if self.support_access(card):self.draw_support(card);self.play_direct();return True
        return False
    def recover_support(self):
        if self.support or not self.lost_prizes:return False
        # Battle Compressor may make an existing VS Seeker live and put basic
        # Psychic into discard for Raihan. Never conjure a missing connector.
        if 'BC' in self.hand and 'VS' in self.hand and 'Raihan' in self.deck and ('P' in self.discard or 'P' in self.deck):
            self.hand.remove('BC');self.discard.append('BC');self.deck.remove('Raihan');self.discard.append('Raihan')
            if 'P' not in self.discard:self.deck.remove('P');self.discard.append('P')
            self.shuffle()
        if 'P' not in self.discard and 'BC' in self.hand and 'P' in self.deck and ('Raihan' in self.hand or ('Raihan' in self.discard and 'VS' in self.hand)):
            self.hand.remove('BC');self.discard.append('BC');self.deck.remove('P');self.discard.append('P');self.shuffle()
        if 'P' in self.discard and self.support_access('Raihan'):
            self.hand.remove('Raihan');self.discard.append('Raihan');self.discard.remove('P')
            self.board[self.attacker]['P']+=1;self.attachments+=1;self.extra_attach+=1;self.support=True
            needs=[]
            if not self.has('C'):needs.append('C')
            if self.active!=self.attacker and self.board[self.active]['P']<self.pivot_cost():needs+=['L','Float']
            if not self.stadium:needs.append('D')
            if self.board[self.attacker]['P']<self.attack_cost():needs.append('P')
            for c in needs+['P','N','F']:
                if c in self.deck:self.deck.remove(c);self.hand.append(c);self.shuffle();break
            self.play_direct();return True
        if self.support_access('Team'):
            self.hand.remove('Team');self.discard.append('Team');self.support=True
            needs=[]
            if not self.has('C'):needs.append('C')
            if self.active!=self.attacker and self.board[self.active]['P']<self.pivot_cost():needs+=['L','Float']
            if not self.stadium:needs.append('D')
            if self.board[self.attacker]['P']<self.attack_cost():needs.append('P')
            picks=[]
            for c in needs+['P','P','N','F']:
                if len(picks)==2:break
                if c in self.deck:
                    if c=='Float' and ('L' in picks or self.has('L')):continue
                    self.deck.remove(c);self.hand.append(c);picks.append(c)
            self.shuffle();self.play_direct();return True
        return False
    def stamp(self):
        if not self.lost_prizes or 'US' not in self.hand:return False
        self.hand.remove('US');self.discard.append('US');self.deck+=self.hand;self.hand=[];self.shuffle();self.draw(5);self.play_direct();return True
    def support_energy(self):
        if self.support:return False
        self.play_direct()
        if self.recover_support():return True
        if 'F' in self.deck and 'P' in self.deck and self.arven():return True
        return self.lillie()
    def support_missing(self):
        if self.support:return False
        self.play_direct()
        if self.recover_support():return True
        if (self.hybrid or self.rondo) and not self.stadium and 'D' in self.deck and not self.star_used and 'FSS' in self.deck:
            if self.arven(tool='FSS'):return True
        if not self.has('L') and self.active!=self.attacker and self.board[self.active]['P']<self.pivot_cost() and 'Float' in self.deck:
            if self.arven(tool='Float'):return True
        if not self.has('C') and len(self.board)<self.cap():
            item='H' if 'C' in self.prize else 'F'
            if item in self.deck and self.arven(item=item):return True
        return self.lillie() or self.support_energy()
    def evolve(self,index):
        c=self.board[index]['card']; target={'R':'V','EsV':'EsMax'}.get(c)
        if not target or not self.ensure(target):return False
        self.hand.remove(target);self.board[index]['card']=target;self.board[index].setdefault('under',[]).append(c);return True
    def doors(self,allow_support,active=0):
        # Use current active after a possible Sky Field discard. Recompute
        # source and destination after a Supporter changed the board.
        while True:
            for i,b in enumerate(self.board):
                if i!=self.active and b.get('old_basic') and b['card']=='R': self.evolve(i)
            src=next((b for b in self.board if b['card']=='V' and not b['used']),None)
            if src is None:return
            target=self.attacker if self.attacker!=self.active else next((i for i,b in enumerate(self.board) if i!=self.active and b['card'] not in ('G','Z')),None)
            if target is None:return
            if not self.energy(target):
                if not allow_support or not self.support_energy():return
                continue
            src['used']=True;self.door_count+=1;self.draw(2);self.play_direct()
    def pivot_cost(self):
        if self.active==self.attacker:return 0
        if self.has('L') and self.board[self.active]['card'] in BASICS:return 0
        return 0 if self.float_index==self.active else ({'EsV':2,'EsMax':3}.get(self.board[self.active]['card'],RETREAT[self.board[self.active]['card']]) if self.deoxys else RETREAT[self.board[self.active]['card']])
    def attack_cost(self):
        return (2 if self.rondo else 3)-int(self.stadium)
    def missing(self):
        cost=self.attack_cost()
        return (not self.has('C') or self.board[self.attacker]['P']+(self.plan(['P']) is not None and not self.manual)<cost or (self.active!=self.attacker and self.board[self.active]['P']<self.pivot_cost()))

HP={'R':210,'V':320,'C':190,'L':210,'G':170,'Z':180,'Tapu':170,'Trev':270,'Mimi':70,'Gir':90,'Mar':80,'M':60,'EsV':200,'EsMax':310}
PRIZE={c:1 for c in BASICS};PRIZE.update(R=2,EsV=2,C=2,L=2,Tapu=2,Trev=3,Z=2,V=3,EsMax=3)
IMPORTANCE={'C':8,'L':5,'V':10,'EsMax':9,'R':4,'M':7,'G':0,'Tapu':1,'Trev':2,'EsV':3,'Mimi':1,'Z':1,'Mar':1,'Gir':1}

def source_attack(s,kind):
    if kind=='quiet':return
    assert kind in ('phantom','trifrost')
    n=len(s.board); damage=[0]*n
    hp=[(330 if b['card']=='EsMax' else 210) if s.deoxys and b['card'] in ('EsMax','EsV') else HP[b['card']] for b in s.board]
    solar=s.hybrid and not s.deoxys; dna=s.hybrid and s.deoxys; barrier=s.has('M')
    # The source policy is one fixed public-board heuristic: maximize prizes,
    # then deny weakness/pivot/engine and barrier, then spread pressure.
    def score(arr):
        ko=[i for i,d in enumerate(arr) if d>=hp[i]]
        return (sum(PRIZE[s.board[i]['card']] for i in ko),sum(IMPORTANCE[s.board[i]['card']] for i in ko),sum(min(d,hp[i])*IMPORTANCE[s.board[i]['card']] for i,d in enumerate(arr)))
    if kind=='trifrost':
        # Additive score: choose three individual targets with greatest
        # lexicographic marginal value. Equivalent to enumerating triples.
        single=[]
        for i in range(n):
            d=max(0,110-30*int(dna)) if i==0 or not barrier else 0
            arr=[d if j==i else 0 for j in range(n)]
            single.append((score(arr),-i,d))
        for _,neg_i,d in sorted(single,reverse=True)[:3]:damage[-neg_i]=d
    else:
        damage[0]=200-30*int(dna)
        eligible=[i for i in range(1,n) if not (solar and s.board[i]['P'])]
        if eligible:
            # Fresh targets are undamaged; only Mew (60 HP) can be KO'd by
            # six counters. Otherwise a linear score is maximized by putting
            # all counters on the highest-importance eligible target.
            target=max(eligible,key=lambda i:(PRIZE[s.board[i]['card']] if hp[i]<=60 else 0,IMPORTANCE[s.board[i]['card']],-i))
            damage[target]+=60
    ko={i for i,d in enumerate(damage) if d>=hp[i]}
    s.damage_log=[(b['card'],damage[i],i in ko) for i,b in enumerate(s.board)]
    for i in ko:
        b=s.board[i];s.lost_prizes+=PRIZE[b['card']];s.knockout_paid+=b['P'];s.discard += [b['card']]+b.get('under',[])+['P']*b['P']
        if i==s.float_index:s.discard.append('Float')
        if i==s.fss_index:s.discard.append('FSS')
    # Gate VMAX cannot be one-shot by either isolated attack. Surviving player
    # selects an available low-cost promotion, keeping the intended attacker
    # Benched for Door unless there is no alternative.
    assert s.attacker not in ko
    alive=[i for i in range(n) if i not in ko]
    if 0 not in ko:promote=0
    else:
        candidates=[i for i in alive if i!=s.attacker] or alive
        latias=any(s.board[i]['card']=='L' for i in alive)
        def promote_score(i):
            c=s.board[i]['card'];ret=0 if (latias and c in BASICS) or i==s.float_index else ({'EsV':2,'EsMax':3}.get(c,RETREAT[c]) if s.deoxys else RETREAT[c])
            return (max(0,ret-s.board[i]['P']),0 if c=='C' else 1,ret,PRIZE[c],i)
        promote=min(candidates,key=promote_score)
    order=[promote]+[i for i in alive if i!=promote];idx={old:new for new,old in enumerate(order)}
    s.board=[s.board[i] for i in order];s.attacker=idx[s.attacker];s.active=0
    s.float_index=idx.get(s.float_index);s.fss_index=idx.get(s.fss_index)

def t1_support_access(s,preferred):
    if s.vs_support(preferred):return True
    if preferred not in s.deck or len(s.board)>=3:return False
    if not s.acquire(['Tapu']) or not s.bench('Tapu'):return False
    s.deck.remove(preferred);s.hand.append(preferred);s.shuffle();return True

def t1_support(s):
    # Going second only. Use Arven on an existing Gate route if already
    # held, or as an access fallback. Avoid spending a Bench slot on Tapu
    # solely to tutor a redundant Supporter when Gate is already available.
    gate=s.plan(['G']) is not None
    item='H' if 'G' in s.prize else ('T' if 'T' in s.deck else 'Q')
    if gate:item='F' if 'F' in s.deck else 'T'
    tool='FSS' if not s.star_used and 'FSS' in s.deck else 'Float'
    if (item in s.deck or tool in s.deck) and ('Arven' in s.hand or not gate) and t1_support_access(s,'Arven'):
        s.hand.remove('Arven');s.discard.append('Arven')
        for c in (item,tool):
            if c in s.deck:s.deck.remove(c);s.hand.append(c)
        s.shuffle();s.support=True;return
    if not gate:
        for card in ('Lillie','Iono'):
            if t1_support_access(s,card):s.draw_support(card);return

def t1_star_gate(s):
    if s.plan(['G']) is not None or 'FSS' not in s.hand:return
    target='G' if 'G' in s.deck else ('H' if 'G' in s.prize and 'H' in s.deck else None)
    if target is None and 'G' in s.discard and 'N' in s.deck:target='N'
    if target is None:return
    if not any(b['card'] in ('R','EsV') for b in s.board):
        for c in ('R','EsV'):
            if len(s.board)<3 and s.acquire([c,'FSS']) and s.bench(c):break
    s.star(target)


def go(cards, variant, seed, allow_support, going_second=False, oppbench=None, combat='quiet'):
    s=State(cards,Random(seed)); opening=list(s.hand);s.deoxys=variant.startswith('deoxys');robust=variant.endswith('_robust');variant=variant.removesuffix('_robust')
    # C/L early are valuable because the ordinary 5-slot Bench fills quickly.
    order=('L','R','Trev','EsV','C','Tapu','Gir','Mar','Mimi','M','Z','G') if robust else ('L','C','Tapu','Mimi','Gir','Mar','R','EsV','M','Trev','Z','G')
    active=next(c for c in order if c in opening)
    s.put(active);s.draw(1);s.allow_star=allow_support
    if active!='G':
        if going_second and allow_support:t1_support(s)
        if allow_support:t1_star_gate(s)
    if active=='G' or s.plan(['G']) is None:return ('no_gate',False,False,False,False,False,0,0,'none',0,False)
    if 'D' in s.hand:s.place_stadium('D')
    elif 'Sky' in s.hand:s.place_stadium('Sky')
    d=Counter(s.deck)
    hybrid=variant!='hood' and d['V']>=1 and d['EsMax']>=1
    if variant in ('solar_adapt','solar_offense_adapt','deoxys_adapt','deoxys_choice','solar_choice') and not going_second and d['V']>=2:
        # No future draw lookahead: use hybrid only with a held route to Valley
        # (or if two Riders are impossible). D in deck is K1 feasibility.
        hybrid=hybrid and (s.stadium or 'D' in s.hand or ('D' in s.deck and ('FSS' in s.hand or 'Arven' in s.hand)))
    if variant in ('deoxys_choice','solar_choice') and d['V']>=2 and oppbench is not None and oppbench>=2 and (s.has('C') or s.plan(['G','C']) is not None):
        hybrid=False
    s.hybrid=hybrid
    pair=['V','EsMax'] if hybrid else ['V','V']
    if (not hybrid and d['V']<2):return ('no_pair',False,False,False,False,False,0,0,'none',0,False)
    targets=['G']; bench_taken=3+len(s.board)-1
    # Prioritize weakness and pivot; never spend a Bench slot twice.
    def add(t,b):
        nonlocal bench_taken
        if b and bench_taken>=s.cap()-1:return False
        if s.plan(targets+[t]) is None:return False
        targets.append(t);bench_taken+=int(b);return True
    for c in ('C','L'):
        if not s.has(c):add(c,True)
    if not s.has('L') and 'L' not in targets:add('Float',False)
    if hybrid and not s.stadium and not s.sky:add('D',False)
    add('P',False)
    # Third or fourth Rider Door requires an old Basic and a spare VMAX
    # outside the fixed Gate pair. An optional R cannot create a third
    # Door when every remaining VMAX is Prized.
    remaining_rider_max=Counter(s.deck)['V']+Counter(s.hand)['V']-pair.count('V')
    existing_rider_basics=sum(b['card']=='R' for b in s.board)
    for _ in range(max(0,remaining_rider_max-existing_rider_basics)):
        if not add('R',True):break
    if hybrid and not s.has('M') and ('M' in s.hand or 'M' in s.deck or 'M' in s.prize):add('M',True)
    if not hybrid and not s.stadium and not s.sky:add('D',False)
    if oppbench is not None:
        need=(6 if going_second else 5)-oppbench
        for c in ('R','C','Trev','EsV','L','Z','Tapu','Gir','Mar','Mimi'):
            if bench_taken>=need:break
            if not s.has(c) and c not in targets:add(c,True)
    assert s.acquire(targets)
    for t in targets:
        if t in BASICS and t!='G':assert s.bench(t)
    for b in s.board:b['old_basic']=True
    if 'D' in targets:s.place_stadium('D')
    if 'Float' in targets and not s.has('L') and s.fss_index!=0:s.hand.remove('Float');s.float=True;s.float_index=0
    if 'P' in targets:
        target=next((i for i,b in enumerate(s.board) if b['card']=='M'),0) if hybrid else 0
        if robust:
            # Fund a benched Mew only if the hybrid protection exists.
            # Otherwise pay real retreat if necessary, or charge Clefairy
            # for Rondo while Latias provides a free pivot.
            mew=next((i for i,b in enumerate(s.board) if b['card']=='M' and i!=0),None)
            clef=next((i for i,b in enumerate(s.board) if b['card']=='C'),None)
            if hybrid and mew is not None:target=mew
            elif s.has('L') or s.float_index==0:target=clef if clef is not None else 0
            else:target=0
        s.hand.remove('P');s.board[target]['P']+=1;s.attachments+=1
    assert s.bench('G')
    for c in pair:
        s.deck.remove(c);s.board.append({'card':c,'P':0,'used':False,'old_basic':False})
    s.shuffle();assert len(s.board)<=s.cap()
    s.attacker=next(i for i,b in enumerate(s.board) if b['card']==('EsMax' if hybrid else 'V'))
    t1_mew_charged=any(b['card']=='M' and b['P'] for b in s.board)
    if going_second:source_attack(s,combat)
    s.draw(1);s.manual=False;s.support=False;s.allow_star=allow_support
    if oppbench is not None and (6 if going_second else 5)-oppbench>5:s.keep_sky=True
    s.play_direct()
    # Conditional public board: Rondo is a genuine cheaper alternative. Only
    # select it when it reaches the required damage from visible Bench counts
    # and has a viable attachment/pivot route. No counterfactual replay oracle.
    if oppbench is not None:
        threshold=280 if going_second else 220
        need=(6 if going_second else 5)-oppbench
        if need<=s.cap()-1:
            if not s.has('C') and len(s.board)<s.cap() and s.ensure('C'):s.bench('C')
            if s.has('C'):
                for c in ('R','C','Trev','EsV','L','Z','Tapu','Gir','Mar','Mimi'):
                    if len(s.board)-1>=need or len(s.board)>=s.cap():break
                    if not s.has(c) and s.ensure(c):s.bench(c)
        clef=next((i for i,b in enumerate(s.board) if b['card']=='C'),None)
        if clef is not None and 2*(20+20*(len(s.board)-1+oppbench))>=threshold:
            can_valley=s.stadium or (not (s.sky and s.keep_sky) and ('D' in s.hand or ('D' in s.deck and 'FSS' in s.hand and not s.star_used)))
            if clef!=s.active or s.board[clef]['P']+1>=2-int(can_valley) or (s.lost_prizes and 'P' in s.discard and 'Raihan' in s.hand):
                s.attacker=clef;s.rondo=True
    s.play_direct();s.doors(allow_support)
    s.play_direct()
    if s.missing() and s.stamp():s.doors(allow_support);s.play_direct()
    # Need the weakness source and a legal pivot. Use distinct, paid connectors.
    for c in (('L','C') if s.board[s.active]['P']<s.pivot_cost() else ('C','L')):
        if not s.has(c) and len(s.board)<s.cap() and s.ensure(c):s.bench(c)
    s.play_direct()
    # If our only obstruction is missing pieces, one fixed Supporter fallback.
    if allow_support and s.missing() and s.support_missing():
        s.play_direct();s.doors(allow_support);s.play_direct()
        for c in (('L','C') if s.board[s.active]['P']<s.pivot_cost() else ('C','L')):
            if not s.has(c) and len(s.board)<s.cap() and s.ensure(c):s.bench(c)
        s.play_direct()
    # Pivot while Active is still Basic, then use any new Rider Door after
    # evolving that now-Benched old Basic. Energy attached to an Active cannot
    # be the recipient of Underworld Door; later Door attaches elsewhere.
    cost=s.pivot_cost()
    if cost-s.board[0]['P']==1 and s.board[s.attacker]['P']>=s.attack_cost():
        if s.energy(0):s.manual=True
    pivot=s.board[0]['P']>=cost
    if pivot:
        s.board[0]['P']-=cost;s.retreat_paid+=cost;s.discard+=['P']*cost;s.active=s.attacker
        s.doors(allow_support,active=s.attacker)
        if not s.manual:
            if s.energy(s.attacker):s.manual=True
            elif allow_support and s.support_energy() and s.energy(s.attacker):s.manual=True
        s.play_direct()
    payable=pivot and s.board[s.attacker]['P']>=s.attack_cost()
    n=sum(b['P'] for b in s.board); weak=s.has('C')
    assert n==s.attachments-s.retreat_paid-s.knockout_paid-s.stadium_paid and len(s.board)<=s.cap()
    physical=s.hand+s.deck+s.prize+s.discard+sum(([b['card']]+b.get('under',[])+['P']*b['P'] for b in s.board),[])
    if s.stadium:physical+=['D']
    if s.sky:physical+=['Sky']
    if s.float_index is not None:physical+=['Float']
    if s.fss_index is not None:physical+=['FSS']
    assert Counter(physical)==Counter(cards), (Counter(physical)-Counter(cards),Counter(cards)-Counter(physical))
    assert s.float_index is None or s.fss_index is None or s.float_index!=s.fss_index
    assert s.attachments<=2+s.extra_attach+s.door_count
    dmg2=((20+20*(len(s.board)-1+oppbench)) if s.rondo else ((160 if s.deoxys else 120) if hybrid else 10+30*n))*(2 if weak else 1)
    dmg3=((20+20*(len(s.board)-1+oppbench)) if s.rondo else ((160 if s.deoxys else (0 if combat=='trifrost' else 180)) if hybrid else 10+30*n))*(2 if weak else 1)
    return ('hybrid' if hybrid else 'riders',payable,payable and dmg2>=220,payable and dmg3>=280,
            weak,t1_mew_charged,n,sum(b['used'] for b in s.board if b['card']=='V'),('rondo' if s.rondo else (('maxdrain' if s.deoxys else 'mindstorm') if hybrid else 'geist')),s.lost_prizes,payable and dmg3>=280 and s.lost_prizes<2)

def main():
    rng=Random(SEED); variants=tuple(sys.argv[4].split(',')) if len(sys.argv)>4 else ('hood','hood_robust','solar_adapt_robust','solar_offense_adapt_robust','deoxys_adapt_robust','deoxys_choice_robust','solar_choice_robust')
    combat=sys.argv[3] if len(sys.argv)>3 else 'quiet'
    scenarios=(None,0,2,4)
    turns=(False,True) if combat=='quiet' else (True,)
    results={(v,g,b):Counter() for v in variants for g in turns for b in scenarios};valid=0
    pairs={(v,g,b):Counter() for v in variants[1:] for g in turns for b in scenarios}
    for j in range(N):
        a=BASE.copy();rng.shuffle(a)
        if not any(MAPS['hood'].get(x,x) in BASICS for x in a[:7]):continue
        valid+=1; seed=rng.getrandbits(64)
        for second,oppbench in product(turns,scenarios):
            outcomes={}
            for variant in variants:
                vbase=variant.removesuffix('_robust')
                mapname='hood' if vbase=='hood' else ('solar_offense' if vbase in ('solar_offense_adapt','deoxys_adapt','deoxys_choice','solar_choice') else 'solar')
                cards=[MAPS[mapname].get(x,x) for x in a]
                c=results[variant,second,oppbench]
                mode,attack,koV,koStar,weak,mew,n,doors,choice,prizeslost,efficient=go(cards,variant,seed,True,second,oppbench,combat)
                if mode in ('hybrid','riders'):
                    c['source_prizes_sum']+=prizeslost;c['source_prizes_0']+=prizeslost==0;c['source_prizes_1']+=prizeslost==1;c['source_prizes_2plus']+=prizeslost>=2
                c['efficient_return_ko']+=efficient
                c[choice+'_chosen']+=1;c[choice+'_ko']+=(koStar if second else koV)
                c['low_energy_ko']+=bool((koStar if second else koV) and choice!='mindstorm')
                c[mode]+=1;c['attack']+=attack;c['koV']+=koV;c['koStar']+=koStar
                c['chargedMew']+=mew;c['attack_chargedMew']+=attack and mew;c['koStar_chargedMew']+=koStar and mew
                if mode in ('hybrid','riders'):
                    c['energy_sum']+=n;c['doors_sum']+=doors
                    c[mode+'_attack']+=attack;c[mode+'_koV']+=koV;c[mode+'_koStar']+=koStar
                outcomes[variant]=koStar if second else koV
            for v in variants[1:]:pairs[v,second,oppbench][(outcomes[variants[0]],outcomes[v])]+=1
    print('seed',SEED,'combat',combat,'attempted',N,'valid',valid)
    for k,c in results.items():
        print(k)
        for x,n in sorted(c.items()):print(' ',x,n,round(100*n/valid,5) if not x.endswith('_sum') else '')
        assert c['attack']>=c['koStar'] and c['attack']>=c['koV']
    for k,c in pairs.items(): print('paired',k,dict(c))
if __name__=='__main__':main()
