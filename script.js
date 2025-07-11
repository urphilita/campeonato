document.addEventListener('DOMContentLoaded', () => {
    // Reemplaza con el ID de tu Google Sheet
    const BASE_SHEET_ID = '2PACX-1vT8wuuY42qT9NQKU7T1-rRgf8jCn1V7SbqvHamgVHGbmos0qWY15BYxJhePXIrYv7Oye-U4gsWKKgG6';

    const tableBody = document.getElementById('table-body');
    const tableHeadersRow = document.getElementById('table-headers');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const scrollIndicator = document.getElementById('scroll-indicator');
    const tableResponsiveContainer = document.querySelector('.table-responsive');

    const secondaryButtonsContainer = document.getElementById('secondary-buttons-container');
    const viewStandingsBtn = document.getElementById('view-standings-btn');
    const viewFutsalGeneralStandingsBtn = document.getElementById('view-futsal-general-standings-btn');
    // *** ¡NUEVAS REFERENCIAS A LOS BOTONES DE FÚTBOL! ***
    const viewFutbolSeniorStandingsBtn = document.getElementById('view-futbol-senior-standings-btn');
    const viewFutbolGeneralStandingsBtn = document.getElementById('view-futbol-general-standings-btn');


    const GID_COL_SPANS = {
        '0': 8,             // GID futsal damas (Fixture)
        '325768691': 8,     // GID basquet damas (Fixture)
        '246596696': 8,     // GID futsal senior (Fixture)
		'475772247': 8,
        '555116046': 9,     // GID de Futsal Damas - Tabla de Posiciones (Específica)
		'1851467359':10,
        '876876790': 10,    // GID de Futsal General - Tabla de Posiciones
     
        // *** ¡NUEVOS GIDs Y NÚMEROS DE COLUMNAS PARA FÚTBOL! ***
        // REEMPLAZA 'GID_FUTBOL_SENIOR_POSICIONES' Y 'GID_FUTBOL_GENERAL_POSICIONES'
        // Y AJUSTA LOS NÚMEROS DE COLUMNAS (9 y 10 son suposiciones)
        'GID_FUTBOL_SENIOR_POSICIONES': 9, // Ejemplo: 9 columnas para Fútbol Senior
        'GID_FUTBOL_GENERAL_POSICIONES': 10 // Ejemplo: 10 columnas para Fútbol General
    };

    const TABLE_HEADERS = {
        'default': [
            'Categoría', 'Ronda', 'Hora', 'Equipo A', 'Score A', 'Equipo B', 'Score B', 'Estado'
        ],
        'fixture-futsal-damas': [
            'Categoría', 'Ronda', 'Hora', 'Equipo A', 'Score A', 'Equipo B', 'Score B', 'Estado'
        ],
        'tabla-posiciones': [
            'PROMOCION', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'PUNTOS', 'DG'
        ],
        'futsal-general': [
            'SERIE','PROMOCION', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'PUNTOS', 'DG'
        ],
        // *** ¡NUEVOS ENCABEZADOS PARA FÚTBOL! ***
        'tabla-futbol-senior': [
            'PROMOCION', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'PUNTOS', 'DG' // Ajusta estos encabezados
        ],
        'tabla-futbol-general': [
            'SERIE','PROMOCION', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'PUNTOS', 'DG' // Ajusta estos encabezados
        ]
    };

    const loadCategoryData = (gid, dataType = 'default') => {
        if (!tableBody || !tableHeadersRow || !loadingMessage || !errorMessage || !scrollIndicator || !tableResponsiveContainer || !secondaryButtonsContainer) {
            console.error("Error: Uno o más elementos HTML requeridos no fueron encontrados. Revisa tus IDs o la estructura HTML.");
            return;
        }

        const googleSheetUrl = `https://docs.google.com/spreadsheets/d/e/${BASE_SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;

        tableBody.innerHTML = '';
        loadingMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        scrollIndicator.classList.remove('visible');

        categoryButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`.category-btn[data-gid="${gid}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Lógica para mostrar/ocultar los botones secundarios
        // Si el GID actual es el de "Futsal Damas" (fixture), muestra el contenedor
        if (dataType === 'fixture-futsal-damas') { // O cualquier otro data-type que quieras que active estos botones
            secondaryButtonsContainer.classList.remove('hidden');
        } else {
            secondaryButtonsContainer.classList.add('hidden');
        }

        updateTableHeaders(dataType);

        fetch(googleSheetUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(csvText => {
                loadingMessage.classList.add('hidden');
                console.log('--- CSV Text Received for GID:', gid, '---');
                console.log('-------------------------');

                const rows = csvText.split('\n');
                const dataRows = rows.slice(1);

                if (dataRows.length === 0 || (dataRows.length === 1 && dataRows[0].trim() === '')) {
                    tableBody.innerHTML = `<tr><td colspan="${GID_COL_SPANS[gid] || TABLE_HEADERS[dataType].length}" style="text-align: center;">No hay resultados disponibles para esta categoría.</td></tr>`;
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

    function updateTableHeaders(dataType) {
        if (!tableHeadersRow) {
            console.error("Error: Elemento 'table-headers' no encontrado. No se pueden actualizar los encabezados.");
            return;
        }
        tableHeadersRow.innerHTML = '';
        const headers = TABLE_HEADERS[dataType] || TABLE_HEADERS['default'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            tableHeadersRow.appendChild(th);
        });
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const selectedGid = event.target.dataset.gid;
            const dataType = event.target.dataset.type || 'default';
            loadCategoryData(selectedGid, dataType);
        });
    });

    if (viewStandingsBtn) {
        viewStandingsBtn.addEventListener('click', () => {
            const gid = viewStandingsBtn.dataset.gid;
            const dataType = viewStandingsBtn.dataset.type;
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            loadCategoryData(gid, dataType);
        });
    } else {
        console.warn("Botón 'Ver Tabla de Posiciones Futsal Damas' (id='view-standings-btn') no encontrado. Asegúrate de que está en tu HTML.");
    }

    if (viewFutsalGeneralStandingsBtn) {
        viewFutsalGeneralStandingsBtn.addEventListener('click', () => {
            const gid = viewFutsalGeneralStandingsBtn.dataset.gid;
            const dataType = viewFutsalGeneralStandingsBtn.dataset.type;
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            loadCategoryData(gid, dataType);
        });
    } else {
        console.warn("Botón 'Ver Tabla General Futsal' (id='view-futsal-general-standings-btn') no encontrado. Asegúrate de que está en tu HTML.");
    }

    // *** ¡NUEVOS EVENT LISTENERS PARA LOS BOTONES DE FÚTBOL! ***
    if (viewFutbolSeniorStandingsBtn) {
        viewFutbolSeniorStandingsBtn.addEventListener('click', () => {
            const gid = viewFutbolSeniorStandingsBtn.dataset.gid;
            const dataType = viewFutbolSeniorStandingsBtn.dataset.type;
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            loadCategoryData(gid, dataType);
        });
    } else {
        console.warn("Botón 'Ver Tabla Fútbol Senior' (id='view-futbol-senior-standings-btn') no encontrado. Asegúrate de que está en tu HTML.");
    }

    if (viewFutbolGeneralStandingsBtn) {
        viewFutbolGeneralStandingsBtn.addEventListener('click', () => {
            const gid = viewFutbolGeneralStandingsBtn.dataset.gid;
            const dataType = viewFutbolGeneralStandingsBtn.dataset.type;
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            loadCategoryData(gid, dataType);
        });
    } else {
        console.warn("Botón 'Ver Tabla Fútbol General' (id='view-futbol-general-standings-btn') no encontrado. Asegúrate de que está en tu HTML.");
    }


    // Cargar la primera categoría por defecto al cargar la página
    if (categoryButtons.length > 0) {
        const defaultGid = categoryButtons[0].dataset.gid;
        const defaultDataType = categoryButtons[0].dataset.type || 'default';
        loadCategoryData(defaultGid, defaultDataType);
    } else {
        console.warn("No se encontraron botones de categoría. Asegúrate de que tienen la clase 'category-btn'.");
    }
});