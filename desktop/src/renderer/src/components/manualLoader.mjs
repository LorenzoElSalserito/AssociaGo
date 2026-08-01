const SUPPORTED_LANGUAGES = new Set(['de', 'en', 'es', 'fr', 'it']);

export const getManualLanguages = (language) => {
    const normalized = String(language || 'it').toLowerCase().split('-')[0];
    const preferred = SUPPORTED_LANGUAGES.has(normalized) ? normalized : 'it';
    return [...new Set([preferred, 'it', 'en'])];
};

export const getManualDocumentUrls = (baseUri, language, filename) =>
    getManualLanguages(language).map((lang) =>
        new URL(`docs/${lang}/${filename}`, baseUri).toString()
    );

export const fetchManualDocument = async (fetchFn, baseUri, language, filename) => {
    for (const url of getManualDocumentUrls(baseUri, language, filename)) {
        const response = await fetchFn(url);
        if (response.ok) return response.text();
    }
    throw new Error('Document not found');
};
