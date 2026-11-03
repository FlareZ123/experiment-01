"""Independent conditional card-deal count for ADP T1 access against original rank6 T2 Item + attack.

Two candidate T1 card-access routes and one source same-turn Item + G&H/Thunder/DCE
route; no actual choices, payments, attack damage or completed games certified.
"""
from math import comb
from itertools import product
from agent17_rank6_item_disrupt_attack import enumerate_physical as source_opportunity

def c(n: int, k: int) -> int:
    return comb(n, k) if 0 <= k <= n else 0

def groups(total: int, counts: tuple[int, ...]):
    for prefix in product(*(range(min(x,total)+1) for x in counts[:-1])):
        tail=total-sum(prefix)
        if 0 <= tail <= counts[-1]:
            yield tuple(prefix)+(tail,)

def unprized(deck: list[int], required: list[int], remaining: int) -> int:
    if any(deck[i] == 0 for i in required):
        return 0
    result=0
    for mask in range(1 << len(required)):
        n=sum(deck[required[i]] for i in range(len(required)) if mask & (1<<i))
        result += (-1 if mask.bit_count() % 2 else 1) * c(remaining-n,6-n)
    return result

CANDIDATE_A=(2,4,4,3,5,42)
VALID7=c(60,7)-c(53,7)

def candidate_adp_active(bonus: int) -> float:
    """ADP Active from initial seven; first own draw+bonus, DDE or G&H/Tag search."""
    n=bonus+1
    denominator=VALID7*c(53,n)*c(53-n,6)
    numerator=0
    for seven in groups(7,CANDIDATE_A):
        if seven[0] == 0:
            continue
        w7=1
        for size,taken in zip(CANDIDATE_A,seven):
            w7*=c(size,taken)
        rem=[a-b for a,b in zip(CANDIDATE_A,seven)]
        for drawn in groups(n,tuple(rem)):
            seen=[a+b for a,b in zip(seven,drawn)]
            if seen[1]:
                needed=[]
            elif seen[3]:
                needed=[1]
            elif seen[2]:
                needed=[1,3]
            else:
                continue
            rest=[a-b for a,b in zip(rem,drawn)]
            p=unprized(rest,needed,53-n)
            if not p:
                continue
            ways=w7*p
            for size,taken in zip(rem,drawn):
                ways*=c(size,taken)
            numerator+=ways
    return numerator/denominator

CANDIDATE_B=(2,5,4,2,3,4,40)
BRIDGE_STATES={}

def build_bridge():
    """Aggregate initial seven and Prizes with held Tag Call/Switch and future supply."""
    if BRIDGE_STATES:
        return
    for seven in groups(7,CANDIDATE_B):
        if seven[0] or not seven[1]:
            continue
        w7=1
        for size,taken in zip(CANDIDATE_B,seven):
            w7*=c(size,taken)
        rem=[a-b for a,b in zip(CANDIDATE_B,seven)]
        for prize in groups(6,tuple(rem)):
            if any(CANDIDATE_B[i]-prize[i] == 0 for i in (0,4,5)):
                continue
            weight=w7
            for size,taken in zip(rem,prize):
                weight*=c(size,taken)
            key=(bool(seven[2]),bool(seven[3]),rem[2]-prize[2],rem[3]-prize[3])
            BRIDGE_STATES[key]=BRIDGE_STATES.get(key,0)+weight
    assert len(BRIDGE_STATES)==45

def candidate_switch_bridge(bonus: int) -> float:
    """Different Basic Active from opening seven; Tag Call+Switch in T1 hand."""
    build_bridge()
    n=bonus+1
    total=c(47,n)
    def untouched(cards: int) -> float:
        return c(47-cards,n)/total
    numerator=0.
    for (held_tag,held_switch,tag_left,switch_left),ways in BRIDGE_STATES.items():
        if held_tag and held_switch:
            hit=1.
        elif held_tag:
            hit=1-untouched(switch_left)
        elif held_switch:
            hit=1-untouched(tag_left)
        else:
            hit=1-untouched(tag_left)-untouched(switch_left)+untouched(tag_left+switch_left)
        numerator+=ways*hit
    return numerator/(VALID7*c(53,6))

def bilateral(max_bonus: int = 30) -> dict:
    """Couple the independent conditional printed decks by mutual mulligan extras."""
    qc=c(53,7)/c(60,7)
    qs=c(56,7)/c(60,7)
    common=(1-qc)*(1-qs)/(1-qc*qs)
    c0=candidate_adp_active(0)+candidate_switch_bridge(0)
    source_num,source_den=source_opportunity(0)
    s0=source_num/source_den
    joint=common*c0*s0
    for d in range(1,max_bonus+1):
        cd=candidate_adp_active(d)+candidate_switch_bridge(d)
        source_num,source_den=source_opportunity(d)
        sd=source_num/source_den
        joint+=common*qs**d*cd*s0 + common*qc**d*c0*sd
    candidate_tail=(1-qc)*qs**(max_bonus+1)/(1-qc*qs)
    source_tail=(1-qs)*qc**(max_bonus+1)/(1-qc*qs)
    tail=candidate_tail*s0 + source_tail*c0
    return {
        "candidate_t1_two_route_no_bonus_percent":100*c0,
        "source_item_and_attack_no_bonus_percent":100*s0,
        "bilateral_joint_full_bonus_lower_percent":100*joint,
        "bilateral_joint_full_bonus_upper_percent":100*(joint+tail),
        "geometric_omitted_tail":tail,
        "qualified_games":0
    }


if __name__ == "__main__":
    import json
    result=bilateral(30)
    assert abs(result["candidate_t1_two_route_no_bonus_percent"]-34.66718343588455)<1e-8
    assert abs(result["source_item_and_attack_no_bonus_percent"]-12.607272492641695)<1e-8
    assert abs(result["bilateral_joint_full_bonus_lower_percent"]-5.15825103784946)<1e-8
    assert result["bilateral_joint_full_bonus_upper_percent"]-result["bilateral_joint_full_bonus_lower_percent"]<0.000002
    print(json.dumps({"status":"PASS","original_source_rank":6,
        "evidence_kind":"physical hand/Prize access without payment or actions",**result},indent=2))
