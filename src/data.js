// ������� URL ��� API endpoints
const API_BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

// �������� ������� ������������� ������� ������
export function initializeDataSource(initialData) {
    // ��� ��� �������� ������������ ��������� � ��������
    let sellersCache;
    let customersCache;
    let cachedResults;
    let previousQueryString;

    // �������������� ����� ������ � ������ ��� ���������� �������������
    const transformRecords = (rawData) =>
        rawData.map((record) => ({
            id: record.receipt_id,
            date: record.date,
            seller: sellersCache[record.seller_id],
            customer: customersCache[record.customer_id],
            total: record.total_amount,
        }));

    // ����������� ��������� ���������� ������ � ������������
    const fetchReferenceData = async () => {
        if (!sellersCache || !customersCache) {
            // ������������ �������� ������������ ��� �����������
            [sellersCache, customersCache] = await Promise.all([
                fetch(`${API_BASE_URL}/sellers`).then(response => response.json()),
                fetch(`${API_BASE_URL}/customers`).then(response => response.json()),
            ]);
        }

        return { sellers: sellersCache, customers: customersCache };
    };

    // ��������� ������� � �������� � ���������� �����������
    const fetchSalesRecords = async (queryParams, forceRefresh = false) => {
        const queryParamsString = new URLSearchParams(queryParams).toString();

        // ���������� ������������ ����������, ���� ������ �� ���������
        if (previousQueryString === queryParamsString && !forceRefresh) {
            return cachedResults;
        }

        // ��������� ����� ������ � API
        const apiResponse = await fetch(`${API_BASE_URL}/records?${queryParamsString}`);
        const recordsData = await apiResponse.json();

        // ��������� ���
        previousQueryString = queryParamsString;
        cachedResults = {
            totalCount: recordsData.total,
            records: transformRecords(recordsData.items),
        };

        return cachedResults;
    };

    // ��������� API ������ ������
    return {
        getIndexes: fetchReferenceData,
        getRecords: fetchSalesRecords,
    };
}