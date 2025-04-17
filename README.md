# NIST Audit Tracker

<img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NIST_Audit_Tracker_Icon-f7X3HK6U6FvhQ9XseN0uJN5yV1wE9h.png" alt="NIST Audit Tracker" width="200" />

A powerful cloud-based utility for tracking, visualizing, and managing your NIST CSF 2.0 controls compliance.

## Overview

NIST Audit Tracker is a comprehensive tool designed to help organizations track, visualize, and manage their compliance with the NIST Cybersecurity Framework 2.0. Built as a cloud-based application with Neon Serverless PostgreSQL, it provides real-time synchronization, multi-device access, and enterprise-grade data security.

## Key Features

### Cloud-Based Storage
- **Powered by Neon Serverless PostgreSQL**
- All data is stored securely in the cloud with automatic backups
- Real-time synchronization across all devices and users
- Enterprise-grade security with encrypted connections
- Automatic scaling to handle growing data needs

### NIST CSF 2.0 Compliant
- Built specifically for the latest NIST Cybersecurity Framework 2.0
- Support for all functions, categories, and subcategories
- Comprehensive tracking of control implementation status

### Instant Analysis
- Real-time data processing with server-side optimization
- Immediate insights and visualizations with efficient data queries
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

- Built with Next.js and React
- Neon Serverless PostgreSQL for cloud database storage
- Uses Recharts for data visualization
- Tailwind CSS for styling

### Database Architecture
- Serverless PostgreSQL database hosted on Neon
- Automatic scaling based on workload
- Connection pooling for optimal performance
- Branching capability for development and testing

### Browser Compatibility
Works with all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables for database connection
4. Run the development server with `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Navigate to the Dashboard to view your compliance status
2. Use the Data Management section to load sample data or import your own
3. Explore the Controls section to view and edit individual controls
4. Generate reports in the Reports section
5. Configure synchronization settings in the Settings page

## Data Persistence

Your data is stored securely in Neon Serverless PostgreSQL. This means:

- Work from anywhere with an internet connection
- Data persists between sessions and across devices
- Multiple users can access and update the same data simultaneously
- Automatic backups ensure your data is safe
- Enterprise-grade security protects your sensitive compliance information

## License

[MIT License](LICENSE)
\`\`\`
