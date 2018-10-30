const substringMatcher = (strs) => {
  return function findMatches(q, cb) {
    var matches;
    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    const substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, (i, str) => {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

$.get('../search/products', (result) => {
  const products = result;
  $('#products-list .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'products',
    source: substringMatcher(products)
  });
});
