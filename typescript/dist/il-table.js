"use strict";
//import { sort } from "./sort";
let css = document.createElement("template");
css.innerHTML = `
<style>
table {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
    
}
thead {
    background-color: #4da6ff;
    font-size: 20px;
}
td, tr {
    border-style: solid;
    border-color: black;
    border-width: 2px;
}
tr:nth-child(even){background-color: #f2f2f2;}
.filter{
    background-color: grey;
    border-radius: 25px;
}
.search{
    border-radius: 25px;
    border-width: 1px;
}
tbody>tr:hover {background-color: #ccc;}
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
const getLibBadge = (type) => {
    switch (type) {
        case 'string':
            type = "a-Z";
            break;
        case 'number':
            type = "0-9";
            break;
        case 'undefined':
            type = "NaN";
            break;
        case 'object':
            type = "{ }";
            break;
        case 'boolean':
            type = " ";
            break;
    }
    return type;
};
const concat = (res, str) => res + str;
const tplFilters = () => ` <button type="button" class="filter">Filter</button><input type="text" class="search" hidden/>`;
const tplOrder = (order, cartet) => `<span data-order="${order}">${cartet}</span>`;
const tplCell = (data, column) => `<td data-header="${column}" data-type="${typeof data}">
    <span class="badge ${typeof data}">${getLibBadge(typeof data)}</span><span>${data}</span>
    </td>`;
const tplLine = (props, data) => `<tr id="tr_${data.id}">
${props.keys.map(key => tplCell(data.row[key], key)).reduce(concat)}
</tr>
`;
const tplHeader = (props) => {
    let header = "";
    for (let i = 0; i < props.keys.length; i++) {
        header += `<td data-key="${props.keys[i]}"><span class="sortable">${props.headers[i]} <span data-order="0">▶</span></span>${tplFilters()}</td>`;
    }
    return header;
};
const tplTable = (props) => `
    <thead>
        <tr>
            ${tplHeader(props)}
        </tr>
    </thead>
    <tbody>
    </tbody>`;
class TableList extends HTMLElement {
    constructor() {
        super();
        this.data = [];
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
        this.restoreDefaultSorting = (sortElementToPrevent) => {
            let tableHead = this.shadow.querySelector('thead');
            let inputs = tableHead.querySelectorAll('input');
            inputs.forEach((input) => {
                input.value = "";
                input.setAttribute("hidden", "true");
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
        this.handleSorting = (evt) => {
            let elt = evt.currentTarget;
            let parentElement = elt.parentElement;
            let key = parentElement.getAttribute("data-key");
            let orderElement = elt.lastElementChild;
            let order = orderElement.getAttribute("data-order");
            orderElement.remove();
            this.restoreDefaultSorting(elt);
            let sortedData = [...this.data];
            switch (order) {
                case "0":
                    elt.insertAdjacentHTML("beforeend", tplOrder("1", "▲"));
                    sortedData.sort(this.dynamicSort(key ? key : ""));
                    break;
                case "-1":
                    elt.insertAdjacentHTML("beforeend", tplOrder("0", "▶"));
                    sortedData = this.data;
                    break;
                case "1":
                    elt.insertAdjacentHTML("beforeend", tplOrder("-1", "▼"));
                    sortedData.sort(this.dynamicSort("-" + key));
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
        this.handleFilter = (evt) => {
            let elt = evt.target;
            console.log('filter');
            let tableHead = this.shadow.querySelector('thead');
            let inputs = tableHead.querySelectorAll('input');
            inputs.forEach((input) => {
                let dataKey = input.parentElement.getAttribute('data-key');
                if (dataKey != elt.parentElement.getAttribute("data-key")) {
                    input.value = "";
                    input.setAttribute("hidden", "true");
                }
            });
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
        this.shadow.appendChild(css.content.cloneNode(true));
        //_shadow.appendChild(template.content.cloneNode(true))
    }
    connectedCallback() {
        this.initTable();
        // fetch(this.src,{headers: {'Accept':'application/json'}})
        // .then(response => response.json())
        // .then(data => {
        //     if(Object.keys(data).length != 1){
        //         this._items = data
        //     }else{
        //         this._items = data[Object.keys(data)[0]]; 
        //     }
        //     console.log(data);
        //     this.initTable();
        //     const _sortButton = this.querySelectorAll(".sort")
        //     const _filterButton = this.querySelectorAll(".filter")
        //     const _filterInput = this.querySelectorAll(".search")
        //     // _sortButton.forEach((btn) => {
        //     //     btn.addEventListener("click", this.handleSort)
        //     // })
        //     // _filterButton.forEach((btn) => {
        //     //     btn.addEventListener("click", this.handleFilter)
        //     // })
        //     // _filterInput.forEach((btn) => {
        //     //     btn.addEventListener("keydown", this.handleSearch)
        //     // })
        //     // this.loadCacheValues()
        // })
        // .catch(error => console.error(error))
    }
    static get observedAttributes() {
        return ["src", "columns"];
    }
    attributeChangedCallback(namAttr, valOld, valNew) {
        console.log(`attribute ${namAttr} changes from ${valOld} to ${valNew}`);
    }
    disconnectedCallback() {
        // _sortButton.forEach((btn) => {
        //     btn.removeEventListener("click", this.handleSort);
        // })
        // _filterButton.forEach((btn) => {
        //     btn.removeEventListener("click", this.handleFilter)
        // })
        // _filterInput.forEach((btn) => {
        //     btn.removeEventListener("keydown", this.handleSearch)
        // })
    }
    refreshCacheValues() {
        // localStorage.setItem('filter', JSON.stringify(this._filters))
        // localStorage.setItem('sort', JSON.stringify(this._sorts))
    }
    loadCacheValues() {
        let filter, sort;
        if (filter = localStorage.getItem('filter')) {
            filter = JSON.parse(filter);
            console.log(filter);
        }
        if (sort = localStorage.getItem('sort')) {
            sort = JSON.parse(sort);
        }
        let element = this.querySelector('th[data-key="author"]  > button[data-order="-1"]');
        this.querySelector('th[data-key="author"]  > button[data-order="-1"]').dispatchEvent(new Event("click", { 'bubbles': true }));
        //element.dispatchEvent(new Event("click"))
    }
    handleSearch(evt) {
        //evt.preventDefault();
        let elt = evt.target;
        let value = elt.value.trim();
        let parentElement = elt.parentElement;
        let key = parentElement.getAttribute("data-key");
        let tableHead = this.shadow.querySelector('thead');
        let inputs = tableHead.querySelectorAll('input');
        inputs.forEach((input) => {
            let dataKey = input.parentElement.getAttribute("data-key");
            if (dataKey != parentElement.getAttribute("data-key")) {
                input.value = "";
                input.setAttribute("hidden", "true");
            }
        });
        let tableBody = this.shadow.querySelector("tbody");
        let tableData = tableBody.querySelectorAll(`td[data-header="${key}"]`);
        tableData.forEach((td) => {
            td.lastElementChild.textContent.toLowerCase().includes(value.toLowerCase()) ? td.parentElement.removeAttribute("hidden") : td.parentElement.setAttribute("hidden", "true");
        });
    }
    set columns(valNew) {
        this.setAttribute("columns", valNew);
    }
    get columns() {
        var _a;
        const attr = (_a = this.getAttribute("columns")) !== null && _a !== void 0 ? _a : '{"key0" : "Header0", "key1", "Header1"}';
        return attr;
    }
    get src() {
        var _a;
        const attr = (_a = this.getAttribute("src")) !== null && _a !== void 0 ? _a : "";
        return attr;
    }
    getProps() {
        const jsoColumns = JSON.parse(this.columns);
        return {
            headers: Object.values(jsoColumns),
            keys: Object.keys(jsoColumns)
        };
    }
    appendRow(tbody, data) {
        const row = tbody.querySelector("#tr_" + data.id);
        if (row != null) {
            row.remove();
        }
        const props = this.getProps();
        const line = tplLine(props, data);
        tbody.insertAdjacentHTML("beforeend", line);
    }
    // update() {
    //     let tableBody: HTMLElement |null = this.querySelector("tbody")
    //     this.querySelector("tbody")!.innerHTML = ""
    //     this._rows.forEach((row) => {
    //         var toInsert = `<tr id="tr_${row['id']}">`
    //         this._columns.forEach((column) => {
    //             if(row.hasOwnProperty(column) && row[column] != null) {
    //                 toInsert +=  `<td data-header="${column}" data-type="${typeof row[column]}"><span class="badge ${typeof row[column]}">${this.getLibBadge(typeof row[column])}</span> <span>${row[column]}</span></td>`
    //             }
    //             else {
    //                 row[column] = null
    //                 toInsert += `<td></td>`
    //             }
    //         })
    //         toInsert += `</tr>`
    //         tableBody!.insertAdjacentHTML("beforeend",toInsert);
    //     });
    //     localStorage.setItem('data',this._rows)
    //     //console.log(this._rows.sort(dynamicSortMultiple("author","id")))
    // }
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
        })
            .catch((reason) => {
            console.error(reason);
        });
    }
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
    initTable() {
        let table = this.shadow.querySelector("table");
        if (table == null) {
            this.shadow.appendChild(document.createElement("table"));
            table = this.shadow.querySelector("table");
        }
        if (table != null) {
            console.log('in');
            const props = this.getProps();
            table.insertAdjacentHTML("afterbegin", tplTable(props));
            this.loadData();
        }
    }
}
customElements.define("il-table", TableList);
//# sourceMappingURL=il-table.js.map