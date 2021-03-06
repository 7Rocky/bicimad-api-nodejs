const getDateFromMilliseconds = ms => {
  const date = new Date(ms);
  const day = padWithZero(date.getDate());
  const month = padWithZero(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const padWithZero = number => `${number < 10 ? `0${number}` : number}`;

const sortDates = dates => {
  return [... new Set(dates)]
    .map(item => {
      const numbers = item.split('/');
      return new Date(numbers[2], numbers[1] - 1, numbers[0]).getTime();
    })
    .sort((a, b) => a - b);
};

const verifyDate = date => {
  if (!date || !date.match(/^((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/[12]\d{3})$/)) {
    return false;
  }

  const firstCheck = date.startsWith('31/04') || date.startsWith('31/06') ||
    date.startsWith('31/09') || date.startsWith('31/11') ||
    date.startsWith('31/02') || date.startsWith('30/02');

  if (firstCheck) {
    return false;
  }

  if (date.startsWith('29/02') && date.substring(8, 10) % 4 !== 0) {
    return false;
  }

  return true;
};

module.exports = {
  getDateFromMilliseconds,
  sortDates,
  verifyDate
};
