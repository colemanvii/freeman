/* Invented demonstration content. Never interpret as Freeman operations. */
export const SAMPLE_PROJECT={
 id:'demo-alder-001',name:'ALDER / DEMONSTRATION',phase:'preconstruction',status:'Design coordination',
 memberships:[
  {userId:'demo-team',organizationId:'demo-freeman',role:'team'},
  {userId:'demo-client',organizationId:'demo-owner',role:'client'},
  {userId:'demo-architect',organizationId:'demo-studio',role:'architect'},
  {userId:'demo-trade',organizationId:'demo-sub',role:'trade'}
 ],
 milestones:[{id:'ms-01',title:'Design review',date:'2026-11-12',visibleTo:['team','client','architect']},{id:'ms-02',title:'Trade site walk',date:'2026-11-18',visibleTo:['team','architect','trade']}],
 decisions:[{id:'dec-01',title:'Approve proposed finish',status:'awaiting-review',visibleTo:['team','client','architect']},{id:'dec-02',title:'Resolve fabrication detail',status:'open',visibleTo:['team','architect','trade']}],
 documents:[{id:'doc-01',title:'Current drawing register',source:'DEMO',version:'A',visibleTo:['team','architect','trade']},{id:'doc-02',title:'Internal estimate worksheet',source:'DEMO',version:'1',visibleTo:['team']}],
 fieldUpdates:[{id:'field-01',title:'Site walk notes',createdAt:'2026-10-16',visibleTo:['team','client','architect']}],
 proposals:[{id:'prop-01',title:'Alder / Study 05',state:'draft',visibleTo:['team','client']}],
 commitments:[{id:'commit-01',title:'Price finish alternate',owner:'Demo PM',visibleTo:['team','trade']},{id:'commit-02',title:'Review project scope',owner:'Demo Owner',visibleTo:['team','client']}]
};
