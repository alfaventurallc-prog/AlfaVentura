"use client";
import { createProduct, getCategoriesForProducts, updateProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/lib/api";
import { cn, compressImage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Plus, Trash2, Upload, Video, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Product } from "../../../types";
import LoadingSpinner from "../LoadingSpinner";

const loadHeic2any = async () => (await import("heic2any")).default;

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/hevc", "video/mov", "video/avi"] as const;

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .refine((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), {
      message: "Slug must be lowercase and can only contain letters, numbers, and hyphens.",
    }),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  isPremium: z.boolean().default(true),
  images: z
    .array(
      z.object({
        file: z.instanceof(File).optional(),
        existingUrl: z.string().optional(),
      })
    )
    .min(1, "At least one image is required"),
  videos: z
    .array(
      z.object({
        file: z.instanceof(File).optional(),
        existingUrl: z.string().optional(),
      })
    )
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ImageUploadProps {
  value?: File;
  onChange: (file: File | undefined) => void;
  disabled?: boolean;
  existingImageUrl?: string;
  onRemove?: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const ImageUpload = ({ value, onChange, disabled, existingImageUrl, onRemove, setIsSubmitting }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [hasNewImage, setHasNewImage] = useState(false);

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
        if (ACCEPTED_IMAGE_TYPES.includes(file.type as any) && file.size <= MAX_IMAGE_SIZE) {
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
          // Check HEIC
          if (file.type === "image/heic" || file.type === "image/heif" || file.name.toLowerCase().endsWith(".heic")) {
            const heic2any = await loadHeic2any();
            const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg" });
            file = new File([convertedBlob as Blob], file.name.replace(/\.heic$/i, ".jpg"), {
              type: "image/jpeg",
            });
          }

          if (file.size > 10 * 1024 * 1024) file = await compressImage(file, 10); // Compress to max 10MB

          // Validate after conversion
          if (ACCEPTED_IMAGE_TYPES.includes(file.type as any) && file.size <= MAX_IMAGE_SIZE) {
            onChange(file);
            setHasNewImage(true);
          } else {
            toast.error("Unsupported file type or size too large");
          }
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

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {!value && !preview ? (
        <>
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
              accept="image/*,.heic,.heif"
              onChange={handleFileSelect}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Upload Image</p>
              <p className="text-xs text-gray-400">PNG, JPG, GIF, WEBP, HEIC up to 10MB</p>
            </div>
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              disabled={disabled}
              className="text-red-600 hover:text-red-700 w-full"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <div className="relative group rounded-lg overflow-hidden border border-gray-200">
              {preview ? (
                <Image
                  src={preview}
                  alt="Product Preview"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}

              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Replace/Remove Actions */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="file"
                accept="image/*,.heic,.heif"
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
                <Upload className="h-3 w-3 mr-2" />
                Replace
              </Button>
            </div>

            {onRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemove}
                disabled={disabled}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Video Upload Component
interface VideoUploadProps {
  value?: File;
  onChange: (file: File | undefined) => void;
  disabled?: boolean;
  existingVideoUrl?: string;
  onRemove?: () => void;
}

const VideoUpload = ({ value, onChange, disabled, existingVideoUrl, onRemove }: VideoUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [hasNewVideo, setHasNewVideo] = useState(false);

  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      setHasNewVideo(true);
      return () => URL.revokeObjectURL(url);
    } else if (existingVideoUrl && !hasNewVideo) {
      setPreview(existingVideoUrl);
    } else {
      setPreview(null);
    }
  }, [value, existingVideoUrl, hasNewVideo]);

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
        if (ACCEPTED_VIDEO_TYPES.includes(file.type as any) && file.size <= MAX_FILE_SIZE) {
          onChange(file);
          setHasNewVideo(true);
        }
      }
    },
    [onChange, disabled]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const files = e.target.files;
      if (files && files[0]) {
        const file = files[0];
        if (ACCEPTED_VIDEO_TYPES.includes(file.type as any) && file.size <= MAX_FILE_SIZE) {
          onChange(file);
          setHasNewVideo(true);
        }
      }
    },
    [onChange, disabled]
  );

  const removeFile = useCallback(() => {
    onChange(undefined);
    setPreview(existingVideoUrl || null);
    setHasNewVideo(false);
  }, [onChange, existingVideoUrl]);

  return (
    <div className="border rounded-lg p-4 space-y-4">
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
            accept="video/*"
            onChange={handleFileSelect}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="text-center">
            <Video className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Upload Video</p>
            <p className="text-xs text-gray-400">MP4, WEBM, OGG, HEVC, MOV, AVI up to 100MB</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <div className="relative group rounded-lg overflow-hidden border border-gray-200">
              {preview ? (
                <video
                  src={preview}
                  className="w-full h-48 object-cover"
                  controls
                  muted
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
              )}

              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Replace/Remove Actions */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="file"
                accept="video/*"
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
                <Upload className="h-3 w-3 mr-2" />
                Replace
              </Button>
            </div>

            {onRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemove}
                disabled={disabled}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main ProductForm Component
const ProductForm = ({ type, productData }: { type: "create" | "edit"; productData?: Product }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      isSubcategory: boolean;
      parentName?: string;
    }>
  >([]);
  const router = useRouter();

  const form = useForm<FormData>({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: productData?.title || "",
      slug: productData?.slug || "",
      description: productData?.description || "",
      categoryId: productData?.categoryId || "",
      isPremium: productData?.isPremium || false,
      images: (productData &&
        productData.images &&
        productData?.images.map((img) => ({
          existingUrl: img,
        }))) || [{}],
      videos:
        (productData &&
          productData.videos &&
          productData?.videos.map((vid) => ({
            existingUrl: vid,
          }))) ||
        [],
    },
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const {
    fields: videoFields,
    append: appendVideo,
    remove: removeVideo,
  } = useFieldArray({
    control: form.control,
    name: "videos",
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catRes = await getCategoriesForProducts();
        if (!catRes.success) throw new Error("Failed to fetch categories");
        if (catRes.success && catRes.data) setCategories(catRes.data.flat);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
    // if (type === "create" && imageFields.length === 0) appendImage({});
  }, []);

  // Auto-generate slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (watchTitle) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  }, [watchTitle, form, type]);

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);

    try {
      const imageUploads = await Promise.all(
        values.images.map(async (image) => {
          if (image.file) {
            const uploadResult = await uploadFile(image.file, `products/${values.title}/images`);
            return {
              imageUrl: uploadResult.url,
            };
          } else if (image.existingUrl) {
            return {
              imageUrl: image.existingUrl,
            };
          }
          return null;
        })
      );

      // Upload new videos
      const videoUploads = await Promise.all(
        (values.videos || []).map(async (video) => {
          if (video.file) {
            const uploadResult = await uploadFile(video.file, `products/${values.title}/videos`);
            return {
              videoUrl: uploadResult.url,
            };
          } else if (video.existingUrl) {
            return {
              videoUrl: video.existingUrl,
            };
          }
          return null;
        })
      );

      const submitData = {
        title: values.title,
        slug: values.slug,
        description: values.description,
        categoryId: values.categoryId,
        isPremium: values.isPremium,
        images: imageUploads.filter(Boolean).map((img) => img!.imageUrl),
        videos: videoUploads.filter(Boolean).map((vid) => vid!.videoUrl),
      };

      let response;
      if (type === "create") {
        response = await createProduct(submitData);
        if (response.success) {
          form.reset();
          toast.success("Product created successfully");
          router.push("/admin/products");
        } else {
          toast.error(response.error || "Failed to create product");
        }
      } else {
        response = await updateProduct(productData!.id, submitData);
        if (response.success) {
          form.reset();
          toast.success("Product updated successfully");
          router.push("/admin/products");
        } else {
          toast.error(response.error || "Failed to update product");
        }
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.error || "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            // @ts-ignore
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Premium Quartz Countertop"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., premium-quartz-countertop"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>This will be used in the product URL.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                // @ts-ignore
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the product features and benefits..."
                        className="min-h-[120px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                            >
                              {category.isSubcategory ? `${category.parentName} > ${category.name}` : category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-ignore
                  control={form.control}
                  name="isPremium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Premium Status</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "true")}
                        defaultValue={field.value.toString()}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="false">Normal</SelectItem>
                          <SelectItem value="true">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendImage({})}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageFields.map((field, index) => (
                  <FormField
                    key={field.id}
                    // @ts-ignore
                    control={form.control}
                    name={`images.${index}`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUpload
                            value={formField.value.file}
                            onChange={(file) => formField.onChange({ ...formField.value, file })}
                            disabled={isSubmitting}
                            existingImageUrl={formField.value.existingUrl}
                            onRemove={imageFields.length > 1 ? () => removeImage(index) : undefined}
                            setIsSubmitting={setIsSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Videos Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Product Videos</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendVideo({})}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </div>

              {videoFields.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoFields.map((field, index) => (
                    <FormField
                      key={field.id}
                      // @ts-ignore
                      control={form.control}
                      name={`videos.${index}`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormControl>
                            <VideoUpload
                              value={formField.value?.file}
                              onChange={(file) => formField.onChange({ ...formField.value, file })}
                              disabled={isSubmitting}
                              existingVideoUrl={formField.value?.existingUrl}
                              onRemove={videoFields.length > 1 ? () => removeVideo(index) : undefined}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}
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
                  <span>{type === "create" ? "Create Product" : "Update Product"}</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProductForm;
