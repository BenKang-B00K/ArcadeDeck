/* js/logger.js - Responsive QA Logging System with Abyss Aesthetic */

const GameLogger = {
    logs: [],
    maxLogs: 50,
    isEnabled: false,
    isUIVisible: false,

    init() {
        console.log("GameLogger Initialized. Press '`' to toggle QA Console.");
        this.createLogUI();
        
        // Intercept global errors
        window.onerror = (msg, url, line, col, error) => {
            this.error(`[Global Error] ${msg} at ${line}:${col}`);
            return false; 
        };

        // Intercept async promise rejections
        window.onunhandledrejection = (event) => {
            this.error(`[Async Error] ${event.reason}`);
        };
    },

    log(message, type = 'info') {
        if (!this.isEnabled) return;

        const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const logEntry = { timestamp, message, type };
        
        this.logs.unshift(logEntry);
        if (this.logs.length > this.maxLogs) this.logs.pop();

        // Console output
        const styles = {
            info: 'color: #00e5ff',
            warn: 'color: #ffa500',
            error: 'color: #ff1744; font-weight: bold',
            debug: 'color: #9400d3',
            success: 'color: #00ff00'
        };
        console.log(`%c[${timestamp}] [${type.toUpperCase()}] ${message}`, styles[type] || '');

        this.updateLogUI();
    },

    info(msg) { this.log(msg, 'info'); },
    warn(msg) { this.log(msg, 'warn'); },
    error(msg) { this.log(msg, 'error'); },
    debug(msg) { this.log(msg, 'debug'); },
    success(msg) { this.log(msg, 'success'); },

    createLogUI() {
        const container = document.createElement('div');
        container.id = 'qa-log-console';
        container.style.cssText = `
            position: fixed; top: 2%; right: 2%; width: 85%; max-width: 320px; height: 35%;
            background: linear-gradient(145deg, rgba(10, 10, 10, 0.95), rgba(0, 0, 0, 0.98));
            color: #fff; font-family: 'Courier New', monospace;
            font-size: clamp(9px, 1.6vw, 11px); z-index: 9999; 
            border: 1px solid #ff4500; border-radius: 4px;
            display: none; flex-direction: column; overflow: hidden; pointer-events: auto;
            box-shadow: 0 0 40px rgba(0,0,0,0.9), inset 0 0 10px rgba(255, 69, 0, 0.1);
            backdrop-filter: blur(10px);
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            padding: 8px 12px; background: rgba(30, 30, 30, 0.8); border-bottom: 1px solid #ff450044;
            display: flex; justify-content: space-between; align-items: center;
            font-weight: bold; color: #ff4500; cursor: grab; user-select: none;
            font-family: 'Cinzel', serif; letter-spacing: 1px; font-size: 10px;
        `;
        header.innerHTML = `
            <span>ABYSS QA LOGS</span>
            <div style="display:flex; gap:10px; align-items:center;">
                <button id="clear-qa-btn" style="background:none; border:1px solid #444; color:#888; cursor:pointer; font-size:8px; padding:2px 5px; border-radius:2px;">CLEAR</button>
                <button id="close-qa-btn" style="background:none; border:none; color:#ff1744; cursor:pointer; font-weight:bold; font-size:16px;">×</button>
            </div>
        `;
        
        const contentDiv = document.createElement('div');
        contentDiv.id = 'qa-log-content';
        contentDiv.style.cssText = `flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 4px; scrollbar-width: thin;`;

        container.appendChild(header);
        container.appendChild(contentDiv);
        document.body.appendChild(container);

        header.querySelector('#close-qa-btn').onclick = (e) => { e.stopPropagation(); this.toggleUI(); };
        header.querySelector('#clear-qa-btn').onclick = (e) => { e.stopPropagation(); this.logs = []; this.updateLogUI(); };

        // Keyboard Shortcut: ` (Backtick)
        window.addEventListener('keydown', (e) => {
            if (e.key === '`') this.toggleUI();
        });

        // Drag logic
        let isDragging = false;
        let offset = { x: 0, y: 0 };
        header.onmousedown = (e) => {
            isDragging = true;
            offset.x = e.clientX - container.offsetLeft;
            offset.y = e.clientY - container.offsetTop;
            header.style.cursor = 'grabbing';
        };
        window.onmousemove = (e) => {
            if (isDragging) {
                container.style.left = (e.clientX - offset.x) + 'px';
                container.style.top = (e.clientY - offset.y) + 'px';
                container.style.right = 'auto';
            }
        };
        window.onmouseup = () => { isDragging = false; header.style.cursor = 'grab'; };
    },

    toggleUI() {
        this.isUIVisible = !this.isUIVisible;
        const el = document.getElementById('qa-log-console');
        if (el) {
            el.style.display = this.isUIVisible ? 'flex' : 'none';
            if (this.isUIVisible) this.updateLogUI();
        }
    },

    updateLogUI() {
        const content = document.getElementById('qa-log-content');
        if (!content || !this.isUIVisible) return;

        if (this.logs.length === 0) {
            content.innerHTML = `<div style="color:#444; font-style:italic; text-align:center; margin-top:20px;">No logs recorded...</div>`;
            return;
        }

        content.innerHTML = this.logs.map(log => {
            let color = '#00e5ff';
            if (log.type === 'error') color = '#ff1744';
            if (log.type === 'warn') color = '#ffa500';
            if (log.type === 'success') color = '#00ff00';
            if (log.type === 'debug') color = '#9400d3';
            return `<div style="border-bottom: 1px solid #1a1a1a; padding-bottom: 3px; line-height: 1.3; font-size: 0.95em;">
                <span style="color:#555; font-size:0.85em; font-family:monospace;">[${log.timestamp}]</span> 
                <span style="color:${color};">${log.message}</span>
            </div>`;
        }).join('');
        content.scrollTop = 0;
    }
};

// Global Export
window.GameLogger = GameLogger;
// document.addEventListener('DOMContentLoaded', () => GameLogger.init());
