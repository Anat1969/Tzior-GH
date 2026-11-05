// שש משימות ציור מונחות. כל משימה נשענת על הנחיה מוכרת בטיפול באמנות, עם מקור ושנה.
// הקריאה בכלי היא צורנית ותהליכית (FEATS), ולכן כל משימה מתאימה לכל הכללים. המשימה מכוונת את השאלה.
import type { Virtue } from './strengths'

export type Directive = {
  id: string
  title: string
  instruction: string
  question: string
  lens: string
  source: string
  focus: Virtue[]
}

export const DIRECTIVES: Directive[] = [
  {
    id: 'tree',
    title: 'עץ',
    instruction: 'צייר/י עץ. כל עץ שעולה.',
    question: 'על מה את/ה נשען/ת?',
    lens: 'שורשים, גזע ונוף: **מה מחזיק**, ו**לאן צומחים**.',
    source: 'מבחן העץ, קרל קוך (Karl Koch, Der Baumtest), 1949',
    focus: ['wisdom', 'temperance'],
  },
  {
    id: 'bridge',
    title: 'גשר',
    instruction: 'צייר/י גשר, מהמקום שבו את/ה נמצא/ת אל המקום שאליו את/ה רוצה להגיע.',
    question: 'מאיפה לאן?',
    lens: 'שני גדות ומעבר: **הכיוון**, **המכשול** ו**הדרך**.',
    source: 'ציור הגשר, הייז ולייונס (Hays & Lyons, The Bridge Drawing), 1981',
    focus: ['courage', 'transcendence'],
  },
  {
    id: 'rain',
    title: 'אדם בגשם',
    instruction: 'צייר/י אדם בגשם.',
    question: 'מה מגן עליך?',
    lens: 'עומס ומשאב: **מה יורד עליך**, ו**מה שומר**.',
    source: 'אדם בגשם, האמר (Emanuel Hammer, The Clinical Application of Projective Drawings), 1958',
    focus: ['temperance', 'humanity'],
  },
  {
    id: 'apple',
    title: 'קוטף תפוח',
    instruction: 'צייר/י אדם קוטף תפוח מעץ.',
    question: 'איך את/ה משיג/ה?',
    lens: 'מטרה ופתרון: **מה רוצים**, ו**איך מגיעים**.',
    source: 'PPAT, גאנט וטבון (Gantt & Tabone, FEATS Rating Manual), 1998',
    focus: ['courage', 'wisdom'],
  },
  {
    id: 'scribble',
    title: 'שרבוט',
    instruction: 'שרבט/י קו חופשי בעיניים חצי עצומות. אחר כך מצא/י בו צורה, והשלם/י אותה.',
    question: 'מה מסתתר בתוך התנועה?',
    lens: 'מקרי ומכוון: **מה נולד**, ו**מה בחרת לראות**.',
    source: 'טכניקת השרבוט, פלורנס קיין (Florence Cane, The Artist in Each of Us), 1951',
    focus: ['wisdom', 'transcendence'],
  },
  {
    id: 'shadow',
    title: 'אני והצל',
    instruction: 'צייר/י את עצמך, ואת הצל שהולך אחריך.',
    question: 'מה הולך אחריך?',
    lens: 'אור וצל: **מה גלוי**, ו**מה נגרר מאחור**.',
    source: 'הצל, קרל גוסטב יונג (C. G. Jung, Aion), 1951',
    focus: ['justice', 'humanity'],
  },
]

export const directiveById = (id: string) => DIRECTIVES.find((d) => d.id === id) ?? DIRECTIVES[0]
