document.addEventListener('DOMContentLoaded', () => {
    // Reemplaza con el ID de tu Google Sheet (la parte entre /d/ y /pub de tu URL publicada)
    const BASE_SHEET_ID = '2PACX-1vT8wuuY42qT9NQKU7T1-rRgf8jCn1V7SbqvHamgVHGbmos0qWY15BYxJhePXIrYv7Oye-U4gsWKKgG6';
    const tableBody = document.getElementById('results-table-body');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    // const categoryButtonsContainer = document.querySelector('.category-buttons'); // This variable is not used, can be removed if not planning to use it.
    const categoryButtons = document.querySelectorAll('.category-btn');
    const scrollIndicator = document.getElementById('scroll-indicator'); // Nueva referencia al indicador
    const tableResponsiveContainer = document.querySelector('.table-responsive'); // Contenedor responsivo de la tabla

    // Define el número esperado de columnas en tu CSV.
    // ¡¡¡VERIFICA ESTE VALOR CON TU ARCHIVO CSV REAL!!!
    // Abre el CSV descargado y cuenta las columnas.
    const COL_SPAN = 7; // Ajusta esto si tu CSV tiene un número diferente de columnas (ej. 8)

    // Función para cargar los datos de una GID específica
    const loadCategoryData = (gid) => {
        const googleSheetUrl = `https://docs.google.com/spreadsheets/d/e/${BASE_SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;

        tableBody.innerHTML = ''; // Limpiar la tabla
        loadingMessage.classList.remove('hidden'); // Mostrar mensaje de carga
        errorMessage.classList.add('hidden'); // Ocultar mensaje de error
        scrollIndicator.classList.remove('visible'); // Ocultar el indicador al iniciar una nueva carga

        // Quitar la clase 'active' de todos los botones
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Añadir la clase 'active' al botón actualmente seleccionado
        const activeButton = document.querySelector(`.category-btn[data-gid="${gid}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        fetch(googleSheetUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(csvText => {
                loadingMessage.classList.add('hidden'); // Oculta el mensaje de carga

                // --- DEBUGGING LOGS ---
                console.log('--- CSV Text Received ---');
                console.log(csvText); // Muestra el texto CSV completo
                console.log('-------------------------');
                // --- END DEBUGGING LOGS ---

                const rows = csvText.split('\n');

                // --- DEBUGGING LOGS ---
                console.log('Number of raw rows (including potential empty last line):', rows.length);
                // --- END DEBUGGING LOGS ---

                // Eliminar la primera fila (encabezados) si tu CSV incluye encabezados.
                // Si tus datos NO tienen encabezados en la primera fila, cambia a `rows.slice(0)` o `const dataRows = rows;`
                const dataRows = rows.slice(1);

                // --- DEBUGGING LOGS ---
                console.log('Number of data rows after slicing (excluding header):', dataRows.length);
                // --- END DEBUGGING LOGS ---

                if (dataRows.length === 0 || (dataRows.length === 1 && dataRows[0].trim() === '')) {
                    tableBody.innerHTML = `<tr><td colspan="${COL_SPAN}" style="text-align: center;">No hay resultados disponibles para esta categoría.</td></tr>`;
                    // --- DEBUGGING LOGS ---
                    console.log('No data rows or only empty row detected after slicing.');
                    // --- END DEBUGGING LOGS ---
                    return;
                }

                dataRows.forEach((row, index) => {
                    // Ignorar filas completamente vacías que puedan aparecer al final del CSV
                    if (row.trim() === '') {
                        console.log(`Skipping empty row at index ${index}.`);
                        return;
                    }

                    const columns = row.split(','); // Divide por comas

                    // --- DEBUGGING LOGS ---
                    console.log(`Processing row ${index}: "${row}"`); // Muestra la fila original
                    console.log(`Columns found in row ${index}: ${columns.length} ->`, columns); // Muestra cuántas columnas y sus contenidos
                    // --- END DEBUGGING LOGS ---

                    if (columns.length === COL_SPAN) { // Asegúrate de que haya el número correcto de columnas
                        // --- DEBUGGING LOGS ---
                        console.log(`Row ${index} matches COL_SPAN (${COL_SPAN}). Appending to table.`);
                        // --- END DEBUGGING LOGS ---
                        const tr = document.createElement('tr');
                        columns.forEach(col => {
                            const td = document.createElement('td');
                            td.textContent = col.trim(); // Elimina espacios en blanco
                            tr.appendChild(td);
                        });
                        tableBody.appendChild(tr);
                    } else {
                        // --- DEBUGGING LOGS ---
                        console.warn(`Row ${index} has ${columns.length} columns, but expected ${COL_SPAN}. Skipping row: "${row}"`);
                        // --- END DEBUGGING LOGS ---
                    }
                });

                // --- Lógica para mostrar/ocultar el indicador de scroll ---
                if (window.innerWidth <= 768) { // Basado en tu media query para móvil
                    setTimeout(() => {
                        const tableElement = tableResponsiveContainer.querySelector('table'); // Referencia a la tabla interna
                        if (tableResponsiveContainer && tableElement && tableElement.scrollWidth > tableResponsiveContainer.clientWidth) {
                            scrollIndicator.classList.add('visible');
                            console.log('Scroll indicator shown.');
                        } else {
                            scrollIndicator.classList.remove('visible');
                            console.log('Scroll indicator hidden (table fits or not mobile).');
                        }
                    }, 100); // Pequeño retraso
                } else {
                    scrollIndicator.classList.remove('visible'); // En escritorio, siempre ocultar el indicador
                    console.log('Scroll indicator hidden (desktop view).');
                }

                let scrolled = false;
                const hideIndicatorOnScroll = () => {
                    if (tableResponsiveContainer.scrollLeft > 10 && !scrolled) {
                        scrollIndicator.classList.remove('visible');
                        tableResponsiveContainer.removeEventListener('scroll', hideIndicatorOnScroll);
                        scrolled = true;
                        console.log('Scroll indicator hidden on scroll.');
                    }
                };
                tableResponsiveContainer.addEventListener('scroll', hideIndicatorOnScroll);

                tableResponsiveContainer.addEventListener('touchstart', () => {
                    scrollIndicator.classList.remove('visible');
                    console.log('Scroll indicator hidden on touchstart.');
                }, { once: true });

            })
            .catch(error => {
                console.error('Error fetching data:', error);
                loadingMessage.classList.add('hidden'); // Oculta el mensaje de carga
                errorMessage.classList.remove('hidden'); // Muestra el mensaje de error
                scrollIndicator.classList.remove('visible'); // Ocultar indicador si hay error
                tableBody.innerHTML = `<tr><td colspan="${COL_SPAN}" style="text-align: center;">No se pudieron cargar los datos para esta categoría.</td></tr>`;
            });
    };

    // Añadir un event listener a cada botón de categoría
    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const selectedGid = event.target.dataset.gid;
            loadCategoryData(selectedGid);
        });
    });

    // Cargar la primera categoría por defecto al cargar la página
    if (categoryButtons.length > 0) {
        loadCategoryData(categoryButtons[0].dataset.gid);
    }
});