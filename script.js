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

    // Función para cargar los datos de una GID específica
    const loadCategoryData = (gid) => {
        // CORRECCIÓN 1: Usar backticks para la interpolación de strings en la URL
        const googleSheetUrl = `https://docs.google.com/spreadsheets/d/e/${BASE_SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;

        tableBody.innerHTML = ''; // Limpiar la tabla
        loadingMessage.classList.remove('hidden'); // Mostrar mensaje de carga
        errorMessage.classList.add('hidden'); // Ocultar mensaje de error
        scrollIndicator.classList.remove('visible'); // Ocultar el indicador al iniciar una nueva carga

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

                // Assuming 8 columns now based on your updated `if (columns.length === 8)` check
                // Make sure your table headers in index.html match your 8 columns in the sheet
                // If you added a new 'Status' column, remember to update the HTML `<thead>` too.
                // For now, I'll keep the colspan to 8 for the 'No hay resultados disponibles' message
                const COL_SPAN = 7; // Adjust this if you truly have 8 display columns in HTML
                                   // If you add a "status" column, it will be 8.

                if (dataRows.length === 0 || (dataRows.length === 1 && dataRows[0].trim() === '')) {
                    tableBody.innerHTML = `<tr><td colspan="${COL_SPAN}" style="text-align: center;">No hay resultados disponibles para esta categoría.</td></tr>`;
                    return;
                }

                dataRows.forEach(row => {
                    const columns = row.split(','); // Divide por comas
                    if (columns.length === COL_SPAN) { // Ensure correct number of columns
                        const tr = document.createElement('tr');
                        columns.forEach(col => {
                            const td = document.createElement('td');
                            td.textContent = col.trim(); // Elimina espacios en blanco
                            tr.appendChild(td);
                        });
                        tableBody.appendChild(tr);
                    }
                });

                // --- Lógica para mostrar/ocultar el indicador de scroll ---
                // Solo si la pantalla es lo suficientemente pequeña y la tabla es más ancha que su contenedor
                if (window.innerWidth <= 768) { // Basado en tu media query para móvil
                    // Permitir un pequeño retraso para que el navegador renderice la tabla antes de calcular scrollWidth
                    setTimeout(() => {
                        if (tableResponsiveContainer.scrollWidth > tableResponsiveContainer.clientWidth) {
                            // La tabla es más ancha que su contenedor, mostrar el indicador
                            scrollIndicator.classList.add('visible');
                        } else {
                            // La tabla no necesita scroll, ocultar el indicador
                            scrollIndicator.classList.remove('visible');
                        }
                    }, 100); // Pequeño retraso
                } else {
                    // En escritorio, siempre ocultar el indicador
                    scrollIndicator.classList.remove('visible');
                }

                // Opcional: Ocultar el indicador después de que el usuario desliza
                let scrolled = false;
                const hideIndicatorOnScroll = () => {
                    // Solo ocultar si realmente ha habido un desplazamiento horizontal significativo
                    if (tableResponsiveContainer.scrollLeft > 10 && !scrolled) { // 10px es un umbral para considerar "deslizado"
                        scrollIndicator.classList.remove('visible');
                        tableResponsiveContainer.removeEventListener('scroll', hideIndicatorOnScroll);
                        scrolled = true; // Asegurarse de que solo se oculte una vez al primer scroll
                    }
                };
                // Añadir el listener de scroll al contenedor de la tabla
                tableResponsiveContainer.addEventListener('scroll', hideIndicatorOnScroll);

                // También ocultar si el usuario hace clic/toca en la tabla (para dispositivos táctiles)
                // Se usa { once: true } para que el listener se elimine automáticamente después del primer disparo
                tableResponsiveContainer.addEventListener('touchstart', () => {
                    scrollIndicator.classList.remove('visible');
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