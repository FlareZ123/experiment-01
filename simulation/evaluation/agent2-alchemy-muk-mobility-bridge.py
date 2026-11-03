"""Paired physical-opening mobility extension for Agent2's paid Muk/Regidrago test.

Muk Power of Alchemy disables our own Basic Latias ex Skyliner Ability. A
Regidrago V on Bench can still become Active at the start of turn two if the
initial Active was Budew (zero printed Retreat Cost) or carries Float Stone.
This code counts explicit paid-resource opportunities only, not native games.
"""
from __future__ import annotations

import importlib.util
import json
import math
from collections import Counter
from pathlib import Path

import numpy as np

BASE_PATH = Path(__file__).with_name('agent2-alchemy-paid-muk-turn1.py')
SPEC = importlib.util.spec_from_file_location('agent2_muk_paid_base', BASE_PATH)
BASE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BASE)
FLOAT = 'Float Stone'
FREE_RETREAT = {'Budew'}
OTHER_ACTIVE = BASE.BASICS - {BASE.GRIMER, BASE.REGI, 'Budew'}
METRICS = ('activeRegi', 'budewZeroRetreat', 'floatOtherActive', 'eitherMobile',
           'latiasSkylinerMiscountPrevented')


def _paid_ready(held: Counter, prized: Counter, total: Counter, active: str,
                use_float: bool) -> bool:
    """Existential line with physically distinct mandatory search donors."""
    d = total - held - prized
    if held[BASE.SHAKE] == 0 or d[BASE.MUK] == 0:
        return False
    needed = tuple(name for name in (BASE.GRIMER, BASE.REGI) if held[name] == 0)
    if any(d[name] == 0 for name in needed):
        return False
    for searches in BASE._partitions_for_search(held, needed):
        reserve = Counter({BASE.SHAKE: 1}) + searches
        reserve[active] += 1
        for name in (BASE.GRIMER, BASE.REGI):
            if held[name]:
                reserve[name] = max(reserve[name], 1)
        reserve[BASE.VSTAR] += 1
        reserve[BASE.DDE] += 1
        if use_float:
            reserve[FLOAT] += 1
        for second in BASE.ENERGIES:
            full = reserve.copy()
            full[second] += 1
            if any(held[k] < n for k,n in full.items()):
                continue
            remaining = held - full
            if sum(remaining.values()) < len(needed):
                continue
            paid_payload = (bool(needed)
                            and any(remaining[name] > 0 for name in BASE.PAYLOAD))
            if not needed and any(remaining[name] > 0 for name in BASE.PAYLOAD):
                paid_payload = bool(
                    (remaining[BASE.QUICK] > 0 and any(d[name] > 0 for name in BASE.BASICS))
                    or (remaining[BASE.TREASURE] > 0 and any(
                        d[name] > 0 for name in BASE.PAYLOAD |
                        {BASE.GRIMER,BASE.MUK,BASE.REGI,BASE.VSTAR,'Tapu Lele-GX'})))
            compressor_payload = (remaining[BASE.COMPRESSOR] > 0
                                  and sum(remaining.values()) - 1 >= len(needed)
                                  and any(d[name] > 0 for name in BASE.PAYLOAD))
            if paid_payload or compressor_payload:
                return True
    return False


def mobility_witness(held: list[str], prized: list[str], initial: list[str],
                     total: Counter) -> tuple[bool,bool,bool,bool,bool]:
    h,p = Counter(held), Counter(prized)
    starter = set(initial)
    direct = BASE.REGI in starter and _paid_ready(h,p,total,BASE.REGI,False)
    budew = 'Budew' in starter and _paid_ready(h,p,total,'Budew',False)
    float_other = bool(h[FLOAT]) and any(
        _paid_ready(h,p,total,active,True)
        for active in starter & OTHER_ACTIVE
    )
    # The full candidate with Alolan Muk active cannot rely on Skyliner to
    # generate free retreat; flag precisely the Latias-only absent-Tool case.
    latias_suppression = ('Latias ex' in starter
                          and _paid_ready(h,p,total,'Latias ex',False)
                          and not direct and not budew and not float_other)
    return bool(direct),bool(budew),bool(float_other),bool(direct or budew or float_other),bool(latias_suppression)


def run(root: Path, trials: int = 40000, seed: int = 20261103, bonus_policy: str = 'all'):
    if bonus_policy not in ('all', 'none'):
        raise ValueError('bonus_policy must be all or none')
    manifests,decks,inventory = BASE.input_decks(root)
    source_strata = BASE.source_basics(root)
    if trials < 2 or sum(source_strata.values()) != 29:
        raise ValueError('Need 29 authenticated source ranks and >=2 paired draws per stratum')
    fields = {m:{'v0':0., 'v1':0., 'delta':0., 'variance':0.} for m in METRICS}
    rows=[]
    for source_basic,rank_count in sorted(source_strata.items()):
        rng=np.random.default_rng(seed+source_basic)
        bonus_offer,source_valid = BASE.opponent_bonus_probability(source_basic)
        wins=np.zeros((len(METRICS),2),dtype=np.int64)
        discordant=np.zeros((len(METRICS),2),dtype=np.int64)
        for _ in range(trials):
            while True:
                order=rng.permutation(60)
                first=[decks[0][i] for i in order[:7]]
                if any(x in BASE.BASICS for x in first):
                    break
            bonus=int(rng.geometric(source_valid)) if rng.random() < bonus_offer else 0
            bonus=min(bonus,46) if bonus_policy == 'all' else 0
            observed=list(order[:7])+list(order[13:14+bonus])
            out=[mobility_witness([deck[i] for i in observed],
                 [deck[i] for i in order[7:13]], [deck[i] for i in order[:7]],counts)
                 for deck,counts in zip(decks,inventory)]
            for j in range(len(METRICS)):
                a,b=map(int,(out[0][j],out[1][j]))
                wins[j,0]+=a
                wins[j,1]+=b
                if a!=b:
                    discordant[j,b]+=1
        data={};weight=rank_count/29
        for j,name in enumerate(METRICS):
            a,b=wins[j]/trials
            diff=float(b-a)
            dis=float(discordant[j].sum()/trials)
            var=max(0.,(dis-diff*diff)/(trials-1))
            data[name]={'v0':float(a),'v1':float(b),'delta':diff,
                        'v0Only':int(discordant[j,0]),'v1Only':int(discordant[j,1])}
            fields[name]['v0']+=weight*a
            fields[name]['v1']+=weight*b
            fields[name]['delta']+=weight*diff
            fields[name]['variance']+=weight**2*var
        rows.append({'sourceBasic':source_basic,'rankCount':rank_count,
                     'bonusOfferProbability':bonus_offer,'metrics':data})
    z=1.959963984540054
    for data in fields.values():
        se=math.sqrt(data.pop('variance'))
        data['paired95CI']=[data['delta']-z*se,data['delta']+z*se]
    return {'study':'agent2-muk-apex-paid-starter-mobility-v1',
            'candidateV0Sha256':manifests[0]['deck_identity_sha256'],
            'candidateV1Sha256':manifests[1]['deck_identity_sha256'],
            'seed':seed,'bonusPolicy':bonus_policy,'trialsPerBasicStratum':trials,
            'totalPairedSetups':len(source_strata)*trials,'knownOriginalRanks':29,
            'excludedOriginalRanks':[23,25,28],
            'sources':'original 29 rank Basic-count strata, candidate full 60, all offered bonus draws',
            'strata':rows,'equalRankField':fields,
            'caution':'Strict no-draw resource witness, no opposing actions, no paper game or win rate.'}


if __name__ == '__main__':
    print(json.dumps(run(Path(__file__).resolve().parents[2]),indent=2))
