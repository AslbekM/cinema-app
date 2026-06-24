import React, { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'en' | 'pl' | 'ru'

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
]

type Dict = Record<string, string>

const en: Dict = {
  'nav.screenings': 'Screenings',
  'nav.myTickets': 'My Tickets',
  'nav.dashboard': 'Dashboard',
  'nav.users': 'Users',
  'nav.login': 'Login',
  'nav.register': 'Register',
  'nav.logout': 'Logout',

  'hero.eyebrow': 'Now playing in 4K',
  'hero.titlePre': 'Your night at the movies,',
  'hero.titleHi': 'reimagined',
  'hero.subtitle':
    'Browse screenings, pick the perfect seat on an interactive map, and reserve in seconds — all in one beautifully simple experience.',
  'hero.browse': 'Browse screenings',
  'hero.createAccount': 'Create account',

  'quick.label': 'QUICK PURCHASE',
  'quick.cinema': 'Cinema',
  'quick.cinemaPh': 'Choose a cinema',
  'quick.film': 'Film / Event',
  'quick.filmPh': 'Select a title',
  'quick.date': 'Date',
  'quick.datePh': 'Select a date',
  'quick.search': 'Search',

  'home.nowShowing': 'Now Showing',
  'home.nowShowingSub': 'Fresh screenings, hand-picked for tonight',
  'home.searchResults': 'Search Results',
  'home.viewAll': 'View all',
  'home.clear': 'Clear filters',
  'home.noResults': 'No screenings match your search.',
  'home.none': 'No screenings available right now.',
  'home.loading': 'Loading screenings…',

  'auth.welcomeBack': 'Welcome back',
  'auth.signInSub': 'Sign in to reserve your seats',
  'auth.nickname': 'Nickname',
  'auth.password': 'Password',
  'auth.login': 'Login',
  'auth.loggingIn': 'Logging in…',
  'auth.noAccount': "Don't have an account?",
  'auth.register': 'Register',
  'auth.createAccount': 'Create your account',
  'auth.joinSub': 'Join adafcinema and start booking in seconds',
  'auth.haveAccount': 'Already have an account?',

  'tickets.title': 'My Tickets',
  'tickets.sub': 'Your booked seats and reservation history',
  'tickets.bookMore': 'Book more',
  'tickets.upcoming': 'Upcoming',
  'tickets.past': 'Past',
  'tickets.none': "You haven't booked any seats yet.",
  'tickets.noUpcoming': 'No upcoming reservations.',
}

const pl: Dict = {
  'nav.screenings': 'Seanse',
  'nav.myTickets': 'Moje bilety',
  'nav.dashboard': 'Panel',
  'nav.users': 'Użytkownicy',
  'nav.login': 'Zaloguj',
  'nav.register': 'Rejestracja',
  'nav.logout': 'Wyloguj',

  'hero.eyebrow': 'Teraz w 4K',
  'hero.titlePre': 'Twój wieczór w kinie,',
  'hero.titleHi': 'na nowo',
  'hero.subtitle':
    'Przeglądaj seanse, wybierz idealne miejsce na interaktywnej mapie i zarezerwuj w kilka sekund — wszystko w jednym prostym miejscu.',
  'hero.browse': 'Przeglądaj seanse',
  'hero.createAccount': 'Załóż konto',

  'quick.label': 'SZYBKI ZAKUP',
  'quick.cinema': 'Kino',
  'quick.cinemaPh': 'Wybierz kino',
  'quick.film': 'Film / Wydarzenie',
  'quick.filmPh': 'Wybierz tytuł',
  'quick.date': 'Data',
  'quick.datePh': 'Wybierz datę',
  'quick.search': 'Szukaj',

  'home.nowShowing': 'Teraz grane',
  'home.nowShowingSub': 'Świeże seanse, wybrane na dziś',
  'home.searchResults': 'Wyniki wyszukiwania',
  'home.viewAll': 'Zobacz wszystkie',
  'home.clear': 'Wyczyść filtry',
  'home.noResults': 'Brak seansów pasujących do wyszukiwania.',
  'home.none': 'Obecnie brak dostępnych seansów.',
  'home.loading': 'Ładowanie seansów…',

  'auth.welcomeBack': 'Witaj ponownie',
  'auth.signInSub': 'Zaloguj się, aby zarezerwować miejsca',
  'auth.nickname': 'Pseudonim',
  'auth.password': 'Hasło',
  'auth.login': 'Zaloguj',
  'auth.loggingIn': 'Logowanie…',
  'auth.noAccount': 'Nie masz konta?',
  'auth.register': 'Zarejestruj się',
  'auth.createAccount': 'Utwórz konto',
  'auth.joinSub': 'Dołącz do adafcinema i rezerwuj w kilka sekund',
  'auth.haveAccount': 'Masz już konto?',

  'tickets.title': 'Moje bilety',
  'tickets.sub': 'Twoje zarezerwowane miejsca i historia',
  'tickets.bookMore': 'Rezerwuj więcej',
  'tickets.upcoming': 'Nadchodzące',
  'tickets.past': 'Minione',
  'tickets.none': 'Nie masz jeszcze żadnych rezerwacji.',
  'tickets.noUpcoming': 'Brak nadchodzących rezerwacji.',
}

const ru: Dict = {
  'nav.screenings': 'Сеансы',
  'nav.myTickets': 'Мои билеты',
  'nav.dashboard': 'Панель',
  'nav.users': 'Пользователи',
  'nav.login': 'Войти',
  'nav.register': 'Регистрация',
  'nav.logout': 'Выйти',

  'hero.eyebrow': 'Сейчас в 4K',
  'hero.titlePre': 'Ваш вечер в кино,',
  'hero.titleHi': 'по-новому',
  'hero.subtitle':
    'Просматривайте сеансы, выбирайте идеальное место на интерактивной карте и бронируйте за секунды — всё в одном удобном месте.',
  'hero.browse': 'Смотреть сеансы',
  'hero.createAccount': 'Создать аккаунт',

  'quick.label': 'БЫСТРАЯ ПОКУПКА',
  'quick.cinema': 'Кинотеатр',
  'quick.cinemaPh': 'Выберите кинотеатр',
  'quick.film': 'Фильм / Событие',
  'quick.filmPh': 'Выберите название',
  'quick.date': 'Дата',
  'quick.datePh': 'Выберите дату',
  'quick.search': 'Поиск',

  'home.nowShowing': 'Сейчас идёт',
  'home.nowShowingSub': 'Свежие сеансы, отобранные на вечер',
  'home.searchResults': 'Результаты поиска',
  'home.viewAll': 'Смотреть все',
  'home.clear': 'Сбросить фильтры',
  'home.noResults': 'Нет сеансов по вашему запросу.',
  'home.none': 'Сейчас нет доступных сеансов.',
  'home.loading': 'Загрузка сеансов…',

  'auth.welcomeBack': 'С возвращением',
  'auth.signInSub': 'Войдите, чтобы забронировать места',
  'auth.nickname': 'Никнейм',
  'auth.password': 'Пароль',
  'auth.login': 'Войти',
  'auth.loggingIn': 'Вход…',
  'auth.noAccount': 'Нет аккаунта?',
  'auth.register': 'Зарегистрироваться',
  'auth.createAccount': 'Создайте аккаунт',
  'auth.joinSub': 'Присоединяйтесь к adafcinema и бронируйте за секунды',
  'auth.haveAccount': 'Уже есть аккаунт?',

  'tickets.title': 'Мои билеты',
  'tickets.sub': 'Ваши забронированные места и история',
  'tickets.bookMore': 'Забронировать ещё',
  'tickets.upcoming': 'Предстоящие',
  'tickets.past': 'Прошедшие',
  'tickets.none': 'У вас пока нет бронирований.',
  'tickets.noUpcoming': 'Нет предстоящих бронирований.',
}

const DICTS: Record<Lang, Dict> = { en, pl, ru }

interface I18nContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('lang') as Lang) || 'en'
  )
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => {
    localStorage.setItem('lang', l)
    setLangState(l)
  }
  const t = (key: string) => DICTS[lang][key] ?? DICTS.en[key] ?? key

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
