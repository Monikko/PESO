# Resume Upload - Supported File Types

## 📄 Overview

Applicants can now upload their resume as **PDF files** or **scanned images** (JPG, PNG, etc.) in Step 1 of the registration form.

---

## ✅ Accepted File Types

### **PDF Documents**
- `.pdf` - Standard PDF documents
- MIME type: `application/pdf`

### **Image Files** (for scanned documents)
- `.jpg` / `.jpeg` - JPEG images
- `.png` - PNG images
- `.webp` - WebP images
- `.gif` - GIF images
- `.bmp` - Bitmap images
- `.tiff` / `.tif` - TIFF images

All common image formats used for scanning documents are supported!

---

## 📏 File Size Limit

**Maximum file size:** 10MB

This is large enough for:
- High-quality scanned documents
- Multi-page PDF resumes
- Photos of printed resumes

If a file exceeds 10MB, the user will see:
```
Error: File size must be less than 10MB.
```

---

## 🎯 Use Cases

### **PDF Upload**
✅ Traditional resume in PDF format  
✅ Multi-page resume documents  
✅ Professional resumes from word processors  

### **Image Upload** (Scanned Documents)
✅ Scanned paper resume using phone camera  
✅ Photocopied documents  
✅ Screenshots of digital resumes  
✅ Photos of printed resumes  

---

## 🖥️ User Interface

### **Before Upload**
- Placeholder text: **"PDF or Image (JPG, PNG, etc.)"**
- Upload box displays file type icon
- "Choose File" and "Upload resume" buttons

### **After Upload**
- File name displayed in green (✅)
- File size shown
- "Download / Print Resume" button appears
- User can replace the file by uploading again

### **Error States**
**Invalid file type:**
```
Error: Only PDF and image files (JPG, PNG, WEBP, etc.) are allowed.
```

**File too large:**
```
Error: File size must be less than 10MB.
```

---

## 🔧 Technical Implementation

### **Validation Logic**
1. Check file extension (`.pdf`, `.jpg`, `.png`, etc.)
2. Check MIME type (`application/pdf`, `image/jpeg`, etc.)
3. Check file size (max 10MB)
4. If all pass → Accept file
5. If any fail → Show error message

### **Accepted MIME Types**
```javascript
'application/pdf',
'image/jpeg',
'image/jpg',
'image/png',
'image/webp',
'image/gif',
'image/bmp',
'image/tiff'
```

### **Accepted Extensions**
```javascript
'pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif'
```

### **File Input Accept Attribute**
```html
accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,application/pdf,image/*"
```

This tells the file picker to filter and show only these file types.

---

## 📱 Mobile Scanning Tips

For applicants using their phones to scan documents:

### **Best Practices**
1. Use good lighting
2. Place document flat on surface
3. Hold phone directly above (not at angle)
4. Use phone's built-in scanner app if available
5. Save as JPG or PNG format
6. Ensure file is under 10MB

### **Recommended Apps**
- iPhone: Notes app (built-in scanner)
- Android: Google Drive, Office Lens, CamScanner
- Any camera app with document mode

---

## 🧪 Testing Guide

### **Test 1: PDF Upload**
1. Go to Step 1 of registration form
2. Click "Choose File" or "Upload resume"
3. Select a PDF file
4. ✅ Should accept and show filename in green
5. ✅ "Download / Print Resume" button appears

### **Test 2: JPG Image Upload**
1. Click "Choose File"
2. Select a `.jpg` or `.jpeg` image
3. ✅ Should accept the file
4. ✅ File name displayed

### **Test 3: PNG Image Upload**
1. Click "Choose File"
2. Select a `.png` image
3. ✅ Should accept the file

### **Test 4: Invalid File Type**
1. Click "Choose File"
2. Try to select a `.docx` or `.txt` file
3. ✅ Should show error: "Only PDF and image files..."
4. ✅ File should not be uploaded

### **Test 5: File Too Large**
1. Click "Choose File"
2. Select a file larger than 10MB
3. ✅ Should show error: "File size must be less than 10MB."
4. ✅ File should not be uploaded

### **Test 6: Replace File**
1. Upload a PDF file
2. Click "Upload resume" again
3. Select an image file
4. ✅ Should replace the PDF with the image
5. ✅ New filename displayed

### **Test 7: Mobile Upload**
1. Open form on mobile device
2. Click "Choose File"
3. ✅ Should open camera/gallery picker
4. Take photo or select from gallery
5. ✅ Should upload successfully

---

## 📊 File Storage

### **Supabase Storage**
- **Bucket:** `applicant-files`
- **Path structure:** `resumes/{applicantId}/{filename}`
- **Access:** Public (for authenticated users)
- **URL stored in:** `applicants.resume_url` column

### **Database Column**
```sql
resume_url TEXT  -- Stores Supabase Storage URL
```

Example URL:
```
https://[project].supabase.co/storage/v1/object/public/applicant-files/resumes/123-abc/john-doe-resume.pdf
```

---

## 🎨 Visual Feedback

### **Upload States**

**No file:**
- 📄 Gray placeholder icon
- Text: "PDF or Image (JPG, PNG, etc.)"
- Gray text color

**File selected:**
- ✅ Green checkmark or icon
- File name in **bold green**
- File size displayed

**Error:**
- ❌ Red error message
- File not accepted
- Previous file (if any) cleared

---

## 🚀 Benefits

### **For Applicants**
✅ Can use phone camera to scan resume  
✅ No need for PDF conversion apps  
✅ Faster application process  
✅ Works with photos of printed resumes  

### **For Administrators**
✅ More applicants can complete registration  
✅ Easier for applicants without tech skills  
✅ Same viewing experience (Supabase handles display)  
✅ All files stored securely in one place  

---

## 🔒 Security Notes

### **File Type Validation**
- Both extension AND MIME type checked
- Prevents malicious file uploads
- Only image and PDF MIME types accepted

### **File Size Limit**
- 10MB maximum prevents storage abuse
- Large enough for legitimate use
- Protects against DoS attacks

### **Storage Security**
- Files stored in Supabase Storage (secure)
- Row Level Security (RLS) policies applied
- Public access only for authenticated users
- File URLs are signed and time-limited (optional)

---

## 📝 Summary

✅ **PDF files** - Traditional resume format  
✅ **JPG/PNG images** - Scanned documents and photos  
✅ **10MB max size** - Large enough for quality scans  
✅ **Easy validation** - Clear error messages  
✅ **Mobile-friendly** - Camera upload supported  
✅ **Secure storage** - Supabase Storage with RLS  

**The resume upload now accepts both PDF and image files, making it easier for applicants to submit scanned documents!** 📸
