$(document).ready(() => {
  $('#add-chem').on('click', () => {
    console.log('chaia gostoso');

    const nameChem = $('input[name=chem-selected]').val();
    console.log(nameChem);
    const badgeHtml = `<span class="badge badge-dark chem-badge" onclick="removeMe(this)">
                        ${ nameChem  }
                        <input type="hidden" name="product[chem][]" value="${ nameChem }">
                      </span>`;
    $('#select-chem').append(badgeHtml);
  });
  // $("chem-badge").click((e) => {
  //   $(e.target).remove();
  //    console.log('xablau');
  // });

  // $("#select-chem").on("click", () => {
  //   console.log(nameChem);
  //   $("chem-badge").remove();
  // });
});

function removeMe(element) {
  $(element).remove();
}

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

$.get('../search/chems', (result) => {
  const chems = result;
  $('#chems-list .typeahead').typeahead(
    {
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'chems',
      source: substringMatcher(chems)
    }
  );
});
