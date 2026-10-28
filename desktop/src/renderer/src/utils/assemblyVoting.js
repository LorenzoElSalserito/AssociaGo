// Mirrors AssemblyMotion.computeOutcome on the backend, which stays the source of truth.
export const computeOutcome = (votingType, favor, against, abstain) => {
    if (votingType === 'CONSULTATIVE') return 'NOTED';
    if (votingType === 'UNANIMITY') return against === 0 && favor > 0 ? 'APPROVED' : 'REJECTED';
    if (votingType === 'QUALIFIED') {
        const cast = favor + against + abstain;
        return cast > 0 && favor * 3 >= cast * 2 ? 'APPROVED' : 'REJECTED';
    }
    return favor > against ? 'APPROVED' : 'REJECTED';
};

export const translateVoteError = (t, message) =>
    /^[A-Z_]+$/.test(message || '')
        ? t(`assemblyVoting.errors.${message}`, { defaultValue: t('assemblyVoting.errors.generic') })
        : message || t('assemblyVoting.errors.generic');
