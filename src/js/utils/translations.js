const TRANSLATIONS = {
    common: {
        close: 'Закрыть',
        copy: 'Копировать',
        more: 'Ещё...',
        error: 'Ошибка'
    },
    nav: {
        home: 'Главная',
        search: 'Поиск',
        contacts: 'Контакты'
    },
    error: {
        fetchPosts: 'Не удалось загрузить список постов',
        loadPost: 'Не удалось загрузить текст поста'
    },
    post: {
        back: 'Назад к постам',
        readTime: 'мин чтения',
        share: 'Поделиться',
        readMore: 'Читать далее',
        toc: 'Содержание',
        noPosts: 'Пока нет постов',
        addFirst: 'Добавьте свой первый пост в папку',
        notFound: 'Пост не найден',
        notAvailable: 'К сожалению, этот пост недоступен.'
    },
    share: {
        telegram: 'Telegram',
        twitter: 'Twitter',
        copy: 'Копировать ссылку',
        more: 'Другие способы',
        copied: 'Ссылка скопирована!'
    },
    pagination: {
        prev: 'Назад',
        next: 'Вперёд',
        label: 'Навигация по страницам'
    },
    search: {
        title: 'Поиск по постам',
        placeholder: 'Начните вводить для поиска...',
        hint: 'Введите запрос для поиска по заголовкам и описаниям постов',
        empty: 'Ничего не найдено',
        emptyTip: 'Попробуйте изменить поисковый запрос',
        countPrefix: 'Найдено постов:'
    },
    contacts: {
        title: 'Контакты'
    }
};

/**
 * Get translated string by key path (e.g., 'nav.home')
 * @param {string} path - Key path
 * @returns {string} Translated string
 */
export function t(path) {
    const keys = path.split('.');
    let result = TRANSLATIONS;

    for (const key of keys) {
        if (result && result[key]) {
            result = result[key];
        } else {
            console.warn(`Translation key not found: ${path}`);
            return path;
        }
    }

    return result;
}
