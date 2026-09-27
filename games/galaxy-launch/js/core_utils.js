
        function formatNumber(num) {
            if (num < 1000) return Math.floor(num).toString();
            const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
            const suffixNum = Math.floor(("" + Math.floor(num)).length / 3);
            let shortValue = parseFloat((suffixNum != 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(3));
            if (shortValue % 1 != 0) {
                shortValue = shortValue.toFixed(1);
            }
            return shortValue + suffixes[suffixNum];
        }

        /**
         * Resolves a color string (hex, name, or CSS var) to a hex string for PIXI.
         */
        function resolveColor(colorStr) {
            if (!colorStr) return "#ffffff";
            if (colorStr.startsWith("var(--")) {
                const varName = colorStr.replace("var(", "").replace(")", "");
                const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
                return resolved || "#ffffff";
            }
            return colorStr;
        }

        setInterval(trackStardustRate, 1000);
        setInterval(trackClickDPS, 1000);
        setInterval(() => {
            if (typeof autoUpgradeActiveTab === 'function') autoUpgradeActiveTab();
        }, 100);

        function trackStardustRate() {
            const now = Date.now();
            stardustHistory.push({ time: now, amount: grossStardust });

            const tenSecondsAgo = now - 10000;
            stardustHistory = stardustHistory.filter(entry => entry.time >= tenSecondsAgo);

            if (stardustHistory.length < 2) {
                document.getElementById('stardust-rate').innerText = "0";
                return;
            }

            const oldest = stardustHistory[0];
            const newest = stardustHistory[stardustHistory.length - 1];
            const rate = (newest.amount - oldest.amount) / ((newest.time - oldest.time) / 1000);
            document.getElementById('stardust-rate').innerText = formatNumber(Math.max(0, rate));
        }

        function trackClickDPS() {
            const now = Date.now();
            clickDpsHistory.push({ time: now, amount: grossClickDamage });

            const tenSecondsAgo = now - 10000;
            clickDpsHistory = clickDpsHistory.filter(entry => entry.time >= tenSecondsAgo);

            if (clickDpsHistory.length < 2) {
                document.getElementById('click-dps').innerText = "0";
                return;
            }

            const oldest = clickDpsHistory[0];
            const newest = clickDpsHistory[clickDpsHistory.length - 1];
            const rate = (newest.amount - oldest.amount) / ((newest.time - oldest.time) / 1000);
            document.getElementById('click-dps').innerText = formatNumber(Math.max(0, rate));
        }

        function getAutoInterval() {
            const lv = upgrades.auto ? upgrades.auto.lv : 0;
            let baseInterval = Math.max(100, 1000 - (Math.max(1, lv) - 1) * 50);

            if (upgrades.autoSpeed && upgrades.autoSpeed.lv > 0) {
                let speedMult = 1 + (upgrades.autoSpeed.lv * 0.05);
                baseInterval = baseInterval / speedMult;
            }
            if (upgrades.darkFlow && upgrades.darkFlow.lv > 0) {
                baseInterval = baseInterval / (1 + upgrades.darkFlow.lv * 0.05);
            }
            
            // Artifact Multipliers (auto_speed, all_speed, all_mult)
            baseInterval = baseInterval / getArtifactBonus('auto_speed').mult;

            // Tactical Stimulant: Neon Overdrive
            if (Date.now() < activePotions.neon) baseInterval = baseInterval / 1.25;
            
            // Event Buff: Overclock & Redefined Multipliers
            if (eventAutoSpeedMult > 1) baseInterval = baseInterval / eventAutoSpeedMult;
            
            if (typeof activeEvents !== 'undefined' && activeEvents.overclock && Date.now() < activeEvents.overclock.endTime) {
                baseInterval = baseInterval / 2.0; // Legacy support or stack
            }
            
            return Math.max(30, baseInterval);
        }
        function startAutoHangar() {
            if (autoHangarTimer) clearInterval(autoHangarTimer);
            
            // Should start if we have at least 1 level in basic auto or overclock
            const hasAuto = upgrades.auto && upgrades.auto.lv > 0;
            const hasOverclock = upgrades.autoPower && upgrades.autoPower.lv > 0;
            
            if (!hasAuto && !hasOverclock) return;

            const interval = getAutoInterval();

            autoHangarTimer = setInterval(() => {
                if (typeof launchShips === 'function') {
                    launchShips(null, true);
                }
            }, interval);
        }

        function reportScore() {
            if (window.parent) {
                window.parent.postMessage({
                    type: 'GAME_SCORE',
                    score: typeof prestigeLevel !== 'undefined' ? prestigeLevel : 0,
                    subScore: typeof planetLevel !== 'undefined' ? planetLevel : 1
                }, '*');
            }
        }

        /**
         * Creates a standardized HP bar for entities (UFOs, Drones).
         */
        function createHpBar(container, width = 60, height = 5) {
            if (typeof PIXI === 'undefined') return null;
            
            const barContainer = new PIXI.Container();
            const bg = new PIXI.Graphics();
            const fill = new PIXI.Graphics();
            
            bg.beginFill(0x000000, 0.5);
            bg.drawRect(-width/2, 0, width, height);
            bg.endFill();
            
            fill.beginFill(0x00f2fe);
            fill.drawRect(-width/2, 0, width, height);
            fill.endFill();
            
            barContainer.addChild(bg);
            barContainer.addChild(fill);
            barContainer.y = -height - 40; // Position above the entity
            
            container.addChild(barContainer);
            container.hpBarFill = fill;
            container.hpBarWidth = width;
            container.hpBarHeight = height;
            
            return barContainer;
        }

        /**
         * Updates the HP bar fill based on current and max HP.
         */
        function updateHpBar(container, currentHp, maxHp, color = 0x00f2fe) {
            if (!container.hpBarFill) return;
            
            const pct = Math.max(0, currentHp / maxHp);
            container.hpBarFill.clear();
            container.hpBarFill.beginFill(color);
            container.hpBarFill.drawRect(-container.hpBarWidth/2, 0, container.hpBarWidth * pct, container.hpBarHeight);
            container.hpBarFill.endFill();
            
            // Pulse on hit
            container.hpBarFill.scale.y = 1.5;
            setTimeout(() => { if(!container.destroyed) container.hpBarFill.scale.y = 1.0; }, 100);
        }
        