
        const GAME_VERSION = "1.6";
        let stardust = 0, grossStardust = 0, grossClickDamage = 0, totalClicks = 0, totalPines = 0, gears = 0, darkMatter = 0, totalDronesDestroyed = 0, totalUfosDestroyed = 0;
        let hp = 5000, maxHp = 5000, planetLevel = 1;
        let currentShipIdx = 0;
        let prestigeLevel = 0;
        let acquiredArtifacts = [];
        let isLevelingUp = false;
        let bonusType = 0;
        let machineReward75 = false;
        let machineReward50 = false;
        let isMuted = false;
        let lastUnlockCount = 0;
        let tempPineBoost = false;
        let ufoDamageMultiplier = 1;
        let colonyInterval = null;
        let repairDroneInterval = null;
        let universeName = "UNIVERSE-1";

        // Combo & Fever Mode
        let comboCount = 0;
        let lastClickTime = 0;
        let feverModeActive = false;
        let feverEndTime = 0;

        // Boss Mechanics
        let bossTimer = 0;
        let bossTimeLimit = 60; // 60 seconds
        let isBossFight = false;
        let isMiniBossFight = false;
        let bossTimerInterval = null;
        let bossShieldActive = false;
        let bossEmpActive = false;
        let bossShieldEnd = 0;
        let bossEmpEnd = 0;
        let bossAbilityUsed80 = false;
        let bossAbilityUsed40 = false;

        // Specialized Event States
        let mothershipHp = 0;
        let isShieldDroneActive = false;
        let isSaboteurActive = false;
        let isHackerActive = false;
        let isColonizerActive = false;
        let isNullifierActive = false;
        let leechRate = 0;
        let pinesLeechRate = 0;
        let gearsLeechRate = 0;
        let dmLeechRate = 0;

        // Redefined Event Multipliers
        let eventDmgMult = 1;
        let eventClickMult = 1;
        let eventAutoSpeedMult = 1;
        let eventCritFull = false;
        
        let potions = { neon: 0, green: 0, gray: 0, dark: 0 };
        let activePotions = { neon: 0, green: 0, gray: 0, dark: 0 };
        let activeEvents = {}; // Track event buffs (Supernova, Click Frenzy, etc)
        let potionLoopId = null;

        let autoHangarTimer = null;
        let isAutoUpgradeActive = false;
        let fleetScale = 1.0;
        let stardustHistory = [];
        let clickDpsHistory = [];
        let activeDronePIXI = null;

        