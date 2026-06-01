import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { medicineAPI } from '../services/apiCalls';
import { formatDateWithShortMonth } from '../utils/helpers';
import { Package, AlertTriangle, Hourglass, TrendingDown, Ban, Search, SearchX, ChevronDown, Pill, LogOut, Eye, EyeOff } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  const StatCard = ({ Icon, title, value, iconClass, valueClass }) => {
    const bgGradient = iconClass.includes('blue') ? 'from-blue-50 to-blue-100' : 
                       iconClass.includes('red') ? 'from-red-50 to-red-100' : 
                       iconClass.includes('orange') ? 'from-orange-50 to-orange-100' : 
                       iconClass.includes('rose') ? 'from-rose-50 to-rose-100' : 
                       'from-slate-50 to-slate-100';
    
    return (
      <div className={`glass-panel rounded-2xl p-6 flex flex-col justify-center text-center relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 bg-gradient-to-br ${bgGradient} border border-slate-200 shadow-sm hover:shadow-md`}>
        <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{backgroundColor: '#3b82f6'}}></div>
        <div className="flex items-center justify-center gap-2 mb-3 relative z-10">
          <Icon className={`h-6 w-6 transform group-hover:scale-110 transition-transform duration-500 ${iconClass}`} strokeWidth={1.8} />
          <h2 className="text-xs font-bold tracking-widest text-slate-600 uppercase">{title}</h2>
        </div>
        <p className={`text-4xl md:text-5xl font-black drop-shadow-sm transition-all duration-300 ${valueClass}`}>{value}</p>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="pt-4 pb-2 relative">
        {/* Mobile Header - Profile Avatar + Logout */}
        <div className="md:hidden flex items-center justify-between mb-6 px-4">
          {/* User Profile Avatar */}
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="h-12 w-12 rounded-full border-2 border-blue-500 shadow-md object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center border-2 border-white shadow-md">
                <span className="text-white font-bold text-lg">
                  {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <p className="text-sm font-bold text-slate-900">
                {user?.displayName || user?.email || 'User'}
              </p>
              <p className="text-xs text-slate-500">Welcome back</p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="flex items-center gap-2">
            {/* Eye Icon - Toggle Show/Hide */}
            <button
              type="button"
              onClick={() => setShowCategories((prev) => !prev)}
              className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all duration-300"
              title={showCategories ? 'Hide stats' : 'Show stats'}
            >
              {showCategories ? (
                <Eye className="h-5 w-5 text-blue-600" strokeWidth={2} />
              ) : (
                <EyeOff className="h-5 w-5 text-blue-400" strokeWidth={2} />
              )}
            </button>

            {/* Logout Icon Button */}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-all duration-300"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-red-600" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Dashboard Heading - Desktop Only */}
        <div className="hidden md:flex items-center gap-3 mb-1">
          <div className="h-8 w-2 bg-gradient-to-b from-blue-400 to-sky-500 rounded-full"></div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <button
            type="button"
            onClick={() => setShowCategories((prev) => !prev)}
            className={`absolute right-0 top-0 inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${showCategories ? 'border-black bg-black text-white' : 'border-black bg-white text-black hover:bg-slate-900 hover:text-white'}`}
          >
            <span>{showCategories ? 'Hide' : 'Show'}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`} />
          </button>
        </div>
        </div>

        {/* Stats Grid */}
        <div className={`${showCategories ? 'grid' : 'hidden'} gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-5 md:grid`}>
            <StatCard Icon={Package} title="Total Stock" value={totalMedicines} iconClass="text-blue-600" valueClass="text-blue-700" />
            <StatCard Icon={AlertTriangle} title="Expired" value={expiredCount} iconClass="text-red-600" valueClass="text-red-700" />
            <StatCard Icon={Hourglass} title="Expiring Soon" value={expiringSoonCount} iconClass="text-orange-500" valueClass="text-orange-600" />
            <StatCard Icon={TrendingDown} title="Low Stock" value={lowStockCount} iconClass="text-rose-600" valueClass="text-rose-700" />
            <StatCard Icon={Ban} title="Out of Stock" value={outOfStockCount} iconClass="text-slate-500" valueClass="text-slate-500" />
        </div>

        {/* Search Section */}
        <div className="px-6">
          <div className="relative w-full">
            <label className="sr-only" htmlFor="home-page-search">
              Search medicines
            </label>
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="home-page-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by medicine name, category..."
              className="glass-input w-full pl-14 pr-5 py-4 text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-medium border border-slate-200 rounded-2xl outline-none hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition duration-300"
            />
          </div>
        </div>

        <div className="px-6">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">Shop by Category</h2>
        </div>

        <div className="flex flex-wrap gap-2 px-6 pb-4">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition duration-300 ${selectedCategory === category ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900 hover:shadow-md'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Table Section - Desktop */}
        <div className="hidden md:block glass-panel overflow-hidden">
          <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-sky-50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-2 bg-gradient-to-b from-blue-400 to-sky-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Medicine List</h3>
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

        {/* Card View - Mobile */}
        <div className="md:hidden space-y-4">
          <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-sky-50 flex items-center gap-3 rounded-t-2xl">
            <div className="h-6 w-2 bg-gradient-to-b from-blue-400 to-sky-500 rounded-full"></div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Medicine List</h3>
          </div>
          {filteredProducts.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="flex flex-col items-center justify-center">
                <SearchX className="h-10 w-10 mb-4 text-slate-300" strokeWidth={1.8} />
                <p className="text-lg font-bold text-slate-400">No medicines found matching your criteria</p>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4 grid grid-cols-1 gap-4">
              {filteredProducts.map((product) => {
                const isAdded = cartProducts.some((item) => item.id === product.id);

                return (
                  <div
                    key={product.id}
                    className="glass-panel rounded-2xl p-4 border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Medicine Image */}
                    <div className="relative h-32 w-full overflow-hidden rounded-xl mb-4 border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.medicineName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <Pill className="h-8 w-8" strokeWidth={1.8} />
                        </div>
                      )}
                    </div>

                    {/* Medicine Name and Batch */}
                    <div className="mb-3">
                      <h4 className="text-lg font-black text-slate-800">{product.medicineName}</h4>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">
                        Batch: {product.batchName || 'N/A'}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Price</span>
                        <span className="text-xl font-black text-slate-800">₹{product.sellingPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Category</span>
                        <span className="text-sm font-semibold text-slate-600">{product.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Expiry Date</span>
                        <span className="text-sm font-semibold text-slate-600">
                          {formatDateWithShortMonth(product.expireDate)}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      disabled={isAdded}
                      style={isAdded ? { backgroundColor: '#d1d5db', borderColor: '#d1d5db' } : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id);
                      }}
                      className="w-full glass-button px-4 py-3 font-bold tracking-wide transition-all rounded-xl"
                    >
                      {isAdded ? 'Added' : 'Add to Cart'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default HomePage;
