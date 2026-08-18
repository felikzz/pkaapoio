import json, re, openpyxl

SRC = "/mnt/user-uploads/Pokedex_Pública_PokeAlliance_By_Mts_Vitor.xlsx"
wb = openpyxl.load_workbook(SRC, data_only=True)

def rows(name):
    ws = wb[name]
    out = []
    for r in ws.iter_rows(values_only=True):
        vals = [("" if c is None else str(c).strip()) for c in r]
        if any(v for v in vals):
            out.append(vals)
    return out

def num(v):
    try:
        f = float(v)
        return int(f) if f == int(f) else f
    except Exception:
        return None

data = {}

# ---------- Drops ----------
drops = []
for r in rows("Drops")[1:]:
    poke = r[0]
    if not poke:
        continue
    items = [x.lower() for x in r[1:] if x]
    if items:
        drops.append({"pokemon": poke, "items": items})
data["drops"] = drops

# ---------- Localizações ----------
loc_rows = rows("Localizações")
headers = loc_rows[0]
areas = [h for h in headers[1:] if h and not h.startswith("Como usar")]
locations = []
for r in loc_rows[1:]:
    poke = r[0]
    if not poke:
        continue
    entries = []
    for i, a in enumerate(areas):
        v = r[i + 1] if i + 1 < len(r) else ""
        if v and v != "-":
            entries.append({"area": a, "link": v if v.startswith("http") else None, "note": None if v.startswith("http") else v})
    if entries:
        locations.append({"pokemon": poke, "entries": entries})
data["locations"] = locations

# ---------- Tasks ----------
tasks = []
for r in rows("Tasks")[1:]:
    poke = r[0]
    if not poke:
        continue
    npcs = []
    if r[1]:
        npcs.append({"npc": r[1], "link": r[2] or None})
    if len(r) > 3 and r[3]:
        npcs.append({"npc": r[3], "link": (r[4] if len(r) > 4 else "") or None})
    if npcs:
        tasks.append({"pokemon": poke, "npcs": npcs})
data["tasks"] = tasks

# ---------- Linked Tasks ----------
linked = []
for r in rows("Linked Tasks")[1:]:
    if not r[1]:
        continue
    linked.append({
        "qtd": num(r[0]),
        "pokemon": r[1],
        "tipo": r[2] or None,
        "hunt": r[3] or None,
        "killsPerHour": r[4] or None,
    })
data["linkedTasks"] = linked

# ---------- Hazard Tasks ----------
data["hazardTasks"] = [
    {"npc": r[0], "link": r[1] or None, "task": r[2] or None}
    for r in rows("Hazard Tasks")[1:] if r[0]
]

# ---------- Tier List ----------
tiers = []
seen = set()
for r in rows("Tier List")[1:]:
    poke, tier = r[0], r[1]
    if not poke or not tier or poke in seen:
        continue
    seen.add(poke)
    tiers.append({"pokemon": poke, "tier": tier, "moveset": r[2] or None})
data["tiers"] = tiers

# ---------- Medals ----------
medals = []
for r in rows("Medals")[1:]:
    if r[0] and r[1]:
        medals.append({"pokemon": r[0], "buff": r[1], "debuff": r[2] or None})
data["medals"] = medals

# ---------- PokeTalents ----------
talents = []
for r in rows("PokeTalents")[1:]:
    if not r[0]:
        continue
    talents.append({
        "name": r[0],
        "source": r[1] or None,
        "quantity": num(r[3]),
        "category": r[4] or None,
        "slot": r[6] or None,
        "buff": r[7] or None,
    })
data["talents"] = talents

# ---------- Dungeons ----------
dgs = {}
for r in rows("Dungeons")[1:]:
    if not r[0]:
        continue
    dgs[r[0]] = {"name": r[0], "location": r[1] or None,
                 "hunts": [x for x in r[2:5] if x], "city": None,
                 "mobs": None, "items": [], "players": None, "xp": None,
                 "time": None, "xpPerHour": None}
for r in rows("DGs")[1:]:
    if r[0] and r[0] in dgs:
        dgs[r[0]]["city"] = r[1] or None
# DgMobs / DgItems keyed by first hunt pokemon
mobinfo = {}
for r in rows("DgMobs")[1:]:
    if not r[0]:
        continue
    mobinfo[r[0].lower()] = {
        "players": num(r[1]), "mobs": num(r[2]), "xp": num(r[3]),
        "time": r[4] or None, "mobList": [x for x in r[5:10] if x],
        "xpPerHour": num(r[10]) if len(r) > 10 else None,
    }
iteminfo = {}
for r in rows("DgItems")[1:]:
    if not r[0]:
        continue
    iteminfo[r[0].lower()] = [x.lower() for x in r[2:] if x]

for d in dgs.values():
    keys = [d["name"].lower()] + [h.lower() for h in d["hunts"]]
    for k in keys:
        if k in mobinfo:
            m = mobinfo[k]
            d.update({"players": m["players"], "mobs": m["mobs"], "xp": m["xp"],
                      "time": m["time"], "xpPerHour": m["xpPerHour"]})
            d["mobList"] = m["mobList"]
            break
    for k in keys:
        if k in iteminfo:
            d["items"] = iteminfo[k]
            break
data["dungeons"] = list(dgs.values())

# standalone dungeon runs (DgMobs entries without a Dungeons row)
runs = []
for k, m in mobinfo.items():
    runs.append({"key": k, **m, "items": iteminfo.get(k, [])})
data["dungeonRuns"] = runs

# ---------- Boost ----------
boost = []
for r in rows("Boost"):
    if not r[0]:
        continue
    boost.append({"type": r[0], "fragment": r[1] or None, "stone": r[2] or None,
                  "items": [x.lower() for x in r[3:] if x]})
data["boost"] = boost

# ---------- Star ----------
sl_rows = rows("Star Level")
star_levels = []
for r in sl_rows[2:]:
    if not r[0]:
        continue
    steps = []
    for i in range(5):
        dd, kk = num(r[1 + i * 2]), num(r[2 + i * 2])
        if dd is not None:
            steps.append({"from": i, "to": i + 1, "dd": dd, "kk": kk})
    star_levels.append({"tier": r[0], "steps": steps})
data["starLevels"] = star_levels
ws = wb["Star"]
data["starNote"] = ws["A4"].value or ""

# ---------- Brokes ----------
brokes = []
bnote = ""
for r in rows("Brokes"):
    if r[0] and r[1]:
        brokes.append({"tier": r[0], "maxBroke": r[1]})
    if len(r) > 3 and r[3].startswith("OBS"):
        bnote = r[3]
data["brokes"] = brokes
data["brokesNote"] = bnote

# ---------- GYM ----------
data["gyms"] = [{"city": r[0], "task1": r[1] or None, "task2": r[2] or None, "dungeon": r[3] or None}
                for r in rows("GYM")[1:] if r[0]]
gnote = rows("GYM")[0]
data["gymNote"] = next((c for c in gnote if c.startswith("Informações")), "")

# ---------- Damage ----------
dmg_rows = rows("Damage")
dmg_head = [h for h in dmg_rows[0][1:8]]
data["damage"] = {"tiers": dmg_head,
                  "roles": [{"role": r[0], "values": r[1:8]} for r in dmg_rows[1:] if r[0]]}

# ---------- Runes ----------
rr = rows("Runes")
stats = []
h0 = rr[0]
for i in range(1, len(h0), 2):
    if h0[i]:
        stats.append((h0[i], i))
runes = []
for stat, i in stats:
    lv = []
    for r in rr[2:]:
        if r[0] and len(r) > i + 1 and r[i]:
            lv.append({"level": r[0], "points": num(r[i]), "bonus": r[i + 1]})
    if lv:
        runes.append({"stat": stat, "levels": lv})
data["runes"] = runes

# ---------- NPC teams (Rocket / Police) ----------
def teams(sheet):
    ws = wb[sheet]
    grid = [[("" if c is None else str(c).strip()) for c in r] for r in ws.iter_rows(values_only=True)]
    out = []
    for ri, row in enumerate(grid):
        for ci in range(0, min(len(row), 11), 3):
            name = row[ci]
            if name and name.isupper() and len(name) > 2:
                members = []
                for k in range(1, 12):
                    if ri + k >= len(grid):
                        break
                    r2 = grid[ri + k]
                    a = r2[ci] if ci < len(r2) else ""
                    b = r2[ci + 1] if ci + 1 < len(r2) else ""
                    if not a:
                        break
                    members.append({"npcPokemon": a, "counter": b})
                if members:
                    out.append({"npc": name, "members": members})
    return out
data["rocket"] = teams("Rocket")
data["police"] = teams("Police")
data["npcTeamNote"] = "Pokémons da esquerda são os do NPC. Os da direita são sugestões de counter."

# ---------- Shiny Rate ----------
sr = rows("Shiny Rate")
sr_blocks = []
head_ver = sr[0]
for i in range(0, len(head_ver), 2):
    ver = head_ver[i]
    if not ver:
        continue
    vals = []
    for r in sr[2:]:
        if len(r) > i + 1 and r[i]:
            vals.append({"tier": r[i], "rate": r[i + 1]})
    if vals:
        sr_blocks.append({"version": ver, "rates": vals})
data["shinyRates"] = sr_blocks

# ---------- FAQ / Guides ----------
faq = []
for r in rows("FAQ"):
    if r[0] and r[1]:
        faq.append({"key": r[0], "content": r[1]})
data["faq"] = faq

# ---------- Porygon guide ----------
data["porygon"] = [{"step": r[0], "content": r[1]} for r in rows("Porygon") if r[0] and len(r) > 1 and r[1]]

# ---------- BH ----------
data["bh"] = [c for r in rows("BH") for c in r if c]

with open("src/data/pka.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)

for k, v in data.items():
    print(k, len(v) if hasattr(v, "__len__") else v)
