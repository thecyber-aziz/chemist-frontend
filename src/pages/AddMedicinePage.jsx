import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineAPI } from '../services/apiCalls';
import { toast } from 'react-toastify';
import { ArrowLeft, AlertCircle, CheckCircle, Sparkles, Check } from 'lucide-react';

const AddMedicinePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        expiryDate: new Date(formData.expiryDate),
        dateArrivedInShop: formData.dateArrivedInShop
          ? new Date(formData.dateArrivedInShop)
          : null,
      };

      await medicineAPI.addMedicine(payload);
      toast.success('Medicine added successfully!');
      navigate('/add-medicine');
    } catch (error) {
      console.error('Add medicine error:', error);
      toast.error(error.response?.data?.error || 'Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-8">
        
        {/* Decorative elements behind content */}
        <div className="fixed top-20 right-0 w-96 h-96 bg-gradient-to-l from-blue-300 to-transparent rounded-full mix-blend-multiply blur-[100px] opacity-40 animate-blob pointer-events-none z-[-1]"></div>
        <div className="fixed bottom-20 left-0 w-96 h-96 bg-gradient-to-r from-purple-300 to-transparent rounded-full mix-blend-multiply blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none z-[-1]"></div>

        <button
          onClick={() => navigate('/add-medicine')}
          className="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/60 border border-white shadow-sm hover:shadow-md hover:bg-white transition-all text-sm font-extrabold tracking-widest text-slate-500 uppercase hover:text-blue-600 mb-2 w-fit relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-50/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <ArrowLeft size={18} className="relative z-10 transition-transform group-hover:-translate-x-1" />
          <span className="relative z-10">Back to Inventory</span>
        </button>

        <div className="glass-panel p-8 md:p-12 relative overflow-hidden group border-white/80 animate-slide-up bg-white/40">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>
          
          <div className="flex items-center gap-4 mb-3">
             <div className="h-12 w-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-2xl border border-slate-100">
               <Sparkles className="h-6 w-6 text-slate-700" strokeWidth={1.8} />
             </div>
             <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight drop-shadow-sm">
               Add New Medicine
             </h1>
          </div>
          <p className="text-slate-500 font-semibold mb-8 ml-16 text-lg">Integrate a new product systematically into your database catalog</p>

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            {/* Basic Information Section */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/50 border border-white shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white">
                <span className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl w-10 h-10 flex items-center justify-center font-black shadow-md shadow-blue-500/30">1</span>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Basic Profile</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2 md:ml-14">
                {/* Name */}
                <div className="group/input">
                  <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2 ml-1">
                    Medicine Name <span className="text-rose-500 text-sm">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Aspirin 500mg"
                    className={`glass-input w-full px-5 py-4 text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium ${
                      errors.name ? 'border-rose-400 focus:border-rose-500 ring-rose-100 focus:ring-rose-200' : ''
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle size={14} /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Generic Name */}
                <div className="group/input">
                  <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2 ml-1">
                    Generic Content
                  </label>
                  <input
                    type="text"
                    name="genericName"
                    value={formData.genericName}
                    onChange={handleChange}
                    placeholder="e.g., Salicylic Acid"
                    className="glass-input w-full px-5 py-4 text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>

                {/* Manufacturer */}
                <div className="group/input">
                  <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2 ml-1">
                    Manufacturer Brand
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="e.g., Bayer Group"
                    className="glass-input w-full px-5 py-4 text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>

                {/* Category */}
                <div className="group/input">
                  <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2 ml-1">
                    Class / Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Painkiller, Antibiotic"
                    className="glass-input w-full px-5 py-4 text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/50 border border-white shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white">
                <span className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl w-10 h-10 flex items-center justify-center font-black shadow-md shadow-purple-500/30">2</span>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Economics & Stock</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-2 md:ml-14">
                {/* Price */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2 ml-1">
                    Retail Price <span className="text-rose-500 text-sm">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={`glass-input w-full pl-10 pr-5 py-4 text-slate-800 font-black text-lg placeholder:text-slate-300 placeholder:font-bold ${
                        errors.price ? 'border-rose-400 focus:border-rose-500 ring-rose-100 focus:ring-rose-200' : ''
                      }`}
                      required
                    />
                  </div>
                  {errors.price && (
                    <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle size={14} /> {errors.price}
                    </p>
                  )}
                </div>
                {/* Stock Quantity */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2 ml-1">
                    Initial Stock <span className="text-rose-500 text-sm">*</span>
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className={`glass-input w-full px-5 py-4 text-slate-800 font-bold placeholder:text-slate-300 placeholder:font-bold ${
                      errors.stockQuantity ? 'border-rose-400 focus:border-rose-500 ring-rose-100 focus:ring-rose-200' : ''
                    }`}
                    required
                  />
                  {errors.stockQuantity && (
                    <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle size={14} /> {errors.stockQuantity}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2 ml-1">
                    Expiry Date <span className="text-rose-500 text-sm">*</span>
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className={`glass-input w-full px-5 py-4 text-slate-800 font-bold placeholder:text-slate-300 placeholder:font-bold border border-slate-200 ${
                      errors.expiryDate ? 'border-rose-400 focus:border-rose-500 ring-rose-100 focus:ring-rose-200' : ''
                    }`}
                    required
                  />
                  {errors.expiryDate && (
                    <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle size={14} /> {errors.expiryDate}
                    </p>
                  )}
                </div>

                {/* Date Arrived */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2 ml-1">
                    Date Arrived
                  </label>
                  <input
                    type="date"
                    name="dateArrivedInShop"
                    value={formData.dateArrivedInShop}
                    onChange={handleChange}
                    className="glass-input w-full px-5 py-4 text-slate-800 font-bold border border-slate-200"
                  />
                </div>

                {/* Batch Number */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2 ml-1">
                    Batch / Lot Number
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    placeholder="e.g., BATCH-12345"
                    className="glass-input w-full px-5 py-4 text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-medium uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/50 border border-white shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white">
                <span className="bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-xl w-10 h-10 flex items-center justify-center font-black shadow-md shadow-teal-500/30">3</span>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Additional Details</h2>
              </div>
              
              <div className="space-y-6 ml-2 md:ml-14">
                {/* Description */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2 ml-1">
                    Medical Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter detailed description, usage, side effects, etc."
                    className="glass-input w-full px-5 py-4 text-slate-800 font-medium placeholder:text-slate-400 resize-none"
                  ></textarea>
                </div>

                {/* Image URL */}
                <div className="group/input relative">
                  <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2 ml-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="glass-input w-full px-5 py-4 text-slate-800 font-medium placeholder:text-slate-400"
                  />
                </div>

                {/* Requires Prescription */}
                <div className="pt-4 border-t border-white">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        name="requiresPrescription"
                        checked={formData.requiresPrescription}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="w-14 h-8 bg-slate-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-rose-400 peer-checked:to-orange-400 transition-colors shadow-inner"></div>
                      <div className="absolute left-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-sm border border-slate-100 flex items-center justify-center">
                         {formData.requiresPrescription && <Check className="h-3 w-3 text-rose-500" strokeWidth={3} />}
                      </div>
                    </div>
                    <div>
                      <span className="block font-extrabold text-slate-800 tracking-wide text-lg group-hover:text-rose-500 transition-colors">Requires Prescription (Rx)</span>
                      <span className="block text-xs font-bold text-slate-400">Strictly enforce prescription checks during checkout</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/50 justify-end">
              <button
                type="button"
                onClick={() => navigate('/add-medicine')}
                className="px-8 py-4 rounded-xl text-slate-500 font-bold hover:bg-white hover:text-slate-700 transition shadow-sm border border-transparent hover:border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="glass-button w-full sm:w-auto px-10 py-5 text-lg font-black tracking-wide flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_10px_40px_rgba(59,130,246,0.3)] transition-all"
              >
                {loading ? (
                  <>
                    <span className="animate-spin w-6 h-6 border-4 border-white border-t-transparent rounded-full flex"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={24} />
                    <span>Confirm & Add Medicine</span>
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

export default AddMedicinePage;
