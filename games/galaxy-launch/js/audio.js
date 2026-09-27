
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playSfx(freq, type='sine', dur=0.1, vol=0.1) {
            if (isMuted) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + dur);
        }

        let lastImpactTime = 0;
        function playImpactSfx(isCrit = false, isAuto = false) {
            if (isMuted) return;
            const now = audioCtx.currentTime;
            
            // Throttle: Max 20 sounds per second to avoid noise fatigue
            if (now - lastImpactTime < 0.05) return;
            lastImpactTime = now;

            const t = now;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = isCrit ? 'square' : 'sine';
            osc.frequency.setValueAtTime(isCrit ? 150 : 200, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
            
            // Lower volume for auto-attacks
            let vol = isCrit ? 0.2 : 0.1;
            if (isAuto) vol *= 0.3; // Much quieter for high-frequency auto attacks

            gain.gain.setValueAtTime(vol, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.1);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.1);
        }

        function playUfoSfx() {
            if (isMuted) return;
            const t = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            const gain = audioCtx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.exponentialRampToValueAtTime(1200, t + 2);
            
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(10, t);
            lfoGain.gain.setValueAtTime(100, t);
            
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.05, t + 0.5);
            gain.gain.linearRampToValueAtTime(0, t + 4);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            lfo.start(t);
            osc.start(t);
            lfo.stop(t + 4);
            osc.stop(t + 4);
        }

        function playRelicUfoSfx() {
            if (isMuted) return;
            const t = audioCtx.currentTime;
            const gain = audioCtx.createGain();
            gain.connect(audioCtx.destination);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 3);

            for(let i=0; i<5; i++) {
                const osc = audioCtx.createOscillator();
                const startTime = t + i * 0.5;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1500 - (i*200), startTime);
                osc.frequency.linearRampToValueAtTime(2000, startTime + 0.1);
                osc.connect(gain);
                osc.start(startTime);
                osc.stop(startTime + 0.15);
            }
        }

        function playRobotSfx() {
            if (isMuted) return;
            const t = audioCtx.currentTime;
            for(let i=0; i<3; i++) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                const startTime = t + i * 0.2;
                
                osc.type = 'square';
                osc.frequency.setValueAtTime(800 + i * 200, startTime);
                osc.frequency.exponentialRampToValueAtTime(400, startTime + 0.1);
                
                gain.gain.setValueAtTime(0.05, startTime);
                gain.gain.linearRampToValueAtTime(0, startTime + 0.1);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.1);
            }
        }

        function playPlanetExplosionSfx() {
            if (isMuted) return;
            const t = audioCtx.currentTime;

            // 1. Deep Rumble
            const rumble = audioCtx.createOscillator();
            const rumbleGain = audioCtx.createGain();
            rumble.type = 'sine';
            rumble.frequency.setValueAtTime(100, t);
            rumble.frequency.exponentialRampToValueAtTime(30, t + 1.5);
            rumbleGain.gain.setValueAtTime(0.4, t);
            rumbleGain.gain.linearRampToValueAtTime(0, t + 1.5);
            rumble.connect(rumbleGain);
            rumbleGain.connect(audioCtx.destination);
            rumble.start(t);
            rumble.stop(t + 1.5);

            // 2. Sharp Blast
            const blast = audioCtx.createOscillator();
            const blastGain = audioCtx.createGain();
            blast.type = 'sawtooth';
            blast.frequency.setValueAtTime(200, t);
            blast.frequency.exponentialRampToValueAtTime(50, t + 0.5);
            blastGain.gain.setValueAtTime(0.3, t);
            blastGain.gain.linearRampToValueAtTime(0, t + 0.5);
            blast.connect(blastGain);
            blastGain.connect(audioCtx.destination);
            blast.start(t);
            blast.stop(t + 0.5);

            // 3. Shattering Debris (Random high tones)
            for(let i=0; i<5; i++) {
                const debris = audioCtx.createOscillator();
                const dGain = audioCtx.createGain();
                const dt = t + Math.random() * 0.3;
                debris.type = 'triangle';
                debris.frequency.setValueAtTime(1000 + Math.random() * 2000, dt);
                debris.frequency.exponentialRampToValueAtTime(100, dt + 0.2);
                dGain.gain.setValueAtTime(0.1, dt);
                dGain.gain.linearRampToValueAtTime(0, dt + 0.2);
                debris.connect(dGain);
                dGain.connect(audioCtx.destination);
                debris.start(dt);
                debris.stop(dt + 0.2);
            }
        }

        function playMiniBossExplosionSfx() {
            if (isMuted) return;
            const t = audioCtx.currentTime;
            
            // Electric Distortion
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.linearRampToValueAtTime(100, t + 0.4);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(t + 0.4);

            // Sharp Crackle
            for(let i=0; i<3; i++) {
                const crackle = audioCtx.createOscillator();
                const cGain = audioCtx.createGain();
                const ct = t + i * 0.1;
                crackle.type = 'sawtooth';
                crackle.frequency.setValueAtTime(2000, ct);
                crackle.frequency.linearRampToValueAtTime(500, ct + 0.05);
                cGain.gain.setValueAtTime(0.1, ct);
                cGain.gain.linearRampToValueAtTime(0, ct + 0.05);
                crackle.connect(cGain); cGain.connect(audioCtx.destination);
                crackle.start(ct); crackle.stop(ct + 0.05);
            }
        }

        function playPanelSfx(isOpening = true) {
            if (isMuted) return;
            const t = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            if (isOpening) {
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
            } else {
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);
            }
            
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.15);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.15);
        }

        function playDrinkSfx() {
            if (isMuted) return;
            const t = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
            
            gain.gain.setValueAtTime(0.5, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.15);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.15);
        }

        function toggleMute() {
            isMuted = !isMuted;
            const btn = document.getElementById('mute-btn');
            if (btn) {
                btn.innerText = isMuted ? "SOUND: OFF" : "SOUND: ON";
                btn.classList.toggle('active', isMuted);
                if (typeof createControlPulseVFX === 'function') createControlPulseVFX('mute-btn');
            }
            if (audioCtx.state === 'suspended') audioCtx.resume();
        }
        
        