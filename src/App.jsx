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

 // ============= START OF USESTATE =================//
export default function App() {
  const [levelInput, setLevelInput] = useState("1");
  const level = clampLevel(levelInput);
  const proficiencyBonus = pbFromLevel(level);
  const [activePage, setActivePage] = useState("core");
  const [ninjutsuList, setNinjutsuList] = useState([]);
  const [genjutsuList, setGenjutsuList] = useState([]);
  const [taijutsuList, setTaijutsuList] = useState([]);
  const [isJutsuModalOpen, setIsJutsuModalOpen] = useState(false);
  const [currentJutsuType, setCurrentJutsuType] = useState(null);
  const [jutsuForm, setJutsuForm] = useState({name: "", rank: "D", castingTime:"", cost:"", type:"attack", range:"", duration:"", components: "", keywords: "", description:"", higerLevels:"",});
  const [ninjutsuAbility, setNinjutsuAbility] = useState("int"); 
  const [genjutsuAbility, setGenjutsuAbility] = useState("wis");
  const [taijutsuAbility, setTaijutsuAbility] = useState("str");
  const [selectedJutsu, setSelectedJutsu] = useState(null);
  const [willOfFire, setWillOfFire] = useState(0);
  const [portraitUrl, setPortraitUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [features, setFeatures] = useState([]);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isFeaturesEditMode, setIsFeaturesEditMode] = useState(false);
  const [featureForm, setFeatureForm] = useState({name: "", source: "", sourceType: "", description: "", });
  const [expandedFeatureId, setExpandedFeatureId] = useState(null);

  const vitalityPercent = 100;

  const closeSelectedJutsu = () => setSelectedJutsu(null);

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
  const [hitDice, setHitDice] = useState({ count: "", die: "d8" });
  const [chakraDice, setChakraDice] = useState({ count: "", die: "d8" });
  const [isHpEditing, setIsHpEditing] = useState(false);
  const [isChakraEditing, setIsChakraEditing] = useState(false);

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

  const handleJutsuFormChange = (field) => (event) => {
  const { value } = event.target;
    setJutsuForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

   const openFeaturesModal = () => {
    setFeatureForm({
      name: "",
      source: "",
      sourceType: "",
      description: "",
    });
    setIsFeaturesModalOpen(true);
  };

  const closeFeaturesModal = () => {
    setIsFeaturesModalOpen(false);
  };

  const handleFeatureFormChange = (field) => (event) => {
    const { value } = event.target;
    setFeatureForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureSubmit = () => {
    if (!featureForm.name.trim()) {
      setIsFeaturesModalOpen(false);
      return;
    }

    const newFeature = {
      id: Date.now(),
      name: featureForm.name.trim(),
      source: featureForm.source.trim(),
      sourceType: featureForm.sourceType.trim(),
      description: featureForm.description.trim(),
    };

    setFeatures((prev) => [...prev, newFeature]);
    setIsFeaturesModalOpen(false);
  };

  const handleDeleteFeature = (id) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
    setExpandedFeatureId((current) => (current === id ? null : current));
  };

  const openJutsuModal = (type) => {
    setCurrentJutsuType(type); 
    setJutsuForm({ name: "", rank: "D", castingTime:"", cost:"", type:"attack", range:"", duration:"", components: "", keywords: "", description:"", higerLevels:"",});
    setIsJutsuModalOpen(true);
  };

  const closeJutsuModal = () => {
    setIsJutsuModalOpen(false);
  };

   const handleDeleteJutsu = (type, id) => {
    if (type === "ninjutsu") {
      setNinjutsuList((prev) => prev.filter((j) => j.id !== id));
    } else if (type === "genjutsu") {
      setGenjutsuList((prev) => prev.filter((j) => j.id !== id));
    } else if (type === "taijutsu") {
      setTaijutsuList((prev) => prev.filter((j) => j.id !== id));
    }
  };

  const handleJutsuSubmit = () => {
    if (!currentJutsuType || !jutsuForm.name.trim()) {
      setIsJutsuModalOpen(false);
      return;
    };

    const newJutsu = {
      id: Date.now(),
      name: jutsuForm.name.trim(),
      rank: jutsuForm.rank,
      castingTime: jutsuForm.castingTime.trim(),
      cost: jutsuForm.cost.trim(),
      type: jutsuForm.type,
      range: jutsuForm.range.trim(),
      duration: jutsuForm.duration.trim(),
      components: jutsuForm.components.trim(),
      keywords: jutsuForm.keywords.trim(),
      description: jutsuForm.description.trim(),
      higherLevels: (jutsuForm.higherLevels || "").trim(),
    };

    if (currentJutsuType === "ninjutsu") {
      setNinjutsuList((prev) => [...prev, newJutsu]);
    } else if (currentJutsuType === "genjutsu") {
      setGenjutsuList((prev) => [...prev, newJutsu]);
    } else if (currentJutsuType === "taijutsu") {
      setTaijutsuList((prev) => [...prev, newJutsu]);
    }

    setIsJutsuModalOpen(false);
  };


  const getSavingThrowValue = (key) => {
    const modifier = abilityModifiers[key] ?? 0;
    return modifier + (savingThrowProficiencies[key] ? proficiencyBonus : 0);
  };

  const getSkillValue = (skill) => {
    const modifier = abilityModifiers[skill.ability] ?? 0;
    return modifier + (skillProficiencies[skill.key] ? proficiencyBonus : 0);
  };

    const getJutsuSaveDC = (abilityKey) => {
    const modifier = abilityModifiers[abilityKey] ?? 0;
    return 8 + modifier + proficiencyBonus;
  };

  const getJutsuAttackBonus = (abilityKey) => {
    const modifier = abilityModifiers[abilityKey] ?? 0;
    return modifier + proficiencyBonus;
  };

  const passivePerceptionSkill = skillList.find((skill) => skill.key === "perception");
  const passivePerception = 10 + (passivePerceptionSkill ? getSkillValue(passivePerceptionSkill) : 0);
  const passiveInsightSkill = skillList.find((skill) => skill.key === "insight");
  const passiveInsight = 10 + (passiveInsightSkill ? getSkillValue(passiveInsightSkill) : 0);


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

  const handleHitDiceChange = (field) => (event) => {
    const { value } = event.target;
    setHitDice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChakraDiceChange = (field) => (event) => {
    const { value } = event.target;
    setChakraDice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hpFill = getGaugeFill(hitPoints.current, hitPoints.max);
  const chakraFill = getGaugeFill(chakraPoints.current, chakraPoints.max);
  const hpTempFill = getGaugeFill(hitPoints.temp, hitPoints.max);
  const chakraTempFill = getGaugeFill(chakraPoints.temp, chakraPoints.max);
  const hpPercent = hpFill * 100;
  const chakraPercent = chakraFill * 100;
  const hpTempWidthPercent = Math.min(1 - hpFill, hpTempFill) * 100;
  const chakraTempWidthPercent = Math.min(1 - chakraFill, chakraTempFill) * 100;
  const hpTooltip = `${hitPoints.current || 0} / ${hitPoints.max || 0}${ hitPoints.temp ? ` (+${hitPoints.temp} temp)` : ""}`;
  const chakraTooltip = `${chakraPoints.current || 0} / ${chakraPoints.max || 0}${ chakraPoints.temp ? ` (+${chakraPoints.temp} temp)` : ""}`;

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

{/* HP / Chakra bars */}
          <div className="resource-bars">
            {/* HP */}
            <div className="resource">
              <span className="resource-label">Health Points</span>
              <div
                className="resource-track-wrapper"
                onMouseEnter={() => setIsHpEditing(true)}
                onMouseLeave={() => setIsHpEditing(false)}
              >
                <div className="resource-track" title={hpTooltip}>
                  <div
                    className={`resource-fill ${getVitalityColorClass(hpPercent)}`}
                    style={{ width: `${hpPercent}%` }}
                  />
                  {Number(hitPoints.temp) > 0 && (
                    <div
                      className="resource-fill-temp"
                      style={{
                        left: `${hpPercent}%`,
                        width: `${hpTempWidthPercent}%`,
                      }}
                    />
                  )}

                  <button
                    type="button"
                    className="resource-temp-badge"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsHpEditing(true);
                    }}
                    title={hitPoints.temp ? `Temp HP: ${hitPoints.temp}` : "Set temp HP"}
                  >
                    {Number(hitPoints.temp) > 0 ? `+${hitPoints.temp}` : "+T"}
                  </button>
                </div>

                {isHpEditing && (
                  <div className="resource-popover">
                    <div className="resource-edit-field">
                      <span className="resource-edit-label">Current</span>
                      <input
                        type="number"
                        className="resource-edit-input"
                        value={hitPoints.current}
                        onChange={handleHitPointChange("current")}
                      />
                    </div>
                    <div className="resource-edit-field">
                      <span className="resource-edit-label">Max</span>
                      <input
                        type="number"
                        className="resource-edit-input"
                        value={hitPoints.max}
                        onChange={handleHitPointChange("max")}
                      />
                    </div>
                    <div className="resource-edit-field">
                      <span className="resource-edit-label">Temp</span>
                      <input
                        type="number"
                        className="resource-edit-input"
                        value={hitPoints.temp}
                        onChange={handleHitPointChange("temp")}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chakra */}
            <div className="resource">
              <span className="resource-label">Chakra Points</span>
              <div
                className="resource-track-wrapper"
                onMouseEnter={() => setIsChakraEditing(true)}
                onMouseLeave={() => setIsChakraEditing(false)}
              >
                <div className="resource-track" title={chakraTooltip}>
                  <div
                    className="resource-fill resource-chakra"
                    style={{ width: `${chakraPercent}%` }}
                  />
                  {Number(chakraPoints.temp) > 0 && (
                    <div
                      className="resource-fill-temp resource-temp-chakra"
                      style={{
                        left: `${chakraPercent}%`,
                        width: `${chakraTempWidthPercent}%`,
                      }}
                    />
                  )}

                  <button
                    type="button"
                    className="resource-temp-badge"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsChakraEditing(true);
                    }}
                    title={
                      chakraPoints.temp
                        ? `Temp Chakra: ${chakraPoints.temp}`
                        : "Set temp Chakra"
                    }
                  >
                    {Number(chakraPoints.temp) > 0 ? `+${chakraPoints.temp}` : "+T"}
                  </button>
                </div>

                {isChakraEditing && (
                  <div className="resource-popover">
                    <div className="resource-edit-field">
                      <span className="resource-edit-label">Current</span>
                      <input
                        type="number"
                        className="resource-edit-input"
                        value={chakraPoints.current}
                        onChange={handleChakraPointChange("current")}
                      />
                    </div>
                    <div className="resource-edit-field">
                      <span className="resource-edit-label">Max</span>
                      <input
                        type="number"
                        className="resource-edit-input"
                        value={chakraPoints.max}
                        onChange={handleChakraPointChange("max")}
                      />
                    </div>
                    <div className="resource-edit-field">
                      <span className="resource-edit-label">Temp</span>
                      <input
                        type="number"
                        className="resource-edit-input"
                        value={chakraPoints.temp}
                        onChange={handleChakraPointChange("temp")}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hit / Chakra dice */}
          <div className="resource-dice-row">
            <div className="dice-chip">
              <span className="dice-label">Hit Dice</span>
              <div className="dice-controls">
                <input
                  type="number"
                  className="dice-count-input"
                  value={hitDice.count}
                  onChange={handleHitDiceChange("count")}
                  placeholder="#"
                />
                <select
                  className="dice-die-select"
                  value={hitDice.die}
                  onChange={handleHitDiceChange("die")}
                >
                  <option value="d6">d6</option>
                  <option value="d8">d8</option>
                  <option value="d10">d10</option>
                  <option value="d12">d12</option>
                </select>
              </div>
            </div>

            <div className="dice-chip">
              <span className="dice-label">Chakra Dice</span>
              <div className="dice-controls">
                <input
                  type="number"
                  className="dice-count-input"
                  value={chakraDice.count}
                  onChange={handleChakraDiceChange("count")}
                  placeholder="#"
                />
                <select
                  className="dice-die-select"
                  value={chakraDice.die}
                  onChange={handleChakraDiceChange("die")}
                >
                  <option value="d6">d6</option>
                  <option value="d8">d8</option>
                  <option value="d10">d10</option>
                  <option value="d12">d12</option>
                </select>
              </div>
            </div>
          </div>

          {/* Character Name with cute label */}
          <div className="charname-field">
            <label htmlFor="charname" className="charname-label">
              Character Name
            </label>
            <input id="charname" name="charname" />
          </div>
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
                onBlur={() => setLevelInput(String(level))}/>
            </div>
            <div className="medical-affinity">
              <button
                type="button"
                className={`medical-node ${natureAffinity.includes("Medical") ? "is-active" : ""}`} 
                onClick={() => toggleNature("Medical")}/>
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
                placeholder="3240"/>
            </div>
            <div className="field alignment-field">
              <label htmlFor="alignment">Alignment</label>
              <input
                id="alignment"
                name="alignment"
                placeholder="Neutral Good"/>
            </div>
            <div className="passive-senses-row">
            <div className="passive-sense-card">
              <label htmlFor="passiveperception-header">Passive Perception</label>
              <input
                id="passiveperception-header"
                name="passiveperception-header"
                value={passivePerception}
                readOnly />
            </div>
            <div className="passive-sense-card">
              <label htmlFor="passiveinsight-header">Passive Insight</label>
              <input  
                id="passiveinsight-header"
                name="passiveinsight-header"
                value={passiveInsight}
                readOnly />
            </div>
          </div>
          </div>
          <div className="field nature-affinity">
            <span className="field-label nature-label">Nature Affinity</span>
            <div className="nature-list">
              <button
                type="button"
                className={`nature-list-item ${natureAffinity.includes("Fire") ? "is-active" : ""}`}
                onClick={() => toggleNature("Fire")}>
                <span className="nature-list-icon nature-icon-fire" />
                <span className="nature-list-label">Fire</span>
              </button>
              <button
                type="button"
                className={`nature-list-item ${natureAffinity.includes("Wind") ? "is-active" : ""}`}
                onClick={() => toggleNature("Wind")}>
                <span className="nature-list-icon nature-icon-wind" />
                <span className="nature-list-label">Wind</span>
              </button>
              <button
                type="button"
                className={`nature-list-item ${natureAffinity.includes("Lightning") ? "is-active" : ""}`}
                onClick={() => toggleNature("Lightning")}>
                <span className="nature-list-icon nature-icon-lightning" />
                <span className="nature-list-label">Lightning</span>
              </button>
              <button
                type="button"
                className={`nature-list-item ${natureAffinity.includes("Earth") ? "is-active" : ""}`}
                onClick={() => toggleNature("Earth")}>
                <span className="nature-list-icon nature-icon-earth" />
                <span className="nature-list-label">Earth</span>
              </button>
              <button
                type="button"
                className={`nature-list-item ${natureAffinity.includes("Water") ? "is-active" : ""}`}
                onClick={() => toggleNature("Water")}>
                <span className="nature-list-icon nature-icon-water" />
                <span className="nature-list-label">Water</span>
              </button>
            </div>
          </div>
        </section>
      </header>
      <main>
        <section>
          {/* Atributes Area */}
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
                      onChange={handleAbilityChange(ability.key)}/>
                    <div className="combat-ability-save">
                      <label className="st-toggle">
                        <input
                          type="checkbox"
                          checked={savingThrowProficiencies[ability.key]}
                          onChange={() => toggleSavingThrow(ability.key)}/>
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
            {/* Selection TAB */}
            <div className="page-tabs">
              <button
                type="button"
                className={activePage === "core" ? "tab-button is-active" : "tab-button"}
                onClick={() => setActivePage("core")}>
                Core
              </button>
              <button
                type="button"
                className={activePage === "jutsu" ? "tab-button is-active" : "tab-button"}
                onClick={() => setActivePage("jutsu")}>
                Jutsu
              </button>
            </div>
            {/* Core TAB */}
            {activePage === "core" && (
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
                                className="skill-row-label">
                                <span className="skill-prof-toggle">
                                  <input
                                    id={`${skillId}-prof`}
                                    type="checkbox"
                                    checked={skillProficiencies[skill.key]}
                                    onChange={() => toggleSkill(skill.key)}
                                    className="skill-prof-input"/>
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
                          <label>Will of Fire</label>
                          <div className="will-of-fire-orbs">
                            {[1, 2, 3].map((i) => (
                              <label key={i} className="wof-orb-label">
                                <input
                                  type="checkbox"
                                  className="wof-orb-input"
                                  checked={i <= willOfFire}
                                  onChange={() => setWillOfFire((prev) => (prev < i ? i : i - 1))}/>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="combat-stat-card armorclass-stat">
                          <label htmlFor="ac">Armor Class</label>
                          <input
                            id="ac"
                            name="ac"
                            placeholder="10"
                            className="combat-stat-input"
                            type="text"/>
                        </div>
                        <div className="combat-stat-card proficiency-stat">
                          <label htmlFor="proficiencybonus">Prof. Bonus</label>
                          <input
                            id="proficiencybonus"
                            name="proficiencybonus"
                            value={fmt(proficiencyBonus)}
                            className="combat-stat-input combat-prof-input"
                            readOnly/>
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
                            type="text"/>
                        </div>
                        <div className="combat-stat-card initiative-stat">
                          <label htmlFor="initiative">Initiative</label>
                          <input
                            id="initiative"
                            name="initiative"
                            placeholder="+0"
                            className="combat-stat-input"
                            type="text"/>
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
                      <div className="features-card">
                        <div className="features-header">
                          <span className="features-title">Features &amp; Traits</span>
                          <div className="features-actions">
                            <button
                              type="button"
                              className="features-edit-button"
                              onClick={() => setIsFeaturesEditMode((prev) => !prev)}>
                              {isFeaturesEditMode ? "Done" : "Edit"}
                            </button>
                            <button
                              type="button"
                              className="features-add-button"
                              onClick={openFeaturesModal}>+</button>
                          </div>
                        </div>
                        <div className="features-list-container">
                          {features.length === 0 ? (
                            <p className="features-empty">
                              No features added yet.
                            </p>
                          ) : (
                            <ul className="features-list">
                              {features.map((feature) => {
                                const isExpanded = expandedFeatureId === feature.id;
                                return (
                                  <li
                                    key={feature.id}
                                    className={`feature-item ${isExpanded ? "is-expanded" : ""}`}>
                                    <div className="feature-item-header">
                                      <button
                                        type="button"
                                        className="feature-main"
                                        onClick={() => setExpandedFeatureId((current) => current === feature.id ? null : feature.id)}>
                                        <span className="feature-name">{feature.name}</span>
                                        {(feature.source || feature.sourceType) && (
                                          <span className="feature-source">{feature.source} {feature.source && feature.sourceType ? "-" : ""} {feature.sourceType}</span>
                                        )}
                                      </button>
                                      {isFeaturesEditMode && (
                                        <button
                                          type="button"
                                          className="feature-delete"
                                          onClick={() => handleDeleteFeature(feature.id)}>x</button>
                                      )}
                                    </div>
                                    {isExpanded && feature.description && (
                                      <div className="feature-description">
                                        {feature.description}
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </section>
          {activePage === "core" && (<>
              <div className="otherprofs box textblock">
                <label htmlFor="otherprofs">
                  Other Proficiencies and Languages
                </label>
                <textarea id="otherprofs" name="otherprofs" />
              </div>
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
            </>
          )}
          {activePage === "jutsu" && (
            <section className="jutsu-page">
              <div className="jutsu-header">
                <h2 className="jutsu-title">Jutsu</h2>
                <p className="jutsu-subtitle">
                  Track all Ninjutsu, Genjutsu and Taijutsu/Bukijutsu known by this character.
                </p>
              </div>
              <div className="jutsu-columns">
                <div className="jutsu-column">
                  <div className="jutsu-column-header">
                    <h3 className="jutsu-column-title">Ninjutsu</h3>
                    <button
                      type="button"
                      className="jutsu-add-link"
                      onClick={() => openJutsuModal("ninjutsu")}>+</button>
                  </div>
                  <div className="jutsu-math-row">
                    <div className="jutsu-math-field">
                      <span className="jutsu-math-label">Ability</span>
                      <select className="jutsu-math-select" value={ninjutsuAbility} onChange={(e) => setNinjutsuAbility(e.target.value)}>
                        <option value="str">Strength</option>
                        <option value="dex">Dexterity</option>
                        <option value="con">Constitution</option>
                        <option value="int">Intelligence</option>
                        <option value="wis">Wisdom</option>
                        <option value="cha">Charisma</option>
                      </select>
                    </div>
                    <div className="jutsu-math-field">
                      <span className="jutsu-math-label">Save DC</span>
                      <div className="jutsu-math-value">
                        {getJutsuSaveDC(ninjutsuAbility)}
                      </div>
                    </div>
                    <div className="jutsu-math-field">
                      <span className="jutsu-math-label">Atk Bonus</span>
                      <div className="jutsu-math-value">
                        {fmt(getJutsuAttackBonus(ninjutsuAbility))}
                      </div>
                    </div>
                  </div>
                  <ul className="jutsu-list">
                    {ninjutsuList.map((jutsu) => (
                      <li
                        key={jutsu.id}
                        className="jutsu-item"
                        onClick={() => setSelectedJutsu({ ...jutsu, category: "ninjutsu" })}>
                        <div className="jutsu-item-main">
                          <div className="jutsu-item-text">
                            <span className="jutsu-item-name">{jutsu.name}</span>
                            <div className="jutsu-item-meta">
                              {jutsu.rank && <span>Rank {jutsu.rank}</span>}
                              {jutsu.cost && <span>{jutsu.cost} Chakra</span>}
                              {jutsu.castingTime && <span>{jutsu.castingTime}</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="jutsu-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteJutsu("ninjutsu", jutsu.id);
                            }}>
                            X
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="jutsu-column">
                  <div className="jutsu-column-header">
                    <h3 className="jutsu-column-title">Genjutsu</h3>
                    <button
                      type="button"
                      className="jutsu-add-link"
                      onClick={() => openJutsuModal("genjutsu")}>
                      +
                    </button>
                  </div>
                  <div className="jutsu-math-row">
                    <div className="jutsu-math-field">
                      <span className="jutsu-math-label">Ability</span>
                      <select
                        className="jutsu-math-select"
                        value={genjutsuAbility}
                        onChange={(e) => setGenjutsuAbility(e.target.value)}>
                        <option value="str">Strength</option>
                        <option value="dex">Dexterity</option>
                        <option value="con">Constitution</option>
                        <option value="int">Intelligence</option>
                        <option value="wis">Wisdom</option>
                        <option value="cha">Charisma</option>
                      </select>
                    </div>
                    <div className="jutsu-math-field">
                      <span className="jutsu-math-label">Save DC</span>
                      <div className="jutsu-math-value">
                        {getJutsuSaveDC(genjutsuAbility)}
                      </div>
                    </div>
                    <div className="jutsu-math-field">
                      <span className="jutsu-math-label">Atk Bonus</span>
                      <div className="jutsu-math-value">
                        {fmt(getJutsuAttackBonus(genjutsuAbility))}
                      </div>
                    </div>
                  </div> 
                  <ul className="jutsu-list">
                    {genjutsuList.length === 0 && (
                      <li className="jutsu-empty">No Genjutsu added yet.</li>
                    )}
                    {genjutsuList.map((jutsu) => (
                      <li key={jutsu.id} className="jutsu-item">
                        <div className="jutsu-item-main">
                          <span className="jutsu-item-name">{jutsu.name}</span>
                          {jutsu.rank && (
                            <span className="jutsu-item-rank">{jutsu.rank}</span>
                          )}
                        </div>
                        {jutsu.notes && (
                          <div className="jutsu-item-notes">{jutsu.notes}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="jutsu-column">
                  <div className="jutsu-column-header">
                    <h3 className="jutsu-column-title jutsu-column-title-long">Taijutsu / Bukijutsu</h3>
                    <button
                      type="button"
                      className="jutsu-add-link jutsu-add-long"
                      onClick={() => openJutsuModal("taijutsu")}>
                      +
                    </button>
                  </div>
                  <div className="jutsu-math-row">
                    <div className="jutsu-math-field">
                      <span className="jutsu-math-label">Ability</span>
                      <select
                        className="jutsu-math-select"
                        value={taijutsuAbility}
                        onChange={(e) => setTaijutsuAbility(e.target.value)}>
                        <option value="str">Strength</option>
                        <option value="dex">Dexterity</option>
                        <option value="con">Constitution</option>
                        <option value="int">Intelligence</option>
                        <option value="wis">Wisdom</option>
                        <option value="cha">Charisma</option>
                      </select>
                    </div>
                    <div className="jutsu-math-field">
                      <span className="jutsu-math-label">Save DC</span>
                      <div className="jutsu-math-value">
                        {getJutsuSaveDC(taijutsuAbility)}
                      </div>
                    </div>
                    <div className="jutsu-math-field">
                      <span className="jutsu-math-label">Atk Bonus</span>
                      <div className="jutsu-math-value">
                        {fmt(getJutsuAttackBonus(taijutsuAbility))}
                      </div>
                    </div>
                  </div>
                  <ul className="jutsu-list">
                    {taijutsuList.length === 0 && (
                      <li className="jutsu-empty">No Taijutsu/Bukijutsu added yet.</li>
                    )}
                    {taijutsuList.map((jutsu) => (
                      <li key={jutsu.id} className="jutsu-item">
                        <div className="jutsu-item-main">
                          <span className="jutsu-item-name">{jutsu.name}</span>
                          {jutsu.rank && (
                            <span className="jutsu-item-rank">{jutsu.rank}</span>
                          )}
                        </div>
                        {jutsu.notes && (
                          <div className="jutsu-item-notes">{jutsu.notes}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </section>
      </main>
      {selectedJutsu && (
        <div className="jutsu-modal-backdrop" onClick={closeSelectedJutsu}>
          <div className="jutsu-modal" onClick={(event) => event.stopPropagation()}>
            <h3 className="jutsu-modal-title">{selectedJutsu.name}</h3>
            <div className="jutsu-detail-body">
              <div className="jutsu-detail-row">
                <span className="jutsu-detail-label">Rank</span>
                <span className="jutsu-detail-value">{selectedJutsu.rank || "-"}</span>
              </div>
              <div className="jutsu-detail-row">
                <span className="jutsu-detail-label">Cost</span>
                <span className="jutsu-detail-value">{selectedJutsu.cost ? `${selectedJutsu.cost} Chakra` : "-"}</span>
              </div>
              <div className="jutsu-detail-row">
                <span className="jutsu-detail-label">Casting Time</span>
                <span className="jutsu-detail-value">{selectedJutsu.castingTime || "-"}</span>
              </div>
              <div className="jutsu-detail-row">
                <span className="jutsu-detail-label">Type</span>
                <span className="jutsu-detail-value">{selectedJutsu.type === "attack" ? "Attack" : selectedJutsu.type === "effect" ? "Effect" : selectedJutsu.type || "-"} </span>
              </div>
              <div className="jutsu-detail-row">
                <span className="jutsu-detail-label">Range</span>
                <span className="jutsu-detail-value">{selectedJutsu.range || "-"}</span>
              </div>
              <div className="jutsu-detail-row">
                <span className="jutsu-detail-label">Duration</span>
                <span className="jutsu-detail-value">{selectedJutsu.duration || "-"}</span>
              </div>
              <div className="jutsu-detail-row">
                <span className="jutsu-detail-label">Components</span>
                <span className="jutsu-detail-value">{selectedJutsu.components || "-"}</span>
              </div>
              <div className="jutsu-detail-row">
                <span className="jutsu-detail-label">Keywords</span>
                <span className="jutsu-detail-value">{selectedJutsu.keywords || "-"}</span>
              </div>
              {selectedJutsu.description && (
                <div className="jutsu-detail-block">
                  <div className="jutsu-detail-subtitle">Description</div>
                  <p className="jutsu-detail-text">{selectedJutsu.description}</p>
                </div>
              )}
              {selectedJutsu.higherLevels && (
                <div className="jutsu-detail-block">
                  <div className="jutsu-detail-subtitle">At Higher Levels</div>
                  <p className="jutsu-detail-text">{selectedJutsu.higherLevels}</p>
                </div>
              )}
              <div className="jutsu-modal-actions">
                <button
                  type="button"
                  className="jutsu-modal-cancel"
                  onClick={closeSelectedJutsu}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isJutsuModalOpen && (
        <div className="jutsu-modal-backdrop" onClick={closeJutsuModal}>
          <div
            className="jutsu-modal"
            onClick={(event) => event.stopPropagation()}>
            <h3 className="jutsu-modal-title">
              Add{" "}{currentJutsuType === "ninjutsu" ? "Ninjutsu" : currentJutsuType === "genjutsu" ? "Genjutsu" : "Taijutsu / Bukijutsu"}</h3>
            <div className="jutsu-modal-form">
              <label className="jutsu-modal-field">
                <span>Name</span>
                <input
                  type="text"
                  value={jutsuForm.name}
                  onChange={handleJutsuFormChange("name")}
                  autoFocus/>
              </label>
              <div className="jutsu-modal-field">
                <span>Rank</span>
                <div className="jutsu-rank-options">
                  {["E", "D", "C", "B", "A", "S"].map((rank) => (
                    <label key={rank} className="jutsu-rank-option">
                      <input
                        type="radio"
                        name="jutsu-rank"
                        value={rank}
                        checked={jutsuForm.rank === rank}
                        onChange={(e) => setJutsuForm((prev) => ({ ...prev, rank: e.target.value }))}/>
                      <span>{rank}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="jutsu-modal-field">
                <span>Casting Time</span>
                <input
                  type="text"
                  value={jutsuForm.castingTime}
                  onChange={handleJutsuFormChange("castingTime")}
                  placeholder="1 Action, Bonus Action..."/>
              </label>
              <label className="jutsu-modal-field">
                <span>Cost (Chakra)</span>
                <input
                  type="number"
                  min="0"
                  value={jutsuForm.cost}
                  onChange={handleJutsuFormChange("cost")}/>
              </label>
              <div className="jutsu-modal-field">
                <span>Type</span>
                <div className="jutsu-type-options">
                  <label className="jutsu-type-option">
                    <input
                      type="radio"
                      name="jutsu-type"
                      value="attack"
                      checked={jutsuForm.type === "attack"}
                      onChange={(e) =>setJutsuForm((prev) => ({ ...prev, type: e.target.value }))}/>
                    <span>Attack</span>
                  </label>
                  <label className="jutsu-type-option">
                    <input
                      type="radio"
                      name="jutsu-type"
                      value="effect"
                      checked={jutsuForm.type === "effect"}
                      onChange={(e) =>setJutsuForm((prev) => ({ ...prev, type: e.target.value }))}/>
                    <span>Effect</span>
                  </label>
                </div>
              </div>
              <label className="jutsu-modal-field">
                <span>Range</span>
                <input
                  type="text"
                  value={jutsuForm.range}
                  onChange={handleJutsuFormChange("range")}
                  placeholder="Self, 30 ft, 60 ft cone..."/>
              </label>
              <label className="jutsu-modal-field">
                <span>Duration</span>
                <input
                  type="text"
                  value={jutsuForm.duration}
                  onChange={handleJutsuFormChange("duration")}
                  placeholder="Instantaneous, 1 Minute..."/>
              </label>
              <label className="jutsu-modal-field">
                <span>Components</span>
                <input
                  type="text"
                  value={jutsuForm.components}
                  onChange={handleJutsuFormChange("components")}
                  placeholder="HS, CM, etc..."/>
              </label>
              <label className="jutsu-modal-field">
                <span>Keywords</span>
                <input
                  type="text"
                  value={jutsuForm.keywords}
                  onChange={handleJutsuFormChange("keywords")}
                  placeholder="Ninjutsu, Fire, Buff..."/>
              </label>
              <label className="jutsu-modal-field">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={jutsuForm.description}
                  onChange={handleJutsuFormChange("description")}/>
              </label>
              <label className="jutsu-modal-field">
                <span>At Higher Levels (optional)</span>
                <textarea
                  rows={3}
                  value={jutsuForm.higherLevels}
                  onChange={handleJutsuFormChange("higherLevels")}/>
              </label>
              <div className="jutsu-modal-actions">
                <button
                  type="button"
                  className="jutsu-modal-cancel"
                  onClick={closeJutsuModal}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="jutsu-modal-save"
                  onClick={handleJutsuSubmit}>
                  Save Jutsu
                </button>
              </div>
            </div>
          </div>
        </div>        
        )}
       {isFeaturesModalOpen && (
        <div
          className="jutsu-modal-backdrop"
          onClick={closeFeaturesModal}>
          <div
            className="jutsu-modal"
            onClick={(event) => event.stopPropagation()}>
            <h3 className="jutsu-modal-title">Add Feature / Trait</h3>
            <div className="jutsu-modal-form">
              <label className="jutsu-modal-field">
                <span>Name</span>
                <input
                  type="text"
                  value={featureForm.name}
                  onChange={handleFeatureFormChange("name")}
                  autoFocus/>
              </label>
              <label className="jutsu-modal-field">
                <span>Source</span>
                <input
                  type="text"
                  value={featureForm.source}
                  onChange={handleFeatureFormChange("source")}
                  placeholder="Clan, Background, Feat..."/>
              </label>
              <label className="jutsu-modal-field">
                <span>Source Detail</span>
                <input
                  type="text"
                  value={featureForm.sourceType}
                  onChange={handleFeatureFormChange("sourceType")}
                  placeholder="Genjutsu Specialist / Corrupt Thoughts / Lv 4"/>
              </label>
              <label className="jutsu-modal-field">
                <span>Description</span>
                <textarea
                  rows={4}
                  value={featureForm.description}
                  onChange={handleFeatureFormChange("description")}/>
              </label>
              <div className="jutsu-modal-actions">
                <button
                  type="button"
                  className="jutsu-modal-cancel"
                  onClick={closeFeaturesModal}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="jutsu-modal-save"
                  onClick={handleFeatureSubmit}>
                  Save Feature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
