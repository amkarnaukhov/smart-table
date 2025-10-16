// Импорт стилей и шрифтов
import "./fonts/ys-display/fonts.css";
import "./style.css";

// Импорт исходных данных и модулей
import { data as initialDataset } from "./data/dataset_1.js";
import { initializeDataSource } from "./data.js";
import { extractFormData } from "./lib/utils.js";

// Импорт компонентов интерфейса
import { initializeTableComponent } from "./components/table.js";
import { setupPagination } from "./components/pagination.js";
import { setupSorting } from "./components/sorting.js";
import { setupFiltering } from "./components/filtering.js";
import { setupSearch } from "./components/searching.js";

// Инициализация API для работы с данными
const dataAPI = initializeDataSource(initialDataset);

/**
 * Сбор и нормализация состояния формы таблицы
 * @returns {Object} Нормализованное состояние
 */
function gatherTableState() {
    const rawState = extractFormData(new FormData(dataTable.container));

    // Нормализация числовых параметров
    const itemsPerPage = parseInt(rawState.rowsPerPage);
    const currentPage = parseInt(rawState.page ?? 1);

    return {
        ...rawState,
        rowsPerPage: itemsPerPage,
        page: currentPage,
    };
}

/**
 * Основная функция рендеринга таблицы
 * @param {HTMLButtonElement|null} triggeredElement - Элемент, вызвавший обновление
 */
async function refreshTable(triggeredElement = null) {
    let currentState = gatherTableState();
    let apiQuery = {};

    // Последовательное применение всех модификаторов запроса
    apiQuery = applySortingLogic(apiQuery, currentState, triggeredElement);
    apiQuery = applyFilteringLogic(apiQuery, currentState, triggeredElement);
    apiQuery = applySearchLogic(apiQuery, currentState, triggeredElement);
    apiQuery = applyPaginationLogic(apiQuery, currentState, triggeredElement);

    // Загрузка данных с сервера
    const { totalCount, records } = await dataAPI.getRecords(apiQuery);

    // Обновление интерфейса
    refreshPagination(totalCount, apiQuery);
    dataTable.render(records);
}

// Инициализация таблицы с настройками
const dataTable = initializeTableComponent(
    {
        tableTemplate: "table",
        rowTemplate: "row",
        prependElements: ["search", "header", "filter"],
        appendElements: ["pagination"],
    },
    refreshTable
);

// Настройка пагинации
const { applyPaginationLogic, refreshPagination } = setupPagination(
    dataTable.pagination.elements,
    (element, pageNumber, isActive) => {
        const inputElement = element.querySelector("input");
        const labelElement = element.querySelector("span");

        inputElement.value = pageNumber;
        inputElement.checked = isActive;
        labelElement.textContent = pageNumber;

        return element;
    }
);

// Инициализация системы поиска
const applySearchLogic = setupSearch("search");

// Настройка системы сортировки
const applySortingLogic = setupSorting([
    dataTable.header.elements.sortByDate,
    dataTable.header.elements.sortByTotal,
]);

// Настройка системы фильтрации
const { applyFilteringLogic, refreshFilterIndexes } = setupFiltering(
    dataTable.filter.elements
);

// Монтирование приложения в DOM
const applicationRoot = document.querySelector("#app");
applicationRoot.appendChild(dataTable.container);

/**
 * Инициализация приложения и первичная загрузка данных
 */
async function bootstrapApplication() {
    const referenceData = await dataAPI.getIndexes();
    refreshFilterIndexes(dataTable.filter.elements, {
        searchBySeller: referenceData.sellers,
    });
}

// Запуск приложения
bootstrapApplication().then(refreshTable);