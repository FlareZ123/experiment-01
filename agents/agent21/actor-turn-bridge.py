#!/usr/bin/env python3
"""Research-only adapter: existing actor request -> known-resource KO plan -> native root token.

The input is a detached aichi-policy-request-v2 plus detached public catalog enum values
and membership sets, not a Store, diagnostic or arbitrary private snapshot. No game runner.
Only a conservative subset of board effects is admitted. Output is an advisory root intent;
revalidate each native prompt/observation and replan after draws. Never deploy to a frozen worker.
"""
import argparse, importlib.util, json, re, sys
from pathlib import Path

spec=importlib.util.spec_from_file_location('turn_plan',Path(__file__).with_name('turn-plan.py'))
turn_plan=importlib.util.module_from_spec(spec);sys.modules[spec.name]=turn_plan;spec.loader.exec_module(turn_plan)

OWN={
 'Shadow Rider Calyrex V CRE':'v','Shadow Rider Calyrex VMAX CRE':'vmax',
 'Wobbuffet PHF':'wob',"Lillie's Clefairy ex JTG":'clefairy','Tapu Lele-GX GRI':'lele',
 'Trevenant & Dusknoir-GX SMP':'trev','Latias ex SSP':'latias','Dialga-GX UPR':'dialga',
 'Mimikyu GRI':'mimikyu','Girafarig LOT':'girafarig','Marshadow UNB':'marshadow','Radiant Eternatus CRZ':'radiant'}
OWN_ABILITIES={'Underworld Door','Bide Barricade','Fairy Zone','Wonder Tag','Skyliner','Resetting Hole','Climactic Gate'}
LOCK_ABILITIES={'Initialization':'thorns','Mischievous Lock':'klefki','Garbotoxin':'garbotoxin',
                'Irritating Pollen':'item_vileplume','Disgusting Pollen':'basic_vileplume','Sentinel':'sentinel','Block':'block'}
# These are either previously fired on-play abilities or optional actions outside the current own turn.
PASSIVE_SAFE={'Legacy Star','Dedechange','Dark Asset','Wonder Tag','Climactic Gate','Skyliner','Underworld Door','Fairy Zone','Resetting Hole'}
TOOL_PREFIX={'Stealthy Hood':'hood','Float Stone':'float','Forest Seal Stone':'fss','Tool Jammer':'jammer'}
STADIUM_PREFIX={'Dimension Valley':'valley','Temple of Sinnoh':'temple','Sky Field':'sky',
 'Path to the Peak':'path','Silent Lab':'lab','Jamming Tower':'jamming','Chaotic Swell':'swell','Galar Mine':'mine'}
STADIUM_HELD={'valley','temple','sky'}
TRAINER_PREFIX={'Stealthy Hood':'hood','Float Stone':'float','Field Blower':'blower','Guzma':'guzma','VS Seeker':'vs','Night Stretcher':'stretcher'}

class Unsupported(ValueError):pass

def require(test,why):
    if not test:raise Unsupported(why)

def prefix(printing,mapping):
    return next((v for k,v in mapping.items() if printing.startswith(k+' ')),None)

def psychic(p):return p.startswith('Psychic Energy ')

def public_guard(x):
    if isinstance(x,dict):
        for k,v in x.items():
            require(k.lower() not in {'state','store','nativestate','nativestore','fullstate','fullstatebefore','deckorder','opponentdeck','opponenthand','opponentprizes','hiddenzone','hiddenzones','zones'},'private/native input not accepted')
            public_guard(v)
    elif isinstance(x,list):
        for v in x:public_guard(v)

def convert(req,cat):
    public_guard(req)
    require(req.get('schema')=='aichi-policy-request-v2' and req.get('observationSchema')=='aichi-actor-observation-v4-ability-lock-order','wrong actor protocol')
    require(req.get('prompt') is None,'root only; prompt resolver must revalidate intent')
    v=req['observation'];seat=v['actorSeat'];turn=v['globalTurn']
    require(v['decisionKind']=='owner-root' and seat==v.get('turnSeat') and req['seat']==seat and turn>1,'not normal actor attack turn')
    own=v['ownPublic'];opp=v['opponentPublic'];res=v['ownTurnResources'];event=req['publicEventReceipt']
    require(event and event['version']=='agent8-public-event-receipt-v3-turn-stamped' and event['turn']==turn and event['actorSeat']==seat,'current owner event receipt required')
    types=cat['basicEnergyTypes'];dragon=cat.get('dragonPokemonPrintings',[]);rule=set(cat['ruleboxPokemonPrintings']);basics=set(cat['basics']);one=set(cat['onePrizeRuleboxPokemonPrintings']);three=set(cat['threePrizePokemonPrintings'])
    basicenergy=set(cat['basicEnergies']);specialenergy=set(cat['specialEnergies'])
    require('Psychic' in types and 'Lightning' in types and 'Grass' in types,'public catalog type mapping required')
    for side in [own,opp]:
        pr=side['publicTurnRestrictions']
        require(pr.get('stadiumAndToolHaveNoEffectTurnsRemaining')==0,'unknown or active timed Stadium/Tool suppression')
        require(not pr.get('ignoreAttackCostTurnsRemaining') and not pr.get('attackMaxEnergyTurnsRemaining'),'unsupported temporary attack-cost/cap effect')
    require(not own['publicTurnRestrictions'].get('attackLockTurnsRemaining'),'player-wide attack lock')
    stadium_cards=own['stadium']+opp['stadium'];require(len(stadium_cards)<=1,'ambiguous Stadium')
    stadium=prefix(stadium_cards[0],STADIUM_PREFIX) if stadium_cards else 'none'
    require(stadium is not None,'unsupported Stadium effect')
    slotmap={}; rows={}; ownrows=[]; opprows=[]
    for owner,side,head,arr,ev in [(True,own,'a',ownrows,event['ownerActive']),(False,opp,'oa',opprows,None)]:
        slots=[(head,'active',0,side['active'],ev)]+[(('b' if owner else 'ob')+str(i),'bench',i,p,event['ownerBench'][i] if owner else None) for i,p in enumerate(side['bench']) if p is not None]
        for id,zone,index,p,receipt in slots:
            require(p is not None and not p.get('concealed'),'concealed/missing Pokémon')
            printing=p['printing'];slotmap[id]={'zone':zone,'index':index,'printing':printing,'owner':owner};rows[id]=p
            require(not p['specialConditions'],'unsupported Special Condition')
            rr=p['publicRestrictions'];require(not any(rr.get(k) for k in ('cannotUseAttacksNextTurn','blockedAttackNameNextTurn','blockedAttackNameUntilLeavesActive','onlyAllowedAttackNameNextTurn','attackCostIncreaseNextTurn','attackCostIncreaseWhileActive')),'unsupported named attack or cost effect')
            require(len(p['tools'])<=1,'multiple Tools not modeled')
            tool=prefix(p['tools'][0],TOOL_PREFIX) if p['tools'] else ''
            require(tool is not None,'unsupported Tool')
            r={'id':id,'tool':tool,'damage':p['damage']}
            names=set(p['abilities'])
            if owner:
                kind=OWN.get(printing);require(kind is not None,'unknown own exact printing')
                require(names<=OWN_ABILITIES,'unsupported own Ability')
                require(all(psychic(e) and e in basicenergy for e in p['energies']),'non-basic-Psychic own Energy')
                require(p['hp']==turn_plan.CARDS[kind][3],'modified or unsupported own HP')
                r.update(kind=kind,energy=len(p['energies']),attack_blocked=bool(rr.get('cannotAttackNextTurn')),retreat_blocked=any(rr.get(k) for k in ('cannotRetreat','cannotRetreatNextTurn','cannotRetreatWhileActive')),
                         evolvable=kind=='v' and turn>2 and isinstance(p.get('lastPlayedOrEvolvedTurn'),int) and p['lastPlayedOrEvolvedTurn']<turn and not rr.get('cannotEvolveNextTurn'))
                require(receipt is not None and receipt['printing']==printing,'owner slot receipt mismatch')
                if kind=='vmax':
                    use=[x['usedThisTurn'] for x in receipt['knownAbilityUse'] if x['name']=='Underworld Door']
                    require(len(use)==1 and isinstance(use[0],bool),'unknown Underworld Door usage')
                    r['door_used']=use[0]
            else:
                locks=[LOCK_ABILITIES[a] for a in names if a in LOCK_ABILITIES]
                require(len(locks)<=1 and names<=PASSIVE_SAFE|LOCK_ABILITIES.keys(),'unsupported opposing Ability')
                r.update(lock=locks[0] if locks else '',hp=p['hp'],basic=printing in basics,rulebox=printing in rule,prizes=3 if printing in three else 2 if printing in rule and printing not in one else 1)
                typ=p['printed']['types'];require(len(typ)==1,'multi-type opponent not modeled')
                r['type']='Dragon' if printing in dragon else next((k for k,x in types.items() if x==typ[0]),'Colorless')
                for w in p['printed']['weakness']:
                    if w['type']==types['Psychic']:
                        require(str(w['value']) in {'2','x2','×2'},'non-double Psychic Weakness');r['weakness']='Psychic'
                for w in p['printed']['resistance']:
                    if w['type']==types['Psychic']:r['psychic_resistance']=abs(int(w['value']))
                # Only explicitly understood Special Energy effects. Energy Drive counts provided units.
                units=0
                for e in p['energies']:
                    if e in basicenergy:units+=1
                    elif e in specialenergy and e.startswith(('Double Colorless Energy ','Double Dragon Energy ','Twin Energy ')):
                        require(not e.startswith('Twin Energy ') or printing not in rule,'Twin Energy on Rule Box not modeled');units+=2
                    elif e in specialenergy and e.startswith(('Mist Energy ','Jet Energy ','Capture Energy ','Aurora Energy ','Rainbow Energy ','Luminous Energy ')):
                        units+=1
                        if e.startswith('Mist Energy '):r['mist_energy']=True
                    else:raise Unsupported('unmodeled opposing Energy '+e)
                r.update(energy=units,temple_energy=len(p['energies']),future=bool(r['lock']=='thorns'))
                # Do not derive a guarantee about on-KO, residual or attack effect from absence of an Ability.
            arr.append(r)
    require(not(any(x['kind']=='wob' for x in ownrows) and any(x['lock']=='klefki' for x in opprows)),'dynamic Klefki/Wobbuffet lock ordering not modeled')
    require(not(any(x['lock']=='garbotoxin' for x in opprows) and any(x['lock'] in {'thorns','klefki'} for x in opprows)),'combined locker precedence not modeled')
    hand={'psychic':sum(psychic(p) and p in basicenergy for p in v['ownHand']),'stadiums':[],'pokemon':{}}
    for p in v['ownHand']:
        k=prefix(p,TRAINER_PREFIX);st=prefix(p,STADIUM_PREFIX)
        if k:hand[k]=True if k in {'guzma','blower'} else hand.get(k,0)+1
        if st in STADIUM_HELD:hand['stadiums'].append(st)
        if p in OWN:hand['pokemon'][OWN[p]]=hand['pokemon'].get(OWN[p],0)+1
    discard={'psychic':sum(psychic(p) and p in basicenergy for p in own['discard']),'guzma':any(p.startswith('Guzma ') for p in own['discard'])}
    discard['pokemon']={}
    for p in own['discard']:
        if p in OWN:discard['pokemon'][OWN[p]]=discard['pokemon'].get(OWN[p],0)+1
    # The planner reserves compact slot IDs; map their first action to actual empty native slots.
    for j,index in enumerate(i for i,p in enumerate(own['bench']) if p is None):
        slotmap['new'+str(len(ownrows)+j)]={'zone':'bench','index':index,'owner':True,'printing':None}
    data={'own':ownrows,'opp':opprows,'active':'a','opp_active':'oa','stadium':stadium,'hand':hand,'discard':discard,
          'used':{'manual':res['energyPlayedTurn']==turn,'retreat':res['retreatedTurn']==turn,'support':res['supporterPlayedTurn']>0,'stadium':res['stadiumPlayedTurn']==turn,'gx':own['publicTurnRestrictions']['gxUsed']},
          'deck_remaining':own['deckCount'],'prizes_remaining':own['prizeCount'],'support_allowed':True,
          'item_attack_lock':bool(res['itemPlayLocked']),'support_attack_lock':bool(res['supporterPlayLocked']),
          'stadium_attack_lock':bool(res['stadiumPlayLocked']),'tool_attack_lock':bool(res['toolPlayLocked']),'energy_attack_lock':bool(res['energyPlayLocked']),
          'pokemon_play_lock':bool(res.get('pokemonPlayLocked')),'ability_pokemon_play_lock':bool(res.get('abilityPokemonPlayLocked')),
          'evolution_lock':turn<=2 or bool(res.get('evolutionPlayLocked'))}
    require(not own['publicTurnRestrictions'].get('cannotUseGXAttacks'),'GX-attack restriction unsupported')
    # Check effective initial Ability states if known; never interpret null as verified live.
    planner=turn_plan.Planner(data)
    for i,r in enumerate(ownrows):
        if r['kind'] not in {'vmax','latias','clefairy','marshadow','wob'}:continue
        for suppress in rows[r['id']].get('abilitySuppressions') or []:
            value=suppress['suppressed']
            if isinstance(value,bool):require(planner.own_ability(planner.first,i)==(not value),'model disagrees with public suppression receipt')
    return data,slotmap

def match_root(plan,frontier,slotmap):
    items=frontier['items'];first=plan['actions'][0] if plan['actions'] else None
    def target(meta,id):
        p=slotmap[id];return meta.get('targetSeat')=='actor' and meta.get('targetZone')==p['zone'] and meta.get('targetIndex',0)==p['index']
    def source(meta,id):
        p=slotmap[id];return meta.get('sourceSeat')=='actor' and meta.get('sourceZone')==p['zone'] and meta.get('sourceIndex',0)==p['index']
    def matches(x):
        meta=x.get('publicMetadata',{});kind=x['kind'];printing=x.get('actorPrinting','')
        if first is None:return kind=='attack' and x.get('attackName')==plan['attack'] and meta.get('attackSource',{}).get('sourceKind')=='active-pokemon' and printing==slotmap['a']['printing']
        m=re.fullmatch(r'bench (\w+) -> (\w+)',first)
        if m:return kind=='play-card' and OWN.get(printing)==m[1] and m[2] in slotmap and target(meta,m[2])
        m=re.fullmatch(r'evolve (\w+) -> vmax',first)
        if m:return kind=='play-card' and OWN.get(printing)=='vmax' and target(meta,m[1])
        m=re.fullmatch(r'manual Psychic -> (\w+)',first)
        if m:return kind=='play-card' and psychic(printing) and target(meta,m[1])
        m=re.fullmatch(r'Underworld Door (\w+) -> (\w+);.*',first)
        if m:return kind=='use-ability' and meta.get('abilityName')=='Underworld Door' and source(meta,m[1])
        m=re.fullmatch(r'retreat \w+ -> (\w+) \(discard \d+ Psychic\)',first)
        if m:return kind=='retreat' and target(meta,m[1])
        m=re.fullmatch(r'attach (Stealthy Hood|Float Stone) -> (\w+)',first)
        if m:return kind=='play-card' and printing.startswith(m[1]+' ') and target(meta,m[2])
        m=re.fullmatch(r'play (\w+) Stadium.*',first)
        if m:return kind=='play-card' and prefix(printing,STADIUM_PREFIX)==m[1]
        m=re.fullmatch(r'Resetting Hole (\w+) .*',first)
        if m:return kind=='use-ability' and meta.get('abilityName')=='Resetting Hole' and source(meta,m[1])
        for label in ('Guzma','Field Blower','VS Seeker','Night Stretcher'):
            if first.startswith(label):return kind=='play-card' and printing.startswith(label+' ')
        return False
    matches_=[x for x in items if matches(x)]
    # Duplicate same-printing held cards are interchangeable here; select lowest hand index.
    if len(matches_)>1 and not all(x['kind']=='play-card' and x.get('actorPrinting')==matches_[0].get('actorPrinting') and x.get('publicMetadata',{}).get('targetZone')==matches_[0].get('publicMetadata',{}).get('targetZone') and x.get('publicMetadata',{}).get('targetIndex')==matches_[0].get('publicMetadata',{}).get('targetIndex') for x in matches_):return None
    return min(matches_,key=lambda x:x.get('publicMetadata',{}).get('handIndex',0)) if matches_ else None

def advise(req,cat,max_states=100000):
    try:
        data,slotmap=convert(req,cat)
        require(req['actionFrontier']['schema']=='aichi-action-frontier-v1','wrong frontier schema')
        # Enforce the genuine current frontier during expansion, not merely after choosing
        # a representative path; a different route to the same result may start legally.
        class RootFilteredPlanner(turn_plan.Planner):
            def actions(self,s):
                for action,nxt in super().actions(s):
                    if s!=self.first or match_root({'actions':[action]},req['actionFrontier'],slotmap):
                        yield action,nxt
        planner=RootFilteredPlanner(data);result=planner.solve(max_states,limit=200)
        for plan in result['options']:
            if plan['immediate_prizes']<=0:continue
            # Only root token; a later prompt may have changed choices. No unchecked prompt payload.
            action=match_root(plan,req['actionFrontier'],slotmap)
            if action:
                return {'advisory':True,'decision':{'kind':'select-action','token':action['token']},'plan':plan,'slotmap':slotmap,
                        'states':result['states'],'complete_within_model':result['complete_within_model'],
                        'boundary':'Revalidate prompt target and replan from fresh observation; no game guarantee. Unsupported effects may require abstention.'}
        return {'advisory':True,'decision':None,'reason':'No positive modeled Prize plan with a matching current native root token'}
    except (Unsupported,KeyError,TypeError,AssertionError,ValueError,IndexError) as e:
        return {'advisory':True,'decision':None,'reason':str(e) or type(e).__name__}

def selftest():
    # Detached synthetic request using the repository's existing public field names.
    def poke(printing,kind,energy=0,tool='',ability=None):
        base=turn_plan.CARDS[kind];return {'printing':printing,'name':printing.rsplit(' ',1)[0],
         'hp':base[3],'damage':0,'printed':{'stage':0 if base[1] else 1,'types':[1],'weakness':[],'resistance':[]},
         'specialConditions':[],'publicRestrictions':{},'tools':[tool] if tool else [],'energies':['Psychic Energy SVE']*energy,
         'abilities':[ability] if ability else [],'abilitySuppressions':None}
    def thorns():
        q=poke('Iron Thorns ex TWM','v',0,ability='Initialization');q.update(hp=230,energies=['Double Colorless Energy NXD']);q['printed']['types']=[2];return q
    own=[poke('Shadow Rider Calyrex VMAX CRE','vmax',3,ability='Underworld Door'),poke('Shadow Rider Calyrex VMAX CRE','vmax',3,ability='Underworld Door'),poke('Wobbuffet PHF','wob',tool='Float Stone BKT',ability='Bide Barricade')]
    opp=[thorns(),thorns()]
    pr={'stadiumAndToolHaveNoEffectTurnsRemaining':0,'gxUsed':False}
    def player(board,stadium,discard):return {'active':board[0],'bench':board[1:]+[None]*(6-len(board)),'stadium':stadium,'discard':discard,'publicTurnRestrictions':pr,'deckCount':35,'prizeCount':2}
    def receipt(q):return {'printing':q['printing'],'knownAbilityUse':[{'name':'Underworld Door','usedThisTurn':False}] if q['printing'].startswith('Shadow Rider Calyrex VMAX') else []}
    request={'schema':'aichi-policy-request-v2','observationSchema':'aichi-actor-observation-v4-ability-lock-order','seat':0,'prompt':None,
     'observation':{'actorSeat':0,'turnSeat':0,'globalTurn':5,'decisionKind':'owner-root','ownPublic':player(own,['Dimension Valley PHF'],['Guzma BUS','Psychic Energy SVE']),
                    'opponentPublic':player(opp,[],[]),'ownHand':['Psychic Energy SVE','VS Seeker PHF','Night Stretcher SFA'],
                    'ownTurnResources':{'energyPlayedTurn':3,'retreatedTurn':3,'supporterPlayedTurn':0,'stadiumPlayedTurn':3,**{k+'PlayLocked':False for k in ('item','supporter','stadium','tool','energy')}}},
     'publicEventReceipt':{'version':'agent8-public-event-receipt-v3-turn-stamped','turn':5,'actorSeat':0,'ownerActive':receipt(own[0]),'ownerBench':[receipt(x) for x in own[1:]]+[None]*3},
     'actionFrontier':{'schema':'aichi-action-frontier-v1','items':[{'kind':'play-card','token':'vs','actorPrinting':'VS Seeker PHF','publicMetadata':{'handIndex':1}}, {'kind':'projected-attack','token':'fake','attackName':'Max Geist'}]}}
    catalog={'basicEnergyTypes':{'Psychic':1,'Lightning':2,'Grass':3},'basics':['Wobbuffet PHF','Iron Thorns ex TWM'],'ruleboxPokemonPrintings':['Shadow Rider Calyrex VMAX CRE','Iron Thorns ex TWM'],
     'onePrizeRuleboxPokemonPrintings':[],'threePrizePokemonPrintings':['Shadow Rider Calyrex VMAX CRE'],'basicEnergies':['Psychic Energy SVE'],'specialEnergies':['Double Colorless Energy NXD'],'dragonPokemonPrintings':[]}
    import copy
    result=advise(request,catalog);assert result['decision']=={'kind':'select-action','token':'vs'},result
    assert result['plan']['immediate_prizes']==2 and result['plan']['door_draws']==4
    assert result['plan']['actions'][0]=='VS Seeker -> Guzma'
    for mutation in ('hidden','itemlock','unknownability','missingmarker','noaction'):
        q=copy.deepcopy(request)
        if mutation=='hidden':q['observation']['opponentDeck']=['secret']
        if mutation=='itemlock':q['observation']['ownTurnResources']['itemPlayLocked']=True
        if mutation=='unknownability':q['observation']['opponentPublic']['active']['abilities'].append('Unknown')
        if mutation=='missingmarker':q['publicEventReceipt']['ownerActive']['knownAbilityUse'][0]['usedThisTurn']=None
        if mutation=='noaction':q['actionFrontier']['items']=[{'kind':'projected-attack','token':'fake','attackName':'Max Geist'}]
        assert advise(q,catalog)['decision'] is None,mutation
    # Actor-root evolution requires a public eligible turn stamp and exact target slot.
    q=copy.deepcopy(request);v=q['observation'];p=v['ownPublic'];
    p['active']=poke('Shadow Rider Calyrex V CRE','v',2);p['active']['lastPlayedOrEvolvedTurn']=3
    p['bench']=[poke('Shadow Rider Calyrex V CRE','v',1)]+[None]*4
    p['discard']=[];v['ownHand']=['Psychic Energy SVE']*2+['Shadow Rider Calyrex VMAX CRE']
    target=thorns();target.update(hp=160,abilities=[],printing='Dedenne-GX UNB');p2=v['opponentPublic'];p2['active']=target;p2['bench']=[None]*5
    q['publicEventReceipt']['ownerActive']=receipt(p['active']);q['publicEventReceipt']['ownerBench']=[receipt(p['bench'][0])]+[None]*4
    q['actionFrontier']['items']=[{'token':'evolve','kind':'play-card','actorPrinting':'Shadow Rider Calyrex VMAX CRE','publicMetadata':{'targetSeat':'actor','targetZone':'active','targetIndex':0,'handIndex':2}}]
    cat=copy.deepcopy(catalog);cat['ruleboxPokemonPrintings'].append('Dedenne-GX UNB')
    z=advise(q,cat);assert z['decision']=={'kind':'select-action','token':'evolve'},z
    p['active']['lastPlayedOrEvolvedTurn']=5;assert advise(q,cat)['decision'] is None
    # A new Basic goes to the actual empty native slot, not an invented compact index.
    q=copy.deepcopy(request);v=q['observation'];p=v['ownPublic'];p['active']=poke('Shadow Rider Calyrex VMAX CRE','vmax',3,ability='Underworld Door')
    p['bench']=[None,poke('Shadow Rider Calyrex V CRE','v',1)]+[None]*3;p['discard']=[]
    q['publicEventReceipt']['ownerActive']=receipt(p['active']);q['publicEventReceipt']['ownerBench']=[None,receipt(p['bench'][1])]+[None]*3
    v['ownHand']=['Psychic Energy SVE',"Lillie's Clefairy ex JTG"]
    target=thorns();target.update(hp=280,abilities=[],printing='Regidrago VSTAR SIT');v['opponentPublic']['active']=target;v['opponentPublic']['bench']=[None]*5
    q['actionFrontier']['items']=[{'token':'clefairy','kind':'play-card','actorPrinting':"Lillie's Clefairy ex JTG",'publicMetadata':{'targetSeat':'actor','targetZone':'bench','targetIndex':0,'handIndex':1}}]
    cat['ruleboxPokemonPrintings'].append('Regidrago VSTAR SIT');cat['dragonPokemonPrintings'].append('Regidrago VSTAR SIT')
    z=advise(q,cat);assert z['decision']=={'kind':'select-action','token':'clefairy'},z
    v['ownTurnResources']['abilityPokemonPlayLocked']=True;assert advise(q,cat)['decision'] is None
    print(json.dumps(result,indent=2));print('Actor bridge tests passed.')

def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('input',nargs='?');ap.add_argument('--test',action='store_true');ap.add_argument('--max-states',type=int,default=100000);a=ap.parse_args()
    if a.test:selftest();return
    if not a.input:ap.error('input required unless --test')
    envelope=json.load(open(a.input));print(json.dumps(advise(envelope['request'],envelope['catalog'],a.max_states),indent=2))
if __name__=='__main__':main()
