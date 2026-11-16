import csv, json, os
from functools import lru_cache
D='/home/claude/data/'
rd=lambda f: list(csv.DictReader(open(D+f)))
forms={f['identifier']:f for f in rd('pokemon_forms.csv')}
pk={p['id']:p for p in rd('pokemon.csv')}
sp={s['id']:s for s in rd('pokemon_species.csv')}
sid_of={s['identifier']:s['id'] for s in sp.values()}
spname={r['pokemon_species_id']:r['name'] for r in rd('pokemon_species_names.csv') if r['local_language_id']=='9'}
dn=rd('pokemon_dex_numbers.csv')
ORDER=[];seen=set()
for dexid,letter in (('31','P'),('32','K'),('33','B')):
    for n,s in sorted((int(r['pokedex_number']),r['species_id']) for r in dn if r['pokedex_id']==dexid):
        if s not in seen: seen.add(s); ORDER.append((letter,n,s))
print('species',len(ORDER))
OVR={'wooper':'wooper-paldea','tauros':'tauros-paldea-combat-breed','minior':'minior-red','alcremie':'alcremie-vanilla-cream-berry-sweet'}
creams='vanilla-cream ruby-cream matcha-cream mint-cream lemon-cream salted-cream ruby-swirl caramel-swirl rainbow-swirl'.split()
sweets='berry clover flower love ribbon star strawberry'.split()
ALT={ # native forms, always shown, directly after base (+female)
 'maushold':['maushold-family-of-three'],'lycanroc':['lycanroc-midnight','lycanroc-dusk'],
 'oricorio':['oricorio-pom-pom','oricorio-pau','oricorio-sensu'],
 'squawkabilly':['squawkabilly-blue-plumage','squawkabilly-yellow-plumage','squawkabilly-white-plumage'],
 'basculin':['basculin-blue-striped','basculin-white-striped'],'dudunsparce':['dudunsparce-three-segment'],
 'deerling':['deerling-summer','deerling-autumn','deerling-winter'],'sawsbuck':['sawsbuck-summer','sawsbuck-autumn','sawsbuck-winter'],
 'toxtricity':['toxtricity-low-key'],'tauros':['tauros-paldea-blaze-breed','tauros-paldea-aqua-breed','tauros'],
 'wooper':['wooper','wooper-female'],
 'sinistea':['sinistea-antique'],'polteageist':['polteageist-antique'],'shellos':['shellos-east'],'gastrodon':['gastrodon-east'],
 'tatsugiri':['tatsugiri-droopy','tatsugiri-stretchy'],'gimmighoul':['gimmighoul-roaming'],
 'vivillon':['vivillon-'+x for x in 'icy-snow polar tundra continental garden elegant modern marine archipelago high-plains sandstorm river monsoon savanna sun ocean jungle fancy poke-ball'.split()],
 'rotom':['rotom-heat','rotom-wash','rotom-frost','rotom-fan','rotom-mow'],
 **{s:[s+'-'+c for c in ['yellow','orange','blue','white']] for s in ['flabebe','floette','florges']},
 'ursaluna':['ursaluna-bloodmoon'],'ogerpon':['ogerpon-wellspring-mask','ogerpon-hearthflame-mask','ogerpon-cornerstone-mask'],
 'poltchageist':['poltchageist-artisan'],'sinistcha':['sinistcha-masterpiece'],
 'minior':['minior-'+c for c in 'orange yellow green blue indigo violet'.split()],
 'alcremie':[f'alcremie-{c}-{s}-sweet' for c in creams for s in sweets][1:],
 # regional forms native to SV (Kitakami/Blueberry)
 'diglett':['diglett-alola'],'dugtrio':['dugtrio-alola'],'grimer':['grimer-alola'],'muk':['muk-alola'],
 'slowpoke':['slowpoke-galar'],'slowbro':['slowbro-galar'],'slowking':['slowking-galar'],
 'geodude':['geodude-alola'],'graveler':['graveler-alola'],'golem':['golem-alola'],
 'sandshrew':['sandshrew-alola'],'sandslash':['sandslash-alola'],'vulpix':['vulpix-alola'],'ninetales':['ninetales-alola'],
}
NATREG={'wooper','tauros','diglett-alola','dugtrio-alola','grimer-alola','muk-alola','slowpoke-galar','slowbro-galar','slowking-galar','geodude-alola','graveler-alola','golem-alola','sandshrew-alola','sandslash-alola','vulpix-alola','ninetales-alola','wooper-female'}
FEM=set('''houndoom kricketot kricketune combee buizel floatzel hypno pikachu raichu sudowoodo shinx luxio luxray starly staravia staraptor donphan gible gabite garchomp magikarp gyarados gulpin swalot numel camerupt meditite medicham croagunk toxicroak eevee girafarig pachirisu ursaring pyroar sneasel weavile murkrow cacturne scyther scizor heracross hippopotas hippowdon finneon lumineon snover abomasnow
quagsire politoed aipom ambipom piloswine mamoswine nuzleaf shiftry ludicolo gligar milotic
doduo dodrio rhyhorn rhydon rhyperior gloom vileplume venusaur meganium torchic combusken blaziken'''.split())
FEMFORM={'oinkologne':'oinkologne-female','indeedee':'indeedee-female','meowstic':'meowstic-female','basculegion':'basculegion-female'}
REG={'raichu':['raichu-alola'],'meowth':['meowth-alola','meowth-galar'],'persian':['persian-alola'],
 'lilligant':['lilligant-hisui'],'sliggoo':['sliggoo-hisui'],'goodra':['goodra-hisui'],'voltorb':['voltorb-hisui'],'electrode':['electrode-hisui'],
 'growlithe':['growlithe-hisui'],'arcanine':['arcanine-hisui'],'zorua':['zorua-hisui'],'zoroark':['zoroark-hisui'],'sneasel':['sneasel-hisui','sneasel-hisui-female'],
 'qwilfish':['qwilfish-hisui'],'avalugg':['avalugg-hisui'],'braviary':['braviary-hisui'],
 'exeggutor':['exeggutor-alola'],'weezing':['weezing-galar'],'typhlosion':['typhlosion-hisui'],'samurott':['samurott-hisui'],'decidueye':['decidueye-hisui']}
BAT={'mimikyu':['mimikyu-busted'],'palafin':['palafin-hero'],'eiscue':['eiscue-noice'],'morpeko':['morpeko-hangry'],
 'cramorant':['cramorant-gulping','cramorant-gorging'],'minior':['minior-red-meteor'],'terapagos':['terapagos-terastal','terapagos-stellar']}
EXTRA=[('articuno-galar','xreg'),('zapdos-galar','xreg'),('moltres-galar','xreg'),('meloetta-pirouette','xbat'),('zacian-crowned','xbat'),('zamazenta-crowned','xbat')]
LINES=[['scatterbug','spewpa','vivillon'],['flabebe','floette','florges']]
SHORT={'Paldea Combat Breed':'Combat','Paldea Blaze Breed':'Blaze','Paldea Aqua Breed':'Aqua','Poke Ball':'Poké Ball','Pom Pom':'Pom-Pom','Family Of Three':'Family of Three','Family Of Four':'Family of Four','Three Segment':'Three-Segment','Two Segment':'Two-Segment','Blue Striped':'Blue-Striped','White Striped':'White-Striped','Red Striped':'Red-Striped','Wellspring Mask':'Wellspring','Hearthflame Mask':'Hearthflame','Cornerstone Mask':'Cornerstone','Red Meteor':'Meteor','Full Belly':'Full Belly'}
@lru_cache(None)
def default_slug(sid):
    ident=sp[sid]['identifier']
    if ident in OVR: return OVR[ident]
    p=[x for x in pk.values() if x['species_id']==sid and x['is_default']=='1'][0]
    return [x for x in forms.values() if x['pokemon_id']==p['id'] and x['is_default']=='1'][0]['identifier']
sprites=set()
def entry(slug,num,kind):
    fem=slug.endswith('-female') and slug not in forms
    fslug=slug[:-7] if fem else slug
    f=forms[fslug]; pid=int(f['pokemon_id']); fi=f['form_identifier']
    path=f'sprites/pokemon/{pid}-{fi}.png' if (pid<10000 and fi and f['is_default']=='0') else f'sprites/pokemon/{pid}.png'
    if fem: path=path.replace('sprites/pokemon/','sprites/pokemon/female/')
    sid=pk[str(pid)]['species_id']
    label=fi.replace('-',' ').title() if fi and fi not in('male','female') and slug!=default_slug(sid) else ''
    if fslug.startswith('alcremie'): label=' '.join(x.title() for x in fi.replace('-sweet','').split('-'))  # e.g. Ruby Cream Berry
    sprites.add(path)
    g='♀' if (fem or fi=='female') else ('♂' if fi=='male' else '')
    return dict(id=slug,fs=fslug,n=num,nat=int(sid),name=spname[sid],form=SHORT.get(label,label),g=g,k=kind,s=path)
groups=[]
for letter,num,sid in ORDER:
    ident=sp[sid]['identifier']; tag=('' if letter=='P' else letter)+str(num)
    g=[entry(default_slug(sid),tag,'base')]
    if ident in FEM: g.append(entry(default_slug(sid)+'-female',tag,'fem'))
    if ident in FEMFORM: g.append(entry(FEMFORM[ident],tag,'fem'))
    for a in ALT.get(ident,[]): g.append(entry(a,tag,'nreg' if a in NATREG else ('fem' if a.endswith('-female') else 'form')))
    for a in REG.get(ident,[]): g.append(entry(a,tag,'reg'))
    for a in BAT.get(ident,[]): g.append(entry(a,tag,'bat'))
    # mark male counterpart
    for it in g:
        if it['g']=='♀':
            for o in g:
                if o['fs']==it['fs'] and o is not it and not o['g']: o['g']='♂'
                if it['fs'].endswith('-female') and o['fs']==it['fs'][:-7].replace('-female','')+'' and not o['g']: o['g']='♂'
    if ident in FEMFORM: g[0]['g']='♂'
    if any(i['k'] in('form','nreg') for i in g) and not g[0]['form']:
        fi=forms[g[0]['id']]['form_identifier']; g[0]['form']=SHORT.get(fi.replace('-',' ').title(),fi.replace('-',' ').title()) if fi else ('Kanto' if False else '')
    groups.append(dict(sp=ident,items=g))
for line in LINES:
    idx=[i for i,gr in enumerate(groups) if gr['sp'] in line]
    assert idx==list(range(idx[0],idx[0]+len(line))),idx
    groups[idx[0]:idx[-1]+1]=[dict(sp='+'.join(line),items=sum((groups[i]['items'] for i in idx),[]))]
for g in groups:
    for i in g['items']:
        if i['id'] in('wooper','wooper-female'): i['form']='Johto'
        if i['id']=='tauros': i['form']='Kanto'
        if i['id'].startswith('alcremie'): i['k']= i['k'] if i['k']=='base' else 'alc'
extra=[entry(s,None,k) for s,k in EXTRA]
for g in groups:
    for i in g['items']: i.pop('fs')
for i in extra: i.pop('fs')
json.dump(dict(groups=groups,extra=extra),open('/home/claude/build/layout.json','w'),ensure_ascii=False)
open('/home/claude/build/paths.txt','w').write('\n'.join(sorted(sprites)))
print(len(groups), sum(len(g['items']) for g in groups), len(sprites))
for g in groups:
  if len(g['items'])>1 and g['items'][0]['n'][0] in 'KB' or g['sp'] in('wooper','tauros','diglett','sneasel','meowstic','raichu'):
    print(' | '.join(f"{i['n']} {i['name']} {i['form']} {i['g']} [{i['k']}]" for i in g['items'][:8]))
