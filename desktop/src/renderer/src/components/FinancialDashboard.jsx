import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Spinner, Table, Badge } from 'react-bootstrap';
import { associago } from '../api';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, DollarSign, Download, Calendar, Users, Activity, ArrowRight } from 'lucide-react';

const FinancialDashboard = ({ shell }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [shell.currentAssociation?.id]);

  const loadDashboard = async () => {
    if (!shell.currentAssociation?.id) return;

    setLoading(true);
    try {
      const data = await associago.dashboard.getStats(shell.currentAssociation.id);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{minHeight: '60vh'}}>
      <Spinner animation="border" variant="primary" className="mb-3" />
      <p className="text-muted">{t('Loading dashboard...')}</p>
    </div>
  );

  if (!stats) return null;

  return (
    <div className="fade-in">
      {/* Welcome Header */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
            <h6 className="text-uppercase text-primary fw-bold small mb-2">{shell.currentAssociation?.nome || "Associazione"}</h6>
            <h2 className="fw-bold text-dark mb-1">{t('Dashboard')}</h2>
            <p className="text-muted mb-0">{t('Overview of your association activities')}</p>
        </div>
        <div className="text-end">
            <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                <Calendar size={14} className="me-2 text-muted" />
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="g-4 mb-5">
        {/* Members KPI */}
        <Col md={4}>
            <Card className="border-0 shadow-sm h-100 overflow-hidden">
                <Card.Body className="position-relative">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h6 className="text-muted text-uppercase small fw-bold mb-1">{t('Active Members')}</h6>
                            <h2 className="fw-bold mb-0">{stats.members.active}</h2>
                        </div>
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="d-flex align-items-center text-muted small">
                        <span className="text-success fw-bold me-2">+{stats.members.newThisMonth}</span>
                        {t('new this month')}
                    </div>
                    {/* Decorative bg */}
                    <Users size={120} className="position-absolute text-primary opacity-5" style={{right: -20, bottom: -20}} />
                </Card.Body>
            </Card>
        </Col>

        {/* Treasury KPI */}
        <Col md={4}>
            <Card className="border-0 shadow-sm h-100 overflow-hidden">
                <Card.Body className="position-relative">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h6 className="text-muted text-uppercase small fw-bold mb-1">{t('Treasury Balance')}</h6>
                            <h2 className="fw-bold mb-0">€ {stats.treasury.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                        </div>
                        <div className="bg-success bg-opacity-10 text-success rounded-circle p-3">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div className="d-flex align-items-center text-muted small">
                        <span className="text-success fw-bold me-2">
                            <TrendingUp size={14} className="me-1"/>
                            +€{stats.treasury.incomeMonth}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-danger fw-bold">
                            <TrendingDown size={14} className="me-1"/>
                            -€{stats.treasury.expenseMonth}
                        </span>
                    </div>
                </Card.Body>
            </Card>
        </Col>

        {/* Events KPI */}
        <Col md={4}>
            <Card className="border-0 shadow-sm h-100 overflow-hidden">
                <Card.Body className="position-relative">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h6 className="text-muted text-uppercase small fw-bold mb-1">{t('Upcoming Events')}</h6>
                            <h2 className="fw-bold mb-0">{stats.events.upcoming}</h2>
                        </div>
                        <div className="bg-info bg-opacity-10 text-info rounded-circle p-3">
                            <Calendar size={24} />
                        </div>
                    </div>
                    {stats.events.nextEvent ? (
                        <div className="text-muted small text-truncate">
                            <span className="fw-bold text-dark">{t('Next')}:</span> {stats.events.nextEvent.title}
                            <br/>
                            <span className="opacity-75">{new Date(stats.events.nextEvent.date).toLocaleDateString()}</span>
                        </div>
                    ) : (
                        <div className="text-muted small">{t('No upcoming events')}</div>
                    )}
                </Card.Body>
            </Card>
        </Col>
      </Row>

      {/* Recent Activity & Quick Actions */}
      <Row className="g-4">
        <Col lg={8}>
            <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">{t('Recent Activity')}</h5>
                    <Button variant="link" className="text-decoration-none small p-0" onClick={() => {}}>
                        {t('View All')} <ArrowRight size={16} />
                    </Button>
                </Card.Header>
                <Card.Body>
                    <div className="list-group list-group-flush">
                        {stats.recentActivity.map(activity => (
                            <div key={activity.id} className="list-group-item border-0 px-0 py-3 d-flex align-items-center">
                                <div className={`rounded-circle p-2 me-3 ${
                                    activity.type === 'PAYMENT' ? 'bg-success bg-opacity-10 text-success' :
                                    activity.type === 'MEMBER_NEW' ? 'bg-primary bg-opacity-10 text-primary' :
                                    'bg-secondary bg-opacity-10 text-secondary'
                                }`}>
                                    {activity.type === 'PAYMENT' && <DollarSign size={18} />}
                                    {activity.type === 'MEMBER_NEW' && <Users size={18} />}
                                    {activity.type === 'EVENT' && <Calendar size={18} />}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="fw-medium text-dark">{activity.description}</div>
                                    <small className="text-muted">
                                        {new Date(activity.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </small>
                                </div>
                            </div>
                        ))}
                        {stats.recentActivity.length === 0 && (
                            <div className="text-center py-5 text-muted">
                                <Activity size={32} className="mb-2 opacity-50" />
                                <p>{t('No recent activity')}</p>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Col>

        <Col lg={4}>
            <Card className="border-0 shadow-sm h-100 bg-primary text-white" style={{background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)'}}>
                <Card.Body className="d-flex flex-column justify-content-center p-4">
                    <h4 className="fw-bold mb-3">{t('Quick Actions')}</h4>
                    <div className="d-grid gap-3">
                        <Button variant="outline-light" className="text-white text-primary fw-bold text-start py-3 px-4 shadow-sm" onClick={() => shell.openModal('member-form')}>
                            <Users size={18} className="me-2" /> {t('Register New Member')}
                        </Button>
                        <Button variant="outline-light" className="text-white fw-bold text-start py-3 px-4" onClick={() => shell.openModal('event-form')}>
                            <Calendar size={18} className="me-2" /> {t('Create Event')}
                        </Button>
                        <Button variant="outline-light" className="text-white fw-bold text-start py-3 px-4" onClick={() => shell.navigate('fiscal')}>
                            <DollarSign size={18} className="me-2" /> {t('Record Payment')}
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinancialDashboard;
