document.addEventListener('DOMContentLoaded', () => {
    // Reemplaza con el ID de tu Google Sheet (la parte entre /d/ y /pub de tu URL publicada)
    const BASE_SHEET_ID = '2PACX-1vT8wuuY42qT9NQKU7T1-rRgf8jCn1V7SbqvHamgVHGbmos0qWY15BYxJhePXIrYv7Oye-U4gsWKKgG6';

    const tableBody = document.getElementById('table-body');
    const tableHeadersRow = document.getElementById('table-headers');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const scrollIndicator = document.getElementById('scroll-indicator');
    const tableResponsiveContainer = document.querySelector('.table-responsive');

    // --- NUEVAS REFERENCIAS DE ELEMENTOS ---
    const secondaryButtonsContainer = document.getElementById('secondary-buttons-container');
    const viewStandingsBtn = document.getElementById('view-standings-btn');
    // --- FIN NUEVAS REFERENCIAS ---

    // Define los GIDs y el número de columnas (COL_SPAN) para cada tipo de tabla.
    // AJUSTA LOS VALORES DE COL_SPAN según la cantidad REAL de columnas en tus CSVs.
    const GID_COL_SPANS = {
        '0': 8,             // Ejemplo: GID de Futsal damas (resultados de partidos, 8 columnas)
        '325768691': 8,     // Ejemplo: GID de basquet damas(resultados de partidos, 8 columnas)
        '987654321': 8,     // Ejemplo: GID de Adultos (resultados de partidos, 8 columnas)
        '555116046': 9      // GID de Futsal Damas - Tabla de Posiciones, 9 columnas
    };

    // Define los encabezados de tabla para cada tipo de contenido
    const TABLE_HEADERS = {
        'default': [ // Encabezados para resultados de partidos genéricos
            'Categoría', 'Ronda', 'Hora', 'Equipo A', 'Score A', 'Equipo B', 'Score B', 'Estado'
        ],
        'fixture-futsal-damas': [ // Encabezados para el fixture de Futsal Damas
            'Categoría', 'Ronda', 'Hora', 'Equipo A', 'Score A', 'Equipo B', 'Score B', 'Estado' // Asumo que son los mismos
        ],
        'tabla-posiciones': [ // Encabezados para la tabla de posiciones de Futsal Damas
            'PROMOCION', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'PUNTOS', 'DG'
        ]
    };

    // Función para cargar los datos de una GID específica
    const loadCategoryData = (gid, dataType = 'default') => {
        const googleSheetUrl = `https://docs.google.com/spreadsheets/d/e/${BASE_SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;

        tableBody.innerHTML = '';
        loadingMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        scrollIndicator.classList.remove('visible');

        // Quitar la clase 'active' de todos los botones de categoría principal
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Añadir la clase 'active' al botón actualmente seleccionado (principal)
        const activeButton = document.querySelector(`.category-btn[data-gid="${gid}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // --- LÓGICA PARA MOSTRAR/OCULTAR EL BOTÓN "VER TABLA DE POSICIONES" ---
        if (dataType === 'fixture-futsal-damas') {
            secondaryButtonsContainer.classList.remove('hidden'); // Muestra el contenedor
        } else {
            secondaryButtonsContainer.classList.add('hidden'); // Oculta el contenedor para otras categorías
        }
        // --- FIN LÓGICA ---

        updateTableHeaders(dataType); // Actualiza los encabezados según el dataType

        fetch(googleSheetUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(csvText => {
                loadingMessage.classList.add('hidden');
                console.log('--- CSV Text Received ---');
                // console.log(csvText); // Descomentar para depuración si es necesario
                console.log('-------------------------');

                const rows = csvText.split('\n');
                console.log('Number of raw rows (including potential empty last line):', rows.length);

                const dataRows = rows.slice(1); // Siempre salta la primera fila (encabezados CSV)
                console.log('Number of data rows after slicing (excluding header):', dataRows.length);

                if (dataRows.length === 0 || (dataRows.length === 1 && dataRows[0].trim() === '')) {
                    tableBody.innerHTML = `<tr><td colspan="${GID_COL_SPANS[gid] || TABLE_HEADERS[dataType].length}" style="text-align: center;">No hay resultados disponibles para esta categoría.</td></tr>`;
                    console.log('No data rows or only empty row detected after slicing.');
                    return;
                }

                const currentColSpan = GID_COL_SPANS[gid];

                dataRows.forEach((row, index) => {
                    if (row.trim() === '') {
                        return;
                    }
                    const columns = row.split(',');

                    if (columns.length >= currentColSpan) {
                        const tr = document.createElement('tr');
                        for (let i = 0; i < currentColSpan; i++) {
                            const td = document.createElement('td');
                            td.textContent = columns[i] ? columns[i].trim() : '';
                            tr.appendChild(td);
                        }
                        tableBody.appendChild(tr);
                    } else {
                        console.warn(`Row ${index} has ${columns.length} columns, but expected ${currentColSpan}. Skipping row: "${row}"`);
                    }
                });

                // --- Lógica para mostrar/ocultar el indicador de scroll ---
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        const tableElement = tableResponsiveContainer ? tableResponsiveContainer.querySelector('table') : null;
                        if (tableResponsiveContainer && tableElement && tableElement.scrollWidth > tableResponsiveContainer.clientWidth) {
                            scrollIndicator.classList.add('visible');
                        } else {
                            scrollIndicator.classList.remove('visible');
                        }
                    }, 100);
                } else {
                    scrollIndicator.classList.remove('visible');
                }

                // Estos listeners para el scroll son mejor manejarlos una vez
                // al cargar el DOM, y solo actualizando el estado de 'scrolled'.
                // Por ahora, los mantengo aquí para que sea similar a tu código,
                // pero si notas comportamientos extraños de scroll, podríamos revisarlos.
                let scrolled = false;
                const hideIndicatorOnScroll = () => {
                    if (tableResponsiveContainer && tableResponsiveContainer.scrollLeft > 10 && !scrolled) {
                        scrollIndicator.classList.remove('visible');
                        tableResponsiveContainer.removeEventListener('scroll', hideIndicatorOnScroll);
                        scrolled = true;
                    }
                };
                tableResponsiveContainer.removeEventListener('scroll', hideIndicatorOnScroll);
                tableResponsiveContainer.addEventListener('scroll', hideIndicatorOnScroll);

                tableResponsiveContainer.removeEventListener('touchstart', () => { scrollIndicator.classList.remove('visible'); }, { once: true });
                tableResponsiveContainer.addEventListener('touchstart', () => {
                    scrollIndicator.classList.remove('visible');
                }, { once: true });

            })
            .catch(error => {
                console.error('Error fetching data:', error);
                loadingMessage.classList.add('hidden');
                errorMessage.classList.remove('hidden');
                scrollIndicator.classList.remove('visible');
                tableBody.innerHTML = `<tr><td colspan="${GID_COL_SPANS[gid] || TABLE_HEADERS[dataType].length}" style="text-align: center;">No se pudieron cargar los datos para esta categoría.</td></tr>`;
            });
    };

    // Función para actualizar los encabezados de la tabla
    function updateTableHeaders(dataType) {
        tableHeadersRow.innerHTML = '';
        const headers = TABLE_HEADERS[dataType] || TABLE_HEADERS['default'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            tableHeadersRow.appendChild(th);
        });
    }

    // --- MANEJO DE CLICKS EN LOS BOTONES ---

    // 1. Manejar clicks en los botones de categoría principal
    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const selectedGid = event.target.dataset.gid;
            const dataType = event.target.dataset.type || 'default';
            loadCategoryData(selectedGid, dataType);
        });
    });

    // 2. Manejar click en el botón "Ver Tabla de Posiciones"
    viewStandingsBtn.addEventListener('click', () => {
        const gid = viewStandingsBtn.dataset.gid;
        const dataType = viewStandingsBtn.dataset.type;

        // Quitar la clase 'active' de todos los botones principales si quieres que el de "ver tabla" se active visualmente
        // Si no quieres que el botón principal Futsal Damas pierda su 'active' state, omite estas líneas
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Puedes añadir una clase 'active' al botón 'viewStandingsBtn' si lo deseas:
        // viewStandingsBtn.classList.add('active');

        loadCategoryData(gid, dataType);
    });

    // Cargar la primera categoría por defecto al cargar la página (ej. Infantil)
    if (categoryButtons.length > 0) {
        const defaultGid = categoryButtons[0].dataset.gid;
        const defaultDataType = categoryButtons[0].dataset.type || 'default';
        loadCategoryData(defaultGid, defaultDataType);
    }
});