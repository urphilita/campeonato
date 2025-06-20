const FORM_URL = "https://script.google.com/macros/s/AKfycbyzswGJ_Ce67D2xBf3pAiWIC9WAm-zQf3IwVKGMyLBuDwFzURsxlaalad9Nf__55Ls/exec";

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
  
  console.log("Enviando datos:", data); // Para ver en consola qué se está enviando
  
  fetch(FORM_URL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.text();
  })
  .then(msg => {
    console.log("Respuesta del servidor:", msg);
    document.getElementById("mensaje").textContent = "Resultado guardado con éxito.";
    document.getElementById("formulario").reset();
  })
  .catch(err => {
    console.error("Error completo:", err);
    document.getElementById("mensaje").textContent = `Error al guardar el resultado: ${err.message}`;
  });
});