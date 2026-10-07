(function () {
  document.querySelectorAll('input[type="file"][data-preview]').forEach(function (input) {
    var img = document.getElementById(input.dataset.preview);
    if (!img) return;
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      img.src = URL.createObjectURL(file);
      img.style.display = 'block';
    });
  });

  document.querySelectorAll('input[data-preview-url-for]').forEach(function (input) {
    var img = document.getElementById(input.dataset.previewUrlFor);
    if (!img) return;
    input.addEventListener('input', function () {
      var val = input.value.trim();
      if (!val) {
        img.style.display = 'none';
        return;
      }
      img.src = val;
      img.style.display = 'block';
    });
  });

  var tiktokSearch = document.getElementById('tiktok-picker-search');
  var tiktokItems = document.querySelectorAll('.tiktok-picker-item');
  if (tiktokSearch && tiktokItems.length) {
    tiktokSearch.addEventListener('input', function () {
      var term = tiktokSearch.value.trim().toLowerCase();
      tiktokItems.forEach(function (item) {
        var match = !term || item.dataset.title.indexOf(term) !== -1;
        item.style.display = match ? 'flex' : 'none';
      });
    });
  }
})();
