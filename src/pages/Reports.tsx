import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Flag, AlertTriangle, MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { mlService } from '@/services/mlService';
import { useUser } from '@/UserContext';
import { fetchReportFieldConfigs, type ReportFieldConfig } from '@/services/reportConfigService';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Reports = () => {
  const { toast } = useToast();
  const { user, userData } = useUser();
  const [modelStatus, setModelStatus] = useState<'unknown' | 'active' | 'error'>('unknown');
  const [isTraining, setIsTraining] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldConfigs, setFieldConfigs] = useState<ReportFieldConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Record<string, any>>({
    description: '',
    attachment: null,
  });

  const [locationType, setLocationType] = useState('');

  useEffect(() => {
    checkModelStatus();
    loadFieldConfigurations();
  }, []);

  const checkModelStatus = async () => {
    const isHealthy = await mlService.checkHealth();
    setModelStatus(isHealthy ? 'active' : 'error');
  };

  const loadFieldConfigurations = async () => {
    try {
      setLoading(true);
      const configs = await fetchReportFieldConfigs();
      setFieldConfigs(configs);
      
      // Initialize formData with all field names
      const initialData: Record<string, any> = {
        description: '',
        attachment: null,
      };
      configs.forEach(config => {
        initialData[config.field_name] = '';
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Error loading field configurations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load form configurations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'attachment' && e.target instanceof HTMLInputElement && e.target.files) {
      setFormData({
        ...formData,
        [name]: e.target.files[0] || null,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      if (name === 'Location') setLocationType(value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === 'Location') setLocationType(value);
  };

  const trainModel = async (useSynthetic = false) => {
    try {
      setIsTraining(true);
      const success = await mlService.trainModel(useSynthetic);
      if (success) {
        toast({
          title: 'Success',
          description: 'Model trained successfully',
        });
      } else {
        throw new Error('Model training failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsTraining(false);
      checkModelStatus();
    }
  };

  const updatePriorities = async () => {
    try {
      setIsUpdating(true);
      const count = await mlService.updatePriorities();
      toast({
        title: 'Success',
        description: `Updated priorities for ${count} reports`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const validateForm = () => {
    const requiredFields = fieldConfigs.filter(config => config.is_required && config.is_active);
    
    for (const field of requiredFields) {
      if (!formData[field.field_name]) {
        toast({
          title: 'Validation Error',
          description: `Please fill in the ${field.field_label} field`,
          variant: 'destructive',
        });
        return false;
      }
    }
    
    if (!formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a description',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      let imageUrl = null;
  
      if (formData.attachment) {
        const fileName = `images/${Date.now()}_${formData.attachment.name}`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('profile-pic')
          .upload(fileName, formData.attachment);
  
        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
  
        const { data: publicURLData } = supabase
          .storage
          .from('profile-pic')
          .getPublicUrl(fileName);
  
        if (!publicURLData?.publicUrl) {
          throw new Error('Failed to retrieve public URL.');
        }
  
        imageUrl = publicURLData.publicUrl;
      }
  
      const classNo = formData.class_No ? parseInt(formData.class_No, 10) : null;
      const descriptionJson = {
        text: formData.description,
      };
      
      let prediction = { priority_level: 1, priority_text: 'Medium' };
      
      // Get priority prediction from ML model if it's active
      if (modelStatus === 'active') {
        const predictionData: Record<string, any> = {
          description: formData.description,
        };
        
        // Add dynamic fields for prediction
        fieldConfigs.forEach(config => {
          if (config.is_active) {
            predictionData[config.field_name] = formData[config.field_name] || '';
          }
        });
        
        prediction = await mlService.predictPriority(predictionData);
      }

      const reportData: any = {
        description: descriptionJson,
        images: imageUrl,
        priority_level: prediction.priority_level,
        priority_text: prediction.priority_text,
        reporter_id: userData.user_id,
      };

      // Add all dynamic fields from configuration
      fieldConfigs.forEach(config => {
        if (config.is_active) {
          const value = formData[config.field_name];
          // Handle class_No specifically as it needs to be a number
          if (config.field_name === 'class_No' && value) {
            reportData[config.field_name] = parseInt(value, 10);
          } else {
            reportData[config.field_name] = value || null;
          }
        }
      });
  
      const { error: insertError } = await supabase
        .from('report')
        .insert([reportData]);
  
      if (insertError) {
        throw new Error(`Failed to insert report: ${insertError.message}`);
      }
  
      // Reset form
      const resetData: Record<string, any> = {
        description: '',
        attachment: null,
      };
      fieldConfigs.forEach(config => {
        resetData[config.field_name] = '';
      });
      setFormData(resetData);
      setLocationType('');
      toast({ title: 'Success', description: 'Report submitted successfully!' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Flag className="h-6 w-6 text-campusblue-500" />
            Report System
          </h1>
          <div className="flex gap-2">
            {modelStatus === 'error' && (
              <Alert variant="destructive" className="mb-0">
                <AlertTitle>ML Service Offline</AlertTitle>
                <AlertDescription>
                  The priority prediction service is currently unavailable.
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={() => trainModel(false)}
              disabled={isTraining || modelStatus !== 'active'}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isTraining ? 'animate-spin' : ''}`} />
              Train with Real Data
            </Button>
            <Button
              onClick={() => trainModel(true)}
              disabled={isTraining || modelStatus !== 'active'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isTraining ? 'animate-spin' : ''}`} />
              Train with Synthetic Data
            </Button>
            <Button
              onClick={updatePriorities}
              disabled={isUpdating || modelStatus !== 'active'}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
              Update Priorities
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Report</CardTitle>
                <CardDescription>Fill the form to report an issue on campus.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading form...</div>
                ) : (
                  <form onSubmit={handleSubmitReport} className="space-y-4">
                    {/* Render dynamic fields sorted by display_order */}
                    {fieldConfigs
                      .filter(config => config.is_active)
                      .sort((a, b) => a.display_order - b.display_order)
                      .map(config => (
                        <div key={config.id}>
                          <Label htmlFor={config.field_name}>
                            {config.field_label}
                            {config.is_required && <span className="text-red-500">*</span>}
                          </Label>
                          
                          {config.field_type === 'text' && (
                            <Input
                              id={config.field_name}
                              name={config.field_name}
                              value={formData[config.field_name] || ''}
                              onChange={handleChange}
                              placeholder={`Enter ${config.field_label}`}
                              required={config.is_required}
                            />
                          )}
                          
                          {config.field_type === 'number' && (
                            <Input
                              id={config.field_name}
                              name={config.field_name}
                              type="number"
                              value={formData[config.field_name] || ''}
                              onChange={handleChange}
                              placeholder={`Enter ${config.field_label}`}
                              required={config.is_required}
                            />
                          )}
                          
                          {config.field_type === 'textarea' && (
                            <Textarea
                              id={config.field_name}
                              name={config.field_name}
                              value={formData[config.field_name] || ''}
                              onChange={handleChange}
                              placeholder={`Enter ${config.field_label}`}
                              required={config.is_required}
                              rows={4}
                            />
                          )}
                          
                          {config.field_type === 'select' && config.options && (
                            <Select
                              value={formData[config.field_name] || ''}
                              onValueChange={(value) => handleSelectChange(config.field_name, value)}
                              required={config.is_required}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${config.field_label}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {config.options.map((option, idx) => (
                                  <SelectItem key={idx} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          {/* Show conditional field for class/lab number */}
                          {config.field_name === 'Location' && 
                           formData[config.field_name] && 
                           ['Class', 'Lab', 'Hall', 'Institute'].includes(formData[config.field_name]) && (
                            <div className="mt-2">
                              <Label htmlFor="class_No">{formData[config.field_name]} Number</Label>
                              <Input
                                id="class_No"
                                name="class_No"
                                value={formData.class_No || ''}
                                onChange={handleChange}
                                placeholder={`Enter ${formData[config.field_name]} Number`}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                  
                  <div>
                    <Label htmlFor="description">
                      Problem Description<span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      placeholder="Describe the issue in detail..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="attachment">Attachment (Optional)</Label>
                    <Input 
                      id="attachment"
                      type="file" 
                      name="attachment" 
                      onChange={handleChange as any} 
                      accept="image/*" 
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || loading}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                      Submit Report
                    </Button>
                  </div>
                </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Emergency Reporting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">For emergencies, contact:</p>
                <div className="bg-red-50 p-4 rounded-md border border-red-100 mb-4">
                  <p className="font-bold">Campus Security: 555-123-4567</p>
                  <p className="text-sm text-gray-600">Available 24/7</p>
                </div>
                <Button variant="destructive" className="w-full">Call Emergency Number</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-campusblue-500" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTitle>Facility Update</AlertTitle>
                  <AlertDescription>
                    Science Building west wing will be closed for maintenance on Friday.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTitle>Campus Safety</AlertTitle>
                  <AlertDescription>
                    Increased security patrols near the student parking area.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Alerts</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;