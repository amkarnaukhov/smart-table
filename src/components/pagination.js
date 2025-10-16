import { calculatePageRange } from "../lib/utils.js";

/**
 * Инициализация системы пагинации
 */
export const setupPagination = (
    { pages, fromRow, toRow, totalRows },
    renderPageElement
) => {
    const pageElementTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    let totalPageCount;

    /**
     * Применение параметров пагинации к запросу
     */
    const applyPaginationLogic = (query, state, action) => {
        const pageSize = state.rowsPerPage;
        let currentPage = state.page;

        // Обработка действий пагинации
        if (action) {
            switch (action.name) {
                case "prev":
                    currentPage = Math.max(1, currentPage - 1);
                    break;
                case "next":
                    currentPage = Math.min(totalPageCount, currentPage + 1);
                    break;
                case "first":
                    currentPage = 1;
                    break;
                case "last":
                    currentPage = totalPageCount;
                    break;
            }
        }

        return Object.assign({}, query, {
            limit: pageSize,
            page: currentPage,
        });
    };

    /**
     * Обновление отображения пагинации
     */
    const refreshPagination = (totalItems, { page, limit }) => {
        totalPageCount = Math.ceil(totalItems / limit);

        // Расчет диапазона отображаемых страниц
        const visiblePages = calculatePageRange(page, totalPageCount, 5);

        // Обновление элементов пагинации
        pages.replaceChildren(
            ...visiblePages.map((pageNumber) => {
                const pageElement = pageElementTemplate.cloneNode(true);
                return renderPageElement(pageElement, pageNumber, pageNumber === page);
            })
        );

        // Обновление информации о записях
        fromRow.textContent = (page - 1) * limit;
        toRow.textContent = Math.min(page * limit, totalItems);
        totalRows.textContent = totalItems;
    };

    return {
        updatePagination: refreshPagination,
        applyPagination: applyPaginationLogic,
    };
};