"use strict";

//definire clase pentru forme
class Forma {
    constructor(x, y, culoare, grosime) {
        this.x = x;
        this.y = y;
        this.culoare = culoare;
        this.grosime = grosime;
        this.tip = "Forma";
    }

    deseneaza(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.culoare;
        ctx.lineWidth = this.grosime;
    }
}

class Dreptunghi extends Forma {
    constructor(x, y, w, h, culoare, grosime) {
        super(x, y, culoare, grosime);
        this.w = w;
        this.h = h;
        this.tip = "Dreptunghi";
    }

    deseneaza(ctx) {
        super.deseneaza(ctx);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
}

class Elipsa extends Forma {
    constructor(x, y, razaX, razaY, culoare, grosime) {
        super(x, y, culoare, grosime);
        this.razaX = Math.abs(razaX);
        this.razaY = Math.abs(razaY);
        this.tip = "Elipsa";
    }

    deseneaza(ctx) {
        super.deseneaza(ctx);
        ctx.ellipse(this.x, this.y, this.razaX, this.razaY, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

class Linie extends Forma {
    constructor(x, y, x2, y2, culoare, grosime) {
        super(x, y, culoare, grosime);
        this.x2 = x2;
        this.y2 = y2;
        this.tip = "Linie";
    }

    deseneaza(ctx) {
        super.deseneaza(ctx);
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
}

//variabile globale
const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d");

let listaFiguri = [];
let deseneazaActiv = false;
let startX = 0;
let startY = 0;
let instrumentCurent = "rect";

//referinte la elementele din pagina
const btnRect = document.getElementById("btnRect");
const btnElipsa = document.getElementById("btnEllipse");
const btnLinie = document.getElementById("btnLine");

const inpCuloare = document.getElementById("strokeColor");
const inpGrosime = document.getElementById("lineWidth");
const inpFundal = document.getElementById("bgColor");

const listaHtml = document.getElementById("shapeList");
const btnSterge = document.getElementById("btnDelete");
const panouProprietati = document.getElementById("propertiesPanel");
const btnActualizeaza = document.getElementById("btnUpdate");

const btnUndo = document.getElementById("btnUndo");
const btnClear = document.getElementById("btnClear");

//initializare aplicatie
function init() {
    redeseneazaTot();
}

function redeseneazaTot() {
    //stergem tot canvasul
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //desenam fundalul
    ctx.fillStyle = inpFundal.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //desenam toate figurile din lista
    for (let i = 0; i < listaFiguri.length; i++) {
        listaFiguri[i].deseneaza(ctx);
    }
}

//evenimente mouse
canvas.addEventListener("mousedown", function(e) {
    deseneazaActiv = true;
    const dreptunghiCanvas = canvas.getBoundingClientRect();
    startX = e.clientX - dreptunghiCanvas.left;
    startY = e.clientY - dreptunghiCanvas.top;
});

canvas.addEventListener("mousemove", function(e) {
    if (!deseneazaActiv) return;

    const dreptunghiCanvas = canvas.getBoundingClientRect();
    const mouseX = e.clientX - dreptunghiCanvas.left;
    const mouseY = e.clientY - dreptunghiCanvas.top;

    //redesenam formele vechi
    redeseneazaTot();

    //desenam forma curenta ca preview
    ctx.beginPath();
    ctx.strokeStyle = inpCuloare.value;
    ctx.lineWidth = inpGrosime.value;

    const w = mouseX - startX;
    const h = mouseY - startY;

    if (instrumentCurent === "rect") {
        ctx.strokeRect(startX, startY, w, h);
    } else if (instrumentCurent === "elipsa") {
        const rx = Math.abs(w / 2);
        const ry = Math.abs(h / 2);
        const cx = startX + w / 2;
        const cy = startY + h / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
    } else if (instrumentCurent === "linie") {
        ctx.moveTo(startX, startY);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
    }
});

canvas.addEventListener("mouseup", function(e) {
    if (!deseneazaActiv) return;
    deseneazaActiv = false;

    const dreptunghiCanvas = canvas.getBoundingClientRect();
    const endX = e.clientX - dreptunghiCanvas.left;
    const endY = e.clientY - dreptunghiCanvas.top;

    let formaNoua = null;
    const culoare = inpCuloare.value;
    const grosime = inpGrosime.value;

    if (instrumentCurent === "rect") {
        //calculam coordonatele reale pentru a evita valori negative
        const xReal = Math.min(startX, endX);
        const yReal = Math.min(startY, endY);
        const wReal = Math.abs(endX - startX);
        const hReal = Math.abs(endY - startY);
        
        formaNoua = new Dreptunghi(xReal, yReal, wReal, hReal, culoare, grosime);

    } else if (instrumentCurent === "elipsa") {
        const w = endX - startX;
        const h = endY - startY;
        const rx = Math.abs(w / 2);
        const ry = Math.abs(h / 2);
        const cx = startX + w / 2;
        const cy = startY + h / 2;
        formaNoua = new Elipsa(cx, cy, rx, ry, culoare, grosime);

    } else if (instrumentCurent === "linie") {
        formaNoua = new Linie(startX, startY, endX, endY, culoare, grosime);
    }

    if (formaNoua) {
        listaFiguri.push(formaNoua);
        actualizeazaListaHtml();
        redeseneazaTot();
    }
});

//gestionare lista si proprietati
function actualizeazaListaHtml() {
    listaHtml.innerHTML = "";
    for (let i = 0; i < listaFiguri.length; i++) {
        const optiune = document.createElement("option");
        optiune.value = i;
        optiune.text = (i + 1) + ". " + listaFiguri[i].tip;
        listaHtml.appendChild(optiune);
    }
}

listaHtml.addEventListener("change", function() {
    const index = listaHtml.value;
    
    if (index !== "") {
        const figuraSelectata = listaFiguri[index];
        
        btnSterge.disabled = false;
        panouProprietati.classList.remove("disabled");

        document.getElementById("propX").value = Math.round(figuraSelectata.x);
        document.getElementById("propY").value = Math.round(figuraSelectata.y);

        if (figuraSelectata instanceof Dreptunghi) {
            document.getElementById("propW").value = figuraSelectata.w;
            document.getElementById("propH").value = figuraSelectata.h;
        } else if (figuraSelectata instanceof Elipsa) {
            document.getElementById("propW").value = Math.round(figuraSelectata.razaX);
            document.getElementById("propH").value = Math.round(figuraSelectata.razaY);
        } else if (figuraSelectata instanceof Linie) {
            document.getElementById("propW").value = Math.round(figuraSelectata.x2);
            document.getElementById("propH").value = Math.round(figuraSelectata.y2);
        }
    }
});

btnSterge.addEventListener("click", function() {
    const index = listaHtml.value;
    if (index !== "") {
        listaFiguri.splice(index, 1);
        actualizeazaListaHtml();
        redeseneazaTot();
        resetareControale();
    }
});

btnActualizeaza.addEventListener("click", function() {
    const index = listaHtml.value;
    if (index !== "") {
        const figura = listaFiguri[index];
        
        const xNou = parseFloat(document.getElementById("propX").value);
        const yNou = parseFloat(document.getElementById("propY").value);
        const dim1 = parseFloat(document.getElementById("propW").value);
        const dim2 = parseFloat(document.getElementById("propH").value);

        figura.x = xNou;
        figura.y = yNou;

        if (figura instanceof Dreptunghi) {
            figura.w = dim1;
            figura.h = dim2;
        } else if (figura instanceof Elipsa) {
            figura.razaX = dim1;
            figura.razaY = dim2;
        } else if (figura instanceof Linie) {
            figura.x2 = dim1;
            figura.y2 = dim2;
        }

        redeseneazaTot();
    }
});

function resetareControale() {
    btnSterge.disabled = true;
    panouProprietati.classList.add("disabled");
    listaHtml.value = "";
    document.getElementById("propX").value = "";
    document.getElementById("propY").value = "";
    document.getElementById("propW").value = "";
    document.getElementById("propH").value = "";
}

//butoane extra
btnUndo.addEventListener("click", function() {
    if (listaFiguri.length > 0) {
        listaFiguri.pop();
        actualizeazaListaHtml();
        redeseneazaTot();
        resetareControale();
    }
});

btnClear.addEventListener("click", function() {
    if (confirm("Esti sigur ca vrei sa stergi tot desenul?")) {
        listaFiguri = [];
        //resetam si culoarea de fundal la alb
        inpFundal.value = "#ffffff";
        
        actualizeazaListaHtml();
        redeseneazaTot();
        resetareControale();
    }
});

//export
document.getElementById("btnSavePng").addEventListener("click", function() {
    const link = document.createElement('a');
    link.download = 'desenul_meu.png';
    link.href = canvas.toDataURL("image/png");
    link.click();
});

document.getElementById("btnSaveSvg").addEventListener("click", function() {
    let continutSvg = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">`;
    
    //adaugam fundalul
    continutSvg += `<rect x="0" y="0" width="${canvas.width}" height="${canvas.height}" fill="${inpFundal.value}" />`;

    //generam cod xml pentru fiecare figura
    for(let i=0; i<listaFiguri.length; i++) {
        const f = listaFiguri[i];
        
        if (f instanceof Dreptunghi) {
            continutSvg += `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" 
                           stroke="${f.culoare}" stroke-width="${f.grosime}" fill="none" />`;
        } else if (f instanceof Elipsa) {
            continutSvg += `<ellipse cx="${f.x}" cy="${f.y}" rx="${f.razaX}" ry="${f.razaY}" 
                           stroke="${f.culoare}" stroke-width="${f.grosime}" fill="none" />`;
        } else if (f instanceof Linie) {
            continutSvg += `<line x1="${f.x}" y1="${f.y}" x2="${f.x2}" y2="${f.y2}" 
                           stroke="${f.culoare}" stroke-width="${f.grosime}" />`;
        }
    }

    continutSvg += `</svg>`;

    const blob = new Blob([continutSvg], {type: "image/svg+xml"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'desenul_meu.svg';
    link.href = url;
    link.click();
});

//selectare instrumente
function schimbaInstrument(nume, btn) {
    instrumentCurent = nume;
    btnRect.classList.remove("active");
    btnElipsa.classList.remove("active");
    btnLinie.classList.remove("active");
    btn.classList.add("active");
}

btnRect.addEventListener("click", function() { schimbaInstrument("rect", btnRect); });
btnElipsa.addEventListener("click", function() { schimbaInstrument("elipsa", btnElipsa); });
btnLinie.addEventListener("click", function() { schimbaInstrument("linie", btnLinie); });

inpFundal.addEventListener("input", redeseneazaTot);

//pornire aplicatie
init();