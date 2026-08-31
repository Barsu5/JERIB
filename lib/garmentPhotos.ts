import type { ProductId, View } from "./types";
import { garmentSide } from "./parts";

/** Map products without dedicated photos to the closest garment mockup. */
const PHOTO_PRODUCT: Partial<Record<ProductId, ProductId>> = {
  football_jersey: "tshirt",
};

export function garmentPhotoProduct(product: ProductId): ProductId {
  return PHOTO_PRODUCT[product] ?? product;
}

export function garmentPhotoPath(product: ProductId, view: View): string {
  const side = garmentSide(view);
  return `/garments/${garmentPhotoProduct(product)}-${side}.png`;
}
