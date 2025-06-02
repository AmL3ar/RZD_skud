document.addEventListener('DOMContentLoaded', function() {
    // Функция для инициализации автозаполнения
    function initAutocomplete() {
        // Находим поле ввода имени и отдела
        const nameField = document.getElementById('id_full_name');
        const departmentField = document.getElementById('id_department');
        const emailField = document.getElementById('id_email');
        
        if (nameField) {
            // Создаем элемент для выпадающего списка
            const autocompleteList = document.createElement('div');
            autocompleteList.className = 'autocomplete-list';
            autocompleteList.style.display = 'none';
            autocompleteList.style.position = 'absolute';
            autocompleteList.style.zIndex = '1000';
            autocompleteList.style.backgroundColor = '#fff';
            autocompleteList.style.border = '1px solid #ddd';
            autocompleteList.style.maxHeight = '200px';
            autocompleteList.style.overflowY = 'auto';
            autocompleteList.style.width = nameField.offsetWidth + 'px';
            
            // Добавляем выпадающий список после поля ввода
            nameField.parentNode.insertBefore(autocompleteList, nameField.nextSibling);
            
            // Обработчик ввода в поле имени
            nameField.addEventListener('input', function() {
                const term = this.value.trim();
                if (term.length < 2) {
                    autocompleteList.style.display = 'none';
                    return;
                }
                
                // Получаем ID выбранного отдела, если он выбран
                let departmentId = '';
                if (departmentField && departmentField.value) {
                    departmentId = departmentField.value;
                }
                
                // Отправляем AJAX запрос для получения вариантов автозаполнения из модели Person
                fetch(`/admin/passes/pass/autocomplete-person/?term=${encodeURIComponent(term)}&department_id=${departmentId}`)
                    .then(response => response.json())
                    .then(data => {
                        autocompleteList.innerHTML = '';
                        
                        if (data.length > 0) {
                            data.forEach(person => {
                                const item = document.createElement('div');
                                item.className = 'autocomplete-item';
                                item.textContent = `${person.full_name} (${person.department})`;
                                item.style.padding = '8px 12px';
                                item.style.cursor = 'pointer';
                                
                                // Сохраняем данные о человеке
                                item.dataset.fullName = person.full_name;
                                item.dataset.email = person.email || '';
                                
                                // При наведении меняем стиль
                                item.addEventListener('mouseover', function() {
                                    this.style.backgroundColor = '#f0f0f0';
                                });
                                
                                item.addEventListener('mouseout', function() {
                                    this.style.backgroundColor = 'transparent';
                                });
                                
                                // При клике заполняем поля выбранными значениями
                                item.addEventListener('click', function() {
                                    nameField.value = this.dataset.fullName;
                                    
                                    // Если есть поле email и в данных есть email, заполняем его
                                    if (emailField && this.dataset.email) {
                                        emailField.value = this.dataset.email;
                                    }
                                    
                                    autocompleteList.style.display = 'none';
                                });
                                
                                autocompleteList.appendChild(item);
                            });
                            
                            // Если нет результатов из Person, пробуем получить из существующих пропусков
                            if (data.length === 0) {
                                fetchExistingNames(term, autocompleteList);
                            } else {
                                autocompleteList.style.display = 'block';
                            }
                        } else {
                            // Если нет результатов из Person, пробуем получить из существующих пропусков
                            fetchExistingNames(term, autocompleteList);
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка при получении данных автозаполнения:', error);
                        // В случае ошибки, пробуем получить из существующих пропусков
                        fetchExistingNames(term, autocompleteList);
                    });
            });
            
            // Скрываем выпадающий список при клике вне его
            document.addEventListener('click', function(e) {
                if (e.target !== nameField && !autocompleteList.contains(e.target)) {
                    autocompleteList.style.display = 'none';
                }
            });
        }
    }
    
    // Функция для получения имен из существующих пропусков
    function fetchExistingNames(term, autocompleteList) {
        const nameField = document.getElementById('id_full_name');
        
        fetch(`/admin/passes/pass/autocomplete-name/?term=${encodeURIComponent(term)}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    // Если список уже содержит элементы, добавляем разделитель
                    if (autocompleteList.children.length > 0) {
                        const divider = document.createElement('div');
                        divider.style.borderTop = '1px solid #ddd';
                        divider.style.margin = '4px 0';
                        autocompleteList.appendChild(divider);
                    } else {
                        autocompleteList.innerHTML = '';
                    }
                    
                    data.forEach(name => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.textContent = name;
                        item.style.padding = '8px 12px';
                        item.style.cursor = 'pointer';
                        
                        // При наведении меняем стиль
                        item.addEventListener('mouseover', function() {
                            this.style.backgroundColor = '#f0f0f0';
                        });
                        
                        item.addEventListener('mouseout', function() {
                            this.style.backgroundColor = 'transparent';
                        });
                        
                        // При клике заполняем поле выбранным значением
                        item.addEventListener('click', function() {
                            nameField.value = name;
                            autocompleteList.style.display = 'none';
                        });
                        
                        autocompleteList.appendChild(item);
                    });
                    
                    autocompleteList.style.display = 'block';
                } else if (autocompleteList.children.length === 0) {
                    autocompleteList.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Ошибка при получении данных автозаполнения:', error);
            });
    }
    
    // Запускаем инициализацию автозаполнения
    initAutocomplete();
});