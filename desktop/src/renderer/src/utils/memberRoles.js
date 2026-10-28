// Member types/offices, stored as CSV in UserAssociation.role (e.g. "FOUNDER,TREASURER").
export const MEMBER_ROLES = [
  { value: 'MEMBER', labelKey: 'memberForm.roles.MEMBER' },
  { value: 'FOUNDER', labelKey: 'memberForm.roles.FOUNDER' },
  { value: 'HONORARY', labelKey: 'memberForm.roles.HONORARY' },
  { value: 'PRESIDENT', labelKey: 'memberForm.roles.PRESIDENT' },
  { value: 'VICE_PRESIDENT', labelKey: 'memberForm.roles.VICE_PRESIDENT' },
  { value: 'SECRETARY', labelKey: 'memberForm.roles.SECRETARY' },
  { value: 'TREASURER', labelKey: 'memberForm.roles.TREASURER' },
  { value: 'COUNCILLOR', labelKey: 'memberForm.roles.COUNCILLOR' },
];

const LABEL_KEY_BY_VALUE = Object.fromEntries(MEMBER_ROLES.map(r => [r.value, r.labelKey]));

export const formatRoles = (roleCsv, t) => {
  if (!roleCsv) return '-';
  return String(roleCsv)
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((code) => (LABEL_KEY_BY_VALUE[code] ? t(LABEL_KEY_BY_VALUE[code]) : code))
    .join(', ');
};
