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

    // Duplicates
    checkDuplicates: (email, fiscalCode) => {
        const params = new URLSearchParams();
        if (email) params.append('email', email);
        if (fiscalCode) params.append('fiscalCode', fiscalCode);
        return apiRequest(`/v1/members/check-duplicates?${params}`);
    },

    // Consents
    getConsents: (memberId, assocId) => apiRequest(`/v1/members/${memberId}/consents?associationId=${assocId}`),
    grantConsent: (memberId, assocId, consentType, lawfulBasis) =>
        apiRequest(`/v1/members/${memberId}/consents?associationId=${assocId}&consentType=${consentType}${lawfulBasis ? '&lawfulBasis=' + lawfulBasis : ''}`, { method: 'POST' }),
    revokeConsent: (consentId) => apiRequest(`/v1/members/consents/${consentId}/revoke`, { method: 'POST' }),
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

const budgets = {
    getAll: (assocId) => apiRequest(`/v1/budgets?associationId=${assocId}`),
    getById: (id) => apiRequest(`/v1/budgets/${id}`),
    create: (data) => apiRequest('/v1/budgets', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/v1/budgets/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/v1/budgets/${id}`, { method: 'DELETE' }),
    approve: (id, approvedBy) => apiRequest(`/v1/budgets/${id}/approve?approvedBy=${approvedBy}`, { method: 'POST' }),
    syncActuals: (id) => apiRequest(`/v1/budgets/${id}/sync-actuals`, { method: 'POST' }),
    getLines: (budgetId) => apiRequest(`/v1/budgets/${budgetId}/lines`),
    addLine: (budgetId, data) => apiRequest(`/v1/budgets/${budgetId}/lines`, { method: 'POST', body: data }),
    updateLine: (lineId, data) => apiRequest(`/v1/budgets/lines/${lineId}`, { method: 'PUT', body: data }),
    deleteLine: (lineId) => apiRequest(`/v1/budgets/lines/${lineId}`, { method: 'DELETE' }),
};

const balances = {
    getAll: (assocId) => apiRequest(`/v1/balances?associationId=${assocId}`),
    getById: (id) => apiRequest(`/v1/balances/${id}`),
    getLines: (id) => apiRequest(`/v1/balances/${id}/lines`),
    compute: (assocId, year) => apiRequest(`/v1/balances/compute?associationId=${assocId}&year=${year}`, { method: 'POST' }),
    approve: (id, approvedBy, signatories) => apiRequest(`/v1/balances/${id}/approve?approvedBy=${approvedBy}`, { method: 'POST', body: signatories }),
    delete: (id) => apiRequest(`/v1/balances/${id}`, { method: 'DELETE' }),
    downloadPdf: (id) => apiRequest(`/v1/balances/${id}/pdf`),
    checkSigners: (id) => apiRequest(`/v1/balances/${id}/check-signers`),
};

const certificates = {
    getTemplates: (assocId) => apiRequest(`/v1/certificates/templates?associationId=${assocId}`),
    getTemplate: (id) => apiRequest(`/v1/certificates/templates/${id}`),
    createTemplate: (data) => apiRequest('/v1/certificates/templates', { method: 'POST', body: data }),
    updateTemplate: (id, data) => apiRequest(`/v1/certificates/templates/${id}`, { method: 'PUT', body: data }),
    deleteTemplate: (id) => apiRequest(`/v1/certificates/templates/${id}`, { method: 'DELETE' }),
    getIssued: (assocId) => apiRequest(`/v1/certificates?associationId=${assocId}`),
    issue: (params) => apiRequest(`/v1/certificates/issue?${new URLSearchParams(params)}`, { method: 'POST' }),
    batchActivity: (activityId, templateId, assocId) => apiRequest(`/v1/certificates/batch/activity/${activityId}?templateId=${templateId}&associationId=${assocId}`, { method: 'POST' }),
    batchEvent: (eventId, templateId, assocId) => apiRequest(`/v1/certificates/batch/event/${eventId}?templateId=${templateId}&associationId=${assocId}`, { method: 'POST' }),
    downloadPdf: (id) => apiRequest(`/v1/certificates/${id}/pdf`, { raw: true }),
};

const resources = {
    getAll: (assocId) => apiRequest(`/v1/resources?associationId=${assocId}`),
    getById: (id) => apiRequest(`/v1/resources/${id}`),
    create: (data) => apiRequest('/v1/resources', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/v1/resources/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/v1/resources/${id}`, { method: 'DELETE' }),
    getBookings: (assocId) => apiRequest(`/v1/resources/bookings?associationId=${assocId}`),
    getCalendar: (assocId, start, end) => apiRequest(`/v1/resources/bookings/calendar?associationId=${assocId}&start=${start}&end=${end}`),
    createBooking: (data) => apiRequest('/v1/resources/bookings', { method: 'POST', body: data }),
    updateBooking: (id, data) => apiRequest(`/v1/resources/bookings/${id}`, { method: 'PUT', body: data }),
    cancelBooking: (id) => apiRequest(`/v1/resources/bookings/${id}/cancel`, { method: 'POST' }),
    approveBooking: (id, approvedBy) => apiRequest(`/v1/resources/bookings/${id}/approve?approvedBy=${approvedBy}`, { method: 'POST' }),
};

const cashRegisters = {
    getAll: (assocId) => apiRequest(`/v1/cash-registers?associationId=${assocId}`),
    getById: (id) => apiRequest(`/v1/cash-registers/${id}`),
    getOpen: (assocId) => apiRequest(`/v1/cash-registers/open?associationId=${assocId}`),
    open: (assocId, openedBy) => apiRequest(`/v1/cash-registers/open?associationId=${assocId}&openedBy=${openedBy}`, { method: 'POST' }),
    close: (id, closedBy) => apiRequest(`/v1/cash-registers/${id}/close?closedBy=${closedBy}`, { method: 'POST' }),
    getEntries: (registerId) => apiRequest(`/v1/cash-registers/${registerId}/entries`),
    addEntry: (registerId, data) => apiRequest(`/v1/cash-registers/${registerId}/entries`, { method: 'POST', body: data }),
    deleteEntry: (entryId) => apiRequest(`/v1/cash-registers/entries/${entryId}`, { method: 'DELETE' }),
};

const audit = {
    getByAssociation: (assocId, page = 0, size = 50) => apiRequest(`/v1/audit?associationId=${assocId}&page=${page}&size=${size}`),
    getByEntity: (entityType, entityId) => apiRequest(`/v1/audit/entity/${entityType}/${entityId}`),
    getByDateRange: (assocId, from, to) => apiRequest(`/v1/audit/range?associationId=${assocId}&from=${from}&to=${to}`),
    count: (assocId) => apiRequest(`/v1/audit/count?associationId=${assocId}`),
};

const signatures = {
    getAll: (assocId) => apiRequest(`/v1/signatures?associationId=${assocId}`),
    getActive: (assocId) => apiRequest(`/v1/signatures/active?associationId=${assocId}`),
    upsert: (data) => apiRequest('/v1/signatures', { method: 'POST', body: data }),
    uploadImage: async (sigId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest(`/v1/signatures/${sigId}/image`, { method: 'POST', body: formData });
    },
    getImageUrl: async (sigId) => {
        const baseUrl = await getApiUrl();
        return `${baseUrl}/v1/signatures/${sigId}/image`;
    },
    deleteImage: (sigId) => apiRequest(`/v1/signatures/${sigId}/image`, { method: 'DELETE' }),
    delete: (sigId) => apiRequest(`/v1/signatures/${sigId}`, { method: 'DELETE' }),
};

const communications = {
    getTemplates: (assocId) => apiRequest(`/v1/communications/templates?associationId=${assocId}`),
    createTemplate: (data) => apiRequest('/v1/communications/templates', { method: 'POST', body: data }),
    updateTemplate: (id, data) => apiRequest(`/v1/communications/templates/${id}`, { method: 'PUT', body: data }),
    deleteTemplate: (id) => apiRequest(`/v1/communications/templates/${id}`, { method: 'DELETE' }),
    getAll: (assocId) => apiRequest(`/v1/communications?associationId=${assocId}`),
    getById: (id) => apiRequest(`/v1/communications/${id}`),
    create: (data) => apiRequest('/v1/communications', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/v1/communications/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/v1/communications/${id}`, { method: 'DELETE' }),
    resolveRecipients: (id) => apiRequest(`/v1/communications/${id}/resolve-recipients`, { method: 'POST' }),
    getRecipients: (id) => apiRequest(`/v1/communications/${id}/recipients`),
    send: (id, sentBy) => apiRequest(`/v1/communications/${id}/send?sentBy=${sentBy}`, { method: 'POST' }),
};

const csvImport = {
    getHistory: (assocId) => apiRequest(`/v1/imports?associationId=${assocId}`),
    previewMembers: (file, assocId) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest(`/v1/members/import-csv/preview?associationId=${assocId}`, { method: 'POST', body: formData });
    },
    previewActivityParticipants: (file, assocId, activityId) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest(`/v1/activities/${activityId}/import-csv?associationId=${assocId}`, { method: 'POST', body: formData });
    },
    previewEventParticipants: (file, assocId, eventId) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest(`/v1/events/${eventId}/import-csv?associationId=${assocId}`, { method: 'POST', body: formData });
    },
    importMembers: (file, assocId) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest(`/v1/members/import-csv?associationId=${assocId}`, { method: 'POST', body: formData });
    },
    confirmImport: (id) => apiRequest(`/v1/imports/${id}/confirm`, { method: 'POST' }),
};

const fiscal = {
    closeYear: (assocId, year, userId) => apiRequest(`/v1/fiscal/close-year?associationId=${assocId}&year=${year}&userId=${userId}`, { method: 'POST' }),
    getClosure: (assocId, year) => apiRequest(`/v1/fiscal/closure?associationId=${assocId}&year=${year}`),
    runInvoiceCheck: (assocId, year, userId) => apiRequest(`/v1/fiscal/invoice-check?associationId=${assocId}&year=${year}&userId=${userId}`, { method: 'POST' }),
    getInvoiceCheckHistory: (assocId) => apiRequest(`/v1/fiscal/invoice-checks?associationId=${assocId}`),
};

const medicalCertificates = {
    getByMember: (memberId, assocId) => apiRequest(`/v1/medical-certificates?memberId=${memberId}&associationId=${assocId}`),
    getByAssociation: (assocId) => apiRequest(`/v1/medical-certificates/by-association?associationId=${assocId}`),
    getExpiring: (assocId, days = 30) => apiRequest(`/v1/medical-certificates/expiring?associationId=${assocId}&days=${days}`),
    getExpired: (assocId) => apiRequest(`/v1/medical-certificates/expired?associationId=${assocId}`),
    save: (data) => apiRequest('/v1/medical-certificates', { method: 'POST', body: data }),
    upload: (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest(`/v1/medical-certificates/${id}/upload`, { method: 'POST', body: formData });
    },
    delete: (id) => apiRequest(`/v1/medical-certificates/${id}`, { method: 'DELETE' }),
};

const federation = {
    getProviders: () => apiRequest('/v1/federation/providers'),
    register: (data, providerCode = 'CONI_IT') => apiRequest(`/v1/federation/register?providerCode=${providerCode}`, { method: 'POST', body: data }),
    verify: (number, checksum, providerCode = 'CONI_IT') => apiRequest(`/v1/federation/verify?number=${number}&checksum=${checksum}&providerCode=${providerCode}`),
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

    // Locations
    getLocations: (assocId) => apiRequest(`/v1/associations/${assocId}/locations`),
    createLocation: (assocId, data) => apiRequest(`/v1/associations/${assocId}/locations`, { method: 'POST', body: data }),
    updateLocation: (assocId, locId, data) => apiRequest(`/v1/associations/${assocId}/locations/${locId}`, { method: 'PUT', body: data }),
    deleteLocation: (assocId, locId) => apiRequest(`/v1/associations/${assocId}/locations/${locId}`, { method: 'DELETE' }),

    // Documents
    getDocuments: (assocId) => apiRequest(`/v1/associations/${assocId}/documents`),
    uploadDocument: (assocId, file, docType, title) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', docType);
        if (title) formData.append('title', title);
        return apiRequest(`/v1/associations/${assocId}/documents`, { method: 'POST', body: formData });
    },
    deleteDocument: (assocId, docId) => apiRequest(`/v1/associations/${assocId}/documents/${docId}`, { method: 'DELETE' }),

    // Deadlines
    getDeadlines: (assocId) => apiRequest(`/v1/associations/${assocId}/deadlines`),
    getPendingDeadlines: (assocId) => apiRequest(`/v1/associations/${assocId}/deadlines/pending`),
    createDeadline: (assocId, data) => apiRequest(`/v1/associations/${assocId}/deadlines`, { method: 'POST', body: data }),
    updateDeadline: (assocId, dlId, data) => apiRequest(`/v1/associations/${assocId}/deadlines/${dlId}`, { method: 'PUT', body: data }),
    completeDeadline: (assocId, dlId) => apiRequest(`/v1/associations/${assocId}/deadlines/${dlId}/complete`, { method: 'POST' }),
    deleteDeadline: (assocId, dlId) => apiRequest(`/v1/associations/${assocId}/deadlines/${dlId}`, { method: 'DELETE' }),
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
    notifications,
    budgets,
    balances,
    certificates,
    resources,
    cashRegisters,
    audit,
    signatures,
    communications,
    csvImport,
    fiscal,
    medicalCertificates,
    federation,

    // App metadata
    getBackendInfo: () => apiRequest('/v1/app/info'),
};

export default associago;
