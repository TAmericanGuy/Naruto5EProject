import { useMemo, useState } from "react";
import "./styles.css";

const abilityList = [
  { name: "Strength", key: "str", scoreId: "Strengthscore" },
  { name: "Dexterity", key: "dex", scoreId: "Dexterityscore" },
  { name: "Constitution", key: "con", scoreId: "Constitutionscore" },
  { name: "Wisdom", key: "wis", scoreId: "Wisdomscore" },
  { name: "Intelligence", key: "int", scoreId: "Intelligencescore" },
  { name: "Charisma", key: "cha", scoreId: "Charismascore" },
];

const skillList = [
  { name: "Acrobatics", key: "acrobatics", ability: "dex", abilityLabel: "Dex" },
  { name: "Animal Handling", key: "animal-handling", ability: "wis", abilityLabel: "Wis" },
  { name: "Arcana", key: "arcana", ability: "int", abilityLabel: "Int" },
  { name: "Athletics", key: "athletics", ability: "str", abilityLabel: "Str" },
  { name: "Chakra Control", key: "chakra-control", ability: "wis", abilityLabel: "Wis" },
  { name: "Deception", key: "deception", ability: "cha", abilityLabel: "Cha" },
  { name: "History", key: "history", ability: "int", abilityLabel: "Int" },
  { name: "Insight", key: "insight", ability: "wis", abilityLabel: "Wis" },
  { name: "Intimidation", key: "intimidation", ability: "cha", abilityLabel: "Cha" },
  { name: "Investigation", key: "investigation", ability: "int", abilityLabel: "Int" },
  { name: "Medicine", key: "medicine", ability: "wis", abilityLabel: "Wis" },
  { name: "Nature", key: "nature", ability: "int", abilityLabel: "Int" },
  { name: "Perception", key: "perception", ability: "wis", abilityLabel: "Wis" },
  { name: "Performance", key: "performance", ability: "cha", abilityLabel: "Cha" },
  { name: "Persuasion", key: "persuasion", ability: "cha", abilityLabel: "Cha" },
  { name: "Religion", key: "religion", ability: "int", abilityLabel: "Int" },
  { name: "Sleight of Hand", key: "sleight-of-hand", ability: "dex", abilityLabel: "Dex" },
  { name: "Stealth", key: "stealth", ability: "dex", abilityLabel: "Dex" },
  { name: "Survival", key: "survival", ability: "wis", abilityLabel: "Wis" },
];

const savingThrows = abilityList.map((ability) => ({
  key: ability.key,
  label: ability.name,
  id: `${slugify(ability.name)}-save`,
}));

const moneyTypes = ["cp", "sp", "ep", "gp", "pp"];
const natureOptions = ["Fire", "Wind", "Lightning", "Earth", "Water", "Medical"];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function fmt(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "+0";
  }
  return numeric >= 0 ? `+${numeric}` : `${numeric}`;
}

function pbFromLevel(rawLevel) {
  const level = Math.max(1, Math.min(20, rawLevel));
  if (level >= 19) return 9;
  if (level >= 16) return 8;
  if (level >= 13) return 7;
  if (level >= 10) return 6;
  if (level >= 7) return 5;
  if (level >= 4) return 4;
  return 3;
}

function computeModifier(score) {
  const parsed = parseInt(score, 10);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return Math.floor((parsed - 10) / 2);
}

function clampLevel(value) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return 1;
  }
  return Math.max(1, Math.min(20, parsed));
}

function getGaugeFill(current, max) {
  const currentValue = Number(current);
  const maxValue = Number(max);
  if (!Number.isFinite(currentValue) || !Number.isFinite(maxValue) || maxValue <= 0) {
    return 0;
  }
  const ratio = currentValue / maxValue;
  return Math.max(0, Math.min(1, ratio));
}

export default function App() {
  const [levelInput, setLevelInput] = useState("1");
  const level = clampLevel(levelInput);
  const proficiencyBonus = pbFromLevel(level);

  const [abilitiesState, setAbilitiesState] = useState(() =>
    abilityList.reduce(
      (acc, ability) => ({
        ...acc,
        [ability.key]: "10",
      }),
      {}
    )
  );

  const abilityModifiers = useMemo(
    () =>
      abilityList.reduce(
        (acc, ability) => ({
          ...acc,
          [ability.key]: computeModifier(abilitiesState[ability.key]),
        }),
        {}
      ),
    [abilitiesState]
  );

  const [savingThrowProficiencies, setSavingThrowProficiencies] = useState(() =>
    abilityList.reduce(
      (acc, ability) => ({
        ...acc,
        [ability.key]: false,
      }),
      {}
    )
  );

  const [skillProficiencies, setSkillProficiencies] = useState(() =>
    skillList.reduce(
      (acc, skill) => ({
        ...acc,
        [skill.key]: false,
      }),
      {}
    )
  );

  const [natureAffinity, setNatureAffinity] = useState([]);
  const [hitPoints, setHitPoints] = useState({ max: "", current: "", temp: "" });
  const [chakraPoints, setChakraPoints] = useState({ max: "", current: "", temp: "" });

  const handleAbilityChange = (key) => (event) => {
    const { value } = event.target;
    setAbilitiesState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleSavingThrow = (key) => {
    setSavingThrowProficiencies((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleSkill = (key) => {
    setSkillProficiencies((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleNature = (value) => {
    setNatureAffinity((prev) =>
      prev.includes(value) ? prev.filter((option) => option !== value) : [...prev, value]
    );
  };

  const getSavingThrowValue = (key) => {
    const modifier = abilityModifiers[key] ?? 0;
    return modifier + (savingThrowProficiencies[key] ? proficiencyBonus : 0);
  };

  const getSkillValue = (skill) => {
    const modifier = abilityModifiers[skill.ability] ?? 0;
    return modifier + (skillProficiencies[skill.key] ? proficiencyBonus : 0);
  };

  const passivePerceptionSkill = skillList.find((skill) => skill.key === "perception");
  const passivePerception = 10 + (passivePerceptionSkill ? getSkillValue(passivePerceptionSkill) : 0);

  const handleHitPointChange = (field) => (event) => {
    const { value } = event.target;
    setHitPoints((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChakraPointChange = (field) => (event) => {
    const { value } = event.target;
    setChakraPoints((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hpFill = getGaugeFill(hitPoints.current, hitPoints.max);
  const chakraFill = getGaugeFill(chakraPoints.current, chakraPoints.max);

  return (
    <form className="charsheet">
      <header>
        <section className="charname">
          <label htmlFor="charname">Character Name</label>
          <input id="charname" name="charname" />
        </section>
        <section className="misc">
          <ul>
            <li>
              <label htmlFor="class">Class</label>
              <input id="class" name="class" placeholder="Genin" />
            </li>
            <li>
              <label htmlFor="level">Level</label>
              <input
                id="level"
                name="level"
                type="number"
                min={1}
                max={20}
                value={levelInput}
                onChange={(event) => setLevelInput(event.target.value)}
                onBlur={() => setLevelInput(String(level))}
              />
            </li>
            <li>
              <label htmlFor="background">Background</label>
              <input id="background" name="background" placeholder="Acolyte" />
            </li>
            <li>
              <label htmlFor="playername">Player Name</label>
              <input id="playername" name="playername" placeholder="Player McPlayerface" />
            </li>
            <li>
              <label htmlFor="clan">Clan</label>
              <input id="clan" name="clan" placeholder="Uchiha" />
            </li>
            <li>
              <label htmlFor="village">Village</label>
              <input id="village" name="village" placeholder="Konoha" />
            </li>
            <li>
              <label htmlFor="experiencepoints">Experience Points</label>
              <input id="experiencepoints" name="experiencepoints" placeholder="3240" />
            </li>
            <li>
              <label htmlFor="ninjaRank">Ninja Rank</label>
              <input id="ninjaRank" name="ninjaRank" placeholder="Chuunin" />
            </li>
            <li>
              <label htmlFor="alignment">Alignment</label>
              <input id="alignment" name="alignment" placeholder="Neutral Good" />
            </li>
            <li className="nature-affinity">
              <span className="nature-title">Nature Affinity</span>
              <div className="nature-options">
                {natureOptions.map((option) => {
                  const optionId = `nature-${slugify(option)}`;
                  return (
                    <label key={option} htmlFor={optionId}>
                      <input
                        id={optionId}
                        type="checkbox"
                        checked={natureAffinity.includes(option)}
                        onChange={() => toggleNature(option)}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </li>
          </ul>
        </section>
      </header>
      <main>
        <section>
          <section className="attributes">
            <div className="scores">
              <ul>
                {abilityList.map((ability) => {
                  const modifierId = `${ability.scoreId}-mod`;
                  return (
                    <li key={ability.key}>
                      <div className="score">
                        <label htmlFor={ability.scoreId}>{ability.name}</label>
                        <input
                          id={ability.scoreId}
                          name={ability.scoreId}
                          type="number"
                          value={abilitiesState[ability.key]}
                          onChange={handleAbilityChange(ability.key)}
                        />
                      </div>
                      <div className="modifier">
                        <input id={modifierId} name={modifierId} value={fmt(abilityModifiers[ability.key])} readOnly />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="attr-applications">
              <div className="inspiration box">
                <div className="label-container">
                  <label htmlFor="inspiration">Inspiration</label>
                </div>
                <input id="inspiration" name="inspiration" type="checkbox" />
              </div>
              <div className="proficiencybonus box">
                <div className="label-container">
                  <label htmlFor="proficiencybonus">Proficiency Bonus</label>
                </div>
                <input id="proficiencybonus" name="proficiencybonus" value={fmt(proficiencyBonus)} readOnly />
              </div>
              <div className="saves list-section box">
                <ul>
                  {savingThrows.map((save) => (
                    <li key={save.key}>
                      <label htmlFor={save.id}>{save.label}</label>
                      <input id={save.id} type="text" value={fmt(getSavingThrowValue(save.key))} readOnly />
                      <input
                        id={`${save.id}-prof`}
                        type="checkbox"
                        checked={savingThrowProficiencies[save.key]}
                        onChange={() => toggleSavingThrow(save.key)}
                      />
                    </li>
                  ))}
                </ul>
                <div className="label">Saving Throws</div>
              </div>
              <div className="skills list-section box">
                <ul>
                  {skillList.map((skill) => {
                    const skillId = slugify(skill.name);
                    return (
                      <li key={skill.key}>
                        <label htmlFor={skillId}>
                          {skill.name} <span className="skill">({skill.abilityLabel})</span>
                        </label>
                        <input id={skillId} type="text" value={fmt(getSkillValue(skill))} readOnly />
                        <input
                          id={`${skillId}-prof`}
                          type="checkbox"
                          checked={skillProficiencies[skill.key]}
                          onChange={() => toggleSkill(skill.key)}
                        />
                      </li>
                    );
                  })}
                </ul>
                <div className="label">Skills</div>
              </div>
            </div>
          </section>
          <div className="passive-perception box">
            <div className="label-container">
              <label htmlFor="passiveperception">Passive Wisdom (Perception)</label>
            </div>
            <input id="passiveperception" name="passiveperception" value={passivePerception} readOnly />
          </div>
          <div className="otherprofs box textblock">
            <label htmlFor="otherprofs">Other Proficiencies and Languages</label>
            <textarea id="otherprofs" name="otherprofs"></textarea>
          </div>
        </section>
        <section>
          <section className="combat">
            <div className="armorclass">
              <div>
                <label htmlFor="ac">Armor Class</label>
                <input id="ac" name="ac" placeholder="10" type="text" />
              </div>
            </div>
            <div className="initiative">
              <div>
                <label htmlFor="initiative">Initiative</label>
                <input id="initiative" name="initiative" placeholder="+0" type="text" />
              </div>
            </div>
            <div className="speed">
              <div>
                <label htmlFor="speed">Speed</label>
                <input id="speed" name="speed" placeholder="30" type="text" />
              </div>
            </div>
            <div className="hp">
              <div className="resource-card hp-card">
                <div className="resource-header">
                  <label htmlFor="maxhp">Max HP</label>
                  <input
                    id="maxhp"
                    name="maxhp"
                    type="number"
                    value={hitPoints.max}
                    onChange={handleHitPointChange("max")}
                    placeholder="16"
                  />
                </div>
                <div className="resource-current">
                  <label htmlFor="currenthp">Current HP</label>
                  <input
                    id="currenthp"
                    name="currenthp"
                    type="number"
                    value={hitPoints.current}
                    onChange={handleHitPointChange("current")}
                    placeholder="16"
                  />
                </div>
                <div className="resource-temp">
                  <label htmlFor="temphp">Temp. HP</label>
                  <input
                    id="temphp"
                    name="temphp"
                    type="number"
                    value={hitPoints.temp}
                    onChange={handleHitPointChange("temp")}
                    placeholder="0"
                  />
                </div>
                <div className="resource-gauge" aria-hidden="true">
                  <span className="resource-gauge-fill" style={{ transform: `scaleY(${hpFill})` }} />
                </div>
              </div>
            </div>
            <div className="chakra">
              <div className="resource-card chakra-card">
                <div className="resource-header">
                  <label htmlFor="maxchakra">Max CP</label>
                  <input
                    id="maxchakra"
                    name="maxchakra"
                    type="number"
                    value={chakraPoints.max}
                    onChange={handleChakraPointChange("max")}
                    placeholder="22"
                  />
                </div>
                <div className="resource-current">
                  <label htmlFor="currentchakra">Current CP</label>
                  <input
                    id="currentchakra"
                    name="currentchakra"
                    type="number"
                    value={chakraPoints.current}
                    onChange={handleChakraPointChange("current")}
                    placeholder="22"
                  />
                </div>
                <div className="resource-temp">
                  <label htmlFor="tempchakra">Temp. Chakra</label>
                  <input
                    id="tempchakra"
                    name="tempchakra"
                    type="number"
                    value={chakraPoints.temp}
                    onChange={handleChakraPointChange("temp")}
                    placeholder="0"
                  />
                </div>
                <div className="resource-gauge" aria-hidden="true">
                  <span className="resource-gauge-fill" style={{ transform: `scaleY(${chakraFill})` }} />
                </div>
              </div>
            </div>
            <div className="hitdice">
              <div>
                <div className="total">
                  <label htmlFor="totalhd">Total</label>
                  <input id="totalhd" name="totalhd" placeholder="2d10" type="text" />
                </div>
                <div className="remaining">
                  <label htmlFor="remaininghd">Hit Dice</label>
                  <input id="remaininghd" name="remaininghd" type="text" />
                </div>
              </div>
            </div>
            <div className="chakradice">
              <div>
                <div className="total">
                  <label htmlFor="totalcd">Total</label>
                  <input id="totalcd" name="totalcd" placeholder="2d8" type="text" />
                </div>
                <div className="remaining">
                  <label htmlFor="remainingcd">Chakra Dice</label>
                  <input id="remainingcd" name="remainingcd" type="text" />
                </div>
              </div>
            </div>
            <div className="deathsaves">
              <div>
                <div className="label">
                  <label>Death Saves</label>
                </div>
                <div className="marks">
                  <div className="deathsuccesses">
                    <label htmlFor="deathsuccess1">Successes</label>
                    <div className="bubbles">
                      <input id="deathsuccess1" name="deathsuccess1" type="checkbox" />
                      <input id="deathsuccess2" name="deathsuccess2" type="checkbox" />
                      <input id="deathsuccess3" name="deathsuccess3" type="checkbox" />
                    </div>
                  </div>
                  <div className="deathfails">
                    <label htmlFor="deathfail1">Failures</label>
                    <div className="bubbles">
                      <input id="deathfail1" name="deathfail1" type="checkbox" />
                      <input id="deathfail2" name="deathfail2" type="checkbox" />
                      <input id="deathfail3" name="deathfail3" type="checkbox" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="attacksandspellcasting">
            <div>
              <label>Attacks &amp; Jutsu</label>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Atk Bonus</th>
                    <th>Damage/Type</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((row) => (
                    <tr key={row}>
                      <td>
                        <input name={`atkname${row}`} type="text" />
                      </td>
                      <td>
                        <input name={`atkbonus${row}`} type="text" />
                      </td>
                      <td>
                        <input name={`atkdamage${row}`} type="text" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <textarea placeholder="Additional attacks, jutsu, or notes"></textarea>
            </div>
          </section>
          <section className="equipment">
            <div>
              <label>Equipment</label>
              <div className="money">
                <ul>
                  {moneyTypes.map((money) => (
                    <li key={money}>
                      <label htmlFor={money}>{money}</label>
                      <input id={money} name={money} />
                    </li>
                  ))}
                </ul>
              </div>
              <textarea placeholder="Equipment list here"></textarea>
            </div>
          </section>
        </section>
        <section>
          <section className="flavor">
            <div className="personality">
              <label htmlFor="personality">Personality</label>
              <textarea id="personality" name="personality"></textarea>
            </div>
            <div className="ideals">
              <label htmlFor="ideals">Ideals</label>
              <textarea id="ideals" name="ideals"></textarea>
            </div>
            <div className="bonds">
              <label htmlFor="bonds">Bonds</label>
              <textarea id="bonds" name="bonds"></textarea>
            </div>
            <div className="flaws">
              <label htmlFor="flaws">Flaws</label>
              <textarea id="flaws" name="flaws"></textarea>
            </div>
          </section>
          <section className="features">
            <div>
              <label htmlFor="features">Features &amp; Traits</label>
              <textarea id="features" name="features"></textarea>
            </div>
          </section>
        </section>
      </main>
    </form>
  );
}
