import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Nav, Spinner } from 'react-bootstrap';
import { ArrowLeft, Plus, Trash2, Edit, Users, FileText, CheckSquare, Download, Vote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import Modal from './Modal';
import AssemblyMotionVoteForm, { OutcomeBadge } from './AssemblyMotionVoteForm';

const VOTING_TYPE_LABELS = { SIMPLE: 'Simple Majority', QUALIFIED: 'Qualified Majority', UNANIMITY: 'Unanimity', CONSULTATIVE: 'Consultative' };
const PARTICIPATION_LABELS = { PRESENT: 'Present', PROXY: 'Proxy', ABSENT: 'Absent' };
const ROLE_LABELS = { MEMBER: 'Member', PRESIDENT: 'President', SECRETARY: 'Secretary', SCRUTINEER: 'Scrutineer' };

const AssemblyDetail = ({ assemblyId, shell, onBack }) => {
    const { t, i18n } = useTranslation();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('participants');
    const [members, setMembers] = useState([]);
    const [voteMotion, setVoteMotion] = useState(null);

    useEffect(() => {
        loadData();
    }, [assemblyId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [data, memberships] = await Promise.all([
                associago.assemblies.getDetails(assemblyId),
                associago.memberships.getByAssociation().catch(() => [])
            ]);
            setDetails(data);
            setMembers(Array.isArray(memberships) ? memberships : []);
        } catch (error) {
            console.error("Error loading assembly details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubResource = async (type, id) => {
        if (!confirm(t('Are you sure?'))) return;
        try {
            if (type === 'participant') await associago.assemblies.removeParticipant(id);
            if (type === 'motion') await associago.assemblies.deleteMotion(id);
            if (type === 'document') await associago.assemblies.deleteDocument(id);
            loadData();
        } catch (error) {
            alert(t('Error deleting item'));
        }
    };

    const handleDownloadMinutes = async () => {
        try {
            const blob = await associago.reports.downloadAssemblyMinutes(assemblyId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `minutes_${assemblyId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            alert(t('Error downloading minutes'));
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;
    if (!details) return <div className="text-center p-5 text-muted">{t('Assembly not found')}</div>;

    const { assembly, participants, motions, documents } = details;
    const voters = (details.presentParticipants || 0) + (details.proxyParticipants || 0);
    const memberName = (id) => {
        const user = members.find(m => String(m.id) === String(id))?.user;
        const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
        return name || t('assemblyVoting.unknownMember', { id });
    };
    const sortedMotions = [...motions].sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));
    const iconButton = (label, onClick, icon, tone = 'text-primary') => (
        <Button variant="link" className={`${tone} p-1`} aria-label={label} title={label} onClick={onClick}>{icon}</Button>
    );

    return (
        <div className="fade-in">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="p-0 me-3 text-dark" onClick={onBack}>
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h2 className="fw-bold text-dark mb-0">{assembly.title}</h2>
                    <div className="text-muted small">
                        {new Date(assembly.date).toLocaleDateString(i18n.language)} - {assembly.location}
                    </div>
                </div>
                <div className="ms-auto d-flex gap-2">
                    <Button variant="outline-secondary" onClick={handleDownloadMinutes}>
                        <Download size={18} className="me-2" /> {t('Minutes')}
                    </Button>
                    <Button variant="outline-primary" onClick={() => shell.openModal('assembly-form', { associationId: assembly.associationId, assemblyId: assembly.id, onSuccess: loadData })}>
                        <Edit size={18} className="me-2" /> {t('Edit')}
                    </Button>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Status')}</h6>
                            <Badge bg={assembly.status === 'CLOSED' ? 'secondary' : 'success'} className="fs-6">
                                {t(assembly.status)}
                            </Badge>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Present')}</h6>
                            <h3 className="fw-bold mb-0">{details.presentParticipants}</h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Proxy')}</h6>
                            <h3 className="fw-bold mb-0">{details.proxyParticipants}</h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">{t('Quorum')}</h6>
                            <h3 className={`fw-bold mb-0 ${details.quorumReached ? 'text-success' : 'text-danger'}`}>
                                {details.quorumReached ? t('Reached') : t('Not Reached')}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pt-0 px-0">
                    <Nav variant="tabs" className="px-3 pt-3" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                        <Nav.Item><Nav.Link eventKey="participants" className="d-flex align-items-center gap-2"><Users size={18}/> {t('Participants')}</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="motions" className="d-flex align-items-center gap-2"><CheckSquare size={18}/> {t('Motions')}</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="documents" className="d-flex align-items-center gap-2"><FileText size={18}/> {t('Documents')}</Nav.Link></Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    {activeTab === 'participants' && (
                        <div>
                            <div className="p-3 text-end border-bottom">
                                <Button size="sm" onClick={() => shell.openModal('assembly-participant-form', { assemblyId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Register Presence')}
                                </Button>
                            </div>
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light"><tr><th className="ps-4">{t('Member')}</th><th>{t('Type')}</th><th>{t('Role')}</th><th>{t('Proxy Receiver')}</th><th className="text-end pe-4">{t('Actions')}</th></tr></thead>
                                <tbody>
                                    {participants.map(p => (
                                        <tr key={p.id}>
                                            <td className="ps-4 fw-medium">{memberName(p.userAssociationId)}</td>
                                            <td><Badge bg="light" text="dark" className="border">{t(PARTICIPATION_LABELS[p.participationType] || p.participationType || '-')}</Badge></td>
                                            <td>{p.role ? t(ROLE_LABELS[p.role] || p.role) : '-'}</td>
                                            <td>{p.participationType === 'PROXY' && p.proxyReceiverId ? memberName(p.proxyReceiverId) : '-'}</td>
                                            <td className="text-end pe-4 text-nowrap">
                                                {iconButton(t('Edit'), () => shell.openModal('assembly-participant-form', { assemblyId, participant: p, onSuccess: loadData }), <Edit size={16}/>)}
                                                {iconButton(t('Delete'), () => handleDeleteSubResource('participant', p.id), <Trash2 size={16}/>, 'text-danger')}
                                            </td>
                                        </tr>
                                    ))}
                                    {participants.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">{t('No participants')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {activeTab === 'motions' && (
                        <div>
                            <div className="p-3 text-end border-bottom">
                                <Button size="sm" onClick={() => shell.openModal('assembly-motion-form', { assemblyId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Add Motion')}
                                </Button>
                            </div>
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light"><tr><th className="ps-4">#</th><th>{t('Title')}</th><th>{t('Type')}</th><th>{t('assemblyVoting.votesColumn')}</th><th>{t('assemblyVoting.outcomeColumn')}</th><th className="text-end pe-4">{t('Actions')}</th></tr></thead>
                                <tbody>
                                    {sortedMotions.map(m => (
                                        <tr key={m.id}>
                                            <td className="ps-4 text-muted">{m.orderNumber ?? '-'}</td>
                                            <td className="fw-medium">{m.title}</td>
                                            <td>{m.votingType ? t(VOTING_TYPE_LABELS[m.votingType] || m.votingType) : '-'}</td>
                                            <td className="text-nowrap small">
                                                {m.outcome && m.outcome !== 'PENDING'
                                                    ? t('assemblyVoting.tally', { favor: m.votesInFavor ?? 0, against: m.votesAgainst ?? 0, abstain: m.votesAbstain ?? 0 })
                                                    : <span className="text-muted">-</span>}
                                            </td>
                                            <td><OutcomeBadge outcome={m.outcome} /></td>
                                            <td className="text-end pe-4 text-nowrap">
                                                <Button size="sm" variant="outline-primary" className="me-2" onClick={() => setVoteMotion(m)}>
                                                    <Vote size={14} className="me-1" aria-hidden="true" /> {t('assemblyVoting.recordVote')}
                                                </Button>
                                                {iconButton(t('Edit'), () => shell.openModal('assembly-motion-form', { assemblyId, motion: m, onSuccess: loadData }), <Edit size={16}/>)}
                                                {iconButton(t('Delete'), () => handleDeleteSubResource('motion', m.id), <Trash2 size={16}/>, 'text-danger')}
                                            </td>
                                        </tr>
                                    ))}
                                    {motions.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">{t('No motions')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div>
                            <div className="p-3 text-end border-bottom">
                                <Button size="sm" onClick={() => shell.openModal('assembly-document-form', { assemblyId, onSuccess: loadData })}>
                                    <Plus size={16} className="me-1"/> {t('Add Document')}
                                </Button>
                            </div>
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light"><tr><th className="ps-4">{t('Name')}</th><th className="text-end pe-4">{t('Actions')}</th></tr></thead>
                                <tbody>
                                    {documents.map(d => (
                                        <tr key={d.id}>
                                            <td className="ps-4">{d.name}</td>
                                            <td className="text-end pe-4">
                                                <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteSubResource('document', d.id)}><Trash2 size={16}/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {documents.length === 0 && <tr><td colSpan="2" className="text-center py-4 text-muted">{t('No documents')}</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal isOpen={Boolean(voteMotion)} onClose={() => setVoteMotion(null)} title={t('assemblyVoting.recordVote')}>
                {voteMotion && (
                    <AssemblyMotionVoteForm
                        motion={voteMotion}
                        voters={voters}
                        onCancel={() => setVoteMotion(null)}
                        onSuccess={() => { setVoteMotion(null); loadData(); }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default AssemblyDetail;
