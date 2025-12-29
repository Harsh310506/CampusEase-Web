import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/UserContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAllReportFieldConfigs,
  createFieldConfig,
  updateFieldConfig,
  deleteFieldConfig,
  fetchCategoryWeights,
  fetchImpactWeights,
  fetchOccurrenceWeights,
  updateCategoryWeight,
  updateImpactWeight,
  updateOccurrenceWeight,
  createCategoryWeight,
  syncWeightsToMLService,
  type ReportFieldConfig,
  type CategoryWeight,
  type ImpactWeight,
  type OccurrenceWeight,
} from '@/services/reportConfigService';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  List,
  Sliders,
  Tag,
} from 'lucide-react';

const ReportConfiguration: React.FC = () => {
  const { userData } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fieldConfigs, setFieldConfigs] = useState<ReportFieldConfig[]>([]);
  const [categoryWeights, setCategoryWeights] = useState<CategoryWeight[]>([]);
  const [impactWeights, setImpactWeights] = useState<ImpactWeight[]>([]);
  const [occurrenceWeights, setOccurrenceWeights] = useState<OccurrenceWeight[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('fields');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<ReportFieldConfig | null>(null);

  const [formData, setFormData] = useState<{
    field_name: string;
    field_label: string;
    field_type: 'text' | 'number' | 'textarea' | 'select' | 'multiselect' | 'file';
    options: string[];
    is_required: boolean;
    is_active: boolean;
    display_order: number;
  }>({
    field_name: '',
    field_label: '',
    field_type: 'text',
    options: [] as string[],
    is_required: true,
    is_active: true,
    display_order: 0,
  });

  const [optionInput, setOptionInput] = useState('');

  useEffect(() => {
    if (!userData || userData.role !== 'service_head') {
      toast({
        title: 'Access Denied',
        description: 'This page is only accessible to service heads.',
        variant: 'destructive',
      });
      navigate('/Index');
    } else {
      loadAllConfigurations();
    }
  }, [userData, navigate]);

  const loadAllConfigurations = async () => {
    try {
      setLoading(true);
      const [fields, categories, impacts, occurrences] = await Promise.all([
        fetchAllReportFieldConfigs(),
        fetchCategoryWeights(),
        fetchImpactWeights(),
        fetchOccurrenceWeights(),
      ]);
      setFieldConfigs(fields);
      setCategoryWeights(categories);
      setImpactWeights(impacts);
      setOccurrenceWeights(occurrences);
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load configurations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = async () => {
    if (!formData.field_name || !formData.field_label) {
      toast({
        title: 'Validation Error',
        description: 'Field name and label are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createFieldConfig(formData);
      toast({
        title: 'Success',
        description: 'Field configuration created successfully',
      });
      resetForm();
      setCreateDialogOpen(false);
      loadAllConfigurations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create field configuration',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateField = async () => {
    if (!editingField) return;

    try {
      await updateFieldConfig(editingField.id, formData);
      toast({
        title: 'Success',
        description: 'Field configuration updated successfully',
      });
      resetForm();
      setEditingField(null);
      loadAllConfigurations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update field configuration',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteField = async (id: number) => {
    try {
      await deleteFieldConfig(id);
      toast({
        title: 'Success',
        description: 'Field configuration deleted successfully',
      });
      loadAllConfigurations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete field configuration',
        variant: 'destructive',
      });
    }
  };

  const handleReorderField = async (id: number, direction: number) => {
    try {
      const field = fieldConfigs.find(f => f.id === id);
      if (!field) return;

      const newOrder = field.display_order + direction;
      await updateFieldConfig(id, { display_order: newOrder });
      
      toast({
        title: 'Success',
        description: 'Field order updated',
      });
      loadAllConfigurations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reorder field',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFieldActive = async (field: ReportFieldConfig) => {
    try {
      await updateFieldConfig(field.id, { is_active: !field.is_active });
      toast({
        title: 'Success',
        description: `Field ${!field.is_active ? 'activated' : 'deactivated'} successfully`,
      });
      loadAllConfigurations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update field status',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateWeight = async (type: 'category' | 'impact' | 'occurrence', id: number, weight: number) => {
    try {
      if (type === 'category') {
        await updateCategoryWeight(id, weight);
      } else if (type === 'impact') {
        await updateImpactWeight(id, weight);
      } else {
        await updateOccurrenceWeight(id, weight);
      }
      
      toast({
        title: 'Success',
        description: 'Weight updated successfully',
      });
      loadAllConfigurations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update weight',
        variant: 'destructive',
      });
    }
  };

  const handleSyncToML = async () => {
    try {
      setLoading(true);
      const success = await syncWeightsToMLService();
      if (success) {
        toast({
          title: 'Success',
          description: 'Weights synchronized to ML service successfully',
        });
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync weights to ML service',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (field: ReportFieldConfig) => {
    setEditingField(field);
    setFormData({
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      options: field.options || [],
      is_required: field.is_required,
      is_active: field.is_active,
      display_order: field.display_order,
    });
  };

  const resetForm = () => {
    setFormData({
      field_name: '',
      field_label: '',
      field_type: 'text',
      options: [],
      is_required: true,
      is_active: true,
      display_order: 0,
    });
    setOptionInput('');
  };

  const addOption = () => {
    if (optionInput.trim()) {
      setFormData({
        ...formData,
        options: [...formData.options, optionInput.trim()],
      });
      setOptionInput('');
    }
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  if (!userData || userData.role !== 'service_head') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-campusteal-100 rounded-full">
                <Settings className="h-8 w-8 text-campusteal-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Report Configuration</h1>
                <p className="text-gray-600">Manage report form fields and ML weights</p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fields">
                <List className="h-4 w-4 mr-2" />
                Form Fields
              </TabsTrigger>
              <TabsTrigger value="weights">
                <Sliders className="h-4 w-4 mr-2" />
                ML Weights
              </TabsTrigger>
            </TabsList>

            {/* Form Fields Tab */}
            <TabsContent value="fields" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Report Form Fields</h2>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-campusteal-600 hover:bg-campusteal-700" onClick={resetForm}>
                      <Plus className="h-5 w-5 mr-2" />
                      Add Field
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Field</DialogTitle>
                      <DialogDescription>Add a new field to the report form</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Field Name (Internal)*</Label>
                          <Input
                            placeholder="e.g., Problem_Category"
                            value={formData.field_name}
                            onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Field Label (Display)*</Label>
                          <Input
                            placeholder="e.g., Problem Category"
                            value={formData.field_label}
                            onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Field Type</Label>
                          <Select
                            value={formData.field_type}
                            onValueChange={(value: any) => setFormData({ ...formData, field_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                              <SelectItem value="select">Select (Dropdown)</SelectItem>
                              <SelectItem value="multiselect">Multi-select</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="file">File Upload</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Display Order</Label>
                          <Input
                            type="number"
                            value={formData.display_order}
                            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      {(formData.field_type === 'select' || formData.field_type === 'multiselect') && (
                        <div>
                          <Label>Options</Label>
                          <div className="flex gap-2 mb-2">
                            <Input
                              placeholder="Add an option"
                              value={optionInput}
                              onChange={(e) => setOptionInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addOption()}
                            />
                            <Button type="button" onClick={addOption}>Add</Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.options.map((option, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {option}
                                <button onClick={() => removeOption(index)} className="ml-1 hover:text-red-600">
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_required}
                            onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                          />
                          Required Field
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          />
                          Active
                        </label>
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateField}
                          className="bg-campusteal-600 hover:bg-campusteal-700"
                        >
                          Create Field
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Fields List */}
              <div className="grid gap-4">
                {fieldConfigs
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((field, index) => (
                  <Card key={field.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReorderField(field.id, -1)}
                              disabled={index === 0}
                              className="h-5 w-5 p-0"
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReorderField(field.id, 1)}
                              disabled={index === fieldConfigs.length - 1}
                              className="h-5 w-5 p-0"
                            >
                              ↓
                            </Button>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{field.field_label}</h3>
                              <Badge variant="outline">{field.field_type}</Badge>
                              {field.is_required && <Badge>Required</Badge>}
                              {!field.is_active && <Badge variant="secondary">Inactive</Badge>}
                            </div>
                            <p className="text-sm text-gray-600">Field Name: {field.field_name}</p>
                            <p className="text-sm text-gray-600">Display Order: {field.display_order}</p>
                            {field.options && field.options.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600 mb-1">Options:</p>
                                <div className="flex flex-wrap gap-1">
                                  {field.options.map((option, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {option}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleFieldActive(field)}
                            title={field.is_active ? 'Hide field' : 'Show field'}
                          >
                            {field.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => openEditDialog(field)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Field: {field.field_label}</DialogTitle>
                                <DialogDescription>
                                  Modify field configuration and options
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>Field Label</Label>
                                  <Input
                                    placeholder="Field Label"
                                    value={formData.field_label}
                                    onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Field Type</Label>
                                    <Select
                                      value={formData.field_type}
                                      onValueChange={(value) => setFormData({ ...formData, field_type: value as any })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="textarea">Text Area</SelectItem>
                                        <SelectItem value="select">Select Dropdown</SelectItem>
                                        <SelectItem value="multiselect">Multi-Select</SelectItem>
                                        <SelectItem value="file">File Upload</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Display Order</Label>
                                    <Input
                                      type="number"
                                      value={formData.display_order}
                                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                    />
                                  </div>
                                </div>

                                {(formData.field_type === 'select' || formData.field_type === 'multiselect') && (
                                  <div>
                                    <Label>Options (Click ×to remove)</Label>
                                    <div className="flex gap-2 mb-3">
                                      <Input
                                        placeholder="Add an option"
                                        value={optionInput}
                                        onChange={(e) => setOptionInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                                      />
                                      <Button type="button" onClick={addOption}>
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md min-h-[60px]">
                                      {formData.options.length === 0 ? (
                                        <span className="text-sm text-gray-400">No options added yet</span>
                                      ) : (
                                        formData.options.map((option, index) => (
                                          <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                                            {option}
                                            <button 
                                              type="button"
                                              onClick={() => removeOption(index)} 
                                              className="hover:text-red-600 font-bold"
                                            >
                                              ×
                                            </button>
                                          </Badge>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-6">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={formData.is_required}
                                      onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                                      className="h-4 w-4"
                                    />
                                    <span className="text-sm font-medium">Required Field</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={formData.is_active}
                                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                      className="h-4 w-4"
                                    />
                                    <span className="text-sm font-medium">Active</span>
                                  </label>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                  <DialogTrigger asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogTrigger>
                                  <Button
                                    onClick={handleUpdateField}
                                    className="bg-campusteal-600 hover:bg-campusteal-700"
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Field</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure? This will remove this field from the report form.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteField(field.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ML Weights Tab */}
            <TabsContent value="weights" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">ML Model Weights</h2>
                <Button onClick={handleSyncToML} className="bg-campusteal-600 hover:bg-campusteal-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync to ML Service
                </Button>
              </div>

              {/* Category Weights */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Weights</CardTitle>
                  <CardDescription>Priority weights for problem categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryWeights.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{cat.category}</span>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            value={cat.weight}
                            onChange={(e) => handleUpdateWeight('category', cat.id, parseInt(e.target.value))}
                            className="w-20"
                            min="1"
                            max="5"
                          />
                          <Badge>{cat.weight}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Impact Weights */}
              <Card>
                <CardHeader>
                  <CardTitle>Impact Weights</CardTitle>
                  <CardDescription>Priority weights for impact scope</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {impactWeights.map((impact) => (
                      <div key={impact.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{impact.impact_scope}</span>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            value={impact.weight}
                            onChange={(e) => handleUpdateWeight('impact', impact.id, parseInt(e.target.value))}
                            className="w-20"
                            min="1"
                            max="5"
                          />
                          <Badge>{impact.weight}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Occurrence Weights */}
              <Card>
                <CardHeader>
                  <CardTitle>Occurrence Weights</CardTitle>
                  <CardDescription>Priority weights for occurrence patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {occurrenceWeights.map((occ) => (
                      <div key={occ.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{occ.occurrence_pattern}</span>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            value={occ.weight}
                            onChange={(e) => handleUpdateWeight('occurrence', occ.id, parseInt(e.target.value))}
                            className="w-20"
                            min="1"
                            max="5"
                          />
                          <Badge>{occ.weight}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportConfiguration;
