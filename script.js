document.addEventListener('DOMContentLoaded', () => {
    // Reemplaza con el ID de tu Google Sheet (la parte entre /d/ y /pub de tu URL publicada)
    const BASE_SHEET_ID = '2PACX-1vT8wuuY42qT9NQKU7T1-rRgf8jCn1V7SbqvHamgVHGbmos0qWY15BYxJhePXIrYv7Oye-U4gsWKKgG6';
    const tableBody = document.getElementById('results-table-body');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const categoryButtonsContainer = document.querySelector('.category-buttons'); // This variable is not used, can be removed if not planning to use it.
    const categoryButtons = document.querySelectorAll('.category-btn');

    // Función para cargar los datos de una GID específica
    const loadCategoryData = (gid) => {
        // CORRECCIÓN 1: Usar backticks para la interpolación de strings en la URL
        const googleSheetUrl = `https://docs.google.com/spreadsheets/d/e/${BASE_SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;

        tableBody.innerHTML = ''; // Limpiar la tabla
        loadingMessage.classList.remove('hidden'); // Mostrar mensaje de carga
        errorMessage.classList.add('hidden'); // Ocultar mensaje de error

        // Quitar la clase 'active' de todos los botones
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Añadir la clase 'active' al botón actualmente seleccionado
        // CORRECCIÓN 2: Usar backticks para la interpolación de strings en el selector
        const activeButton = document.querySelector(`.category-btn[data-gid="${gid}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        fetch(googleSheetUrl)
            .then(response => {
                if (!response.ok) {
                    // CORRECCIÓN 3: Usar backticks para la interpolación de strings en el mensaje de error
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(csvText => {
                loadingMessage.classList.add('hidden'); // Oculta el mensaje de carga
                const rows = csvText.split('\n');

                // Eliminar la primera fila (encabezados) si tu CSV incluye encabezados
                // Si tus datos no tienen encabezados, puedes comentar la siguiente línea
                const dataRows = rows.slice(1);

                if (dataRows.length === 0 || (dataRows.length === 1 && dataRows[0].trim() === '')) {
                    tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No hay resultados disponibles para esta categoría.</td></tr>';
                    return;
                }

                dataRows.forEach(row => {
                    const columns = row.split(','); // Divide por comas
                    if (columns.length === 8) { // Asegúrate de que haya 8 columnas
                        const tr = document.createElement('tr');
                        columns.forEach(col => {
                            const td = document.createElement('td');
                            td.textContent = col.trim(); // Elimina espacios en blanco
                            tr.appendChild(td);
                        });
                        tableBody.appendChild(tr);
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                loadingMessage.classList.add('hidden'); // Oculta el mensaje de carga
                errorMessage.classList.remove('hidden'); // Muestra el mensaje de error
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No se pudieron cargar los datos para esta categoría.</td></tr>';
            });
    };

    // Añadir un event listener a cada botón de categoría
    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const selectedGid = event.target.dataset.gid; // Obtener el GID del atributo data-gid
            loadCategoryData(selectedGid);
        });
    });

    // Cargar la primera categoría por defecto al cargar la página
    // Esto asume que el primer botón en el HTML es el que quieres cargar por defecto.
    if (categoryButtons.length > 0) {
        loadCategoryData(categoryButtons[0].dataset.gid);
    }
});