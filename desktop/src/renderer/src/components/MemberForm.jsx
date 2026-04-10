import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import { Calculator, FileHeart, Upload } from 'lucide-react';

const MemberForm = ({ associationId, associationType, onSuccess, onCancel }) => {
  const isASD = associationType === 'ASD';
  const { register, handleSubmit, setValue, getValues, watch, formState: { errors, isSubmitting } } = useForm();
  const [calculatingCF, setCalculatingCF] = useState(false);

  // Watch for payment checkbox to conditionally show payment fields
  const registerPayment = watch('registerPayment', false);

  const onSubmit = async (data) => {
    try {
      // Step 1: Create User (handle duplicate taxCode by finding existing)
      let user;
      try {
        user = await associago.users.create({
          firstName: data.firstName,
          lastName: data.lastName,
          taxCode: data.taxCode,
          email: data.email,
          phone: data.phone,
          birthDate: data.birthDate,
          birthPlace: data.birthPlace,
          gender: data.gender,
          address: data.address,
          city: data.city,
          zipCode: data.zipCode
        });
      } catch (userError) {
        // If user creation fails (e.g. duplicate taxCode), try to find existing
        const existingUsers = await associago.users.getAll();
        user = existingUsers.find(u => u.taxCode === data.taxCode);
        if (!user) throw userError;
      }

      // Step 2: Create Membership (UserAssociation)
      await associago.memberships.create({
        user: { id: user.id },
        association: { id: associationId },
        role: data.role || 'MEMBER',
        status: 'ACTIVE',
        joinDate: new Date().toISOString().split('T')[0],
        membershipCardNumber: data.cardNumber
      });

      // Step 3: Save Medical Certificate (if ASD and data provided)
      if (isASD && data.medicalCertIssueDate) {
        try {
          await associago.medicalCertificates.save({
            memberId: user.id,
            associationId,
            certificateType: data.medicalCertType || 'NON_AGONISTIC',
            issueDate: data.medicalCertIssueDate,
            expiryDate: data.medicalCertExpiryDate,
            issuedBy: data.medicalCertIssuedBy,
            medicalFacility: data.medicalCertFacility,
            notes: data.medicalCertNotes
          });
        } catch (medError) {
          console.warn('Member created but medical certificate save failed', medError);
        }
      }

      // Step 4: Register Payment (if selected)
      if (data.registerPayment && data.paymentAmount > 0) {
        try {
          await associago.finance.createTransaction({
            associationId: associationId,
            date: new Date().toISOString().split('T')[0],
            amount: data.paymentAmount,
            type: 'INCOME',
            description: `Quota associativa - ${data.firstName} ${data.lastName}`,
            paymentMethod: data.paymentMethod,
            userId: user.id,
          });
        } catch (paymentError) {
          console.warn('Membership created but payment registration failed', paymentError);
          alert('Socio creato ma errore nella registrazione del pagamento.');
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating member:', error);
      alert('Failed to create member: ' + error.message);
    }
  };

  const handleCalculateCF = async () => {
    const { firstName, lastName, birthDate, gender, birthPlaceCode } = getValues();

    if (!firstName || !lastName || !birthDate || !gender || !birthPlaceCode) {
      alert("Per calcolare il Codice Fiscale servono: Nome, Cognome, Data di Nascita, Sesso e Codice Catastale (es. H501).");
      return;
    }

    setCalculatingCF(true);
    try {
      const result = await associago.members.calculateFiscalCode({
        firstName, lastName, birthDate, gender, birthPlaceCode
      });
      if (result && result.fiscalCode) {
        setValue('taxCode', result.fiscalCode);
      }
    } catch (error) {
      alert("Errore calcolo CF: " + error.message);
    } finally {
      setCalculatingCF(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nome</label>
          <input
            {...register('firstName', { required: 'Nome obbligatorio' })}
            className="form-control"
          />
          {errors.firstName && <span className="text-danger small">{errors.firstName.message}</span>}
        </div>
        <div className="col-md-6">
          <label className="form-label">Cognome</label>
          <input
            {...register('lastName', { required: 'Cognome obbligatorio' })}
            className="form-control"
          />
          {errors.lastName && <span className="text-danger small">{errors.lastName.message}</span>}
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-4">
          <label className="form-label">Data di Nascita</label>
          <input type="date" {...register('birthDate', { required: true })} className="form-control" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Sesso</label>
          <select {...register('gender', { required: true })} className="form-select">
            <option value="">Seleziona...</option>
            <option value="M">Maschio</option>
            <option value="F">Femmina</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Codice Catastale (es. H501)</label>
          <input {...register('birthPlaceCode')} className="form-control" placeholder="es. H501" />
        </div>
      </div>

      <div className="mt-3">
        <label className="form-label">Codice Fiscale</label>
        <div className="input-group">
          <input
            {...register('taxCode', { required: 'Codice Fiscale obbligatorio' })}
            className="form-control"
          />
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={handleCalculateCF}
            disabled={calculatingCF}
          >
            <Calculator size={16} /> {calculatingCF ? '...' : 'Calcola'}
          </button>
        </div>
        {errors.taxCode && <span className="text-danger small">{errors.taxCode.message}</span>}
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input type="email" {...register('email')} className="form-control" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Telefono</label>
          <input type="tel" {...register('phone')} className="form-control" />
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-12">
          <label className="form-label">Indirizzo</label>
          <input type="text" {...register('address')} className="form-control" placeholder="Via Roma 1" />
        </div>
        <div className="col-md-8">
          <label className="form-label">Città</label>
          <input type="text" {...register('city')} className="form-control" />
        </div>
        <div className="col-md-4">
          <label className="form-label">CAP</label>
          <input type="text" {...register('zipCode')} className="form-control" />
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
            <label className="form-label">Numero Tessera</label>
            <input {...register('cardNumber')} className="form-control" />
        </div>
        <div className="col-md-6">
            <label className="form-label">Tipologia Membro</label>
            <select {...register('role')} className="form-select" defaultValue="MEMBER">
                <option value="MEMBER">Socio Ordinario</option>
                <option value="FOUNDER">Socio Fondatore</option>
                <option value="PRESIDENT">Presidente</option>
                <option value="VICE_PRESIDENT">Vice Presidente</option>
                <option value="SECRETARY">Segretario</option>
                <option value="TREASURER">Tesoriere</option>
                <option value="COUNCILLOR">Consigliere</option>
                <option value="HONORARY">Socio Onorario</option>
            </select>
        </div>
      </div>

      {isASD && (
        <>
          <hr className="my-4" />
          <div className="card border-primary border-opacity-25 mb-3">
            <div className="card-header bg-primary bg-opacity-10 d-flex align-items-center gap-2">
              <FileHeart size={18} className="text-primary" />
              <span className="fw-bold">{t('Sports Medical Certificate')}</span>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3">{t('Required for participation in sports activities (ASD).')}</p>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">{t('Certificate Type')}</label>
                  <select {...register('medicalCertType')} className="form-select">
                    <option value="NON_AGONISTIC">{t('Non-Agonistic')}</option>
                    <option value="AGONISTIC">{t('Agonistic')}</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">{t('Status')}</label>
                  <select {...register('medicalCertStatus')} className="form-select" disabled>
                    <option value="MISSING">{t('Missing')}</option>
                    <option value="VALID">{t('Valid')}</option>
                    <option value="EXPIRING_SOON">{t('Expiring Soon')}</option>
                    <option value="EXPIRED">{t('Expired')}</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">{t('Issue Date')}</label>
                  <input type="date" {...register('medicalCertIssueDate')} className="form-control" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">{t('Expiry Date')}</label>
                  <input type="date" {...register('medicalCertExpiryDate')} className="form-control" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">{t('Certifying Doctor')}</label>
                  <input {...register('medicalCertIssuedBy')} className="form-control" placeholder={t('Dr. ...')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">{t('Medical Facility')}</label>
                  <input {...register('medicalCertFacility')} className="form-control" placeholder={t('Hospital / Clinic')} />
                </div>
                <div className="col-12">
                  <label className="form-label">{t('Notes')}</label>
                  <textarea {...register('medicalCertNotes')} className="form-control" rows={2} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <hr className="my-4" />

      <div className="form-check mb-3">
        <input
            className="form-check-input"
            type="checkbox"
            id="registerPayment"
            {...register('registerPayment')}
        />
        <label className="form-check-label fw-bold" htmlFor="registerPayment">
            Registra Pagamento Quota Associativa
        </label>
      </div>

      {registerPayment && (
        <div className="card bg-light border-0 p-3 mb-3">
            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Importo (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('paymentAmount', { required: registerPayment })}
                        className="form-control"
                        defaultValue="20.00"
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Metodo di Pagamento</label>
                    <select {...register('paymentMethod', { required: registerPayment })} className="form-select">
                        <option value="CASH">Contanti</option>
                        <option value="BANK_TRANSFER">Bonifico</option>
                        <option value="POS">POS / Carta</option>
                        <option value="PAYPAL">PayPal</option>
                    </select>
                </div>
            </div>
        </div>
      )}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Salvataggio...' : 'Salva Socio'}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
