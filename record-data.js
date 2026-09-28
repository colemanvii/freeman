/* Content only. Add a project key to enable record.html?project=<key>.
 * Dates stay blank until verified. The pilot's sequence is an AI placeholder,
 * NOT Barnsley photography. Remove imageRegion when replacing a study frame
 * with a normal photograph; no interface changes are required.
 */
const projectRecords = {
  'barnsley-gardens': {
    slug: 'barnsley-gardens',
    title: 'Barnsley Gardens',
    location: 'Adairsville, Georgia',
    type: 'Hospitality',
    status: 'Living Record · Pilot',
    statement: 'A record of work within an established resort.',
    sequenceNotice: 'Illustrative placeholder — not Barnsley Gardens. Dated field photographs pending.',
    moments: [
      {
        day: 'Study 01', date: '', label: 'Existing condition · Placeholder',
        note: 'First dated field photograph and factual note pending.',
        image: 'record-assets/window-sequence.png', imageRegion: 'top-left',
        alt: 'AI placeholder: exposed arched opening with temporary timber bracing.'
      },
      {
        day: 'Study 02', date: '', label: 'Work in progress · Placeholder',
        note: 'Next dated field photograph and factual note pending.',
        image: 'record-assets/window-sequence.png', imageRegion: 'top-right',
        alt: 'AI placeholder: timber window frame within an exposed brick reveal.'
      },
      {
        day: 'Study 03', date: '', label: 'Closing up · Placeholder',
        note: 'Photograph before concealment and factual note pending.',
        image: 'record-assets/window-sequence.png', imageRegion: 'bottom-left',
        alt: 'AI placeholder: plastered window reveal with protection still in place.'
      }
    ],
    finished: {
      day: 'Finished', date: '', label: 'Finished result · Placeholder',
      image: 'record-assets/window-sequence.png', imageRegion: 'bottom-right',
      alt: 'AI placeholder: completed timber radius window and plaster reveal.',
      note: 'Finished photograph from the same viewpoint pending.'
    },
    references: [],
    decisions: [],
    fieldNotes: [],
    resolutions: [],
    finishedArtifacts: [
      {
        title: 'From the existing project archive',
        image: 'https://cdn.prod.website-files.com/666b9585b7fd3bd24dfbba73/6916c7910f0d654dd4daa28f_Barnsley%20Gardens_Freeman%20General%20Contractors%201.jpg',
        alt: 'Barnsley Gardens resort and pool from Freeman’s existing portfolio.',
        note: 'Existing Barnsley Gardens photography. Not a matched view of the illustrative sequence above.',
        credit: 'Photography: Jared Swafford · Interior design: Chuck Marie Studio'
      }
    ],
    returns: []
  }
};
