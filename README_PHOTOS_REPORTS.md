# Project Photos and Reports Functionality

This document explains how to set up and use the new photo and report functionality for your Home Build Pro project.

## 🗄️ Database Setup

### 1. Create Required Tables

Run the following SQL commands in your MySQL database:

```sql
-- Create tables for project photos and reports functionality

-- Table for storing project photos
CREATE TABLE IF NOT EXISTS project_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    photo_name VARCHAR(255),
    description TEXT,
    file_size INT,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_project_photos (project_id, uploaded_at),
    INDEX idx_user_photos (user_id, uploaded_at)
);

-- Table for storing project reports
CREATE TABLE IF NOT EXISTS project_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    report_description TEXT,
    report_file_url VARCHAR(500) NOT NULL,
    report_file_name VARCHAR(255) NOT NULL,
    file_size INT,
    file_type VARCHAR(50),
    report_type ENUM('progress', 'financial', 'technical', 'safety', 'other') DEFAULT 'other',
    status ENUM('draft', 'published', 'archived') DEFAULT 'published',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_project_reports (project_id, uploaded_at),
    INDEX idx_user_reports (user_id, uploaded_at),
    INDEX idx_report_type (report_type, status)
);

-- Table for tracking photo/report views by members
CREATE TABLE IF NOT EXISTS project_content_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    content_type ENUM('photo', 'report') NOT NULL,
    content_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_view (user_id, content_type, content_id),
    INDEX idx_project_views (project_id, content_type),
    INDEX idx_user_views (user_id, content_type)
);
```

### 2. Create Upload Directories

Create the following directories in your backend:

```bash
mkdir -p BE-main/public/uploads/projects
mkdir -p BE-main/public/uploads/reports
```

## 🔧 Backend Setup

### 1. Install Required Dependencies

Make sure you have the following packages installed in your backend:

```bash
npm install multer
```

### 2. New API Endpoints

The following new endpoints are now available:

#### Photos
- `GET /api/projects/:id/photos` - Get project photos
- `POST /api/projects/:id/photos` - Upload project photo

#### Reports
- `GET /api/projects/:id/reports` - Get project reports
- `POST /api/projects/:id/reports` - Upload project report

#### Content Tracking
- `POST /api/projects/content/view` - Track when members view photos/reports

## 📱 Frontend Setup

### 1. Install Required Dependencies

```bash
npm install expo-image-picker expo-document-picker
```

### 2. New Screens

- `ProjectPhotos.js` - View and upload project photos
- `ProjectReports.js` - View and upload project reports

### 3. Navigation

The new screens are accessible from the Project Details screen via:
- **Photos Button** - Navigate to ProjectPhotos screen
- **Reports Button** - Navigate to ProjectReports screen

## 🚀 Features

### Photos
- ✅ Take photos with camera
- ✅ Upload photos from gallery
- ✅ Add photo names and descriptions
- ✅ View photos in grid layout
- ✅ Full-screen photo viewing
- ✅ Track photo views by members

### Reports
- ✅ Upload various document types (PDF, Word, Excel, images)
- ✅ Categorize reports by type (Progress, Financial, Technical, Safety, Other)
- ✅ Add report titles and descriptions
- ✅ View report details and metadata
- ✅ Track report views by members
- ✅ File size and type information

### Security & Access Control
- ✅ Only project members can upload/view content
- ✅ User authentication required
- ✅ Project membership verification
- ✅ File type validation
- ✅ File size limits (Photos: 10MB, Reports: 50MB)

## 📋 Usage Instructions

### For Project Members

1. **Access Photos/Reports**: Navigate to a project and tap the Photos or Reports button
2. **Upload Content**: Use the camera/upload buttons to add new content
3. **View Content**: Tap on any photo or report to view details
4. **Track Activity**: All views are automatically tracked

### For Project Owners

1. **Manage Content**: All project members can upload content
2. **Monitor Usage**: Track which members are viewing content
3. **Organize Files**: Use proper naming and descriptions for better organization

## 🔒 File Type Support

### Photos
- JPEG, PNG, GIF, WebP
- Maximum size: 10MB

### Reports
- PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
- Text files (.txt)
- Images (JPEG, PNG)
- Maximum size: 50MB

## 🛠️ Troubleshooting

### Common Issues

1. **Upload Fails**: Check file size and type restrictions
2. **Permission Denied**: Ensure user is a project member
3. **Files Not Loading**: Verify upload directories exist and have proper permissions
4. **Navigation Errors**: Ensure screens are properly registered in navigation

### Debug Steps

1. Check backend console for error messages
2. Verify database tables exist and have correct structure
3. Confirm file upload directories exist
4. Check user authentication and project membership

## 📈 Future Enhancements

- Photo albums and collections
- Report versioning and approval workflows
- Advanced search and filtering
- Content sharing between projects
- Mobile app notifications for new content
- Content analytics and usage reports

## 🆘 Support

If you encounter any issues:

1. Check the console logs in both frontend and backend
2. Verify all database tables are created correctly
3. Ensure proper file permissions on upload directories
4. Confirm all dependencies are installed

---

**Note**: This functionality requires proper user authentication and project membership verification. Make sure your existing authentication system is working correctly before testing the new features.
