import { useState } from "react";
import "./styles.css";

export default function App() {
  const [level, setLevel] = useState(1);

  const natures = ["Fire", "Water", "Wind", "Earth", "Lightning"];
  const [natureAffinity, setNatureAffinity] = useState([]);

  const [jutsuCount, setJutsuCount] = useState(1);
  const addJutsu = () => setJutsuCount((n) => n + 1);
  const jutsuCategories = ["Genjutsu", "Ninjutsu", "Taijutsu", "Bukijutsu"];

  const toggleNature = (n) => {
    setNatureAffinity((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  };

  // Ability scores + modifiers
  const [abilities, setAbilities] = useState({
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  });
  const [modifiers, setModifiers] = useState({
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,
  });

  const handleAbilityChange = (ability, value) => {
    const intValue = parseInt(value) || 0;
    setAbilities((prev) => ({ ...prev, [ability]: intValue }));
    setModifiers((prev) => ({
      ...prev,
      [ability]: Math.floor((intValue - 10) / 2),
    }));
  };

  // Proficiency bonus (corrigido: compara usando o level clampado)
  const pbFromLevel = (lvl) => {
    const level = Math.max(1, Math.min(20, lvl));
    if (level >= 19) return 9;
    if (level >= 16) return 8;
    if (level >= 13) return 7;
    if (level >= 10) return 6;
    if (level >= 7) return 5;
    if (level >= 4) return 4;
    return 3;
  };
  const proficiencyBonus = pbFromLevel(level);

  const profLevels = {
    none: 0,
    half: 0.5,
    proficient: 1,
    expertise: 2,
  };

  // Death saves
  const [deathSaves, setDeathSaves] = useState({
    success: [false, false, false],
    failure: [false, false, false],
  });
  const toggleDeathSave = (type, idx) => {
    setDeathSaves((prev) => {
      const next = [...prev[type]];
      next[idx] = !next[idx];
      return { ...prev, [type]: next };
    });
  };

  // Features
  const featureSets = [
    { key: "class", label: "Class Features" },
    { key: "clan", label: "Clan Features" },
    { key: "subclass", label: "Subclass Features" },
    { key: "feats", label: "Feats" },
  ];
  const [featureCount, setFeatureCount] = useState({
    class: 1,
    clan: 1,
    subclass: 1,
    feats: 1,
  });
  const addFeature = (key) => {
    setFeatureCount((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  // Skills + Saving Throws (reusando estrutura)
  const [skills, setSkills] = useState({
    // Saves
    saveStr: "none",
    saveDex: "none",
    saveCon: "none",
    saveInt: "none",
    saveWis: "none",
    saveCha: "none",

    // Skills
    acrobatics: "none",
    animal_handling: "none",
    athletics: "none",
    crafting: "none",
    deception: "none",
    history: "none",
    illusion: "none",
    insight: "none",
    intimidation: "none",
    investigation: "none",
    martial_arts: "none",
    medicine: "none",
    nature: "none",
    ninshou: "none",
    perception: "none",
    performance: "none",
    persuasion: "none",
    sleight_of_hand: "none",
    stealth: "none",
    survival: "none",
  });

  const handleSkillChange = (skill, level) => {
    setSkills((prev) => ({ ...prev, [skill]: level }));
  };

  const fmt = (n) => (n >= 0 ? `+${n}` : `${n}`);
  const getSkillBonus = (abilityKey, profLevel) => {
    const base = modifiers[abilityKey] ?? 0;
    const mult = profLevels[profLevel] ?? 0;
    const profPart =
      mult === 0.5
        ? Math.floor(proficiencyBonus * 0.5)
        : Math.floor(proficiencyBonus * mult);
    return base + profPart;
  };

  return (
    <main className="sheet">
      {/* HEADER */}
      <header>
        <h1>Character Sheet</h1>
      </header>

      {/* IDENTITY */}
      <section className="section span-2 identity-card" aria-labelledby="identity-title">
  <h2 id="identity-title" className="hide">Identity</h2>

  <div className="identity-header">
    {/* Nome à esquerda */}
    <section className="charname">
      <label htmlFor="charName">Character Name</label>
      <input id="charName" name="charName" type="text" placeholder="Kaname Takeshima" />
    </section>

    {/* “Misc” à direita – 3 colunas */}
    <section className="misc">
      <ul>
        <li>
          <label htmlFor="className">Class & Level</label>
          <input id="className" name="className" type="text" placeholder="Genin" />
        </li>
        <li>
          <label htmlFor="playerName">Player Name</label>
          <input id="playerName" name="playerName" type="text" placeholder="Your name" />
        </li>
        <li>
          <label htmlFor="level">Level</label>
          <input
            id="level" name="level" type="number" min={1} max={20} value={level}
            onChange={(e)=>{ const v=parseInt(e.target.value)||1; setLevel(Math.max(1,Math.min(20,v))); }}
          />
        </li>

        <li>
          <label htmlFor="clan">Clan</label>
          <input id="clan" name="clan" type="text" placeholder="Uchiha" />
        </li>
        <li>
          <label htmlFor="village">Village</label>
          <input id="village" name="village" type="text" placeholder="Iwagakure" />
        </li>
        <li>
          <label htmlFor="rank">Rank</label>
          <input id="rank" name="rank" type="text" placeholder="Genin" />
        </li>

        <li>
          <label htmlFor="profBonusAuto">Proficiency Bonus</label>
          <input id="profBonusAuto" type="text" readOnly value={proficiencyBonus >= 0 ? `+${proficiencyBonus}` : `${proficiencyBonus}`} />
        </li>
        <li>
          <label>Nature Affinity</label>
          <div>
            {natures.map((n)=>(
              <label key={n} style={{marginRight:8}}>
                <input type="checkbox" checked={natureAffinity.includes(n)} onChange={()=>toggleNature(n)} style={{marginRight:6}}/>
                {n}
              </label>
            ))}
          </div>
        </li>
      </ul>
    </section>
  </div>
</section>
              
{/* COMBAT */}
<section aria-labelledby="combat-title" className="section col-mid">
  <h2 id="combat-title">Combat</h2>
  <form className="combat-grid">
    <div className="kpi ac">
      <label htmlFor="ac">Armor Class</label>
      <input id="ac" name="ac" type="text" placeholder="10" />
    </div>

    <div className="kpi init">
      <label htmlFor="initiative">Initiative</label>
      <input id="initiative" name="initiative" type="text" placeholder="+0" />
    </div>

    <div className="kpi spd">
      <label htmlFor="speed">Speed</label>
      <input id="speed" name="speed" type="text" placeholder="30 ft" />
    </div>

    <div className="hp-max">
      <span>Hit Point Maximum</span>
      <input id="hpMax" name="hpMax" type="text" placeholder="—" />
    </div>

    <div className="hp-max">
      <span>Chakra Point Maximum</span>
      <input id="chakraMax" name="chakraMax" type="text" placeholder="—" />
    </div>

    <div className="hp-current">
      <label htmlFor="hpCurrent">Current Hit Points</label>
      <input id="hpCurrent" name="hpCurrent" type="text" placeholder="—" />
    </div>

    <div className="hp-temp">
      <label htmlFor="chakraCurrent">Temporary Hit Points</label>
      <input id="chakraCurrent" name="chakraCurrent" type="text" placeholder="—" />
    </div>

    <div className="dice hit">
      <span>Total</span>
      <input id="hitDie" name="hitDie" type="text" placeholder="2d10" />
      <label>Hit Dice</label>
    </div>

    <div className="dice chakra">
      <span>Total</span>
      <input id="chakraDie" name="chakraDie" type="text" placeholder="2d8" />
      <label>Chakra Dice</label>
    </div>
  </form>
</section>

      {/* DEATH SAVES – seção própria com estilo de bolinhas */}
      <section aria-labelledby="death-saves-title" className="section">
        <h2 id="death-saves-title">Death Saves</h2>

        <div className="ds-row">
          {/* Successes */}
          <div className="ds-group success">
            <div className="ds-group-title">Successes</div>
            <div className="ds-dots">
              {deathSaves.success.map((v, i) => (
                <input
                  key={`ds-s-${i}`}
                  type="checkbox"
                  className="ds-dot"
                  checked={v}
                  onChange={() => toggleDeathSave("success", i)}
                  aria-label={`Death Save Success ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Failures */}
          <div className="ds-group failure">
            <div className="ds-group-title">Failures</div>
            <div className="ds-dots">
              {deathSaves.failure.map((v, i) => (
                <input
                  key={`ds-f-${i}`}
                  type="checkbox"
                  className="ds-dot"
                  checked={v}
                  onChange={() => toggleDeathSave("failure", i)}
                  aria-label={`Death Save Failure ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABILITY SCORES */}
      <section aria-labelledby="abilities-title" className="section">
        <h2 id="abilities-title">Ability Scores</h2>
        <div>
          <fieldset>
            <legend>Strength (STR)</legend>
            <label htmlFor="strScore">Score</label>
            <input
              id="strScore"
              name="strScore"
              type="number"
              value={abilities.str}
              onChange={(e) => handleAbilityChange("str", e.target.value)}
            />
            <label htmlFor="strMod">Modifier</label>
            <input
              id="strMod"
              name="strMod"
              type="text"
              value={fmt(modifiers.str)}
              readOnly
              className="total"
            />
          </fieldset>

          <fieldset>
            <legend>Dexterity (DEX)</legend>
            <label htmlFor="dexScore">Score</label>
            <input
              id="dexScore"
              name="dexScore"
              type="number"
              value={abilities.dex}
              onChange={(e) => handleAbilityChange("dex", e.target.value)}
            />
            <label htmlFor="dexMod">Modifier</label>
            <input
              id="dexMod"
              name="dexMod"
              type="text"
              value={fmt(modifiers.dex)}
              readOnly
              className="total"
            />
          </fieldset>

          <fieldset>
            <legend>Constitution (CON)</legend>
            <label htmlFor="conScore">Score</label>
            <input
              id="conScore"
              name="conScore"
              type="number"
              value={abilities.con}
              onChange={(e) => handleAbilityChange("con", e.target.value)}
            />
            <label htmlFor="conMod">Modifier</label>
            <input
              id="conMod"
              name="conMod"
              type="text"
              value={fmt(modifiers.con)}
              readOnly
              className="total"
            />
          </fieldset>

          <fieldset>
            <legend>Intelligence (INT)</legend>
            <label htmlFor="intScore">Score</label>
            <input
              id="intScore"
              name="intScore"
              type="number"
              value={abilities.int}
              onChange={(e) => handleAbilityChange("int", e.target.value)}
            />
            <label htmlFor="intMod">Modifier</label>
            <input
              id="intMod"
              name="intMod"
              type="text"
              value={fmt(modifiers.int)}
              readOnly
              className="total"
            />
          </fieldset>

          <fieldset>
            <legend>Wisdom (WIS)</legend>
            <label htmlFor="wisScore">Score</label>
            <input
              id="wisScore"
              name="wisScore"
              type="number"
              value={abilities.wis}
              onChange={(e) => handleAbilityChange("wis", e.target.value)}
            />
            <label htmlFor="wisMod">Modifier</label>
            <input
              id="wisMod"
              name="wisMod"
              type="text"
              value={fmt(modifiers.wis)}
              readOnly
              className="total"
            />
          </fieldset>

          <fieldset>
            <legend>Charisma (CHA)</legend>
            <label htmlFor="chaScore">Score</label>
            <input
              id="chaScore"
              name="chaScore"
              type="number"
              value={abilities.cha}
              onChange={(e) => handleAbilityChange("cha", e.target.value)}
            />
            <label htmlFor="chaMod">Modifier</label>
            <input
              id="chaMod"
              name="chaMod"
              type="text"
              value={fmt(modifiers.cha)}
              readOnly
              className="total"
            />
          </fieldset>
        </div>
      </section>

      {/* SAVING THROWS */}
      <section aria-labelledby="savingThrows-title" className="section">
        <h2 id="savingThrows-title">Saving Throws</h2>
        <ul className="list-reset">
          {[
            ["Strength (STR)", "str", "saveStr"],
            ["Dexterity (DEX)", "dex", "saveDex"],
            ["Constitution (CON)", "con", "saveCon"],
            ["Intelligence (INT)", "int", "saveInt"],
            ["Wisdom (WIS)", "wis", "saveWis"],
            ["Charisma (CHA)", "cha", "saveCha"],
          ].map(([label, abilityKey, saveKey]) => (
            <li key={saveKey} className="save-row">
              <div className="row">
                <label htmlFor={saveKey}>{label}</label>
                <input
                  id={saveKey}
                  type="text"
                  readOnly
                  value={fmt(getSkillBonus(abilityKey, skills[saveKey]))}
                  className="total"
                />
              </div>
              <div style={{ marginTop: 6 }}>
                <select
                  value={skills[saveKey]}
                  onChange={(e) => handleSkillChange(saveKey, e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="half">Half Proficient</option>
                  <option value="proficient">Proficient</option>
                  <option value="expertise">Expertise</option>
                </select>
                <small style={{ marginLeft: 8 }}>
                  PB = {proficiencyBonus} | {abilityKey.toUpperCase()} mod ={" "}
                  {fmt(modifiers[abilityKey] ?? 0)}
                </small>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* SKILLS */}
      <section aria-labelledby="skills-title" className="section">
        <h2 id="skills-title">Skills</h2>
        <ul className="list-reset">
          {[
            ["Acrobatics (DEX)", "dex", "acrobatics"],
            ["Animal Handling (WIS)", "wis", "animal_handling"],
            ["Athletics (STR)", "str", "athletics"],
            ["Crafting (INT)", "int", "crafting"],
            ["Deception (CHA)", "cha", "deception"],
            ["History (INT)", "int", "history"],
            ["Illusion (WIS)", "wis", "illusion"],
            ["Insight (WIS)", "wis", "insight"],
            ["Intimidation (CHA)", "cha", "intimidation"],
            ["Investigation (INT)", "int", "investigation"],
            ["Martial Arts (STR)", "str", "martial_arts"],
            ["Medicine (WIS)", "wis", "medicine"],
            ["Nature (INT)", "int", "nature"],
            ["Ninshou (INT)", "int", "ninshou"],
            ["Perception (WIS)", "wis", "perception"],
            ["Performance (CHA)", "cha", "performance"],
            ["Persuasion (CHA)", "cha", "persuasion"],
            ["Sleight of Hand (DEX)", "dex", "sleight_of_hand"],
            ["Stealth (DEX)", "dex", "stealth"],
            ["Survival (WIS)", "wis", "survival"],
          ].map(([label, abilityKey, skillKey]) => (
            <li key={skillKey} className="skill-row">
              <div className="row">
                <label htmlFor={skillKey}>{label}</label>
                <input
                  id={skillKey}
                  type="text"
                  readOnly
                  value={fmt(getSkillBonus(abilityKey, skills[skillKey]))}
                  className="total"
                />
              </div>
              <div style={{ marginTop: 6 }}>
                <select
                  value={skills[skillKey]}
                  onChange={(e) => handleSkillChange(skillKey, e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="half">Half Proficient</option>
                  <option value="proficient">Proficient</option>
                  <option value="expertise">Expertise</option>
                </select>
                <small style={{ marginLeft: 8 }}>
                  PB = {proficiencyBonus} | {abilityKey.toUpperCase()} mod ={" "}
                  {fmt(modifiers[abilityKey] ?? 0)}
                </small>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* FEATURES */}
      <section aria-labelledby="features-title" className="section span-2">
        <h2 id="features-title">Features</h2>

        {featureSets.map((grp) => (
          <details key={grp.key} style={{ marginBottom: 16 }}>
            <summary style={{ fontWeight: 600 }}>{grp.label}</summary>

            <ol style={{ paddingLeft: 18, marginTop: 8 }}>
              {Array.from({ length: featureCount[grp.key] }).map((_, idx) => (
                <li key={`${grp.key}_${idx}`} style={{ marginBottom: 14 }}>
                  <label htmlFor={`${grp.key}_name_${idx}`}>Name</label>
                  <input
                    id={`${grp.key}_name_${idx}`}
                    type="text"
                    placeholder="Feature name"
                  />

                  <label htmlFor={`${grp.key}_level_${idx}`}>Level (optional)</label>
                  <input id={`${grp.key}_level_${idx}`} type="number" min={1} placeholder="1" />

                  <label htmlFor={`${grp.key}_notes_${idx}`}>Notes / Description</label>
                  <textarea
                    id={`${grp.key}_notes_${idx}`}
                    placeholder="Describe the effect, uses, restrictions..."
                  />
                </li>
              ))}
            </ol>

            <button type="button" onClick={() => addFeature(grp.key)}>
              + Add {grp.label.slice(0, -1)}
            </button>
          </details>
        ))}
      </section>

      {/* OFFENSE */}
      <section aria-labelledby="offense-title" className="section">
        <h2 id="offense-title">Weapons</h2>
        <table>
          <thead>
            <tr>
              <th>Weapon</th>
              <th>Attack Bonus</th>
              <th>Damage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input type="text" placeholder="Kunai" />
              </td>
              <td>
                <input type="text" placeholder="+0" />
              </td>
              <td>
                <input type="text" placeholder="1d4 piercing" />
              </td>
            </tr>
            <tr>
              <td>
                <input type="text" placeholder="Shuriken" />
              </td>
              <td>
                <input type="text" placeholder="+0" />
              </td>
              <td>
                <input type="text" placeholder="1d4 piercing" />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* JUTSU */}
      <section aria-labelledby="jutsu-title" className="section span-2">
        <h2 id="jutsu-title">Jutsu</h2>
        <details open>
          <summary>Known Jutsu</summary>
          <ol style={{ paddingLeft: 18 }}>
            {Array.from({ length: jutsuCount }).map((_, idx) => (
              <li key={idx} style={{ marginBottom: 16 }}>
                <label htmlFor={`jutsuName_${idx}`}>Name</label>
                <input
                  id={`jutsuName_${idx}`}
                  type="text"
                  placeholder="Fire Style: Fireball Jutsu"
                />

                <label htmlFor={`jutsuRank_${idx}`}>Rank</label>
                <input id={`jutsuRank_${idx}`} type="text" placeholder="C" />

                <label htmlFor={`jutsuCategory_${idx}`}>Category</label>
                <select id={`jutsuCategory_${idx}`} defaultValue="">
                  <option value="" disabled>
                    Select a Type
                  </option>
                  {jutsuCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <label htmlFor={`jutsuKeywords_${idx}`}>Keywords</label>
                <input id={`jutsuKeywords_${idx}`} type="text" placeholder="-" />

                <label htmlFor={`jutsuCost_${idx}`}>Cost</label>
                <input id={`jutsuCost_${idx}`} type="text" placeholder="-" />

                <label htmlFor={`jutsuDesc_${idx}`}>Description</label>
                <textarea id={`jutsuDesc_${idx}`} placeholder="..." />
              </li>
            ))}
          </ol>
          <button type="button" onClick={addJutsu}>
            + Add Jutsu
          </button>
        </details>
      </section>

      {/* STORY / TRAITS */}
      <section aria-labelledby="fluff-title" className="section">
        <h2 id="fluff-title">Story & Traits</h2>
        <div>
          <label>Personality</label>
          <textarea placeholder="..." />
        </div>
        <div>
          <label>Ideals</label>
          <textarea placeholder="..." />
        </div>
        <div>
          <label>Bonds</label>
          <textarea placeholder="..." />
        </div>
        <div>
          <label>Flaws</label>
          <textarea placeholder="..." />
        </div>
        <div>
          <label>Backstory</label>
          <textarea placeholder="..." />
        </div>
      </section>

      <footer>
        <small>v0 – HTML skeleton only. Styling and logic will come later.</small>
      </footer>
    </main>
  );
}
