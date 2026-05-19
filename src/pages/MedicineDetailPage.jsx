import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineAPI } from '../services/apiCalls';
import { formatPrice, formatDate, getExpiryStatus } from '../utils/helpers';
import ExpiryBadge from '../components/ExpiryBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Pill } from 'lucide-react';
import { toast } from 'react-toastify';

const MedicineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicine();
  }, [id]);

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      const response = await medicineAPI.getMedicineById(id);
      setMedicine(response.data);
    } catch (error) {
      console.error('Fetch medicine error:', error);
      toast.error('Failed to load medicine details');
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!medicine) return null;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-black hover:text-black mb-6 font-medium"
        >
          <ArrowLeft strokeWidth={0.8} size={20} />
          <span>Back to Catalog</span>
        </button>

        <div className="bg-white overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Image/Icon */}
              <div className="flex justify-center items-center">
                {medicine.imageUrl ? (
                  <img
                    src={medicine.imageUrl}
                    alt={medicine.name}
                    className="w-full h-64 object-cover "
                  />
                ) : (
                  <div className="w-64 h-64  flex items-center justify-center">
                    <Pill size={80} strokeWidth={0.8} className="text-black " />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold text-black mb-2">
                  {medicine.name}
                </h1>

                {medicine.genericName && (
                  <p className="text-lg text-black italic mb-4">
                    Generic: {medicine.genericName}
                  </p>
                )}

                {medicine.manufacturer && (
                  <p className="text-black mb-4">
                    <span className="font-semibold">Manufacturer:</span> {medicine.manufacturer}
                  </p>
                )}

                {medicine.category && (
                  <p className="text-black mb-4">
                    <span className="font-semibold">Category:</span>{' '}
                    <span className="bg-white text-black px-3 py-1 ">
                      {medicine.category}
                    </span>
                  </p>
                )}

                {/* Price */}
                <div className="my-6 p-4 bg-white border-2 border-black ">
                  <p className="text-black text-sm mb-2">Price</p>
                  <p className="text-3xl font-bold text-black ">
                    {formatPrice(medicine.price)}
                  </p>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <p className="text-black text-sm mb-2">Availability</p>
                  <div className="flex items-center gap-4">
                    <ExpiryBadge expiryDate={medicine.expiryDate} />
                    <span className="text-black ">
                      Expiry: <span className="font-bold">{formatDate(medicine.expiryDate)}</span>
                    </span>
                  </div>
                </div>

                {/* Stock */}
                <div className="mb-6">
                  <p className="text-black text-sm mb-2">Stock Quantity</p>
                  <p className="text-2xl font-bold text-black ">
                    {medicine.stockQuantity > 0 ? medicine.stockQuantity : 'Out of Stock'}
                  </p>
                </div>

                {/* Prescription */}
                {medicine.requiresPrescription && (
                  <div className="p-4 bg-white border border-black mb-6">
                    <p className="text-black font-semibold">
                       Requires Prescription
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {medicine.description && (
              <div className="mt-8 border-t pt-8">
                <h2 className="text-2xl font-bold text-black mb-4">About this Medicine</h2>
                <p className="text-black leading-relaxed">{medicine.description}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className="mt-8 border-t pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {medicine.dateArrivedInShop && (
                <div>
                  <p className="text-black text-sm">Date Arrived</p>
                  <p className="text-lg font-semibold text-black ">
                    {formatDate(medicine.dateArrivedInShop)}
                  </p>
                </div>
              )}
              {medicine.batchNumber && (
                <div>
                  <p className="text-black text-sm">Batch Number</p>
                  <p className="text-lg font-semibold text-black ">
                    {medicine.batchNumber}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetailPage;
