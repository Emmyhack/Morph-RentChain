import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContracts } from '../../../hooks/useContracts';
import { PROPERTY_TYPES } from '../../config/contracts';
import { Button } from "../../common/Button";
import { storage } from '../../../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditProperties() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProperty, editProperty, toggleAvailability } = useContracts();
  const [form, setForm] = useState({
    title: '',
    propertyType: PROPERTY_TYPES.HOUSE,
    rentAmount: '',
    ipfsHash: '',
    leaseAgreementUrl: '',
    isAvailable: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      setError('');
      try {
        const property = await getProperty(id);
        setForm({
          title: property.title,
          propertyType: property.propertyType,
          rentAmount: property.rentAmount,
          ipfsHash: property.ipfsHash,
          leaseAgreementUrl: property.leaseAgreementUrl || '',
          isAvailable: property.isAvailable,
        });
      } catch (err) {
        setError('Failed to load property.');
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id, getProperty]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await editProperty(id, form.title, parseInt(form.propertyType), form.rentAmount, form.ipfsHash, form.leaseAgreementUrl);
      await toggleAvailability(id, form.isAvailable);
      setSuccess('Property updated!');
      setTimeout(() => navigate('/dashboard/landlord-dashboard/properties'), 1200);
    } catch (err) {
      setError('Failed to update property.');
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
      setError('Failed to upload lease agreement to Firebase Storage.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const imageRef = ref(storage, `properties/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setForm(f => ({ ...f, ipfsHash: url }));
    } catch {
      setError('Failed to upload image to Firebase Storage.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full section-page !py-52 max-w-3xl mx-auto dark:bg-gray-900 dark:text-white dark:border-gray-800">
      <h2 className="mb-10 text-5xl font-semibold text-primary">Edit Property</h2>
      <form className="bg-white p-10 rounded-xl shadow-xl flex flex-col gap-8 border border-gray-200" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-2xl font-medium">
          Title
          <input name="title" value={form.title} onChange={handleChange} className="p-4 rounded border border-gray-300 text-xl" required />
        </label>
        <label className="flex flex-col gap-2 text-2xl font-medium">
          Property Type
          <select name="propertyType" value={form.propertyType} onChange={handleChange} className="p-4 rounded border border-gray-300 text-xl">
            <option value={PROPERTY_TYPES.HOUSE}>House</option>
            <option value={PROPERTY_TYPES.OFFICE}>Office</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-2xl font-medium">
          Monthly Rent (USDT)
          <input name="rentAmount" type="number" min="1" step="0.01" value={form.rentAmount} onChange={handleChange} className="p-4 rounded border border-gray-300 text-xl" required />
        </label>
        <label className="flex flex-col gap-2 text-2xl font-medium">
          Property Image (URL: {form.ipfsHash && <span className="text-green-600">{form.ipfsHash}</span>})
          <input type="file" accept="image/*" onChange={handleImageUpload} className="p-2 rounded border border-gray-300 text-xl" />
        </label>
        <label className="flex flex-col gap-2 text-2xl font-medium">
          Lease Agreement (PDF or Doc, URL: {form.leaseAgreementUrl && <span className="text-green-600">{form.leaseAgreementUrl}</span>})
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleLeaseAgreementUpload} className="p-2 rounded border border-gray-300 text-xl" />
        </label>
        <label className="flex items-center gap-4 text-2xl font-medium">
          <input name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={handleChange} />
          Available
        </label>
        {error && <div className="text-red-500 font-semibold text-xl">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-xl">{success}</div>}
        <Button name={loading ? 'Updating...' : 'Update Property'} type="submit" className="w-full" disabled={loading} />
      </form>
    </div>
  );
}
