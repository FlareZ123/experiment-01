"""Exact rank26 opening tradeoff by sacrificial backup identity.
Current candidate policy withholds Dialga, Lele, Radiant unless fragile+Lele.
No conditional matchup win-rate assumed. Candidate and source both mulligan.
"""
from fractions import Fraction as F
from itertools import product
from math import comb
from collections import defaultdict
N=60; H=7; DEN=comb(N,H)-comb(46,H)
# O = normally benchable non-fragile Basic; F = fragile normally benchable.
# Both frozen profiles have identical setup classes (8,3,1,1,1,46).
CAP=(8,3,1,1,1,46)

def c(n,k):return comb(n,k) if 0<=k<=n else 0

def classify(opponent_basics=12):
 p=F(comb(46,7),comb(60,7)); q=F(comb(60-opponent_basics,7),comb(60,7))
 weights=[(1-q)/(1-p*q)]+[(1-p)*(1-q)*q**k/(1-p*q) for k in range(1,47)]
 weights.append((1-p)*q**47/(1-p*q))
 out=defaultdict(F)
 for o,f,d,l,r in product(range(2),range(2),range(2),range(2),range(2)):
  if o+f>1 or o+f+d+l+r==0 or f and l:continue
  z=7-o-f-d-l-r
  mult=c(8,o)*c(3,f)*c(46,z)
  if not mult:continue
  a='O' if o else 'F' if f else 'L' if l else 'R' if r else 'D'
  for bd,bl,br in product(range(1-d+1),range(1-l+1),range(1-r+1)):
   if f and bl:continue
   # No normal Basic in bonus under current singleton rule.
   k0=bd+bl+br
   probability=F(mult,DEN)*sum((weights[k]*F(c(46-z,k-k0),comb(53,k)) for k in range(k0,48)),F(0))
   avail=[key for key,n in [('D',d+bd),('L',l+bl),('R',r+br)] if n and key!=a]
   out[avail[0] if avail else 'forced']+=probability
   if avail:out['all_avoid']+=probability
 return dict(out)

if __name__=='__main__':
 from setup_exposure import singleton_exposure,current_policy_exposure
 a=classify();assert a['forced']==singleton_exposure(14)[1];assert a['all_avoid']==current_policy_exposure()[2]
 print('Unconditional openings, current policy singleton, highest available backup')
 for key in ('forced','D','L','R','all_avoid'):
  print(key,float(a[key]),f'{float(a[key]):.8%}',f'equal-32 maximum field gain: {float(a[key]/32)*100:.6f} pp')
 print('Backup choices by opponent Basic count')
 for n in range(4,25,2):
  b=classify(n);print(n,*(f'{float(b[k]):.6%}' for k in ('D','L','R','forced')))
