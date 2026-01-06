import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MetalItem, MetalType, MetalForm, WeightUnit } from '@/types/metals';

interface AddMetalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (metal: Omit<MetalItem, 'id'>) => void;
  initialData?: Partial<MetalItem>;
}

const AddMetalDialog: React.FC<AddMetalDialogProps> = ({ isOpen, onClose, onAdd, initialData }) => {
  const [formData, setFormData] = useState({
    type: '' as MetalType,
    form: '' as MetalForm,
    weight: '',
    weightUnit: 'oz' as WeightUnit,
    purity: '',
    quantity: '1',
    purchasePrice: '',
    purchaseTax: '',
    purchaseDate: '',
    description: ''
  });

  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        type: initialData.type || '' as MetalType,
        form: initialData.form || '' as MetalForm,
        weight: initialData.weight !== undefined ? String(initialData.weight) : '',
        weightUnit: initialData.weightUnit || 'oz',
        purity: initialData.purity !== undefined ? String(initialData.purity) : '',
        quantity: initialData.quantity !== undefined ? String(initialData.quantity) : '1',
        purchasePrice: initialData.purchasePrice !== undefined ? String(initialData.purchasePrice) : '',
        purchaseTax: initialData.purchaseTax !== undefined ? String(initialData.purchaseTax) : '',
        purchaseDate: initialData.purchaseDate || '',
        description: initialData.description || ''
      });
    } else if (isOpen && !initialData) {
      setFormData({
        type: '' as MetalType,
        form: '' as MetalForm,
        weight: '',
        weightUnit: 'oz',
        purity: '',
        quantity: '1',
        purchasePrice: '',
        purchaseTax: '',
        purchaseDate: '',
        description: ''
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const metal: Omit<MetalItem, 'id'> = {
      type: formData.type,
      form: formData.form,
      weight: parseFloat(formData.weight),
      weightUnit: formData.weightUnit,
      purity: parseFloat(formData.purity),
      quantity: parseInt(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice),
      purchaseTax: parseFloat(formData.purchaseTax) || 0,
      purchaseDate: formData.purchaseDate,
      description: formData.description
    };

    onAdd(metal);
    setFormData({
      type: '' as MetalType,
      form: '' as MetalForm,
      weight: '',
      weightUnit: 'oz',
      purity: '',
      quantity: '1',
      purchasePrice: '',
      purchaseTax: '',
      purchaseDate: '',
      description: ''
    });
    onClose();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Precious Metal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Metal Type</Label>
              <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select metal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="palladium">Palladium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="form">Form</Label>
              <Select value={formData.form} onValueChange={(value) => updateFormData('form', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coin">Coin</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="jewelry">Jewelry</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                step="0.001"
                value={formData.weight}
                onChange={(e) => updateFormData('weight', e.target.value)}
                placeholder="Enter weight"
                required
              />
            </div>

            <div>
              <Label htmlFor="weightUnit">Unit</Label>
              <Select value={formData.weightUnit} onValueChange={(value) => updateFormData('weightUnit', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oz">Troy Ounces</SelectItem>
                  <SelectItem value="g">Grams</SelectItem>
                  <SelectItem value="kg">Kilograms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purity">Purity</Label>
              <Select value={formData.purity} onValueChange={(value) => updateFormData('purity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.9999">99.99%</SelectItem>
                  <SelectItem value="0.999">99.9%</SelectItem>
                  <SelectItem value="0.995">99.5%</SelectItem>
                  <SelectItem value="0.99">99%</SelectItem>
                  <SelectItem value="0.925">92.5% (Sterling)</SelectItem>
                  <SelectItem value="0.9">90%</SelectItem>
                  <SelectItem value="0.875">87.5%</SelectItem>
                  <SelectItem value="0.833">83.3%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => updateFormData('quantity', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchasePrice">Purchase Price (per unit)</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => updateFormData('purchasePrice', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => updateFormData('purchaseDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="purchaseTax">Tax Paid (Optional)</Label>
            <Input
              id="purchaseTax"
              type="number"
              step="0.01"
              min="0"
              value={formData.purchaseTax}
              onChange={(e) => updateFormData('purchaseTax', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="e.g., American Gold Eagle 1oz"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={!formData.type || !formData.form || !formData.weight || !formData.purity || !formData.purchasePrice || !formData.purchaseDate}
            >
              Add Metal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMetalDialog;
