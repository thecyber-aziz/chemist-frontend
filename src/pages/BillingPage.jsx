import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Printer, User, X, Minus, Plus, Trash2, Building2, Phone, FileText, Wallet, Smartphone, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useProducts } from '../context/ProductContext';
import { orderAPI } from '../services/apiCalls';
import { formatDate } from '../utils/helpers';

const APP_FONT_STACK = "'Clash Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const BillingPage = () => {
  const { cartProducts, updateCartQuantity, removeFromCart, clearCart, orderHistory, addOrderHistoryItem } = useProducts();
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);
  const [orders, setOrders] = useState([]);

  // Fetch orders from backend on component mount
  const fetchOrders = useCallback(async () => {
    try {
      const response = await orderAPI.getAllOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Fall back to local orderHistory if backend fails
      setOrders(orderHistory);
    }
  }, [orderHistory]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const dataToFilter = orders.length > 0 ? orders : orderHistory;
    
    if (!query) return dataToFilter;

    return dataToFilter.filter((order) => {
      const customerNameMatch = order.customerName?.toLowerCase().includes(query);
      const phoneMatch = order.phoneNumber?.toLowerCase().includes(query);
      const orderIdMatch = order.orderId?.toLowerCase().includes(query);
      return customerNameMatch || phoneMatch || orderIdMatch;
    });
  }, [orders, orderHistory, searchQuery]);

  const totalAmount = useMemo(
    () => cartProducts.reduce((sum, item) => sum + Number(item.sellingPrice || 0) * Number(item.quantity || 1), 0),
    [cartProducts]
  );

  const formattedDateTime = () => {
    return new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const buildOrderCodePart = (value, length) => {
    const text = String(value || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    return text.slice(0, length).padEnd(length, 'X');
  };

  const generateOrderId = () => {
    const customerPart = buildOrderCodePart(customerName, 3);
    const productPart = buildOrderCodePart(cartProducts[0]?.medicineName || cartProducts[0]?.name || '', 2);
    const digits = String(phoneNumber || '')
      .replace(/[^0-9]/g, '');
    const phoneFirst = digits.slice(0, 2).padEnd(2, '0');
    const phoneLast = digits.slice(-1) || '0';
    const baseId = `${customerPart}${phoneFirst}${productPart}${phoneLast}`;

    let candidate = baseId;
    let suffix = 1;
    // Check both backend orders and local history
    const allOrders = [...orders, ...orderHistory];
    const existingIds = new Set(allOrders.map((order) => order.orderId));

    while (existingIds.has(candidate)) {
      candidate = `${baseId}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  };

  const handleConfirmOrder = async () => {
    if (cartProducts.length === 0) {
      toast.error('Please add items to cart before confirming order');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    const createdAt = formattedDateTime();
    const orderId = generateOrderId();
    
    const orderData = {
      orderId,
      customerName: customerName || 'Unknown Customer',
      phoneNumber: phoneNumber || '',
      description: description || '',
      paymentMethod,
      dateTime: createdAt,
      items: cartProducts.map((item) => ({
        id: item.id,
        imageUrl: item.imageUrl,
        name: item.medicineName || item.name,
        category: item.category || '',
        price: Number(item.sellingPrice || item.price || 0),
        quantity: item.quantity,
        subtotal: Number(item.sellingPrice || item.price || 0) * Number(item.quantity || 1),
        expiryDate: item.expireDate || item.expiryDate || '',
      })),
      totalAmount,
      status: 'completed',
    };

    try {
      // Save to MongoDB backend
      await orderAPI.createOrder(orderData);
      
      // Also add to local context for backward compatibility
      addOrderHistoryItem({
        ...orderData,
        id: Date.now(),
      });
      
      // Refresh orders from backend
      await fetchOrders();
      
      setCustomerName('');
      setPhoneNumber('');
      setDescription('');
      setPaymentMethod('Cash');
      clearCart();
      toast.success('Order confirmed and saved to database!');
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.error || 'Failed to save order to database');
    }
  };

  const escapeHtml = (value) =>
    String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const buildInvoiceHtml = (order, { autoPrint = true } = {}) => {
    const itemsHtml = order.items
      .map((item) => {
        const imageMarkup = item.imageUrl
          ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" class="product-image" />`
          : `<div class="product-image placeholder">No Image</div>`;

        return `
          <tr>
            <td class="whitespace-nowrap px-4 py-3 text-gray-700">
              <div class="flex items-start gap-3">
                <div class="h-12 w-12 overflow-hidden rounded-2xl bg-gray-100">
                  ${imageMarkup}
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-gray-900">${escapeHtml(item.name)}</p>
                </div>
              </div>
            </td>
            <td class="whitespace-nowrap px-3 py-2 text-gray-700">${escapeHtml(item.category || '-')}</td>
            <td class="whitespace-nowrap px-3 py-2 text-gray-700">₹${item.price.toFixed(2)}</td>
            <td class="whitespace-nowrap px-3 py-2 text-gray-700">${item.quantity}</td>
            <td class="whitespace-nowrap px-3 py-2 text-gray-700">${escapeHtml(formatDate(item.expiryDate))}</td>
            <td class="whitespace-nowrap px-3 py-2 text-gray-700">₹${item.subtotal.toFixed(2)}</td>
          </tr>`;
      })
      .join('');

    return `
      <!doctype html>
      <html>
        <head>
          <title>Invoice ${escapeHtml(order.orderId)}</title>
          <style>
            @font-face {
              font-family: 'Clash Display';
              src: url('/ClashDisplay-Regular.woff') format('woff');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            * { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; }
            body {
              padding: 24px;
              background: #f8fafc;
              color: #111827;
              font-family: ${APP_FONT_STACK};
            }
            h1, h2, h3, h4, h5, h6, .brand-name, .value, .total-amount, .section-title, .summary-value, .detail-value {
              font-family: ${APP_FONT_STACK};
            }
            .page {
              max-width: 900px;
              margin: 0 auto;
            }
            .invoice-card {
              overflow: hidden;
              border: 1px solid #e5e7eb;
              border-radius: 24px;
              background: #ffffff;
              box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
              padding: 24px;
              border-bottom: 1px solid #e5e7eb;
              background: #f9fafb;
            }
            .branding {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .logo {
              width: 40px;
              height: 40px;
              border-radius: 16px;
              background: #dbeafe;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
            }
            .brand-name {
              margin: 0;
              font-size: 15px;
              font-weight: 700;
              color: #111827;
            }
            .brand-subtitle {
              margin: 2px 0 0;
              font-size: 12px;
              color: #6b7280;
            }
            .order-meta {
              text-align: right;
            }
            .label,
            .detail-label,
            .summary-label,
            .table th {
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.18em;
              color: #111827;
            }
            .label,
            .detail-label,
            .summary-label {
              margin: 0;
            }
            .value {
              margin: 4px 0 0;
              font-size: 18px;
              font-weight: 700;
              color: #111827;
            }
            .body {
              padding: 24px;
            }
            .details-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 16px 24px;
            }
            .detail-value {
              margin: 4px 0 0;
              font-size: 14px;
              color: #111827;
            }
            .table-wrap {
              margin-top: 24px;
              overflow: hidden;
              border: 1px solid #e5e7eb;
              border-radius: 24px;
              background: #f9fafb;
              padding: 16px;
            }
            .section-title {
              margin: 0 0 12px;
              font-size: 18px;
              font-weight: 700;
              color: #111827;
            }
            .table {
              width: 100%;
              min-width: 820px;
              border-collapse: collapse;
              background: #ffffff;
            }
            .table th,
            .table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              vertical-align: top;
              text-align: left;
            }
            .table th {
              background: #ffffff;
            }
            .product-image {
              width: 48px;
              height: 48px;
              border-radius: 16px;
              object-fit: cover;
              background: #f3f4f6;
            }
            .product-image.placeholder {
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: #9ca3af;
              border: 1px solid #e5e7eb;
            }
            .summary {
              display: flex;
              justify-content: space-between;
              gap: 24px;
              margin-top: 24px;
            }
            .summary .block {
              width: 100%;
            }
            .summary-value {
              margin: 4px 0 0;
              font-size: 14px;
              color: #111827;
            }
            .total-amount {
              margin: 8px 0 0;
              font-size: 22px;
              font-weight: 700;
              color: #111827;
            }
            @media print {
              body {
                background: #ffffff;
                padding: 0;
              }
              @page {
                size: A4 landscape;
                margin: 0;
              }
              .page {
                max-width: 1120px;
                margin: 0;
              }
              .invoice-card {
                border: none;
                border-radius: 0;
                box-shadow: none;
              }
              .table-wrap {
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="invoice-card">
              <div class="header">
                <div class="branding">
                  <div class="logo" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
                      <rect x="4" y="5" width="16" height="14" rx="3" fill="#dbeafe"></rect>
                      <path d="M12 8v8M8 12h8" stroke="#1d4ed8" stroke-width="1.8" stroke-linecap="round"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="brand-name">Chemist</p>
                    <p class="brand-subtitle">Trusted Pharmacy</p>
                  </div>
                </div>
                <div class="order-meta">
                  <p class="label">Order ID</p>
                  <p class="value">${escapeHtml(order.orderId)}</p>
                </div>
              </div>

              <div class="body">
                <div class="details-grid">
                  <div>
                    <p class="detail-label">Customer Name</p>
                    <p class="detail-value">${escapeHtml(order.customerName)}</p>
                  </div>
                  <div>
                    <p class="detail-label">Phone Number</p>
                    <p class="detail-value">${escapeHtml(order.phoneNumber)}</p>
                  </div>
                  <div>
                    <p class="detail-label">Payment Method</p>
                    <p class="detail-value">${escapeHtml(order.paymentMethod === 'Cash' ? 'Cash' : 'Online / UPI')}</p>
                  </div>
                  <div>
                    <p class="detail-label">Date & Time</p>
                    <p class="detail-value">${escapeHtml(order.dateTime)}</p>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <p class="detail-label">Description</p>
                    <p class="detail-value">${escapeHtml(order.description)}</p>
                  </div>
                </div>

                <div class="table-wrap">
                  <h2 class="section-title">Items</h2>
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th class="text-right">Price</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Expiry</th>
                        <th class="text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </div>

                <div class="summary">
                  <div class="block">
                    <p class="summary-label">Description</p>
                    <p class="summary-value">${escapeHtml(order.description)}</p>
                  </div>
                  <div class="block" style="text-align: right;">
                    <p class="summary-label">Total Amount</p>
                    <p class="total-amount">₹${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          ${autoPrint ? `
          <script>
            window.onload = function() {
              window.print();
            };
            window.onafterprint = function() {
              window.close();
            };
          </script>
          ` : ''}
        </body>
      </html>`;
  };

  const downloadOrderPdf = async (order) => {
    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '1200px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-1';
    document.body.appendChild(container);

    try {
      const html = buildInvoiceHtml(order, { autoPrint: false });
      container.innerHTML = html;

      await new Promise((resolve) => requestAnimationFrame(() => resolve()));

      const invoiceElement = container.querySelector('.invoice-card') || container;
      if (!invoiceElement) {
        throw new Error('Unable to prepare invoice preview');
      }

      const images = Array.from(invoiceElement.querySelectorAll('img'));
      await Promise.all(
        images.map((image) => {
          if (image.complete) return Promise.resolve();
          return new Promise((resolve) => {
            image.onload = resolve;
            image.onerror = resolve;
          });
        })
      );

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const pdfWidth = canvas.width * ratio;
      const pdfHeight = canvas.height * ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${order.orderId}.pdf`);
    } catch (error) {
      toast.error('Failed to download the invoice PDF.');
    } finally {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };

  const printOrder = (order) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      toast.error('Unable to open the print window. Please allow popups.');
      return;
    }

    const html = buildInvoiceHtml(order);
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="w-full" style={{ fontFamily: APP_FONT_STACK }}>
      <div className="max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="mb-6 flex flex-row flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Your Order</h1>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {cartProducts.length} item{cartProducts.length === 1 ? '' : 's'}
              </span>
            </div>

            {cartProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500 sm:p-10">
                No items in cart.
              </div>
            ) : (
              <div className="space-y-4">
                {cartProducts.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white shadow-sm sm:h-16 sm:w-16">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.medicineName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">{item.medicineName}</p>
                        <p className="text-sm text-gray-700">₹{item.sellingPrice}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="rounded-l-full px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <div className="px-4 text-sm font-semibold text-gray-800">{item.quantity}</div>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="rounded-r-full px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-full bg-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <p className="text-lg font-bold text-gray-900">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">₹ {totalAmount.toFixed(2)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-black">
                  <User className="h-4 w-4" /> Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-black">
                  <Phone className="h-4 w-4" /> Phone Number
                </label>
                <input
                  type="number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-black">
                  <FileText className="h-4 w-4" /> Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Add description"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-black">Payment Method</p>
                <div className="mt-3 grid gap-3 sm:flex">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      paymentMethod === 'Cash'
                        ? 'border-blue-100 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2"><Wallet className="h-4 w-4" /> Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Online')}
                    className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      paymentMethod === 'Online'
                        ? 'border-blue-100 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2"><Smartphone className="h-4 w-4" /> Online / UPI</span>
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="mt-4 w-full rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-sky-50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-2 rounded-full bg-gradient-to-b from-blue-400 to-sky-500"></div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Order History</h2>
              </div>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Number, ID"
                className="glass-input w-full px-11 py-3 text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-medium border border-black rounded-2xl outline-none hover:outline-none focus:outline-none focus:border-black "
              />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {orders.length === 0 && orderHistory.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-blue-100 bg-blue-50/40 p-10 text-center text-slate-500">
              No order history yet.
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-blue-100 bg-blue-50/40 p-10 text-center text-slate-500">
              No matching orders found.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="min-w-[900px] w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-black">Sr</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-black">Order ID</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-black">Customer</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-black">Phone</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-black">Amount</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-black">Payment</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-black">Date</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="cursor-pointer hover:bg-slate-100"
                      onClick={() => setActiveOrder(order)}
                    >
                      <td className="whitespace-nowrap px-3 py-2 text-gray-700">{index + 1}</td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-gray-600">{order.orderId}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            <User className="h-4 w-4" />
                          </div>
                          <span>{order.customerName}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-700">{order.phoneNumber}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-700">₹{order.totalAmount.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-700">{order.paymentMethod === 'Cash' ? 'Cash' : 'Online / UPI'}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-700">{order.dateTime}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadOrderPdf(order, index);
                            }}
                            aria-label="Download invoice PDF"
                            title="Download invoice PDF"
                            className="inline-flex items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              printOrder(order);
                            }}
                            aria-label="Print invoice"
                            title="Print invoice"
                            className="inline-flex items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      </div>

      {activeOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 text-lg">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Chemist</p>
                  <p className="text-xs text-gray-500">Trusted Pharmacy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveOrder(null)}
                className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-black">Customer Name</p>
                  <p className="mt-1 text-gray-900">{activeOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-black">Phone Number</p>
                  <p className="mt-1 text-gray-900">{activeOrder.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-black">Payment Method</p>
                  <p className="mt-1 text-gray-900">{activeOrder.paymentMethod === 'Cash' ? 'Cash' : 'Online / UPI'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-black">Date & Time</p>
                  <p className="mt-1 text-gray-900">{activeOrder.dateTime}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm font-semibold uppercase tracking-widest text-black">Description</p>
                  <p className="mt-1 text-gray-900">{activeOrder.description}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <table className="min-w-[820px] w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-white">
                    <tr>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold uppercase tracking-widest text-black">Product</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold uppercase tracking-widest text-black">Category</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold uppercase tracking-widest text-black">Price</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold uppercase tracking-widest text-black">Qty</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold uppercase tracking-widest text-black">Expiry</th>
                      <th className="whitespace-nowrap px-3 py-2 text-left font-semibold uppercase tracking-widest text-black">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {activeOrder.items.map((item, idx) => (
                      <tr key={`${activeOrder.id}-${item.id}`}>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-2xl bg-gray-100">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">{item.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-700">{item.category || '-'}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-700">₹{item.price.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-700">{item.quantity}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-700">{formatDate(item.expiryDate)}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-700">₹{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white px-6 py-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Order ID</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{activeOrder.orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-500">Total Amount</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">₹{activeOrder.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BillingPage;
