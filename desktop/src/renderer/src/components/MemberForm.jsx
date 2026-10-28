import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { associago } from '../api';
import { Calculator, FileHeart, Upload } from 'lucide-react';
import { MEMBER_ROLES } from '../utils/memberRoles';

const MemberForm = ({ associationId, associationType, memberId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const isASD = associationType === 'ASD';
  const today = new Date().toISOString().split('T')[0];
  const { register, handleSubmit, setValue, reset, getValues, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      registrationDate: today,
      roles: ['MEMBER'],
    },
  });
  const [calculatingCF, setCalculatingCF] = useState(false);
  const [membership, setMembership] = useState(null);
  const [loadError, setLoadError] = useState(null);
  useEffect(() => {
    if (!memberId) return;
    let active = true;
    associago.memberships.getById(memberId).then(value => {
      if (!active) return;
      setMembership(value);
      reset({ ...value.user, registrationDate: value.joinDate || today, cardNumber: value.membershipCardNumber || '', roles: (value.role || 'MEMBER').split(',') });
    }).catch(error => { if (active) setLoadError(error.message); });
    return () => { active = false; };
  }, [memberId, reset, today]);


  // Watch for payment checkbox to conditionally show payment fields
  const registerPayment = watch('registerPayment', false);

  const onSubmit = async (data) => {
    try {
      // Normalizza le tipologie selezionate in CSV. Se nessuna è spuntata
      // (caso impossibile via UI ma difensivo), usa MEMBER come default.
      const rolesArray = Array.isArray(data.roles) ? data.roles : (data.roles ? [data.roles] : []);
      const rolesCsv = rolesArray.length > 0 ? rolesArray.join(',') : 'MEMBER';

      // La data di registrazione vale come arrivo del pagamento e come
      // data di iscrizione (joinDate sulla membership).
      const registrationDate = data.registrationDate || today;

      let user;
      if (memberId) {
        if (!membership) throw new Error(t('memberForm.notLoaded'));
        user = await associago.users.update(membership.user.id, { ...membership.user, ...data });
        await associago.memberships.update(memberId, { ...membership, role: rolesCsv, membershipCardNumber: data.cardNumber, joinDate: registrationDate });
      } else {
      // Step 1: Create User (handle duplicate taxCode by finding existing)
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
        role: rolesCsv,
        status: 'ACTIVE',
        joinDate: registrationDate,
        membershipCardNumber: data.cardNumber
      });

      }

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
            date: registrationDate,
            amount: data.paymentAmount,
            type: 'INCOME',
            description: t('memberForm.feeDescription', { name: `${data.firstName} ${data.lastName}` }),
            paymentMethod: data.paymentMethod,
            userId: user.id,
          });
        } catch (paymentError) {
          console.warn('Membership created but payment registration failed', paymentError);
          alert(t('memberForm.paymentFailed'));
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating member:', error);
      alert(t('memberForm.saveFailed', { error: error.message }));
    }
  };

  const handleCalculateCF = async () => {
    const { firstName, lastName, birthDate, gender, birthPlaceCode } = getValues();

    if (!firstName || !lastName || !birthDate || !gender || !birthPlaceCode) {
      alert(t('memberForm.taxCodeMissingData'));
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
      alert(t('memberForm.taxCodeFailed', { error: error.message }));
    } finally {
      setCalculatingCF(false);
    }
  };

  if (memberId && !membership) return <div role={loadError ? 'alert' : 'status'} className={loadError ? 'alert alert-danger' : 'p-4'}>{loadError || t('Loading...')}</div>;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">{t('First Name')}</label>
          <input
            {...register('firstName', { required: t('First Name is required') })}
            className="form-control"
          />
          {errors.firstName && <span className="text-danger small">{errors.firstName.message}</span>}
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Last Name')}</label>
          <input
            {...register('lastName', { required: t('Last Name is required') })}
            className="form-control"
          />
          {errors.lastName && <span className="text-danger small">{errors.lastName.message}</span>}
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-4">
          <label className="form-label">{t('memberForm.birthDate')}</label>
          <input type="date" {...register('birthDate', { required: true })} className="form-control" />
        </div>
        <div className="col-md-4">
          <label className="form-label">{t('memberForm.gender')}</label>
          <select {...register('gender', { required: true })} className="form-select">
            <option value="">{t('Select...')}</option>
            <option value="M">{t('memberForm.male')}</option>
            <option value="F">{t('memberForm.female')}</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">{t('memberForm.birthPlaceCode')}</label>
          <input {...register('birthPlaceCode')} className="form-control" placeholder={t('memberForm.birthPlaceCodePlaceholder')} />
        </div>
      </div>

      <div className="mt-3">
        <label className="form-label">{t('Fiscal Code')}</label>
        <div className="input-group">
          <input
            {...register('taxCode', { required: t('Fiscal code is required') })}
            className="form-control"
          />
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={handleCalculateCF}
            disabled={calculatingCF}
          >
            <Calculator size={16} /> {calculatingCF ? '...' : t('memberForm.calculate')}
          </button>
        </div>
        {errors.taxCode && <span className="text-danger small">{errors.taxCode.message}</span>}
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <label className="form-label">{t('Email')}</label>
          <input type="email" {...register('email')} className="form-control" />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('Phone')}</label>
          <input type="tel" {...register('phone')} className="form-control" />
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-12">
          <label className="form-label">{t('Address')}</label>
          <input type="text" {...register('address')} className="form-control" placeholder={t('memberForm.addressPlaceholder')} />
        </div>
        <div className="col-md-8">
          <label className="form-label">{t('City')}</label>
          <input type="text" {...register('city')} className="form-control" />
        </div>
        <div className="col-md-4">
          <label className="form-label">{t('ZIP Code')}</label>
          <input type="text" {...register('zipCode')} className="form-control" />
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
            <label className="form-label">{t('memberForm.cardNumber')}</label>
            <input {...register('cardNumber')} className="form-control" />
        </div>
        <div className="col-md-6">
            <label className="form-label">
              {t('memberForm.registrationDate')}
              <span className="text-muted small ms-1">{t('memberForm.registrationDateHint')}</span>
            </label>
            <input
              type="date"
              {...register('registrationDate', { required: t('Date is required') })}
              className="form-control"
              max={today}
            />
            {errors.registrationDate && <span className="text-danger small">{errors.registrationDate.message}</span>}
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-12">
          <label className="form-label">
            {t('memberForm.roles.title')}
            <span className="text-muted small ms-1">{t('memberForm.roles.hint')}</span>
          </label>
          <div className="d-flex flex-wrap gap-3 p-2 border rounded">
            {MEMBER_ROLES.map((r) => (
              <div className="form-check" key={r.value}>
                <input
                  type="checkbox"
                  id={`role-${r.value}`}
                  value={r.value}
                  className="form-check-input"
                  {...register('roles')}
                />
                <label className="form-check-label" htmlFor={`role-${r.value}`}>
                  {t(r.labelKey)}
                </label>
              </div>
            ))}
          </div>
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
            {...register('registerPayment')} disabled={!!memberId}
        />
        <label className="form-check-label fw-bold" htmlFor="registerPayment">
            {t('memberForm.registerPayment')}
        </label>
      </div>

      {registerPayment && (
        <div className="card bg-light border-0 p-3 mb-3">
            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">{t('memberForm.amountEur')}</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('paymentAmount', { required: registerPayment })}
                        className="form-control"
                        defaultValue="20.00"
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">{t('Payment Method')}</label>
                    <select {...register('paymentMethod', { required: registerPayment })} className="form-select">
                        <option value="CASH">{t('Cash')}</option>
                        <option value="BANK_TRANSFER">{t('Bank Transfer')}</option>
                        <option value="POS">{t('memberForm.posCard')}</option>
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
          {t('Cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? t('Saving...') : t('memberForm.save')}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
