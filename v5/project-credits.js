/* Freeman project credits — the one place partner names, roles and links live.
   Read by the Projects map (record-assets/record.js) and the project pages (app.js).

   Rules
   - A credit appears only when Freeman published it (v5-source/content.json, "credits"). Nothing is inferred.
   - The role says what the partner is to the project. Freeman published most owners and operators as
     "Client"; the more specific role is used only where the partner's own site (or a cited report) says so.
     Otherwise the role stays "client".
   - `url` only when the partner's own site was loaded and confirmed to be that firm (checked below).
     No url: the name is shown without a link. Never guess a domain; several lookalikes belong to other firms
     (wrightgardner.com, noarchitecture.com, ipcpain.com, gentleworks.com, southdowntown.com).

   To add a credit: add the partner once under `partners`, then reference it under the project's slug.
   Roles render in the order of `roles`. */
window.FREEMAN_CREDITS = {
  checked: '2026-10-26',
  roles: [
    ['developer', 'Developer'],
    ['owner', 'Ownership group'],
    ['operator', 'Hospitality operator'],
    ['client', 'Client'],
    ['architect', 'Architect'],
    ['interiors', 'Interior design'],
    ['collaborator', 'Collaborator', 'Collaborators'],
    ['photography', 'Photography']
  ],
  partners: {
    'rocket-farm': { name: 'Rocket Farm Restaurants', url: 'https://www.rocketfarmrestaurants.com/', kind: 'Restaurant group', source: 'Own site; footer of beetlecatatl.com' },
    'south-street': { name: 'South Street Partners', url: 'https://southstreetpartners.com/', kind: 'Real estate investment firm', source: 'Own site; Business Wire, Nov 2024: "Barnsley Resort is owned by South Street Partners"' },
    'indigo-road': { name: 'The Indigo Road Hospitality Group', url: 'https://www.theindigoroad.com/', kind: 'Hospitality group', source: 'Own site; O-Ku Atlanta site footer' },
    'electric-hospitality': { name: 'Electric Hospitality', url: 'https://www.electric-hospitality.com/', kind: 'Hospitality group', source: 'Own site lists Muchacho' },
    'south-downtown': { name: 'South Downtown', url: 'https://www.southdowntownatl.com/', kind: 'District developer (SoDo Atlanta, LLC)', source: 'Own site; directory lists Brewhouse Cafe and Broad Street BBQ' },
    'savi-provisions': { name: 'Savi Provisions', url: 'https://www.saviprovisions.com/', kind: 'Neighborhood market', source: 'Own site' },
    'bocado-pizza': { name: 'Bocado Pizza', url: 'https://bocadopizza.com/', kind: 'Restaurant', source: 'Own site' },
    'ipc': { name: 'Interventional Pain Consultants', url: 'https://www.ipc-pain.com/', kind: 'Pain management practice', source: 'Own site; IPC Dalton ASC, 1502 Dug Gap Rd' },
    'chuck-marie': { name: 'Chuck Marie Studio', url: 'https://www.chuckmariestudio.com/', kind: 'Interior design studio', source: 'Own site credits the Optimist Oyster Bar (2024)' },
    // Freeman published this firm as both "David Thompson Architecture" and "David Thompson Studio"; it is one
    // practice, which names itself David Thompson Studio (its Woodlands page lists Freeman as a collaborator).
    'david-thompson': { name: 'David Thompson Studio', url: 'https://dthompsonarchitect.com/', kind: 'Architecture and interior design', source: 'Own site, works/woodlands-at-barnsley-resort' },
    'blur-workshop': { name: 'BLUR Workshop', url: 'https://www.blurworkshop.com/', kind: 'Design firm', source: 'Own site lists Muchacho for Electric Hospitality' },
    'gentle-works': { name: 'Gentle Works', url: 'https://gentle.works/', kind: 'Architecture and design studio, Atlanta', source: 'Own site' },
    'no-architecture': { name: 'NO Architecture', url: 'https://www.no-arch.com/', kind: 'Architecture firm, Atlanta', source: 'Own site; Urbanize Atlanta credits Mule Train to NO Architecture' },
    // No site found for this name (wrightgardner.com is an unrelated insurance agency). Shown without a link.
    'wright-gardner': { name: 'Wright Gardner Architects' },
    // No verified professional site; shown without a link until Freeman supplies one.
    'jared-swafford': { name: 'Jared Swafford' },
    'freeman': { name: 'Freeman GC' }
  },
  projects: {
    'beetlecat': [
      { role: 'operator', partner: 'rocket-farm' },
      { role: 'photography', partner: 'jared-swafford' }
    ],
    'the-optimist': [
      { role: 'operator', partner: 'rocket-farm' },
      { role: 'interiors', partner: 'chuck-marie' },
      { role: 'photography', partner: 'jared-swafford' }
    ],
    'barnsley-gardens': [
      { role: 'owner', partner: 'south-street' },
      { role: 'photography', partner: 'jared-swafford' }
    ],
    'woodlands-at-barnsley-resort': [
      { role: 'owner', partner: 'south-street' },
      { role: 'interiors', partner: 'david-thompson' }
    ],
    'dugans-pub': [
      { role: 'owner', partner: 'south-street' },
      { role: 'interiors', partner: 'david-thompson' }
    ],
    'o-ku-atlanta': [
      { role: 'operator', partner: 'indigo-road' },
      { role: 'interiors', partner: 'david-thompson' },
      { role: 'photography', partner: 'freeman' }
    ],
    'muchacho-decatur': [
      { role: 'operator', partner: 'electric-hospitality' },
      { role: 'interiors', partner: 'blur-workshop' }
    ],
    'brewhouse-cafe': [
      { role: 'developer', partner: 'south-downtown' },
      { role: 'interiors', partner: 'gentle-works' }
    ],
    'mule-train-atlanta': [
      { role: 'developer', partner: 'south-downtown' },
      { role: 'interiors', partner: 'no-architecture' }
    ],
    'broad-street-bbq': [
      { role: 'developer', partner: 'south-downtown' },
      { role: 'architect', partner: 'wright-gardner' }
    ],
    'azalea-marketplace': [
      { role: 'client', partner: 'savi-provisions' }
    ],
    'savi-provisions': [
      { role: 'client', partner: 'savi-provisions' }
    ],
    'bocado-pizza': [
      { role: 'client', partner: 'bocado-pizza' },
      { role: 'photography', partner: 'freeman' }
    ],
    'dalton-surgery-center': [
      { role: 'client', partner: 'ipc' },
      { role: 'photography', partner: 'freeman' }
    ],
    'la-cresta-on-main': []
  }
};
