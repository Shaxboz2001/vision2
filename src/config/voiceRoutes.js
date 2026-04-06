// config/voiceRoutes.js

export const VOICE_ROUTES = [
  {
    path: "/",
    label: "Boshqaruv Paneli",
    aliases: [
      "главная",
      "главную",
      "главный",
      "панель",
      "панель управления",
      "дашборд",
      "dashboard",
    ],
  },
  {
    path: "/bo'linmalar",
    label: "Bo'linmalar",
    aliases: [
      "подразделения",
      "подразделение",
      "отделы",
      "отдел",
      "цеха",
      "цех",
    ],
  },
  {
    path: "/uchastkalar",
    label: "Uchastkalar",
    aliases: ["участки", "участок"],
  },
  {
    path: "/uskunalar",
    label: "Uskunalar",
    aliases: ["оборудование", "оборудования", "станки", "станок"],
  },
  {
    path: "/datchiklar",
    label: "Datchiklar",
    aliases: ["датчики", "датчик", "сенсоры", "сенсор"],
  },
  {
    path: "/kameralar",
    label: "Kameralar",
    aliases: ["камеры", "камера", "камеру", "видео", "наблюдение"],
  },
  {
    path: "/analitika",
    label: "Analitika",
    aliases: [
      "аналитика",
      "аналитику",
      "статистика",
      "статистику",
      "графики",
      "график",
      "отчёт",
      "отчёты",
      "отчет",
      "отчеты",
    ],
  },
  {
    path: "/ogohlantirishlar",
    label: "Ogohlantirishlar",
    aliases: [
      "уведомления",
      "уведомление",
      "оповещения",
      "оповещение",
      "тревога",
      "тревоги",
    ],
  },
  {
    path: "/armatura",
    label: "Prokat LIVE",
    aliases: ["прокат", "арматура", "арматуру", "прокатка", "прокатку"],
  },
];

export const BACK_WORDS = ["назад", "вернись", "обратно"];
