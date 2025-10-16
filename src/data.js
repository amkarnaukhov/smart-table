// Базовый URL для API endpoints
const API_BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

// Основная функция инициализации системы данных
export function initializeDataSource(initialData) {
    // Кэш для хранения справочников продавцов и клиентов
    let sellersCache;
    let customersCache;
    let cachedResults;
    let previousQueryString;

    // Преобразование сырых данных в формат для табличного представления
    const transformRecords = (rawData) =>
        rawData.map((record) => ({
            id: record.receipt_id,
            date: record.date,
            seller: sellersCache[record.seller_id],
            customer: customersCache[record.customer_id],
            total: record.total_amount,
        }));

    // Асинхронное получение справочных данных с кэшированием
    const fetchReferenceData = async () => {
        if (!sellersCache || !customersCache) {
            // Параллельная загрузка справочников для оптимизации
            [sellersCache, customersCache] = await Promise.all([
                fetch(`${API_BASE_URL}/sellers`).then(response => response.json()),
                fetch(`${API_BASE_URL}/customers`).then(response => response.json()),
            ]);
        }

        return { sellers: sellersCache, customers: customersCache };
    };

    // Получение записей о продажах с поддержкой кэширования
    const fetchSalesRecords = async (queryParams, forceRefresh = false) => {
        const queryParamsString = new URLSearchParams(queryParams).toString();

        // Возвращаем кэшированные результаты, если запрос не изменился
        if (previousQueryString === queryParamsString && !forceRefresh) {
            return cachedResults;
        }

        // Выполняем новый запрос к API
        const apiResponse = await fetch(`${API_BASE_URL}/records?${queryParamsString}`);
        const recordsData = await apiResponse.json();

        // Обновляем кэш
        previousQueryString = queryParamsString;
        cachedResults = {
            totalCount: recordsData.total,
            records: transformRecords(recordsData.items),
        };

        return cachedResults;
    };

    // Публичный API модуля данных
    return {
        getIndexes: fetchReferenceData,
        getRecords: fetchSalesRecords,
    };
}