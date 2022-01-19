//import { sort } from "./sort";

let template = document.createElement("template");
template.innerHTML  = `
    
    <style>
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
    </style>
    <div class="labels">
        <span class="badge string">a-Z</span> <span>String</span>
        <span class="badge number">0-9</span> <span>Number</span>
        <span class="badge object">{ }</span> <span>Object/span>
        <span class="badge undefined">NaN</span> <span>Undefined</span>
        <span class="badge boolean"> </span> <span>Boolean</span>
    </div>
    <table>
        <thead>
        </thead>
        <tbody>
        </tbody>
    </table>
`



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
}

const getLibBadge = (type: string) => {
    switch(type) {
        case 'string': 
            type = "a-Z"
            break
        case 'number':
            type = "0-9"
            break
        case 'undefined':
            type = "NaN"
            break
        case 'object':
            type = "{ }"
            break
        case 'boolean':
            type = " "
            break
    }
    return type
}

const concat = (res: string, str: string) => res + str

const tplFilters = (): string => ` <button type="button" class="sort" data-order="1">Sort 1</button><button type="button" class="sort" data-order="-1">Sort -1</button><button type="button" class="filter">Filter</button><input type="text" class="search" hidden/>`

const tplCell = (data: any, column: string) => `<td data-header="${column}" data-type="${typeof data}">
    <span class="badge ${typeof data}">${getLibBadge(typeof data)}</span><span>${data}</span>
    </td>`

const tplLine = (props: IConfig, data: IRow) => `<tr id="tr_${data.id}">
${props.keys.map(key => tplCell(data.row[key], key)).reduce(concat)}
</tr>
`
const tplHeader = (props: IConfig): string => {
    let header = ""
    for(let i = 0; i< props.keys.length; i++){
        header += `<td data-key="${props.keys[i]}">${props.headers[i]}${tplFilters()}</td>`
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

    protected _items:any = {}
    protected data: IRow[] = []

    protected _columns:Array<String> = [];
    protected _rows = [];

    protected _filters:any = {}
    protected _sorts:any = {}

    protected shadow: any

     

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: "open"});
        //_shadow.appendChild(template.content.cloneNode(true))

    }

    connectedCallback() {
        this.initTable()
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
        return ["src", "columns"]
    }

    attributeChangedCallback(namAttr: string, valNew: string, valOld: string) {
        console.log(`attribute ${namAttr} changes from ${valOld} to ${valNew}`)
    }

    disconnectedCallback() {
        this.querySelector('tbody')!.innerHTML = "";
        this.querySelector('tbhead')!.innerHTML = "";
        const _sortButton = this.querySelectorAll(".sort")
        const _filterButton = this.querySelectorAll(".filter")
        const _filterInput = this.querySelectorAll(".search")

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
        localStorage.setItem('filter', JSON.stringify(this._filters))
        localStorage.setItem('sort', JSON.stringify(this._sorts))
        
    }

    loadCacheValues() {
        let filter, sort
        if(filter = localStorage.getItem('filter')) {
            filter = JSON.parse(filter)
            console.log(filter)
            
        }
        if(sort = localStorage.getItem('sort')) {
            sort = JSON.parse(sort)
        }
        
        let element = this.querySelector('th[data-key="author"]  > button[data-order="-1"]')
        this.querySelector('th[data-key="author"]  > button[data-order="-1"]')!.dispatchEvent(new Event("click", { 'bubbles': true }))
        //element.dispatchEvent(new Event("click"))
        
    }

    handleSearch(evt: Event) {
            evt.preventDefault();
            console.log('search')
        //     let elt = evt.target as HTMLInputElement
        //     var value = elt.value.trim();
        //     let parentNode = elt.parentElement
        //     var key = parentNode!.getAttribute("data-key")
        //     let inputs = this.querySelector('thead')!.querySelectorAll("input")
        //     inputs.forEach(input => {
        //         let dataKey = input!.parentElement!.getAttribute("data-key")
        //         if (dataKey != parentNode!.getAttribute("data-key")) {
        //             this._filters[dataKey!] = ""
        //             input.value =""; 
        //             input.setAttribute("hidden","true");
        //         }
                    
        //     })
        //     this._filters[key!] = value
        //     this.querySelector("tbody")!.querySelectorAll(`td[data-header="${key}"]`).forEach(td => {td!.lastElementChild!.textContent!.toLowerCase().includes(value.toLowerCase()) ? td!.parentElement!.removeAttribute("hidden") : td.parentElement!.setAttribute("hidden","true")})
        

        // this.refreshCacheValues()
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

    handleSort = (evt: Event) => {
        console.log('sorting')
        console.log(this.data)
        let elt = evt.target as HTMLInputElement
        let parentElement = elt.parentElement
        if(parentElement != null){
            let key = parentElement.getAttribute("data-key")
            let order = parentElement.getAttribute("data-order")
            let sortedData = [...this.data]
            console.log(sortedData)
            sortedData.sort(this.dynamicSort("-title"))
            console.log(sortedData)
            console.log(this.data)
            const table = this.shadow.querySelector("table")!
            const tbody = table.tBodies[0]
            let i = 0
            sortedData.forEach((row) => {
                this.appendRow(tbody,{id:i,row:row})
                i++;
            })
        }

        

        // let elt = evt.target as HTMLInputElement
        // let parentNode = elt.parentElement
        // var key = parentNode!.getAttribute("data-key")
        // var order = parentNode!.getAttribute("data-order")
        // this._sorts[key!] = order
        // //order == "-1" ? this._rows.sort(dynamicSort("-"+key)) : this._rows.sort(dynamicSort(key))
        // this.update()
        // this.refreshCacheValues()
        
    }

    handleFilter = (evt: Event) => {
        let elt = evt.target as HTMLElement
        console.log('filter')
        // let tableHead: HTMLElement | null = this.querySelector('thead')
        // let inputs = tableHead!.querySelectorAll('input')
        // tableHead!.querySelectorAll("input").forEach(input => {
        //     let dataKey = input!.parentElement!.getAttribute('data-key')
        //     if (dataKey != elt!.parentElement!.getAttribute("data-key")) {
        //         this._filters[dataKey!] = ""
        //         input.value =""; 
        //         input.setAttribute("hidden","true");
        //     }      
        // })
        // let lastChild = elt!.parentElement!.lastElementChild
        // if(lastChild!.getAttribute("hidden") != null){
        //     lastChild!.removeAttribute("hidden")
        // }
        // else{
        //     lastChild!.setAttribute("hidden","true")
        //     let dataKey = elt.parentElement!.getAttribute("data-key")
        //     this._filters[dataKey!] = ""
        //     this.update()
        // }
        // this.refreshCacheValues()
    }

    isInColumns(column: string) {
        return this._columns.includes(column);
    }

    

    get columns(): string {
        const attr = this.getAttribute("columns") ?? '{"key0" : "Header0", "key1", "Header1"}'
        return attr
    }

    get src(): string {
        const attr = this.getAttribute("src") ?? ""
        return attr
    }

    getProps(): IConfig {
        const jsoColumns = JSON.parse(this.columns)
        return {
            headers: Object.values(jsoColumns),
            keys: Object.keys(jsoColumns)
        }
    }

    appendRow(tbody: HTMLTableSectionElement, data: IRow) {
        const row = tbody.querySelector("#tr_"+data.id)
        if (row != null) {
            row.remove()
        }
        const props = this.getProps()
        const line = tplLine(props,data)
        console.log(line)
        tbody.insertAdjacentHTML("beforeend", line)
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

    getButtons(){
        return ` <button type="button" class="sort" data-order="1">Sort 1</button><button type="button" class="sort" data-order="-1">Sort -1</button><button type="button" class="filter">Filter</button><input type="text" class="search" hidden/>`
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
        })
        .catch((reason: any) => {
            console.error(reason)
        })
        
    }
    listenEvents(){
        const buttonSort = this.shadow.querySelectorAll(".sort")
        const buttonFilter = this.shadow.querySelectorAll(".filter")
        const inputFilter = this.shadow.querySelectorAll(".search")
        buttonSort.forEach((btn: HTMLElement) => {
            btn.addEventListener("click", this.handleSort.bind(this))
        });
        buttonFilter.forEach((btn: HTMLElement) => {
            btn.addEventListener("click", this.handleFilter.bind(this))
        })
        inputFilter.forEach((btn: HTMLElement) => {
            btn.addEventListener("keydown", this.handleSearch.bind(this))
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
        
    //   this._items.forEach((item,idx) => {
    //       var row = Object()
    //       row["id"] = idx;
    //       var i = 0
    //       for(const [key,value] of Object.entries(item)) {
    //         if(!this.isInColumns(key)){
    //             this._columns.push(key);
    //         }
    //         row[key] = value;
    //         i++
    //       }
    //       this._rows.push(row);
    //   });
    //   this._tableHead.innerHTML = ""

    //     var header = `<tr>`;
    //     this._columns.forEach((item) => {
    //     header += `<th data-key="${item}">${item} ${this.getButtons()}</th>`
    //     });
    //     header += `</tr>`;
    //     this._tableHead.insertAdjacentHTML("beforeend",header);

    //     this._sortButton = this._shadow.querySelectorAll(".sort");
    //     this._filterButton = this._shadow.querySelectorAll(".filter");
    //     this._filterInput = this._shadow.querySelectorAll(".search");
    //     console.log(this._sortButton)
    //   this.update()

      
    }
}
customElements.define("il-table", TableList);