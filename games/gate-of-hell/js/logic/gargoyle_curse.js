/* gargoyle_curse.js - Perched Gargoyle: Stage-Escalating Global Curse System */

/**
 * Gargoyle evolution table.
 * Each entry represents one transformation phase with associated global debuffs.
 * Debuff values are NEGATIVE multipliers applied to all towers every frame.
 *   speed  → subtracted from t.speedBonus  (reduces attack speed)
 *   range  → subtracted from t.rangeBonus  (pixels, reduces attack range)
 *   damage → subtracted from t.damageBonus (reduces damage output)
 *   seGain → fraction deducted from kill rewards (reduces SE income)
 */
const GARGOYLE_FORMS = [
    {
        form: 0, minStage: 1, maxStage: 4,
        name: "잠든 석상", desc: "고요히 잠든 석상입니다. 아직 깨어나지 않았습니다.",
        color: "#999",
        debuffs: { speed: 0,     range: 0,  damage: 0,     seGain: 0     }
    },
    {
        form: 1, minStage: 5, maxStage: 9,
        name: "균열된 석상", desc: "균열이 생기기 시작했습니다. 무언가가 깨어나려 합니다.",
        color: "#bb9",
        debuffs: { speed: -0.03, range: 0,  damage: 0,     seGain: 0     }
    },
    {
        form: 2, minStage: 10, maxStage: 14,
        name: "눈뜬 가고일", desc: "눈을 떴습니다. 당신을 주시하고 있습니다.",
        color: "#c96",
        debuffs: { speed: -0.05, range: -15, damage: 0,     seGain: 0     }
    },
    {
        form: 3, minStage: 15, maxStage: 19,
        name: "경계하는 파수꾼", desc: "날개를 펼치기 시작했습니다. 경계 태세에 들어갔습니다.",
        color: "#e84",
        debuffs: { speed: -0.08, range: -20, damage: -0.05, seGain: 0     }
    },
    {
        form: 4, minStage: 20, maxStage: 29,
        name: "분노의 각성", desc: "완전히 각성했습니다. 분노의 불꽃이 눈에 타오릅니다.",
        color: "#f64",
        debuffs: { speed: -0.12, range: -25, damage: -0.08, seGain: -0.05 }
    },
    {
        form: 5, minStage: 30, maxStage: 39,
        name: "타락한 수호자", desc: "타락이 시작되었습니다. 어둠의 힘으로 가득 차 있습니다.",
        color: "#a4c",
        debuffs: { speed: -0.18, range: -35, damage: -0.12, seGain: -0.10 }
    },
    {
        form: 6, minStage: 40, maxStage: 49,
        name: "악마의 가고일", desc: "완전한 악마로 변신했습니다. 그 존재만으로 주변을 오염시킵니다.",
        color: "#c6f",
        debuffs: { speed: -0.24, range: -45, damage: -0.18, seGain: -0.15 }
    },
    {
        form: 7, minStage: 50, maxStage: Infinity,
        name: "타락신 강림", desc: "타락신이 강림했습니다. 모든 신성한 힘이 약화되고 있습니다.",
        color: "#fb0",
        debuffs: { speed: -0.30, range: -55, damage: -0.25, seGain: -0.20 }
    }
];

/** Returns the gargoyle form data matching the current stage, with translated name/desc. */
function getGargoyleForm() {
    const stage = window.stage || 1;
    let base = GARGOYLE_FORMS[0];
    for (let i = GARGOYLE_FORMS.length - 1; i >= 0; i--) {
        if (stage >= GARGOYLE_FORMS[i].minStage) { base = GARGOYLE_FORMS[i]; break; }
    }
    const T = window.t || ((k, f) => f);
    return Object.assign({}, base, {
        name: T(`ui.curse.form_${base.form}_name`, base.name),
        desc: T(`ui.curse.form_${base.form}_desc`, base.desc)
    });
}

/**
 * Returns [0-1] progress within the current form's stage range.
 * Used for smooth pixel-art transition effects.
 */
function getGargoyleFormProgress() {
    const stage = window.stage || 1;
    const form = getGargoyleForm();
    if (form.maxStage === Infinity) return 1.0;
    const span = form.maxStage - form.minStage + 1;
    return Math.min(1.0, (stage - form.minStage) / span);
}

/**
 * Applies the gargoyle curse debuffs to a single tower object.
 * Called from allies_core_loop.js once per tower per frame.
 */
function applyGargoyleCurse(tower) {
    if (!tower || tower.isShrine) return;
    const d = getGargoyleForm().debuffs;
    tower.speedBonus  += d.speed;   // negative → slower
    tower.rangeBonus  += d.range;   // negative → shorter range
    tower.damageBonus += d.damage;  // negative → less damage
}

/**
 * Returns the gargoyle SE penalty multiplier (0 = no penalty, -0.2 = 20% less).
 * Applied in enemies_combat.js at kill-reward time.
 */
function getGargoyleSEPenalty() {
    return getGargoyleForm().debuffs.seGain; // ≤ 0
}

window.GARGOYLE_FORMS      = GARGOYLE_FORMS;
window.getGargoyleForm     = getGargoyleForm;
window.getGargoyleFormProgress = getGargoyleFormProgress;
window.applyGargoyleCurse  = applyGargoyleCurse;
window.getGargoyleSEPenalty = getGargoyleSEPenalty;
