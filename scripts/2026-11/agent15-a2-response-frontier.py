"""Conditional 3-attack response frontier after visible Regidrago Covert.
Not a Pokemon game, matchup simulation, natural-frequency estimate, or native
Twinleaf engine. Every source reply and A2/A3 resource is a stipulation.
"""
from dataclasses import dataclass
PAYLOADS=('covert','phantom','trifrost','ryuno','rolling','timeless_phantom')
@dataclass(frozen=True)
class Scenario:
    dna: bool=True
    band: bool=True
    latias_hp: int=210
    clefairy_hp: int=190
    deoxys_hp: int=330
    source_prizes_before: int=0
    valley: bool=True
    fairy: bool=True
    skyliner: bool=True
    door_available: bool=True
    manual_available: bool=True
    held_psychic: int=2
    deoxys_benched: bool=True
    ranger_available: bool=True
    acerola_available: bool=True
    guzma_available: bool=True
    vs_seeker_available: bool=True
    items_usable: bool=True
    two_exposed_v: bool=True
    three_vstar: bool=True

def source_damage(reply,band=True,dna=True):
    """(Active damage, Clefairy effects, Latias Bench damage, reduction, double attack).
    Band boosts only damage to Active. DNA reduces actual VSTAR attack damage,
    not Phantom Dive's six damage counters.
    """
    mod=(20 if band else 0)-(30 if dna else 0)
    if reply=='covert':return max(0,70+mod),0,0,0,False
    if reply=='phantom':return max(0,200+mod),60,0,0,False
    if reply=='trifrost':
        spread=max(0,110-(30 if dna else 0))
        return max(0,110+mod),spread,spread,0,False
    if reply=='ryuno':return max(0,330+mod),0,0,0,False
    if reply=='rolling':return max(0,200+mod),0,0,80,False
    if reply=='timeless_phantom':
        return max(0,150+mod)+max(0,200+mod),60,0,0,True
    raise ValueError(reply)

def assess(s:Scenario,a2:str,reply:str):
    """Evaluate stipulated A2 plan then one possible source reply and A3."""
    if reply not in PAYLOADS or a2 not in ('D','R','A','G'):raise ValueError((a2,reply))
    def ret(success,reason,used=(),source_prizes=0):
        return dict(a2=a2,reply=reply,success=success,reason=reason,
                    used=used,source_prizes=s.source_prizes_before+source_prizes)
    if not(s.valley and s.fairy and s.skyliner) or s.latias_hp<=0 or s.clefairy_hp<=0:
        return ret(False,'baseline unavailable')
    latias=s.latias_hp-max(0,70+(20 if s.band else 0)-(30 if s.dna else 0))
    if latias<=0:return ret(False,'first Covert KO',source_prizes=2)
    dmg,clef,bench,reduce,double=source_damage(reply,s.band,s.dna)
    if a2=='D':
        if not(s.three_vstar and s.deoxys_benched and s.door_available and s.manual_available and s.held_psychic>=2):
            return ret(False,'Deoxys two-P funding unavailable')
        deoxys=s.deoxys_hp-dmg
        if s.clefairy_hp-clef<=0:return ret(False,'Clefairy KO from spread')
        if deoxys<=0:
            if s.source_prizes_before+3>=6:return ret(False,'source took sixth Prize',('Door','manual'),3)
            if latias-bench<=0:return ret(False,'Latias unavailable',('Door','manual'),3)
            return ret(True,'promote funded Latias after Deoxys KO',('Door','manual'),3)
        if reduce and not s.ranger_available:return ret(False,'Rolling 80 reduction prevents Drain KO',('Door','manual'))
        return ret(True,'repeat Max Drain',('Door','manual','Ranger') if reduce else ('Door','manual'))
    if a2=='R':
        if not(s.three_vstar and s.ranger_available and s.vs_seeker_available and s.items_usable):
            return ret(False,'Ranger+VS unavailable')
        latias-=dmg
        if s.clefairy_hp-clef<=0:return ret(False,'Clefairy KO from spread',('Ranger','VS'))
        if latias<=0:return ret(False,'Latias KO after Ranger',('Ranger','VS'),2)
        return ret(True,'VS Ranger resets Eon cooldown',('Ranger','VS','Ranger'))
    if a2=='A':
        if not(s.three_vstar and s.acerola_available and s.ranger_available and s.door_available and s.manual_available):
            return ret(False,'Acerola reset or Ranger unavailable')
        latias=s.latias_hp-dmg
        if s.clefairy_hp-clef<=0:return ret(False,'Clefairy KO from spread',('Acerola','Door','manual'))
        if latias<=0:return ret(False,'reset Latias KO',('Acerola','Door','manual'),2)
        return ret(True,'Ranger resets Eon cooldown',('Acerola','Door','manual','Ranger'))
    if a2=='G':
        if not(s.two_exposed_v and s.guzma_available and s.vs_seeker_available and s.items_usable):
            return ret(False,'two gust targets or VS unavailable')
        latias-=dmg
        if s.clefairy_hp-clef<=0:return ret(False,'Clefairy KO from spread',('Guzma','VS'))
        if latias<=0:return ret(False,'Latias KO between Guzmas',('Guzma','VS'),2)
        return ret(True,'VS Guzma second Bench KO',('Guzma','retreat','VS','Guzma','retreat'))
    raise AssertionError()

def coverage(s:Scenario,replies=PAYLOADS):
    answers={a:{r:assess(s,a,r) for r in replies} for a in ('D','R','A','G')}
    return {a:dict(covered=sum(v['success'] for v in vals.values()),
                   possible=len(replies),
                   win_replies=[r for r,v in vals.items() if v['success']],
                   failure_replies=[r for r,v in vals.items() if not v['success']])
            for a,vals in answers.items()}

if __name__=='__main__':
    for name,s in [('Gate',Scenario()),('Hood',Scenario(dna=False,deoxys_benched=False)),
                   ('Gate no Ranger',Scenario(ranger_available=False)),
                   ('Gate no spare P',Scenario(held_psychic=0))]:
        print(name,coverage(s))
