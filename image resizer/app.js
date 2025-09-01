// ImageFlow Pro - Advanced Image Processing SaaS Platform
class ImageFlowApp {
  constructor() {
    this.images = [];
    this.peer = null;
    this.connections = [];
    this.storageData = {
      used: 0,
      limit: 1000 * 1024 * 1024, // 1GB
      originalSize: 0,
      compressedSize: 0
    };
    this.fileTypes = new Map();
    this.processingStats = {
      totalProcessed: 0,
      avgCompression: 0,
      timeSaved: 0,
      bandwidthSaved: 0
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupTheme();
    this.setupTabs();
    this.setupPeerConnection();
    this.generateQRCode();
    this.updateStats();
    this.registerServiceWorker();
    this.handleURLParameters();
  }

  setupEventListeners() {
    // File upload
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
      dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
      dropZone.addEventListener('drop', this.handleDrop.bind(this));
      fileInput.addEventListener('change', this.handleFileSelect.bind(this));
    }

    // Quick upload button
    const quickUpload = document.getElementById('quickUpload');
    if (quickUpload && fileInput) {
      quickUpload.addEventListener('click', () => fileInput.click());
    }

    // Processing controls
    const quickProcess = document.getElementById('quickProcess');
    const batchProcess = document.getElementById('batchProcess');
    if (quickProcess) quickProcess.addEventListener('click', this.quickProcess.bind(this));
    if (batchProcess) batchProcess.addEventListener('click', this.batchProcess.bind(this));

    // Quick presets
    document.querySelectorAll('.quick-preset').forEach(btn => {
      btn.addEventListener('click', (e) => this.applyPreset(e.target.dataset.preset));
    });

    // Quality slider
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    qualitySlider.addEventListener('input', (e) => {
      qualityValue.textContent = `${e.target.value}%`;
    });

    // Device connection
    document.getElementById('connectDevice').addEventListener('click', this.showDevicesTab.bind(this));
    document.getElementById('connectManual').addEventListener('click', this.connectManual.bind(this));
    document.getElementById('regenerateQR').addEventListener('click', this.generateQRCode.bind(this));

    // Floating action button
    document.getElementById('floatingAction').addEventListener('click', () => fileInput.click());
  }

  setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    
    // Check for saved theme preference or default to 'light' mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    
    // Update icons
    sunIcon.classList.toggle('hidden', currentTheme === 'light');
    moonIcon.classList.toggle('hidden', currentTheme === 'dark');
    
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark');
      
      sunIcon.classList.toggle('hidden');
      moonIcon.classList.toggle('hidden');
      
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        contents.forEach(content => {
          content.classList.remove('active');
          if (content.id === `${tabName}Tab`) {
            content.classList.add('active');
          }
        });
      });
    });
  }

  async setupPeerConnection() {
    try {
      this.peer = new Peer({
        host: 'peerjs-server.herokuapp.com',
        port: 443,
        secure: true,
        debug: 2
      });
      
      this.peer.on('open', (id) => {
        console.log('Peer connection established:', id);
        this.updateConnectionStatus('connected', `ID: ${id}`);
      });

      this.peer.on('connection', (conn) => {
        this.handleIncomingConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        this.updateConnectionStatus('disconnected', 'Connection failed');
      });
      
    } catch (error) {
      console.error('Failed to setup peer connection:', error);
      this.updateConnectionStatus('disconnected', 'Offline mode');
    }
  }

  async generateQRCode() {
    if (!this.peer || !this.peer.id) {
      setTimeout(() => this.generateQRCode(), 1000);
      return;
    }
    
    const qrContainer = document.getElementById('qrCode');
    const connectionUrl = `${window.location.origin}?connect=${this.peer.id}`;
    
    try {
      qrContainer.innerHTML = '';
      const canvas = await QRCode.toCanvas(connectionUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#667eea',
          light: '#ffffff'
        }
      });
      qrContainer.appendChild(canvas);
    } catch (error) {
      console.error('QR Code generation failed:', error);
      qrContainer.innerHTML = '<p class="text-red-500">QR kód generálása sikertelen</p>';
    }
  }

  handleIncomingConnection(conn) {
    this.connections.push(conn);
    this.updateDeviceList();
    
    conn.on('data', (data) => {
      if (data.type === 'file') {
        this.receiveFile(data);
      }
    });

    conn.on('close', () => {
      this.connections = this.connections.filter(c => c !== conn);
      this.updateDeviceList();
    });
  }

  connectManual() {
    const deviceId = document.getElementById('deviceId').value.trim();
    if (!deviceId) {
      this.showNotification('Kérem adja meg az eszköz ID-ját!', 'warning');
      return;
    }

    try {
      const conn = this.peer.connect(deviceId);
      conn.on('open', () => {
        this.connections.push(conn);
        this.updateDeviceList();
        this.showNotification('Eszköz sikeresen csatlakoztatva!', 'success');
        document.getElementById('deviceId').value = '';
      });

      conn.on('error', (err) => {
        console.error('Connection error:', err);
        this.showNotification('Csatlakozás sikertelen!', 'error');
      });
    } catch (error) {
      console.error('Manual connection failed:', error);
      this.showNotification('Csatlakozás sikertelen!', 'error');
    }
  }

  updateConnectionStatus(status, message) {
    const indicator = document.getElementById('connectionIndicator');
    const statusText = document.getElementById('connectionStatus');
    const connectionBar = document.getElementById('connectionBar');
    
    indicator.className = `connection-indicator ${status} w-3 h-3 rounded-full`;
    indicator.classList.add(status === 'connected' ? 'bg-green-500' : 
                           status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500');
    
    statusText.textContent = message;
    
    if (status === 'connected') {
      connectionBar.classList.remove('-translate-y-full');
    }
  }

  updateDeviceList() {
    const deviceList = document.getElementById('deviceList');
    const deviceCount = document.getElementById('deviceCount');
    const connectedCount = document.getElementById('connectedCount');
    const connectedDevices = document.getElementById('connectedDevices');
    
    deviceCount.textContent = this.connections.length;
    connectedCount.textContent = this.connections.length;
    connectedDevices.textContent = `${this.connections.length} eszköz csatlakoztatva`;
    
    if (this.connections.length === 0) {
      deviceList.innerHTML = `
        <div class="text-center py-12 text-slate-500">
          <svg class="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p>Nincs csatlakoztatott eszköz</p>
          <p class="text-sm mt-2">Használja a QR kódot vagy az eszköz ID-t a csatlakozáshoz</p>
        </div>
      `;
      return;
    }
    
    deviceList.innerHTML = this.connections.map((conn, index) => `
      <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
        <div class="flex items-center gap-3">
          <div class="connection-indicator connected w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <h3 class="font-semibold">Eszköz ${index + 1}</h3>
            <p class="text-sm text-slate-500">ID: ${conn.peer.substring(0, 8)}...</p>
          </div>
        </div>
        <button onclick="app.disconnectDevice('${conn.peer}')" class="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
          Leválasztás
        </button>
      </div>
    `).join('');
  }

  disconnectDevice(peerId) {
    this.connections = this.connections.filter(conn => {
      if (conn.peer === peerId) {
        conn.close();
        return false;
      }
      return true;
    });
    this.updateDeviceList();
    this.showNotification('Eszköz leválasztva', 'info');
  }

  showDevicesTab() {
    document.querySelector('[data-tab="devices"]').click();
  }

  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    this.processFiles(files);
  }

  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.processFiles(files);
  }

  async processFiles(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      this.showNotification('Kérem válasszon képfájlokat!', 'warning');
      return;
    }

    this.showProgress(true, 'Képek betöltése...', imageFiles.length);
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      await this.addImage(file);
      this.updateProgress(i + 1, imageFiles.length);
    }
    
    this.hideProgress();
    this.updateStats();
    this.renderImages();
    this.showNotification(`${imageFiles.length} kép sikeresen betöltve!`, 'success');
  }

  async addImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const imageData = {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            width: img.width,
            height: img.height,
            src: e.target.result,
            processed: false,
            processedSize: null,
            processedSrc: null
          };
          
          this.images.push(imageData);
          this.storageData.originalSize += file.size;
          this.updateFileTypeStats(file.type, file.size);
          resolve();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  updateFileTypeStats(type, size) {
    const extension = type.split('/')[1].toUpperCase();
    if (this.fileTypes.has(extension)) {
      const current = this.fileTypes.get(extension);
      this.fileTypes.set(extension, {
        count: current.count + 1,
        size: current.size + size
      });
    } else {
      this.fileTypes.set(extension, { count: 1, size });
    }
  }

  renderImages() {
    const imageGrid = document.getElementById('imageGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (this.images.length === 0) {
      imageGrid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    imageGrid.innerHTML = this.images.map(img => this.createImageCard(img)).join('');
  }

  createImageCard(imageData) {
    const sizeInMB = (imageData.size / (1024 * 1024)).toFixed(2);
    const processedSizeMB = imageData.processedSize ? 
      (imageData.processedSize / (1024 * 1024)).toFixed(2) : null;
    
    const compressionRatio = processedSizeMB ? 
      Math.round((1 - imageData.processedSize / imageData.size) * 100) : 0;

    return `
      <div class="image-card animate-fade-in">
        <div class="aspect-square overflow-hidden">
          <img src="${imageData.src}" alt="${imageData.name}" 
               class="w-full h-full object-cover transition-transform hover:scale-110" 
               loading="lazy">
        </div>
        <div class="p-4">
          <h3 class="font-semibold truncate mb-2" title="${imageData.name}">${imageData.name}</h3>
          <div class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div class="flex justify-between">
              <span>Méret:</span>
              <span>${imageData.width}x${imageData.height}</span>
            </div>
            <div class="flex justify-between">
              <span>Fájlméret:</span>
              <span>${sizeInMB} MB</span>
            </div>
            ${processedSizeMB ? `
              <div class="flex justify-between text-green-600">
                <span>Tömörített:</span>
                <span>${processedSizeMB} MB (-${compressionRatio}%)</span>
              </div>
            ` : ''}
          </div>
          <div class="flex gap-2 mt-4">
            <button onclick="app.processImage('${imageData.id}')" 
                    class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              ${imageData.processed ? 'Újra feldolgoz' : 'Feldolgoz'}
            </button>
            <button onclick="app.downloadImage('${imageData.id}')" 
                    class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button onclick="app.removeImage('${imageData.id}')" 
                    class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  applyPreset(preset) {
    const presets = {
      thumbnail: { width: 300, height: 300, quality: 80, format: 'webp' },
      social: { width: 1200, height: 1200, quality: 85, format: 'jpg' },
      web: { width: 800, height: null, quality: 75, format: 'webp' }
    };
    
    const config = presets[preset];
    if (!config) return;
    
    document.getElementById('customWidth').value = config.width;
    document.getElementById('customHeight').value = config.height || '';
    document.getElementById('qualitySlider').value = config.quality;
    document.getElementById('qualityValue').textContent = `${config.quality}%`;
    document.getElementById('quickFormat').value = config.format;
    
    this.showNotification(`${preset.toUpperCase()} preset alkalmazva`, 'info');
  }

  async quickProcess() {
    if (this.images.length === 0) {
      this.showNotification('Nincs feldolgozandó kép!', 'warning');
      return;
    }
    
    const format = document.getElementById('quickFormat').value;
    const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
    
    this.showProgress(true, 'Gyors feldolgozás...', this.images.length);
    
    for (let i = 0; i < this.images.length; i++) {
      await this.processImageWithSettings(this.images[i].id, { format, quality });
      this.updateProgress(i + 1, this.images.length);
    }
    
    this.hideProgress();
    this.updateStats();
    this.renderImages();
    this.showNotification('Gyors feldolgozás befejezve!', 'success');
  }

  async batchProcess() {
    if (this.images.length === 0) {
      this.showNotification('Nincs feldolgozandó kép!', 'warning');
      return;
    }
    
    const format = document.getElementById('quickFormat').value;
    const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
    const width = parseInt(document.getElementById('customWidth').value) || null;
    const height = parseInt(document.getElementById('customHeight').value) || null;
    const maintainAspect = document.getElementById('maintainAspect').checked;
    
    this.showProgress(true, 'Batch feldolgozás...', this.images.length);
    
    for (let i = 0; i < this.images.length; i++) {
      await this.processImageWithSettings(this.images[i].id, { 
        format, quality, width, height, maintainAspect 
      });
      this.updateProgress(i + 1, this.images.length);
    }
    
    this.hideProgress();
    this.updateStats();
    this.renderImages();
    this.showNotification('Batch feldolgozás befejezve!', 'success');
  }

  async processImage(imageId) {
    const image = this.images.find(img => img.id == imageId);
    if (!image) return;
    
    const format = document.getElementById('quickFormat').value;
    const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
    
    await this.processImageWithSettings(imageId, { format, quality });
    this.updateStats();
    this.renderImages();
    this.showNotification('Kép feldolgozva!', 'success');
  }

  async processImageWithSettings(imageId, settings) {
    const image = this.images.find(img => img.id == imageId);
    if (!image) return;
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          let { width, height } = settings;
          
          // Calculate dimensions
          if (width || height) {
            if (settings.maintainAspect !== false) {
              const aspectRatio = img.width / img.height;
              if (width && !height) {
                height = Math.round(width / aspectRatio);
              } else if (height && !width) {
                width = Math.round(height * aspectRatio);
              }
            }
          } else {
            width = img.width;
            height = img.height;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Use Pica for high-quality resizing
          const pica = window.pica();
          
          // Create a temporary canvas with original image
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          tempCtx.drawImage(img, 0, 0);
          
          try {
            await pica.resize(tempCanvas, canvas);
            
            // Convert to desired format
            const mimeType = `image/${settings.format}`;
            const processedDataUrl = canvas.toDataURL(mimeType, settings.quality);
            
            // Calculate processed size
            const base64Length = processedDataUrl.split(',')[1].length;
            const processedSize = Math.round(base64Length * 0.75); // Approximate size
            
            // Update image data
            image.processed = true;
            image.processedSrc = processedDataUrl;
            image.processedSize = processedSize;
            
            // Update storage stats
            this.storageData.compressedSize += processedSize;
            this.processingStats.totalProcessed++;
            
            resolve();
          } catch (error) {
            console.error('Processing error:', error);
            reject(error);
          }
        };
        
        img.onerror = reject;
        img.src = image.src;
      });
      
    } catch (error) {
      console.error('Failed to process image:', error);
      this.showNotification('Képfeldolgozás sikertelen!', 'error');
    }
  }

  downloadImage(imageId) {
    const image = this.images.find(img => img.id == imageId);
    if (!image) return;
    
    const dataUrl = image.processedSrc || image.src;
    const link = document.createElement('a');
    link.download = image.processed ? 
      `processed_${image.name}` : image.name;
    link.href = dataUrl;
    link.click();
    
    this.showNotification('Kép letöltve!', 'success');
  }

  removeImage(imageId) {
    const imageIndex = this.images.findIndex(img => img.id == imageId);
    if (imageIndex === -1) return;
    
    const image = this.images[imageIndex];
    this.storageData.originalSize -= image.size;
    if (image.processedSize) {
      this.storageData.compressedSize -= image.processedSize;
    }
    
    this.images.splice(imageIndex, 1);
    this.updateStats();
    this.renderImages();
    this.showNotification('Kép törölve!', 'info');
  }

  updateStats() {
    // Update main stats
    document.getElementById('totalImages').textContent = this.images.length;
    document.getElementById('totalProcessed').textContent = 
      this.images.filter(img => img.processed).length;
    
    const totalStorageMB = (this.storageData.originalSize / (1024 * 1024)).toFixed(1);
    document.getElementById('totalStorage').textContent = `${totalStorageMB} MB`;
    
    // Update storage analytics
    const usedStorageMB = (this.storageData.originalSize / (1024 * 1024)).toFixed(1);
    const limitGB = (this.storageData.limit / (1024 * 1024 * 1024)).toFixed(1);
    const usagePercent = (this.storageData.originalSize / this.storageData.limit) * 100;
    
    document.getElementById('usedStorage').textContent = `${usedStorageMB} MB / ${limitGB} GB`;
    document.getElementById('storageBar').style.width = `${Math.min(usagePercent, 100)}%`;
    
    const originalSizeMB = (this.storageData.originalSize / (1024 * 1024)).toFixed(1);
    const compressedSizeMB = (this.storageData.compressedSize / (1024 * 1024)).toFixed(1);
    
    document.getElementById('originalSize').textContent = `${originalSizeMB} MB`;
    document.getElementById('compressedSize').textContent = `${compressedSizeMB} MB`;
    
    const savingsPercent = this.storageData.originalSize > 0 ? 
      Math.round((1 - this.storageData.compressedSize / this.storageData.originalSize) * 100) : 0;
    document.getElementById('savingsPercent').textContent = `${savingsPercent}%`;
    
    // Update processing stats
    document.getElementById('totalProcessedStat').textContent = this.processingStats.totalProcessed;
    document.getElementById('avgCompressionStat').textContent = `${savingsPercent}%`;
    document.getElementById('totalTimeSavedStat').textContent = `${this.processingStats.timeSaved}s`;
    
    const bandwidthSavedMB = ((this.storageData.originalSize - this.storageData.compressedSize) / (1024 * 1024)).toFixed(1);
    document.getElementById('totalBandwidthSavedStat').textContent = `${bandwidthSavedMB} MB`;
    
    this.updateFileTypeChart();
  }

  updateFileTypeChart() {
    const chartContainer = document.getElementById('fileTypeChart');
    
    if (this.fileTypes.size === 0) {
      chartContainer.innerHTML = `
        <div class="text-center py-8 text-slate-500">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Nincs adat a megjelenítéshez</p>
        </div>
      `;
      return;
    }
    
    const totalSize = Array.from(this.fileTypes.values()).reduce((sum, data) => sum + data.size, 0);
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];
    
    chartContainer.innerHTML = Array.from(this.fileTypes.entries()).map(([type, data], index) => {
      const percentage = Math.round((data.size / totalSize) * 100);
      const sizeMB = (data.size / (1024 * 1024)).toFixed(1);
      const color = colors[index % colors.length];
      
      return `
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded" style="background-color: ${color}"></div>
            <div>
              <span class="font-medium">${type}</span>
              <div class="text-sm text-slate-500">${data.count} fájl • ${sizeMB} MB</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold">${percentage}%</div>
          </div>
        </div>
      `;
    }).join('');
  }

  showProgress(show, title = '', total = 0) {
    const modal = document.getElementById('progressModal');
    const titleEl = document.getElementById('progressTitle');
    const textEl = document.getElementById('progressText');
    const totalEl = document.getElementById('progressTotal');
    
    if (show) {
      titleEl.textContent = title;
      textEl.textContent = 'Feldolgozás folyamatban...';
      totalEl.textContent = total;
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  }

  updateProgress(current, total) {
    const fillEl = document.getElementById('progressFill');
    const countEl = document.getElementById('progressCount');
    
    const percentage = Math.round((current / total) * 100);
    fillEl.style.width = `${percentage}%`;
    countEl.textContent = current;
  }

  hideProgress() {
    this.showProgress(false);
  }

  showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    notification.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in`;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="font-bold">${icons[type]}</span>
        <span>${message}</span>
      </div>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.5s ease-in-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 5000);
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js');
        console.log('Service Worker registered successfully:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle action parameter from PWA shortcuts
    const action = urlParams.get('action');
    if (action === 'upload') {
      document.getElementById('fileInput').click();
    } else if (action === 'connect') {
      this.showDevicesTab();
    }
    
    // Handle connection parameter
    const connectId = urlParams.get('connect');
    if (connectId) {
      setTimeout(() => {
        if (this.peer && this.peer.id) {
          document.getElementById('deviceId').value = connectId;
          this.connectManual();
        }
      }, 2000); // Wait for peer connection to establish
    }
  }

  // File sharing methods
  sendFile(imageId, connectionId) {
    const image = this.images.find(img => img.id == imageId);
    const connection = this.connections.find(conn => conn.peer === connectionId);
    
    if (!image || !connection) {
      this.showNotification('Fájl küldése sikertelen!', 'error');
      return;
    }
    
    const fileData = {
      type: 'file',
      name: image.name,
      data: image.processedSrc || image.src,
      size: image.processedSize || image.size
    };
    
    connection.send(fileData);
    this.showNotification('Fájl elküldve!', 'success');
  }

  receiveFile(data) {
    // Create a download link for received file
    const link = document.createElement('a');
    link.href = data.data;
    link.download = data.name;
    link.click();
    
    this.showNotification(`Fájl érkezett: ${data.name}`, 'success');
  }

  // Batch download
  async downloadAll() {
    if (this.images.length === 0) {
      this.showNotification('Nincs letöltendő kép!', 'warning');
      return;
    }
    
    this.showProgress(true, 'ZIP fájl létrehozása...', this.images.length);
    
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < this.images.length; i++) {
        const image = this.images[i];
        const dataUrl = image.processedSrc || image.src;
        const base64Data = dataUrl.split(',')[1];
        const fileName = image.processed ? `processed_${image.name}` : image.name;
        
        zip.file(fileName, base64Data, { base64: true });
        this.updateProgress(i + 1, this.images.length);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `imageflow_export_${new Date().toISOString().split('T')[0]}.zip`);
      
      this.hideProgress();
      this.showNotification('Összes kép letöltve ZIP fájlban!', 'success');
      
    } catch (error) {
      console.error('Batch download failed:', error);
      this.hideProgress();
      this.showNotification('ZIP létrehozása sikertelen!', 'error');
    }
  }
}

// Add CSS animations for slide out
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);

// Initialize the application
const app = new ImageFlowApp();

// URL parameters are now handled in the app.handleURLParameters() method

// Add global functions for HTML onclick handlers
window.downloadAll = () => app.downloadAll();
window.app = app; // Make app instance globally available