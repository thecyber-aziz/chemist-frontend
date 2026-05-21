import React, { useState, useEffect, useCallback } from 'react';
import { medicineAPI } from '../services/apiCalls';
import { formatDateWithShortMonth } from '../utils/helpers';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';
import { Package, Hourglass, TrendingDown, Ban, Plus, Pill, DollarSign, Banknote, FolderOpen, CalendarDays, Upload, Tags, FileText, RotateCcw, CheckCircle2, PencilLine, Trash2 } from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    medicineName: '',
    stock: '',
    lowStock: '',
    costPrice: '',
    sellingPrice: '',
    arrivedDate: '',
    expireDate: '',
    category: '',
    batchName: '',
    description: '',
    requirePrescription: false,
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch medicines from API on mount
  const fetchMedicines = useCallback(async () => {
    try {
      const response = await medicineAPI.getAllMedicines();
      const mapped = response.data.map((med) => ({
        id: med._id,
        medicineName: med.name,
        genericName: med.genericName || '',
        manufacturer: med.manufacturer || '',
        category: med.category || '',
        description: med.description || '',
        costPrice: med.costPrice || med.price || 0,
        sellingPrice: med.price || 0,
        price: med.price || 0,
        stock: med.stockQuantity || 0,
        stockQuantity: med.stockQuantity || 0,
        lowStock: 10,
        arrivedDate: med.dateArrivedInShop || '',
        expireDate: med.expiryDate || '',
        expiryDate: med.expiryDate || '',
        batchName: med.batchNumber || '',
        batchNumber: med.batchNumber || '',
        requirePrescription: med.requiresPrescription || false,
        imageUrl: med.imageUrl || '',
      }));
      setProducts(mapped);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
      toast.error('Failed to load medicines');
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files?.[0] || null;
      if (!file) {
        setImagePreview(null);
        setFormData((prev) => ({ ...prev, imageFile: null }));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, imageFile: file }));
      };
      reader.readAsDataURL(file);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setImagePreview(null);
    setEditIndex(null);
    setFileInputKey(Date.now());
    setFormData({
      medicineName: '',
      stock: '',
      lowStock: '',
      costPrice: '',
      sellingPrice: '',
      arrivedDate: '',
      expireDate: '',
      category: '',
      batchName: '',
      description: '',
      requirePrescription: false,
      imageFile: null,
    });
  };

  const openForm = () => {
    resetForm();
    setShowForm(true);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.medicineName,
        genericName: formData.genericName || '',
        manufacturer: formData.manufacturer || '',
        category: formData.category || '',
        description: formData.description || '',
        price: parseFloat(formData.sellingPrice || 0),
        stockQuantity: parseInt(formData.stock || 0),
        expiryDate: formData.expireDate || new Date(),
        dateArrivedInShop: formData.arrivedDate || null,
        batchNumber: formData.batchName || '',
        requiresPrescription: formData.requirePrescription || false,
        imageUrl: imagePreview || '',
      };

      if (editIndex !== null) {
        // Update medicine
        const medicineId = products[editIndex].id;
        await medicineAPI.updateMedicine(medicineId, payload);
        toast.success('Medicine updated successfully!');
      } else {
        // Add new medicine
        await medicineAPI.addMedicine(payload);
        toast.success('Medicine added successfully!');
      }

      // Refresh medicines list
      await fetchMedicines();
      closeForm();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || 'Failed to save medicine');
    }
  };

  const handleEdit = (index) => {
    const medicine = products[index];
    setEditIndex(index);
    setShowForm(true);
    setImagePreview(medicine.imageUrl || null);
    setFormData({
      medicineName: medicine.medicineName,
      stock: medicine.stock,
      lowStock: medicine.lowStock,
      costPrice: medicine.costPrice,
      sellingPrice: medicine.sellingPrice,
      arrivedDate: medicine.arrivedDate,
      expireDate: medicine.expireDate,
      category: medicine.category || '',
      batchName: medicine.batchName,
      description: medicine.description,
      requirePrescription: medicine.requirePrescription,
      imageFile: null,
    });
  };

  const handleDelete = async (index) => {
    try {
      const medicine = products[index];
      if (!medicine) {
        setDeleteConfirmIndex(null);
        return;
      }

      await medicineAPI.deleteMedicine(medicine.id);
      toast.success('Medicine deleted successfully!');
      
      if (editIndex === index) {
        closeForm();
      }
      
      // Refresh medicines list
      await fetchMedicines();
      setDeleteConfirmIndex(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete medicine');
      setDeleteConfirmIndex(null);
    }
  };

  const handleDeleteRequest = (index) => {
    setDeleteConfirmIndex(index);
  };

  const isEditing = editIndex !== null;
  const requiredFieldsComplete = [
    formData.medicineName,
    formData.costPrice,
    formData.sellingPrice,
    formData.category,
    formData.arrivedDate,
    formData.expireDate,
  ].every((value) => String(value || '').trim() !== '');
  const SectionHeader = ({ title, icon: Icon, accent = 'from-blue-400 to-sky-500', wrapperClassName = '' }) => (
    <div className={`p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-sky-50 flex justify-between items-center ${wrapperClassName}`}>
      <div className="flex items-center gap-3">
        <div className={`h-8 w-2 bg-gradient-to-b ${accent} rounded-full`} />
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-5 w-5 text-blue-600" strokeWidth={1.8} /> : null}
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full relative min-h-screen">
      <div className="fixed inset-0 z-[-1] bg-white pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-8 pb-24 md:pb-8 relative">
        <div className="pt-4 pb-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-2 bg-gradient-to-b from-blue-400 to-sky-500 rounded-full"></div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Products</h1>
          </div>
          <button
            type="button"
            onClick={openForm}
            className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold shadow-sm transition-all duration-300 ${showForm ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white hover:shadow-md'}`}
          >
            <Plus className="h-5 w-5" strokeWidth={2.2} />
            Add Medicine
          </button>
        </div>

        {showForm && (
          <div className="glass-panel overflow-hidden relative rounded-2xl">
            <SectionHeader title={isEditing ? 'Edit Medicine' : 'Add Medicine'} />
            <div className="p-8 md:p-12 relative bg-gradient-to-br from-white to-slate-50">
          
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="group/input">
                <label className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-700 uppercase mb-3 ml-1"><Pill className="h-4 w-4 text-blue-600" /> Medicine Name <span className="text-rose-500">*</span></label>
                <input
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleChange}
                  type="text"
                  required
                  className="glass-input w-full px-5 py-3.5 text-slate-800 font-semibold placeholder:text-slate-400 border border-slate-200 rounded-xl hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition duration-300"
                  placeholder="Enter medicine name"
                />
              </div>
              <div className="group/input">
                <label className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-700 uppercase mb-3 ml-1"><Package className="h-4 w-4 text-blue-600" /> Stock Quantity</label>
                <input
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  type="number"
                  className="glass-input w-full px-5 py-3.5 text-slate-800 font-semibold placeholder:text-slate-400 border border-slate-200 rounded-xl hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition duration-300"
                  placeholder="0"
                />
              </div>
              <div className="group/input">
                <label className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-700 uppercase mb-3 ml-1"><TrendingDown className="h-4 w-4 text-blue-600" /> Low Stock Alert Limit</label>
                <input
                  name="lowStock"
                  value={formData.lowStock}
                  onChange={handleChange}
                  type="number"
                  className="glass-input w-full px-5 py-3.5 text-slate-800 font-semibold placeholder:text-slate-400 border border-slate-200 rounded-xl hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition duration-300"
                  placeholder="Threshold level"
                />
              </div>
              <div className="group/input relative">
                <label className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-700 uppercase mb-3 ml-1"><DollarSign className="h-4 w-4 text-blue-600" /> Cost Price <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleChange}
                    type="number"
                    required
                    className="glass-input w-full pl-10 pr-5 py-3.5 text-slate-800 font-semibold placeholder:text-slate-400 border border-slate-200 rounded-xl hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition duration-300"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="group/input relative">
                <label className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-700 uppercase mb-3 ml-1"><Banknote className="h-4 w-4 text-blue-600" /> Retail Selling Price <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    type="number"
                    required
                    className="glass-input w-full pl-10 pr-5 py-3.5 text-slate-800 font-bold text-lg placeholder:text-slate-400 border border-slate-200 rounded-xl hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition duration-300"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="group/input">
                <label className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-700 uppercase mb-3 ml-1"><FolderOpen className="h-4 w-4 text-blue-600" /> Class / Category <span className="text-rose-500">*</span></label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  type="text"
                  required
                  className="glass-input w-full px-5 py-3.5 text-slate-800 font-semibold placeholder:text-slate-400 border border-slate-200 rounded-xl hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition duration-300"
                  placeholder="Enter category"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="group/input">
                <label className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-700 uppercase mb-3 ml-1"><CalendarDays className="h-4 w-4 text-blue-600" /> Arrived Date <span className="text-rose-500">*</span></label>
                <input
                  name="arrivedDate"
                  value={formData.arrivedDate}
                  onChange={handleChange}
                  type="date"
                  required
                  className="glass-input w-full px-5 py-3.5 text-slate-800 font-semibold placeholder:text-slate-400 border border-slate-200 rounded-xl hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition duration-300"
                />
              </div>
              <div className="group/input">
                <label className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-700 uppercase mb-3 ml-1"><Hourglass className="h-4 w-4 text-blue-600" /> Expire Date <span className="text-rose-500">*</span></label>
                <input
                  name="expireDate"
                  value={formData.expireDate}
                  onChange={handleChange}
                  type="date"
                  required
                  className="glass-input w-full px-5 py-3.5 text-slate-800 font-semibold placeholder:text-slate-400 border border-slate-200 rounded-xl hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition duration-300"
                />
              </div>
              <div className="group/input">
                <label className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-700 uppercase mb-3 ml-1"><Upload className="h-4 w-4 text-blue-600" /> Upload Image</label>
                <input
                  key={fileInputKey}
                  name="imageFile"
                  onChange={handleChange}
                  type="file"
                  accept="image/*"
                  className="glass-input w-full px-5 py-3 text-slate-800 font-medium border border-slate-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-300"
                />
              </div>
              {imagePreview && (
                <div className="glass-panel p-4 border border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
                  <p className="text-xs font-bold tracking-widest text-slate-600 uppercase mb-3 ml-1">Image Preview</p>
                  <img src={imagePreview} alt="Medicine preview" className="h-40 w-full rounded-xl object-cover shadow-sm border border-slate-200" />
                </div>
              )}
              <div className="group/input">
                <label className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-700 uppercase mb-3 ml-1"><Tags className="h-4 w-4 text-blue-600" /> Batch Name</label>
                <input
                  name="batchName"
                  value={formData.batchName}
                  onChange={handleChange}
                  type="text"
                  className="glass-input w-full px-5 py-3.5 text-slate-800 font-semibold placeholder:text-slate-400 border border-slate-200 rounded-xl hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition duration-300"
                  placeholder="Batch name"
                />
              </div>
              <div className="group/input">
                <label className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-700 uppercase mb-3 ml-1"><FileText className="h-4 w-4 text-blue-600" /> Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="glass-input w-full px-5 py-3.5 text-slate-800 font-medium placeholder:text-slate-400 border border-slate-200 rounded-xl hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 resize-none transition duration-300"
                  placeholder="Add description"
                />
              </div>
            </div>
          </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-slate-200">
              {isEditing && (
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-8 py-3.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-800 transition duration-300 shadow-sm border border-slate-200"
                >
                  Cancel
                </button>
              )}
              {(isEditing || requiredFieldsComplete) && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-bold tracking-wide flex justify-center items-center gap-2 rounded-xl bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-lg">{isEditing ? <RotateCcw className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}</span>
                  <span>{isEditing ? 'Update Medicine' : 'Add Medicine'}</span>
                </button>
              )}
            </div>
            </div>
          </div>
        )}

        <div className="glass-panel overflow-hidden relative mt-8 hidden md:block">
          <SectionHeader title="Medicine Catalog" />
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Image</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Name</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Batch</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Stock</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Low Stock</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Cost</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Retail</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Arrived</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Expires</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-slate-500 font-bold">
                      No products found. Add a new medicine above.
                    </td>
                  </tr>
                ) : (
                  products.map((medicine, index) => (
                    <tr key={medicine.id} className="hover:bg-slate-100 transition-colors duration-200">
                      <td className="whitespace-nowrap px-6 py-4">
                        {medicine.imageUrl ? (
                          <img
                            src={medicine.imageUrl}
                            alt={medicine.medicineName}
                            className="h-12 w-12 rounded-xl object-cover shadow-sm border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-400 border border-blue-100">
                            <Ban className="h-4.5 w-4.5" strokeWidth={1.8} />
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500 font-bold">{medicine.medicineName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500 font-medium">{medicine.batchName || '--'}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-slate-500 font-bold text-xs">
                          {medicine.stock}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500">{medicine.lowStock}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-700 font-medium">₹{medicine.costPrice}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500 font-bold">₹{medicine.sellingPrice}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500">{formatDateWithShortMonth(medicine.arrivedDate)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500">{formatDateWithShortMonth(medicine.expireDate)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                        <div className="flex flex-nowrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(index)}
                            aria-label="Edit medicine"
                            title="Edit medicine"
                            className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 shadow-sm transition-all hover:bg-blue-100"
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(index)}
                            aria-label="Delete medicine"
                            title="Delete medicine"
                            className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600 shadow-sm transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 mt-8">
          <div className="p-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-sky-50 flex items-center gap-3 rounded-t-2xl">
            <div className="h-7 w-2 bg-gradient-to-b from-blue-400 to-sky-500 rounded-full"></div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Medicine Catalog</h3>
          </div>
          {products.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 font-semibold">
              No products found. Add a new medicine above.
            </div>
          ) : (
            <div className="px-4 pb-4 grid grid-cols-1 gap-4">
                {products.map((medicine, index) => (
                  <div
                    key={medicine.id}
                    className="glass-panel rounded-2xl p-4 border border-slate-200 bg-white hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Medicine Image */}
                    <div className="relative h-40 w-full overflow-hidden rounded-xl mb-4 border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50 shadow-sm">
                      {medicine.imageUrl ? (
                        <img
                          src={medicine.imageUrl}
                          alt={medicine.medicineName}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <Pill className="h-10 w-10" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>

                    {/* Medicine Name and Batch */}
                    <div className="mb-4">
                      <h4 className="text-lg font-black text-slate-900">{medicine.medicineName}</h4>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1.5">
                        Batch: {medicine.batchName || 'N/A'}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-2.5 mb-5 bg-gradient-to-br from-slate-50 to-blue-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">Cost Price</span>
                        <span className="text-sm font-bold text-slate-900">₹{medicine.costPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">Retail Price</span>
                        <span className="text-sm font-bold text-slate-900">₹{medicine.sellingPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">Stock</span>
                        <span className="text-sm font-semibold text-slate-700">{medicine.stock}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">Low Stock Limit</span>
                        <span className="text-sm font-semibold text-slate-700">{medicine.lowStock}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">Arrived</span>
                        <span className="text-sm font-semibold text-slate-700">
                          {formatDateWithShortMonth(medicine.arrivedDate)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">Expires</span>
                        <span className="text-sm font-semibold text-slate-700">
                          {formatDateWithShortMonth(medicine.expireDate)}
                        </span>
                      </div>
                    </div>

                    {/* Edit/Delete Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        aria-label="Edit medicine"
                        title="Edit medicine"
                        className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-100 hover:border-blue-300 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(index)}
                        aria-label="Delete medicine"
                        title="Delete medicine"
                        className="flex-1 rounded-xl bg-white border border-red-200 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

      <ConfirmDialog
        isOpen={deleteConfirmIndex !== null}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine? This action cannot be undone."
        onConfirm={() => handleDelete(deleteConfirmIndex)}
        onCancel={() => setDeleteConfirmIndex(null)}
        isDangerous={true}
        confirmLabel="Delete"
      />
      </div>
    </div>
  );
};

export default ProductsPage;
