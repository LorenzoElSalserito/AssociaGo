import { useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, Form, ProgressBar, Table } from 'react-bootstrap'
import { CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const CSV_EXAMPLE = `nome;cognome;email;telefono;codice_fiscale;note
Mario;Rossi;mario@email.it;+393331234567;RSSMRA80A01H501Z;Import esempio`

const CsvImporter = ({ title, onPreview, onImport, onConfirm }) => {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState(null)

  const counters = useMemo(() => ({
    total: preview?.totalRows || 0,
    valid: preview?.importedRows || 0,
    skipped: preview?.skippedRows || 0,
    errors: preview?.errorRows || 0
  }), [preview])

  const handlePreview = async () => {
    if (!file) return
    setLoading(true)
    setMessage(null)
    try {
      const result = await onPreview(file)
      setPreview(result)
      setMessage({ type: 'success', text: t('Preview generated successfully.') })
    } catch (error) {
      setMessage({ type: 'danger', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setMessage(null)
    try {
      const result = onImport ? await onImport(file) : await onConfirm(preview?.id)
      if (result) setPreview(result)
      setMessage({ type: 'success', text: t('Import completed.') })
    } catch (error) {
      setMessage({ type: 'danger', text: error.message })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-1">{title || t('CSV Import')}</h5>
            <p className="text-muted small mb-0">{t('Generate a preview, validate the file and then confirm the batch import.')}</p>
          </div>
          <FileSpreadsheet size={20} className="text-primary" />
        </div>

        {message && <Alert variant={message.type}>{message.text}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>{t('CSV File')}</Form.Label>
          <Form.Control
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null)
              setPreview(null)
              setMessage(null)
            }}
          />
        </Form.Group>

        <div className="d-flex gap-2 mb-4">
          <Button variant="outline-primary" onClick={handlePreview} disabled={!file || loading}>
            <Upload size={16} className="me-2" />
            {loading ? t('Generating preview...') : t('Generate Preview')}
          </Button>
          <Button variant="primary" onClick={handleImport} disabled={!file || importing || (!onImport && !preview?.id)}>
            <CheckCircle2 size={16} className="me-2" />
            {importing ? t('Importing...') : t('Confirm Import')}
          </Button>
        </div>

        <Card className="bg-light border-0 mb-4">
          <Card.Body>
            <div className="small text-muted mb-2">{t('Example format')}</div>
            <pre className="mb-0 small">{CSV_EXAMPLE}</pre>
          </Card.Body>
        </Card>

        <div className="d-flex gap-3 flex-wrap mb-3">
          <Badge bg="secondary">{t('Total')}: {counters.total}</Badge>
          <Badge bg="success">{t('Valid')}: {counters.valid}</Badge>
          <Badge bg="warning" text="dark">{t('Skipped')}: {counters.skipped}</Badge>
          <Badge bg="danger">{t('Errors')}: {counters.errors}</Badge>
        </div>

        <ProgressBar className="mb-3" style={{ height: 10 }}>
          <ProgressBar variant="success" now={counters.total ? (counters.valid / counters.total) * 100 : 0} key="valid" />
          <ProgressBar variant="warning" now={counters.total ? (counters.skipped / counters.total) * 100 : 0} key="skipped" />
          <ProgressBar variant="danger" now={counters.total ? (counters.errors / counters.total) * 100 : 0} key="errors" />
        </ProgressBar>

        {preview && (
          <Table responsive hover bordered size="sm" className="mb-0">
            <thead>
              <tr>
                <th>{t('File')}</th>
                <th>{t('Status')}</th>
                <th>{t('Rows')}</th>
                <th>{t('Errors')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{preview.fileName || '-'}</td>
                <td>{preview.status || '-'}</td>
                <td>{preview.totalRows || 0}</td>
                <td className="text-break">{preview.errorsDetail || '-'}</td>
              </tr>
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  )
}

export default CsvImporter
