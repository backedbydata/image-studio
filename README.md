# Image Studio

A professional desktop application for batch image resizing and precision cropping, built with Electron, React, and Sharp.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Image Resizer
- **Multiple Scaling Modes**
  - Pixel-based resizing with exact width/height control
  - Percentage-based scaling (25% to 200%, or custom values)
  - Max-fit mode to fit images within specified bounds while maintaining aspect ratio
- **Aspect Ratio Lock** - Maintain proportions when resizing
- **Size Presets** - Quick access to common dimensions (Instagram, Facebook, Twitter, etc.)
- **Advanced Resize Algorithms**
  - Lanczos3 (highest quality, default)
  - Lanczos2
  - Bicubic
  - Bilinear
  - Nearest neighbor
- **Batch Processing** - Resize multiple images at once
- **Custom Output** - Choose format (JPEG, PNG, WebP, TIFF), quality, and file naming
- **Metadata Preservation** - Option to keep EXIF data and other metadata

### Image Cropper
- **Visual Crop Regions** - Click and drag to define multiple crop regions on a single image
- **Multiple Crops** - Export multiple regions from one image as separate files
- **Queue Processing** - Load multiple images and process them sequentially
- **Zoom & Pan** - Navigate large images with zoom controls and panning
- **Keyboard Shortcuts** - Arrow key nudging for precise region placement
- **Region Management** - Select, edit, duplicate, and delete crop regions
- **EXIF Auto-Rotation** - Automatically handles image orientation
- **Custom Naming Templates** - Use `{original}` and `{index}` placeholders
- **Image Rotation** - Rotate images 90°, 180°, or 270° before cropping

### General Features
- **Modern UI** - Clean, dark-themed interface with smooth animations
- **Real-time Progress** - Visual feedback during batch operations
- **Processing Reports** - Detailed summary of successful and failed operations
- **Drag & Drop** - Easy file selection (coming soon)
- **Folder Operations** - Load all images from a folder at once
- **Global Keyboard Shortcuts** - Quick navigation and file operations

## Quick Start

1. **Download** the latest release from the releases page
2. **Install** Image Studio on Windows
3. **Launch** the application
4. **Choose** Resizer or Cropper mode
5. **Load** your images
6. **Configure** your settings
7. **Process** and save your images

## Installation

### Prerequisites
- **Windows** 10 or later
- **Node.js** 20.x or later (for development only)
- **npm** or **yarn** (for development only)

### For Users
1. Download the latest `.exe` installer from the [Releases](../../releases) page
2. Run the installer
3. Choose installation directory (optional)
4. Launch Image Studio from the Start Menu or desktop shortcut

### For Developers

#### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Package the application**
   ```bash
   npm run package
   ```
   The installer will be created in the `dist` folder.

## Usage

### Image Resizer

1. **Switch to Resizer Mode** - Click "Resizer" in the sidebar (or press `Ctrl+1`)
2. **Add Images**
   - Click "Select Images" to choose individual files
   - Or click "Select Folder" to load all images from a directory
3. **Configure Resize Settings**
   - Choose scaling mode (Pixels, Percentage, or Max Fit)
   - Enter desired dimensions or percentage
   - Select resize algorithm (Lanczos3 recommended for best quality)
4. **Set Output Options**
   - Choose output format (JPEG, PNG, WebP, or TIFF)
   - Adjust quality slider (1-100%)
   - Select output folder
   - Add filename prefix/suffix (optional)
   - Toggle metadata preservation
5. **Process Images** - Click "Start Resize"
6. **Review Results** - View processing report with success/failure details

### Image Cropper

1. **Switch to Cropper Mode** - Click "Cropper" in the sidebar (or press `Ctrl+2`)
2. **Load an Image**
   - Click "Select Images" or press `Ctrl+O`
   - Select one or more images to crop
3. **Create Crop Regions**
   - Click and drag on the image to create a crop region
   - Release to finalize the region
   - Repeat to create multiple regions
4. **Adjust Regions**
   - Click a region to select it
   - Drag to reposition
   - Drag handles to resize
   - Use arrow keys for pixel-perfect nudging (Shift+Arrow for 10px jumps)
   - Click the duplicate icon to copy a region
   - Click the delete icon to remove a region
5. **Configure Output Settings**
   - Select output format and quality
   - Choose output folder
   - Customize naming template
   - Toggle metadata preservation
6. **Export Crops** - Click "Export X Regions"
7. **Process Next Image** - Use the image queue at the bottom to switch between loaded images

### Keyboard Shortcuts

#### Global
- `Ctrl+1` - Switch to Resizer
- `Ctrl+2` - Switch to Cropper
- `Ctrl+O` - Open files

#### Cropper Mode
- `+` or `=` - Zoom in
- `-` - Zoom out
- `0` - Reset zoom and pan
- `Esc` - Deselect region
- `Arrow Keys` - Nudge selected region by 1px
- `Shift+Arrow Keys` - Nudge selected region by 10px

## Use Cases

### Professional Photography
- Resize images for web galleries while maintaining quality
- Create multiple crops from a single shot (e.g., landscape and portrait versions)
- Batch process event photos to consistent dimensions

### Social Media Management
- Resize images to platform-specific dimensions
- Create multiple aspect ratios from one image (1:1, 4:5, 16:9)
- Optimize file sizes while maintaining visual quality

### E-commerce
- Create product thumbnails and detail images from source files
- Ensure consistent product image dimensions across catalogs
- Extract specific product areas for closeup views

### Web Development
- Generate responsive image sets at multiple sizes
- Optimize images for different screen densities
- Batch process assets for web deployment

### Graphic Design
- Extract design elements from larger compositions
- Resize mockups to presentation sizes
- Create variations of designs at different scales

## Project Structure

```
image-studio/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts            # Application entry point
│   │   ├── ipc-handlers.ts     # IPC communication handlers
│   │   └── services/           # Backend services
│   │       ├── file-service.ts # File system operations
│   │       └── image-service.ts # Image processing (Sharp)
│   ├── renderer/               # React frontend
│   │   ├── App.tsx             # Main app component
│   │   ├── main.tsx            # Renderer entry point
│   │   ├── components/         # React components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── resizer/        # Resizer page components
│   │   │   ├── cropper/        # Cropper page components
│   │   │   └── shared/         # Shared UI components
│   │   ├── stores/             # Zustand state management
│   │   │   ├── appStore.ts     # Global app state
│   │   │   ├── resizerStore.ts # Resizer state
│   │   │   └── cropperStore.ts # Cropper state
│   │   ├── hooks/              # React hooks
│   │   ├── types/              # TypeScript definitions
│   │   └── assets/             # Styles and assets
│   └── preload/                # Electron preload scripts
│       └── index.ts            # IPC bridge
├── resources/                  # Application resources
│   └── icon.ico               # App icon
├── build/                      # Build resources
├── out/                        # Compiled output
├── dist/                       # Packaged application
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── electron-vite.config.js    # Electron Vite build config
```

## Technical Details

### Tech Stack
- **Electron** 28.2.0 - Desktop application framework
- **React** 18.2.0 - UI framework
- **TypeScript** 5.3.3 - Type-safe development
- **Sharp** 0.33.2 - High-performance image processing
- **Zustand** 4.5.0 - Lightweight state management
- **Framer Motion** 11.0.3 - Smooth animations
- **Tailwind CSS** 3.4.1 - Utility-first styling
- **Vite** - Fast build tooling via electron-vite

### Architecture

**Main Process** (`src/main/`)
- Handles file system operations
- Executes image processing tasks using Sharp
- Manages IPC communication with renderer
- Controls application lifecycle

**Renderer Process** (`src/renderer/`)
- React-based UI with TypeScript
- Zustand for state management
- Framer Motion for animations
- Communicates with main process via IPC bridge

**Preload Script** (`src/preload/`)
- Exposes secure IPC methods to renderer
- Acts as bridge between main and renderer processes
- Prevents direct access to Node.js APIs from renderer

### Image Processing

The application uses **Sharp**, a high-performance Node.js image processing library:
- **Automatic EXIF Rotation** - Correctly orients images based on metadata
- **Stream-based Processing** - Efficient memory usage for large images
- **Multiple Formats** - JPEG, PNG, WebP, TIFF support
- **Quality Control** - Configurable compression for each format
- **Metadata Handling** - Preserve or strip EXIF data

### State Management

**Zustand** provides simple, type-safe state management:
- `appStore` - Global application state (current view, sidebar state)
- `resizerStore` - Resizer-specific state (dimensions, files, settings)
- `cropperStore` - Cropper-specific state (regions, zoom, pan, rotation)

### IPC Communication

Secure communication between main and renderer processes:
- **openFiles** - File selection dialog
- **openFolder** - Folder selection dialog
- **getFileInfo** - File metadata retrieval
- **getImageMetadata** - Image dimensions and format
- **batchResize** - Batch image resizing
- **cropImage** - Image cropping operations
- **onProgress** - Real-time progress updates

## Troubleshooting

### Image Not Loading in Cropper
- **Issue**: Image appears black or doesn't display
- **Solution**: Ensure the image format is supported (JPEG, PNG, WebP, TIFF). Try rotating the image or checking file permissions.

### Aspect Ratio Lock Not Working
- **Issue**: Dimensions don't maintain aspect ratio
- **Solution**: Ensure the aspect ratio lock toggle is enabled and you've loaded at least one image to establish the ratio.

### Batch Processing Fails
- **Issue**: Some images fail during batch operations
- **Solution**: Check the processing report for specific error messages. Common issues include:
  - Insufficient disk space
  - Write permissions for output folder
  - Corrupted source images
  - Unsupported image formats

### Output Images Have Wrong Orientation
- **Issue**: Images are rotated incorrectly
- **Solution**: The app automatically applies EXIF rotation. If issues persist, try using the manual rotation feature in cropper mode.

### Keyboard Shortcuts Not Working
- **Issue**: Shortcuts don't respond
- **Solution**: Ensure you're not focused in a text input field. Click on the canvas or background area first.

### High Memory Usage
- **Issue**: Application uses excessive memory
- **Solution**: Process images in smaller batches. Sharp optimizes memory usage, but processing hundreds of large images simultaneously may require significant RAM.

### Sharp Installation Issues (Development)
- **Issue**: `npm install` fails on Sharp dependency
- **Solution**:
  ```bash
  npm install --platform=win32 --arch=x64 sharp
  ```
  Or delete `node_modules` and `package-lock.json`, then reinstall.

### Build/Package Errors
- **Issue**: `npm run package` fails
- **Solution**:
  - Ensure `resources/icon.ico` exists
  - Run `npm run build` successfully first
  - Check that `out/` directory contains compiled code
  - Clear `dist/` folder and retry

## Limitations

- **Windows Only** - Currently packaged for Windows. MacOS and Linux support requires additional configuration.
- **File Format Support** - Supports JPEG, PNG, WebP, and TIFF. RAW formats (CR2, NEF, ARW) require conversion first.
- **Single Image Cropping** - Cropper processes one image at a time (but can create multiple crops per image).
- **Memory Constraints** - Processing very large images (>50MB) or large batches (>1000 images) may require significant RAM.
- **No Undo/Redo** - Once processing completes, changes cannot be undone. Always keep original files.
- **No Image Editing** - This tool focuses on resizing and cropping. Advanced editing (filters, adjustments) is not supported.

## Performance Tips

1. **Use Appropriate Formats**
   - JPEG for photographs (smaller files, lossy compression)
   - PNG for graphics with transparency
   - WebP for best quality-to-size ratio
   - TIFF for archival/professional use

2. **Optimize Quality Settings**
   - JPEG: 80-90% provides excellent quality with good compression
   - PNG: Higher quality settings increase file size significantly
   - WebP: 80-85% balances quality and size well

3. **Batch Processing**
   - Process images in groups of 100-500 for optimal performance
   - Close other applications to free up system resources
   - Use an SSD for output folder to speed up write operations

4. **Resize Algorithm Selection**
   - Lanczos3: Best quality, slower (recommended for final output)
   - Lanczos2: Good quality, faster
   - Bicubic: Balanced quality and speed
   - Bilinear: Fast, lower quality
   - Nearest: Fastest, pixel art only

## FAQ

**Q: Can I process RAW image files?**
A: Not directly. Convert RAW files to JPEG/PNG first using your camera software or a RAW processor.

**Q: Will the app modify my original images?**
A: No. All processing creates new files. Your originals remain untouched.

**Q: Can I resize images to larger dimensions?**
A: Yes, but quality may degrade. Use Lanczos3 algorithm for best results when upscaling.

**Q: How do I create a perfect square crop?**
A: In Resizer mode, use pixel mode with equal width and height (e.g., 1000x1000) and "Fill" fit mode.

**Q: Can I automate repetitive tasks?**
A: The app supports batch processing for resizing. For advanced automation, consider using the codebase as a foundation for custom scripts.

**Q: Is my image data sent anywhere?**
A: No. All processing happens locally on your computer. No data is transmitted over the internet.

## Contributing

Contributions are welcome! This project is open source under the MIT license.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Image processing powered by [Sharp](https://sharp.pixelplumbing.com/)
- UI components inspired by modern design principles
- Icons from [Lucide](https://lucide.dev/)

---

**Image Studio** - Professional batch image resizing and cropping made simple.
