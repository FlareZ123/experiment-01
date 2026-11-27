"""Constructed Eon Blade relay: 3 consecutive 2-Prize KOs, no probability claim.
The first own attack is pre-funded. The two source replies are stipulated,
use fresh Regidrago VSTAR attackers, and hit the same Active Latias.
No hidden draws or search success assumed; both Supporters are held.
"""
from dataclasses import dataclass

@dataclass(frozen=True)
class Scenario:
    name: str
    source: tuple=('rolling','rolling')
    band: bool=True
    dna: bool=True
    valley: bool=True
    doors: int=1
    acerola: bool=True
    ranger: bool=True
    fairy: bool=True
    basic_pivot: bool=True
    prior_latias_damage: int=0
    prior_clef_damage: int=0
    first_protection: str='rolling'

BASE={'rolling':200,'phantom':200,'ryuno':330,'covert':70,'echo':140,'timeless_phantom':350}

def relay(s):
    # This narrow witness starts with the Valley-dependent two-Energy route
    # already paid (or 3 without Valley), three fresh target VSTARs and
    # no additional attachments needed beyond returning/reusing Latias P.
    cost=3-int(s.valley);latias_energy=cost;hand_energy=0;damage=s.prior_latias_damage
    clef_damage=s.prior_clef_damage;prizes=6;cooldown=False;protected=s.first_protection
    events=[];supporters=set();lost=0
    def finish(why):return {'prizes_taken':6-prizes,'prizes_lost':lost,'reason':why,'events':events}
    if damage>=210 or clef_damage>=190 or not s.fairy:return finish('initial weakness/HP condition absent')
    for turn in (1,2,3):
        used_support=False
        if turn==2:
            # Heal and reset the used attack by returning the damaged Basic.
            if not s.acerola or not damage or not s.basic_pivot:return finish('Acerola/real promotion condition absent')
            if 1+s.doors<cost:return finish('insufficient post-return attachment actions')
            hand_energy+=latias_energy;latias_energy=0;damage=0;cooldown=False
            supporters.add('Acerola');used_support=True
            # Promote a Basic, rebench Latias, re-enable Skyliner, fund it
            # while Benched; one Door per live Rider, one manual attachment.
            n=cost-1;assert n<=s.doors and hand_energy>=cost
            hand_energy-=cost;latias_energy=cost
            events.append(f'T{turn} Acerola; promote Basic, bench Latias, {n} Door + manual, free retreat')
        if turn==3:
            if not s.ranger:return finish('no Ranger for final cooldown')
            assert not used_support;supporters.add('Ranger');cooldown=False;protected='none';used_support=True
            events.append('T3 Ranger removes both Eon restriction and opposing attack effect')
        assert latias_energy+hand_energy==cost
        if cooldown:return finish('Eon Blade restricted')
        if protected=='covert':return finish('Basic damage prevented by Covert Flight')
        dealt=200*2-(80 if protected=='rolling' else 0)
        if dealt<280:return finish('insufficient damage')
        prizes-=2;cooldown=True;events.append(f'T{turn} Eon {dealt}, take two; {prizes} remaining')
        if prizes==0:return finish('all six taken in this stipulated branch')
        src=s.source[turn-1]
        hit=BASE[src]+(20 if s.band else 0)-(30 if s.dna else 0)
        if src=='timeless_phantom':hit=BASE[src]+(40 if s.band else 0)-(60 if s.dna else 0)
        damage+=hit
        # Worst case for this witness's Fairy Zone: all six Phantom counters
        # go to the same Clefairy whenever the source uses Phantom Dive.
        if src in ('phantom','timeless_phantom'):clef_damage+=60
        events.append(f'source {src}: Latias damage {damage}, Clefairy damage {clef_damage}')
        if damage>=210:lost+=2;return finish('Latias KO; this relay ended, not a game loss')
        if clef_damage>=190:lost+=2;return finish('Clefairy KO; no second source assumed')
        protected=src if src in ('rolling','covert') else 'none'
    raise AssertionError('unreachable')

if __name__=='__main__':
    tests=[Scenario('Gate rolling+Band'),Scenario('Gate Phantom+Band',('phantom','phantom')),
      Scenario('Hood rolling no Band',band=False,dna=False,doors=2),
      Scenario('Hood rolling Band',dna=False,doors=2),
      Scenario('Gate Ryuno',('ryuno','rolling')),
      Scenario('Gate Timeless+Phantom',('timeless_phantom','rolling')),
      Scenario('Gate Covert first response',('covert','rolling')),
      Scenario('Gate Covert second response',('rolling','covert')),
      Scenario('Gate no Valley',valley=False),Scenario('Hood no Valley',valley=False,doors=2,band=False,dna=False),
      Scenario('Gate no Acerola',acerola=False),Scenario('Gate no Ranger',ranger=False),
      Scenario('Gate prior Clefairy damage',('phantom','phantom'),prior_clef_damage=70),
      Scenario('Gate prior Latias damage',prior_latias_damage=20),
      Scenario('Gate no Fairy',fairy=False),Scenario('Gate no Basic pivot',basic_pivot=False)]
    out={s.name:relay(s) for s in tests}
    for k,v in out.items():print(k,v['prizes_taken'],v['prizes_lost'],v['reason'])
    for k in ('Gate rolling+Band','Gate Phantom+Band','Hood rolling no Band','Gate Covert second response','Hood no Valley'):
        assert out[k]['prizes_taken']==6 and out[k]['prizes_lost']==0
    for k in ('Hood rolling Band','Gate Ryuno','Gate Timeless+Phantom','Gate prior Latias damage'):
        assert out[k]['prizes_taken']==2 and out[k]['prizes_lost']==2
    assert out['Gate Covert first response']['prizes_taken']==2
    assert out['Gate no Valley']['prizes_taken']==2
    assert out['Gate no Ranger']['prizes_taken']==4
    assert out['Gate prior Clefairy damage']['prizes_taken']==4
    assert out['Gate no Fairy']['prizes_taken']==0
    assert out['Gate no Basic pivot']['prizes_taken']==2
    print('witness',out['Gate Phantom+Band']['events'])


def covert_relay(reply, band=True, dna=True, acerola=True, ranger=True,
                 third_hand_energy=True, float_available=False, prior_source_prizes=0):
    """Valley, one Door, live Fairy Zone and Latias; after first Eon, opponent
    uses Covert Flight. D starts healthy/uncharged. Two held P at own A2;
    a third held P at A3 is explicit, not a draw prediction. No Gust or lock.
    The source second reply is revealed only after Max Drain, not used to
    select the A2 attack. Source counter placement targets fresh Clefairy.
    """
    assert 0<=prior_source_prizes<6
    L,D,hand,discard=2,0,2+int(third_hand_energy),0
    total=L+D+hand;damageL=70+20*band-30*dna;damageD=0
    if damageL>=210:return (2,2,'Latias KO before relay')
    # A2: one Door + one manual to D, free Basic retreat. L cooldown clears.
    D+=2;hand-=2;assert L+D+hand+discard==total
    # D's 320 hits through Basic-only protection. Source A2 reply targets D.
    damageD=BASE[reply]+20*band-30*dna
    if reply=='timeless_phantom':damageD=BASE[reply]+40*band-60*dna
    lost=0;covert=reply=='covert';route=''
    if damageD>=330:
        lost=3;discard+=D;D=0
        if prior_source_prizes+lost>=6:return (4,lost,'source takes final Prizes')
        route='promote pre-funded Latias after D KO'
    elif not covert and acerola and damageD:
        # Burn the damaged three-Prize host's mitigation only because final KO
        # is available now. Returned Energy is not required for the attack.
        hand+=D;D=0;route='Acerola D; promote pre-funded Latias'
    else:
        if float_available:route='Float Stone retreat D'
        elif D+hand>=3:
            if D<3:D+=1;hand-=1
            D-=3;discard+=3;route='manual P then pay D retreat 3'
        else:return (4,lost,'no real D-to-L pivot')
    if covert:
        if not ranger:return (4,lost,'Covert blocks final Eon without Ranger')
        route+='; Ranger removes Covert'
    assert L>=2 and L+D+hand+discard==total
    damage=400-(80 if reply=='rolling' else 0)
    assert damage>=280
    return (6,lost,route)

if __name__=='__main__':
    print('\nCovert branch: Eon -> Drain -> Eon, conditional attack turns')
    for label,kwargs in [
        ('Rolling',dict(reply='rolling')),('Phantom',dict(reply='phantom')),
        ('Band Ryuno',dict(reply='ryuno')),('Covert paid pivot',dict(reply='covert')),
        ('Covert no pivot',dict(reply='covert',third_hand_energy=False)),
        ('Covert Float',dict(reply='covert',third_hand_energy=False,float_available=True)),
        ('Covert no Ranger',dict(reply='covert',ranger=False)),
        ('Timeless+Phantom behind <3',dict(reply='timeless_phantom',prior_source_prizes=2)),
        ('Timeless+Phantom behind 3',dict(reply='timeless_phantom',prior_source_prizes=3))]:
        print(label,covert_relay(**kwargs))
    assert covert_relay('ryuno')[:2]==(6,0)
    assert covert_relay('covert')[:2]==(6,0)
    assert covert_relay('covert',third_hand_energy=False)[:2]==(4,0)
    assert covert_relay('covert',third_hand_energy=False,float_available=True)[:2]==(6,0)
    assert covert_relay('covert',ranger=False)[:2]==(4,0)
    assert covert_relay('timeless_phantom',prior_source_prizes=2)[:2]==(6,3)
    assert covert_relay('timeless_phantom',prior_source_prizes=3)[:2]==(4,3)
