const FORM_URL = "https://script.google.com/macros/s/YOUR_DEPLOYED_URL/exec";
document.getElementById("formulario").addEventListener("submit", function(e) {
  e.preventDefault();
  const data = {
    categoria: document.getElementById("categoria").value,
    ronda: document.getElementById("ronda").value,
    equipoA: document.getElementById("equipoA").value,
    equipoB: document.getElementById("equipoB").value,
    scoreA: document.getElementById("scoreA").value,
    scoreB: document.getElementById("scoreB").value
  };
  fetch(FORM_URL, {
    method: "POST",
    body: JSON.stringify(data)
  })
  .then(res => res.text())
  .then(msg => {
    document.getElementById("mensaje").textContent = "Resultado guardado con éxito.";
    document.getElementById("formulario").reset();
  })
  .catch(err => {
    document.getElementById("mensaje").textContent = "Error al guardar el resultado.";
  });
});