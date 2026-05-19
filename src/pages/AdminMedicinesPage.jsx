import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineAPI } from '../services/apiCalls';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import ExpiryBadge from '../components/ExpiryBadge';
import { formatDate, formatPrice } from '../utils/helpers';
import { Edit, Trash2, Plus, Search, Filter, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminMedicinesPage = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterAndSortMedicines();
  }, [medicines, searchTerm, filterCategory, sortBy]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicineAPI.getAllMedicines();
      setMedicines(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Fetch medicines error:', error);
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMedicines = () => {
    let filtered = medicines;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((m) => m.category === filterCategory);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'stock') return a.stockQuantity - b.stockQuantity;
      if (sortBy === 'expiry') return new Date(a.expiryDate) - new Date(b.expiryDate);
      return 0;
    });

    setFilteredMedicines(filtered);
  };

  const categories = [...new Set(medicines.map((m) => m.category))].filter(Boolean);

  const handleDelete = async () => {
    try {
      await medicineAPI.deleteMedicine(deleteConfirm);
      toast.success('Medicine deleted successfully');
      setDeleteConfirm(null);
      fetchMedicines();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete medicine');
    }
  };

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedicines = filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-emerald-800">Manage Medicines</h1>
            <p className="text-emerald-600 mt-2">Total: {filteredMedicines.length} medicines</p>
          </div>
          <button
            onClick={() => navigate('/admin/add')}
            className="flex items-center gap-2 rounded-lg border border-black bg-white px-4 py-2 font-bold text-black shadow-sm transition-colors hover:bg-black hover:text-white active:bg-black active:text-white focus-visible:bg-black focus-visible:text-white hover:shadow-md"
          >
            <Plus size={20} />
            <span>Add Medicine</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-emerald-50/70 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-emerald-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-emerald-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, generic name, or manufacturer..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">Category</label>
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 text-emerald-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-2">Sort By</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer appearance-none"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price">Price (Low-High)</option>
                  <option value="stock">Stock Quantity</option>
                  <option value="expiry">Expiry Date</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-emerald-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-emerald-50/70 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-100 to-emerald-200 border-b-2 border-emerald-300">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-emerald-700">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-emerald-700">
                    Generic Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-emerald-700">Category</th>
                  <th className="px-6 py-3 text-left font-semibold text-emerald-700">Price</th>
                  <th className="px-6 py-3 text-left font-semibold text-emerald-700">Stock</th>
                  <th className="px-6 py-3 text-left font-semibold text-emerald-700">Expiry</th>
                  <th className="px-6 py-3 text-center font-semibold text-emerald-700">Status</th>
                  <th className="px-6 py-3 text-center font-semibold text-emerald-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMedicines.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-emerald-500">
                      <Filter className="inline mr-2" size={20} />
                      No medicines found
                    </td>
                  </tr>
                ) : (
                  paginatedMedicines.map((medicine) => (
                    <tr key={medicine._id} className="border-b hover:bg-emerald-50">
                      <td className="px-6 py-4 font-semibold text-emerald-800">
                        {medicine.name}
                      </td>
                      <td className="px-6 py-4 text-emerald-600">{medicine.genericName}</td>
                      <td className="px-6 py-4 text-emerald-600">{medicine.category}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">
                        {formatPrice(medicine.price)}
                      </td>
                      <td className="px-6 py-4 text-emerald-600">{medicine.stockQuantity}</td>
                      <td className="px-6 py-4 text-emerald-600">
                        {formatDate(medicine.expiryDate)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ExpiryBadge expiryDate={medicine.expiryDate} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/edit/${medicine._id}`)}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition shadow-sm hover:shadow-md"
                          >
                            <Edit size={16} />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(medicine._id)}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition shadow-sm hover:shadow-md"
                          >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Delete</span>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2 bg-emerald-50/70 rounded-lg shadow-md p-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
            <span className="ml-4 text-emerald-600 font-medium">Page {currentPage} of {totalPages}</span>
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        isDangerous={true}
      />
    </div>
  );
};

export default AdminMedicinesPage;
