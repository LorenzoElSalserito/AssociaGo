/**
 * AssociaGo API Client
 *
 * Gestisce la comunicazione con il backend Java (Spring Boot).
 * Mappa completa dei Controller REST v1.
 *
 * @module associago
 */

// ========================================
// Configuration & Core
// ========================================

let API_BASE_URL = null;
let CURRENT_ASSOCIATION_ID = null;
const DEFAULT_PORT = 8080;

const STORAGE_KEY_AUTOLOGIN = 'associago_autologin_v1';
const STORAGE_KEY_ASSOCIATIONS = 'associago_associations_list';
const STORAGE_KEY_LANGUAGE = 'associago_language';

async function initializeApi() {
    if (API_BASE_URL) return API_BASE_URL;
    try {
        if (window.api && window.api.getBackendPort) {
            const port = await window.api.getBackendPort();
            if (port) {
                API_BASE_URL = `http://localhost:${port}/api`;
                return API_BASE_URL;
            }
        }
    } catch (e) { console.warn('[API] Config Electron non disponibile:', e); }

    const portsToTry = [8080, 45499, 3000];
    for (const port of portsToTry) {
        try {
            const testUrl = `http://localhost:${port}/actuator/health`;
            const response = await fetch(testUrl, { method: 'GET', signal: AbortSignal.timeout(1000) });
            if (response.ok) {
                API_BASE_URL = `http://localhost:${port}/api`;
                return API_BASE_URL;
            }
        } catch (e) { /* ignore */ }
    }
    API_BASE_URL = `http://localhost:${DEFAULT_PORT}/api`;
    return API_BASE_URL;
}

async function getApiUrl() {
    if (!API_BASE_URL) await initializeApi();
    return API_BASE_URL;
}

async function apiRequest(endpoint, options = {}) {
    const baseUrl = await getApiUrl();
    const url = `${baseUrl}${endpoint}`;
    const headers = { 'Accept': 'application/json', ...options.headers };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    if (CURRENT_ASSOCIATION_ID) headers['X-Association-Id'] = CURRENT_ASSOCIATION_ID;

    const config = { ...options, headers, credentials: 'include' };
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        if (response.status === 204) return null;

        const contentType = response.headers.get("content-type");
        if (contentType && (contentType.includes("pdf") || contentType.includes("image") || contentType.includes("octet-stream"))) {
            return response.blob();
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error('[API] Error:', error);
        throw error;
    }
}

// ========================================
// DOMAIN MODULES
// ========================================

const activities = {
    getAll: (assocId) => apiRequest(`/v1/activities?associationId=${assocId || CURRENT_ASSOCIATION_ID}`),
    getById: (id) => apiRequest(`/v1/activities/${id}`),
    create: (data) => apiRequest('/v1/activities', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/v1/activities/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/v1/activities/${id}`, { method: 'DELETE' }),

    // Advanced Stats
    getDetails: (id) => apiRequest(`/v1/activities/${id}/details`),
    getFinancialSummary: (id) => apiRequest(`/v1/activities/${id}/financial-summary`),

    // Sub-resources: Costs
    getCosts: (id) => apiRequest(`/v1/activities/${id}/costs`),
    addCost: (id, data) => apiRequest(`/v1/activities/${id}/costs`, { method: 'POST', body: data }),
    updateCost: (costId, data) => apiRequest(`/v1/activities/costs/${costId}`, { method: 'PUT', body: data }),
    deleteCost: (costId) => apiRequest(`/v1/activities/costs/${costId}`, { method: 'DELETE' }),

    // Sub-resources: Instructors
    getInstructors: (id) => apiRequest(`/v1/activities/${id}/instructors`),
    addInstructor: (id, data) => apiRequest(`/v1/activities/${id}/instructors`, { method: 'POST', body: data }),
    updateInstructor: (instId, data) => apiRequest(`/v1/activities/instructors/${instId}`, { method: 'PUT', body: data }),
    deleteInstructor: (instId) => apiRequest(`/v1/activities/instructors/${instId}`, { method: 'DELETE' }),

    // Sub-resources: Schedules
    getSchedules: (id) => apiRequest(`/v1/activities/${id}/schedules`),
    addSchedule: (id, data) => apiRequest(`/v1/activities/${id}/schedules`, { method: 'POST', body: data }),
    updateSchedule: (schId, data) => apiRequest(`/v1/activities/schedules/${schId}`, { method: 'PUT', body: data }),
    deleteSchedule: (schId) => apiRequest(`/v1/activities/schedules/${schId}`, { method: 'DELETE' }),

    // Sub-resources: Participants
    getParticipants: (id) => apiRequest(`/v1/activities/${id}/participants`),
    addParticipant: (id, data) => apiRequest(`/v1/activities/${id}/participants`, { method: 'POST', body: data }),
    removeParticipant: (partId) => apiRequest(`/v1/activities/participants/${partId}`, { method: 'DELETE' }),
};

const events = {
    getAll: () => apiRequest('/v1/events'),
    getById: (id) => apiRequest(`/v1/events/${id}`),
    create: (data) => apiRequest('/v1/events', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/v1/events/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/v1/events/${id}`, { method: 'DELETE' }),

    // Stats
    getSummary: (id) => apiRequest(`/v1/events/${id}/summary`),
    getGlobalStats: () => apiRequest('/v1/events/stats/global'),

    // Participants
    getParticipants: (id) => apiRequest(`/v1/events/${id}/participants`),
    addParticipant: (id, data) => apiRequest(`/v1/events/${id}/participants`, { method: 'POST', body: data }),
    removeParticipant: (partId) => apiRequest(`/v1/events/participants/${partId}`, { method: 'DELETE' }),
};

const assemblies = {
    getAll: () => apiRequest('/v1/assemblies'),
    getById: (id) => apiRequest(`/v1/assemblies/${id}`),
    create: (data) => apiRequest('/v1/assemblies', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/v1/assemblies/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/v1/assemblies/${id}`, { method: 'DELETE' }),

    // Details & Live
    getDetails: (id) => apiRequest(`/v1/assemblies/${id}/details`),

    // Sub-resources
    getParticipants: (id) => apiRequest(`/v1/assemblies/${id}/participants`),
    addParticipant: (id, data) => apiRequest(`/v1/assemblies/${id}/participants`, { method: 'POST', body: data }),
    removeParticipant: (partId) => apiRequest(`/v1/assemblies/participants/${partId}`, { method: 'DELETE' }),

    getMotions: (id) => apiRequest(`/v1/assemblies/${id}/motions`),
    addMotion: (id, data) => apiRequest(`/v1/assemblies/${id}/motions`, { method: 'POST', body: data }),
    deleteMotion: (mId) => apiRequest(`/v1/assemblies/motions/${mId}`, { method: 'DELETE' }),

    getDocuments: (id) => apiRequest(`/v1/assemblies/${id}/documents`),
    addDocument: (id, data) => apiRequest(`/v1/assemblies/${id}/documents`, { method: 'POST', body: data }),
    deleteDocument: (docId) => apiRequest(`/v1/assemblies/documents/${docId}`, { method: 'DELETE' }),

    castVote: (motionId, data) => apiRequest(`/v1/assemblies/motions/${motionId}/votes`, { method: 'POST', body: data }),
    getVotes: (motionId) => apiRequest(`/v1/assemblies/motions/${motionId}/votes`),
};

const inventory = {
    getAll: () => apiRequest('/v1/inventory'),
    getById: (id) => apiRequest(`/v1/inventory/${id}`),
    create: (data) => apiRequest('/v1/inventory', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/v1/inventory/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/v1/inventory/${id}`, { method: 'DELETE' }),

    // Loans
    getLoansByItem: (id) => apiRequest(`/v1/inventory/${id}/loans`),
    createLoan: (data) => apiRequest('/v1/inventory/loans', { method: 'POST', body: data }),
    returnLoan: (loanId) => apiRequest(`/v1/inventory/loans/${loanId}/return`, { method: 'PUT' }),
};

const volunteers = {
    getAll: () => apiRequest('/v1/volunteers'),
    getById: (id) => apiRequest(`/v1/volunteers/${id}`),
    create: (data) => apiRequest('/v1/volunteers', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/v1/volunteers/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/v1/volunteers/${id}`, { method: 'DELETE' }),

    // Shifts
    getShiftsByVolunteer: (id) => apiRequest(`/v1/volunteers/${id}/shifts`),
    createShift: (data) => apiRequest('/v1/volunteers/shifts', { method: 'POST', body: data }),
    updateShift: (id, data) => apiRequest(`/v1/volunteers/shifts/${id}`, { method: 'PUT', body: data }),

    // Expenses
    getExpensesByVolunteer: (id) => apiRequest(`/v1/volunteers/${id}/expenses`),
    createExpense: (data) => apiRequest('/v1/volunteers/expenses', { method: 'POST', body: data }),
    updateExpenseStatus: (id, status) => apiRequest(`/v1/volunteers/expenses/${id}/status?status=${status}`, { method: 'PUT' }),
};

const members = {
    getAll: () => apiRequest('/v1/members'),
    getById: (id) => apiRequest(`/v1/members/${id}`),
    create: (data) => apiRequest('/v1/members', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/v1/members/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/v1/members/${id}`, { method: 'DELETE' }),

    // Utils
    calculateFiscalCode: (data) => apiRequest('/v1/members/calculate-fiscal-code', { method: 'POST', body: data }),
};

const users = {
    create: (data) => apiRequest('/v1/users', { method: 'POST', body: data }),
    getAll: () => apiRequest('/v1/users'),
};

const memberships = {
    getByAssociation: (assocId) => apiRequest(`/v1/memberships/association/${assocId || CURRENT_ASSOCIATION_ID}`),
    create: (data) => apiRequest('/v1/memberships', { method: 'POST', body: data }),
    delete: (id) => apiRequest(`/v1/memberships/${id}`, { method: 'DELETE' }),
    renew: (id, newExpirationDate) => apiRequest(`/v1/memberships/${id}/renew?newExpirationDate=${newExpirationDate}`, { method: 'POST' }),
};

const reports = {
    downloadFinancialReport: (year) => apiRequest(`/v1/reports/finance/year/${year || new Date().getFullYear()}`),
    downloadComparisonReport: (year1, year2) => apiRequest(`/v1/reports/finance/comparison?year1=${year1}&year2=${year2}`),
    downloadActivityReport: (id) => apiRequest(`/v1/reports/activities/${id}`),
    downloadAssemblyMinutes: (id) => apiRequest(`/v1/reports/assemblies/${id}/minutes`),
    downloadTransactionReceipt: (id) => apiRequest(`/v1/reports/finance/transactions/${id}/receipt`),
    downloadMembershipCard: (id) => apiRequest(`/v1/reports/members/${id}/card`),
};

const dashboard = {
    getStats: (assocId) => apiRequest(`/dashboard/stats`, { headers: { 'X-Association-Id': assocId } }),
};

const finance = {
    getAllTransactions: (filters = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) queryParams.append(key, filters[key]);
        });
        return apiRequest(`/v1/finance/transactions?${queryParams.toString()}`);
    },
    createTransaction: (data) => apiRequest('/v1/finance/transactions', { method: 'POST', body: data }),
    updateTransaction: (id, data) => apiRequest(`/v1/finance/transactions/${id}`, { method: 'PUT', body: data }),
    deleteTransaction: (id) => apiRequest(`/v1/finance/transactions/${id}`, { method: 'DELETE' }),
    getYoyComparison: (year) => apiRequest(`/v1/finance/yoy-comparison?year=${year}`),
    getCustomComparison: (year1, year2) => apiRequest(`/v1/finance/comparison?year1=${year1}&year2=${year2}`),

    // Journal Entries
    getJournalEntries: (filters = {}) => {
        const queryParams = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) queryParams.append(key, filters[key]);
        });
        return apiRequest(`/v1/finance/journal-entries?${queryParams.toString()}`);
    },
};

const coupons = {
    getByAssociation: (assocId) => apiRequest(`/v1/coupons/association/${assocId || CURRENT_ASSOCIATION_ID}`),
    create: (data) => apiRequest('/v1/coupons', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/v1/coupons/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/v1/coupons/${id}`, { method: 'DELETE' }),
};

const paymentMethods = {
    getAll: (assocId) => apiRequest(`/v1/payment-methods?associationId=${assocId || CURRENT_ASSOCIATION_ID}`),
    getActive: (assocId) => apiRequest(`/v1/payment-methods/active?associationId=${assocId || CURRENT_ASSOCIATION_ID}`),
    create: (data) => apiRequest('/v1/payment-methods', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/v1/payment-methods/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/v1/payment-methods/${id}`, { method: 'DELETE' }),
};

const stats = {
    getGeneral: () => apiRequest('/stats/general'),
    getActivity: (id) => apiRequest(`/stats/activities/${id}`),
    getAssembly: (id) => apiRequest(`/stats/assemblies/${id}`),
    getFinancial: (assocId, year) => apiRequest(`/stats/financial?associationId=${assocId}&year=${year}`),
};

const notifications = {
    getUserNotifications: (userId) => apiRequest(`/v1/notifications/user/${userId}`),
    getUnreadUserNotifications: (userId) => apiRequest(`/v1/notifications/user/${userId}/unread`),
    markAsRead: (id) => apiRequest(`/v1/notifications/${id}/read`, { method: 'PUT' }),
    markAllAsRead: (userId) => apiRequest(`/v1/notifications/user/${userId}/read-all`, { method: 'PUT' }),
};

// ========================================
// EXPORT
// ========================================

export const associago = {
    init: async () => { await initializeApi(); return { baseUrl: API_BASE_URL }; },
    setCurrentAssociation: (id) => { CURRENT_ASSOCIATION_ID = id; },
    getApiUrl,

    // Auth & Setup (Legacy/Basic)
    login: async (associationId, password) => {
        const result = await apiRequest('/auth/login', { method: 'POST', body: { associationId, password } });
        return { token: result.sessionId, user: { id: "admin", role: "ADMIN" } };
    },

    setupAssociation: async (data) => {
        const result = await apiRequest('/associations/setup', { method: 'POST', body: data });
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY_ASSOCIATIONS) || '[]');
        list.push({ id: result.id, nome: result.name, email: result.email, tipo: result.type });
        localStorage.setItem(STORAGE_KEY_ASSOCIATIONS, JSON.stringify(list));
        return { id: result.id, nome: result.name, email: result.email, tipo: result.type };
    },

    // Local Storage Helpers
    getKnownAssociations: () => JSON.parse(localStorage.getItem(STORAGE_KEY_ASSOCIATIONS) || '[]'),

    updateKnownAssociation: (id, newData) => {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY_ASSOCIATIONS) || '[]');
        const index = list.findIndex(a => a.id === id);
        if (index !== -1) {
            // Aggiorna solo i campi forniti, mantenendo gli altri (es. id)
            if (newData.nome) list[index].nome = newData.nome;
            if (newData.email) list[index].email = newData.email;
            if (newData.tipo) list[index].tipo = newData.tipo;
            localStorage.setItem(STORAGE_KEY_ASSOCIATIONS, JSON.stringify(list));
        }
    },

    removeKnownAssociation: (id) => {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY_ASSOCIATIONS) || '[]');
        const newList = list.filter(a => a.id !== id);
        localStorage.setItem(STORAGE_KEY_ASSOCIATIONS, JSON.stringify(newList));
        return newList;
    },
    getPreferences: () => {
        const autologin = localStorage.getItem(STORAGE_KEY_AUTOLOGIN);
        return {
            autologin: autologin ? JSON.parse(autologin) : null,
            language: localStorage.getItem(STORAGE_KEY_LANGUAGE) || 'it'
        };
    },
    setPreferences: (prefs) => {
        if (prefs.autologin) localStorage.setItem(STORAGE_KEY_AUTOLOGIN, JSON.stringify(prefs.autologin));
        if (prefs.language) localStorage.setItem(STORAGE_KEY_LANGUAGE, prefs.language);
    },
    setAuthToken: (token) => { /* Token management if needed */ },

    validateAssociation: async (id) => {
        try {
            await apiRequest(`/associations/${id}`);
            return true;
        } catch (e) {
            if (e.message && e.message.includes('404')) return false;
            throw e;
        }
    },

    getAssociationProfile: (id) => apiRequest(`/associations/${id}`),
    updateAssociationProfile: (id, data) => apiRequest(`/associations/${id}`, { method: 'PUT', body: data }),
    uploadLogo: (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest(`/associations/${id}/logo`, { method: 'POST', body: formData });
    },
    getLogoUrl: async (id) => {
        const baseUrl = await getApiUrl();
        return `${baseUrl}/associations/${id}/logo`;
    },

    // Domains
    activities,
    events,
    assemblies,
    members,
    users,
    memberships,
    reports,
    dashboard,
    finance,
    inventory,
    volunteers,
    coupons,
    paymentMethods,
    stats,
    notifications
};

export default associago;
