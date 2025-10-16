import { sortingStates } from "../lib/sort.js";

/**
 * Инициализация системы сортировки
 */
export function setupSorting(sortableColumns) {
    return (query, state, action) => {
        let sortField = null;
        let sortDirection = null;
        state.sort = { field: sortField, order: sortDirection };

        if (action && action.name === "sort") {
            // Обновление состояния активной колонки
            action.dataset.value = sortingStates[action.dataset.value];
            sortField = action.dataset.field;
            sortDirection = action.dataset.value;

            // Сброс остальных колонок
            sortableColumns.forEach((column) => {
                if (column.dataset.field !== action.dataset.field) {
                    column.dataset.value = "none";
                }
            });
        } else {
            // Восстановление активной сортировки
            sortableColumns.forEach((column) => {
                if (column.dataset.value !== "none") {
                    sortField = column.dataset.field;
                    sortDirection = column.dataset.value;
                }
            });
        }

        const sortParam = sortField && sortDirection !== "none"
            ? `${sortField}:${sortDirection}`
            : null;

        return sortParam ? Object.assign({}, query, { sort: sortParam }) : query;
    };
}