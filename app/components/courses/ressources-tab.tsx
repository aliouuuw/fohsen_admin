import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  File, 
  Plus,
  Trash,
  Upload
} from "lucide-react"

export interface Resource {
  id: string
  title: string
  type: "pdf" | "document" | "link" | "image"
  url: string
  description?: string
}

interface ResourcesTabProps {
  resources: Resource[]
  onResourcesChange: (resources: Resource[]) => void
}

export function ResourcesTab({ resources, onResourcesChange }: ResourcesTabProps) {
  const [uploadingFile, setUploadingFile] = useState(false)

  const addResource = () => {
    const newResource: Resource = {
      id: `resource-${Date.now()}`,
      title: "",
      type: "document",
      url: "",
      description: ""
    }
    onResourcesChange([...resources, newResource])
  }

  const updateResource = (index: number, field: keyof Resource, value: string) => {
    const updatedResources = [...resources]
    updatedResources[index] = {
      ...updatedResources[index],
      [field]: value
    }
    onResourcesChange(updatedResources)
  }

  const removeResource = (index: number) => {
    const updatedResources = [...resources]
    updatedResources.splice(index, 1)
    onResourcesChange(updatedResources)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      // Here you would typically:
      // 1. Upload the file to your storage (e.g., S3, Firebase Storage)
      // 2. Get back the URL
      // 3. Create a new resource with that URL
      console.log("File selected:", file)
      // Mock upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newResource: Resource = {
        id: `resource-${Date.now()}`,
        title: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 
              file.type.includes('image') ? 'image' : 'document',
        url: URL.createObjectURL(file), // This would be the actual URL from your storage
        description: ""
      }
      onResourcesChange([...resources, newResource])
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setUploadingFile(false)
    }
  }

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4" />
      case 'link':
        return <LinkIcon className="h-4 w-4" />
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Upload Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
            <Upload className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop files here, or click to select files
            </p>
            <label htmlFor="file-upload">
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <Button variant="outline" disabled={uploadingFile}>
                {uploadingFile ? "Uploading..." : "Select Files"}
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        {resources.map((resource, index) => (
          <Card key={resource.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getResourceIcon(resource.type)}
                  <h3 className="text-lg font-semibold ml-2">Resource {index + 1}</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeResource(index)}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Resource Title</Label>
                  <Input 
                    value={resource.title}
                    onChange={(e) => updateResource(index, 'title', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Type</Label>
                  <Select
                    value={resource.type}
                    onValueChange={(value: Resource['type']) => 
                      updateResource(index, 'type', value)
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>URL or File Path</Label>
                  <Input 
                    value={resource.url}
                    onChange={(e) => updateResource(index, 'url', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea 
                    value={resource.description}
                    onChange={(e) => updateResource(index, 'description', e.target.value)}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button 
          variant="outline" 
          className="w-full py-6"
          onClick={addResource}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resource Manually
        </Button>
      </div>
    </div>
  )
}
