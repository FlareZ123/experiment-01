// Restricted, actor-realizable Gate reachability for Wobbuffet vs Shadow Rider V.
// Compile: g++ -O3 -std=c++17 active-choice.cpp -o active-choice
// Run: ./active-choice [--csv] [--limit N]
// Query: ./active-choice --post H BUDGET GOAL
// Resolve inspected search: ./active-choice --branch H BUDGET GOAL ACTION PRIZES
// H/PRIZES: comma-separated counts V,VMAX,Lele,Latias,Radiant,Arven,Float,FSS,Heavy,Fog,Ball,Psychic,Other.
// H is the seven observed non-Wob cards including V in play/hand; PRIZES used only after legal inspection.
// All source counts from unchanged Lockbridge 60, Wobbuffet fixed in opening.
// No games, opponent-policy assumptions, or win-rate claim.
#include <array>
#include <cassert>
#include <cstdint>
#include <cstdlib>
#include <functional>
#include <iomanip>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
#include <algorithm>
#include <limits>
#include <tuple>
#include <stdexcept>
using namespace std;
using U=uint64_t; using Mask=uint16_t;
enum Card { V,VM,T,L,R,A,F,S,H,G,B,P,O,N };
// T=Tapu Lele, L=Latias, R=Radiant Eternatus, A=Arven, F=Float,
// S=Forest Seal Stone, H=Heavy Ball, G=Fog, B=discard search, P=Psychic.
constexpr array<int,N> CAP{4,4,1,1,1,1,1,1,1,4,5,11,24};
using Counts=array<int,N>;
U CH[61][61]{};
constexpr int DIRECT=0, ARVEN=1, LELE=2, STONE=3, FOG=4, BALL=5, HEAVY=6, ACTS=7;
constexpr int VG=0,VF=1,WG=2,WF=3;
// Budget block 0: at most two designated Other discards, FSS allowed.
// 1: same, FSS forbidden. 2: no discard, FSS allowed. 3: neither.
constexpr int BIT(int budget,int goal){return 4*budget+goal;}
constexpr Mask SB(int c){return Mask(1u<<(c-T));}
struct St {
  uint8_t h=0,d=0,hg=0,hb=0,dg=0,db=0,hp=0,dp=0,pr=0,remain=0,spent=0,stone=0,lele=0;
  bool held(int c)const { if(c==G)return hg; if(c==B)return hb; if(c==P)return hp; return h&SB(c); }
  bool deck(int c)const { if(c==G)return dg; if(c==B)return db; if(c==P)return dp; return d&SB(c); }
  void remove(int c) { if(c==G){assert(hg);--hg;}else if(c==B){assert(hb);--hb;}else {assert(held(c));h&=~SB(c);} }
  void get(int c){ assert(deck(c)); if(c==G){--dg;++hg;}else if(c==B){--db;++hb;}else if(c==P){dp=0;hp=1;}else {d&=~SB(c);h|=SB(c);} }
  U key()const {U k=h; k=k*128+d; k=k*8+hg; k=k*8+hb; k=k*4+dg; k=k*4+db; k=k*2+hp; k=k*2+dp; k=k*8+pr; k=k*4+remain; k=k*4+spent; k=k*2+stone; k=k*2+lele;return k;}
};
// T/L/R are the first three singleton bits, matching pr bits.
Mask allowed(const St&s){Mask m=0;for(int b=0;b<4;++b)if((!(b&1)||!s.stone)&&(!(b&2)||!s.spent))m|=Mask(15u<<(4*b));return m;}
Mask goals(const St&s){ if(!s.held(R))return 0; bool w=s.held(F)||(s.held(L)&&!s.lele); Mask x=1|(s.hp?2:0)|(w?4:0)|(w&&s.hp?8:0);return Mask((x|(x<<4)|(x<<8)|(x<<12))&allowed(s)); }
bool available(const St&s,int a){switch(a){case ARVEN:return s.held(A);case LELE:return s.held(T);case STONE:return s.held(S);case FOG:return s.hg;case BALL:return s.hb&&s.remain;case HEAVY:return s.held(H);default:return false;}}
// Each callback receives a state after the named search's result selection.
// First search may fail/decline a restricted search after legally inspecting hidden zone.
// Stone must retrieve a card; 'irrelevant' is abstracted only at first reveal; it cannot pay costs in this model.
template<class Fn> void successors(const St&s,int a,bool first,Fn emit){
 if(!available(s,a))return;
 if(a==ARVEN){St base=s;base.remove(A);int its[]={-1,G,B,H};int tls[]={-1,F,S};for(int i:its){if(i>=0&&!base.deck(i))continue;for(int t:tls){if(t>=0&&!base.deck(t))continue;if(i<0&&t<0&&!first)continue;St q=base;if(i>=0)q.get(i);if(t>=0)q.get(t);emit(q);}}}
 else if(a==LELE){St q=s;q.remove(T);q.lele=1;if(q.deck(A)){St r=q;r.get(A);emit(r);}if(first)emit(q);}
 else if(a==STONE){St q=s;q.remove(S);q.stone=1;for(int c:{T,L,R,A,F,H,G,B,P})if(q.deck(c)&&!(c==P&&q.hp)){St r=q;r.get(c);emit(r);}if(first)emit(q);}
 else if(a==FOG){St q=s;q.remove(G);for(int c:{T,L,P})if(q.deck(c)&&!(c==P&&q.hp)){St r=q;r.get(c);emit(r);}if(first)emit(q);}
 else if(a==BALL){St q=s;q.remove(B);--q.remain;++q.spent;for(int c:{T,L,R})if(q.deck(c)){St r=q;r.get(c);emit(r);}if(first)emit(q);}
 else if(a==HEAVY){St q=s;q.remove(H);for(int c:{T,L,R})if(q.pr&SB(c)){St r=q;r.pr&=~SB(c);r.h|=SB(c);emit(r);}if(first)emit(q);}
}
unordered_map<U,Mask> memo;
Mask solve(const St&s){Mask g=goals(s),upper=allowed(s);if(g==upper)return g;U k=s.key();auto it=memo.find(k);if(it!=memo.end())return it->second;
 // If Radiant is neither held, in deck, nor in prizes, no restricted route can produce it.
 if(!s.held(R)&&!s.deck(R)&&!(s.pr&SB(R)))return 0;
 // Lele cannot help after Arven is used/unavailable; no need to expend resources in K1 for empty searches.
 for(int a:{ARVEN,LELE,STONE,FOG,BALL,HEAVY}){if(a==LELE&&!s.deck(A))continue;successors(s,a,false,[&](const St&q){if(g!=upper)g|=solve(q);});if(g==upper)break;}
 memo.emplace(k,g);return g;}
Mask firstmask(const St&s,int a){if(a==DIRECT)return goals(s);Mask g=0,upper=allowed(s);successors(s,a,true,[&](const St&q){if(g!=upper)g|=solve(q);});return g;}
int prize_key(const Counts&h,const Counts&p){int k=0;for(int c=T;c<=H;++c)if(CAP[c]-h[c]-p[c])k|=SB(c);int dg=min(2,CAP[G]-h[G]-p[G]),db=min(2,CAP[B]-h[B]-p[B]);k|=dg<<7;k|=db<<9;k|=(CAP[P]-h[P]-p[P]>0)<<11;k|=(CAP[VM]-h[VM]-p[VM]>=2)<<12;return k;}
St make_state(const Counts&h,int k){St s;s.d=k&127;for(int c=T;c<=H;++c)if(h[c])s.h|=SB(c);s.hg=h[G];s.hb=h[B];s.hp=h[P]>0;s.dg=(k>>7)&3;s.db=(k>>9)&3;s.dp=(k>>11)&1;s.pr=(~(s.h|s.d))&7;s.remain=min(2,h[O]);return s;}
// Packed hand key; physical-card counts are represented by choose weights.
U handkey(const Counts&h){U k=0;for(int i=0;i<N;++i)k=k*12+h[i];return k;}
U weight(const Counts&h){U w=1;for(int i=0;i<N;++i)w*=CH[CAP[i]][h[i]];return w;}
void enumerate(const Counts&caps,int n,function<void(const Counts&,U)> cb){Counts a{};array<int,N+1> suffix{};for(int i=N-1;i>=0;--i)suffix[i]=suffix[i+1]+caps[i];auto go=[&](auto&&self,int i,int r,U w)->void{if(i==N){if(!r)cb(a,w);return;}for(int x=max(0,r-suffix[i+1]);x<=min(caps[i],r);++x){a[i]=x;self(self,i+1,r-x,w*CH[caps[i]][x]);}};go(go,0,n,1);}
using Vec=array<U,16>; using Table=array<Vec,ACTS>;
Table posttable(const Counts&h,U& worlds,U& grouped){Counts rem;for(int i=0;i<N;++i)rem[i]=CAP[i]-h[i];array<U,8192> bins{};vector<int> keys;U denom=0;enumerate(rem,6,[&](const Counts&p,U w){++worlds;int k=prize_key(h,p);if(!bins[k])keys.push_back(k);bins[k]+=w;denom+=w;});assert(denom==CH[52][6]);grouped+=keys.size();Table a{};for(int k:keys){if(!(k&(1<<12)))continue;St s=make_state(h,k);for(int act=0;act<ACTS;++act){if(act!=DIRECT&&!available(s,act))continue;Mask z=firstmask(s,act);for(int b=0;b<16;++b)if(z&(1u<<b))a[act][b]+=bins[k];}}
 return a;}
Vec post(const Counts&h,U& worlds,U& grouped){Table a=posttable(h,worlds,grouped);Vec best{};for(int b=0;b<16;++b)for(int act=0;act<ACTS;++act)best[b]=max(best[b],a[act][b]);for(int b=0;b<4;++b){assert(best[BIT(b,WF)]<=best[BIT(b,VF)]);assert(best[BIT(b,WG)]<=best[BIT(b,VG)]);assert(best[BIT(b,VF)]<=best[BIT(b,VG)]);assert(best[BIT(b,WF)]<=best[BIT(b,WG)]);if(h[F]){assert(best[BIT(b,WF)]==best[BIT(b,VF)]);assert(best[BIT(b,WG)]==best[BIT(b,VG)]);}}return best;}
void tests(){St s;s.h=SB(R)|SB(F);s.hp=1;assert(solve(s)==65535);s.h=SB(R)|SB(L);assert(solve(s)==65535);s.lele=1;assert(solve(s)==0x3333);s.lele=0;s.h=SB(R)|SB(S);s.d=SB(F);assert((solve(s)&(1u<<BIT(0,WF)))!=0);assert((solve(s)&(1u<<BIT(1,WF)))==0);
 // One Arven cannot acquire both Float and Stone; with Radiant only available by Stone and no pivot, W fails.
 s={};s.h=SB(A);s.d=SB(F)|SB(S)|SB(R);s.hp=1;assert(solve(s)&(1u<<BIT(0,VF)));assert(!(solve(s)&(1u<<BIT(0,WF))));
 // Arven can acquire Float and Ball together, paying a discard to find Radiant.
 s={};s.h=SB(A);s.d=SB(F)|SB(R);s.db=1;s.hp=1;s.remain=1;assert(solve(s)&(1u<<BIT(1,WF)));assert(!(solve(s)&(1u<<BIT(3,WF))));
 // Lele consumes the fifth slot if Latias is also required; Float route still works.
 s={};s.h=SB(T)|SB(L);s.d=SB(A)|SB(R);s.db=1;s.hp=1;s.remain=1;assert(solve(s)&(1u<<BIT(1,VF)));assert(!(solve(s)&(1u<<BIT(1,WF))));s.d|=SB(F);assert(solve(s)&(1u<<BIT(1,WF)));
 // Prize-only Radiant rescued by one Heavy Ball, and Float allows normal five-Bench Gate.
 s={};s.h=SB(H)|SB(F);s.pr=SB(R);s.hp=1;assert(solve(s)&(1u<<BIT(3,WF)));memo.clear();}
// Practical actor-only query interface. Query first action with observed h only;
// branch may receive Prize composition ONLY after first-action inspection.
const array<string,N> CN={"V","VMAX","Lele","Latias","Radiant","Arven","Float","FSS","Heavy","Fog","Ball","Psychic","Other"};
const array<string,ACTS> AN={"direct","arven","lele","stone","fog","ball","heavy"};
const array<string,4> GN={"VG","VF","WG","WF"};
Counts parse_counts(const string&arg,int total){Counts a{};size_t start=0;int sum=0;for(int c=0;c<N;++c){size_t end=arg.find(',',start);if((c==N-1)!=(end==string::npos))throw runtime_error("expected 13 comma-separated counts");string v=arg.substr(start,end==string::npos?end:end-start);size_t used=0;a[c]=stoi(v,&used);if(used!=v.size()||a[c]<0||a[c]>CAP[c])throw runtime_error("invalid count for "+CN[c]);sum+=a[c];start=end==string::npos?arg.size():end+1;}if(sum!=total)throw runtime_error("wrong count total");return a;}
template<class Names> int lookup(const string&arg,const Names&names){for(size_t i=0;i<names.size();++i)if(arg==names[i])return int(i);throw runtime_error("unknown value: "+arg);}
string describe(int a,const St&s,const St&q){string out=AN[a];vector<string> got;for(int c=T;c<=P;++c){bool took=false;if(c==G)took=q.dg<s.dg;else if(c==B)took=q.db<s.db;else if(c==P)took=q.dp<s.dp;else if(a==HEAVY)took=(s.pr&SB(c))&&!(q.pr&SB(c));else took=s.deck(c)&&!q.deck(c);if(took)got.push_back(CN[c]);}if(!got.empty()){out+=" -> ";for(size_t i=0;i<got.size();++i){if(i)out+=" + ";out+=got[i];}}else out+=(a==STONE?" -> other (mandatory)":" -> decline");return out;}
struct Plan {bool valid=false;vector<string> steps;int spent=0,stone=0,lele=0;bool floatReady=false,latiasReady=false;};
bool better(const Plan&a,const Plan&b){if(!a.valid)return false;if(!b.valid)return true;return make_tuple(a.stone,a.spent,a.lele,a.steps.size(),a.steps)<make_tuple(b.stone,b.spent,b.lele,b.steps.size(),b.steps);}
unordered_map<U,Plan> pmemo;
Plan continuation(const St&s,int bit){Mask need=Mask(1u<<bit);if(!(solve(s)&need))return {};if(goals(s)&need)return {true,{},s.spent,s.stone,s.lele,s.held(F),s.held(L)&&!s.lele};auto it=pmemo.find(s.key());if(it!=pmemo.end())return it->second;Plan best;for(int a:{FOG,HEAVY,ARVEN,LELE,BALL,STONE}){if(a==LELE&&!s.deck(A))continue;successors(s,a,false,[&](const St&q){Plan p=continuation(q,bit);if(!p.valid)return;p.steps.insert(p.steps.begin(),describe(a,s,q));if(better(p,best))best=move(p);});}pmemo.emplace(s.key(),best);return best;}
Plan after_first(const St&s,int bit,int a){if(a==DIRECT)return (goals(s)&(1u<<bit))?Plan{true,{},s.spent,s.stone,s.lele,s.held(F),s.held(L)&&!s.lele}:Plan{};Plan best;successors(s,a,true,[&](const St&q){Plan p=continuation(q,bit);if(!p.valid)return;p.steps.insert(p.steps.begin(),describe(a,s,q));if(better(p,best))best=move(p);});return best;}
int query(int argc,char**argv){string mode=argv[1];try{if((mode=="--post"&&argc!=5)||(mode=="--branch"&&argc!=7))throw runtime_error("usage: --post H BUDGET GOAL | --branch H BUDGET GOAL ACTION PRIZES");Counts h=parse_counts(argv[2],7);if(!h[V])throw runtime_error("V must be in hand class");int b=stoi(argv[3]);if(b<0||b>3)throw runtime_error("budget 0..3");int goal=lookup(argv[4],GN),bit=BIT(b,goal);if(mode=="--post"){U worlds=0,grouped=0;Table a=posttable(h,worlds,grouped);U best=0;for(int act=0;act<ACTS;++act)best=max(best,a[act][bit]);cout<<"goal="<<GN[goal]<<" budget="<<b<<" denominator="<<CH[52][6]<<"; first search uses no prize input\n";for(int act=0;act<ACTS;++act)cout<<AN[act]<<" "<<a[act][bit]<<" / "<<CH[52][6]<<" "<<(100.L*a[act][bit]/CH[52][6])<<"%"<<(best&&a[act][bit]==best?" BEST":"")<<"\n";if(!best)cout<<"No successful restricted route\n";return 0;}
int a=lookup(argv[5],AN);Counts p=parse_counts(argv[6],6);for(int c=0;c<N;++c)if(h[c]+p[c]>CAP[c])throw runtime_error("hand+Prize exceeds inventory for "+CN[c]);int k=prize_key(h,p);if(!(k&(1<<12))){cout<<"No two-VMAX Gate: fewer than two VMAX in deck\n";return 0;}St s=make_state(h,k);Plan plan=after_first(s,bit,a);if(!plan.valid){cout<<"No continuation to stated goal after this first action in inspected allocation\n";return 0;}cout<<"First-action resolution and continuation (known allocation only):\n";if(goal>=WG)cout<<"Ensure V is Benched before any Star Alchemy.\n";for(auto&step:plan.steps)cout<<step<<"\n";if(goal>=WG){cout<<"Pivot: ";if(plan.floatReady)cout<<"attach Float to Wobbuffet";if(plan.floatReady&&plan.latiasReady)cout<<" OR ";if(plan.latiasReady)cout<<"bench Latias (Skyliner)";cout<<"; retreat Wobbuffet to V before playing Radiant.\n";}if(goal==VF||goal==WF)cout<<"Manually attach Psychic to V.\n";cout<<"Play Radiant from hand; resolve Gate for two VMAX from deck.\n";cout<<"Star Alchemy spent="<<plan.stone<<" designated discards="<<plan.spent<<" Lele benched="<<plan.lele<<"\n";return 0;}catch(const exception&e){cerr<<e.what()<<"\n";return 2;}}

struct Aggregate{U hands=0,physical=0,parity=0,positiveParity=0,fundedParity=0,allParity=0,none=0;array<long double,16> vals{};long double chosenW=0;};
int main(int argc,char**argv){bool csv=false;int limit=0;for(int i=1;i<argc;++i){string v=argv[i];if(v=="--csv")csv=true;else if(v=="--limit"&&i+1<argc)limit=stoi(argv[++i]);}for(int n=0;n<=60;++n){CH[n][0]=1;for(int k=1;k<=n;++k)CH[n][k]=(n?CH[n-1][k-1]+CH[n-1][k]:0);}int total=0;for(int c:CAP)total+=c;assert(total==59);tests();if(argc>1&&(string(argv[1])=="--post"||string(argv[1])=="--branch"))return query(argc,argv);unordered_map<U,Vec> data;U worlds=0,grouped=0;int n=0;enumerate(CAP,7,[&](const Counts&h,U){if(!h[V]||(limit&&n>=limit))return;++n;data.emplace(handkey(h),post(h,worlds,grouped));if(memo.size()>2500000)memo.clear();if(n%500==0)cerr<<"post="<<n<<" groups="<<grouped<<" memo="<<memo.size()<<"\n";});if(limit){cerr<<"LIMIT post="<<n<<" grouped="<<grouped<<" worlds="<<worlds<<"\n";return 0;}
 U D=53*CH[52][6];array<Aggregate,4> agg{};array<U,5> gaps{};if(csv){cout<<"V,VM,Lele,Latias,Radiant,Arven,Float,FSS,Heavy,Fog,Ball,Psychic,Other,weight";for(int b=0;b<4;++b)for(auto goal:{"VG","VF","WG","WF"})cout<<",b"<<b<<"_"<<goal;cout<<"\n";}
 enumerate(CAP,6,[&](const Counts&h,U w){if(!h[V])return;Vec x{};for(int c=0;c<N;++c)if(h[c]<CAP[c]){Counts p=h;++p[c];const Vec&v=data.at(handkey(p));for(int i=0;i<16;++i)x[i]+=U(CAP[c]-h[c])*v[i];}bool parity=true,any=x[BIT(0,VG)]>0;for(int b=0;b<4;++b)parity&=x[BIT(b,VG)]==x[BIT(b,WG)]&&x[BIT(b,VF)]==x[BIT(b,WF)];bool fp=x[BIT(0,VF)]==x[BIT(0,WF)];int group=h[F]?1:h[L]?2:3;for(int i:{0,group}){auto &z=agg[i];++z.hands;z.physical+=w;z.parity+=w*(x[BIT(0,VG)]==x[BIT(0,WG)]);z.fundedParity+=w*fp;z.allParity+=w*parity;z.positiveParity+=w*(parity&&any);z.none+=w*!any;for(int b=0;b<16;++b)z.vals[b]+=(long double)w*x[b];z.chosenW+=(long double)w*(parity&&any);}
 U gap=x[BIT(0,VF)]-x[BIT(0,WF)];int gi=gap==0?0:gap*20<=D?1:gap*10<=D?2:gap*4<=D?3:4;gaps[gi]+=w;if(csv){for(int c=0;c<N;++c)cout<<h[c]<<',';cout<<w;for(U z:x)cout<<','<<z;cout<<'\n';}});
 assert(agg[0].physical==CH[59][6]-CH[55][6]);U legal=CH[60][7]-CH[46][7];cerr<<fixed<<setprecision(8);cerr<<"post="<<n<<" worlds="<<worlds<<" grouped="<<grouped<<" denominator="<<D<<" original_physical="<<agg[0].physical<<" legal_openings="<<legal<<" both_W_V_legal_pct="<<(100.L*agg[0].physical/legal)<<"\n";
 for(int i=0;i<4;++i){auto &z=agg[i];cerr<<"GROUP "<<i<<" hands="<<z.hands<<" weight="<<z.physical<<" share_pct="<<100.L*z.physical/agg[0].physical<<" gate_parity_pct="<<100.L*z.parity/z.physical<<" funded_parity_pct="<<100.L*z.fundedParity/z.physical<<" all_budget_parity_pct="<<100.L*z.allParity/z.physical<<" positive_all_parity_pct="<<100.L*z.positiveParity/z.physical<<" no_gate_pct="<<100.L*z.none/z.physical<<"\n";for(int b=0;b<4;++b){cerr<<" budget "<<b;for(int g=0;g<4;++g)cerr<<" "<<100.L*z.vals[BIT(b,g)]/((long double)z.physical*D);cerr<<"\n";}}
 cerr<<"GAP bins <=0,<=5%,<=10%,<=25%,>25%:";for(U z:gaps)cerr<<' '<<100.L*z/agg[0].physical;cerr<<"\n";
}
