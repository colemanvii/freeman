/* C · Field Register — sheet frame and title block for every page except the map (which
   already draws its own). The app changes routes in place, so the block follows body[data-route].
   Project register numbers come from window.RECORDS (the same ids the map's register shows). */
(function () {
  if (document.querySelector('.border .ref')) return; // map.html: native sheet
  function sheet() {
    var s = document.createElement('div');
    s.className = 'cwc-sheet';
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<div class="cwc-ref top">' + 'ABCDEFGH'.split('').map(function (c) { return '<span>' + c + '</span>'; }).join('') +
      '</div><div class="cwc-ref left">' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<span>' + n + '</span>'; }).join('') + '</div>';
    document.body.appendChild(s);
    var b = document.createElement('div');
    b.className = 'cwc-block';
    b.setAttribute('aria-hidden', 'true');
    document.body.appendChild(b);
    return b;
  }
  function item() {
    var f = location.pathname.split('/').pop().replace(/\.html$/, '');
    var P = (window.RECORDS && window.RECORDS.projects) || [];
    for (var i = 0; i < P.length; i++) if ('project-' + P[i].slug === f) return P[i];
    return null;
  }
  var block;
  function update() {
    if (!block) block = sheet();
    var r = document.body.dataset.route || 'entrance', it = r === 'project' ? item() : null;
    var name = { company: 'Company', contact: 'Contact', project: 'Projects' }[r] || '';
    block.innerHTML = '<div><span>Freeman General Contracting</span><b>Cartersville, Georgia</b></div>' +
      '<div><span>Sheet</span><b class="is-red">' + name + '</b></div>' +
      '<div><span>' + (it ? 'Register ' + it.id : 'Built for') + '</span><b>' + (it ? it.location : 'Generations') + '</b></div>';
    if (it) {
      var info = document.querySelector('.pg-info');
      if (info && !info.querySelector('.cwc-no')) {
        var n = document.createElement('span');
        n.className = 'cwc-no';
        n.setAttribute('aria-hidden', 'true');
        n.textContent = it.id;
        info.insertBefore(n, info.firstChild);
      }
    }
  }
  function start() {
    update();
    new MutationObserver(update).observe(document.body, { attributes: true, attributeFilter: ['data-route'] });
    var main = document.getElementById('main');
    if (main) new MutationObserver(function () { if (document.body.dataset.route === 'project') update(); }).observe(main, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
