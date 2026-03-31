const UPDATE_INTERVAL = 1000;
let chart;

// ===== DEFAULT 4-CELL DATA =====
function getDemoData() {
    return {
        num_cells: 4,
        cells: Array.from({length:4}, (_,i)=>{
            let voltage = 3.5 + Math.random()*0.7;
            let current = (Math.random()*4 - 2);
            let temp = 25 + Math.random()*20;
            let soc = Math.max(0, Math.min(100, (voltage-3)*100));
            return {
                voltage,
                current,
                temperature: temp,
                soc,
                power: voltage*current,
                balancing: Math.random() > 0.7,
                fault: temp>55 ? "Over Temp" : "OK"
            };
        })
    };
}

// ===== INIT CHART =====
function initChart(){
    const ctx = document.getElementById("chart").getContext("2d");
    chart = new Chart(ctx, {type:"line", data:{labels:[], datasets:[]}});
}

// ===== FETCH (Demo fallback) =====
function fetchData(){
    let data = getDemoData();
    process(data);
}

// ===== PROCESS DATA =====
function process(data){
    let cells = data.cells;
    let n = data.num_cells;

    let V=0,I=0,T=0,S=0;
    cells.forEach(c=>{ V+=c.voltage; I+=c.current; T+=c.temperature; S+=c.soc; });

    let avgT = T/n;
    let avgS = S/n;
    let P = V*I;

    document.getElementById("totalVoltage").innerText = V.toFixed(2)+" V";
    document.getElementById("totalCurrent").innerText = I.toFixed(2)+" A";
    document.getElementById("avgTemp").innerText = avgT.toFixed(2)+" °C";
    document.getElementById("avgSOC").innerText = avgS.toFixed(1)+" %";
    document.getElementById("totalPower").innerText = P.toFixed(2)+" W";
    document.getElementById("status").innerText = I>0?"Discharging":"Charging";

    renderCells(cells);
    renderHeatmap(cells);
    renderBattery(cells);
    updateGraph(cells);
}

// ===== RENDER CELLS =====
function renderCells(cells){
    let container = document.getElementById("cellContainer");
    container.innerHTML = "";
    cells.forEach((c,i)=>{
        let d = document.createElement("div");
        d.className="cell";
        if(c.fault!="OK") d.classList.add("fault");
        if(c.balancing) d.classList.add("balancing");
        d.innerHTML = `<h3>Cell ${i+1}</h3>
                       V:${c.voltage.toFixed(2)}<br>
                       I:${c.current.toFixed(2)}<br>
                       T:${c.temperature.toFixed(1)}<br>
                       SoC:${c.soc.toFixed(1)}%`;
        container.appendChild(d);
    });
}

// ===== HEATMAP =====
function renderHeatmap(cells){
    let heat = document.getElementById("heatmap");
    heat.innerHTML = "";
    cells.forEach(c=>{
        let d = document.createElement("div");
        d.className="heat";
        let r = Math.min(255,c.temperature*4);
        let b = 255-r;
        d.style.background = `rgb(${r},0,${b})`;
        heat.appendChild(d);
    });
}

// ===== BATTERY PACK =====
function renderBattery(cells){
    let pack = document.getElementById("batteryPack");
    pack.innerHTML = "";
    cells.forEach((c,i)=>{
        let cellDiv = document.createElement("div");
        cellDiv.className="battery-cell";

        let fill = document.createElement("div");
        fill.className="fill";
        fill.style.height = c.soc+"%";
        if(c.current<0) cellDiv.classList.add("charging");
        if(c.fault!="OK") cellDiv.classList.add("fault-cell");
        if(c.balancing) cellDiv.classList.add("balancing-cell");

        cellDiv.appendChild(fill);
        pack.appendChild(cellDiv);
    });
}

// ===== GRAPH =====
function updateGraph(cells){
    chart.data.labels.push("");
    cells.forEach((c,i)=>{
        if(!chart.data.datasets[i]){
            chart.data.datasets[i] = {label:"Cell "+(i+1), data:[]};
        }
        chart.data.datasets[i].data.push(c.voltage);
        if(chart.data.datasets[i].data.length>20) chart.data.datasets[i].data.shift();
    });
    if(chart.data.labels.length>20) chart.data.labels.shift();
    chart.update();
}

// ===== NAVIGATION =====
function showSection(id){
    document.getElementById("mainSection").style.display="none";
    document.getElementById("cellSection").style.display="none";
    document.getElementById(id).style.display="block";
}

document.getElementById("voltageCard").onclick = ()=>showSection("cellSection");
document.getElementById("currentCard").onclick = ()=>showSection("cellSection");
document.getElementById("socCard").onclick = ()=>showSection("cellSection");
document.getElementById("tempCard").onclick = ()=>showSection("cellSection");

// ===== INIT =====
initChart();
setInterval(fetchData, UPDATE_INTERVAL);
