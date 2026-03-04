// Подключение модуля
import datepicker from 'js-datepicker';

import './datepicker.scss'

if (document.querySelector('[data-fls-datepicker]')) {
  const picker = datepicker('[data-fls-datepicker]', {
    // customDays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    customDays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    // customMonths: ["Січ", "Лют", "Берез", "Квіт", "Трав", "Черв", "Лип", "Серп", "Верес", "Жовт", "Листоп", "Груд"],
    customMonths: ["Янв", "Фев", "Март", "Апр", "Май", "Июнь", "Июль", "Авг", "Сент", "Окт", "Ноябрь", "Дек"],
    overlayButton: 'Применить',
    overlayPlaceholder: 'Год (4 цифры)',
    startDay: 1,
    formatter: (input, date, instance) => {
      const value = date.toLocaleDateString()
      input.value = value
    },
    onSelect: function (input, instance, date) {

    }
  });
  flsModules.datepicker = picker;
}
