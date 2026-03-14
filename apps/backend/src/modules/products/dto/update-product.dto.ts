export class UpdateProductDto {
  categoryId?: string;
  name?: string;
  description?: string;
  sku?: string;
  salePrice?: number;
  promotionalPrice?: number;
  costPrice?: number;
  prepTimeMinutes?: number;
  imageUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  controlsStock?: boolean;
  allowNotes?: boolean;
  availableDelivery?: boolean;
  availableCounter?: boolean;
  availableTable?: boolean;
  sortOrder?: number;
  addonGroupIds?: string[];
}
