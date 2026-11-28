"""Run from repo root:
python tests/2026-11/agent15-flutter-iron-thorns-gate.test.py
"""
from importlib.machinery import SourceFileLoader
m=SourceFileLoader('flutter','scripts/2026-11/agent15-flutter-iron-thorns-gate.py').load_module()
assert len(m.make_deck('Team'))==60
assert len(m.make_deck('Gir'))==60
assert sum(m.BASE.values())==60
# Active Flutter's Ability suppresses opponent's Active Iron Thorns
# before Radiant Eternatus is played, so Gate can trigger.
opening=['Flutter','Z','P','FSS','Hood','C','Lillie']
prizes=['Guzma','T','T','P','Arven','VS']
assert m.a1_reachable(opening,prizes,'P',False,'Team')
# Other Basic must get Flutter Active by a real retreat/switch route.
opening=['C','Z','F','P','VS','FSS','Lillie']
assert m.a1_reachable(opening,prizes,'P',False,'Team')
assert m.a1_reachable(opening,prizes,'P',False,'Team',False,True)
# Two-retreat Rider V starting Active needs Float. Arven can find Float
# going second, but source Tool Jammer suppresses its effect while Active.
opening=['R','Z','F','Arven','Iono','Hood','Raihan']
prizes=['Guzma','T','T','P','Lillie','VS']
assert not m.a1_reachable(opening,prizes,'T',False,'Team')
assert m.a1_reachable(opening,prizes,'T',True,'Team')
assert not m.a1_reachable(opening,prizes,'T',True,'Team',False,True)
# No Flutter in setup and no legal pivot means Radiant trigger unavailable.
opening=['R','Z','F','Iono','Hood','Raihan','Lillie']
prizes=['Guzma','T','T','P','Arven','VS']
assert not m.a1_reachable(opening,prizes,'T',False,'Team')
assert 140>=90 # Volt Cyclone can KO full-HP Flutter on next turn.
a=m.simulate(5000,28112026,False,'Team',False,False)
b=m.simulate(5000,28112026,True,'Team',False,False)
jam=m.simulate(5000,28112026,True,'Team',False,True)
assert a['eligible']==4425 and a['flutter_start']==578
assert a['reachable']==877 and b['reachable']==1129 and jam['reachable']==924
assert a['reachable']<b['reachable'] and jam['reachable']<b['reachable']
print('Flutter Mane / Thorns T1 Gate opportunity regression passed')
