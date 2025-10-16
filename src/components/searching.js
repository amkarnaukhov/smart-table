/**
 * Инициализация системы поиска
 */
export function setupSearch(searchFieldName) {
    return (query, state, action) => {
        return state[searchFieldName]
            ? Object.assign({}, query, {
                search: state[searchFieldName],
            })
            : query;
    };
}