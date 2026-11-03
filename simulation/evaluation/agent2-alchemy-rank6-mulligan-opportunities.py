"""Paired, seeded, owner-max-bonus opening-access sensitivity for Aichi rank 6.

All cards are read from two registered exact 60 manifests and checked before
sampling. This is a resource-access model, not a playable game simulator.
"""
from __future__ import annotations

import json
import math
from collections import Counter
from pathlib import Path
import numpy as np

SEED = 20261103
SOURCE_BASIC = 4
CANDIDATE_BASIC = 12
REGISTRY_PATHS = (
    "agent43-apex-alchemy-paper-expanded-v0.json",
    "agent2-apex-alchemy-shake4-quick2-v1.json",
)
CLASS_NAMES = (
    "Alolan Grimer", "Alolan Muk", "Boost Shake", "Mysterious Treasure",
    "Quick Ball", "Budew", "Regidrago V",
)
OTHER_BASICS = {"Koraidon ex", "Tapu Lele-GX", "Latias ex", "Dialga-GX", "Kyurem"}
METRICS = ("muk", "budew", "regidrago", "mukRegidrago", "budewRegidrago", "eitherLockRegidrago", "budewDirectStartRegidrago")


def input_decks(root: Path):
    decks = [json.loads((root / "results" / "aichi-2026" / name).read_text(encoding="utf-8")) for name in REGISTRY_PATHS]
    cards = []
    for deck in decks:
        assert deck["total_cards"] == 60
        physical = [card["name"] for card in deck["cards"] for _ in range(card["count"])]
        assert len(physical) == 60
        cards.append(physical)
    c0, c1 = (Counter(deck) for deck in cards)
    assert c0 - c1 == Counter({"Quick Ball": 1})
    assert c1 - c0 == Counter({"Boost Shake": 1})
    assert all(c0[name] == copies for name,copies in [
        ("Alolan Grimer", 2), ("Alolan Muk", 2), ("Boost Shake", 3),
        ("Mysterious Treasure", 4), ("Quick Ball", 3),
        ("Budew", 1), ("Regidrago V", 4)])
    assert all(c0[name] == 1 for name in OTHER_BASICS)
    classify = lambda name: CLASS_NAMES.index(name) if name in CLASS_NAMES else (7 if name in OTHER_BASICS else 8)
    v0 = np.array([classify(name) for name in cards[0]],dtype=np.int8)
    v1 = v0.copy()
    v1[np.flatnonzero(v0 == 4)[-1]] = 2
    assert Counter(v1) == Counter(classify(name) for name in cards[1])
    return decks, v0, v1


def opening_opportunities(held:np.ndarray, prized:np.ndarray,initial:np.ndarray)->tuple[bool,...]:
    h=np.bincount(held,minlength=9)
    p=np.bincount(prized,minlength=9)
    grimer,muk,shake,treasure,quick,budew,regi=h[:7]
    otherStarter=np.any((initial==5)|(initial==6)|(initial==7))
    gDeck=2-grimer-p[0]>0
    mDeck=2-muk-p[1]>0
    bDeck=1-budew-p[5]>0
    vDeck=4-regi-p[6]>0
    search=treasure+quick
    M=otherStarter and shake>0 and mDeck and (grimer>0 or (search>0 and gDeck))
    B=budew>0 or (quick>0 and bDeck)
    V=regi>0 or (search>0 and vDeck)
    MV=M and V and (grimer>0 or regi>0 or search>=2)
    BV=B and V and (budew>0 or regi>0 or (quick>0 and search>=2))
    directActive=np.any(initial==5) and V
    return bool(M),bool(B),bool(V),bool(MV),bool(BV),bool(MV or BV),bool(directActive)


def two_actor_bonus_probabilities():
    p_candidate=1-math.comb(60-CANDIDATE_BASIC,7)/math.comb(60,7)
    p_source=1-math.comb(60-SOURCE_BASIC,7)/math.comb(60,7)
    mutual_failure=(1-p_candidate)*(1-p_source)
    bonus_any=p_candidate*(1-p_source)/(1-mutual_failure)
    return p_candidate,p_source,bonus_any


def simulate(root:Path, trials:int=300000, seed:int=SEED):
    decks,v0,v1=input_decks(root)
    rng=np.random.default_rng(seed)
    p_candidate,p_source,bonus_any=two_actor_bonus_probabilities()
    counts=np.zeros((7,2),dtype=np.int64)
    bonus_counts=np.zeros((7,2),dtype=np.int64)
    paired=np.zeros((7,3),dtype=np.int64)
    bonus_paired=np.zeros((7,3),dtype=np.int64)
    bonus_hist=np.zeros(8,dtype=np.int64)
    censored=0
    for trial in range(trials):
        while True:
            order=rng.permutation(60)
            first7=v0[order[:7]]
            if np.any((first7==0)|(first7==5)|(first7==6)|(first7==7)):
                break
        bonus=int(rng.geometric(p_source)) if rng.random()<bonus_any else 0
        if bonus>45:
            censored+=1
            continue
        bonus_hist[min(bonus,7)]+=1
        observed=np.concatenate((order[:7],order[13:14+bonus]))
        measured=[opening_opportunities(deck[observed],deck[order[7:13]],deck[order[:7]]) for deck in (v0,v1)]
        for i,(left,right) in enumerate(zip(*measured)):
            counts[i,0]+=int(left)
            counts[i,1]+=int(right)
            paired[i,1+int(right)-int(left)]+=1
            if bonus>0:
                bonus_counts[i,0]+=int(left)
                bonus_counts[i,1]+=int(right)
                bonus_paired[i,1+int(right)-int(left)]+=1
    completed=trials-censored
    def rows(values,deltas,n):
        summary={}
        for i,key in enumerate(METRICS):
            mean=(values[i]/n).tolist()
            delta=(deltas[i,2]-deltas[i,0])/n
            d2=(deltas[i,0]+deltas[i,2])/n
            se=math.sqrt((d2-delta*delta)/(n-1))
            summary[key]={"v0":mean[0],"v1":mean[1],"difference":delta,
                "discordant":{"v0Only":int(deltas[i,0]),"v1Only":int(deltas[i,2])},
                "paired95CI":[delta-1.959963984540054*se,delta+1.959963984540054*se]}
        return summary
    return {"kind":"rank6-iron-thorns-ex-mulligan-paired-idealized-opening",
      "seat":"candidate going first/second access, not actual attack",
      "seed":seed,"attempted":trials,"censored":censored,"completed":completed,
      "source":"rank6 original four Iron Thorns ex; no source attack modeled",
      "candidateV0Hash":decks[0]["deck_identity_sha256"],
      "candidateV1Hash":decks[1]["deck_identity_sha256"],
      "mulligan":{"candidateValidSeven":p_candidate,"rank6ValidSeven":p_source,
       "probabilityCandidateOfferedAnyBonus":bonus_any,
       "expectedCandidateMaximumBonusCards":bonus_any/p_source,
       "observedBonusHistogram0Through6And7Plus":bonus_hist.tolist()},
      "all":rows(counts,paired,completed),
      "bonusAtLeastOne":rows(bonus_counts,bonus_paired,int(bonus_hist[1:].sum())),
      "disclaimer":"Resource opportunity only. Opponent/owner decision policies, energy, actual paid searches, mobility, attacks, locks and clock not simulated."}


if __name__=="__main__":
    root=Path(__file__).resolve().parents[2]
    print(json.dumps(simulate(root),indent=2))
