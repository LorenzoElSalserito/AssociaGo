import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap'
import { CalendarClock, FileText, MapPin, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { associago } from '../api'
import { translateLocationType, translateDocumentType, translateDeadlineCategory, translateDeadlineStatus } from '../utils/enumTranslations'

const emptyLocation = {
  locationType: 'legal',
  name: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'IT',
  phone: '',
  email: '',
  isPrimary: false,
  notes: ''
}

const emptyDeadline = {
  title: '',
  description: '',
  dueDate: '',
  category: 'legal',
  reminderDays: 30,
  recurring: false,
  recurringMonths: 12
}

const AssociationRegistryPanel = ({ associationId }) => {
  const { t } = useTranslation()
  const [locations, setLocations] = useState([])
  const [documents, setDocuments] = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [locationForm, setLocationForm] = useState(emptyLocation)
  const [deadlineForm, setDeadlineForm] = useState(emptyDeadline)
  const [documentFile, setDocumentFile] = useState(null)
  const [documentMeta, setDocumentMeta] = useState({ documentType: 'statute', title: '' })
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (associationId) loadData()
  }, [associationId])

  const loadData = async () => {
    try {
      const [locationsData, documentsData, deadlinesData] = await Promise.all([
        associago.getLocations(associationId),
        associago.getDocuments(associationId),
        associago.getDeadlines(associationId)
      ])
      setLocations(locationsData || [])
      setDocuments(documentsData || [])
      setDeadlines(deadlinesData || [])
    } catch (error) {
      setMessage({ type: 'danger', text: error.message })
    }
  }

  const addLocation = async () => {
    await associago.createLocation(associationId, locationForm)
    setLocationForm(emptyLocation)
    await loadData()
  }

  const addDeadline = async () => {
    await associago.createDeadline(associationId, deadlineForm)
    setDeadlineForm(emptyDeadline)
    await loadData()
  }

  const uploadDocument = async () => {
    if (!documentFile) return
    await associago.uploadDocument(associationId, documentFile, documentMeta.documentType, documentMeta.title)
    setDocumentFile(null)
    setDocumentMeta({ documentType: 'statute', title: '' })
    await loadData()
  }

  return (
    <div className="d-flex flex-column gap-4">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0"><MapPin size={18} className="me-2" />{t('registry.locations')}</h6>
            <Badge bg="primary">{locations.length}</Badge>
          </div>
          <Row className="g-2 mb-3">
            <Col md={2}><Form.Select value={locationForm.locationType} onChange={(e) => setLocationForm({ ...locationForm, locationType: e.target.value })}><option value="legal">{t('enum.locationType.legal')}</option><option value="operational">{t('enum.locationType.operational')}</option><option value="project">{t('enum.locationType.project')}</option></Form.Select></Col>
            <Col md={2}><Form.Control placeholder={t('Name')} value={locationForm.name} onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })} /></Col>
            <Col md={3}><Form.Control placeholder={t('Address')} value={locationForm.address} onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })} /></Col>
            <Col md={2}><Form.Control placeholder={t('City')} value={locationForm.city} onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })} /></Col>
            <Col md={1}><Form.Control placeholder={t('Prov.')} value={locationForm.province} onChange={(e) => setLocationForm({ ...locationForm, province: e.target.value })} /></Col>
            <Col md={2}><Button className="w-100" onClick={addLocation}><Plus size={16} className="me-2" />{t('Add')}</Button></Col>
          </Row>
          <Table responsive hover size="sm" className="mb-0">
            <thead><tr><th>{t('Type')}</th><th>{t('Name')}</th><th>{t('Address')}</th><th>{t('Contacts')}</th><th></th></tr></thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td>{translateLocationType(location.locationType, t)}</td>
                  <td>{location.name || '-'}</td>
                  <td>{[location.address, location.city, location.province].filter(Boolean).join(', ') || '-'}</td>
                  <td>{location.email || location.phone || '-'}</td>
                  <td className="text-end"><Button variant="link" className="text-danger p-0" onClick={() => associago.deleteLocation(associationId, location.id).then(loadData)}><Trash2 size={14} /></Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0"><FileText size={18} className="me-2" />{t('Documents')}</h6>
            <Badge bg="secondary">{documents.length}</Badge>
          </div>
          <Row className="g-2 mb-3">
            <Col md={3}><Form.Select value={documentMeta.documentType} onChange={(e) => setDocumentMeta({ ...documentMeta, documentType: e.target.value })}><option value="statute">{t('enum.documentType.statute')}</option><option value="regulation">{t('enum.documentType.regulation')}</option><option value="attachment">{t('enum.documentType.attachment')}</option></Form.Select></Col>
            <Col md={3}><Form.Control placeholder={t('Title')} value={documentMeta.title} onChange={(e) => setDocumentMeta({ ...documentMeta, title: e.target.value })} /></Col>
            <Col md={4}><Form.Control type="file" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} /></Col>
            <Col md={2}><Button className="w-100" onClick={uploadDocument}>{t('Upload')}</Button></Col>
          </Row>
          <Table responsive hover size="sm" className="mb-0">
            <thead><tr><th>{t('Type')}</th><th>{t('Title')}</th><th>{t('File')}</th><th></th></tr></thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td>{translateDocumentType(document.documentType, t)}</td>
                  <td>{document.title}</td>
                  <td className="text-break">{document.filePath}</td>
                  <td className="text-end"><Button variant="link" className="text-danger p-0" onClick={() => associago.deleteDocument(associationId, document.id).then(loadData)}><Trash2 size={14} /></Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0"><CalendarClock size={18} className="me-2" />{t('registry.deadlines')}</h6>
            <Badge bg="warning" text="dark">{deadlines.length}</Badge>
          </div>
          <Row className="g-2 mb-3">
            <Col md={3}><Form.Control placeholder={t('Title')} value={deadlineForm.title} onChange={(e) => setDeadlineForm({ ...deadlineForm, title: e.target.value })} /></Col>
            <Col md={3}><Form.Control type="date" value={deadlineForm.dueDate} onChange={(e) => setDeadlineForm({ ...deadlineForm, dueDate: e.target.value })} /></Col>
            <Col md={2}><Form.Select value={deadlineForm.category} onChange={(e) => setDeadlineForm({ ...deadlineForm, category: e.target.value })}><option value="fiscal">{t('enum.deadlineCategory.fiscal')}</option><option value="legal">{t('enum.deadlineCategory.legal')}</option><option value="governance">{t('enum.deadlineCategory.governance')}</option><option value="insurance">{t('enum.deadlineCategory.insurance')}</option><option value="other">{t('enum.deadlineCategory.other')}</option></Form.Select></Col>
            <Col md={2}><Form.Control type="number" value={deadlineForm.reminderDays} onChange={(e) => setDeadlineForm({ ...deadlineForm, reminderDays: parseInt(e.target.value || '0', 10) })} /></Col>
            <Col md={2}><Button className="w-100" onClick={addDeadline}><Plus size={16} className="me-2" />{t('Add')}</Button></Col>
          </Row>
          <Table responsive hover size="sm" className="mb-0">
            <thead><tr><th>{t('Title')}</th><th>{t('registry.dueDate')}</th><th>{t('Category')}</th><th>{t('Status')}</th><th></th></tr></thead>
            <tbody>
              {deadlines.map((deadline) => (
                <tr key={deadline.id}>
                  <td>{deadline.title}</td>
                  <td>{deadline.dueDate}</td>
                  <td>{translateDeadlineCategory(deadline.category, t)}</td>
                  <td><Badge bg={deadline.status === 'completed' ? 'success' : 'warning'} text={deadline.status === 'completed' ? 'white' : 'dark'}>{translateDeadlineStatus(deadline.status, t)}</Badge></td>
                  <td className="text-end d-flex justify-content-end gap-2">
                    {deadline.status !== 'completed' && <Button size="sm" variant="outline-success" onClick={() => associago.completeDeadline(associationId, deadline.id).then(loadData)}>{t('registry.complete')}</Button>}
                    <Button variant="link" className="text-danger p-0" onClick={() => associago.deleteDeadline(associationId, deadline.id).then(loadData)}><Trash2 size={14} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}

export default AssociationRegistryPanel
