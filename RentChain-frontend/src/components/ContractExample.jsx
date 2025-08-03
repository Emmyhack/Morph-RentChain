import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useTranslation } from 'react-i18next';
import { Button } from './common/Button';
import { IoArrowBackSharp, IoImageOutline, IoTrashOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const PropertyForm = () => {
  const { account, isConnected, userRole } = useWeb3();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    type: 'apartment',
    price: '',
    location: '',
    address: '',
    bedrooms: 1,
    bathrooms: 1,
    sqft: '',
    description: '',
    amenities: [],
    leaseTerms: '12 months minimum',
    petPolicy: 'No pets allowed',
    utilities: '',
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  // Available amenities
  const availableAmenities = [
    'Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Garage', 
    'Fireplace', 'AC', 'Heating', 'Laundry', 'Storage', 
    'Security', 'Elevator', 'Pets Allowed', 'Furnished'
  ];

  const propertyTypes = [
    { value: 'apartment', label: t('apartment') || 'Apartment' },
    { value: 'house', label: t('house') || 'House' },
    { value: 'condo', label: t('condo') || 'Condo' },
    { value: 'townhouse', label: t('townhouse') || 'Townhouse' },
    { value: 'studio', label: t('studio') || 'Studio' },
    { value: 'loft', label: t('loft') || 'Loft' },
    { value: 'villa', label: t('villa') || 'Villa' },
    { value: 'penthouse', label: t('penthouse') || 'Penthouse' },
    { value: 'office', label: t('office') || 'Office' },
    { value: 'warehouse', label: t('warehouse') || 'Warehouse' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      setError(t('max_images_error') || 'Maximum 5 images allowed');
      return;
    }

    // Create preview URLs
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setImageFiles(prev => [...prev, ...newImages]);
    setError('');
  };

  const removeImage = (imageId) => {
    setImageFiles(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title || !formData.price || !formData.location || !formData.address) {
        throw new Error(t('fill_required_fields') || 'Please fill in all required fields');
      }

      // Simulate property creation
      const propertyData = {
        ...formData,
        id: Date.now(),
        landlord: account,
        landlordName: 'Current User',
        available: true,
        dateAvailable: new Date().toISOString().split('T')[0],
        images: imageFiles.map((img, index) => `/images/property_${Date.now()}_${index}.jpg`)
      };

      console.log('Creating property:', propertyData);

      // Mock successful creation
      setTimeout(() => {
        setSuccess(t('property_created_success') || 'Property created successfully!');
        setLoading(false);
        
        // Reset form after success
        setTimeout(() => {
          setFormData({
            title: '',
            type: 'apartment',
            price: '',
            location: '',
            address: '',
            bedrooms: 1,
            bathrooms: 1,
            sqft: '',
            description: '',
            amenities: [],
            leaseTerms: '12 months minimum',
            petPolicy: 'No pets allowed',
            utilities: '',
            images: []
          });
          setImageFiles([]);
          setSuccess('');
        }, 3000);
      }, 2000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      imageFiles.forEach(img => {
        URL.revokeObjectURL(img.preview);
      });
    };
  }, []);

  if (!isConnected) {
    return (
      <div className="w-full section-page !py-52">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6">{t('connect_wallet_required') || 'Wallet Connection Required'}</h2>
          <p className="text-2xl text-gray-600 mb-8">{t('connect_wallet_to_add_property') || 'Please connect your wallet to add a property'}</p>
          <Button 
            name={t('connect_wallet') || 'Connect Wallet'} 
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full section-page !py-52">
      <div className="relative w-full pt-20">
        <div
          onClick={() => navigate(-1)}
          className="absolute top-0 left-0 flex items-center cursor-pointer gap-x-6 hover:scale-95 hover:text-primary"
        >
          <IoArrowBackSharp className="text-4xl" />
          <span className="text-3xl font-medium">{t('back') || 'Back'}</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6">{t('add_new_property') || 'Add New Property'}</h1>
            <p className="text-2xl text-gray-600">{t('fill_property_details') || 'Fill in the details to list your property'}</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-lg text-blue-800">
                {t('connected_as') || 'Connected as'}: <span className="font-mono font-semibold">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-gray-800 border-b-2 border-blue-100 pb-3">
                {t('basic_information') || 'Basic Information'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-2">
                    {t('property_title') || 'Property Title'} *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder={t('enter_property_title') || 'Enter property title'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-2">
                    {t('property_type') || 'Property Type'} *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors"
                    required
                  >
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-2">
                    {t('monthly_rent') || 'Monthly Rent (USD)'} *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-2">
                    {t('square_feet') || 'Square Feet'}
                  </label>
                  <input
                    type="number"
                    name="sqft"
                    value={formData.sqft}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-2">
                    {t('location') || 'Location'} *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder={t('enter_location') || 'Enter location'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-2">
                    {t('full_address') || 'Full Address'} *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder={t('enter_full_address') || 'Enter full address'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-2">
                    {t('bedrooms') || 'Bedrooms'}
                  </label>
                  <select
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 0 ? 'Studio' : num === 1 ? 'Bedroom' : 'Bedrooms'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-2">
                    {t('bathrooms') || 'Bathrooms'}
                  </label>
                  <select
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {[1, 1.5, 2, 2.5, 3, 3.5, 4, 5].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Bathroom' : 'Bathrooms'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-gray-800 border-b-2 border-blue-100 pb-3">
                {t('description') || 'Description'}
              </h2>
              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors resize-vertical"
                  placeholder={t('describe_property') || 'Describe your property in detail...'}
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-gray-800 border-b-2 border-blue-100 pb-3">
                {t('amenities') || 'Amenities'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {availableAmenities.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-5 h-5 text-blue-600 form-checkbox"
                    />
                    <span className="text-lg">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images Upload */}
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-gray-800 border-b-2 border-blue-100 pb-3">
                {t('property_images') || 'Property Images'}
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <IoImageOutline className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 mb-4">{t('upload_images_instruction') || 'Upload up to 5 images of your property'}</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block px-6 py-3 bg-blue-500 text-white rounded-xl cursor-pointer hover:bg-blue-600 transition-colors text-lg font-medium"
                >
                  {t('select_images') || 'Select Images'}
                </label>
              </div>

              {/* Image Previews */}
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imageFiles.map(image => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.preview}
                        alt="Property preview"
                        className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-gray-800 border-b-2 border-blue-100 pb-3">
                {t('additional_details') || 'Additional Details'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-2">
                    {t('lease_terms') || 'Lease Terms'}
                  </label>
                  <select
                    name="leaseTerms"
                    value={formData.leaseTerms}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="6 months minimum">6 months minimum</option>
                    <option value="12 months minimum">12 months minimum</option>
                    <option value="24 months minimum">24 months minimum</option>
                    <option value="36 months minimum">36 months minimum</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xl font-medium text-gray-700 mb-2">
                    {t('pet_policy') || 'Pet Policy'}
                  </label>
                  <select
                    name="petPolicy"
                    value={formData.petPolicy}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="No pets allowed">No pets allowed</option>
                    <option value="Cats allowed">Cats allowed</option>
                    <option value="Small pets allowed">Small pets allowed</option>
                    <option value="Pets allowed with deposit">Pets allowed with deposit</option>
                    <option value="All pets welcome">All pets welcome</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xl font-medium text-gray-700 mb-2">
                  {t('utilities_included') || 'Utilities Included'}
                </label>
                <input
                  type="text"
                  name="utilities"
                  value={formData.utilities}
                  onChange={handleInputChange}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder={t('utilities_placeholder') || 'e.g., Water and trash included, All utilities included, None included'}
                />
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="p-4 bg-red-100 border-2 border-red-300 rounded-xl">
                <p className="text-red-700 text-xl font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-100 border-2 border-green-300 rounded-xl">
                <p className="text-green-700 text-xl font-medium">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                name={loading ? (t('creating_property') || 'Creating Property...') : (t('create_property') || 'Create Property')}
                disabled={loading}
                className="w-full h-16 text-2xl font-semibold"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm; 