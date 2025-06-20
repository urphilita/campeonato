const SHEET_URL = "https://script.google.com/macros/s/AKfycbz6Aie4w1fprPpqPZ5IQUZcaNtdYR-t62wdl7F-1AD8a8Q-Yee-Zro2tOOA6Te8XoFr/exec";
fetch(SHEET_URL)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("resultados");
    const categorias = {};
    data.slice(1).forEach(row => {
      const [cat, ronda, equipoA, equipoB, scoreA, scoreB] = row;
      if (!categorias[cat]) categorias[cat] = [];
      categorias[cat].push(`${ronda}: ${equipoA} ${scoreA} - ${scoreB} ${equipoB}`);
    });
    for (const cat in categorias) {
      const bloque = document.createElement("div");
      bloque.className = "bloque";
      bloque.innerHTML = `<h2>${cat}</h2>` + categorias[cat].map(r => `<div class='resultado'>${r}</div>`).join('');
      container.appendChild(bloque);
    }
  });