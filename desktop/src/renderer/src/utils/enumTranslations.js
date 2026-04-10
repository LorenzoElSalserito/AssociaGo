/**
 * Centralized enum/status translation helpers.
 * Each function takes a raw backend value and a t() function from react-i18next,
 * returning the localized string.
 */

const enumMap = (map, t) => (value) => {
  const key = map[value] || map[value?.toLowerCase?.()]
  return key ? t(key) : value || ''
}

export const translateLocationType = (value, t) =>
  enumMap({
    legal: 'enum.locationType.legal',
    operational: 'enum.locationType.operational',
    project: 'enum.locationType.project'
  }, t)(value)

export const translateDocumentType = (value, t) =>
  enumMap({
    statute: 'enum.documentType.statute',
    regulation: 'enum.documentType.regulation',
    attachment: 'enum.documentType.attachment'
  }, t)(value)

export const translateDeadlineCategory = (value, t) =>
  enumMap({
    fiscal: 'enum.deadlineCategory.fiscal',
    legal: 'enum.deadlineCategory.legal',
    governance: 'enum.deadlineCategory.governance',
    insurance: 'enum.deadlineCategory.insurance',
    other: 'enum.deadlineCategory.other'
  }, t)(value)

export const translateDeadlineStatus = (value, t) =>
  enumMap({
    pending: 'enum.deadlineStatus.pending',
    completed: 'enum.deadlineStatus.completed',
    overdue: 'enum.deadlineStatus.overdue'
  }, t)(value)

export const translateActivityCategory = (value, t) =>
  enumMap({
    COURSE: 'enum.activityCategory.course',
    WORKSHOP: 'enum.activityCategory.workshop',
    SEMINAR: 'enum.activityCategory.seminar',
    OTHER: 'enum.activityCategory.other',
    course: 'enum.activityCategory.course',
    workshop: 'enum.activityCategory.workshop',
    seminar: 'enum.activityCategory.seminar',
    other: 'enum.activityCategory.other'
  }, t)(value)

export const translateCompensationType = (value, t) =>
  enumMap({
    HOURLY: 'enum.compensationType.hourly',
    FLAT_RATE: 'enum.compensationType.flatRate',
    VOLUNTEER: 'enum.compensationType.volunteer',
    hourly: 'enum.compensationType.hourly',
    flat_rate: 'enum.compensationType.flatRate',
    volunteer: 'enum.compensationType.volunteer'
  }, t)(value)

export const translateCostCategory = (value, t) =>
  enumMap({
    EQUIPMENT: 'enum.costCategory.equipment',
    VENUE: 'enum.costCategory.venue',
    INSTRUCTOR: 'enum.costCategory.instructor',
    MARKETING: 'enum.costCategory.marketing',
    MATERIALS: 'enum.costCategory.materials',
    STAFF: 'enum.costCategory.staff',
    OTHER: 'enum.costCategory.other',
    equipment: 'enum.costCategory.equipment',
    venue: 'enum.costCategory.venue',
    instructor: 'enum.costCategory.instructor',
    marketing: 'enum.costCategory.marketing',
    materials: 'enum.costCategory.materials',
    staff: 'enum.costCategory.staff',
    other: 'enum.costCategory.other'
  }, t)(value)

export const translateCertificateType = (value, t) =>
  enumMap({
    PARTICIPATION: 'enum.certificateType.participation',
    ATTENDANCE: 'enum.certificateType.attendance',
    TRAINING: 'enum.certificateType.training',
    MEMBERSHIP: 'enum.certificateType.membership',
    COMPLETION: 'enum.certificateType.completion',
    VOLUNTEER_HOURS: 'enum.certificateType.volunteerHours'
  }, t)(value)

export const translateEventType = (value, t) =>
  enumMap({
    WORKSHOP: 'enum.eventType.workshop',
    SEMINAR: 'enum.eventType.seminar',
    MEETING: 'enum.eventType.meeting',
    PARTY: 'enum.eventType.party',
    FUNDRAISER: 'enum.eventType.fundraiser',
    OTHER: 'enum.eventType.other',
    workshop: 'enum.eventType.workshop',
    seminar: 'enum.eventType.seminar',
    meeting: 'enum.eventType.meeting',
    party: 'enum.eventType.party',
    fundraiser: 'enum.eventType.fundraiser',
    other: 'enum.eventType.other'
  }, t)(value)

export const translateParticipantStatus = (value, t) =>
  enumMap({
    REGISTERED: 'enum.participantStatus.registered',
    CHECKED_IN: 'enum.participantStatus.checkedIn',
    CANCELLED: 'enum.participantStatus.cancelled',
    WAITLISTED: 'enum.participantStatus.waitlisted'
  }, t)(value)

export const translatePaymentStatus = (value, t) =>
  enumMap({
    PAID: 'enum.paymentStatus.paid',
    PENDING: 'enum.paymentStatus.pending',
    REFUNDED: 'enum.paymentStatus.refunded',
    WAIVED: 'enum.paymentStatus.waived'
  }, t)(value)

export const translateBudgetStatus = (value, t) =>
  enumMap({
    DRAFT: 'enum.budgetStatus.draft',
    APPROVED: 'enum.budgetStatus.approved',
    ACTIVE: 'enum.budgetStatus.active',
    CLOSED: 'enum.budgetStatus.closed'
  }, t)(value)

export const translateBalanceStatus = (value, t) =>
  enumMap({
    DRAFT: 'enum.balanceStatus.draft',
    GENERATED: 'enum.balanceStatus.generated',
    APPROVED: 'enum.balanceStatus.approved',
    SIGNED: 'enum.balanceStatus.signed',
    ARCHIVED: 'enum.balanceStatus.archived'
  }, t)(value)

export const translateBudgetSection = (value, t) =>
  enumMap({
    INCOME: 'enum.budgetSection.income',
    EXPENSE: 'enum.budgetSection.expense'
  }, t)(value)
