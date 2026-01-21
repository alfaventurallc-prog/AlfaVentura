"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileImage, Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import LoadingSpinner from "../LoadingSpinner";
import { createCategory, updateCategory, getMainCategories } from "@/actions/categories";
import { uploadFile } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const loadHeic2any = async () => (await import("heic2any")).default;
import { compressImage } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .refine((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), {
      message: "Slug must be lowercase and can only contain letters, numbers, and hyphens.",
    }),
  description: z.string().min(1, "Description is required"),
  parentId: z.string().optional(),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Max 5MB size")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type),
      "Only .jpg, .png, .gif, .webp formats are supported"
    )
    .optional(),
});

interface CategoryWithParent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ImageUploadProps {
  value?: File;
  onChange: (file: File | undefined) => void;
  disabled?: boolean;
  existingImageUrl: string | null;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const ImageUpload = ({ value, onChange, disabled, existingImageUrl, setIsSubmitting }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [hasNewImage, setHasNewImage] = useState(false);

  // Create preview URL when file changes or set existing image
  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      setHasNewImage(true);
      return () => URL.revokeObjectURL(url);
    } else if (existingImageUrl && !hasNewImage) {
      setPreview(existingImageUrl);
    } else {
      setPreview(null);
    }
  }, [value, existingImageUrl, hasNewImage]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          onChange(file);
          setHasNewImage(true);
        }
      }
    },
    [onChange, disabled]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const files = e.target.files;
      if (files && files[0]) {
        let file = files[0];
        try {
          setIsSubmitting(true);
          if (file.type === "image/heic" || file.type === "image/heif" || file.name.toLowerCase().endsWith(".heic")) {
            const heic2any = await loadHeic2any();
            const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg" });
            file = new File([convertedBlob as Blob], file.name.replace(/\.heic$/i, ".jpg"), {
              type: "image/jpeg",
            });
          }

          if (file.size > 10 * 1024 * 1024) file = await compressImage(file, 10);
          onChange(files[0]);
          setHasNewImage(true);
        } catch (err) {
          console.error("HEIC conversion error:", err);
          toast.error("Failed to convert HEIC image. Please try another file.");
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [onChange, disabled]
  );

  const removeFile = useCallback(() => {
    onChange(undefined);
    setPreview(existingImageUrl || null);
    setHasNewImage(false);
  }, [onChange, existingImageUrl]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full">
      {!value && !preview ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200",
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {dragActive ? "Drop image here" : "Upload category image"}
              </p>
              <p className="text-sm text-gray-500">Drag and drop your image here, or click to browse</p>
              <p className="text-xs text-gray-400">PNG, JPG, GIF, WEBP up to 5MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <div className="relative group rounded-lg overflow-hidden border border-gray-200">
              {preview ? (
                <Image
                  src={preview}
                  alt="Category Preview"
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Badge to show if it's existing or new image */}
              <div className="absolute bottom-2 left-2">
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full text-white",
                    hasNewImage ? "bg-green-500" : "bg-blue-500"
                  )}
                >
                  {hasNewImage ? "New Image" : "Current Image"}
                </span>
              </div>
            </div>
          </div>

          {/* File Info - only show for new files */}
          {value && (
            <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
              <FileImage className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{value.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(value.size)}</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Replace button */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              disabled={disabled}
            >
              <Upload className="h-4 w-4 mr-2" />
              {hasNewImage || !existingImageUrl ? "Replace Image" : "Change Image"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryForm = ({ type, categoryData }: { type: "create" | "edit"; categoryData?: CategoryWithParent }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainCategories, setMainCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: categoryData?.name || "",
      slug: categoryData?.slug || "",
      description: categoryData?.description || "",
      parentId: categoryData?.parentId || undefined,
      image: undefined,
    },
  });

  // Load main categories for parent selection
  useEffect(() => {
    const loadMainCategories = async () => {
      try {
        const res = await getMainCategories();
        if (res.success && res.data) {
          // Filter out current category if editing to prevent self-reference
          const filtered = categoryData ? res.data.filter((cat) => cat.id !== categoryData.id) : res.data;
          setMainCategories(filtered);
        }
      } catch (error) {
        console.error("Failed to load main categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMainCategories();
  }, [categoryData]);

  // Auto-generate slug from name
  const watchName = form.watch("name");

  useEffect(() => {
    if (watchName && (type === "create" || form.getValues("slug") === "")) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  }, [watchName, form, type]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      if (type === "create" && !values.image)
        form.setError("image", { type: "manual", message: "Image is required for new categories" });

      let imageUrl = categoryData?.imageUrl; // Keep existing image URL by default

      // Only upload new image if a new file was selected
      if (values.image) {
        const imgRes = await uploadFile(values.image, "categories");
        imageUrl = imgRes.url;
      }

      const submitData = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        parentId: values.parentId === "no-parent" ? null : values.parentId,
        imageUrl: imageUrl,
      };

      let response;

      if (type === "create") {
        response = await createCategory(submitData);
        if (!response.success) {
          toast.error(response.error || "Failed to create category");
        } else {
          toast.success("Category created successfully");
          form.reset();
        }
      } else {
        response = await updateCategory(categoryData!.id, submitData);
        if (!response.success) {
          toast.error(response.error || "Failed to update category");
        } else {
          toast.success("Category updated successfully");
        }
      }

      console.log(response);
      if (response) router.push("/admin/categories");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.error || "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-6 flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mt-6">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Quartz Surfaces"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., quartz-surfaces"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be used in the category URL. It must be lowercase and can only contain letters,
                        numbers, and hyphens.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this category contains..."
                        className="min-h-[100px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of this category that will be shown to customers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category Hierarchy */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Category Hierarchy</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a parent category (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-parent">No Parent (Main Category)</SelectItem>
                          {mainCategories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Leave empty to create a main category, or select a parent to create a subcategory.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Show parent info for editing subcategories */}
              {type === "edit" && categoryData?.parent && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Current Parent:</strong> {categoryData.parent.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    This is currently a subcategory. You can change its parent or make it a main category.
                  </p>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Category Image</h3>

              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={value}
                        onChange={onChange}
                        disabled={isSubmitting}
                        existingImageUrl={categoryData ? categoryData.imageUrl : ""}
                        setIsSubmitting={setIsSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a high-quality image that represents this category. This will be displayed on your website.
                      {type === "edit" && categoryData?.imageUrl && (
                        <span className="block mt-1 text-blue-600">
                          Current image is displayed above. Upload a new file to replace it.
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  if (type === "create") {
                    form.reset();
                  } else {
                    router.back();
                  }
                }}
              >
                {type === "create" ? "Reset" : "Cancel"}
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <span>{type === "create" ? "Create Category" : "Update Category"}</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CategoryForm;
