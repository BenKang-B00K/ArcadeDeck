// ==========================================
// DATA DEFINITIONS (Ships, Upgrades, Buildings)
// ==========================================

        let ships = [];

        let artifactData = [];

        function getShipReq(baseReq) {
            return Math.max(0, Math.floor(baseReq / Math.pow(2, prestigeLevel)));
        }

        function getHangarCost(key) {
            const u = upgrades[key];
            const discount = 1 - (upgrades.market.lv * 0.05);

            // Global Dimension Rift Discount
            let globalDiscount = 1.0;
            if (upgrades.dimRift && upgrades.dimRift.lv > 0) globalDiscount -= (upgrades.dimRift.lv * 0.02);

            let cost = u.baseCost * Math.pow(u.mult, u.lv);

            // --- TIERED INFLATION (Hangar Balance) ---
            // Smoothed inflation for easier Level 30 Prestige access
            if (u.lv >= 25) {
                cost *= Math.pow(1.35, u.lv - 24) * Math.pow(1.2, 5) * Math.pow(1.1, 5) * Math.pow(1.05, 5) * Math.pow(1.02, 5);
            } else if (u.lv >= 20) {
                cost *= Math.pow(1.2, u.lv - 19) * Math.pow(1.1, 5) * Math.pow(1.05, 5) * Math.pow(1.02, 5);
            } else if (u.lv >= 15) {
                cost *= Math.pow(1.1, u.lv - 14) * Math.pow(1.05, 5) * Math.pow(1.02, 5);
            } else if (u.lv >= 10) {
                cost *= Math.pow(1.05, u.lv - 9) * Math.pow(1.02, 5);
            } else if (u.lv >= 5) {
                cost *= Math.pow(1.02, u.lv - 4);
            }

            cost *= getArtifactBonus('cost_hangar').mult;
            return Math.floor(cost * discount * globalDiscount);
            }

            function getEngCost(key) {
            const u = upgrades[key];

            // Global Dimension Rift Discount
            let globalDiscount = 1.0;
            if (upgrades.dimRift && upgrades.dimRift.lv > 0) globalDiscount -= (upgrades.dimRift.lv * 0.02);

            let cost;
            if (key === 'planetScan') cost = 5 + (u.lv * 2);
            else if (key === 'clickSurge') cost = 5 + (u.lv * 3);
            else if (key === 'critChance') cost = 10 + (u.lv * 5);
            else if (key === 'droneFreq') cost = 8 + (u.lv * 4);
            else cost = Math.floor(u.baseCost * Math.pow(u.mult, u.lv));

            cost *= getArtifactBonus('eng_bay_cost').mult;
            return Math.floor(cost * globalDiscount);
            }

        let upgrades = {
            // HANGAR: Core DPS & Auto-scaling (Consolidated to 5)
            click: { lv: 1, baseCost: 150, mult: 2.1 },
            auto: { lv: 0, baseCost: 100, mult: 2.2 },
            autoSpeed: { lv: 0, baseCost: 500, mult: 1.8, maxLv: 30 },
            autoPower: { lv: 0, baseCost: 150, mult: 1.75 },
            shipReinforce: { lv: 0, baseCost: 50, mult: 1.4 },
            
            // PINE LAB: Efficiency (5 Items)
            pinePower: { lv: 0, baseCost: 10, mult: 1.5 },
            market: { lv: 0, baseCost: 25, mult: 1.9, maxLv: 15 }, // Max 75% discount
            clickMastery: { lv: 0, baseCost: 50, mult: 2.1 },
            pineChance: { lv: 0, baseCost: 30, mult: 1.65, maxLv: 25 },
            luckyCharm: { lv: 0, baseCost: 20, mult: 1.85, maxLv: 15 },
            
            // ENG BAY: Utility (5 Items)
            critChance: { lv: 0, baseCost: 5, maxLv: 100 }, // Max 50% from Eng
            droneFreq: { lv: 0, baseCost: 4, maxLv: 100 },
            planetScan: { lv: 0, baseCost: 2, maxLv: 100 },
            clickSurge: { lv: 0, baseCost: 2, maxLv: 50 },
            rapidCon: { lv: 0, baseCost: 10, mult: 1.55, maxLv: 30 },
            
            // BLACK MARKET: Endgame
            darkFlow: { lv: 0, baseCost: 10, mult: 1.45 },
            antimatter: { lv: 0, baseCost: 25, mult: 1.55 },
            hyperDrive: { lv: 0, baseCost: 100, mult: 1.8 },
            starForge: { lv: 0, baseCost: 250, mult: 1.95 },
            dimRift: { lv: 0, baseCost: 500, mult: 2.2 }
        };

        const buildingData = {
            greenhouse: { name: "Pine Greenhouse", type: "pines", icon: "🌿", baseCost: 50, costMult: 1.5, baseProd: 5, baseTime: 10000, prodMult: 1.2 },
            factory: { name: "Gear Factory", type: "gears", icon: "🏭", baseCost: 3, costMult: 1.5, baseProd: 0.5, baseTime: 25000, prodMult: 1.0 },
            biodome: { name: "Bio-Dome", type: "pines", icon: "🧪", baseCost: 250, costMult: 1.6, baseProd: 25, baseTime: 40000, prodMult: 1.2 },
            darklab: { name: "Dark Lab", type: "dark", icon: "🔮", baseCost: 15, costMult: 1.8, baseProd: 0.1, baseTime: 60000, prodMult: 1.0 }
        };

        let buildings = {
            greenhouse: { lv: 0, finishTime: 0 },
            factory: { lv: 0, finishTime: 0 },
            biodome: { lv: 0, finishTime: 0 },
            darklab: { lv: 0, finishTime: 0 }
        };