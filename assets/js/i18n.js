/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Emanuel Barbera
 *
 * User-interface translations.
 *
 * English keys are the stable API used by HTML and JavaScript. Translators
 * can add a locale by copying the English object and registering its language
 * code in `SUPPORTED_LANGUAGES`.
 */

import { additionalTranslations } from "./locales/additional.js";

export const SUPPORTED_LANGUAGES = [
  "en",
  "es",
  "it",
  "pt",
  "fr",
  "de",
  "zh",
  "ja",
  "ko",
  "ar",
  "hi",
  "ru",
];

const RTL_LANGUAGES = new Set(["ar"]);

export const translations = {
  en: {
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    eyebrow: "Project planner",
    headline: "Dynamic calendar",
    intro: "Organize activities, deliverables, and shifts for a specific period. Notes are saved automatically in this browser.",
    project: "Project or calendar name",
    projectPlaceholder: "E.g. Campaign launch",
    start: "Start date",
    end: "End date",
    from: "From",
    to: "To",
    period: "Date range",
    selectDateRange: "Select a date range",
    week: "Week starts on",
    language: "Language",
    monday: "Monday",
    sunday: "Sunday",
    first: "From the first day",
    color: "Color",
    applyTo: "Apply to",
    row: "Entire row",
    column: "Entire column",
    removeColors: "Remove colors",
    print: "Print / save PDF",
    printOrientation: "Print orientation",
    landscape: "Landscape",
    portrait: "Portrait",
    clearNotes: "Clear visible notes",
    cleanAll: "Clear all",
    defaultTitle: "Activity calendar",
    weekend: "Weekend",
    outside: "Outside period",
    activity: "Add activity…",
    optional: "Optional note",
    ready: "Ready",
    saved: "Saved",
    saving: "Saving…",
    notesCleared: "Notes cleared",
    colorsCleared: "Colors cleared",
    colorApplied: "Color applied",
    confirmNotes: "Clear visible notes from this calendar? This action cannot be undone.",
    confirmColors: "Remove all colors from this calendar?",
    confirmAll: "Clear all notes and colors from this calendar? This action cannot be undone.",
    allCleared: "All cleared",
    applyColorTo: "Apply color to",
    daysPlural: "days",
    daySingular: "day",
    selection: "Selection",
    cancel: "Cancel",
    apply: "Done",
    today: "Today",
    sevenDays: "7 days",
    twoWeeks: "2 weeks",
    fourWeeks: "4 weeks",
    thisMonth: "This month",
    nextMonth: "Next month",
    previousMonth: "Previous month",
    nextMonthLabel: "Next month",
    datePickerPresets: "Date range presets",
    calendarActions: "Calendar actions",
    calendarLegend: "Calendar legend",
    calendarRegion: "Generated calendar",
    hint: "Tip: write directly inside a day. Right-click or drag across day headers to add color.",
    activitiesFor: "Activities for",
  },
  es: {
    months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    weekdays: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    eyebrow: "Planificador de proyectos",
    headline: "Calendario dinámico",
    intro: "Organiza actividades, entregas y turnos en un período concreto. Las notas se guardan automáticamente en este navegador.",
    project: "Nombre del proyecto o calendario",
    projectPlaceholder: "Ej. Lanzamiento de campaña",
    start: "Fecha de inicio",
    end: "Fecha de fin",
    from: "Desde",
    to: "Hasta",
    period: "Período de fechas",
    selectDateRange: "Seleccionar un período de fechas",
    week: "La semana empieza",
    language: "Idioma",
    monday: "Lunes",
    sunday: "Domingo",
    first: "Desde el primer día",
    color: "Color",
    applyTo: "Aplicar a",
    row: "La fila completa",
    column: "La columna completa",
    removeColors: "Quitar colores",
    print: "Imprimir / guardar PDF",
    printOrientation: "Orientación de impresión",
    landscape: "Horizontal",
    portrait: "Vertical",
    clearNotes: "Borrar notas visibles",
    cleanAll: "Borrar todo",
    defaultTitle: "Calendario de actividades",
    weekend: "Fin de semana",
    outside: "Fuera del período",
    activity: "Añadir actividad…",
    optional: "Nota opcional",
    ready: "Listo",
    saved: "Guardado",
    saving: "Guardando…",
    notesCleared: "Notas eliminadas",
    colorsCleared: "Colores eliminados",
    colorApplied: "Color aplicado",
    confirmNotes: "¿Borrar las notas visibles de este calendario? Esta acción no se puede deshacer.",
    confirmColors: "¿Quitar todos los colores de este calendario?",
    confirmAll: "¿Borrar todas las notas y colores de este calendario? Esta acción no se puede deshacer.",
    allCleared: "Todo borrado",
    applyColorTo: "Aplicar color a",
    daysPlural: "días",
    daySingular: "día",
    selection: "Selección",
    cancel: "Cancelar",
    apply: "Listo",
    today: "Hoy",
    sevenDays: "7 días",
    twoWeeks: "2 semanas",
    fourWeeks: "4 semanas",
    thisMonth: "Este mes",
    nextMonth: "Próximo mes",
    previousMonth: "Mes anterior",
    nextMonthLabel: "Mes siguiente",
    datePickerPresets: "Períodos predefinidos",
    calendarActions: "Acciones del calendario",
    calendarLegend: "Leyenda del calendario",
    calendarRegion: "Calendario generado",
    hint: "Consejo: escribe dentro de un día. Haz clic derecho o arrastra sobre los encabezados para añadir color.",
    activitiesFor: "Actividades del",
  },
  it: {
    months: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
    weekdays: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
    eyebrow: "Pianificatore di progetti",
    headline: "Calendario dinamico",
    intro: "Organizza attività, consegne e turni per un periodo specifico. Le note vengono salvate automaticamente nel browser.",
    project: "Nome del progetto o calendario",
    projectPlaceholder: "Es. Lancio campagna",
    start: "Data di inizio",
    end: "Data di fine",
    from: "Dal",
    to: "Al",
    period: "Intervallo di date",
    selectDateRange: "Seleziona un intervallo di date",
    week: "La settimana inizia",
    language: "Lingua",
    monday: "Lunedì",
    sunday: "Domenica",
    first: "Dal primo giorno",
    color: "Colore",
    applyTo: "Applica a",
    row: "Riga intera",
    column: "Colonna intera",
    removeColors: "Rimuovi colori",
    print: "Stampa / salva PDF",
    printOrientation: "Orientamento di stampa",
    landscape: "Orizzontale",
    portrait: "Verticale",
    clearNotes: "Cancella note visibili",
    cleanAll: "Cancella tutto",
    defaultTitle: "Calendario attività",
    weekend: "Fine settimana",
    outside: "Fuori periodo",
    activity: "Aggiungi attività…",
    optional: "Nota facoltativa",
    ready: "Pronto",
    saved: "Salvato",
    saving: "Salvataggio…",
    notesCleared: "Note cancellate",
    colorsCleared: "Colori rimossi",
    colorApplied: "Colore applicato",
    confirmNotes: "Cancellare le note visibili da questo calendario? Questa azione non può essere annullata.",
    confirmColors: "Rimuovere tutti i colori da questo calendario?",
    confirmAll: "Cancellare tutte le note e i colori da questo calendario? Questa azione non può essere annullata.",
    allCleared: "Tutto cancellato",
    applyColorTo: "Applica colore a",
    daysPlural: "giorni",
    daySingular: "giorno",
    selection: "Selezione",
    cancel: "Annulla",
    apply: "Fatto",
    today: "Oggi",
    sevenDays: "7 giorni",
    twoWeeks: "2 settimane",
    fourWeeks: "4 settimane",
    thisMonth: "Questo mese",
    nextMonth: "Mese prossimo",
    previousMonth: "Mese precedente",
    nextMonthLabel: "Mese successivo",
    datePickerPresets: "Intervalli predefiniti",
    calendarActions: "Azioni del calendario",
    calendarLegend: "Legenda del calendario",
    calendarRegion: "Calendario generato",
    hint: "Suggerimento: scrivi dentro un giorno. Fai clic destro o trascina sulle intestazioni per aggiungere colore.",
    activitiesFor: "Attività per",
  },
  pt: {
    months: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
    weekdays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    eyebrow: "Planejador de projetos",
    headline: "Calendário dinâmico",
    intro: "Organize atividades, entregas e turnos em um período específico. As notas são salvas automaticamente neste navegador.",
    project: "Nome do projeto ou calendário",
    projectPlaceholder: "Ex. Lançamento da campanha",
    start: "Data de início",
    end: "Data de término",
    from: "De",
    to: "Até",
    period: "Período de datas",
    selectDateRange: "Selecionar um período de datas",
    week: "A semana começa",
    language: "Idioma",
    monday: "Segunda-feira",
    sunday: "Domingo",
    first: "A partir do primeiro dia",
    color: "Cor",
    applyTo: "Aplicar a",
    row: "Linha inteira",
    column: "Coluna inteira",
    removeColors: "Remover cores",
    print: "Imprimir / salvar PDF",
    printOrientation: "Orientação da impressão",
    landscape: "Paisagem",
    portrait: "Retrato",
    clearNotes: "Limpar notas visíveis",
    cleanAll: "Limpar tudo",
    defaultTitle: "Calendário de atividades",
    weekend: "Fim de semana",
    outside: "Fora do período",
    activity: "Adicionar atividade…",
    optional: "Nota opcional",
    ready: "Pronto",
    saved: "Salvo",
    saving: "Salvando…",
    notesCleared: "Notas limpas",
    colorsCleared: "Cores removidas",
    colorApplied: "Cor aplicada",
    confirmNotes: "Limpar as notas visíveis deste calendário? Esta ação não pode ser desfeita.",
    confirmColors: "Remover todas as cores deste calendário?",
    confirmAll: "Limpar todas as notas e cores deste calendário? Esta ação não pode ser desfeita.",
    allCleared: "Tudo limpo",
    applyColorTo: "Aplicar cor a",
    daysPlural: "dias",
    daySingular: "dia",
    selection: "Seleção",
    cancel: "Cancelar",
    apply: "Concluído",
    today: "Hoje",
    sevenDays: "7 dias",
    twoWeeks: "2 semanas",
    fourWeeks: "4 semanas",
    thisMonth: "Este mês",
    nextMonth: "Próximo mês",
    previousMonth: "Mês anterior",
    nextMonthLabel: "Mês seguinte",
    datePickerPresets: "Períodos predefinidos",
    calendarActions: "Ações do calendário",
    calendarLegend: "Legenda do calendário",
    calendarRegion: "Calendário gerado",
    hint: "Dica: escreva dentro de um dia. Clique com o botão direito ou arraste nos cabeçalhos para adicionar cor.",
    activitiesFor: "Atividades de",
  },
  ...additionalTranslations,
};

/** Return a supported language code, falling back to English. */
export function normalizeLanguage(value) {
  return SUPPORTED_LANGUAGES.includes(value) ? value : "en";
}

/** Return the translation dictionary for a language code. */
export function getMessages(language) {
  return translations[normalizeLanguage(language)];
}

/** Return the writing direction required by a supported language. */
export function getTextDirection(language) {
  return RTL_LANGUAGES.has(normalizeLanguage(language)) ? "rtl" : "ltr";
}

/**
 * Apply simple text, placeholder, and accessible-label translations declared
 * in the HTML. Dynamic calendar content is translated while it is rendered.
 */
export function translateDocument(language) {
  const normalizedLanguage = normalizeLanguage(language);
  const messages = getMessages(normalizedLanguage);
  document.documentElement.lang = normalizedLanguage;
  document.documentElement.dir = getTextDirection(normalizedLanguage);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = messages[element.dataset.i18n];
    if (value) element.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const value = messages[element.dataset.i18nPlaceholder];
    if (value) element.placeholder = value;
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const value = messages[element.dataset.i18nAriaLabel];
    if (value) element.setAttribute("aria-label", value);
  });

  // These labels belong to grouped elements instead of plain text nodes.
  document.querySelector("#popoverPresets")?.setAttribute("aria-label", messages.datePickerPresets);
  document.querySelector(".calendar-actions")?.setAttribute("aria-label", messages.calendarActions);
  document.querySelector(".legend")?.setAttribute("aria-label", messages.calendarLegend);
  document.querySelector(".calendar-wrapper")?.setAttribute("aria-label", messages.calendarRegion);
}
