import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { UploadButton } from "@/utils/uploadthing";
import { ResourceType } from '@prisma/client';

interface Resource {
  id?: number;
  title: string;
  type: ResourceType;
  url: string;
  description?: string;
}

interface ResourceManagerProps {
  courseId?: string;
  initialResources?: Resource[];
  onResourcesChange: (resources: Resource[]) => void;
}

export default function ResourceManager({
  initialResources = [],
  onResourcesChange,
}: ResourceManagerProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [newResource, setNewResource] = useState<Partial<Resource>>({});

  const handleAddResource = () => {
    if (newResource.title && newResource.type && newResource.url) {
      const updatedResources = [...resources, newResource as Resource];
      setResources(updatedResources);
      onResourcesChange(updatedResources);
      setNewResource({});
    }
  };

  const handleRemoveResource = (index: number) => {
    const updatedResources = resources.filter((_, i) => i !== index);
    setResources(updatedResources);
    onResourcesChange(updatedResources);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Existing Resources */}
          {resources.map((resource, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded">
              <div className="flex-1">
                <h4 className="font-medium">{resource.title}</h4>
                <p className="text-sm text-gray-500">{resource.type}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveResource(index)}
              >
                Remove
              </Button>
            </div>
          ))}

          {/* Add New Resource */}
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label>Resource Title</Label>
              <Input
                value={newResource.title || ''}
                onChange={(e) => setNewResource({
                  ...newResource,
                  title: e.target.value
                })}
              />
            </div>

            <div>
              <Label>Resource Type</Label>
              <Select
                value={newResource.type}
                onValueChange={(value: ResourceType) => setNewResource({
                  ...newResource,
                  type: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ResourceType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Upload Resource</Label>
              <UploadButton
                endpoint="courseAttachment"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) {
                    setNewResource({
                      ...newResource,
                      url: res[0].url
                    });
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error('Upload Error:', error);
                }}
                content={{
                  button({ ready }) {
                    if (ready) return "Choisir un fichier";
                    return "Préparation...";
                  },
                  allowedContent({ ready, fileTypes, isUploading }) {
                    if (!ready) return "Vérification des types de fichiers...";
                    if (isUploading) return "Téléchargement en cours...";
                    return `Formats acceptés: ${fileTypes.join(", ")}`;
                  },
                }}
              />
            </div>

            <Button
              type="button"
              onClick={handleAddResource}
              disabled={!newResource.title || !newResource.type || !newResource.url}
            >
              Add Resource
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 