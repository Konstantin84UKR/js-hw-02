const logins = ['Mango', 'robotGoogles', 'Poly', 'Aj4x1sBozz', 'qwerty123'];
const isLoginValid = function (login) {
  let len = login.length
  if (len < 4 || len > 16) {
    return false;
  } else {
    return true;
  }

};

const isLoginUnique = function (allLogins, login) {

  for (const iterator of allLogins) {
    if (iterator === login) {
      return false;
    }
  }

  return true;

};

const addLogin = function (allLogins, login) {

  let valid = isLoginValid(login);

  if (!valid) {
    return 'Ошибка! Логин должен быть от 4 до 16 символов';
  }

  let unique = isLoginUnique(allLogins, login);
  if (!unique) {
    return 'Такой логин уже используется!';
  }

  allLogins.push(login);

  return 'Логин успешно добавлен!';

};
/*
 * Вызовы функции для проверки работоспособности твоей реализации.
 */
console.log(addLogin(logins, 'Ajax')); // 'Логин успешно добавлен!'
console.log(addLogin(logins, 'robotGoogles')); // 'Такой логин уже используется!'
console.log(addLogin(logins, 'Zod')); // 'Ошибка! Логин должен быть от 4 до 16 символов'
console.log(addLogin(logins, 'jqueryisextremelyfast')); // 'Ошибка! Логин должен быть от 4 до 16 символов'