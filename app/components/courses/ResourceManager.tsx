import { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { UploadButton } from "@/utils/uploadthing";
import { ResourceType } from '@prisma/client';
import { Badge } from "@/app/components/ui/badge";
import { Trash2, Plus, ExternalLink, FileText, Link as LinkIcon, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";

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

const getResourceIcon = (type: ResourceType) => {
  switch (type) {
    case 'PDF':
      return <FileText className="h-4 w-4 text-red-500" />;
    case 'DOCUMENT':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'IMAGE':
      return <ImageIcon className="h-4 w-4 text-green-500" />;
    case 'VIDEO':
      return <Video className="h-4 w-4 text-purple-500" />;
    case 'LINK':
      return <LinkIcon className="h-4 w-4 text-orange-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

const getResourceTypeLabel = (type: ResourceType) => {
  const labels = {
    PDF: 'PDF',
    DOCUMENT: 'Document',
    IMAGE: 'Image',
    VIDEO: 'Vidéo',
    LINK: 'Lien'
  };
  return labels[type] || type;
};

export default function ResourceManager({
  initialResources = [],
  onResourcesChange,
}: ResourceManagerProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [newResource, setNewResource] = useState<Partial<Resource>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddResource = () => {
    if (newResource.title && newResource.type && newResource.url) {
      const updatedResources = [...resources, newResource as Resource];
      setResources(updatedResources);
      onResourcesChange(updatedResources);
      setNewResource({});
      setShowAddForm(false);
      toast.success("Ressource ajoutée avec succès");
    }
  };

  const handleRemoveResource = (index: number) => {
    const updatedResources = resources.filter((_, i) => i !== index);
    setResources(updatedResources);
    onResourcesChange(updatedResources);
    toast.success("Ressource supprimée");
  };

  const handleAddUrl = () => {
    const url = window.prompt('URL du lien ou de la ressource');
    if (url) {
      try {
        new URL(url); // Validate URL
        setNewResource({
          ...newResource,
          url: url,
          type: newResource.type || 'LINK'
        });
      } catch {
        toast.error("Veuillez entrer une URL valide");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Resources */}
      {resources.length > 0 && (
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50/50">
              <div className="flex items-center gap-2">
                {getResourceIcon(resource.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{resource.title}</h4>
                {resource.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {getResourceTypeLabel(resource.type)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                onClick={() => handleRemoveResource(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {resources.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Aucune ressource ajoutée</p>
          <p className="text-xs">Ajoutez des documents, liens ou fichiers multimédias</p>
        </div>
      )}

      {/* Add New Resource Form */}
      {showAddForm && (
        <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Ajouter une ressource</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setNewResource({});
              }}
            >
              Annuler
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Titre de la ressource *</Label>
              <Input
                placeholder="Ex: Guide de formation PDF"
                value={newResource.title || ''}
                onChange={(e) => setNewResource({
                  ...newResource,
                  title: e.target.value
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Type de ressource *</Label>
              <Select
                value={newResource.type}
                onValueChange={(value: ResourceType) => setNewResource({
                  ...newResource,
                  type: value
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">📄 PDF</SelectItem>
                  <SelectItem value="DOCUMENT">📝 Document</SelectItem>
                  <SelectItem value="IMAGE">🖼️ Image</SelectItem>
                  <SelectItem value="VIDEO">🎥 Vidéo</SelectItem>
                  <SelectItem value="LINK">🔗 Lien</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm">Description (optionnel)</Label>
            <Textarea
              placeholder="Brève description de la ressource"
              value={newResource.description || ''}
              onChange={(e) => setNewResource({
                ...newResource,
                description: e.target.value
              })}
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">Fichier ou URL *</Label>
            <div className="flex gap-2 mt-1">
              <UploadButton
                endpoint="courseAttachment"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) {
                    setNewResource({
                      ...newResource,
                      url: res[0].url
                    });
                    toast.success("Fichier téléversé avec succès");
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error('Upload Error:', error);
                  toast.error("Erreur lors du téléversement");
                }}
                content={{
                  button({ ready }) {
                    if (ready) return "📎 Téléverser";
                    return "Préparation...";
                  },
                  allowedContent({ ready, fileTypes, isUploading }) {
                    if (!ready) return "Vérification...";
                    if (isUploading) return "Téléchargement...";
                    return `Formats: ${fileTypes.join(", ")}`;
                  },
                }}
                className="ut-button:bg-blue-500 ut-button:hover:bg-blue-600"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddUrl}
              >
                🔗 Ajouter URL
              </Button>
            </div>
            {newResource.url && (
              <p className="text-xs text-green-600 mt-1">✓ Fichier/URL ajouté</p>
            )}
          </div>

          <Button
            type="button"
            onClick={handleAddResource}
            disabled={!newResource.title || !newResource.type || !newResource.url}
            className="w-full"
          >
            Ajouter la ressource
          </Button>
        </div>
      )}

      {/* Add Resource Button */}
      {!showAddForm && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une ressource
        </Button>
      )}
    </div>
  );
} 