import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

export default function AttendanceForm({ session, activityId, associationId, onCancel }) {
    const { t } = useTranslation();
    const [data, setData] = useState({ activityId, date: '', startTime: '', endTime: '', notes: '', ...session });
    const [members, setMembers] = useState([]);
    const [records, setRecords] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        let active = true;
        associago.activities.getParticipants(activityId).then(participants => {
            if (active) setMembers([...new Map(participants.filter(participant => participant.user).map(participant => [participant.user.id, participant.user])).values()]);
        }).catch(error => { if (active) setError(error.message); });
        return () => { active = false; };
    }, [activityId, associationId]);
    useEffect(() => {
        if (!data.id) return;
        let active = true;
        associago.attendance.records(data.id).then(value => { if (active) setRecords(value); })
            .catch(error => { if (active) setError(error.message); });
        return () => { active = false; };
    }, [data.id]);
    const save = async event => {
        event.preventDefault(); setBusy(true); setError(null); setSuccess(false);
        try {
            if (data.startTime && data.endTime && data.endTime <= data.startTime) throw new Error(t('attendanceUi.invalidTime'));
            const payload = { ...data, startTime: data.startTime || null, endTime: data.endTime || null, instructorId: data.instructorId || null };
            const saved = data.id ? await associago.attendance.updateSession(data.id, payload) : await associago.attendance.createSession(payload);
            setData({ ...saved, startTime: saved.startTime || '', endTime: saved.endTime || '', notes: saved.notes || '' }); setSuccess(true);
        } catch (error) { setError(error.message); } finally { setBusy(false); }
    };
    const recordAttendance = async (userId, status) => {
        if (!status) return;
        setBusy(true); setError(null); setSuccess(false);
        try {
            const current = records.find(record => record.userId === userId);
            const payload = { ...current, sessionId: data.id, userId, status };
            const saved = current ? await associago.attendance.updateRecord(current.id, payload) : await associago.attendance.createRecord(payload);
            setRecords(previous => [...previous.filter(record => record.userId !== userId), saved]); setSuccess(true);
        } catch (error) { setError(error.message); } finally { setBusy(false); }
    };
    const change = event => { setSuccess(false); setData({ ...data, [event.target.name]: event.target.value }); };
    return <Card><Card.Body>
        <h2 className="mb-4">{t(data.id ? 'attendanceUi.manage' : 'attendanceUi.newSession')}</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success" role="status">{t('attendanceUi.saved')}</Alert>}
        <Form onSubmit={save}><Row className="g-3">
            {['date', 'startTime', 'endTime'].map((name, index) => <Col md={4} key={name}><Form.Group controlId={`session-${name}`}>
                <Form.Label>{t(['Date', 'attendanceUi.start', 'attendanceUi.end'][index])}</Form.Label>
                <Form.Control type={index ? 'time' : 'date'} name={name} value={data[name]} onChange={change} required={!index} disabled={busy} />
            </Form.Group></Col>)}
            <Col xs={12}><Form.Group controlId="session-notes"><Form.Label>{t('Notes')}</Form.Label><Form.Control as="textarea" name="notes" value={data.notes} onChange={change} disabled={busy} /></Form.Group></Col>
        </Row><div className="d-flex gap-2 mt-3 mb-4"><Button type="submit" disabled={busy}>{t('Save')}</Button><Button variant="outline-secondary" onClick={onCancel}>{t('Back')}</Button></div></Form>
        {records.some(record => record.memberId) && <Alert variant="info">{t('attendanceUi.legacyRecords')}: {records.filter(record => record.memberId).map(record => `#${record.memberId} (${t(`attendanceUi.${record.status}`)})`).join(', ')}</Alert>}
        {data.id && <><h3 className="h5">{t('nav.attendance')}</h3><Table responsive><thead><tr><th>{t('Name')}</th><th>{t('Status')}</th></tr></thead>
            <tbody>{members.map(member => <tr key={member.id}><td>{member.firstName} {member.lastName}</td><td>
                <Form.Select aria-label={`${t('Status')}: ${member.firstName} ${member.lastName}`} value={records.find(record => record.userId === member.id)?.status || ''} disabled={busy} onChange={event => recordAttendance(member.id, event.target.value)}>
                    <option value="" disabled>{t('attendanceUi.unrecorded')}</option>
                    {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(status => <option key={status} value={status}>{t(`attendanceUi.${status}`)}</option>)}
                </Form.Select>
            </td></tr>)}{!members.length && <tr><td colSpan={2}>{t('attendanceUi.noParticipants')}</td></tr>}</tbody>
        </Table></>}
    </Card.Body></Card>;
}
