
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';

// Default product/service options
const DEFAULT_PRODUCTS = [
  'TruGenie',
  'TruGreen',
  'TruCollect',
  'AMC Infra',
  'PMC Real Estate',
  'Fund Raise',
];

type ProductServicesSectionProps = {
  selectedProducts: string[];
  onChange: (selectedProducts: string[]) => void;
};

export const ProductServicesSection = ({ 
  selectedProducts, 
  onChange 
}: ProductServicesSectionProps) => {
  const [products, setProducts] = useState<string[]>(DEFAULT_PRODUCTS);
  const [newProduct, setNewProduct] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const toggleProduct = (product: string) => {
    if (selectedProducts.includes(product)) {
      onChange(selectedProducts.filter(p => p !== product));
    } else {
      onChange([...selectedProducts, product]);
    }
  };
  
  const addNewProduct = () => {
    if (newProduct.trim() && !products.includes(newProduct.trim())) {
      const updatedProducts = [...products, newProduct.trim()];
      setProducts(updatedProducts);
      onChange([...selectedProducts, newProduct.trim()]);
      setNewProduct('');
      setShowAddForm(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Products & Services</CardTitle>
            <CardDescription>
              Select which products or services the client is interested in
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {products.map(product => (
            <div key={product} className="flex items-center space-x-2">
              <Checkbox 
                id={`product-${product}`} 
                checked={selectedProducts.includes(product)}
                onCheckedChange={() => toggleProduct(product)}
              />
              <Label 
                htmlFor={`product-${product}`}
                className="text-sm font-normal cursor-pointer"
              >
                {product}
              </Label>
            </div>
          ))}
        </div>
        
        {showAddForm ? (
          <div className="flex items-center gap-2 mt-3">
            <Input
              value={newProduct}
              onChange={(e) => setNewProduct(e.target.value)}
              placeholder="Enter new product/service"
              className="flex-grow"
            />
            <Button
              variant="outline" 
              size="sm"
              onClick={addNewProduct}
            >
              Add
            </Button>
            <Button
              variant="ghost" 
              size="icon"
              onClick={() => {
                setNewProduct('');
                setShowAddForm(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-1" /> Add New Product/Service
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
