import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useProducts } from '../../hooks/useProducts';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import DatePicker from 'react-datepicker'; // Correct import for react-datepicker
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '../../utils/cn';

interface PopupAd {
  title: string;
  content: string;
  productId: string;
  imageUrl?: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isEnabled: boolean;
}

const PopupManager = () => {
  const { products, loading, error } = useProducts();
  const [popupAd, setPopupAd] = useState<PopupAd>({
    title: '',
    content: '',
    productId: '',
    imageUrl: null, // Initialize imageUrl to null or undefined
    startDate: null,
    endDate: null,
    isEnabled: true
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSectionExpanded, setImageSectionExpanded] = useState<boolean>(false);

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error loading products: {error.message}</div>;
  }

  const handleProductChange = (productId: string): void => { // Added return type void
    setPopupAd({ ...popupAd, productId });
    setSelectedImage(null);
  };

  const toggleImageSection = (): void => { // Added return type void
    setImageSectionExpanded(!imageSectionExpanded);
  };

  const handleImageSelect = (imageUrl: string): void => { // Added return type void
    setSelectedImage(imageUrl);
    setPopupAd(prev => ({ ...prev, imageUrl })); // Update popupAd state with selected image
  };

  const handleDateChange = (date: Date | null, type: 'start' | 'end'): void => { // Added return type void
    if (date) {
      setPopupAd(prev => ({
        ...prev,
        [type === 'start' ? 'startDate' : 'endDate']: date
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your pop-up creation logic here
    console.log('Creating pop-up ad:', popupAd);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Pop-up Ad Manager</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="block" htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                value={popupAd.title}
                onChange={(e) => setPopupAd({ ...popupAd, title: e.target.value })}
                placeholder="Enter pop-up title"
                required
              />
            </div>

            <div>
              <Label className="block" htmlFor="content">Content</Label>
              <textarea
                id="content"
                value={popupAd.content}
                onChange={(e) => setPopupAd({ ...popupAd, content: e.target.value })}
                placeholder="Enter pop-up content"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <Label className="block" htmlFor="product">Select Product</Label>
              <Select
                id="product"
                value={popupAd.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                required
              >
                <option value="">-- Select a product --</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </Select>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Product Images</h3>
                <Button
                  variant="ghost"
                  onClick={toggleImageSection}
                  className="text-sm"
                >
                  {imageSectionExpanded ? 'Hide Images' : 'Show Images'}
                </Button>
              </div>

              {imageSectionExpanded && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products
                    .find(product => product.id === popupAd.productId)
                    ?.images?.map((imageUrl: string) => (
                      <button
                        key={imageUrl}
                        onClick={() => handleImageSelect(imageUrl)}
                        className={cn(
                          'p-2 rounded-lg',
                          selectedImage === imageUrl
                            ? 'ring-2 ring-blue-500'
                            : 'hover:bg-gray-100'
                        )}
                      >
                        <img
                          src={imageUrl}
                          alt="Product image"
                          className="w-full h-32 object-cover rounded"
                        />
                      </button>
                    ))}
                </div>
              )}

              {selectedImage && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Selected Image Preview:</span>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedImage(null)}
                      className="text-sm"
                    >
                      Remove
                    </Button>
                  </div>
                  <img
                    src={selectedImage}
                    alt="Selected image"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block">Start Date</Label>
                <DatePicker
                  selected={popupAd.startDate}
                  onChange={(date: Date | null) => handleDateChange(date, 'start')} // Type date parameter
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <Label className="block">End Date</Label>
                <DatePicker
                  selected={popupAd.endDate}
                  onChange={(date: Date | null) => handleDateChange(date, 'end')} // Type date parameter
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="mr-4">Enabled:</Label>
              <ToggleSwitch
                checked={popupAd.isEnabled}
                onChange={(enabled: boolean) => setPopupAd({ ...popupAd, isEnabled: enabled })} // Type enabled parameter
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="secondary">Cancel</Button>
            <Button type="submit">Create Pop-up</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default PopupManager;
