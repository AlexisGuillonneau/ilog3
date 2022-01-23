/* *********************************** Typing **************************************** */

interface ICell {
    [key: string]: any
}

interface IRow {
    id: number
    row: ICell
}

interface IConfig {
    keys: string[]
    headers: string[]
    icons: string[]
}

interface IFilter {
    key: string,
    value: string
}

interface ISort {
    key: string,
    order: string
}

let template = document.createElement("template");
template.innerHTML  = `
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
`

const concat = (res: string, str: string) => res + str

const tplIcon = (icon: string) : string => `<i class="${icon}"></i>`

const tplFilters = (): string => ` <button type="button" class="filter">Filter</button><input type="text" class="search" placeholder="  Type to Search..." hidden/>`

const tplOrder = (order: string, caret: string) => `<span data-order="${order}">${caret}</span>`

const tplCell = (data: any, column: string) => `<td data-header="${column}"><span>${data}</span>
    </td>`

const tplLine = (props: IConfig, data: IRow) => `<tr id="tr_${data.id}">
${props.keys.map(key => tplCell(data.row[key], key)).reduce(concat)}
</tr>
`
const tplHeader = (props: IConfig): string => {
    let header = ""
    for(let i = 0; i< props.keys.length; i++){
        header += `<th data-key="${props.keys[i]}">${tplIcon(props.icons[i])} <span class="sortable">${props.headers[i]} <span data-order="0">▶</span></span>${tplFilters()}</th>`
    }
    return header
}

const tplTable = (props: IConfig) => `
    <thead>
        <tr>
            ${tplHeader(props)}
        </tr>
    </thead>
    <tbody>
    </tbody>`

class TableList extends HTMLElement{

    protected data: IRow[] = []

    protected shadow: any
     

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true))
        //_shadow.appendChild(template.content.cloneNode(true))

    }

    connectedCallback() {
        this.initTable()        
    }

    static get observedAttributes() {
        return ["src", "columns", "icons"]
    }

    attributeChangedCallback(namAttr: string, valOld: string, valNew: string) {
        console.log(`attribute ${namAttr} changes from ${valOld} to ${valNew}`)
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

    getSortCache(): ISort {
        let cache = localStorage.getItem('sort')
        if(cache) {
            let json = JSON.parse(cache)
            return json
        }else{
            return {key:"",order:""}
        }
    }

    setSortCache(sortCache: ISort){
       localStorage.setItem('sort', JSON.stringify(sortCache))
    }

    getFilterCache(): IFilter {
        let cache = localStorage.getItem("filter")
        if(cache) {
            let json = JSON.parse(cache)
            return json
        }else{
            return {key:"",value:""}
        }
    }

    setFilterCache(filterCache: IFilter) {
        localStorage.setItem("filter", JSON.stringify(filterCache))
    }

    loadCacheValues() {
        console.log("in");
        let filter: IFilter = this.getFilterCache()
        let sort: ISort = this.getSortCache()
        if(sort.key != "") {
            let element = this.shadow.querySelector(`th[data-key="${sort.key}"]  > .sortable`)
            if(sort.order == "1")
                element.dispatchEvent(new Event("click", { 'bubbles': true }))
            else if(sort.order == "-1"){
                element.dispatchEvent(new Event("click", { 'bubbles': true }))
                element.dispatchEvent(new Event("click", { 'bubbles': true }))
            }
        }
        if(filter.key != "") {
            let button = this.shadow.querySelector(`th[data-key="${filter.key}"] > button`)
            button.dispatchEvent(new Event("click", {'bubbles': true}))
            let element = this.shadow.querySelector(`th[data-key="${filter.key}"] > input`)
            element.removeAttribute("hidden")
            element.value = filter.value
            element.dispatchEvent(new Event("input", {'bubbles': true}))
        }
        
        
        
        
    }

    handleSearch(evt: Event) {
            //evt.preventDefault();
            let elt = evt.target as HTMLInputElement
            let value = elt.value.trim()
            let parentElement = elt.parentElement
            let key = parentElement!.getAttribute("data-key")
            this.setFilterCache({key: key!, value: value})
            this.restoreDefaultSorting(undefined,parentElement!)
            let tableBody: HTMLElement = this.shadow.querySelector("tbody")
            let tableData = tableBody.querySelectorAll(`td[data-header="${key}"]`)
            tableData.forEach((td) => {
                td.lastElementChild!.textContent!.toLowerCase().includes(value.toLowerCase()) ? td.parentElement!.removeAttribute("hidden") : td.parentElement!.setAttribute("hidden", "true")
            })
    }

    dynamicSort = (property: string) => {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a: any,b: any) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    restoreDefaultSorting = (sortElementToPrevent?: HTMLElement, filterElementToPrevent?: HTMLElement) => {
        let tableHead: HTMLElement = this.shadow.querySelector('thead')
        let inputs = tableHead.querySelectorAll('input')
        inputs.forEach((input) => {
            let dataKey = input.parentElement!.getAttribute("data-key")
            if (dataKey != filterElementToPrevent?.getAttribute("data-key")) {
                input.value = ""
            input.setAttribute("hidden","true")
            }
            
        })
        let sortElements = tableHead.querySelectorAll(".sortable")
        sortElements.forEach((elt) => {
            if(elt != sortElementToPrevent) {
                let orderElement = elt.lastElementChild
                orderElement!.remove()
                elt.insertAdjacentHTML("beforeend",tplOrder("0","▶"))
            }
            
        })
    }

    handleSorting = (evt: MouseEvent) => {
        let elt = evt.currentTarget as HTMLElement
        let parentElement = elt.parentElement
        let key = parentElement!.getAttribute("data-key")
        let orderElement = elt.lastElementChild
        let order = orderElement!.getAttribute("data-order")
        orderElement!.remove()
        this.restoreDefaultSorting(elt, undefined)
        let sortedData = [...this.data]
        switch(order) {
            case "0":
                elt.insertAdjacentHTML("beforeend",tplOrder("1","▲"))
                sortedData.sort(this.dynamicSort(key?key:""))
                this.setSortCache({key: key!, order: "1"})
                break
            case "-1":
                elt.insertAdjacentHTML("beforeend",tplOrder("0","▶"))
                sortedData = this.data
                this.setSortCache({key: key!, order: "0"})
                break
            case "1":
                elt.insertAdjacentHTML("beforeend",tplOrder("-1","▼"))
                sortedData.sort(this.dynamicSort("-"+key))
                this.setSortCache({key: key!, order: "-1"})
                break
        }
        const table = this.shadow.querySelector("table")!
        const tbody = table.tBodies[0]
        let i = 0
        sortedData.forEach((row) => {
            this.appendRow(tbody,{id:i,row:row})
            i++;
        })

    }

    handleFilter = (evt: Event) => {
        let elt = evt.target as HTMLElement
        console.log('filter')
        this.restoreDefaultSorting(undefined,elt.parentElement!)    
        let tableBody: HTMLElement = this.shadow.querySelector("tbody")
        let tableRow = tableBody.querySelectorAll(`tr[hidden="true"]`)
        tableRow.forEach((tr) => tr.removeAttribute("hidden"))
        let lastElementChild = elt.parentElement!.lastElementChild
        if (lastElementChild!.getAttribute("hidden") != null) {
            lastElementChild!.removeAttribute("hidden")
        }
        else {
            lastElementChild!.setAttribute("hidden","true")
        }
    }

    set columns(valNew: string) {
        this.setAttribute("columns",valNew)
    }
    

    get columns(): string {
        const attr = this.getAttribute("columns") ?? '{"key0" : "Header0", "key1", "Header1"}'
        return attr
    }

    get src(): string {
        const attr = this.getAttribute("src") ?? ""
        return attr
    }

    set icons(valNew: string) {
        this.setAttribute("icons", valNew)
    }

    get icons(): string {
        const attr = this.getAttribute("icons") ?? ""
        return attr
    }

    getProps(): IConfig {
        const jsoColumns = JSON.parse(this.columns)
        const jsoIcons = JSON.parse(this.icons)
        return {
            headers: Object.values(jsoColumns),
            keys: Object.keys(jsoColumns),
            icons: Object.values(jsoIcons)
        }
    }

    appendRow(tbody: HTMLTableSectionElement, data: IRow) {
        const row = tbody.querySelector("#tr_"+data.id)
        if (row != null) {
            row.remove()
        }
        const props = this.getProps()
        const line = tplLine(props,data)
     
        tbody.insertAdjacentHTML("beforeend", line)
    }

    loadData() {
        if (this.src == "")
            console.error("specify base URL of http data service in src attribute")
        fetch(this.src, {
            method: "GET",
            headers: {"Accept": "application/json; charset=UTF-8"}
        })
        .then(resp => {
            return resp.json()
        })
        .then(map => {
            const table = this.shadow.querySelector("table")!
            const tbody = table.tBodies[0]
            const props = this.getProps()
            let i: number = 0
            for (let id in map) {
                
                const s = JSON.parse(this.columns)

                for (let column in props.keys) {

                    let c = props.keys[column]
                    if (map[id][c]) {
                        s[c] = map[id][c] 
                    }else{
                        s[c] = ""
                    }
                }
                let data: IRow ={id: i, row: s}
                
                this.data.push(s)
                this.appendRow(tbody, data)
                i++
            }
            this.listenEvents()
            this.loadCacheValues()
        })
        .catch((reason: any) => {
            console.error(reason)
        })
        
    }

    

    listenEvents(){

        const buttonFilter = this.shadow.querySelectorAll(".filter")
        const inputFilter = this.shadow.querySelectorAll(".search")
        const headers = this.shadow.querySelectorAll(".sortable")
        buttonFilter.forEach((btn: HTMLElement) => {
            btn.addEventListener("click", this.handleFilter.bind(this))
        })
        inputFilter.forEach((btn: HTMLElement) => {
            btn.addEventListener("input", this.handleSearch.bind(this))
        })
        headers.forEach((header: HTMLElement) => {
            header.addEventListener("click", this.handleSorting.bind(this))
        })
    }

    initTable() {
        let table = this.shadow.querySelector("table")
        if (table == null) {
            this.shadow.appendChild(document.createElement("table"))
            table = this.shadow.querySelector("table")
        }
        if (table != null) {
            console.log('in')
            const props = this.getProps()
            table!.insertAdjacentHTML("afterbegin", tplTable(props))
            this.loadData()
            

        }      
    }
}
customElements.define("il-table", TableList);
