/**
 * ������������� ������� ����������
 */
export function setupFiltering(uiElements) {
    /**
     * ���������� ����� �������� �� ������ ���������� ������
     */
    const refreshFilterIndexes = (elements, indexData) => {
        Object.keys(indexData).forEach((elementKey) => {
            elements[elementKey].append(
                ...Object.values(indexData[elementKey]).map((optionText) => {
                    const optionElement = document.createElement("option");
                    optionElement.textContent = optionText;
                    optionElement.value = optionText;
                    return optionElement;
                })
            );
        });
    };

    /**
     * ���������� �������� � �������
     */
    const applyFilteringLogic = (query, state, action) => {
        // ��������� ������� �������
        if (action && action.name === "clear") {
            const inputField = action.parentElement.querySelector("input");
            inputField.value = "";
            state[action.dataset.field] = "";
        }

        const activeFilters = {};

        // ���� �������� �������� �� �����
        Object.keys(uiElements).forEach((key) => {
            const element = uiElements[key];
            if (element && ["INPUT", "SELECT"].includes(element.tagName) && element.value) {
                activeFilters[`filter[${element.name}]`] = element.value;
            }
        });

        // ���������� ����������� ������
        return Object.keys(activeFilters).length
            ? Object.assign({}, query, activeFilters)
            : query;
    };

    return {
        updateIndexes: refreshFilterIndexes,
        applyFiltering: applyFilteringLogic,
    };
}