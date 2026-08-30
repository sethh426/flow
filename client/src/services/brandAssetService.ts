/**
 * Brand Asset Service
 * Firestore-backed service for managing brand assets (logos, colors, fonts, design elements)
 * Used by Printify Studio for quick-apply branding to products
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BrandLogo {
  id: string;
  name: string;
  url: string;
  storageRef: string;
  format: 'png' | 'svg' | 'jpg';
  size: number; // bytes
  width: number;
  height: number;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: Array<{
    hex: string;
    name: string;
    usage: 'primary' | 'secondary' | 'accent' | 'neutral';
  }>;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FontConfig {
  id: string;
  family: string;
  weights: number[];
  googleFontUrl?: string;
  isPrimary: boolean;
  usage: 'heading' | 'body' | 'accent';
  createdAt: Date;
  updatedAt: Date;
}

export interface DesignElement {
  id: string;
  name: string;
  type: 'pattern' | 'icon' | 'texture' | 'shape';
  url: string;
  storageRef: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandPreset {
  id: string;
  name: string;
  description: string;
  logoIds: string[];
  paletteId: string;
  fontIds: string[];
  style: 'modern' | 'vintage' | 'minimalist' | 'bold' | 'elegant';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// BRAND LOGO MANAGEMENT
// ============================================================================

/**
 * Upload a logo file to Firebase Storage
 */
export async function uploadLogo(
  file: File,
  userId: string,
  name?: string
): Promise<BrandLogo> {
  try {
    // Create storage reference
    const fileName = `logos/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);

    // Upload file
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // Get image dimensions
    const dimensions = await getImageDimensions(url);

    // Create Firestore document
    const logoData = {
      name: name || file.name.replace(/\.[^/.]+$/, ''),
      url,
      storageRef: fileName,
      format: file.type.split('/')[1] as 'png' | 'svg' | 'jpg',
      size: file.size,
      width: dimensions.width,
      height: dimensions.height,
      isPrimary: false,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'brandLogos'), logoData);

    return {
      id: docRef.id,
      ...logoData,
      createdAt: logoData.createdAt.toDate(),
      updatedAt: logoData.updatedAt.toDate(),
    };
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw new Error('Failed to upload logo');
  }
}

/**
 * Get all logos for a user
 */
export async function getLogos(userId: string): Promise<BrandLogo[]> {
  try {
    const q = query(
      collection(db, 'brandLogos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as BrandLogo[];
  } catch (error) {
    console.error('Error getting logos:', error);
    return [];
  }
}

/**
 * Set a logo as primary (unset others)
 */
export async function setPrimaryLogo(logoId: string, userId: string): Promise<void> {
  try {
    // Get all logos
    const logos = await getLogos(userId);

    // Update all logos
    const batch = logos.map(async (logo) => {
      const docRef = doc(db, 'brandLogos', logo.id);
      await updateDoc(docRef, {
        isPrimary: logo.id === logoId,
        updatedAt: Timestamp.now(),
      });
    });

    await Promise.all(batch);
  } catch (error) {
    console.error('Error setting primary logo:', error);
    throw new Error('Failed to set primary logo');
  }
}

/**
 * Delete a logo
 */
export async function deleteLogo(logoId: string): Promise<void> {
  try {
    const docRef = doc(db, 'brandLogos', logoId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Delete from storage
      const storageRef = ref(storage, data.storageRef);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error('Error deleting logo:', error);
    throw new Error('Failed to delete logo');
  }
}

// ============================================================================
// COLOR PALETTE MANAGEMENT
// ============================================================================

/**
 * Create a color palette
 */
export async function createColorPalette(
  palette: Omit<ColorPalette, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<ColorPalette> {
  try {
    const paletteData = {
      ...palette,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'colorPalettes'), paletteData);

    return {
      id: docRef.id,
      ...palette,
      createdAt: paletteData.createdAt.toDate(),
      updatedAt: paletteData.updatedAt.toDate(),
    };
  } catch (error) {
    console.error('Error creating color palette:', error);
    throw new Error('Failed to create color palette');
  }
}

/**
 * Get all color palettes for a user
 */
export async function getColorPalettes(userId: string): Promise<ColorPalette[]> {
  try {
    const q = query(
      collection(db, 'colorPalettes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as ColorPalette[];
  } catch (error) {
    console.error('Error getting color palettes:', error);
    return [];
  }
}

/**
 * Update a color palette
 */
export async function updateColorPalette(
  paletteId: string,
  updates: Partial<Omit<ColorPalette, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'colorPalettes', paletteId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating color palette:', error);
    throw new Error('Failed to update color palette');
  }
}

/**
 * Delete a color palette
 */
export async function deleteColorPalette(paletteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'colorPalettes', paletteId));
  } catch (error) {
    console.error('Error deleting color palette:', error);
    throw new Error('Failed to delete color palette');
  }
}

// ============================================================================
// FONT CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * Create a font configuration
 */
export async function createFontConfig(
  fontConfig: Omit<FontConfig, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<FontConfig> {
  try {
    const configData = {
      ...fontConfig,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'fontConfigs'), configData);

    return {
      id: docRef.id,
      ...fontConfig,
      createdAt: configData.createdAt.toDate(),
      updatedAt: configData.updatedAt.toDate(),
    };
  } catch (error) {
    console.error('Error creating font config:', error);
    throw new Error('Failed to create font configuration');
  }
}

/**
 * Get all font configs for a user
 */
export async function getFontConfigs(userId: string): Promise<FontConfig[]> {
  try {
    const q = query(
      collection(db, 'fontConfigs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as FontConfig[];
  } catch (error) {
    console.error('Error getting font configs:', error);
    return [];
  }
}

/**
 * Delete a font config
 */
export async function deleteFontConfig(fontId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'fontConfigs', fontId));
  } catch (error) {
    console.error('Error deleting font config:', error);
    throw new Error('Failed to delete font configuration');
  }
}

// ============================================================================
// DESIGN ELEMENT MANAGEMENT
// ============================================================================

/**
 * Upload a design element
 */
export async function uploadDesignElement(
  file: File,
  userId: string,
  type: DesignElement['type'],
  tags: string[] = []
): Promise<DesignElement> {
  try {
    // Create storage reference
    const fileName = `designElements/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);

    // Upload file
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // Create Firestore document
    const elementData = {
      name: file.name.replace(/\.[^/.]+$/, ''),
      type,
      url,
      storageRef: fileName,
      tags,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'designElements'), elementData);

    return {
      id: docRef.id,
      ...elementData,
      createdAt: elementData.createdAt.toDate(),
      updatedAt: elementData.updatedAt.toDate(),
    };
  } catch (error) {
    console.error('Error uploading design element:', error);
    throw new Error('Failed to upload design element');
  }
}

/**
 * Get all design elements for a user
 */
export async function getDesignElements(
  userId: string,
  type?: DesignElement['type']
): Promise<DesignElement[]> {
  try {
    let q = query(
      collection(db, 'designElements'),
      where('userId', '==', userId)
    );

    if (type) {
      q = query(q, where('type', '==', type));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as DesignElement[];
  } catch (error) {
    console.error('Error getting design elements:', error);
    return [];
  }
}

/**
 * Delete a design element
 */
export async function deleteDesignElement(elementId: string): Promise<void> {
  try {
    const docRef = doc(db, 'designElements', elementId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Delete from storage
      const storageRef = ref(storage, data.storageRef);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error('Error deleting design element:', error);
    throw new Error('Failed to delete design element');
  }
}

// ============================================================================
// BRAND PRESET MANAGEMENT
// ============================================================================

/**
 * Create a brand preset
 */
export async function createBrandPreset(
  preset: Omit<BrandPreset, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<BrandPreset> {
  try {
    const presetData = {
      ...preset,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'brandPresets'), presetData);

    return {
      id: docRef.id,
      ...preset,
      createdAt: presetData.createdAt.toDate(),
      updatedAt: presetData.updatedAt.toDate(),
    };
  } catch (error) {
    console.error('Error creating brand preset:', error);
    throw new Error('Failed to create brand preset');
  }
}

/**
 * Get all brand presets for a user
 */
export async function getBrandPresets(userId: string): Promise<BrandPreset[]> {
  try {
    const q = query(
      collection(db, 'brandPresets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as BrandPreset[];
  } catch (error) {
    console.error('Error getting brand presets:', error);
    return [];
  }
}

/**
 * Apply a brand preset (returns all associated assets)
 */
export async function applyBrandPreset(presetId: string): Promise<{
  logos: BrandLogo[];
  palette: ColorPalette | null;
  fonts: FontConfig[];
}> {
  try {
    const docRef = doc(db, 'brandPresets', presetId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Preset not found');
    }

    const preset = docSnap.data() as BrandPreset;

    // Fetch all associated assets
    const [logos, palette, fonts] = await Promise.all([
      // Get logos
      Promise.all(
        preset.logoIds.map(async (logoId) => {
          const logoDoc = await getDoc(doc(db, 'brandLogos', logoId));
          return logoDoc.exists() ? { id: logoDoc.id, ...logoDoc.data() } : null;
        })
      ).then(results => results.filter(Boolean) as BrandLogo[]),

      // Get palette
      getDoc(doc(db, 'colorPalettes', preset.paletteId)).then(doc =>
        doc.exists() ? { id: doc.id, ...doc.data() } as ColorPalette : null
      ),

      // Get fonts
      Promise.all(
        preset.fontIds.map(async (fontId) => {
          const fontDoc = await getDoc(doc(db, 'fontConfigs', fontId));
          return fontDoc.exists() ? { id: fontDoc.id, ...fontDoc.data() } : null;
        })
      ).then(results => results.filter(Boolean) as FontConfig[]),
    ]);

    return { logos, palette, fonts };
  } catch (error) {
    console.error('Error applying brand preset:', error);
    throw new Error('Failed to apply brand preset');
  }
}

/**
 * Delete a brand preset
 */
export async function deleteBrandPreset(presetId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'brandPresets', presetId));
  } catch (error) {
    console.error('Error deleting brand preset:', error);
    throw new Error('Failed to delete brand preset');
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get image dimensions from URL
 */
function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Generate default color palettes
 */
export function getDefaultPalettes(): Omit<ColorPalette, 'id' | 'createdAt' | 'updatedAt'>[] {
  return [
    {
      name: 'Modern Tech',
      isPrimary: false,
      colors: [
        { hex: '#667eea', name: 'Primary Blue', usage: 'primary' },
        { hex: '#764ba2', name: 'Secondary Purple', usage: 'secondary' },
        { hex: '#f093fb', name: 'Accent Pink', usage: 'accent' },
        { hex: '#1a202c', name: 'Dark Gray', usage: 'neutral' },
      ],
    },
    {
      name: 'Vintage Classic',
      isPrimary: false,
      colors: [
        { hex: '#d4a574', name: 'Vintage Gold', usage: 'primary' },
        { hex: '#8b4513', name: 'Saddle Brown', usage: 'secondary' },
        { hex: '#f5deb3', name: 'Wheat', usage: 'accent' },
        { hex: '#2f4f4f', name: 'Dark Slate Gray', usage: 'neutral' },
      ],
    },
    {
      name: 'Bold & Vibrant',
      isPrimary: false,
      colors: [
        { hex: '#ff6b6b', name: 'Coral Red', usage: 'primary' },
        { hex: '#4ecdc4', name: 'Turquoise', usage: 'secondary' },
        { hex: '#ffe66d', name: 'Sunshine Yellow', usage: 'accent' },
        { hex: '#2d3436', name: 'Charcoal', usage: 'neutral' },
      ],
    },
    {
      name: 'Minimalist',
      isPrimary: false,
      colors: [
        { hex: '#000000', name: 'Pure Black', usage: 'primary' },
        { hex: '#ffffff', name: 'Pure White', usage: 'secondary' },
        { hex: '#808080', name: 'Medium Gray', usage: 'accent' },
        { hex: '#e5e5e5', name: 'Light Gray', usage: 'neutral' },
      ],
    },
  ];
}

/**
 * Generate default font configs
 */
export function getDefaultFonts(): Omit<FontConfig, 'id' | 'createdAt' | 'updatedAt'>[] {
  return [
    {
      family: 'Inter',
      weights: [400, 500, 600, 700],
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      isPrimary: true,
      usage: 'body',
    },
    {
      family: 'Poppins',
      weights: [600, 700, 800],
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap',
      isPrimary: false,
      usage: 'heading',
    },
    {
      family: 'Playfair Display',
      weights: [400, 700],
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
      isPrimary: false,
      usage: 'accent',
    },
  ];
}
