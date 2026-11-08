/* B · Hospitality Editorial — the entrance room.
   One real photograph from the approved records (The Optimist, Atlanta; photography credited to
   Jared Swafford in records.js), linked to its project page. Shown only on the entrance route;
   the app changes routes in place, so the figure is added once and hidden elsewhere by CSS. */
(function () {
  function add() {
    if (document.querySelector('.cwb-room')) return;
    var fig = document.createElement('figure');
    fig.className = 'cwb-room';
    fig.innerHTML = '<a href="project-the-optimist.html" aria-label="The Optimist, Atlanta — view project">' +
      '<img src="assets/projects/the-optimist-1.jpg" alt="The Optimist, Atlanta" width="1920" height="2400" decoding="async" fetchpriority="high"></a>' +
      '<figcaption><b>The Optimist, Atlanta</b><span>Photography Jared Swafford</span></figcaption>';
    document.body.appendChild(fig);
  }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
