
        // ==========================================
        // ARTIFACT EFFECTS MAPPING
        // ==========================================
        const artifactEffects = {
            // Existing
            "art_stardust": { type: "stardust", mult: 0.40 },
            "art_ship_cost": { type: "cost_hangar", mult: -0.15 },
            "art_dmg": { type: "dmg", mult: 0.15 },
            "art_auto_speed": { type: "auto_speed", mult: 0.15 },
            "art_pine": { type: "pine_chance", mult: 0.30 },
            "art_gear": { type: "gear_flat", flat: 1 },
            "art_colony": { type: "colony_prod", mult: 0.20 },
            "art_dark": { type: "dark_matter", mult: 0.25 },
            "art_crit": { type: "crit_chance", mult: 0.10 },
            "art_crit_dmg": { type: "crit_dmg", mult: 1.0 },
            "art_drone": { type: "drone_freq", mult: -0.20 },
            "art_scan": { type: "scan_chance", mult: 0.15 },
            "art_surge": { type: "surge_chance", mult: 0.15 },
            "art_market": { type: "market_disc", mult: -0.25 },
            "art_recycler": { type: "pine_lab_cost", mult: -0.15 },
            "art_chip": { type: "eng_bay_cost", mult: -0.15 },
            "art_blackbox": { type: "black_market_cost", mult: -0.30 },
            "art_ufo": { type: "ufo_rate", mult: 0.20 },
            "art_drill": { type: "miner_prod", mult: 0.30 },
            "art_omni": { type: "dmg", mult: 0.15 },
            "art_nebula_fuel": { type: "proj_speed", mult: 0.25 },
            "art_solar_panel": { type: "click_dmg", mult: 0.40 },
            "art_comet_tail": { type: "crit_chance", mult: 0.05 },
            "art_void_core": { type: "dark_matter", mult: 0.35 },
            "art_shield_gen": { type: "planet_hp", mult: -0.15 },
            "art_omega_core": { type: "dmg", mult: 0.50 },
            "art_time_warp": { type: "colony_time", mult: -0.50 },
            "art_black_hole": { type: "boss_hp", mult: -0.30 },
            "art_supernova": { type: "crit_dmg", mult: 2.0 },
            "art_god_finger": { type: "click_dmg", mult: 1.0 },
            "art_warp_drive": { type: "auto_speed", mult: 0.30 },
            "art_nano_armor": { type: "emp_dur", mult: -0.50 },
            "art_pulse_laser": { type: "laser_dmg", mult: 0.20 },
            "art_fusion_cell": { type: "buff_dur", flat: 5 },
            "art_gravity_anchor": { type: "ufo_speed", mult: -0.20 },
            "art_crystal_skull": { type: "wraith_rate", mult: 0.50 },
            "art_emerald_leaf": { type: "colony_pine", mult: 0.40 },
            "art_infinity_gear": { type: "gear_mult", mult: 1.0 },
            "art_star_dust_bag": { type: "offline_gain", mult: 1.0 },
            "art_radar_array": { type: "bonus_chance", mult: 0.25 },
            "art_phoenix_feather": { type: "prestige_bonus", mult: 0.20 },
            "art_frozen_flame": { type: "fever_dur", flat: 3 },
            "art_plasma_shield": { type: "drone_hp", mult: -0.50 },
            "art_neural_link": { type: "click_dmg_hangar", mult: 0.01 },
            "art_golden_touch": { type: "golden_ufo_mult", mult: 1.0 },
            "art_void_battery": { type: "dark_lab_prod", mult: 0.50 },
            "art_obsidian_shard": { type: "crit_mult", flat: 0.5 },
            "art_solar_flare": { type: "dmg", mult: 0.30 },
            "art_quantum_clock": { type: "colony_build_speed", mult: 0.40 },
            "art_eye_of_god": { type: "all_mult", mult: 0.05 },

            // New Common
            "art_com_1": { type: "auto_speed", mult: 0.10 },
            "art_com_2": { type: "click_dmg", mult: 0.20 },
            "art_com_3": { type: "stardust", mult: 0.15 },
            "art_com_4": { type: "ufo_rate", mult: 0.05 },
            "art_com_5": { type: "cost_all", mult: -0.05 },
            "art_com_6": { type: "dmg", mult: 0.08 },
            "art_com_7": { type: "scan_chance", mult: 0.10 },
            "art_com_8": { type: "auto_speed", mult: 0.12 },

            // New Rare
            "art_rare_1": { type: "night_dmg", mult: 0.50 },
            "art_rare_2": { type: "gear_mult", mult: 1.0 },
            "art_rare_3": { type: "pickup_range", mult: 1.0 },
            "art_rare_4": { type: "auto_speed", mult: 0.40 },
            "art_rare_5": { type: "new_planet_bonus", mult: 0.25 },
            "art_rare_6": { type: "skill_cd", mult: -0.20 },
            "art_rare_7": { type: "crit_chance", mult: 0.15 },
            "art_rare_8": { type: "planet_hp", mult: -0.20 },

            // New Legendary
            "art_leg_1": { type: "dmg", mult: 1.0 },
            "art_leg_2": { type: "skill_dur", mult: 1.0 },
            "art_leg_3": { type: "auto_speed", mult: 1.0 },
            "art_leg_4": { type: "stardust", mult: 2.0 },
            "art_leg_5": { type: "all_speed", mult: 0.25 },
            "art_leg_6": { type: "skill_no_cd", flat: 1 },
            "art_leg_7": { type: "boss_dmg_taken", mult: -0.50 },
            "art_leg_8": { type: "planet_hp", mult: -0.50 },
            "art_leg_9": { type: "crit_dmg", mult: 5.0 },
            "art_leg_10": { type: "click_dmg", mult: 4.0 },
            "art_leg_11": { type: "all_mult", mult: 0.20 }
        };

        /**
         * Calculates the total bonus for a specific effect type.
         * For 'mult', it sums up 1 + sum(bonus). For 'flat', it sums up values.
         */
        function getArtifactBonus(type) {
            let mult = 1.0;
            let flat = 0;
            
            acquiredArtifacts.forEach(id => {
                const effect = artifactEffects[id];
                if (effect && effect.type === type) {
                    if (effect.mult !== undefined) mult += effect.mult;
                    if (effect.flat !== undefined) flat += effect.flat;
                }
                // Handle "all_mult" which affects almost everything
                if (effect && effect.type === "all_mult") {
                    if (["dmg", "click_dmg", "stardust", "auto_speed", "colony_prod"].includes(type)) {
                        mult += effect.mult;
                    }
                }
                // Handle "all_speed"
                if (effect && effect.type === "all_speed") {
                    if (["auto_speed", "colony_prod", "colony_build_speed"].includes(type)) {
                        mult += effect.mult;
                    }
                }
                // Handle "night_dmg"
                if (effect && effect.type === "night_dmg" && type === "dmg" && isNightTime()) {
                    mult += effect.mult;
                }
                // Handle generic "cost_all"
                if (effect && effect.type === "cost_all" && type.startsWith("cost_")) {
                    mult += effect.mult;
                }
            });

            // --- SAFETY CLAMP ---
            // Prevent HP or Cost from becoming 0 or negative
            if (["planet_hp", "boss_hp", "cost_hangar", "eng_bay_cost", "pine_lab_cost", "black_market_cost", "ufo_speed", "colony_time", "emp_dur", "drone_hp", "boss_dmg_taken"].includes(type)) {
                mult = Math.max(0.1, mult); // Minimum 10% of base value
            } else if (type.startsWith("cost_")) {
                mult = Math.max(0.05, mult); // Minimum 5% for costs
            } else {
                mult = Math.max(0.01, mult); // General safety floor
            }

            return { mult, flat };
        }

        function isNightTime() {
            const hour = new Date().getHours();
            return hour >= 18 || hour < 6; // 6 PM to 6 AM
        }

        function gainRandomArtifact(source = 'normal') {
            if (!artifactData || artifactData.length === 0) return;

            let targetRarity = "Common";
            const rand = Math.random() * 100;

            if (source === 'prestige') {
                targetRarity = (Math.random() < 0.10) ? "Legendary" : "Rare";
            } else if (source === 'boss') {
                if (rand < 10) targetRarity = "Legendary";
                else if (rand < 35) targetRarity = "Rare";
                else targetRarity = "Common";
            } else if (source === 'miniboss') {
                if (rand < 5) targetRarity = "Legendary";
                else if (rand < 25) targetRarity = "Rare";
                else targetRarity = "Common";
            } else {
                if (rand < 1) targetRarity = "Legendary";
                else if (rand < 10) targetRarity = "Rare";
                else targetRarity = "Common";
            }

            const possibleItems = artifactData.filter(a => a.rarity === targetRarity);
            if (possibleItems.length === 0) return;

            const newArt = possibleItems[Math.floor(Math.random() * possibleItems.length)];
            acquiredArtifacts.push(newArt.id);

            setTimeout(() => {
                showArtifactOverlay(newArt);
                const codex = document.getElementById('artifact-codex');
                if (codex && codex.style.display === 'flex') renderArtifactCodex();
            }, 1500);
        }

        function showArtifactOverlay(data) {
            const rarityColors = {
                "Common": "#aaa",
                "Rare": "var(--neon)",
                "Legendary": "var(--gold)"
            };
            const color = rarityColors[data.rarity] || 'var(--gold)';

            const overlay = document.createElement('div');
            overlay.className = 'artifact-discovery-overlay';
            overlay.style.borderColor = color;
            overlay.innerHTML = `
                <div class="discovery-content" style="box-shadow: 0 0 50px ${color}44;">
                    <div class="discovery-glow" style="background: radial-gradient(circle, ${color}22 0%, transparent 70%);"></div>
                    <div class="discovery-title" style="color:${color}; text-shadow: 0 0 10px ${color};">ARTIFACT DISCOVERED</div>
                    <div class="discovery-rarity" style="font-size:10px; color:${color}; margin-top:-10px; letter-spacing:3px;">${data.rarity.toUpperCase()}</div>
                    <div class="discovery-icon" style="filter: drop-shadow(0 0 15px ${color});">${data.icon}</div>
                    <div class="discovery-name" style="color:white;">${data.name}</div>
                    <div class="discovery-desc">${data.desc}</div>
                    <button class="discovery-close" onclick="this.parentElement.parentElement.remove()" style="border-color:${color}; color:${color};">[ ACKNOWLEDGE ]</button>
                </div>
            `;
            document.body.appendChild(overlay);
            if (typeof playSfx === 'function') {
                if (data.rarity === 'Legendary') playSfx(1200, 'triangle', 1.0);
                else playSfx(800, 'sine', 0.5);
            }
        }

        function hasArtifact(id) {
            return acquiredArtifacts.filter(a => a === id).length;
        }

        // ==========================================
        // ARTIFACT CODEX (Holographic UI)
        // ==========================================

        function toggleArtifactCodex() {
            const codex = document.getElementById('artifact-codex');
            if (!codex) return;
            
            const isOpening = codex.style.display === 'none';
            codex.style.display = isOpening ? 'flex' : 'none';
            
            if (isOpening) {
                renderArtifactCodex();
                if (typeof playSfx === 'function') playSfx(800, 'sine', 0.5);
            } else {
                if (typeof playSfx === 'function') playSfx(400, 'sine', 0.3);
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const codex = document.getElementById('artifact-codex');
                if (codex && codex.style.display === 'flex') {
                    toggleArtifactCodex();
                }
            }
        });

        function renderArtifactCodex() {
            const grid = document.getElementById('codex-grid');
            if (!grid) return;
            grid.innerHTML = '';

            if (!artifactData || artifactData.length === 0) {
                grid.innerHTML = '<div style="color:#555; text-align:center; padding:20px;">LOADING ARTIFACT DATABASE...</div>';
                return;
            }

            const counts = {};
            acquiredArtifacts.forEach(id => { counts[id] = (counts[id] || 0) + 1; });

            const rarities = ["Common", "Rare", "Legendary"];
            
            rarities.forEach(rarity => {
                const section = document.createElement('div');
                section.className = 'rarity-section';
                
                const header = document.createElement('div');
                header.className = `rarity-header ${rarity}`;
                header.innerText = `${rarity.toUpperCase()} ARTIFACTS`;
                section.appendChild(header);
                
                const subgrid = document.createElement('div');
                subgrid.className = 'artifacts-subgrid';
                
                const rarityItems = artifactData.filter(d => d.rarity === rarity);
                
                rarityItems.forEach(data => {
                    const count = counts[data.id] || 0;
                    const isUnlocked = count > 0;
                    
                    const item = document.createElement('div');
                    item.className = `codex-item ${rarity} ${isUnlocked ? '' : 'locked'}`;
                    item.innerHTML = `
                        <div class="codex-icon">${isUnlocked ? data.icon : '?'}</div>
                        ${isUnlocked ? `<div class="codex-item-count">x${count}</div>` : ''}
                    `;
                    
                    // Events for both hover and touch/click
                    item.onmouseenter = () => showArtifactDetails(data, count);
                    item.onclick = (e) => {
                        e.stopPropagation();
                        showArtifactDetails(data, count);
                    };
                    subgrid.appendChild(item);
                });
                
                section.appendChild(subgrid);
                grid.appendChild(section);
            });
            
            // Show default details for first unlocked artifact or generic
            if (acquiredArtifacts.length > 0) {
                const firstArt = artifactData.find(a => a.id === acquiredArtifacts[0]);
                if (firstArt) showArtifactDetails(firstArt, counts[firstArt.id]);
            }
        }

        function showArtifactDetails(data, count) {
            const nameEl = document.getElementById('detail-name');
            const descEl = document.getElementById('detail-desc');
            const iconEl = document.getElementById('detail-icon');
            const countEl = document.getElementById('detail-count');
            const sourceEl = document.getElementById('detail-source');
            const sourceList = document.getElementById('source-list');
            
            const rarityColors = {
                "Common": "#aaa",
                "Rare": "var(--neon)",
                "Legendary": "var(--gold)"
            };

            const sourceData = {
                "Common": [
                    { icon: "🌍", text: "Planet Destruction" },
                    { icon: "🛸", text: "Relic Hunter UFO" }
                ],
                "Rare": [
                    { icon: "👹", text: "Boss & Mini-Boss Planets" },
                    { icon: "🌟", text: "Universe Conquest" }
                ],
                "Legendary": [
                    { icon: "👹", text: "Boss & Mini-Boss Planets" },
                    { icon: "🌟", text: "Universe Conquest" }
                ]
            };

            if (count > 0) {
                nameEl.innerText = data.name;
                nameEl.style.color = rarityColors[data.rarity] || 'var(--gold)';
                descEl.innerText = data.desc;
                iconEl.innerText = data.icon;
                iconEl.style.filter = `drop-shadow(0 0 20px ${rarityColors[data.rarity] || 'var(--gold)'})`;
                countEl.innerText = `OWNED: ${count} | RARITY: ${data.rarity.toUpperCase()}`;
            } else {
                nameEl.innerText = 'UNKNOWN ARTIFACT';
                nameEl.style.color = '#555';
                descEl.innerText = 'This artifact has not yet been discovered. Continue exploring the universe to locate its signature.';
                iconEl.innerText = '?';
                iconEl.style.filter = 'none';
                countEl.innerText = 'STATUS: MISSING';
            }

            sourceEl.style.display = 'block';
            sourceList.innerHTML = '';
            (sourceData[data.rarity] || []).forEach(s => {
                const item = document.createElement('div');
                item.className = 'source-item';
                item.innerHTML = `<span>${s.icon}</span> <span>${s.text}</span>`;
                sourceList.appendChild(item);
            });
        }

        function toggleArtifacts() {
            toggleArtifactCodex();
        }
