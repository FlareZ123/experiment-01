#!/usr/bin/env python3
"""Actor-visible deterministic attack planning for the fixed Psychic-energy Shadow Rider lists.

Research-only, not a game engine or production policy. No hidden deck order, search targets,
future opponent actions or newly drawn Door cards. Replan after each observed draw. JSON input
contains current public board, known held resources, and explicit defense/effect flags.
Run: python turn-plan.py STATE.json [--max-states 200000] [--limit 30]
     python turn-plan.py --test
"""
from __future__ import annotations
import argparse, dataclasses, itertools, json, sys
from collections import deque
from dataclasses import dataclass, replace

# Printed identity: type, Basic, Rule Box, base HP, retreat, prizes.
CARDS = {
    'wob': ('Psychic', True, False, 110, 2, 1),
    'v': ('Psychic', True, True, 210, 2, 2),
    'vmax': ('Psychic', False, True, 320, 2, 3),
    'clefairy': ('Psychic', True, True, 190, 1, 2),
    'lele': ('Psychic', True, True, 170, 1, 2),
    'trev': ('Psychic', True, True, 270, 3, 3),
    'latias': ('Psychic', True, True, 210, 2, 2),
    'dialga': ('Dragon', True, True, 180, 3, 2),
    'mimikyu': ('Psychic', True, False, 70, 1, 1),
    'girafarig': ('Psychic', True, False, 90, 1, 1),
    'marshadow': ('Psychic', True, False, 80, 1, 1),
    'radiant': ('Dragon', True, True, 170, 2, 1),
}
TOOLS = {'', 'hood', 'float', 'fss', 'jammer', 'generic'}
STADIUMS = {'none', 'valley', 'temple', 'sky', 'path', 'lab', 'jamming', 'swell', 'mine', 'other'}
LOCKS = {'', 'thorns', 'klefki', 'garbotoxin', 'item_vileplume', 'basic_vileplume', 'sentinel', 'block'}

@dataclass(frozen=True)
class State:
    a: int; o: int; energy: tuple; ot: tuple; et: tuple; alive: int; stadium: str
    hand_p: int; hood: int; flt: int; blower: bool; guzma: bool; stadiums: tuple
    manual: bool; retreat: bool; support: bool; stadium_used: bool; doors: int
    attack_block: int; retreat_block: int; deck: int; discarded: int = 0
    draws: int = 0; played_guzma: bool = False; played_blower: bool = False
    vs: int = 0; stretcher: int = 0; discard_p: int = 0; discard_guzma: bool = False
    played_recovery: int = 0
    played_stadium: bool = False; used_marshadow: bool = False; tools_played: int = 0

class Planner:
    def __init__(self, data):
        self.data = data
        self.own = data['own']; self.opp = data['opp']
        assert 1 <= len(self.own) <= 9 and 1 <= len(self.opp) <= 9
        self.n = len(self.own); self.m = len(self.opp)
        self.ids = [x['id'] for x in self.own]; self.eids = [x['id'] for x in self.opp]
        assert len(set(self.ids)) == self.n and len(set(self.eids)) == self.m
        for x in self.own:
            assert x['kind'] in CARDS and x.get('tool','') in TOOLS
            assert 0 <= x.get('energy',0) <= 11
        for x in self.opp:
            assert x.get('tool','') in TOOLS and x.get('lock','') in LOCKS
            assert x['hp'] > x.get('damage',0) >= 0 and 0 <= x.get('prizes',1) <= 6
            # Removing a HP-modifying tool can KO before the attack; not modeled.
            if x.get('tool_hp_extra',0): raise ValueError('HP-modifying Tool transitions not supported')
        hand = data.get('hand',{}); used = data.get('used',{})
        stadium = data.get('stadium','none'); assert stadium in STADIUMS
        stad = tuple(sorted(hand.get('stadiums',[])))
        assert all(x in {'valley','temple','sky'} for x in stad) and len(set(stad)) == len(stad)
        mask = lambda pred: sum(1<<i for i,x in enumerate(self.own) if pred(x))
        self.gx_used = used.get('gx',False)
        self.can_attack = data.get('can_attack',True)
        self.support_allowed = data.get('support_allowed',True)
        self.item_attack_lock = data.get('item_attack_lock',False)
        self.support_attack_lock = data.get('support_attack_lock',False)
        self.stadium_attack_lock = data.get('stadium_attack_lock',False)
        self.klefki_blocks_wob = data.get('klefki_blocks_wob',True)
        self.no_retreat = data.get('no_retreat',False)
        self.tool_attack_lock = data.get('tool_attack_lock',False)
        self.energy_attack_lock = data.get('energy_attack_lock',False)
        discard = data.get('discard',{})
        self.first = State(self.ids.index(data['active']), self.eids.index(data['opp_active']),
            tuple(x.get('energy',0) for x in self.own), tuple(x.get('tool','') for x in self.own),
            tuple(x.get('tool','') for x in self.opp), (1<<self.n)-1, stadium,
            hand.get('psychic',0), hand.get('hood',0), hand.get('float',0),
            hand.get('blower',False), hand.get('guzma',False), stad,
            used.get('manual',False), used.get('retreat',False), used.get('support',False), used.get('stadium',False),
            mask(lambda x:x.get('door_used',False)), mask(lambda x:x.get('attack_blocked',False)),
            mask(lambda x:x.get('retreat_blocked',False)), data.get('deck_remaining',40),
            vs=hand.get('vs',0),stretcher=hand.get('stretcher',0),
            discard_p=discard.get('psychic',0),discard_guzma=discard.get('guzma',False))
        assert self.first.hand_p >= 0 and self.first.discard_p >= 0 and sum(self.first.energy)+self.first.hand_p+self.first.discard_p <= 11
        assert 0<=self.first.vs<=4 and 0<=self.first.stretcher<=4
        assert not (self.first.guzma and self.first.discard_guzma)  # single Guzma in the candidate
        assert 0 <= self.first.hood <= 2 and 0 <= self.first.flt <= 1 and self.first.deck >= 0
        assert len(self.own)<= (9 if stadium=='sky' else 6) and len(self.opp)<= (9 if stadium=='sky' else 6)
        self.unsupported = set()

    def live_own(self,s,i): return bool(s.alive & (1<<i))
    def own_indices(self,s): return [i for i in range(self.n) if self.live_own(s,i)]
    def kind(self,i): return self.own[i]['kind']
    def basic(self,i): return CARDS[self.kind(i)][1]
    def rule(self,i): return CARDS[self.kind(i)][2]
    def psychic(self,i): return CARDS[self.kind(i)][0]=='Psychic'
    def own_tool_live(self,s,i):
        return bool(s.ot[i]) and s.stadium!='jamming' and not (i==s.a and s.et[s.o]=='jammer')
    def enemy_tool_live(self,s,i): return bool(s.et[i]) and s.stadium!='jamming'
    def hooded(self,s,i): return s.ot[i]=='hood' and self.own_tool_live(s,i)
    def enemy_hooded(self,s,i): return s.et[i]=='hood' and self.enemy_tool_live(s,i)
    def garbo(self,s):
        # Garbotoxin requires attached Tool, not an effective Tool effect. Jamming does not remove it.
        return any(x.get('lock')=='garbotoxin' and bool(s.et[i]) for i,x in enumerate(self.opp))
    def klefki(self,s):
        return self.opp[s.o].get('lock')=='klefki' and s.stadium!='lab' and not self.garbo(s)
    def wob(self,s):
        if self.kind(s.a)!='wob' or s.stadium=='lab': return False
        if self.garbo(s) and not self.hooded(s,s.a): return False
        if self.klefki(s) and self.klefki_blocks_wob and not self.hooded(s,s.a): return False
        return True
    def thorns(self,s):
        return (self.opp[s.o].get('lock')=='thorns' and s.stadium not in ('lab','path')
                and not self.garbo(s) and (not self.wob(s) or self.enemy_hooded(s,s.o)))
    def own_ability(self,s,i):
        if not self.live_own(s,i): return False
        if self.kind(i)=='wob': return i==s.a and self.wob(s)
        if s.stadium=='lab' and self.basic(i): return False
        if s.stadium=='path' and self.rule(i): return False
        if self.wob(s) and not self.psychic(i): return False  # own lock: Hood does not protect.
        if not self.hooded(s,i):
            if self.garbo(s): return False
            if self.klefki(s) and self.basic(i): return False
            if self.thorns(s) and self.rule(i): return False
        return True
    def opp_ability(self,s,i):
        x=self.opp[i]; lock=x.get('lock',''); basic=x.get('basic',True); rule=x.get('rulebox',False)
        if lock=='garbotoxin': return bool(s.et[i])
        if lock=='thorns': return i==s.o and self.thorns(s)
        if lock=='klefki': return i==s.o and self.klefki(s)
        if self.garbo(s): return False  # own-side Garbotoxin: Hood does not protect.
        if s.stadium=='lab' and basic: return False
        if s.stadium=='path' and rule: return False
        if self.klefki(s) and basic: return False
        if self.thorns(s) and rule and not x.get('future',False): return False
        if self.wob(s) and x.get('type')!='Psychic' and not self.enemy_hooded(s,i): return False
        return True
    def item_ok(self,s):
        return not self.item_attack_lock and not any(x.get('lock')=='item_vileplume' and self.opp_ability(s,i) for i,x in enumerate(self.opp))
    def support_ok(self,s):
        return (self.support_allowed and not self.support_attack_lock and not s.support and
                not (self.opp[s.o].get('lock')=='sentinel' and self.opp_ability(s,s.o)))
    def attack_ok(self,s):
        return (self.can_attack and not (s.attack_block & (1<<s.a)) and
                not (self.basic(s.a) and self.opp[s.o].get('lock')=='basic_vileplume'
                     and self.opp_ability(s,s.o) and not self.hooded(s,s.a)))
    def retreat_cost(self,s):
        if self.no_retreat or s.retreat or (s.retreat_block & (1<<s.a)): return None
        if self.opp[s.o].get('lock')=='block' and self.opp_ability(s,s.o) and not self.hooded(s,s.a): return None
        if (s.ot[s.a]=='float' and self.own_tool_live(s,s.a)) or (self.basic(s.a) and any(self.kind(i)=='latias' and self.own_ability(s,i) for i in self.own_indices(s))):
            return 0
        return CARDS[self.kind(s.a)][4]+(2 if s.stadium=='mine' else 0)+self.own[s.a].get('retreat_extra',0)
    def switch(self,s,i,o=None):
        # Moving old Active to Bench clears effects/conditions on that Pokémon.
        return replace(s,a=i,o=s.o if o is None else o,
                       attack_block=s.attack_block & ~(1<<s.a) if i!=s.a else s.attack_block,
                       retreat_block=s.retreat_block & ~(1<<s.a) if i!=s.a else s.retreat_block)
    @staticmethod
    def setv(t,i,v): return t[:i]+(v,)+t[i+1:]
    def stadium_removable(self,s):
        if s.stadium=='sky' and (s.alive.bit_count()>6 or self.m>6):
            self.unsupported.add('Sky Field removal with >5 Benched Pokémon requires discard/promotion decisions'); return False
        return s.stadium!='none'

    def actions(self,s):
        own=self.own_indices(s); bench=[i for i in own if i!=s.a]
        if s.hand_p:
            if not s.manual and not self.energy_attack_lock:
                for i in own:
                    yield f'manual Psychic -> {self.ids[i]}',replace(s,energy=self.setv(s.energy,i,s.energy[i]+1),hand_p=s.hand_p-1,manual=True)
            for j in own:
                if self.kind(j)!='vmax' or s.doors&(1<<j) or not self.own_ability(s,j):continue
                for i in bench:
                    if not self.psychic(i): continue
                    n=min(2,s.deck)
                    yield f'Underworld Door {self.ids[j]} -> {self.ids[i]}; draw {n} and replan',replace(s,energy=self.setv(s.energy,i,s.energy[i]+1),hand_p=s.hand_p-1,doors=s.doors|(1<<j),deck=s.deck-n,draws=s.draws+n)
        cost=self.retreat_cost(s)
        if cost is not None and cost<=s.energy[s.a]:
            for i in bench:
                q=self.switch(s,i)
                yield f'retreat {self.ids[s.a]} -> {self.ids[i]} (discard {cost} Psychic)',replace(q,energy=self.setv(s.energy,s.a,s.energy[s.a]-cost),retreat=True,discarded=s.discarded+cost,discard_p=s.discard_p+cost)
        if s.guzma and self.support_ok(s):
            for j in range(self.m):
                if j==s.o: continue
                for i in bench or [s.a]:
                    q=self.switch(s,i,j)
                    yield f'Guzma: opponent {self.eids[j]}, own {self.ids[i]}',replace(q,guzma=False,support=True,played_guzma=True,discard_guzma=True)
        if self.item_ok(s):
            if s.vs and s.discard_guzma and not s.guzma:
                yield 'VS Seeker -> Guzma',replace(s,vs=s.vs-1,discard_guzma=False,guzma=True,played_recovery=s.played_recovery+1)
            if s.stretcher and s.discard_p:
                yield 'Night Stretcher -> Psychic Energy',replace(s,stretcher=s.stretcher-1,discard_p=s.discard_p-1,hand_p=s.hand_p+1,played_recovery=s.played_recovery+1)
        if not s.stadium_used and not self.stadium_attack_lock:
            for name in s.stadiums:
                if name==s.stadium or (s.stadium!='none' and not self.stadium_removable(s)): continue
                result='none' if s.stadium=='swell' else name
                yield f'play {name} Stadium'+(' (Chaotic Swell discards both)' if result=='none' else ''),replace(s,stadium=result,stadiums=tuple(x for x in s.stadiums if x!=name),stadium_used=True,played_stadium=True)
        for i in own:
            if s.ot[i] or self.tool_attack_lock:continue
            if s.hood:
                yield f'attach Stealthy Hood -> {self.ids[i]}',replace(s,ot=self.setv(s.ot,i,'hood'),hood=s.hood-1,tools_played=s.tools_played+1)
            if s.flt:
                yield f'attach Float Stone -> {self.ids[i]}',replace(s,ot=self.setv(s.ot,i,'float'),flt=s.flt-1,tools_played=s.tools_played+1)
        if s.blower and self.item_ok(s):
            targets=[('own',i) for i in own if s.ot[i]]+[('opp',i) for i in range(self.m) if s.et[i]]
            if self.stadium_removable(s): targets.append(('stadium',-1))
            for n in (1,2):
                for comb in itertools.combinations(targets,n):
                    ot,et,stad=s.ot,s.et,s.stadium; names=[]
                    for side,i in comb:
                        if side=='own':ot=self.setv(ot,i,'');names.append('own '+self.ids[i]+' Tool')
                        elif side=='opp':et=self.setv(et,i,'');names.append('opponent '+self.eids[i]+' Tool')
                        else:stad='none';names.append('Stadium')
                    yield 'Field Blower: '+', '.join(names),replace(s,ot=ot,et=et,stadium=stad,blower=False,played_blower=True)
        if self.stadium_removable(s):
            for i in bench:
                if self.kind(i)=='marshadow' and self.own_ability(s,i):
                    yield f'Resetting Hole {self.ids[i]} (discard Stadium and this Pokémon)',replace(s,alive=s.alive&~(1<<i),energy=self.setv(s.energy,i,0),ot=self.setv(s.ot,i,''),stadium='none',discarded=s.discarded+s.energy[i],discard_p=s.discard_p+s.energy[i],used_marshadow=True)

    def effective_opp_energy(self,s,i):
        x=self.opp[i]
        return x.get('temple_energy',x.get('energy',0)) if s.stadium=='temple' else x.get('energy',0)
    def cost(self,s,p,c):return p+max(0,c-(s.stadium=='valley' and self.psychic(s.a)))
    def defense(self,s,i,key,default=None):
        x=self.opp[i]
        if x.get('defense_is_ability',False) and not self.opp_ability(s,i): return default
        return x.get(key,default)
    def damage(self,s,raw,bypass=False):
        x=self.opp[s.o]; k=self.kind(s.a); category={'all','basic' if self.basic(s.a) else 'evolution'}
        if self.rule(s.a): category.add('rulebox')
        if k in ('v','vmax'):category.add('v')
        if k in ('clefairy','latias'):category.add('ex')
        if k in ('lele','trev','dialga'):category.add('gx')
        if set(self.defense(s,s.o,'prevent_damage_from',[]) or [])&category:return 0
        dmg=raw
        if not bypass and self.psychic(s.a):
            fairy=x.get('type')=='Dragon' and any(self.kind(i)=='clefairy' and self.own_ability(s,i) for i in self.own_indices(s))
            if fairy or x.get('weakness')=='Psychic':dmg*=2
            dmg-=x.get('psychic_resistance',0)
        return max(0,dmg+self.defense(s,s.o,'damage_modifier',0))
    def attack_effect_allowed(self,s,i):
        return not (self.defense(s,i,'prevent_attack_effects',False) or (self.opp[i].get('mist_energy',False) and s.stadium!='temple'))
    def counters_allowed(self,s,i):
        return self.attack_effect_allowed(s,i) and not self.defense(s,i,'prevent_counters',False)
    def prizes_for(self,s,i,counters=False):
        x=self.opp[i]; key='prizes_counters' if counters else 'prizes_damage'
        if s.stadium=='temple' and 'prizes_temple' in x:return x['prizes_temple']
        return x.get(key,x.get('prizes',1))
    def attacks(self,s):
        if not self.attack_ok(s):return
        k=self.kind(s.a); a=s.energy[s.a]; total=sum(s.energy); target=self.opp[s.o]
        # The list's only Energy is basic Psychic. Dialga and Radiant's printed attacks are not payable.
        options=[]
        def add(name,p,c,raw=0,effect='',gx=False,bypass=False,counters=False,heal=0):
            if a>=self.cost(s,p,c) and (not gx or not self.gx_used):
                options.append((name,p,c,raw,effect,gx,bypass,counters,heal))
        if k=='v':
            add('Shadow Mist',1,0,10,'opponent cannot play Special Energy or Stadium from hand next turn')
            add('Astral Barrage',0,3,counters=True)
        elif k=='vmax':add('Max Geist',0,3,10+30*total)
        elif k=='wob':add('Psychic Assault',1,1,10+target.get('damage',0))
        elif k=='clefairy':add('Full Moon Rondo',1,1,20+20*(s.alive.bit_count()-1+self.m-1))
        elif k=='latias':add('Eon Blade',2,1,200,'cannot attack during next own turn unless effect cleared')
        elif k=='lele':
            add('Energy Drive',0,2,20*(a+self.effective_opp_energy(s,s.o)),bypass=True)
            heal=sum(sorted((self.own[i].get('damage',0) for i in self.own_indices(s) if i!=s.a),reverse=True)[:2])
            add('Tapu Cure-GX',1,0,effect='heal two Benched Pokémon',gx=True,heal=heal)
        elif k=='trev':
            add('Night Watch',3,0,150,'shuffle two random opponent hand cards into deck')
            pale='delayed KO if defending Pokémon remains affected'
            if a>=self.cost(s,1,1)+1:pale+='; discard all Energy from defending Pokémon'
            add('Pale Moon-GX',1,1,effect=pale,gx=True)
        elif k=='girafarig':
            add('Get Lost',0,1,effect='put two selected visible opponent discard cards in Lost Zone')
            add('Mind Shock',0,3,70,bypass=True)
        elif k=='marshadow':add('Red Knuckles',0,1,70 if target.get('ultra_beast',False) else 10)
        elif k=='mimikyu':
            add('Filch',0,1,effect='draw two')
            # A supplied recipe is not an automatic rules proof. The actor must validate prior attack and effect.
            recipe=self.data.get('copycat_recipe')
            if recipe and recipe.get('legal',False):
                add('Copycat: '+recipe['name'],1,1,recipe.get('damage',0),recipe.get('effect',''),recipe.get('gx',False),recipe.get('bypass_weakness',False))
        for name,p,c,raw,effect,gx,bypass,counters,heal in options:
            if counters:
                for targets in itertools.combinations(range(self.m),min(2,self.m)):
                    damages=tuple(50 if self.counters_allowed(s,i) else 0 for i in targets)
                    yield name,targets,damages,effect,gx,heal,self.cost(s,p,c)
            else:
                damages=(self.damage(s,raw,bypass) if raw else 0,)
                if name=='Pale Moon-GX' and not self.attack_effect_allowed(s,s.o):effect='attack effect prevented (public effect-protection flag)'
                yield name,(s.o,),damages,effect,gx,heal,self.cost(s,p,c)

    def solve(self,max_states=200000,limit=30):
        paths={self.first:None}; queue=deque([self.first]); best={}; incomplete=False
        def path(s):
            p=[]
            while paths[s] is not None:
                prev,action=paths[s];p.append(action);s=prev
            return list(reversed(p))
        while queue:
            s=queue.popleft()
            for attack,targets,damages,effect,gx,heal,cost in self.attacks(s) or ():
                remain=[self.opp[i]['hp']-self.opp[i].get('damage',0) for i in targets]
                ko=[i for i,d,hp in zip(targets,damages,remain) if d>=hp]
                prizes=sum(self.prizes_for(s,i,attack=='Astral Barrage') for i in ko)
                capped=sum(min(d,hp) for d,hp in zip(damages,remain))
                # Transparent representative ranking per same attack/target, not global win-rate utility.
                score=(prizes,capped,heal,-s.discarded,-int(s.played_guzma),-int(s.played_blower),
                       -int(s.played_stadium),-int(s.used_marshadow),-s.tools_played,-s.played_recovery,s.draws,s.hand_p)
                key=(s.a,attack,targets,effect)
                old=best.get(key)
                if old is None or score>old[0]:best[key]=(score,s,damages,ko,prizes,effect,gx,heal,cost)
            for action,q in self.actions(s):
                if q in paths:continue
                if len(paths)>=max_states:incomplete=True;continue
                paths[q]=(s,action);queue.append(q)
        results=[]
        for (i,attack,targets,effect),(_,s,damages,ko,prizes,_,gx,heal,cost) in best.items():
            results.append({'attacker':self.ids[i],'attack':attack,'targets':[self.eids[j] for j in targets],
                'damage_or_counters':list(damages),'ko':[self.eids[j] for j in ko],'immediate_prizes':prizes,
                'attack_cost':cost,'effect':effect,'gx':gx,'heal':heal,'actions':path(s),
                'board_psychic':{self.ids[j]:s.energy[j] for j in self.own_indices(s)},'known_hand_psychic':s.hand_p,
                'discarded_psychic':s.discarded,'door_draws':s.draws,'stadium':s.stadium,
                'recovery_items_used':s.played_recovery})
        results.sort(key=lambda x:(-x['immediate_prizes'],-sum(x['damage_or_counters']),-x['heal'],x['discarded_psychic'],len(x['actions']),x['attack']))
        return {'states':len(paths),'complete_within_model':not incomplete,'distinct_attack_target_options':len(results),
                'options':results[:limit],'omitted_options':max(0,len(results)-limit),'unsupported':sorted(self.unsupported),
                'boundary':'Known-resource plan only; replan after observed Door draws. No bench/evolution/search/hidden order, opponent future action, full copy or defense resolver. Caller supplies effective public flags. Representative ranking is not a game-win policy.'}

    def lethal_option(self,s,attack,path):
        name,targets,damages,effect,gx,heal,cost=attack
        ko=[i for i,d in zip(targets,damages) if d>=self.opp[i]['hp']-self.opp[i].get('damage',0)]
        prizes=sum(self.prizes_for(s,i,name=='Astral Barrage') for i in ko)
        return {'attacker':self.ids[s.a],'attack':name,'targets':[self.eids[i] for i in targets],
                'damage_or_counters':list(damages),'ko':[self.eids[i] for i in ko],
                'immediate_prizes':prizes,'actions':path,'effect':effect,'gx':gx,'attack_cost':cost,
                'board_psychic':{self.ids[i]:s.energy[i] for i in self.own_indices(s)},
                'known_hand_psychic':s.hand_p,'door_draws':s.draws,'stadium':s.stadium},ko

    def followup(self,s,attack,ko,prizes,promotion):
        """Construct one no-opponent-action extra-turn information state.

        Unknown newly taken Prize cards and mandatory draw are deliberately ignored. Caller
        must certify there are no unmodeled KO/attack/turn-start triggers; no Checkup occurs.
        """
        name,targets,damages,effect,gx,heal,cost=attack
        if s.deck<1:return None
        own=[]
        for i in self.own_indices(s):
            x=dict(self.own[i]);x.update(energy=s.energy[i],tool=s.ot[i],door_used=False,
                attack_blocked=bool(s.attack_block&(1<<i)),retreat_blocked=bool(s.retreat_block&(1<<i)))
            own.append(x)
        dealt=dict(zip(targets,damages));opp=[]
        for i,x0 in enumerate(self.opp):
            if i in ko:continue
            x=dict(x0);x.update(damage=x.get('damage',0)+dealt.get(i,0),tool=s.et[i]);opp.append(x)
        data=dict(self.data);data.pop('copycat_recipe',None)
        data.update(own=own,opp=opp,active=self.ids[s.a],opp_active=self.eids[promotion],stadium=s.stadium,
             hand={'psychic':s.hand_p,'hood':s.hood,'float':s.flt,'blower':s.blower,'guzma':s.guzma,'stadiums':list(s.stadiums),'vs':s.vs,'stretcher':s.stretcher},
             discard={'psychic':s.discard_p,'guzma':s.discard_guzma},
             used={'gx':self.gx_used or gx},deck_remaining=s.deck-1,can_attack=True,support_allowed=True,
             prizes_remaining=self.data['prizes_remaining']-prizes)
        if self.data.get('attack_locks_expire_after_turn',True):
            data.update(item_attack_lock=False,support_attack_lock=False,stadium_attack_lock=False,tool_attack_lock=False,energy_attack_lock=False)
        return Planner(data)

    def find_lethal(self,max_states=200000,max_followup=128,allow_extra=True):
        """Find a direct win, or a contingent extra-turn win for every legal promotion.

        This proves existence in the restricted known-resource model, not game-engine legality.
        Unknown drawn cards are not used. A capped search can establish a found path, not absence.
        """
        remaining=self.data.get('prizes_remaining');assert isinstance(remaining,int) and 1<=remaining<=6
        certified=bool(self.data.get('no_unmodeled_terminal_triggers',False))
        paths={self.first:None};queue=deque([self.first]);incomplete=False;checks=0;follow_states=0;pending=[]
        def path(s):
            p=[]
            while paths[s] is not None:
                prev,act=paths[s];p.append(act);s=prev
            return list(reversed(p))
        recipe=self.data.get('copycat_recipe',{})
        while queue:
            s=queue.popleft()
            for attack in self.attacks(s) or ():
                name,targets,damages,*_=attack
                ko=[i for i,d in zip(targets,damages) if d>=self.opp[i]['hp']-self.opp[i].get('damage',0)]
                prizes=sum(self.prizes_for(s,i,name=='Astral Barrage') for i in ko)
                if prizes>=remaining or len(ko)==self.m:
                    opt,_=self.lethal_option(s,attack,path(s))
                    return {'found':True,'kind':'immediate','conditional_on_no_unmodeled_triggers':not certified,
                        'first':opt,'states':len(paths),'followup_checks':checks,'followup_states':follow_states}
                if (allow_extra and recipe.get('legal') and recipe.get('extra_turn') and recipe.get('gx')
                        and name=='Copycat: '+recipe['name'] and s.deck>=1):
                    pending.append((prizes,s,attack,ko))
            for act,q in self.actions(s):
                if q in paths:continue
                if len(paths)>=max_states:incomplete=True;continue
                paths[q]=(s,act);queue.append(q)
        # Prefer higher first-attack prizes, then more unspent resources and fewer discarded energy.
        pending.sort(key=lambda x:(-x[0],x[1].discarded,-x[1].hand_p,-x[1].guzma,-sum(x[1].energy)))
        if pending and not certified:
            return {'found':False,'complete_within_model':False,'states':len(paths),'reason':'Extra-turn guarantee requires explicit no_unmodeled_terminal_triggers certification','extra_candidates':len(pending)}
        for prizes,s,attack,ko in pending:
            if checks>=max_followup:incomplete=True;break
            checks+=1;branches={};ok=True
            promotions=[i for i in range(self.m) if i not in ko] if s.o in ko else [s.o]
            for i in promotions:
                nxt=self.followup(s,attack,ko,prizes,i)
                if nxt is None:ok=False;break
                res=nxt.find_lethal(max_states=max_states,max_followup=0,allow_extra=False)
                follow_states+=res.get('states',0)
                if not res['found']:
                    if not res.get('complete_within_model',True):incomplete=True
                    ok=False;break
                branches[self.eids[i]]=res['first']
            if ok:
                opt,_=self.lethal_option(s,attack,path(s))
                return {'found':True,'kind':'extra_turn','first':opt,'after_every_legal_promotion':branches,
                    'states':len(paths),'followup_checks':checks,'followup_states':follow_states,
                    'conditional_on_no_unmodeled_triggers':False,
                    'boundary':'No opponent turn or Checkup; unknown Prize cards and next draw ignored. Copycat recipe legality must be independently established.'}
        return {'found':False,'complete_within_model':not incomplete,'states':len(paths),'extra_candidates':len(pending),
            'followup_checks':checks,'followup_states':follow_states}


def fixtures():
    thorns=lambda id:{'id':id,'type':'Lightning','hp':230,'prizes':2,'rulebox':True,'basic':True,'future':True,'lock':'thorns','energy':2}
    return {
        'thorns_cycle':{'own':[{'id':'vmax1','kind':'vmax','energy':3},{'id':'vmax2','kind':'vmax','energy':3},{'id':'wob','kind':'wob','tool':'float'}],
            'opp':[thorns('thorns1'),thorns('thorns2')],'active':'vmax1','opp_active':'thorns1','stadium':'valley','hand':{'psychic':2,'guzma':True}},
        'protected_vileplume':{'own':[{'id':'wob','kind':'wob','tool':'float'},{'id':'latias','kind':'latias','energy':1},{'id':'vmax','kind':'vmax','energy':1}],
            'opp':[{'id':'vile','type':'Grass','hp':130,'basic':False,'lock':'item_vileplume','tool':'hood'}],
            'active':'wob','opp_active':'vile','stadium':'valley','hand':{'psychic':1,'blower':True}},
        'basic_attack_lock':{'own':[{'id':'wob','kind':'wob','tool':'float'},{'id':'latias','kind':'latias','energy':2}],
            'opp':[{'id':'vile','type':'Grass','hp':140,'basic':False,'lock':'basic_vileplume','tool':'hood'}],
            'active':'wob','opp_active':'vile','stadium':'valley','hand':{'hood':1}},
        'astral_double':{'own':[{'id':'v','kind':'v','energy':2}], 'opp':[{'id':'a','type':'Grass','hp':50},{'id':'b','type':'Grass','hp':50}],
            'active':'v','opp_active':'a','stadium':'valley'},
        'timeless_lethal':{'own':[{'id':'mimikyu','kind':'mimikyu','energy':1},{'id':'vmax','kind':'vmax','energy':3},{'id':'clefairy','kind':'clefairy'},{'id':'latias','kind':'latias'}],
            'opp':[{'id':'drago-star','type':'Dragon','hp':280,'prizes':2,'rulebox':True,'basic':False},{'id':'drago-v','type':'Dragon','hp':220,'prizes':2,'rulebox':True},{'id':'dedenne','type':'Lightning','hp':160,'prizes':2,'rulebox':True}],
            'active':'mimikyu','opp_active':'drago-star','stadium':'valley','hand':{'psychic':1},'prizes_remaining':4,
            'no_unmodeled_terminal_triggers':True,'copycat_recipe':{'name':'Apex Dragon / Timeless-GX','legal':True,'damage':150,'effect':'take another turn; skip Checkup','gx':True,'extra_turn':True}},
        'garbo_remove':{'own':[{'id':'vmax','kind':'vmax','energy':1},{'id':'latias','kind':'latias','energy':1}],
            'opp':[{'id':'target','type':'Grass','hp':100},{'id':'garbo','type':'Psychic','hp':100,'basic':False,'lock':'garbotoxin','tool':'generic'}],
            'active':'latias','opp_active':'target','stadium':'valley','hand':{'psychic':1,'blower':True}},
    }

def selftest():
    f=fixtures(); r=Planner(f['thorns_cycle']).solve(); assert r['complete_within_model']
    p=next(x for x in r['options'] if x['attack']=='Max Geist' and x['immediate_prizes']==2 and x['door_draws']>=2)
    assert any('Guzma' in a and 'own wob' in a for a in p['actions']) and any('retreat wob' in a for a in p['actions'])
    no=dict(f['thorns_cycle']);no['hand']={'psychic':2};r2=Planner(no).solve();assert not any(x['immediate_prizes'] for x in r2['options'])
    r=Planner(f['protected_vileplume']).solve();assert any(x['attack']=='Eon Blade' and x['immediate_prizes']==1 for x in r['options']); assert not any('Field Blower' in a for x in r['options'] for a in x['actions'])
    r=Planner(f['basic_attack_lock']).solve();assert any(x['attack']=='Eon Blade' and x['immediate_prizes']==1 and any('Stealthy Hood' in a for a in x['actions']) for x in r['options'])
    no=dict(f['basic_attack_lock']);no['hand']={};assert not any(x['attack']=='Eon Blade' for x in Planner(no).solve()['options'])
    r=Planner(f['astral_double']).solve();assert any(x['attack']=='Astral Barrage' and x['immediate_prizes']==2 for x in r['options'])
    r=Planner(f['garbo_remove']).solve();assert any(x['attack']=='Max Geist' and any('Field Blower' in a for a in x['actions']) and x['door_draws'] for x in r['options'])
    # Jamming disables Tool effects but leaves Garbotoxin's attached-Tool condition true.
    g=dict(f['garbo_remove']);g['stadium']='jamming';p=Planner(g);assert p.garbo(p.first) and not p.own_ability(p.first,0)
    # Mist Energy stops counters, Temple restores the effect. A counters-only prevention does not block Pale Moon.
    q=dict(f['astral_double']);q['opp']=[dict(x,mist_energy=True) for x in q['opp']];p=Planner(q);assert not p.counters_allowed(p.first,0);assert p.counters_allowed(replace(p.first,stadium='temple'),0)
    q['opp']=[dict(x,mist_energy=False,prevent_counters=True) for x in q['opp']];p=Planner(q);assert not p.counters_allowed(p.first,0) and p.attack_effect_allowed(p.first,0)
    q=f['timeless_lethal'];r=Planner(q).find_lethal();assert r['found'] and r['kind']=='extra_turn' and set(r['after_every_legal_promotion'])=={'drago-v','dedenne'}
    no=dict(q);no['hand']={};r=Planner(no).find_lethal();assert not r['found'] and r['complete_within_model']
    no=dict(q);no['used']={'gx':True};assert not Planner(no).find_lethal()['found']
    no=dict(q);no['deck_remaining']=0;assert not Planner(no).find_lethal()['found']
    no=dict(q);no['no_unmodeled_terminal_triggers']=False;assert not Planner(no).find_lethal()['found']
    # Recover spent Guzma or discarded Psychic only from the known public discard.
    q=dict(f['thorns_cycle']);q['hand']={'psychic':1,'vs':1,'stretcher':1};q['discard']={'guzma':True,'psychic':1}
    r=Planner(q).solve();p=next(x for x in r['options'] if x['immediate_prizes']==2);assert 'VS Seeker -> Guzma' in p['actions'] and 'Night Stretcher -> Psychic Energy' in p['actions']
    assert p['recovery_items_used']==2 and p['door_draws']==4
    q['item_attack_lock']=True;assert not any(x['immediate_prizes'] for x in Planner(q).solve()['options'])
    q=dict(f['basic_attack_lock']);q['tool_attack_lock']=True;assert not any(x['attack']=='Eon Blade' for x in Planner(q).solve()['options'])
    q=dict(f['protected_vileplume']);q['energy_attack_lock']=True;assert any(x['attack']=='Eon Blade' and x['immediate_prizes']==1 for x in Planner(q).solve()['options']) # Door still works
    print('All focused actor-visible tactical tests passed.')

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('state',nargs='?');p.add_argument('--test',action='store_true');p.add_argument('--fixture',choices=fixtures());p.add_argument('--max-states',type=int,default=200000);p.add_argument('--limit',type=int,default=30);p.add_argument('--lethal',action='store_true');p.add_argument('--max-followup',type=int,default=128);a=p.parse_args()
    if a.test:selftest();return
    if not a.state and not a.fixture:p.error('supply state JSON or --fixture')
    data=fixtures()[a.fixture] if a.fixture else json.load(open(a.state))
    planner=Planner(data);result=planner.find_lethal(a.max_states,a.max_followup) if a.lethal else planner.solve(a.max_states,a.limit)
    print(json.dumps(result,indent=2))
if __name__=='__main__':main()
