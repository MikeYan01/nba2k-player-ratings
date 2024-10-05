/**
 * Remove the '-' and make first word letter to upper case.
 */
export function teamNamePrettier(name) {
  if (!name.includes("-")) {
    return name;
  }

  var result = "";
  let words = name.split("-");
  words.forEach((word) => {
    let newWord = word.charAt(0).toUpperCase() + word.slice(1);
    result = result.concat(" ", newWord);
  });

  return result.trim();
}
