// Подключение функционала 
import { FLS } from "@js/common/functions.js";

import './marquee.scss'

// Модуль бегущей строки
const marquee = () => {
	/*
		 Инструкция:
		 Структура: Можно указывать любые классы и теги элементам.
		 <div data-fls-marquee>
			 <span>element one</span>
			 <div>element two</div>
		 </div>
		 Дополнительные настройки (можно не указывать):
		 data-fls-marquee-space='30' - Отступ между элементами (по умолчанию 30px) - можно указывать в CSS-стилях
		 data-fls-marquee-speed='1000' - Скорость анимации (по умолчанию 1000), указывать в ms, 1s = 1000
		 data-fls-marquee-pause-mouse-enter - Останавливать анимацию при наведении мыши.
		 data-fls-marquee-direction='left' - Направление анимации "top, right, bottom, left" (по умолчанию left)
		 !Важно: При использовании data-fls-marquee-direction 'top' или 'bottom' должна быть фиксированная высота + overflow: hidden;
	 */

	const $marqueeArray = document.querySelectorAll('[data-fls-marquee]');
	const CLASS_NAMES = {
		wrapper: 'marquee-wrapper',
		inner: 'marquee-inner',
		item: 'marquee-item',
	};

	if (!$marqueeArray.length) return;

	const { head } = document;

	// Функция отложенного вызова
	function debounce(delay, fn) {
		let timerId;
		return (...args) => {
			if (timerId) {
				clearTimeout(timerId);
			}
			timerId = setTimeout(() => {
				fn(...args);
				timerId = null;
			}, delay);
		};
	}

	// Событие изменения размеров вьюпорта
	const onWindowWidthResize = (cb) => {
		if (!cb && !isFunction(cb)) return;

		let prevWidth = 0;

		const handleResize = () => {
			const currentWidth = window.innerWidth;

			if (prevWidth !== currentWidth) {
				prevWidth = currentWidth;
				cb();
			}
		};

		window.addEventListener('resize', debounce(50, handleResize));

		handleResize();
	};

	// Создаем структуру
	const buildMarquee = (marqueeNode) => {
		if (!marqueeNode) return;

		const $marquee = marqueeNode;
		const $childElements = $marquee.children;

		if (!$childElements.length) return;
		$marquee.classList.add(CLASS_NAMES.wrapper);
		Array.from($childElements).forEach(($childItem) => $childItem.classList.add(CLASS_NAMES.item));

		const htmlStructure = `<div class="${CLASS_NAMES.inner}">${$marquee.innerHTML}</div>`;
		$marquee.innerHTML = htmlStructure;
	};

	// Функция получения размеров элементов
	const getElSize = ($el, isVertical) => {
		if (isVertical) return $el.offsetHeight;
		return $el.offsetWidth;
	};

	$marqueeArray.forEach(($wrapper) => {
		if (!$wrapper) return;

		buildMarquee($wrapper);

		const $marqueeInner = $wrapper.firstElementChild;
		let cacheArray = [];

		if (!$marqueeInner) return;

		const dataMarqueeSpace = parseFloat($wrapper.getAttribute('data-fls-marquee-space'));
		const $items = $wrapper.querySelectorAll(`.${CLASS_NAMES.item}`);
		const speed = parseFloat($wrapper.getAttribute('data-fls-marquee-speed')) / 10 || 100;
		const isMousePaused = $wrapper.hasAttribute('data-fls-marquee-pause');
		const direction = $wrapper.getAttribute('data-fls-marquee-direction');
		const isVertical = direction === 'bottom' || direction === 'top';
		const animName = `marqueeAnimation-${Math.floor(Math.random() * 10000000)}`;
		let spaceBetweenItem = parseFloat(window.getComputedStyle($items[0])?.getPropertyValue('margin-right'));
		let spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
		let startPosition = parseFloat($wrapper.getAttribute('data-fls-marquee-start')) || 0;

		// Динамические данные, вычисляются при работе скрипта.
		let sumSize = 0;
		let firstScreenVisibleSize = 0;
		let initialSizeElements = 0;
		let initialElementsLength = $marqueeInner.children.length;
		let index = 0;
		let counterDuplicateElements = 0;

		// Инициализация событий.
		const initEvents = () => {
			if (startPosition) $marqueeInner.addEventListener('animationiteration', onChangeStartPosition);

			if (!isMousePaused) return;
			$marqueeInner.removeEventListener('mouseenter', onChangePaused);
			$marqueeInner.removeEventListener('mouseleave', onChangePaused);
			$marqueeInner.addEventListener('mouseenter', onChangePaused);
			$marqueeInner.addEventListener('mouseleave', onChangePaused);
		};

		const onChangeStartPosition = () => {
			startPosition = 0;
			$marqueeInner.removeEventListener('animationiteration', onChangeStartPosition);
			onResize();
		};

		// Добавление базовых стилей для корректной работы анимации.
		const setBaseStyles = (firstScreenVisibleSize) => {
			let baseStyle = 'display: flex; flex-wrap: nowrap;';

			if (isVertical) {
				baseStyle += `
				flex-direction: column;
			 position: relative;
			 will-change: transform;`;

				if (direction === 'bottom') {
					baseStyle += `top: -${firstScreenVisibleSize}px;`;
				}
			} else {
				baseStyle += `
				position: relative;
			 will-change: transform;`;

				if (direction === 'right') {
					baseStyle += `left: -${firstScreenVisibleSize}px;;`;
				}
			}

			$marqueeInner.style.cssText = baseStyle;
		};

		// Функция возвращает значение, на которое нужно сместить элементы при анимации.
		const setdirectionAnim = (totalWidth) => {
			switch (direction) {
				case 'right':
				case 'bottom':
					return totalWidth;
				default:
					return -totalWidth;
			}
		};

		// Функция анимации.
		const animation = () => {
			const keyFrameCss = `@keyframes ${animName} {
					 0% {
						 transform: translate${isVertical ? 'Y' : 'X'}(${startPosition}%);
					 }
					 100% {
						 transform: translate${isVertical ? 'Y' : 'X'}(${setdirectionAnim(firstScreenVisibleSize)}px);
					 }
				 }`;
			const $style = document.createElement('style');

			$style.classList.add(animName);
			$style.innerHTML = keyFrameCss;
			head.append($style);

			$marqueeInner.style.animation = `${animName} ${(firstScreenVisibleSize + (startPosition * firstScreenVisibleSize) / 100) / speed
				}s infinite linear`;
		};

		// Функция работы с элементами (дублирование, указание и подсчет размеров)
		const addDublicateElements = () => {
			// После изменения размеров экрана обнуляем все динамические данные.
			sumSize = firstScreenVisibleSize = initialSizeElements = counterDuplicateElements = index = 0;

			const $parentNodeWidth = getElSize($wrapper, isVertical);

			let $childrenEl = Array.from($marqueeInner.children);

			if (!$childrenEl.length) return;

			if (!cacheArray.length) {
				cacheArray = $childrenEl.map(($item) => $item);
			} else {
				$childrenEl = [...cacheArray];
			}

			// Добавляем базовые стили флексов для корректного подсчета размеров элементов.
			$marqueeInner.style.display = 'flex';
			if (isVertical) $marqueeInner.style.flexDirection = 'column';
			// Обнуляем количество элементов, чтобы избежать дублирования при изменении размеров экрана.
			$marqueeInner.innerHTML = '';
			$childrenEl.forEach(($item) => {
				$marqueeInner.append($item);
			});

			// Перед дублированием элементов добавляем стили отступов и вносим размеры элементов в динамические данные.
			$childrenEl.forEach(($item) => {
				if (isVertical) {
					$item.style.marginBottom = `${spaceBetween}px`;
				} else {
					$item.style.marginRight = `${spaceBetween}px`;
					$item.style.flexShrink = 0;
				}

				const sizeEl = getElSize($item, isVertical);

				sumSize += sizeEl + spaceBetween;
				firstScreenVisibleSize += sizeEl + spaceBetween;
				initialSizeElements += sizeEl + spaceBetween;
				counterDuplicateElements += 1;

				return sizeEl;
			});

			const $multiplyWidth = $parentNodeWidth * 2 + initialSizeElements;

			// Дублируем элементы при необходимости.
			for (; sumSize < $multiplyWidth; index += 1) {
				if (!$childrenEl[index]) index = 0;

				const $cloneNone = $childrenEl[index].cloneNode(true);
				const $lastElement = $marqueeInner.children[index];

				$marqueeInner.append($cloneNone);

				sumSize += getElSize($lastElement, isVertical) + spaceBetween;

				if (
					firstScreenVisibleSize < $parentNodeWidth ||
					counterDuplicateElements % initialElementsLength !== 0
				) {
					counterDuplicateElements += 1;
					firstScreenVisibleSize += getElSize($lastElement, isVertical) + spaceBetween;
				}
			}

			// Добавляем базовые стили с учетом вычисленных значений ширин элементов.
			setBaseStyles(firstScreenVisibleSize);
		};

		// Функция корректного определения отступов между элементами (если отступы добавлены в CSS).
		const correctSpaceBetween = () => {
			if (spaceBetweenItem) {
				$items.forEach(($item) => $item.style.removeProperty('margin-right'));

				spaceBetweenItem = parseFloat(window.getComputedStyle($items[0]).getPropertyValue('margin-right'));
				spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
			}
		};

		// Функция инициализации.
		const init = () => {
			correctSpaceBetween();
			addDublicateElements();
			animation();
			initEvents();
		};

		// Функция перезапуска анимации при изменении размеров вьюпорта.
		const onResize = () => {
			head.querySelector(`.${animName}`)?.remove();
			init();
		};

		// Функция паузы при наведении мыши.
		const onChangePaused = (e) => {
			const { type, target } = e;

			target.style.animationPlayState = type === 'mouseenter' ? 'paused' : 'running';
		};
		onWindowWidthResize(onResize);
	});
}
marquee()
