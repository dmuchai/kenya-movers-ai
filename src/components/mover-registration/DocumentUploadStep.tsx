/**
 * Step 4: Document Upload
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RegistrationData } from '@/pages/MoverRegistration';
import { Upload, FileText, CheckCircle2, X } from 'lucide-react';

interface DocumentUploadStepProps {
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
}

interface DocumentField {
  key: keyof RegistrationData['documents'];
  label: string;
  required: boolean;
  description: string;
}

const DOCUMENT_FIELDS: DocumentField[] = [
  {
    key: 'national_id',
    label: 'National ID / Passport',
    required: true,
    description: 'Clear copy of your national ID or passport'
  },
  {
    key: 'drivers_license',
    label: "Driver's License",
    required: true,
    description: 'Valid driving license'
  },
  {
    key: 'vehicle_logbook',
    label: 'Vehicle Logbook',
    required: true,
    description: 'Vehicle registration document (logbook)'
  },
  {
    key: 'insurance_certificate',
    label: 'Insurance Certificate',
    required: true,
    description: 'Comprehensive vehicle insurance certificate'
  },
  {
    key: 'kra_pin_certificate',
    label: 'KRA PIN Certificate',
    required: false,
    description: 'Kenya Revenue Authority PIN certificate'
  },
  {
    key: 'business_permit',
    label: 'Business Permit',
    required: false,
    description: 'County business permit (if applicable)'
  },
  {
    key: 'good_conduct_certificate',
    label: 'Certificate of Good Conduct',
    required: false,
    description: 'Police clearance certificate'
  },
];

export default function DocumentUploadStep({ data, onUpdate, onNext }: DocumentUploadStepProps) {
  const handleFileChange = (key: keyof RegistrationData['documents'], file: File | null) => {
    const updatedDocuments = { ...data.documents };
    if (file) {
      updatedDocuments[key] = file;
    } else {
      delete updatedDocuments[key];
    }
    onUpdate({ documents: updatedDocuments });
  };

  const handleProfileImageChange = (file: File | null) => {
    onUpdate({ profile_image: file || undefined });
  };

  const requiredDocsUploaded = DOCUMENT_FIELDS
    .filter(field => field.required)
    .every(field => data.documents[field.key]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Upload required documents for verification. Files should be clear and readable (PDF, JPG, or PNG).
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Image */}
        <Card>
          <CardContent className="pt-6">
            <Label className="text-base mb-3 block">Profile Photo</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a professional photo to display on your profile
            </p>
            
            <FileUploadField
              file={data.profile_image}
              onFileChange={handleProfileImageChange}
              accept="image/*"
              label="Choose Photo"
            />
          </CardContent>
        </Card>

        {/* Documents */}
        <div className="space-y-4">
          {DOCUMENT_FIELDS.map((field) => (
            <Card key={field.key}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-base flex items-center gap-2">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {field.description}
                    </p>
                  </div>
                  
                  <FileUploadField
                    file={data.documents[field.key] as File}
                    onFileChange={(file) => handleFileChange(field.key, file)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    label="Upload"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!requiredDocsUploaded && (
          <p className="text-sm text-destructive">
            Please upload all required documents (marked with *)
          </p>
        )}

        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            <strong>Important:</strong> All documents will be securely stored and reviewed by our verification team. 
            Make sure all documents are clear, valid, and up-to-date.
          </p>
        </div>
      </div>
    </div>
  );
}

// File Upload Field Component
interface FileUploadFieldProps {
  file: File | null | undefined;
  onFileChange: (file: File | null) => void;
  accept: string;
  label: string;
}

function FileUploadField({ file, onFileChange, accept, label }: FileUploadFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
    // Reset the input so selecting the same file again will fire onChange
    e.target.value = '';
  };

  const handleRemove = () => {
    onFileChange(null);
  };

  return (
    <div className="flex items-center gap-2">
      {file ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-900 dark:text-green-100 max-w-[150px] truncate">
            {file.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Label htmlFor={`file-${label}`} className="cursor-pointer">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Upload className="h-4 w-4" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <Input
            id={`file-${label}`}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </Label>
      )}
    </div>
  );
}
