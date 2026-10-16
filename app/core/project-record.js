/* Freeman HQ / project record contract — fictional demonstration only.
   Pure ESM, no browser globals or external integrations.
   Visibility is an application rendering rule, NOT an authorization boundary.
   Production endpoints must independently authenticate and authorize every request. */
export const ROLES=Object.freeze(['team','client','architect','trade']);
export const VISIBILITY=Object.freeze(['team','client','architect','trade']);
export const PROJECT_STATES=Object.freeze(['preconstruction','active','closeout','complete']);
export function validateProject(project){
 const errors=[];
 if(!project||typeof project!=='object'||Array.isArray(project))return ['project must be an object'];
 for(const field of ['id','name','phase','status'])if(typeof project[field]!=='string'||!project[field].trim())errors.push(field+' is required');
 if(!PROJECT_STATES.includes(project.phase))errors.push('invalid phase');
 if(!Array.isArray(project.memberships))errors.push('memberships must be an array');
 for(const collection of ['milestones','decisions','documents','fieldUpdates','proposals','commitments']){
  if(!Array.isArray(project[collection])){errors.push(collection+' must be an array');continue}
  for(const item of project[collection]){
   if(typeof item.id!=='string'||!item.id)errors.push(collection+' item missing id');
   if(!Array.isArray(item.visibleTo)||!item.visibleTo.length||item.visibleTo.some(r=>!VISIBILITY.includes(r)))errors.push(collection+' item invalid visibleTo');
  }
 }
 return errors;
}
export function projectView(project,role){
 if(!ROLES.includes(role))throw Error('Unknown role');
 const errors=validateProject(project);if(errors.length)throw Error(errors.join('; '));
 const visible=item=>item.visibleTo.includes(role);
 const collections=['milestones','decisions','documents','fieldUpdates','proposals','commitments'];
 const view={id:project.id,name:project.name,phase:project.phase,status:project.status};
 for(const name of collections)view[name]=project[name].filter(visible).map(item=>({...item}));
 return view;
}
