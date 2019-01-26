let chemsAdded = [];
let chems = [];
$(document).ready(() => {
  $('#add-chem').on('click', () => {
    const nameChem = $('input[name=chem-selected]').val();
    var index = chemsAdded.indexOf(nameChem);
    var indexValid = chems.indexOf(nameChem);

    if ((index == -1)&&(indexValid > -1)) {
      const badgeHtml = `<span class="badge badge-success chem-badge" onclick="removeMe(this)">
                          ${ nameChem  } <i class="fas fa-times float-right"></i>
                          <input type="hidden" name="chem[]" value="${ nameChem }">
                        </span>`;
      $('#select-chem').append(badgeHtml);
      chemsAdded.push(nameChem);
    }
  });
});

function removeMe(element) {
  $(element).remove();
  const nameChem = $(element).find('input').val();
  var index = chemsAdded.indexOf(nameChem);
  if (index > -1) {
    chemsAdded.splice(index, 1);
  }
}

const substringChem = (strs) => {
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
  chems = result;
  $('#chems-list .typeahead').typeahead(
    {
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'chems',
      source: substringChem(chems),
      templates: {
        empty: [
          '<div class="empty-search">',
          '<small>Ops! Não encontramos resultados para essa busca.</small>',
          '</div>'
        ].join('\n')
      }
    }
  );
});
