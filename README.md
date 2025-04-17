# NIST Audit Tracker

<img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NIST_Audit_Tracker_Icon-f7X3HK6U6FvhQ9XseN0uJN5yV1wE9h.png" alt="NIST Audit Tracker" width="200" />

A powerful browser-based utility for tracking, visualizing, and managing your NIST CSF 2.0 controls compliance.

## Overview

NIST Audit Tracker is a comprehensive tool designed to help organizations track, visualize, and manage their compliance with the NIST Cybersecurity Framework 2.0. Built as a browser-based application, it eliminates the need for complex server setups or external database configurations.

## Key Features

### Browser-Based Storage
- **No external database required**
- All data is stored securely in your browser using IndexedDB
- Works completely offline with no internet connection required
- Export and import functionality for sharing data between devices

### NIST CSF 2.0 Compliant
- Built specifically for the latest NIST Cybersecurity Framework 2.0
- Support for all functions, categories, and subcategories
- Comprehensive tracking of control implementation status

### Instant Analysis
- Real-time data processing happens directly in your browser
- Immediate insights and visualizations without server-side processing
- Any changes to control data are instantly reflected in all visualizations

### Data Management
- Import existing NIST controls from Excel spreadsheets
- Export data for sharing or backup purposes
- Edit control details, compliance status, and remediation progress directly in the Controls Explorer
- Sample data available for testing and exploration

### Comprehensive Visualizations
The dashboard provides multiple views for different analysis perspectives:

- **Overview**: Basic charts showing compliance status, issue priority, remediation status, and NIST function distribution
- **Gap Analysis**: Radial and radar charts highlighting gaps in your NIST controls implementation
- **Compliance**: Detailed metrics on compliance rates across different functions and domains
- **Risk Analysis**: Visualizations of risk exposure and projected risk reduction over time
- **Trends**: Time-based visualizations showing remediation progress and compliance improvements

## Technical Details

### Technical Details

- Built with Next.js and React
- Uses Recharts for data visualization
- IndexedDB for offline capability
- Tailwind CSS for styling

### Browser Compatibility
Works with all modern browsers that support IndexedDB:
- Chrome
- Firefox
- Safari
- Edge

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Navigate to the Dashboard to view your compliance status
2. Use the Data Management section to load sample data or import your own
3. Explore the Controls section to view and edit individual controls
4. Generate reports in the Reports section
5. Configure synchronization settings in the Settings page

## Data Persistence

Your data is stored locally in your browser using IndexedDB. This means:

- Work completely offline with no internet connection required
- Data persists between browser sessions on the same device
- To use on different devices, export your data and import it on the other device
- Regular backups are recommended by using the export functionality

## License

[MIT License](LICENSE)
