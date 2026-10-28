import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Table, Spinner } from 'react-bootstrap';
import { Plus, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import AttendanceForm from './AttendanceForm';

export default function AttendanceList({ associationId }) {
    const { t } = useTranslation();
    const [activities, setActivities] = useState([]);
    const [activityId, setActivityId] = useState('');
    const [sessions, setSessions] = useState([]);
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        let active = true;
        associago.activities.getAll(associationId).then(data => {
            if (active) { setActivities(data); setActivityId(String(data[0]?.id || '')); }
        }).catch(error => { if (active) setError(error.message); });
        return () => { active = false; };
    }, [associationId]);
    useEffect(() => {
        let active = true;
        setSessions([]);
        if (!activityId) return;
        setLoading(true);
        associago.attendance.sessions(activityId).then(data => { if (active) setSessions(data); })
            .catch(error => { if (active) setError(error.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [activityId, editing]);
    const remove = async id => {
        if (!window.confirm(t('attendanceUi.confirmDelete'))) return;
        try { await associago.attendance.deleteSession(id); setSessions(current => current.filter(item => item.id !== id)); }
        catch (error) { setError(error.message); }
    };
    if (editing) return <>
        <Button variant="link" className="mb-3 p-0" onClick={() => setEditing(null)}><ArrowLeft size={16} /> {t('Back')}</Button>
        <AttendanceForm session={editing} activityId={Number(activityId)} associationId={associationId} onCancel={() => setEditing(null)} />
    </>;
    return <div className="fade-in">
        <div className="ag-page-heading"><div><h2>{t('nav.attendance')}</h2><p className="text-muted mb-0">{t('attendanceUi.description')}</p></div>
            <Button disabled={!activityId} onClick={() => setEditing({})}><Plus size={18} /> {t('attendanceUi.newSession')}</Button></div>
        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
        <Card><Card.Body>
            <Form.Group controlId="attendance-activity" className="mb-4"><Form.Label>{t('Activity')}</Form.Label>
                <Form.Select value={activityId} onChange={event => { setActivityId(event.target.value); setError(null); }}>
                    {!activities.length && <option value="">{t('No activities found.')}</option>}
                    {activities.map(item => <option key={item.id} value={item.id}>{item.name || item.title}</option>)}
                </Form.Select>
            </Form.Group>
            {loading ? <Spinner animation="border" role="status" /> : <Table responsive hover>
                <thead><tr><th>{t('Date')}</th><th>{t('attendanceUi.start')}</th><th>{t('attendanceUi.end')}</th><th>{t('Notes')}</th><th>{t('Actions')}</th></tr></thead>
                <tbody>{sessions.map(item => <tr key={item.id}>
                    <td>{item.date}</td><td>{item.startTime || '—'}</td><td>{item.endTime || '—'}</td><td>{item.notes || '—'}</td>
                    <td><div className="d-flex gap-2"><Button size="sm" variant="outline-primary" onClick={() => setEditing(item)}><Edit size={16} /> {t('attendanceUi.manage')}</Button>
                        <Button size="sm" variant="outline-danger" aria-label={t('Delete')} onClick={() => remove(item.id)}><Trash2 size={16} /></Button></div></td>
                </tr>)}{!sessions.length && <tr><td colSpan={5} className="text-muted text-center py-4">{t('attendanceUi.empty')}</td></tr>}</tbody>
            </Table>}
        </Card.Body></Card>
    </div>;
}
