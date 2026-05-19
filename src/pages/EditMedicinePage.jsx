import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineAPI } from '../services/apiCalls';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const EditMedicinePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    category: '',
    description: '',
    price: '',
    stockQuantity: '',
    expiryDate: '',
    dateArrivedInShop: '',
    batchNumber: '',
    requiresPrescription: false,
    imageUrl: '',
  });

  useEffect(() => {
    fetchMedicine();
  }, [id]);

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      const response = await medicineAPI.getMedicineById(id);
      const medicine = response.data;

      setFormData({
        name: medicine.name || '',
        genericName: medicine.genericName || '',
        manufacturer: medicine.manufacturer || '',
        category: medicine.category || '',
        description: medicine.description || '',
        price: medicine.price || '',
        stockQuantity: medicine.stockQuantity || '',
        expiryDate: medicine.expiryDate
          ? new Date(medicine.expiryDate).toISOString().split('T')[0]
          : '',
        dateArrivedInShop: medicine.dateArrivedInShop
          ? new Date(medicine.dateArrivedInShop).toISOString().split('T')[0]
          : '',
        batchNumber: medicine.batchNumber || '',
        requiresPrescription: medicine.requiresPrescription || false,
        imageUrl: medicine.imageUrl || '',
      });
    } catch (error) {
      console.error('Fetch medicine error:', error);
      toast.error('Failed to load medicine');
      navigate('/add-medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Medicine name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (formData.expiryDate && new Date(formData.expiryDate) < new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }
    if (formData.stockQuantity < 0) newErrors.stockQuantity = 'Stock quantity cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        expiryDate: new Date(formData.expiryDate),
        dateArrivedInShop: formData.dateArrivedInShop
          ? new Date(formData.dateArrivedInShop)
          : null,
      };

      await medicineAPI.updateMedicine(id, payload);
      toast.success('Medicine updated successfully!');
      navigate('/add-medicine');
    } catch (error) {
      console.error('Update medicine error:', error);
      toast.error(error.response?.data?.error || 'Failed to update medicine');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-8 relative">
        
        {/* Decorative elements behind content */}
        <div className="fixed top-20 right-0 w-96 h-96  opacity-40 animate-blob pointer-events-none z-[-1]"></div>
        <div className="fixed bottom-20 left-0 w-96 h-96  opacity-40 animate-blob animation-delay-2000 pointer-events-none z-[-1]"></div>

        <button
          onClick={() => navigate('/add-medicine')}
          className="group flex items-center gap-3 px-5 py-2.5 bg-white border border-black hover:bg-black hover:text-black transition-all text-sm font-extrabold tracking-widest text-black uppercase mb-2 w-fit relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <ArrowLeft strokeWidth={0.8} size={18} className="relative z-10 transition-transform group-hover:-translate-x-1" />
          <span className="relative z-10">Back to Inventory</span>
        </button>

        <div className="border border-black bg-white p-8 md:p-12 relative overflow-hidden group animate-slide-up">
          <div className="absolute top-0 left-0 w-full h-1.5"></div>
          
          <div className="flex items-center gap-4 mb-3">
             <div className="h-12 w-12 flex items-center justify-center bg-white text-2xl border border-black ">
               
             </div>
             <h1 className="text-4xl font-black tracking-tight drop-">
               Edit Medicine
             </h1>
          </div>
          <p className="text-black font-semibold mb-8 ml-16 text-lg">Modify existing product details and stock information</p>

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            {/* Basic Information Section */}
            <div className="p-6 md:p-8 bg-white border border-black hover:[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-black">
                <span className=" text-white w-10 h-10 flex items-center justify-center font-black /30">1</span>
                <h2 className="text-2xl font-extrabold text-black tracking-tight">Basic Profile</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2 md:ml-14">
                {/* Name */}
                <div className="group/input">
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2 ml-1">
                     Medicine Name <span className="text-black text-sm">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`border border-black bg-white w-full px-5 py-4 text-black font-bold ${
                      errors.name ? 'border-black focus:border-black focus:outline-none' : ''
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="text-black text-xs font-bold mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle strokeWidth={0.8} size={14} /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Generic Name */}
                <div className="group/input">
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2 ml-1">
                    Generic Content
                  </label>
                  <input
                    type="text"
                    name="genericName"
                    value={formData.genericName}
                    onChange={handleChange}
                    className="border border-black bg-white  w-full px-5 py-4 text-black font-bold placeholder:text-black "
                  />
                </div>

                {/* Manufacturer */}
                <div className="group/input">
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2 ml-1">
                    Manufacturer Brand
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="border border-black bg-white  w-full px-5 py-4 text-black font-bold placeholder:text-black "
                  />
                </div>

                {/* Category */}
                <div className="group/input">
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2 ml-1">
                    Class / Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="border border-black bg-white  w-full px-5 py-4 text-black font-bold placeholder:text-black "
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="p-6 md:p-8 bg-white border border-black hover:[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-black">
                <span className=" text-white w-10 h-10 flex items-center justify-center font-black /30">2</span>
                <h2 className="text-2xl font-extrabold text-black tracking-tight">Economics & Stock</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2 md:ml-14">
                {/* Price */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2 ml-1">
                    Retail Price <span className="text-black text-sm">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-black font-bold">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`border border-black bg-white  w-full pl-10 pr-5 py-4 text-black font-black text-lg ${
                        errors.price ? 'border-black focus:border-black focus:outline-none' : ''
                      }`}
                      required
                    />
                  </div>
                  {errors.price && (
                    <p className="text-black text-xs font-bold mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle strokeWidth={0.8} size={14} /> {errors.price}
                    </p>
                  )}
                </div>

                {/* Stock Quantity */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2 ml-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    min="0"
                    className={`border border-black bg-white  w-full px-5 py-4 text-black font-bold ${
                      errors.stockQuantity ? 'border-black focus:border-black focus:outline-none' : ''
                    }`}
                  />
                  {errors.stockQuantity && (
                    <p className="text-black text-xs font-bold mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle strokeWidth={0.8} size={14} /> {errors.stockQuantity}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2 ml-1">
                    Expiry Date <span className="text-black text-sm">*</span>
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className={`border border-black bg-white w-full px-5 py-4 text-black font-bold ${
                      errors.expiryDate ? 'border-black focus:border-black focus:outline-none' : ''
                    }`}
                    required
                  />
                  {errors.expiryDate && (
                    <p className="text-black text-xs font-bold mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle strokeWidth={0.8} size={14} /> {errors.expiryDate}
                    </p>
                  )}
                </div>

                {/* Date Arrived */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2 ml-1">
                    Date Arrived
                  </label>
                  <input
                    type="date"
                    name="dateArrivedInShop"
                    value={formData.dateArrivedInShop}
                    onChange={handleChange}
                    className="border border-black bg-white w-full px-5 py-4 text-black font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="p-6 md:p-8 bg-white border border-black hover:[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-black">
                <span className=" text-white w-10 h-10 flex items-center justify-center font-black /30">3</span>
                <h2 className="text-2xl font-extrabold text-black tracking-tight">Additional Details</h2>
              </div>
              
              <div className="space-y-6 ml-2 md:ml-14">
                {/* Batch Number */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2 ml-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    className="border border-black bg-white  w-full px-5 py-4 text-black font-bold uppercase placeholder:text-black "
                  />
                </div>

                {/* Image URL */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2 ml-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="border border-black bg-white  w-full px-5 py-4 text-black font-medium placeholder:text-black "
                  />
                </div>

                {/* Description */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-black uppercase mb-2 ml-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what this medicine is used for, dosage instructions, side effects, etc."
                    className="border border-black bg-white  w-full px-5 py-4 text-black font-medium placeholder:text-black resize-none"
                    rows="3"
                  ></textarea>
                </div>

                {/* Requires Prescription */}
                <div className="pt-4 border-t border-black">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        name="requiresPrescription"
                        checked={formData.requiresPrescription}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="w-14 h-8 bg-white peer-checked: peer-checked:peer-checked:transition-colors "></div>
                      <div className="absolute left-1 w-6 h-6 bg-white transition-transform peer-checked:translate-x-6 border border-black flex items-center justify-center">
                         {formData.requiresPrescription && <span className="text-[10px] loop-pulse text-black font-bold"></span>}
                      </div>
                    </div>
                    <div>
                      <span className="block font-extrabold text-black tracking-wide text-lg group-hover:text-black transition-colors">Requires Prescription (Rx)</span>
                      <span className="block text-xs font-bold text-black ">Strictly enforce prescription checks during checkout</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-black justify-end">
              <button
                type="button"
                onClick={() => navigate('/add-medicine')}
                className="px-8 py-4 text-black font-bold hover:bg-black hover:text-black transition border border-transparent hover:border-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="border border-black bg-white  w-full sm:w-auto px-10 py-5 text-lg font-black tracking-wide flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:[0_10px_40px_rgba(59,130,246,0.3)] transition-all"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin w-6 h-6 border-4 border-black border-t-transparent flex"></span>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl"></span>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMedicinePage;
