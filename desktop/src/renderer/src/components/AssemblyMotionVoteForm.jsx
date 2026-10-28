import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import { computeOutcome, translateVoteError } from '../utils/assemblyVoting';

const OUTCOME_TONES = { APPROVED: 'success', REJECTED: 'danger', NOTED: 'info', PENDING: 'secondary' };

export const OutcomeBadge = ({ outcome }) => {
    const { t } = useTranslation();
    const value = OUTCOME_TONES[outcome] ? outcome : 'PENDING';
    const tone = OUTCOME_TONES[value];
    return (
        <span className={`badge rounded-pill fw-semibold bg-${tone}-subtle text-${tone}-emphasis border border-${tone}-subtle`}>
            {t(`assemblyVoting.outcome.${value}`)}
        </span>
    );
};

const FIELDS = [
    { name: 'votesInFavor', label: 'assemblyVoting.favor' },
    { name: 'votesAgainst', label: 'assemblyVoting.against' },
    { name: 'votesAbstain', label: 'assemblyVoting.abstain' }
];

const AssemblyMotionVoteForm = ({ motion, voters, onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const recorded = motion.outcome && motion.outcome !== 'PENDING';
    const [values, setValues] = useState(() => Object.fromEntries(
        FIELDS.map(f => [f.name, recorded ? String(motion[f.name] ?? 0) : ''])
    ));
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState(null);

    const counts = Object.fromEntries(FIELDS.map(f => [f.name, values[f.name] === '' ? 0 : Number(values[f.name])]));
    const invalidField = FIELDS.some(f => !Number.isInteger(counts[f.name]) || counts[f.name] < 0);
    const total = counts.votesInFavor + counts.votesAgainst + counts.votesAbstain;
    const empty = FIELDS.every(f => values[f.name] === '');

    let error = null;
    if (voters === 0) error = 'MOTION_NO_VOTERS';
    else if (invalidField) error = 'MOTION_VOTES_NEGATIVE';
    else if (total > voters) error = 'MOTION_VOTES_EXCEED_VOTERS';

    const outcome = error || empty ? 'PENDING' : computeOutcome(motion.votingType || 'SIMPLE', counts.votesInFavor, counts.votesAgainst, counts.votesAbstain);

    const change = (name, value) => {
        setServerError(null);
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const run = async (action) => {
        setSubmitting(true);
        setServerError(null);
        try {
            await action();
            onSuccess();
        } catch (err) {
            setServerError(translateVoteError(t, err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (error) return;
        run(() => associago.assemblies.recordMotionVotes(motion.id, counts));
    };

    return (
        <form onSubmit={onSubmit} className="p-2" noValidate>
            <p className="fw-semibold mb-1">{motion.title}</p>
            <p className="text-muted small mb-3">
                {t('assemblyVoting.voters', { count: voters })} · {t(`assemblyVoting.rule.${motion.votingType || 'SIMPLE'}`)}
            </p>

            <div className="row g-3 mb-3">
                {FIELDS.map(f => (
                    <div className="col-sm-4" key={f.name}>
                        <label className="form-label" htmlFor={`vote-${f.name}`}>{t(f.label)}</label>
                        <input
                            id={`vote-${f.name}`}
                            name={f.name}
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            className={`form-control ${error && error !== 'MOTION_NO_VOTERS' ? 'is-invalid' : ''}`}
                            value={values[f.name]}
                            placeholder="0"
                            aria-describedby="vote-feedback"
                            onChange={e => change(f.name, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            <div id="vote-feedback" className="d-flex flex-wrap align-items-center gap-2 p-3 rounded border bg-body-tertiary mb-3" aria-live="polite">
                <span className="text-muted small">{t('assemblyVoting.cast', { total, voters })}</span>
                <span className="ms-auto small text-muted">{t('assemblyVoting.preview')}</span>
                <OutcomeBadge outcome={outcome} />
            </div>

            {(error || serverError) && (
                <div className="text-danger small mb-3" role="alert">
                    {serverError || translateVoteError(t, error)}
                </div>
            )}

            <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                {recorded && (
                    <button type="button" className="btn btn-outline-danger me-auto" disabled={submitting}
                        onClick={() => run(() => associago.assemblies.clearMotionVotes(motion.id))}>
                        {t('assemblyVoting.clear')}
                    </button>
                )}
                <button type="button" onClick={onCancel} className="btn btn-secondary">{t('Cancel')}</button>
                <button type="submit" disabled={submitting || !!error || empty} className="btn btn-primary">
                    {submitting ? t('Saving...') : t('assemblyVoting.save')}
                </button>
            </div>
        </form>
    );
};

export default AssemblyMotionVoteForm;
