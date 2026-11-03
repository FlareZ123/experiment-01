"""Exact Pokégear 3.0 addition to the fixed ADP-v2 strict T1/T2 chain.

Only one normal draw each turn. Full physical six-Prize allocation.
The first turn necessarily pays Compressor, Thorton and Double Dragon.
Turn two can retrieve the Supporter from up to two genuine Pokégear
top-seven looks, without replacing the fixed sixty. No opponent modeled.
"""
from collections import defaultdict
from functools import lru_cache
from hashlib import sha256
import json
from math import comb
from pathlib import Path

MANIFEST=Path(__file__).resolve().parent.parent / (
    'results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json')
EXPECTED_SHA='bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b'
BUCKETS=(
    {'sm12-156'},           # A: ADP
    {'swsh12-135'},         # R: Regidrago V
    {'sm2-60','swsh3-104'}, # B: other starting Basics
    {'xy6-97'},            # D: Double Dragon Energy
    {'xy4-92'},            # C: Battle Compressor
    {'swsh11-167'},        # T: Thorton
    {'xy4-109'},           # S: VS Seeker
    {'swsh12-136'},        # V: Regidrago VSTAR
    {'swsh12pt5-152','swsh12pt5-153'}, # E: Basic Grass or Fire
    {'swsh9-150'},         # U: Ultra Ball
    {'xy2-69'},            # M: M Charizard-EX Wild Blaze
    {'sv1-186'}            # G: Pokégear 3.0
)
A,R,B,D,C,T,S,V,E,U,M,G,X=range(13)
BASE_REQUIREMENTS=(A,R,M)
TOP_SEVEN=comb(42,7)
TOP_DENOMINATOR=TOP_SEVEN**2

def load_counts():
    manifest=json.loads(MANIFEST.read_text(encoding='utf-8'))
    cards=manifest['cards']
    canonical=json.dumps(
        [{'count':c['count'],'id':c['id'],'name':c['name']} for c in cards],
        ensure_ascii=False,separators=(',',':')).encode('utf-8')
    digest=sha256(canonical).hexdigest()
    assert digest==manifest['canonicalCardsSha256']==EXPECTED_SHA,digest
    counts=[0]*13
    for item in cards:
        bucket=next((i for i,ids in enumerate(BUCKETS)
                     if item['id'] in ids),X)
        counts[bucket]+=item['count']
    assert tuple(counts)==(2,3,2,4,4,4,1,3,7,4,1,2,23)
    return tuple(counts)

def compositions(total,pool):
    if len(pool)==1:
        if total<=pool[0]:
            yield (total,)
        return
    for k in range(min(total,pool[0])+1):
        for tail in compositions(total-k,pool[1:]):
            yield (k,)+tail

def choose(n,k):
    return comb(n,k) if 0<=k<=n else 0

@lru_cache(maxsize=None)
def prize_count_fixed_thorton(pool,prized_thorton,requirements):
    """Simultaneous six-Prize count with T count fixed and groups unprized."""
    total=sum(pool)
    if any(pool[group]==0 for group in requirements):return 0
    if not (0<=prized_thorton<=pool[T]):return 0
    answer=0
    for mask in range(1<<len(requirements)):
        gone=sum(pool[requirements[j]] for j in range(len(requirements))
                 if mask & (1<<j))
        ways=choose(total-pool[T]-gone,6-prized_thorton-gone)
        answer+=(-1 if mask.bit_count()%2 else 1)*ways
    return choose(pool[T],prized_thorton)*answer

@lru_cache(maxsize=None)
def weighted_ninth_draw(pool,draw_group,prized_thorton,requirements):
    """Count (six Prizes, one physical post-Compressor natural T2 draw)."""
    if pool[draw_group]==0:return 0
    reserved=list(pool)
    reserved[draw_group]-=1
    reserved=tuple(reserved)
    if draw_group in (A,R,M):
        # Candidate draw cannot be the one instance chosen by Compressor.
        counted=pool[draw_group]*prize_count_fixed_thorton(
            reserved,prized_thorton,
            tuple(k for k in requirements if k!=draw_group))
        counted-=prize_count_fixed_thorton(
            pool,prized_thorton,requirements)
    else:
        counted=pool[draw_group]*prize_count_fixed_thorton(
            reserved,prized_thorton,requirements)
    assert counted>=0
    return counted

def run():
    counts=load_counts()
    valid_seven=0
    first_eight_weights=defaultdict(int)
    for seven in compositions(7,counts):
        weight=1
        for n,k in zip(counts,seven):weight*=choose(n,k)
        if not (seven[A]+seven[R]+seven[B]):continue
        valid_seven+=weight
        if seven[A]:continue  # first Active must be a different Basic
        for eighth_category,n in enumerate(counts):
            options=n-seven[eighth_category]
            if not options:continue
            eight=list(seven)
            eight[eighth_category]+=1
            if all(eight[k] for k in (D,C,T)):
                first_eight_weights[tuple(eight)]+=weight*options
    assert valid_seven==232063840
    baseline=0
    inclusive_numerator=0
    for eight,hand_weight in first_eight_weights.items():
        pool=tuple(n-k for n,k in zip(counts,eight))
        assert sum(pool)==52
        for drawn in range(len(counts)):
            if pool[drawn]==0:continue
            nine=list(eight)
            nine[drawn]+=1
            if not nine[E]:continue
            if nine[V]:
                requirements=BASE_REQUIREMENTS
            elif nine[U]:
                requirements=BASE_REQUIREMENTS+(V,)
            else:
                continue
            direct=nine[T]>=2 or nine[S]>=1
            gears=min(nine[G],2)
            if not direct and gears==0:continue
            for prized_thorton in range(min(6,pool[T])+1):
                options=weighted_ninth_draw(
                    pool,drawn,prized_thorton,requirements)
                if not options:continue
                if direct:
                    baseline+=hand_weight*options
                    inclusive_numerator+=hand_weight*options*TOP_DENOMINATOR
                else:
                    thorton_in_deck=pool[T]-prized_thorton
                    # The T2 natural draw is spent, leaving 42 cards in deck.
                    # Non-direct Gear branches do not draw another Thorton.
                    assert drawn!=T
                    failure=choose(42-thorton_in_deck,7)
                    p_num=TOP_DENOMINATOR-(
                        failure**gears * TOP_SEVEN**(2-gears))
                    inclusive_numerator+=hand_weight*options*p_num
    assert baseline==17221237379951920
    assert inclusive_numerator==15597724949201704732931556816768
    denominator=valid_seven*53*comb(52,6)*43*TOP_DENOMINATOR
    assert denominator==7836606921614801887896666834124800
    print('manifestSha',EXPECTED_SHA)
    print('strict_t1+direct_t2_percentage',100*baseline/(denominator/TOP_DENOMINATOR))
    print('strict_t1+gear_t2_percentage',100*inclusive_numerator/denominator)
    print('gear_added_percentage_points',100*(
        inclusive_numerator-baseline*TOP_DENOMINATOR)/denominator)
    print('inclusive_numerator',inclusive_numerator)
    print('inclusive_denominator',denominator)
    print('eligible_first_eight_compositions',len(first_eight_weights))

if __name__=='__main__':
    run()
