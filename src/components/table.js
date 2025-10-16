import { cloneTemplate } from "../lib/utils.js";

/**
 * Инициализация компонента таблицы
 */
export function initializeTableComponent(config, actionHandler) {
    const { tableTemplate, rowTemplate, prependElements, appendElements } = config;
    const tableRoot = cloneTemplate(tableTemplate);

    // Добавление элементов после таблицы
    appendElements.forEach((templateName) => {
        tableRoot[templateName] = cloneTemplate(templateName);
        tableRoot.container.append(tableRoot[templateName].container);
    });

    // Добавление элементов перед таблицей
    prependElements.reverse().forEach((templateName) => {
        tableRoot[templateName] = cloneTemplate(templateName);
        tableRoot.container.prepend(tableRoot[templateName].container);
    });

    // Обработчики событий таблицы
    tableRoot.container.addEventListener("change", () => {
        actionHandler();
    });

    tableRoot.container.addEventListener("reset", () => {
        setTimeout(actionHandler);
    });

    tableRoot.container.addEventListener("submit", (event) => {
        event.preventDefault();
        actionHandler(event.submitter);
    });

    /**
     * Рендеринг данных таблицы
     */
    const renderTableData = (data) => {
        const tableRows = data.map((item) => {
            const row = cloneTemplate(rowTemplate);

            // Заполнение ячеек данными
            Object.keys(item).forEach((key) => {
                if (row.elements[key]) {
                    const element = row.elements[key];
                    if (["INPUT", "SELECT"].includes(element.tagName)) {
                        element.value = item[key];
                    } else {
                        element.textContent = item[key];
                    }
                }
            });

            return row.container;
        });

        tableRoot.elements.rows.replaceChildren(...tableRows);
    };

    return { ...tableRoot, render: renderTableData };
}