# How to Add Custom Loading GIF or Video

## Option 1: Using a GIF

### Step 1: Add your GIF file
1. Get your loading GIF file (e.g., `loading.gif`)
2. Copy it to the `/public` folder in your project
   - Path: `Project PESO/public/loading.gif`

### Step 2: Enable GIF in LoadingScreen.jsx
1. Open `src/components/LoadingScreen.jsx`
2. Find the section marked `// FOR GIF: Uncomment this block`
3. **Uncomment** that entire block (remove the `//` from the beginning)
4. **Comment out** or delete the "Option 2: Default animated loading" section at the bottom

Your code should look like this:
```jsx
return (
  <div className="loading-screen">
    <div className="loading-content">
      <img src="/loading.gif" alt="Loading..." className="loading-media" />
      <h1 className="loading-title">PESO Palayan City</h1>
      <p className="loading-subtitle">Applicant Registration System</p>
    </div>
  </div>
);
```

---

## Option 2: Using a Video

### Step 1: Add your video file
1. Get your loading video (recommended formats: `.mp4` and/or `.webm`)
2. Copy it to the `/public` folder
   - Path: `Project PESO/public/loading.mp4`

### Step 2: Enable Video in LoadingScreen.jsx
1. Open `src/components/LoadingScreen.jsx`
2. Find the section marked `// FOR VIDEO: Uncomment this block`
3. **Uncomment** that entire block
4. **Comment out** or delete the "Option 2: Default animated loading" section

Your code should look like this:
```jsx
return (
  <div className="loading-screen">
    <div className="loading-content">
      <video autoPlay loop muted playsInline className="loading-media">
        <source src="/loading.mp4" type="video/mp4" />
        <source src="/loading.webm" type="video/webm" />
      </video>
      <h1 className="loading-title">PESO Palayan City</h1>
      <p className="loading-subtitle">Applicant Registration System</p>
    </div>
  </div>
);
```

---

## How to See the Loading Screen

The loading screen shows for **3 seconds** when the app first loads.

### Method 1: Hard Refresh (Recommended)
Press one of these:
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### Method 2: Clear Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Method 3: Increase Loading Time
1. Open `src/App.jsx`
2. Find this line: `await new Promise(resolve => setTimeout(resolve, 3000));`
3. Change `3000` to `5000` (5 seconds) or longer
4. Save and refresh

---

## Customization Tips

### Change GIF/Video Size
Edit `src/components/LoadingScreen.css`:
```css
.loading-media {
  width: 300px;    /* Change this */
  height: 300px;   /* Change this */
  object-fit: contain;
}
```

### Remove Title/Subtitle
Delete these lines from LoadingScreen.jsx:
```jsx
<h1 className="loading-title">PESO Palayan City</h1>
<p className="loading-subtitle">Applicant Registration System</p>
```

### Change Background Color
Edit `LoadingScreen.css`:
```css
.loading-screen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change to solid color: */
  /* background: #428bca; */
}
```

---

## Recommended GIF/Video Sources

Free loading animations:
- **LottieFiles**: https://lottiefiles.com/
- **Loading.io**: https://loading.io/
- **Giphy**: https://giphy.com/search/loading
- **Icons8**: https://icons8.com/preloaders

Tips:
- Keep file size under 1MB for fast loading
- Use transparent backgrounds (for GIFs)
- Optimize videos with H.264 codec
- Size: 200x200 to 400x400 pixels works well
