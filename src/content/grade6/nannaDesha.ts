import type { LessonInput } from "../schema";
import { exercise, glossaryExercises, ownSentence, pairs, sentences } from "../helpers";

// Source: teacher's notes "Nanna desha Nanna Jana - translation" and "Nanna Desha Nanna Jana - Answer" (3-page version).
const glossary = [
  { word: "ಒಕ್ಕಲು", meaningKn: "ಬೇಸಾಯ", meaningEn: "Farming / Agriculture", enPrompt: "Agriculture" },
  { word: "ನೆಲೆ", meaningKn: "ವಾಸಸ್ಥಳ, ಆಶ್ರಯ", meaningEn: "Residence / Shelter" },
  { word: "ಪ್ರಾಣ", meaningKn: "ಉಸಿರು", meaningEn: "Life / Breath", enPrompt: "Breath" },
  { word: "ವರ್ತಮಾನ", meaningKn: "ಇಂದಿನ, ಪ್ರಸ್ತುತ", meaningEn: "The present / Current" },
  { word: "ಭವಿಷ್ಯ", meaningKn: "ನಾಳಿನ, ಮುಂದಿನ", meaningEn: "Future" },
  { word: "ಋಣ", meaningKn: "ಸಾಲ, ಹಂಗು", meaningEn: "Debt" },
  { word: "ಕಳೆ", meaningKn: "ಕಾಂತಿ", meaningEn: "Brightness / Glow" },
  { word: "ಪ್ರಾಚೀನ", meaningKn: "ಹಿಂದಿನ", meaningEn: "Ancient" },
];

// Poem lines in order; also used for the "complete the poem" exercise.
export const nannaDeshaStanzas: [string, string][][] = [
  [
    ["ನನ್ನ ದೇಶ ನನ್ನ ಜನ", "My country, my people"],
    ["ನನ್ನ ಮಾನ ಪ್ರಾಣ ಘನ", "My honour, my life, my dignity"],
    ["ತೀರಿಸುವೆನೆ ಅದರ ಋಣ", "Shall I repay its debt"],
    ["ಒಂದೇ ಜನ್ಮದಿ?", "In this single birth?"],
  ],
  [
    ["ಕೆಂಪು ನೆಲದ ಹಸಿರು ಬೆಳೆ", "The green crops of the red soil"],
    ["ಕಪ್ಪು ಬಣ್ಣ ಮೊಗದ ಕಳೆ", "The glow on the face of the dark complexion"],
    ["ಸೂರ್ಯ ಚಂದ್ರ ಚುಕ್ಕಿಗಳೆ", "The sun, the moon, and the stars"],
    ["ನಮ್ಮ ಹಿರಿಯ ಒಕ್ಕಲು", "Are our ancient (ancestral) farmers"],
  ],
  [
    ["ನೂರು ಭಾವ ಭಾಷೆ ನೆಲೆ", "The abode of a hundred emotions and languages"],
    ["ನೂರು ಬಣ್ಣ ವೇಷ ಕಲೆ", "A hundred colours, costumes, and arts"],
    ["ಸ್ವಚ್ಛಂದದ ಹಕ್ಕಿಗಳೆ", "Like birds of absolute freedom"],
    ["ನಮ್ಮ ಹಾಡು ಬದುಕಲು", "Are our songs to live by"],
  ],
  [
    ["ಪ್ರಾಚೀನವ ತಿಕ್ಕಿ ತೊಳೆ", "Scrub and wash away the ancient"],
    ["ವರ್ತಮಾನ ಜೀವಕಳೆ", "The livelihood of the present"],
    ["ಉಕ್ಕೇರಲಿ ಬಾಳ ಹೊಳೆ", "Let the river of life overflow"],
    ["ಆ ಭವಿಷ್ಯದೊಡಲಿಗೆ", "Into the womb of that future"],
  ],
  [
    ["ಮೈ ಕೊಡವಿದೆ ಮೂಕ ಜನ", "The silent people have shaken their bodies"],
    ["ಕೈ ಹಿಡಿಯಿರಿ ನಾಕು ಚಣ", "Hold their hands for a few moments"],
    ["ಎದ್ದೇಳಲಿ ಎಲ್ಲ ಗುಣ", "Let all good virtues rise up"],
    ["ಆ ಸಮೃದ್ಧ ಬಾಳಿಗೆ", "For that prosperous life"],
  ],
];

export const nannaDesha: LessonInput = {
  id: "nanna-desha",
  number: 3,
  kind: "poem",
  title: { kn: "ನನ್ನ ದೇಶ ನನ್ನ ಜನ", en: "My Country, My People" },
  author: { kn: "ಚೆನ್ನವೀರ ಕಣವಿ", en: "Chennaveera Kanavi" },
  source: "teacher-notes",
  intro: sentences("i", [
    ["ನಾವೆಲ್ಲರೂ ಒಂದು ಕುಟುಂಬದಲ್ಲಿ ವಾಸಿಸುತ್ತೇವೆ.", "We all live in a family."],
    ["ಅವರನ್ನು ನನ್ನ ತಂದೆ, ನನ್ನ ತಾಯಿ, ನನ್ನ ಅಣ್ಣ, ನನ್ನ ಅಕ್ಕ ಎಂದು ಹೆಮ್ಮೆಯಿಂದ ಗುರುತಿಸುತ್ತೇವೆ.", "We proudly identify them as my father, my mother, my elder brother, and my elder sister."],
    ["ಇದೇ ಬಗೆಯ ಅಭಿಮಾನ ನಾವು ಹುಟ್ಟಿದ ದೇಶದ ಬಗ್ಗೆ ಇರಬೇಕು.", "We should have a similar kind of pride toward the country where we are born."],
    ["ನಾವೆಲ್ಲರೂ ಭಾರತೀಯರು. ಭಾರತ ಮಾತೆಯ ಮಕ್ಕಳು.", "We all are Indians. We are the children of Mother India."],
    ["ಭಾರತದಲ್ಲಿ ವಿವಿಧ ಧರ್ಮಗಳಿವೆ. ವಿವಿಧ ಭಾಷೆಗಳಿವೆ.", "There are diverse religions in India. There are diverse languages."],
    ["ವಿವಿಧ ಸಂಸ್ಕೃತಿಗಳಿವೆ. ಇತಿಹಾಸವಿದೆ.", "There are diverse cultures. There is history."],
    ["ಆದ ಕಾರಣ, ಪ್ರತಿಯೊಬ್ಬರಿಗೂ ತನ್ನ ದೇಶದ ಬಗ್ಗೆ ಅಭಿಮಾನ ಇರಬೇಕು.", "For this reason, everyone must possess pride for their country."],
    ["“ತಾಯಿ ಮತ್ತು ತಾಯಿನಾಡು ಸ್ವರ್ಗಕ್ಕಿಂತಲೂ ಮಿಗಿಲು” ಎಂದು ಸಂಸ್ಕೃತ ಸುಭಾಷಿತ ಹೇಳುತ್ತದೆ.", "A Sanskrit saying says, \"Mother and Motherland are greater than heaven itself.\""],
    ["ಕುವೆಂಪುರವರು “ದೇಶ ನನ್ನದು, ನಾಡು ನನ್ನದು ಎನ್ನದ ಎದೆ ಸುಡುಗಾಡು” ಎನ್ನುತ್ತಾರೆ.", "Kuvempu says, \"The heart that does not say 'the country is mine, the land is mine' is a cremation ground.\""],
    ["ಇಲ್ಲಿ ಕವಿ ಈ ದೇಶವನ್ನು ವರ್ಣಿಸಿ ದೇಶಭಕ್ತಿಯನ್ನು ಮೆರೆದಿದ್ದಾರೆ.", "Here, the poet has described this country and displayed patriotism."],
  ]),
  parts: nannaDeshaStanzas.map((stanza, i) => ({ sentences: sentences(`s${i + 1}.`, stanza) })),
  summaryEn: [
    "The poem celebrates patriotism and national unity: the country is an extension of our own family, and we must work to build a prosperous future.",
    "Patriotism & gratitude: the poet sees the country as his honour and life, and asks whether one birth is enough to repay his debt to the motherland.",
    "Unity in diversity: despite hundreds of languages, colours, costumes and cultures, all Indians live together like free birds.",
    "Connection to nature: the red soil, green crops and hardworking people, with the eternal sun, moon and stars.",
    "Progress & future: wash away outdated traditions, bring fresh life to the present, and let life flow into a bright future.",
    "Collective awakening: lift up the silent masses and work together for a prosperous society.",
  ],
  glossary,
  exercises: [
    ...glossaryExercises("nanna-desha", glossary),
    exercise("nanna-desha.q", "one_sentence", "comprehension", "ಕೆಳಗಿನ ಪ್ರಶ್ನೆಗಳಿಗೆ ಒಂದು ವಾಕ್ಯದಲ್ಲಿ ಉತ್ತರಿಸಿ.", "Answer the following questions in one sentence.", [
      {
        prompt: "ಕಣವಿಯವರು ತನ್ನ ದೇಶ ಮತ್ತು ಜನರನ್ನು ಏನೆಂದು ಭಾವಿಸಿದ್ದಾರೆ?",
        promptEn: "What does Kanavi consider his country and people to be?",
        model: { kn: "ಕಣವಿಯವರು ತನ್ನ ದೇಶ ಮತ್ತು ಜನರನ್ನು ಮಾನ, ಪ್ರಾಣ ಎಂದು ಭಾವಿಸಿದ್ದಾರೆ.", en: "Kanavi considers his country and people as his honour and life." },
        points: ["Says he considers them his honour (ಮಾನ)", "Says he considers them his life (ಪ್ರಾಣ)"],
      },
      {
        prompt: "ಕವಿ ಕಣವಿಯವರು 'ನನ್ನ ದೇಶ ನನ್ನ ಜನ' ಪದ್ಯದಲ್ಲಿ ಋಣದ ಬಗ್ಗೆ ಏನೆಂದು ಹೇಳಿದ್ದಾರೆ?",
        promptEn: "What does poet Kanavi say about debt in the poem?",
        model: { kn: "ಕವಿ ಕಣವಿಯವರು 'ನನ್ನ ದೇಶ ನನ್ನ ಜನ' ಪದ್ಯದಲ್ಲಿ ದೇಶದ ಋಣವನ್ನು ಈ ಒಂದೇ ಜನ್ಮದಲ್ಲಿ ತೀರಿಸುವೆ ಎಂದು ಹೇಳಿದ್ದಾರೆ.", en: "He says he will repay the country's debt in this single birth." },
        points: ["Says the poet will repay the country's debt in this one birth (ಒಂದೇ ಜನ್ಮದಲ್ಲಿ)"],
      },
      {
        prompt: "ಕಣವಿಯವರು ಈ ನೆಲದ ಮಣ್ಣು ಮತ್ತು ಬೆಳೆ ಯಾವ ಬಣ್ಣದಲ್ಲಿವೆ ಎಂದು ಹೇಳಿದ್ದಾರೆ?",
        promptEn: "In which colours did Kanavi say the soil and crop of this land are?",
        model: { kn: "ಕಣವಿಯವರು ಈ ನೆಲದ ಮಣ್ಣು ಕೆಂಪು, ಬೆಳೆ ಹಸಿರು ಬಣ್ಣದಲ್ಲಿವೆ ಎಂದು ಹೇಳಿದ್ದಾರೆ.", en: "The soil is red and the crop is green." },
        points: ["Soil is red (ಕೆಂಪು)", "Crop is green (ಹಸಿರು)"],
      },
      {
        prompt: "ನಮ್ಮ ಹಿರಿಯ ಒಕ್ಕಲು ಯಾವುದೆಂದು ಕಣವಿಯವರು ಹೇಳಿದ್ದಾರೆ?",
        promptEn: "Which did Kanavi say is our ancestral household?",
        model: { kn: "ನಮ್ಮ ಹಿರಿಯ ಒಕ್ಕಲು ಸೂರ್ಯ, ಚಂದ್ರ, ಚುಕ್ಕಿಗಳು ಎಂದು ಹೇಳಿದ್ದಾರೆ.", en: "He said our ancestors are the Sun, Moon and Stars." },
        points: ["Names the sun, moon and stars (ಸೂರ್ಯ, ಚಂದ್ರ, ಚುಕ್ಕಿಗಳು)"],
      },
      {
        prompt: "ಕವಿ ಕಣವಿಯವರು ಸ್ವಚ್ಛಂದದ ಹಕ್ಕಿಗಳು ಎಂದು ಯಾರನ್ನು ಕರೆದಿದ್ದಾರೆ?",
        promptEn: "Whom did the poet call 'birds of freedom'?",
        model: { kn: "ಕವಿ ಕಣವಿಯವರು ಸ್ವಚ್ಛಂದದ ಹಕ್ಕಿಗಳು ಎಂದು ಭಾರತೀಯರನ್ನು ಕರೆದಿದ್ದಾರೆ.", en: "The poet called Indians 'birds of freedom'." },
        points: ["Says Indians (ಭಾರತೀಯರು / our people)"],
      },
      {
        prompt: "'ನನ್ನ ದೇಶ ನನ್ನ ಜನ' ಪದ್ಯವನ್ನು ಬರೆದ ಕವಿ ಯಾರು?",
        promptEn: "Who wrote the poem 'Nanna Desha Nanna Jana'?",
        model: { kn: "'ನನ್ನ ದೇಶ ನನ್ನ ಜನ' ಪದ್ಯವನ್ನು ಬರೆದ ಕವಿ ಚೆನ್ನವೀರ ಕಣವಿ.", en: "The poet is Chennaveera Kanavi." },
        points: ["Names Chennaveera Kanavi (ಚೆನ್ನವೀರ ಕಣವಿ)"],
      },
    ]),
    exercise("nanna-desha.opp", "opposite", "grammar", "ಕೆಳಗಿನ ಪದಗಳಿಗೆ ವಿರುದ್ಧ ಪದ ಬರೆಯಿರಿ.", "Write the opposite words for the following.", pairs([
      ["ಮಾನ", "ಅಪಮಾನ"],
      ["ಹಿರಿಯ", "ಕಿರಿಯ"],
      ["ಪ್ರಾಚೀನ", "ನವೀನ"],
      ["ಏರು", "ಇಳಿ"],
    ])),
    exercise("nanna-desha.rhyme", "rhyme", "poem", "ಪದ್ಯದಲ್ಲಿರುವ ಪ್ರಾಸ ಪದ ಬರೆಯಿರಿ.", "Write the rhyming word from the poem.", pairs([
      ["ಜನ", "ಘನ"],
      ["ಬೆಳೆ", "ಕಳೆ"],
      ["ನೆಲೆ", "ಕಲೆ"],
      ["ಚಣ", "ಗುಣ"],
      ["ತೊಳೆ", "ಹೊಳೆ"],
      ["ಒಡಲಿಗೆ", "ಬಾಳಿಗೆ"],
    ])),
    exercise("nanna-desha.own", "own_sentence", "writing", "ಸ್ವಂತ ವಾಕ್ಯದಲ್ಲಿ ಬರೆಯಿರಿ.", "Write in your own sentences.", [
      ownSentence("ಋಣ", "debt", "ರಾಮನು ರವಿಯು ಮಾಡಿದ ಋಣವನ್ನು ತೀರಿಸಲಿಲ್ಲ.", "Rama did not repay the debt made by Ravi."),
      ownSentence("ಸ್ವಚ್ಛಂದ", "freely", "ಆಕಾಶದಲ್ಲಿ ಹಕ್ಕಿಗಳು ಸ್ವಚ್ಛಂದವಾಗಿ ಹಾರಾಡುತ್ತಿವೆ.", "Birds are flying freely in the sky."),
      ownSentence("ಜೀವಕಳೆ", "new life", "ಮಳೆಯಿಂದ ಗಿಡಗಳಿಗೆ ಜೀವಕಳೆ ಬಂದಿತು.", "Plants got a new life from the rain."),
    ]),
    exercise("nanna-desha.split", "split", "grammar", "ಬಿಡಿಸಿ ಬರೆಯಿರಿ.", "Split and write the words.", [
      { prompt: "ಉಕ್ಕೇರಲಿ", answers: ["ಉಕ್ಕು + ಏರಲಿ"] },
      { prompt: "ಭವಿಷ್ಯದೊಡಲಿಗೆ", answers: ["ಭವಿಷ್ಯದ + ಒಡಲಿಗೆ"] },
      { prompt: "ಎದ್ದೇಳಿ", answers: ["ಎದ್ದು + ಏಳಿ"] },
    ]),
    exercise("nanna-desha.poem", "poem_line", "poem", "ಪದ್ಯವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.", "Complete the poem.", [
      // Every line, stanza by stanza. Stanzas 2 and 3 come first so their ids (.1–.8) stay the same as in earlier versions.
      // The prompt is the line's first word.
      ...[1, 2, 0, 3, 4].flatMap((st) => nannaDeshaStanzas[st].map(([line]) => ({ prompt: line.split(" ")[0] + " …", answers: [line] }))),
    ]),
    exercise("nanna-desha.poet", "poet_name", "poem", "ಕವಿಯ ಹೆಸರನ್ನು ಬರೆಯಿರಿ.", "Write the name of the poet.", [
      { prompt: "ಕವಿಯ ಹೆಸರು", answers: ["ಚೆನ್ನವೀರ ಕಣವಿ", "ಕಣವಿ"], model: { kn: "ಚೆನ್ನವೀರ ಕಣವಿ", en: "Chennaveera Kanavi" } },
    ]),
  ],
};
