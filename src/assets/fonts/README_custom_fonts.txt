// This file demonstrates how to register and use a custom font (e.g., Roboto) with jsPDF in your React project.
// 1. Download the Roboto-Regular.ttf font and convert it to base64 (or use a tool like https://gerhardsletten.github.io/jsPDF-font-converter/).
// 2. Place the generated .js file (e.g., Roboto-normal.js) in your project (e.g., src/assets/fonts/Roboto-normal.js).
// 3. Import and register the font in your PDF generator component.

// Example usage in pdfGenerator.tsx:
// import 'src/assets/fonts/Roboto-normal.js';
// ...
// pdf.addFileToVFS('Roboto-Regular.ttf', RobotoNormalBase64);
// pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
// pdf.setFont('Roboto');

// You can repeat this for other font weights/styles (bold, italic, etc.)
// and for any other TTF font you want to support.

// See the README below for more details.
