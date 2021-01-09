const findLongestWord = function(string) {
  let arr = string.split(" ");
  let indexWordMax;
  let lenWordMax = 0;
  let len = arr.length;
  for (let index = 0; index < len; index++) {
    if (arr[index].length > lenWordMax) {
      indexWordMax = index;
      lenWordMax = arr[index].length;
    }
  }

  return arr[indexWordMax];
};
/*
 * Вызовы функции для проверки работоспособности твоей реализации.
 */
console.log(findLongestWord("The quick brown fox jumped over the lazy dog")); // 'jumped'
console.log(findLongestWord("Google do a roll")); // 'Google'
console.log(findLongestWord("May the force be with you")); // 'force'
