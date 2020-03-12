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

module.exports = {
  getDateFromMilliseconds,
  sortDates
};
