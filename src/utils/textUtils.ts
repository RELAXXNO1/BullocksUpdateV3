export const applyKeywordStyling = (description: string) => {
  if (!description) return "";
  const KEYWORDS = ["diamonds", "relaxed", "euphoric", "happy", "mood-boosting", "focus", "creativity", "sleep", "3.5g", "7.0g", "14.0g", "28.0g", "1/8", "1/4", "1/2", "1", "ounce", "o.z.", "infused", "sativa", "indica", "hybrid", "on sale!", "new arrival"];
  const styledDescription = description.split(" ").map(word => {
    if (KEYWORDS.includes(word.toLowerCase())) {
      return `<span style="font-weight: bold; font-style: italic; color: teal; text-shadow: 0 0 5px rgb(14, 15, 4);">${word}</span>`;
    }
    return word;
  }).join(" ");
  return styledDescription;
};
