import React, { useMemo, useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { medicineAPI } from '../services/apiCalls';
import { formatDateWithShortMonth } from '../utils/helpers';
import { Package, AlertTriangle, Hourglass, TrendingDown, Ban, Search, SearchX, ChevronDown, Pill } from 'lucide-react';

const HomePage = () => {
  const { cartProducts, addToCart } = useProducts();
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch medicines from MongoDB on mount
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await medicineAPI.getAllMedicines();
        // Map MongoDB data to frontend format
        const mapped = response.data.map((med) => ({
          id: med._id,
          medicineName: med.name,
          genericName: med.genericName || '',
          manufacturer: med.manufacturer || '',
          category: med.category || '',
          description: med.description || '',
          sellingPrice: med.price || 0,
          price: med.price || 0,
          stock: med.stockQuantity || 0,
          stockQuantity: med.stockQuantity || 0,
          expireDate: med.expiryDate || '',
          expiryDate: med.expiryDate || '',
          batchName: med.batchNumber || '',
          batchNumber: med.batchNumber || '',
          requirePrescription: med.requiresPrescription || false,
          imageUrl: med.imageUrl || '',
        }));
        setMedicines(mapped);
      } catch (error) {
        console.error('Failed to fetch medicines:', error);
      }
    };

    fetchMedicines();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = medicines
      .map((medicine) => medicine.category?.trim())
      .filter(Boolean);

    return ['All', ...new Set(uniqueCategories)];
  }, [medicines]);

  const today = useMemo(() => new Date(), []);
  const filteredProducts = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const matchesSearch =
        !lowerSearch ||
        medicine.medicineName.toLowerCase().includes(lowerSearch) ||
        (medicine.batchName || '').toLowerCase().includes(lowerSearch) ||
        (medicine.description || '').toLowerCase().includes(lowerSearch) ||
        (medicine.category || '').toLowerCase().includes(lowerSearch);

      const matchesCategory =
        selectedCategory === 'All' ||
        (medicine.category || '').trim() === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [medicines, search, selectedCategory]);

  const totalMedicines = medicines.length;
  const expiredCount = medicines.filter((medicine) => medicine.expireDate && new Date(medicine.expireDate) < today).length;
  const expiringSoonCount = medicines.filter((medicine) => {
    if (!medicine.expireDate) return false;
    const expire = new Date(medicine.expireDate);
    const diffDays = (expire - today) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  }).length;
  const lowStockCount = medicines.filter((medicine) => {
    const stock = Number(medicine.stock);
    const lowStock = Number(medicine.lowStock) || 10;
    return stock > 0 && lowStock >= 0 && stock <= lowStock;
  }).length;
  const outOfStockCount = medicines.filter((medicine) => Number(medicine.stock) === 0).length;

  const StatCard = ({ Icon, title, value, iconClass, valueClass }) => (
    <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center text-center relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
      <div className="flex items-center justify-center gap-2 mb-3">
        <h2 className="text-sm font-extrabold tracking-widest text-slate-500 uppercase">{title}</h2>
        <Icon className={`h-5 w-5 transform group-hover:scale-125 transition-transform duration-500 ${iconClass}`} strokeWidth={1.8} />
      </div>
      <p className={`text-5xl font-black drop-shadow-sm transition-all duration-300 ${valueClass}`}>{value}</p>
    </div>
  );

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="pt-2 pb-1 relative">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <button
            type="button"
            onClick={() => setShowCategories((prev) => !prev)}
            className={`absolute right-0 top-0 inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm transition md:hidden ${showCategories ? 'border-black bg-black text-white' : 'border-black bg-white text-black hover:bg-slate-900 hover:text-white'}`}
          >
            <span>{showCategories ? 'Hide' : 'Show'}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className={`${showCategories ? 'grid' : 'hidden'} gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-5 md:grid`}>
            <StatCard Icon={Package} title="Total Stock" value={totalMedicines} iconClass="text-blue-600" valueClass="text-blue-700" />
            <StatCard Icon={AlertTriangle} title="Expired" value={expiredCount} iconClass="text-red-600" valueClass="text-red-700" />
            <StatCard Icon={Hourglass} title="Expiring Soon" value={expiringSoonCount} iconClass="text-orange-500" valueClass="text-orange-600" />
            <StatCard Icon={TrendingDown} title="Low Stock" value={lowStockCount} iconClass="text-rose-600" valueClass="text-rose-700" />
            <StatCard Icon={Ban} title="Out of Stock" value={outOfStockCount} iconClass="text-slate-500" valueClass="text-slate-500" />
        </div>

        <div className="flex flex-wrap gap-2 px-6 pb-4">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${selectedCategory === category ? 'border-black bg-black text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-900 hover:text-black'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Table Section */}
        <div className="glass-panel overflow-hidden">
          <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-sky-50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-2 bg-gradient-to-b from-blue-400 to-sky-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Medicine List</h3>
            </div>
            <div className="relative w-full max-w-sm">
              <label className="sr-only" htmlFor="home-page-search">
                Search medicines
              </label>
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="home-page-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, category"
                className="glass-input w-full px-11 py-3 text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-medium border border-black rounded-2xl outline-none hover:outline-none focus:outline-none focus:border-black "
              />
            </div>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-black uppercase border-b border-slate-200">Image</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-black uppercase border-b border-slate-200">Medicine Name</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-black uppercase border-b border-slate-200">Price</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-black uppercase border-b border-slate-200">Expiry Date</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-black uppercase border-b border-slate-200">Category</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-black uppercase border-b border-slate-200 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <SearchX className="h-10 w-10 mb-4 text-slate-300" strokeWidth={1.8} />
                        <p className="text-lg font-bold text-slate-400">No medicines found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => {
                    const isAdded = cartProducts.some((item) => item.id === product.id);

                    return (
                      <tr
                        key={product.id}
                        className="group cursor-default transition-all duration-300 hover:bg-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="relative h-14 w-14 overflow-hidden rounded-[1rem] border border-white shadow-sm">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.medicineName}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 text-slate-300">
                                <Pill className="h-5 w-5" strokeWidth={1.8} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-base font-extrabold text-slate-500">{product.medicineName}</div>
                          <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            {product.batchName || 'N/A'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-500">
                          ₹{product.sellingPrice}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-base font-bold text-slate-500">
                            {formatDateWithShortMonth(product.expireDate)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-base font-bold text-slate-500">
                            {product.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <button
                            type="button"
                            disabled={isAdded}
                            style={isAdded ? { backgroundColor: '#d1d5db', borderColor: '#d1d5db' } : undefined}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product.id);
                            }}
                            className="glass-button px-5 py-2 font-bold tracking-wide transition-all"
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default HomePage;
