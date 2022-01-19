/**
 * Returns a comparator for objects of type T that can be used by sort
 * functions, were T objects are compared by the specified T properties.
 *
 * @param sortBy - the names of the properties to sort by, in precedence order.
 *                 Prefix any name with `-` to sort it in descending order.
 */
export function byPropertiesOf(sortBy) {
    function compareByProperty(arg) {
        let key;
        let sortOrder = 1;
        if (typeof arg === 'string' && arg.startsWith('-')) {
            sortOrder = -1;
            // Typescript is not yet smart enough to infer that substring is keyof T
            key = arg.substr(1);
        }
        else {
            // Likewise it is not yet smart enough to infer that arg is not keyof T
            key = arg;
        }
        return function (a, b) {
            const result = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
            return result * sortOrder;
        };
    }
    return function (obj1, obj2) {
        let i = 0;
        let result = 0;
        const numberOfProperties = sortBy === null || sortBy === void 0 ? void 0 : sortBy.length;
        while (result === 0 && i < numberOfProperties) {
            result = compareByProperty(sortBy[i])(obj1, obj2);
            i++;
        }
        return result;
    };
}
/**
 * Sorts an array of T by the specified properties of T.
 *
 * @param arr - the array to be sorted, all of the same type T
 * @param sortBy - the names of the properties to sort by, in precedence order.
 *                 Prefix any name with `-` to sort it in descending order.
 */
export function sort(arr, ...sortBy) {
    arr.sort(byPropertiesOf(sortBy));
}
//# sourceMappingURL=sort.js.map