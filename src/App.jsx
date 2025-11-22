import { useMemo, useState, useRef } from "react";
import "./styles.css";

const abilityList = [
  { name: "Strength", key: "str", scoreId: "Strengthscore" },
  { name: "Dexterity", key: "dex", scoreId: "Dexterityscore" },
  { name: "Constitution", key: "con", scoreId: "Constitutionscore" },
  { name: "Intelligence", key: "int", scoreId: "Intelligencescore" },
  { name: "Wisdom", key: "wis", scoreId: "Wisdomscore" },
  { name: "Charisma", key: "cha", scoreId: "Charismascore" },
];

const skillList = [
  { name: "Acrobatics", key: "acrobatics", ability: "dex", abilityLabel: "Dex" },
  { name: "Animal Handling", key: "animal-handling", ability: "wis", abilityLabel: "Wis" },
  { name: "Athletics", key: "athletics", ability: "str", abilityLabel: "Str" },
  { name: "Chakra Control", key: "chakra-control", ability: "con", abilityLabel: "Con" },
  { name: "Crafting", key: "crafting", ability: "int", abilityLabel: "Int" },
  { name: "Deception", key: "deception", ability: "cha", abilityLabel: "Cha" },
  { name: "History", key: "history", ability: "int", abilityLabel: "Int" },
  { name: "Illusions", key: "illusions", ability: "wis", abilityLabel: "Wis" },
  { name: "Insight", key: "insight", ability: "wis", abilityLabel: "Wis" },
  { name: "Intimidation", key: "intimidation", ability: "cha", abilityLabel: "Cha" },
  { name: "Investigation", key: "investigation", ability: "int", abilityLabel: "Int" },
  { name: "Martial Arts", key: "martial-arts", ability: "str", abilityLabel: "Str" },
  { name: "Medicine", key: "medicine", ability: "wis", abilityLabel: "Wis" },
  { name: "Nature", key: "nature", ability: "int", abilityLabel: "Int" },
  { name: "Ninshou", key: "ninshou", ability: "int", abilityLabel: "Int" },
  { name: "Perception", key: "perception", ability: "wis", abilityLabel: "Wis" },
  { name: "Performance", key: "performance", ability: "cha", abilityLabel: "Cha" },
  { name: "Persuasion", key: "persuasion", ability: "cha", abilityLabel: "Cha" },
  { name: "Sleight of Hand", key: "sleight-of-hand", ability: "dex", abilityLabel: "Dex" },
  { name: "Stealth", key: "stealth", ability: "dex", abilityLabel: "Dex" },
  { name: "Survival", key: "survival", ability: "wis", abilityLabel: "Wis" },
];

const moneyTypes = ["Ryo's"];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function fmt(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "+0";
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
  if (Number.isNaN(parsed)) return 0;
  return Math.floor((parsed - 10) / 2);
}

function clampLevel(value) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return 1;
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

function getVitalityColorClass(percent) {
  if (percent > 50) return "vitality-high";
  if (percent > 25) return "vitality-mid";
  return "vitality-low";
}

export default function App() {
  const [levelInput, setLevelInput] = useState("1");
  const level = clampLevel(levelInput);
  const proficiencyBonus = pbFromLevel(level);

  const [portraitUrl, setPortraitUrl] = useState(null);
  const fileInputRef = useRef(null);

  const vitalityPercent = 100;

  function handlePortraitChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPortraitUrl(reader.result);
    reader.readAsDataURL(file);
  }

  function handleClearPortrait() {
    setPortraitUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

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
          <div className="portrait">
            <div
              className="portrait-frame"
              style={
                portraitUrl
                  ? {
                      backgroundImage: `url(${portraitUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            >
              {!portraitUrl && (
                <span className="portrait-placeholder">Character Portrait</span>
              )}
            </div>
            <div className="portrait-buttons">
              <input
                id="portrait-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePortraitChange}
              />
              <label className="portrait-upload" htmlFor="portrait-input">
                Upload Image
              </label>
              <button
                type="button"
                className="portrait-clear"
                onClick={handleClearPortrait}
              >
                Clear Image
              </button>
            </div>
          </div>

          <div className="resource-bars">
            <div className="resource">
              <span className="resource-label">Health Points</span>
              <div className="resource-track">
                <div
                  className={`resource-fill ${getVitalityColorClass(vitalityPercent)}`}
                  style={{ width: `${vitalityPercent}%` }}
                />
              </div>
            </div>
            <div className="resource">
              <span className="resource-label">Chakra Points</span>
              <div className="resource-track">
                <div className="resource-fill resource-chakra" style={{ width: "75%" }} />
              </div>
            </div>
          </div>

          <label htmlFor="charname">Character Name</label>
          <input id="charname" name="charname" />
        </section>

        <section className="identity-card">
          <div className="identity-grid">
            <div className="field level-field">
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
            </div>

            <div className="medical-affinity">
              <button
                type="button"
                className={`medical-node ${
                  natureAffinity.includes("Medical") ? "is-active" : ""
                }`}
                onClick={() => toggleNature("Medical")}
              />
              <span className="field-label">Medical Affinity</span>
            </div>

            <div className="field class-field">
              <label htmlFor="class">Class</label>
              <input id="class" name="class" placeholder="Hunter-nin" />
            </div>

            <div className="field clan-field">
              <label htmlFor="clan">Clan</label>
              <input id="clan" name="clan" placeholder="Uchiha" />
            </div>

            <div className="field background-field">
              <label htmlFor="background">Background</label>
              <input id="background" name="background" placeholder="Acolyte" />
            </div>

            <div className="field village-field">
              <label htmlFor="village">Village</label>
              <input id="village" name="village" placeholder="Konoha" />
            </div>

            <div className="field experience-field">
              <label htmlFor="experiencepoints">Experience Points</label>
              <input
                id="experiencepoints"
                name="experiencepoints"
                placeholder="3240"
              />
            </div>

            <div className="field alignment-field">
              <label htmlFor="alignment">Alignment</label>
              <input
                id="alignment"
                name="alignment"
                placeholder="Neutral Good"
              />
            </div>
          </div>

          <div className="field nature-affinity">
            <span className="field-label nature-label">Nature Affinity</span>
            <div className="nature-list">
              <button
                type="button"
                className={`nature-list-item ${
                  natureAffinity.includes("Fire") ? "is-active" : ""
                }`}
                onClick={() => toggleNature("Fire")}
              >
                <span className="nature-list-icon nature-icon-fire" />
                <span className="nature-list-label">Fire</span>
              </button>
              <button
                type="button"
                className={`nature-list-item ${
                  natureAffinity.includes("Wind") ? "is-active" : ""
                }`}
                onClick={() => toggleNature("Wind")}
              >
                <span className="nature-list-icon nature-icon-wind" />
                <span className="nature-list-label">Wind</span>
              </button>
              <button
                type="button"
                className={`nature-list-item ${
                  natureAffinity.includes("Lightning") ? "is-active" : ""
                }`}
                onClick={() => toggleNature("Lightning")}
              >
                <span className="nature-list-icon nature-icon-lightning" />
                <span className="nature-list-label">Lightning</span>
              </button>
              <button
                type="button"
                className={`nature-list-item ${
                  natureAffinity.includes("Earth") ? "is-active" : ""
                }`}
                onClick={() => toggleNature("Earth")}
              >
                <span className="nature-list-icon nature-icon-earth" />
                <span className="nature-list-label">Earth</span>
              </button>
              <button
                type="button"
                className={`nature-list-item ${
                  natureAffinity.includes("Water") ? "is-active" : ""
                }`}
                onClick={() => toggleNature("Water")}
              >
                <span className="nature-list-icon nature-icon-water" />
                <span className="nature-list-label">Water</span>
              </button>
            </div>
          </div>
        </section>
      </header>

      <main>
        <section>
          <section className="attributes">
            <div className="combat-abilities-row">
              {abilityList.map((ability) => (
                <div key={ability.key} className="combat-ability">
                  <div className="combat-ability-mod">
                    {fmt(abilityModifiers[ability.key])}
                    <span className="mod-label">Mod</span>
                  </div>
                  <div className="combat-ability-main">
                    <input
                      className="combat-ability-score-input"
                      type="number"
                      value={abilitiesState[ability.key]}
                      onChange={handleAbilityChange(ability.key)}
                    />
                    <div className="combat-ability-save">
                      <label className="st-toggle">
                        <input
                          type="checkbox"
                          checked={savingThrowProficiencies[ability.key]}
                          onChange={() => toggleSavingThrow(ability.key)}
                        />
                        <span className="st-value">
                          {fmt(getSavingThrowValue(ability.key))}
                        </span>
                        <span className="st-dot" />
                      </label>
                    </div>
                    <div className="combat-ability-label">{ability.name}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="attr-applications">
              <div className="skills-combat-feats-grid">
                <div className="skills-column">
                  <div className="skills list-section box">
                    <ul className="skills-list">
                      {skillList.map((skill) => {
                        const skillId = slugify(skill.name);
                        const value = fmt(getSkillValue(skill));
                        return (
                          <li key={skill.key} className="skill-row">
                            <label
                              htmlFor={`${skillId}-prof`}
                              className="skill-row-label"
                            >
                              <span className="skill-prof-toggle">
                                <input
                                  id={`${skillId}-prof`}
                                  type="checkbox"
                                  checked={skillProficiencies[skill.key]}
                                  onChange={() => toggleSkill(skill.key)}
                                  className="skill-prof-input"
                                />
                                <span className="skill-prof-visual" />
                              </span>
                              <span className="skill-name">
                                {skill.name}
                                <span className="skill-ability">
                                  ({skill.abilityLabel})
                                </span>
                              </span>
                              <span className="skill-value">{value}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="label">Skills</div>
                  </div>
                </div>

                <div className="combat-column">
                  <section className="combat-stats">
                    <div className="combat-row combat-row-top">
                      <div className="combat-stat-card inspiration-stat">
                        <label htmlFor="inspiration">Inspiration</label>
                        <input
                          id="inspiration"
                          name="inspiration"
                          type="checkbox"
                        />
                      </div>
                      <div className="combat-stat-card armorclass-stat">
                        <label htmlFor="ac">Armor Class</label>
                        <input
                          id="ac"
                          name="ac"
                          placeholder="10"
                          className="combat-stat-input"
                          type="text"
                        />
                      </div>
                      <div className="combat-stat-card proficiency-stat">
                        <label htmlFor="proficiencybonus">Prof. Bonus</label>
                        <input
                          id="proficiencybonus"
                          name="proficiencybonus"
                          value={fmt(proficiencyBonus)}
                          className="combat-stat-input combat-prof-input"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="combat-row combat-row-bottom">
                      <div></div>
                      <div className="combat-stat-card speed-stat">
                        <label htmlFor="speed">Speed</label>
                        <input
                          id="speed"
                          name="speed"
                          placeholder="30"
                          className="combat-stat-input"
                          type="text"
                        />
                      </div>
                      <div className="combat-stat-card initiative-stat">
                        <label htmlFor="initiative">Initiative</label>
                        <input
                          id="initiative"
                          name="initiative"
                          placeholder="+0"
                          className="combat-stat-input"
                          type="text"
                        />
                      </div>
                    </div>
                  </section>
                  <section className="deathsaves">
                   <div className="death-card">
                    <div className="death-card-header">Death Saves</div>
                      <div className="death-card-body">
                        <div className="death-row">
                          <span className="death-row-label">Successes</span>
                          <div className="death-bubbles">
                            <input type="checkbox" name="deathsuccess1" />
                            <input type="checkbox" name="deathsuccess2" />
                            <input type="checkbox" name="deathsuccess3" />
                          </div>
                        </div>
                        <div className="death-row">
                          <span className="death-row-label">Failures</span>
                          <div className="death-bubbles">
                            <input type="checkbox" name="deathfail1" />
                            <input type="checkbox" name="deathfail2" />
                            <input type="checkbox" name="deathfail3" />
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
                      <textarea placeholder="Additional attacks, jutsu, or notes" />
                    </div>
                  </section>
                </div>

                <div className="feats-column">
                  <section className="features">
                    <div>
                      <label htmlFor="features">Features &amp; Traits</label>
                      <textarea id="features" name="features" />
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </section>

          <div className="passive-perception box">
            <div className="label-container">
              <label htmlFor="passiveperception">
                Passive Wisdom (Perception)
              </label>
            </div>
            <input
              id="passiveperception"
              name="passiveperception"
              value={passivePerception}
              readOnly
            />
          </div>

          <div className="otherprofs box textblock">
            <label htmlFor="otherprofs">
              Other Proficiencies and Languages
            </label>
            <textarea id="otherprofs" name="otherprofs" />
          </div>
        </section>

        <section>
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
              <textarea placeholder="Equipment list here" />
            </div>
          </section>
        </section>

        <section>
          <section className="flavor">
            <div className="personality">
              <label htmlFor="personality">Personality</label>
              <textarea id="personality" name="personality" />
            </div>
            <div className="ideals">
              <label htmlFor="ideals">Ideals</label>
              <textarea id="ideals" name="ideals" />
            </div>
            <div className="bonds">
              <label htmlFor="bonds">Bonds</label>
              <textarea id="bonds" name="bonds" />
            </div>
            <div className="flaws">
              <label htmlFor="flaws">Flaws</label>
              <textarea id="flaws" name="flaws" />
            </div>
          </section>
        </section>
      </main>
    </form>
  );
}
