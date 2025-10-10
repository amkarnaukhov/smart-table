import { cloneTemplate } from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const { tableTemplate, rowTemplate, before, after } = settings;
    const root = cloneTemplate(tableTemplate);

    after.forEach((subName) => {
        // перебираем нужный массив идентификаторов
        root[subName] = cloneTemplate(subName); // клонируем и получаем объект, сохраняем в таблице
        root.container.append(root[subName].container); // добавляем к таблице после (append) или до (prepend)
    });

    before.reverse().forEach((subName) => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    });

    // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы
    root.container.addEventListener("change", () => {
        onAction();
    });
    root.container.addEventListener("reset", () => {
        setTimeout(onAction);
    });
    root.container.addEventListener("submit", (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        const nextRows = data.map((item) => {
            const row = cloneTemplate(rowTemplate);

            Object.keys(item).forEach((key) => {
                if (row.elements[key]) {
                    if (["INPUT", "SELECT"].includes(row.elements[key].tagName)) {
                        row.elements[key].value = item[key];
                    } else {
                        row.elements[key].textContent = item[key];
                    }
                }
            });

            return row.container;
        });

        root.elements.rows.replaceChildren(...nextRows);
    };

    return { ...root, render };
}