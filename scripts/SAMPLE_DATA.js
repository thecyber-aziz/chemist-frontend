import * as fs from 'fs';

// This is a sample seed file for creating mock data
// Run with: node seed.js

const medicines = [
  {
    name: 'Aspirin 500mg',
    genericName: 'Acetylsalicylic Acid',
    manufacturer: 'Bayer',
    category: 'Painkiller',
    description: 'Pain relief and anti-inflammatory medication for mild to moderate pain',
    price: 45.99,
    stockQuantity: 150,
    expiryDate: new Date('2025-12-31'),
    dateArrivedInShop: new Date('2024-01-15'),
    batchNumber: 'BATCH001',
    requiresPrescription: false,
  },
  {
    name: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin Trihydrate',
    manufacturer: 'GSK',
    category: 'Antibiotic',
    description: 'Penicillin-type antibiotic used to treat bacterial infections',
    price: 125.50,
    stockQuantity: 200,
    expiryDate: new Date('2025-06-30'),
    dateArrivedInShop: new Date('2024-02-20'),
    batchNumber: 'BATCH002',
    requiresPrescription: true,
  },
  {
    name: 'Vitamin C 1000mg',
    genericName: 'Ascorbic Acid',
    manufacturer: 'Nature\'s Way',
    category: 'Vitamin',
    description: 'Immune system support and antioxidant supplement',
    price: 65.00,
    stockQuantity: 300,
    expiryDate: new Date('2026-03-15'),
    dateArrivedInShop: new Date('2024-03-10'),
    batchNumber: 'BATCH003',
    requiresPrescription: false,
  },
];

console.log('Sample medicine data for seeding:');
console.log(JSON.stringify(medicines, null, 2));
console.log('\nTo seed this data:');
console.log('1. POST to /api/medicines with admin JWT token');
console.log('2. Include each medicine object in request body');
