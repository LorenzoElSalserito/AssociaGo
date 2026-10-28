import { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';

export default function MemberDataTransfer({ associationId, onImported }) {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function run(action) {
    setBusy(true); setError('');
    try { await action(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function download(format, example) {
    const data = await associago.memberData.download(associationId, format, example);
    const blob = data instanceof Blob ? data : new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url;
    link.download = `${t(example ? 'dataTransfer.exampleFileName' : 'dataTransfer.exportFileName')}.${format}`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  return <Card className="border-0 shadow-sm" data-testid="member-data-transfer"><Card.Body>
    <h5>{t('dataTransfer.title')}</h5>
    <p className="text-muted small">{t('dataTransfer.description')}</p>
    {error && <Alert variant="danger" role="alert">{error}</Alert>}
    <div className="d-flex flex-wrap gap-2 mb-3">
      {['csv','json'].map(format => <span key={format} className="d-flex gap-2">
        <Button variant="outline-primary" disabled={busy} data-testid={`template-${format}`} onClick={() => run(() => download(format, true))}>{t('dataTransfer.template', {format:format.toUpperCase()})}</Button>
        <Button variant="outline-secondary" disabled={busy} data-testid={`export-${format}`} onClick={() => run(() => download(format, false))}>{t('dataTransfer.export', {format:format.toUpperCase()})}</Button>
      </span>)}
    </div>
    <Form.Group controlId="member-transfer-file" className="mb-3">
      <Form.Label>{t('dataTransfer.file')}</Form.Label>
      <Form.Control type="file" accept=".csv,.json,text/csv,application/json" disabled={busy} onChange={e => {setFile(e.target.files?.[0] || null);setPreview(null);setError('');}} />
    </Form.Group>
    <div className="d-flex flex-wrap gap-2 mb-3">
      <Button variant="outline-primary" disabled={!file || busy} onClick={() => run(async () => setPreview(await associago.memberData.upload(associationId,file,true)))}>{t('Generate Preview')}</Button>
      <Button disabled={!preview || preview.errorRows>0 || preview.status!=='PREVIEW' || busy} onClick={() => run(async () => {
        setPreview(await associago.memberData.upload(associationId,file,false)); onImported?.();
      })}>{t('Confirm Import')}</Button>
    </div>
    {preview && <Alert variant={preview.errorRows ? 'warning' : 'success'} role="status">
      <div>{t(preview.status==='COMPLETED'?'Import completed.':'Preview generated successfully.')}</div>
      <div>{t('dataTransfer.counts',{total:preview.totalRows,valid:preview.importedRows,skipped:preview.skippedRows,errors:preview.errorRows})}</div>
      {preview.errorsDetail && <pre className="text-wrap mb-0">{preview.errorsDetail}</pre>}
    </Alert>}
  </Card.Body></Card>;
}
