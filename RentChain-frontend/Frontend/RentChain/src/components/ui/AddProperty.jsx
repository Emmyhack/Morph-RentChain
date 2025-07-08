import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContracts } from '../../hooks/useContracts';
import { PROPERTY_TYPES } from '../config/contracts';
import { Button } from "./Button";
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTranslation } from "react-i18next";

export default function AddProperty() {
  const navigate = useNavigate();
  const { addProperty } = useContracts();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '',
    propertyType: PROPERTY_TYPES.HOUSE,
    rentAmount: '',
    imageUrl: '',
    leaseAgreementUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    try {
      setLoading(true);
      const imageRef = ref(storage, `properties/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setForm(f => ({ ...f, imageUrl: url }));
    } catch {
      setError(t('failed_upload_image'));
    } finally {
      setLoading(false);
    }
  };

  const handleLeaseAgreementUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const fileRef = ref(storage, `leaseAgreements/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setForm(f => ({ ...f, leaseAgreementUrl: url }));
    } catch {
      setError(t('failed_upload_lease'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await addProperty(
        form.title,
        parseInt(form.propertyType),
        form.rentAmount,
        form.imageUrl,
        form.leaseAgreementUrl
      );
      setSuccess(t('property_added'));
      setTimeout(() => navigate('/dashboard/landlord-dashboard/my-properties'), 1200);
    } catch (err) {
      setError(t('failed_add_property'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full section-page !py-52 max-w-3xl mx-auto dark:bg-gray-900 dark:text-white dark:border-gray-800">
      <h2 className="mb-10 text-5xl font-semibold text-primary">{t('add_property')}</h2>
      <form className="bg-white p-10 rounded-xl shadow-xl flex flex-col gap-8 border border-gray-200" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-2xl font-medium">
          {t('title')}
          <input name="title" value={form.title} onChange={handleChange} className="p-4 rounded border border-gray-300 text-xl" required />
        </label>
        <label className="flex flex-col gap-2 text-2xl font-medium">
          {t('property_type')}
          <select name="propertyType" value={form.propertyType} onChange={handleChange} className="p-4 rounded border border-gray-300 text-xl">
            <option value={PROPERTY_TYPES.HOUSE}>{t('house')}</option>
            <option value={PROPERTY_TYPES.OFFICE}>{t('office')}</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-2xl font-medium">
          {t('monthly_rent')}
          <input name="rentAmount" type="number" min="1" step="0.01" value={form.rentAmount} onChange={handleChange} className="p-4 rounded border border-gray-300 text-xl" required />
        </label>
        <label className="flex flex-col gap-2 text-2xl font-medium">
          {t('property_image')}
          <input type="file" accept="image/*" onChange={handleImageUpload} className="p-2 rounded border border-gray-300 text-xl" />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="mt-4 w-full max-h-64 object-contain rounded-lg border border-gray-200" />
          )}
          {form.imageUrl && !imagePreview && (
            <img src={form.imageUrl} alt="Preview" className="mt-4 w-full max-h-64 object-contain rounded-lg border border-gray-200" />
          )}
        </label>
        <label className="flex flex-col gap-2 text-2xl font-medium">
          {t('lease_agreement')} {form.leaseAgreementUrl && <span className="text-green-600">{form.leaseAgreementUrl}</span>}
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleLeaseAgreementUpload} className="p-2 rounded border border-gray-300 text-xl" />
        </label>
        {error && <div className="text-red-500 font-semibold text-xl">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-xl">{success}</div>}
        <Button name={loading ? t('adding') : t('add_property')} type="submit" className="w-full" disabled={loading} />
      </form>
    </div>
  );
} 