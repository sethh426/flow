'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  TextInput, 
  Select, 
  Badge, 
  Modal,
  Label,
  Textarea,
  Spinner,
  Checkbox
} from 'flowbite-react';
import {
  HiSearch,
  HiPlus,
  HiDotsVertical,
  HiPencil,
  HiTrash,
  HiEye,
  HiViewGrid,
  HiViewList,
  HiFilter,
  HiTrendingUp,
  HiTrendingDown,
  HiCheckCircle,
  HiExclamationCircle,
  HiRefresh,
  HiDownload,
  HiUpload
} from 'react-icons/hi';
import { useToast } from '@/core/providers/ToastProvider';
import { useRouter } from 'next/navigation';
import { HiShoppingBag } from 'react-icons/hi';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  affiliateLink: string;
  imageUrl: string;
  status: 'active' | 'draft' | 'archived';
  source: string;
  stockLevel?: number;
  createdAt: string;
  analytics?: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr?: number;
  };
}

export default function ProductsPageFlowbite() {
  const router = useRouter();
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { success, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    affiliateLink: '',
    imageUrl: '',
    status: 'draft' as 'active' | 'draft' | 'archived',
    stockLevel: 0,
  });

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      // Fallback to mock data for demo purposes
      console.warn('API unavailable, using mock data:', error instanceof Error ? error.message : String(error));
      setProducts([
        {
          id: '1',
          title: 'Wireless Bluetooth Headphones',
          description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
          price: 199.99,
          category: 'Electronics',
          affiliateLink: 'https://amazon.com/dp/B08N5WRWNW',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          status: 'active' as const,
          source: 'Amazon',
          stockLevel: 50,
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-15T00:00:00.000Z'
        },
        {
          id: '2',
          title: 'Organic Cotton T-Shirts',
          description: 'Comfortable organic cotton t-shirts in multiple colors',
          price: 29.99,
          category: 'Clothing',
          affiliateLink: 'https://amazon.com/dp/B07ZJZ2ZJZ',
          imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
          status: 'active' as const,
          source: 'Amazon',
          stockLevel: 100,
          createdAt: '2024-05-20T00:00:00.000Z',
          updatedAt: '2024-06-10T00:00:00.000Z'
        },
        {
          id: '3',
          title: 'Smart Fitness Tracker',
          description: 'Advanced fitness tracker with heart rate monitoring and GPS',
          price: 149.99,
          category: 'Fitness',
          affiliateLink: 'https://amazon.com/dp/B08P3J8ZJZ',
          imageUrl: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400',
          status: 'draft' as const,
          source: 'Amazon',
          stockLevel: 25,
          createdAt: '2024-07-01T00:00:00.000Z',
          updatedAt: '2024-07-01T00:00:00.000Z'
        },
        {
          id: '4',
          title: 'Stainless Steel Water Bottle',
          description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours',
          price: 34.99,
          category: 'Home & Kitchen',
          affiliateLink: 'https://amazon.com/dp/B07ZJZ2ZJZ',
          imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
          status: 'active' as const,
          source: 'Amazon',
          stockLevel: 75,
          createdAt: '2024-04-15T00:00:00.000Z',
          updatedAt: '2024-06-20T00:00:00.000Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? filteredProducts.map(p => p.id) : []);
  };

  const handleSelectOne = (productId: string, checked: boolean) => {
    setSelected(prev =>
      checked ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  // CRUD operations
  const handleCreate = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      category: '',
      affiliateLink: '',
      imageUrl: '',
      status: 'draft',
      stockLevel: 0,
    });
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      affiliateLink: product.affiliateLink,
      imageUrl: product.imageUrl,
      status: product.status,
      stockLevel: product.stockLevel || 0,
    });
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');

      success('Product deleted successfully');
      fetchProducts();
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      showError('Failed to delete product');
    }
  };

  const handleSave = async () => {
    try {
      const url = selectedProduct
        ? `/api/products/${selectedProduct.id}`
        : '/api/products';
      
      const method = selectedProduct ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save product');

      success(selectedProduct ? 'Product updated' : 'Product created');
      fetchProducts();
      setDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      showError('Failed to save product');
    }
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'failure';
      default: return 'info';
    }
  };

  const getStockBadge = (stockLevel?: number) => {
    if (!stockLevel || stockLevel === 0) return <Badge color="failure" size="sm">Out of Stock</Badge>;
    if (stockLevel <= 10) return <Badge color="warning" size="sm">Low Stock</Badge>;
    return <Badge color="success" size="sm">In Stock</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" className="fill-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your affiliate products
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/dashboard/products/create-printify')}
            className="bg-linear-to-r from-purple-600 to-blue-600"
          >
            <HiShoppingBag className="mr-2 h-5 w-5" />
            Create Product
          </Button>
          <Button 
            onClick={() => router.push('/dashboard/products/bulk-create')}
            className="bg-linear-to-r from-yellow-500 to-orange-600"
          >
            ⚡ Bulk Create
          </Button>
          <Button onClick={handleCreate} color="gray">
            <HiPlus className="mr-2 h-5 w-5" />
            Add Manual
          </Button>
          <Button color="gray" onClick={fetchProducts}>
            <HiRefresh className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <TextInput
              icon={HiSearch}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              color={viewMode === 'grid' ? 'purple' : 'gray'}
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-linear-to-r from-purple-600 to-blue-600' : ''}
            >
              <HiViewGrid className="h-5 w-5" />
            </Button>
            <Button
              color={viewMode === 'list' ? 'purple' : 'gray'}
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-linear-to-r from-purple-600 to-blue-600' : ''}
            >
              <HiViewList className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        {selected.length > 0 && (
          <Badge color="purple" size="lg">
            {selected.length} selected
          </Badge>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <Checkbox
                  checked={selected.includes(product.id)}
                  onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                  className="absolute top-2 left-2 z-10"
                />
                <img
                  src={product.imageUrl || 'https://via.placeholder.com/300'}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
                  {product.source === 'printify' && (
                    <Badge color="purple" size="sm" className="ml-2">
                      <HiShoppingBag className="mr-1" />
                      POD
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-purple-600">
                    ${product.price.toFixed(2)}
                  </span>
                  {getStockBadge(product.stockLevel)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={getStatusColor(product.status)} size="sm">
                    {product.status}
                  </Badge>
                  {product.category && (
                    <Badge color="info" size="sm">{product.category}</Badge>
                  )}
                </div>
                {product.analytics && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <HiEye className="h-4 w-4" />
                      {product.analytics.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <HiTrendingUp className="h-4 w-4" />
                      {product.analytics.clicks}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" color="gray" onClick={() => handleQuickView(product)}>
                    <HiEye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" color="gray" onClick={() => handleEdit(product)}>
                    <HiPencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" color="failure" onClick={() => handleDelete(product)}>
                    <HiTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="p-4">
                    <Checkbox
                      checked={selected.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3">Product</th>
                  <th scope="col" className="px-6 py-3">Price</th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Stock</th>
                  <th scope="col" className="px-6 py-3">Analytics</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="p-4">
                      <Checkbox
                        checked={selected.includes(product.id)}
                        onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl || 'https://via.placeholder.com/50'}
                          alt={product.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{product.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-purple-600">
                        ${product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.category && (
                        <Badge color="info" size="sm">{product.category}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={getStatusColor(product.status)} size="sm">
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{getStockBadge(product.stockLevel)}</td>
                    <td className="px-6 py-4">
                      {product.analytics && (
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <HiEye className="h-4 w-4 text-gray-500" />
                            {product.analytics.views}
                          </div>
                          <div className="flex items-center gap-2">
                            <HiTrendingUp className="h-4 w-4 text-green-500" />
                            {product.analytics.clicks}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button size="xs" color="gray" onClick={() => handleQuickView(product)}>
                          <HiEye className="h-3 w-3" />
                        </Button>
                        <Button size="xs" color="gray" onClick={() => handleEdit(product)}>
                          <HiPencil className="h-3 w-3" />
                        </Button>
                        <Button size="xs" color="failure" onClick={() => handleDelete(product)}>
                          <HiTrash className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit/Create Modal */}
      <Modal show={dialogOpen} onClose={() => setDialogOpen(false)} size="xl">
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-6 bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {selectedProduct ? 'Edit Product' : 'Add Product'}
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <TextInput
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Product title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price</Label>
                <TextInput
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Stock Level</Label>
                <TextInput
                  type="number"
                  value={formData.stockLevel}
                  onChange={(e) => setFormData({ ...formData, stockLevel: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <TextInput
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Electronics"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <TextInput
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Affiliate Link</Label>
              <TextInput
                value={formData.affiliateLink}
                onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button color="gray" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-linear-to-r from-purple-600 to-blue-600">
              Save Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} size="md">
        <div className="p-6 text-center">
          <HiExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-600" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this product?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={confirmDelete}>
              Yes, delete it
            </Button>
            <Button color="gray" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick View Modal */}
      <Modal show={quickViewOpen} onClose={() => setQuickViewOpen(false)} size="xl">
        {selectedProduct && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedProduct.imageUrl || 'https://via.placeholder.com/400'}
                  alt={selectedProduct.title}
                  className="w-full rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">{selectedProduct.title}</h2>
                <div className="flex gap-2">
                  <Badge color={getStatusColor(selectedProduct.status)}>
                    {selectedProduct.status}
                  </Badge>
                  {selectedProduct.category && (
                    <Badge color="info">{selectedProduct.category}</Badge>
                  )}
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  ${selectedProduct.price.toFixed(2)}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedProduct.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock Level:</span>
                    {getStockBadge(selectedProduct.stockLevel)}
                  </div>
                  {selectedProduct.analytics && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-semibold">{selectedProduct.analytics.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Clicks:</span>
                        <span className="font-semibold">{selectedProduct.analytics.clicks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conversions:</span>
                        <span className="font-semibold">{selectedProduct.analytics.conversions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-semibold text-green-600">
                          ${selectedProduct.analytics.revenue.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  onClick={() => window.open(selectedProduct.affiliateLink, '_blank')}
                  className="w-full bg-linear-to-r from-purple-600 to-blue-600"
                >
                  View Affiliate Link
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
