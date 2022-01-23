"use strict";
/* *********************************** Typing **************************************** */
let template = document.createElement("template");
template.innerHTML = `
<link href="/css/font-awesome.min.css" rel="stylesheet" type="text/css">
<style>
table {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    
}
thead {
    font-size: var(--font-size-title, 20px);
    background-color: var(--background-title-color, #4da6ff);
    color: var(--font-color-title, black);
}
td, tr {
    border-style: var(--cell-border-style, solid);
    border-color: var(--cell-border-color, black);
    border-width: var(--cell-border-width, 2px);
}
tr:nth-child(even){background-color: var(--color-switch-line, #f2f2f2);}
.filter{
    background-color: var(--search-background-color, grey);
    border-radius: 25px;
}
.search{
    border-radius: 25px;
    border-width: 1px;
}
tbody>tr:hover {background-color: var(--mouse-over-cell-color, #ccc);}
.badge {
    display: inline-block;
    min-width: 1.5em; /* em unit */
    padding: .3em; /* em unit */
    border-radius: 100%;
    font-size: 14px;
    text-align: center;
    color: #fefefe;
}
.string {
    background: #1779ba;
}
.number {
    background: #a2ade8;
}
.undefined {
    background: #a3101f;
}
.object {
    background: #137847;
}
.boolean {
    min-height: 1.5em;
    margin-bottom: 0px;
    background: #b35a27;
}
.labels {
    background-color: #D3D3D3;
    /*width: 100%-4rem;*/
    padding: 2rem;
    box-shadow: 0 1.5rem 1rem -1rem rgba(0, 0, 0, .1);
    border-radius: .3rem;
}
.sortable{
    cursor: pointer;
}
</style>
`;
/**
 * Lambda function to concatenate string
 *
 * @param  {string} res
 * @param  {string} str
 */
const concat = (res, str) => res + str;
/**
 * Generate the template of an icon
 *
 * @param  {string} icon CSS class from font-awesome.css
 * @returns string
 */
const tplIcon = (icon) => `<i class="${icon}"></i>`;
/**
 * Generate the template for the filter feature
 *
 * @returns string
 */
const tplFilters = () => ` <button type="button" class="filter">Filter</button><input type="text" class="search" placeholder="  Type to Search..." hidden/>`;
/**
 * Generate the template for the order caret
 *
 * @param  {string} order 0: default, 1: a->z order, -1: z->a order
 * @param  {string} caret Character caret to visualize the order
 */
const tplOrder = (order, caret) => `<span data-order="${order}">${caret}</span>`;
/**
 * Generate the template for a table table
 *
 * @param  {any} data
 * @param  {string} column
 */
const tplCell = (data, column) => `<td data-header="${column}"><span>${data}</span>
    </td>`;
/**
 * Generate the template for the table rows
 *
 * @param  {IConfig} props
 * @param  {IRow} data
 */
const tplLine = (props, data) => `<tr id="tr_${data.id}">
${props.keys.map(key => tplCell(data.row[key], key)).reduce(concat)}
</tr>
`;
/**
 * Generate the template for the table header
 *
 * @param  {IConfig} props
 * @returns string
 */
const tplHeader = (props) => {
    let header = "";
    for (let i = 0; i < props.keys.length; i++) {
        header += `<th data-key="${props.keys[i]}">${props.icons ? tplIcon(props.icons[i]) : ""} <span class="sortable"><span class="il-table-header">${props.headers[i]}</span> <span data-order="0">▶</span></span>${tplFilters()}</th>`;
    }
    return header;
};
/**
 * Generate the template for the table
 *
 * @param  {IConfig} props
 */
const tplTable = (props) => `
    <thead>
        <tr>
            ${tplHeader(props)}
        </tr>
    </thead>
    <tbody>
    </tbody>`;
class TableList extends HTMLElement {
    /**
     * Constructor of TableList
     */
    constructor() {
        super();
        this.data = [];
        /**
         * Utils function to compare elements in array
         *
         * @param  {string} property
         */
        this.dynamicSort = (property) => {
            var sortOrder = 1;
            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return function (a, b) {
                var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                return result * sortOrder;
            };
        };
        /**
         * Restore the default state of the sorting and filtering elements
         *
         * @param  {HTMLElement} sortElementToPrevent?
         * @param  {HTMLElement} filterElementToPrevent?
         */
        this.restoreDefaultSorting = (sortElementToPrevent, filterElementToPrevent) => {
            let tableHead = this.shadow.querySelector('thead');
            let inputs = tableHead.querySelectorAll('input');
            inputs.forEach((input) => {
                let dataKey = input.parentElement.getAttribute("data-key");
                if (dataKey != (filterElementToPrevent === null || filterElementToPrevent === void 0 ? void 0 : filterElementToPrevent.getAttribute("data-key"))) {
                    input.value = "";
                    input.setAttribute("hidden", "true");
                }
            });
            let sortElements = tableHead.querySelectorAll(".sortable");
            sortElements.forEach((elt) => {
                if (elt != sortElementToPrevent) {
                    let orderElement = elt.lastElementChild;
                    orderElement.remove();
                    elt.insertAdjacentHTML("beforeend", tplOrder("0", "▶"));
                }
            });
        };
        /**
         * Function to handle the click event on the table head to sort the data
         *
         * @param  {MouseEvent} evt
         */
        this.handleSorting = (evt) => {
            let elt = evt.currentTarget;
            let parentElement = elt.parentElement;
            let key = parentElement.getAttribute("data-key");
            let orderElement = elt.lastElementChild;
            let order = orderElement.getAttribute("data-order");
            orderElement.remove();
            this.restoreDefaultSorting(elt, undefined);
            let sortedData = [...this.data];
            switch (order) {
                case "0":
                    elt.insertAdjacentHTML("beforeend", tplOrder("1", "▲"));
                    sortedData.sort(this.dynamicSort(key ? key : ""));
                    this.setSortCache({ key: key, order: "1" });
                    break;
                case "-1":
                    elt.insertAdjacentHTML("beforeend", tplOrder("0", "▶"));
                    sortedData = this.data;
                    this.setSortCache({ key: key, order: "0" });
                    break;
                case "1":
                    elt.insertAdjacentHTML("beforeend", tplOrder("-1", "▼"));
                    sortedData.sort(this.dynamicSort("-" + key));
                    this.setSortCache({ key: key, order: "-1" });
                    break;
            }
            const table = this.shadow.querySelector("table");
            const tbody = table.tBodies[0];
            let i = 0;
            sortedData.forEach((row) => {
                this.appendRow(tbody, { id: i, row: row });
                i++;
            });
        };
        /**
         * Function to handle the click event on the filter button
         *
         * @param  {Event} evt
         */
        this.handleFilter = (evt) => {
            let elt = evt.target;
            console.log('filter');
            this.restoreDefaultSorting(undefined, elt.parentElement);
            let tableBody = this.shadow.querySelector("tbody");
            let tableRow = tableBody.querySelectorAll(`tr[hidden="true"]`);
            tableRow.forEach((tr) => tr.removeAttribute("hidden"));
            let lastElementChild = elt.parentElement.lastElementChild;
            if (lastElementChild.getAttribute("hidden") != null) {
                lastElementChild.removeAttribute("hidden");
            }
            else {
                lastElementChild.setAttribute("hidden", "true");
            }
        };
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.appendChild(template.content.cloneNode(true));
    }
    /**
     * Lifecycle connected callback
     */
    connectedCallback() {
    }
    /**
     * Setup observed attributes for the lifecycle attribute changed callback
     */
    static get observedAttributes() {
        return ["src", "columns", "icons"];
    }
    /**
     * Lifecycle attribute changed callback
     *
     * @param  {string} namAttr Attriubte name changed
     * @param  {string} valOld Old value of the attribute
     * @param  {string} valNew New value of the attribute
     */
    attributeChangedCallback(namAttr, valOld, valNew) {
        console.log(`Attribute ${namAttr} changes from ${valOld} to ${valNew}`);
        switch (namAttr) {
            case 'icons':
                this.updateIcons(valNew);
                break;
            case 'src':
                this.initTable();
                break;
            case 'columns':
                this.updateColumns(valNew);
        }
    }
    /**
     * Lifecycle disconnected callback, remove all event listener binded to the web component
     */
    disconnectedCallback() {
        const buttonFilter = this.shadow.querySelectorAll(".filter");
        const inputFilter = this.shadow.querySelectorAll(".search");
        const headers = this.shadow.querySelectorAll(".sortable");
        buttonFilter.forEach((btn) => {
            btn.removeEventListener("click", this.handleFilter.bind(this));
        });
        inputFilter.forEach((btn) => {
            btn.removeEventListener("input", this.handleSearch.bind(this));
        });
        headers.forEach((header) => {
            header.removeEventListener("click", this.handleSorting.bind(this));
        });
    }
    /**
     * Setter function for columns attribute
     *
     * @param  {string} valNew New value for the attribute
     */
    set columns(valNew) {
        this.setAttribute("columns", valNew);
    }
    /**
     * Getter function for columns attribute
     *
     * @returns string JSON string contained in the attribute
     */
    get columns() {
        var _a;
        const attr = (_a = this.getAttribute("columns")) !== null && _a !== void 0 ? _a : '{"key0" : "Header0", "key1", "Header1"}';
        return attr;
    }
    /**
     * Setter function for src attribute
     *
     * @param  {string} valNew New value for the attribute
     */
    set src(valNew) {
        this.setAttribute("src", valNew);
    }
    /**
     * Getter function for src attribute
     *
     * @returns string JSON string contained in the attribute
     */
    get src() {
        var _a;
        const attr = (_a = this.getAttribute("src")) !== null && _a !== void 0 ? _a : "";
        return attr;
    }
    /**
     * Setter function for icons attribute
     *
     * @param  {string} valNew New value for the attribute
     */
    set icons(valNew) {
        this.setAttribute("icons", valNew);
    }
    /**
     * Getter function for icons attribute
     *
     * @returns string JSON object containing the icons class from font-awesome
     */
    get icons() {
        var _a;
        const attr = (_a = this.getAttribute("icons")) !== null && _a !== void 0 ? _a : "";
        return attr;
    }
    /**
     *
     *
     * @returns IConfig Component configuration from attributes
     */
    getProps() {
        const jsoColumns = JSON.parse(this.columns);
        const jsoIcons = this.icons == "" ? null : JSON.parse(this.icons);
        return {
            headers: Object.values(jsoColumns),
            keys: Object.keys(jsoColumns),
            icons: jsoIcons ? Object.values(jsoIcons) : null
        };
    }
    /**
     * Allow the update of the columns header
     *
     * @param  {string} valNew New value for the attribute
     */
    updateColumns(valNew) {
        const jsoColumns = JSON.parse(valNew);
        Object.keys(jsoColumns).forEach(key => {
            let thead = this.shadow.querySelector(`th[data-key="${key}"] > .sortable > .il-table-header`);
            if (thead != null) {
                thead.innerHTML = jsoColumns[key];
            }
        });
    }
    /**
     * Allow the update of the icons
     *
     * @param  {string} valNew New value for the attribute
     */
    updateIcons(valNew) {
        const jsoIcons = JSON.parse(valNew);
        Object.keys(jsoIcons).forEach(key => {
            let thead = this.shadow.querySelector(`th[data-key="${key}"]`);
            if (thead != null) {
                let icon = thead.querySelector("i");
                icon.remove();
                thead.insertAdjacentHTML("afterbegin", tplIcon(jsoIcons[key]));
            }
        });
    }
    /**
     * Return the last sorting indicator stored in the local cache
     *
     * @returns ISort
     */
    getSortCache() {
        let cache = localStorage.getItem('sort');
        if (cache) {
            let json = JSON.parse(cache);
            return json;
        }
        else {
            return { key: "", order: "" };
        }
    }
    /**
     * Store the value of the current sorting indicator in the local cache
     *
     * @param  {ISort} sortCache
     */
    setSortCache(sortCache) {
        localStorage.setItem('sort', JSON.stringify(sortCache));
    }
    /**
     * Return the last filtering indicator stored in the local cache
     *
     * @returns IFilter
     */
    getFilterCache() {
        let cache = localStorage.getItem("filter");
        if (cache) {
            let json = JSON.parse(cache);
            return json;
        }
        else {
            return { key: "", value: "" };
        }
    }
    /**
     * Store the current filtering indicator in the local cache
     *
     * @param  {IFilter} filterCache
     */
    setFilterCache(filterCache) {
        localStorage.setItem("filter", JSON.stringify(filterCache));
    }
    /**
     * Search for sorting or filtering indicator in the local cache and trigger event to match these indicator
     */
    loadCacheValues() {
        let filter = this.getFilterCache();
        let sort = this.getSortCache();
        if (sort.key != "") {
            let element = this.shadow.querySelector(`th[data-key="${sort.key}"]  > .sortable`);
            if (sort.order == "1")
                element.dispatchEvent(new Event("click", { 'bubbles': true }));
            else if (sort.order == "-1") {
                element.dispatchEvent(new Event("click", { 'bubbles': true }));
                element.dispatchEvent(new Event("click", { 'bubbles': true }));
            }
        }
        if (filter.key != "") {
            let button = this.shadow.querySelector(`th[data-key="${filter.key}"] > button`);
            button.dispatchEvent(new Event("click", { 'bubbles': true }));
            let element = this.shadow.querySelector(`th[data-key="${filter.key}"] > input`);
            element.removeAttribute("hidden");
            element.value = filter.value;
            element.dispatchEvent(new Event("input", { 'bubbles': true }));
        }
    }
    /**
     * Function to handle input event on the search input
     *
     * @param  {Event} evt
     */
    handleSearch(evt) {
        //evt.preventDefault();
        let elt = evt.target;
        let value = elt.value.trim();
        let parentElement = elt.parentElement;
        let key = parentElement.getAttribute("data-key");
        this.setFilterCache({ key: key, value: value });
        this.restoreDefaultSorting(undefined, parentElement);
        let tableBody = this.shadow.querySelector("tbody");
        let tableData = tableBody.querySelectorAll(`td[data-header="${key}"]`);
        tableData.forEach((td) => {
            td.lastElementChild.textContent.toLowerCase().includes(value.toLowerCase()) ? td.parentElement.removeAttribute("hidden") : td.parentElement.setAttribute("hidden", "true");
        });
    }
    /**
     * Append a data row to the table body
     *
     * @param  {HTMLTableSectionElement} tbody The table body
     * @param  {IRow} data The data to insert
     */
    appendRow(tbody, data) {
        const row = tbody.querySelector("#tr_" + data.id);
        if (row != null) {
            row.remove();
        }
        const props = this.getProps();
        const line = tplLine(props, data);
        tbody.insertAdjacentHTML("beforeend", line);
    }
    /**
     * Function to fetch data from the src attribute and load it
     */
    loadData() {
        if (this.src == "")
            console.error("specify base URL of http data service in src attribute");
        fetch(this.src, {
            method: "GET",
            headers: { "Accept": "application/json; charset=UTF-8" }
        })
            .then(resp => {
            return resp.json();
        })
            .then(map => {
            const table = this.shadow.querySelector("table");
            const tbody = table.tBodies[0];
            const props = this.getProps();
            let i = 0;
            for (let id in map) {
                const s = JSON.parse(this.columns);
                for (let column in props.keys) {
                    let c = props.keys[column];
                    if (map[id][c]) {
                        s[c] = map[id][c];
                    }
                    else {
                        s[c] = "";
                    }
                }
                let data = { id: i, row: s };
                this.data.push(s);
                this.appendRow(tbody, data);
                i++;
            }
            this.listenEvents();
            this.loadCacheValues();
        })
            .catch((reason) => {
            console.error(reason);
        });
    }
    /**
     * Instanciate and bind sorting and fitlering event listeners
     *
     * @event "click" on table header to trigger sorting function
     * @event "click" on filter button to reveal the search input
     * @event "input" on seacrh input to trigger filtering function
     */
    listenEvents() {
        const buttonFilter = this.shadow.querySelectorAll(".filter");
        const inputFilter = this.shadow.querySelectorAll(".search");
        const headers = this.shadow.querySelectorAll(".sortable");
        buttonFilter.forEach((btn) => {
            btn.addEventListener("click", this.handleFilter.bind(this));
        });
        inputFilter.forEach((btn) => {
            btn.addEventListener("input", this.handleSearch.bind(this));
        });
        headers.forEach((header) => {
            header.addEventListener("click", this.handleSorting.bind(this));
        });
    }
    /**
     * Function to initialize the Table
     */
    initTable() {
        let table = this.shadow.querySelector("table");
        if (table != null) {
            table.remove();
            table = null;
        }
        if (table == null) {
            this.shadow.appendChild(document.createElement("table"));
            table = this.shadow.querySelector("table");
        }
        if (table != null) {
            const props = this.getProps();
            table.insertAdjacentHTML("afterbegin", tplTable(props));
            this.loadData();
        }
    }
}
customElements.define("il-table", TableList);
//# sourceMappingURL=il-table.js.map