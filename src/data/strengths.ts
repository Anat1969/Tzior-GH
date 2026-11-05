// 24 חוזקות האופי לפי סיווג VIA (Peterson & Seligman, 2004).
// התוכן (תיאור, צל, מסגור מחדש ואתגר) מגיע מהאפליקציה "חוזקות וצל":
// https://id-preview--3c13e98a-f7bc-463a-821e-da9cdc65608c.lovable.app/ (src/data/strengths.ts), בניסוח מזוקק.

export type Virtue = 'wisdom' | 'courage' | 'humanity' | 'justice' | 'temperance' | 'transcendence'

export type Strength = {
  id: number
  name: string
  en: string
  virtue: Virtue
  description: string
  shadow: { name: string; description: string; reframe: string }
  challenge: string
}

export const VIRTUES: Record<Virtue, { name: string; en: string }> = {
  wisdom: { name: 'חוכמה', en: 'Wisdom' },
  courage: { name: 'אומץ לב', en: 'Courage' },
  humanity: { name: 'אנושיות', en: 'Humanity' },
  justice: { name: 'צדק', en: 'Justice' },
  temperance: { name: 'מתינות', en: 'Temperance' },
  transcendence: { name: 'נשגבות', en: 'Transcendence' },
}

export const STRENGTHS: Strength[] = [
  { id: 1, name: 'יצירתיות', en: 'Creativity', virtue: 'wisdom', description: 'חשיבה על דרכים חדשות ופוריות לעשות דברים.', shadow: { name: 'כאוס יצירתי', description: 'פיזור, קפיצה בין רעיונות, בלי סיום.', reframe: 'היצירתיות היא מנוע. מסגרת נותנת לה לפרוח.' }, challenge: 'מצא/י היום דרך יצירתית אחת לפתור בעיה שגרתית.' },
  { id: 2, name: 'סקרנות', en: 'Curiosity', virtue: 'wisdom', description: 'עניין בחוויות ובנושאים חדשים.', shadow: { name: 'חטטנות', description: 'סקרנות עודפת שחוצה גבולות של אחרים.', reframe: 'הסקרנות מראה שאכפת. מכוונים אותה לשאלות שמעצימות.' }, challenge: 'שאל/י היום שאלה עמוקה אחת מישהו שאת/ה מכיר/ה.' },
  { id: 3, name: 'שיקול דעת', en: 'Judgment', virtue: 'wisdom', description: 'בחינת דברים מכל הזוויות, בלי קפיצה למסקנות.', shadow: { name: 'ציניות', description: 'ביקורתיות יתר שמשתקת פעולה.', reframe: 'שיקול הדעת הוא כוח לבנות, לא לפרק.' }, challenge: 'לפני שיפוט היום, מצא/י שלושה דברים טובים במה שלפניך.' },
  { id: 4, name: 'אהבת למידה', en: 'Love of Learning', virtue: 'wisdom', description: 'שליטה במיומנויות ובנושאים חדשים.', shadow: { name: 'ידענות', description: 'תחושת עליונות שמרחיקה אנשים.', reframe: 'הרצון ללמוד מקרב כששותפים בו בענווה.' }, challenge: 'למד/י היום משהו חדש לגמרי, ושתף/י אדם אחד.' },
  { id: 5, name: 'פרספקטיבה', en: 'Perspective', virtue: 'wisdom', description: 'יכולת לראות את התמונה הרחבה ולתת עצה חכמה.', shadow: { name: 'ניתוק', description: 'הסתכלות מלמעלה בלי מעורבות רגשית.', reframe: 'החוכמה מתחברת ללב, ואז היא מובילה.' }, challenge: 'הקשב/י היום למישהו בלי לתת עצה. רק נוכחות.' },
  { id: 6, name: 'אומץ', en: 'Bravery', virtue: 'courage', description: 'לא להירתע מאתגר, מקושי או מכאב.', shadow: { name: 'פזיזות', description: 'לקיחת סיכונים מיותרים בלי חשיבה.', reframe: 'אומץ עם חוכמה הוא כוח שקשה לעצור.' }, challenge: 'עשה/י היום דבר אחד שמפחיד קצת.' },
  { id: 7, name: 'התמדה', en: 'Perseverance', virtue: 'courage', description: 'סיום מה שמתחילים, למרות מכשולים.', shadow: { name: 'עקשנות', description: 'המשך בדרך שלא עובדת, מתוך גאווה.', reframe: 'ההתמדה מרשימה. גמישות היא הכוח שמשלים אותה.' }, challenge: 'חזור/י למשימה שננטשה, וקדם/י אותה צעד אחד.' },
  { id: 8, name: 'יושרה', en: 'Honesty', virtue: 'courage', description: 'דיבור אמת והצגה אותנטית של עצמך.', shadow: { name: 'חוסר טאקט', description: 'אמת שנאמרת בצורה שפוגעת.', reframe: 'יושרה עטופה בחמלה משנה מציאות.' }, challenge: 'שתף/י בעדינות אמת אחת שנמנעת ממנה.' },
  { id: 9, name: 'חיוניות', en: 'Zest', virtue: 'courage', description: 'גישה לחיים בהתרגשות ובאנרגיה.', shadow: { name: 'שחיקה', description: 'אנרגיה עודפת שמובילה לתשישות.', reframe: 'החיוניות מדבקת. מנוחה שומרת עליה.' }, challenge: 'עשה/י היום פעילות אחת שמטעינה אותך.' },
  { id: 10, name: 'אהבה', en: 'Love', virtue: 'humanity', description: 'הערכת קשרים קרובים עם אחרים.', shadow: { name: 'תלותיות', description: 'צורך מוגזם בקרבה, שמחניק.', reframe: 'מרחב נותן לאהבה לגדול.' }, challenge: 'הבע/י היום הערכה כנה לאדם קרוב.' },
  { id: 11, name: 'חסד', en: 'Kindness', virtue: 'humanity', description: 'עשיית טוב לאחרים.', shadow: { name: 'הקרבה עצמית', description: 'נתינה עד התרוקנות.', reframe: 'גם מי שנותן/ת ראוי/ה לקבל.' }, challenge: 'עשה/י מעשה חסד אחד, וקבל/י עזרה אחת.' },
  { id: 12, name: 'אינטליגנציה חברתית', en: 'Social Intelligence', virtue: 'humanity', description: 'מודעות למניעים ולרגשות של אחרים ושל עצמך.', shadow: { name: 'מניפולטיביות', description: 'שימוש בהבנת אנשים לטובת עצמך.', reframe: 'הבנת אנשים היא כוח להעצים, לא לשלוט.' }, challenge: 'שים/י לב היום לשפת הגוף של מישהו, והגב/י ברגישות.' },
  { id: 13, name: 'עבודת צוות', en: 'Teamwork', virtue: 'justice', description: 'עבודה טובה כחלק מקבוצה.', shadow: { name: 'קונפורמיות', description: 'ויתור על הדעה שלך כדי להשתלב.', reframe: 'הקול הייחודי הוא התרומה הגדולה לצוות.' }, challenge: 'בפגישה הבאה, שתף/י בכבוד דעה שונה.' },
  { id: 14, name: 'הוגנות', en: 'Fairness', virtue: 'justice', description: 'יחס שווה לכל אדם.', shadow: { name: 'נוקשות', description: 'דבקות בכללים גם כשאינם משרתים.', reframe: 'הוגנות אמיתית יודעת להתגמש.' }, challenge: 'שקול/י מצב מזווית של אדם אחר לפני החלטה.' },
  { id: 15, name: 'מנהיגות', en: 'Leadership', virtue: 'justice', description: 'ארגון פעילות קבוצתית והבאתה לביצוע.', shadow: { name: 'שליטנות', description: 'צורך בשליטה שמדכא אחרים.', reframe: 'מנהיגות גדולה מעצימה אחרים.' }, challenge: 'האצל/י סמכות אחת, ותן/י למישהו להוביל.' },
  { id: 16, name: 'סליחה', en: 'Forgiveness', virtue: 'temperance', description: 'סליחה למי שפגע.', shadow: { name: 'דלת מסתובבת', description: 'סליחה חוזרת שמאפשרת פגיעה.', reframe: 'סליחה עם גבולות מגינה עליך.' }, challenge: 'שחרר/י טינה קטנה אחת, בשבילך.' },
  { id: 17, name: 'ענווה', en: 'Humility', virtue: 'temperance', description: 'לתת להישגים לדבר בעד עצמם.', shadow: { name: 'מחיקה עצמית', description: 'הקטנה עצמית עד היעלמות.', reframe: 'הענווה מכובדת, והעולם צריך לשמוע את הקול שלך.' }, challenge: 'קבל/י מחמאה היום בלי להקטין אותה.' },
  { id: 18, name: 'זהירות', en: 'Prudence', virtue: 'temperance', description: 'שקילת בחירות בקפידה, בלי סיכון מיותר.', shadow: { name: 'שיתוק', description: 'פחד מטעות שמונע כל פעולה.', reframe: 'לפעמים הצעד הזהיר ביותר הוא להתקדם.' }, challenge: 'קח/י היום סיכון מחושב וקטן אחד.' },
  { id: 19, name: 'ויסות עצמי', en: 'Self-Regulation', virtue: 'temperance', description: 'שליטה במה שמרגישים ועושים.', shadow: { name: 'דיכוי', description: 'שליטת יתר שמנתקת מרגש.', reframe: 'מותר גם להרגיש. זו לא חולשה.' }, challenge: 'הרשה/י לעצמך להרגיש רגש אחד בלי לשפוט אותו.' },
  { id: 20, name: 'הערכת יופי', en: 'Appreciation of Beauty', virtue: 'transcendence', description: 'תשומת לב ליופי ולמצוינות.', shadow: { name: 'ניתוק מהמציאות', description: 'חיים בעולם אידאלי, רחוק מהיומיום.', reframe: 'העין ליופי, כשהיא פועלת, יוצרת יופי.' }, challenge: 'תעד/י היום דבר יפה אחד שראית.' },
  { id: 21, name: 'הכרת תודה', en: 'Gratitude', virtue: 'transcendence', description: 'מודעות והכרה בטוב שקורה.', shadow: { name: 'רגשנות מוגזמת', description: 'תודה שמרגישה לא אותנטית.', reframe: 'תודה שזורמת בטבעיות מאירה.' }, challenge: 'כתוב/כתבי שלושה דברים שאת/ה אסיר/ת תודה עליהם.' },
  { id: 22, name: 'תקווה', en: 'Hope', virtue: 'transcendence', description: 'ציפייה לטוב, ועבודה להשגתו.', shadow: { name: 'נאיביות', description: 'אופטימיות עיוורת שמתעלמת מסכנות.', reframe: 'תקווה עם תוכנית משנה מציאות.' }, challenge: 'בחר/י אתגר אחד, וכתוב/כתבי לו תרחיש טוב ואמין.' },
  { id: 23, name: 'הומור', en: 'Humor', virtue: 'transcendence', description: 'אהבת צחוק והבאת חיוך לאחרים.', shadow: { name: 'ליצנות', description: 'הומור שמשמש להתחמקות מרגש.', reframe: 'הומור מרפא כשהוא מחבר, לא כשהוא מסתיר.' }, challenge: 'שתף/י רגע מצחיק, ואז שאל/י מה שלומו באמת.' },
  { id: 24, name: 'רוחניות', en: 'Spirituality', virtue: 'transcendence', description: 'תחושת מטרה ומשמעות גבוהה.', shadow: { name: 'בריחה', description: 'רוחניות שמנתקת מהעולם.', reframe: 'חיבור עמוק מתבטא בפעולה יומיומית.' }, challenge: 'הקדש/י 5 דקות לשקט, ושאל/י: מה באמת חשוב לי?' },
]

export const strengthById = (id: number) => STRENGTHS.find((s) => s.id === id)!
