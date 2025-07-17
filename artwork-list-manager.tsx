import React, { useState, useEffect } from 'react';
import { Upload, Edit2, Plus, X, Save, Image, Download, FileUp, Search, Database, CheckCircle, AlertCircle, Printer, Palette, Moon, Sun } from 'lucide-react';
import * as XLSX from 'xlsx';

const ArtworkListManager = () => {
  const [artworks, setArtworks] = useState([
    {
      id: 1,
      photo: null,
      number: 'AW001',
      artist: '王小明',
      title: '晨曦',
      concept: '描繪清晨第一道光線穿透雲層的美麗時刻',
      medium: '油彩、畫布',
      size: '60 x 80 cm',
      price: 'NT$ 45,000',
      status: 'Available'
    }
  ]);
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [fontSize, setFontSize] = useState('normal');
  const [darkMode, setDarkMode] = useState(false);

  const statusOptions = ['Available', 'On Hold', 'Sold', 'NFS'];
  const statusColors = {
    'Available': darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800',
    'On Hold': darkMode ? 'bg-yellow-900 text-yellow-100' : 'bg-yellow-100 text-yellow-800',
    'Sold': darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800',
    'NFS': darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
  };

  const fontSizeClasses = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  // 深色模式切換
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 搜尋過濾功能
  const filteredArtworks = artworks.filter(artwork => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    switch (searchField) {
      case 'artist':
        return artwork.artist.toLowerCase().includes(searchLower);
      case 'title':
        return artwork.title.toLowerCase().includes(searchLower);
      case 'medium':
        return artwork.medium.toLowerCase().includes(searchLower);
      case 'status':
        return artwork.status.toLowerCase().includes(searchLower);
      case 'all':
      default:
        return (
          artwork.artist.toLowerCase().includes(searchLower) ||
          artwork.title.toLowerCase().includes(searchLower) ||
          artwork.medium.toLowerCase().includes(searchLower) ||
          artwork.concept.toLowerCase().includes(searchLower) ||
          artwork.number.toLowerCase().includes(searchLower)
        );
    }
  });

  // 列印功能
  const handlePrint = () => {
    const printContent = `
      <html>
      <head>
        <title>藝術作品清單</title>
        <style>
          @page { margin: 2cm; }
          body { font-family: Arial, sans-serif; }
          h1 { text-align: center; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .status { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
          .available { background-color: #d4edda; color: #155724; }
          .on-hold { background-color: #fff3cd; color: #856404; }
          .sold { background-color: #f8d7da; color: #721c24; }
          .nfs { background-color: #e2e3e5; color: #383d41; }
          .photo { width: 100px; height: 100px; object-fit: cover; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>藝術作品清單</h1>
        <p>列印日期：${new Date().toLocaleDateString('zh-TW')}</p>
        <p>總計：${filteredArtworks.length} 件作品</p>
        <table>
          <thead>
            <tr>
              <th>照片</th>
              <th>編號</th>
              <th>藝術家</th>
              <th>作品名稱</th>
              <th>創作理念</th>
              <th>媒材</th>
              <th>尺寸</th>
              <th>標價</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            ${filteredArtworks.map(artwork => `
              <tr>
                <td>${artwork.photo ? `<img src="${artwork.photo}" class="photo" />` : '無照片'}</td>
                <td>${artwork.number}</td>
                <td>${artwork.artist}</td>
                <td><strong>${artwork.title}</strong></td>
                <td>${artwork.concept}</td>
                <td>${artwork.medium}</td>
                <td>${artwork.size}</td>
                <td>${artwork.price}</td>
                <td><span class="status ${artwork.status.toLowerCase().replace(' ', '-')}">${artwork.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // 匯出 Excel 功能
  const exportToExcel = () => {
    const exportData = artworks.map(({ id, photo, ...rest }) => ({
      編號: rest.number,
      藝術家: rest.artist,
      作品名稱: rest.title,
      創作理念: rest.concept,
      媒材: rest.medium,
      尺寸: rest.size,
      標價: rest.price,
      狀態: rest.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "作品清單");
    
    // 設定欄寬
    const colWidths = [
      { wch: 10 }, // 編號
      { wch: 15 }, // 藝術家
      { wch: 20 }, // 作品名稱
      { wch: 40 }, // 創作理念
      { wch: 15 }, // 媒材
      { wch: 15 }, // 尺寸
      { wch: 15 }, // 標價
      { wch: 10 }  // 狀態
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `藝術作品清單_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '')}.xlsx`);
  };

  // 匯入 Excel/CSV 功能
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const importedArtworks = data.map((row, index) => ({
          id: Date.now() + index,
          photo: null,
          number: row['編號'] || row['number'] || '',
          artist: row['藝術家'] || row['artist'] || '',
          title: row['作品名稱'] || row['title'] || '',
          concept: row['創作理念'] || row['concept'] || '',
          medium: row['媒材'] || row['medium'] || '',
          size: row['尺寸'] || row['size'] || '',
          price: row['標價'] || row['price'] || '',
          status: row['狀態'] || row['status'] || 'Available'
        }));

        setArtworks([...artworks, ...importedArtworks]);
        alert(`成功匯入 ${importedArtworks.length} 筆作品資料！`);
      } catch (error) {
        alert('匯入失敗，請確認檔案格式是否正確');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImageUpload = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingId === id) {
          setFormData({ ...formData, photo: reader.result });
        } else {
          setArtworks(artworks.map(art => 
            art.id === id ? { ...art, photo: reader.result } : art
          ));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e, id) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingId === id) {
          setFormData({ ...formData, photo: reader.result });
        } else {
          setArtworks(artworks.map(art => 
            art.id === id ? { ...art, photo: reader.result } : art
          ));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (artwork) => {
    setEditingId(artwork.id);
    setFormData(artwork);
  };

  const handleSave = () => {
    setArtworks(artworks.map(art => 
      art.id === editingId ? formData : art
    ));
    setEditingId(null);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
    setShowAddForm(false);
  };

  const handleAdd = () => {
    const newArtwork = {
      id: Date.now(),
      photo: null,
      number: '',
      artist: '',
      title: '',
      concept: '',
      medium: '',
      size: '',
      price: '',
      status: 'Available'
    };
    setFormData(newArtwork);
    setShowAddForm(true);
  };

  const handleAddSave = () => {
    setArtworks([...artworks, { ...formData, id: Date.now() }]);
    setShowAddForm(false);
    setFormData({});
  };

  const handleDelete = (id) => {
    if (window.confirm('確定要刪除這件作品嗎？')) {
      setArtworks(artworks.filter(art => art.id !== id));
    }
  };

  const renderEditForm = (artwork, isNew = false) => (
    <tr className={darkMode ? 'bg-gray-800' : 'bg-blue-50'}>
      <td colSpan="10" className="p-2 md:p-4">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 ${darkMode ? 'bg-gray-900' : 'bg-white'} p-4 md:p-6 rounded-lg shadow-inner`}>
          <div className="col-span-1 md:col-span-2">
            <label className={`block ${fontSizeClasses[fontSize]} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>作品照片</label>
            <div
              className={`border-2 border-dashed ${darkMode ? 'border-gray-600 hover:border-blue-400' : 'border-gray-300 hover:border-blue-400'} rounded-lg p-4 md:p-8 text-center transition-colors cursor-pointer`}
              onDrop={(e) => handleDrop(e, artwork.id)}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById(`upload-${artwork.id}`).click()}
            >
              {formData.photo ? (
                <img src={formData.photo} alt="作品" className="max-h-32 md:max-h-48 mx-auto" />
              ) : (
                <div>
                  <Image className={`mx-auto h-8 w-8 md:h-12 md:w-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`mt-2 ${fontSizeClasses[fontSize]} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>點擊或拖曳圖片到這裡上傳</p>
                </div>
              )}
              <input
                id={`upload-${artwork.id}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, artwork.id)}
              />
            </div>
          </div>
          
          <div>
            <label className={`block ${fontSizeClasses[fontSize]} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>編號</label>
            <input
              type="text"
              value={formData.number || ''}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'} ${fontSizeClasses[fontSize]}`}
              placeholder="例：AW001"
            />
          </div>
          
          <div>
            <label className={`block ${fontSizeClasses[fontSize]} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>藝術家</label>
            <input
              type="text"
              value={formData.artist || ''}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'} ${fontSizeClasses[fontSize]}`}
              placeholder="藝術家姓名"
            />
          </div>
          
          <div>
            <label className={`block ${fontSizeClasses[fontSize]} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>作品名稱</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'} ${fontSizeClasses[fontSize]}`}
              placeholder="作品名稱"
            />
          </div>
          
          <div>
            <label className={`block ${fontSizeClasses[fontSize]} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>媒材</label>
            <input
              type="text"
              value={formData.medium || ''}
              onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
              className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'} ${fontSizeClasses[fontSize]}`}
              placeholder="例：油彩、畫布"
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className={`block ${fontSizeClasses[fontSize]} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>創作理念</label>
            <textarea
              value={formData.concept || ''}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'} ${fontSizeClasses[fontSize]}`}
              rows="3"
              placeholder="描述作品的創作理念"
            />
          </div>
          
          <div>
            <label className={`block ${fontSizeClasses[fontSize]} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>尺寸</label>
            <input
              type="text"
              value={formData.size || ''}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'} ${fontSizeClasses[fontSize]}`}
              placeholder="例：60 x 80 cm"
            />
          </div>
          
          <div>
            <label className={`block ${fontSizeClasses[fontSize]} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>標價</label>
            <input
              type="text"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'} ${fontSizeClasses[fontSize]}`}
              placeholder="例：NT$ 45,000"
            />
          </div>
          
          <div>
            <label className={`block ${fontSizeClasses[fontSize]} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>狀態</label>
            <select
              value={formData.status || 'Available'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'} ${fontSizeClasses[fontSize]}`}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-4">
            <button
              onClick={handleCancel}
              className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} text-white rounded-md transition-colors ${fontSizeClasses[fontSize]}`}
            >
              取消
            </button>
            <button
              onClick={isNew ? handleAddSave : handleSave}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 ${fontSizeClasses[fontSize]}`}
            >
              <Save size={16} />
              儲存
            </button>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      <div className={`max-w-7xl mx-auto p-2 md:p-4 ${fontSizeClasses[fontSize]}`}>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6`}>
          {/* 頂部工具列 */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h1 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>藝術作品管理系統</h1>
            
            <div className="flex flex-wrap gap-2 md:gap-3 w-full lg:w-auto">
              {/* 視覺設定 */}
              <div className="flex gap-1">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                  title="切換深色模式"
                >
                  {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                </button>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className={`px-2 py-1 rounded-md ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
                  title="調整字體大小"
                >
                  <option value="small">小</option>
                  <option value="normal">中</option>
                  <option value="large">大</option>
                  <option value="xlarge">特大</option>
                </select>
              </div>
              
              {/* 資料庫狀態 */}
              <div className={`flex items-center gap-2 px-3 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md`}>
                {isConnected ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm text-green-600 hidden sm:inline">已連接雲端</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-yellow-600" />
                    <span className="text-sm text-yellow-600 hidden sm:inline">本機模式</span>
                  </>
                )}
              </div>
              
              {/* 功能按鈕 */}
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
                title="列印"
              >
                <Printer size={20} />
                <span className="hidden sm:inline">列印</span>
              </button>
              
              <label className="px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center gap-2 cursor-pointer">
                <FileUp size={20} />
                <span className="hidden sm:inline">匯入</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileImport}
                />
              </label>
              
              <button
                onClick={exportToExcel}
                className="px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center gap-2"
              >
                <Download size={20} />
                <span className="hidden sm:inline">匯出</span>
              </button>
              
              <button
                onClick={handleAdd}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">新增</span>
              </button>
            </div>
          </div>

          {/* 搜尋功能 */}
          <div className={`mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="搜尋作品..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white'} ${fontSizeClasses[fontSize]}`}
                />
              </div>
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white'} ${fontSizeClasses[fontSize]}`}
              >
                <option value="all">全部欄位</option>
                <option value="artist">藝術家</option>
                <option value="title">作品名稱</option>
                <option value="medium">媒材</option>
                <option value="status">狀態</option>
              </select>
            </div>
            {searchTerm && (
              <p className={`mt-2 ${fontSizeClasses[fontSize]} ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                找到 {filteredArtworks.length} 筆符合的作品
              </p>
            )}
          </div>

          {/* 作品列表 - 桌面版 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : ''}`}>作品照片</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : ''}`}>編號</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : ''}`}>藝術家</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : ''}`}>作品名稱</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : ''}`}>創作理念</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : ''}`}>媒材</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : ''}`}>尺寸</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : ''}`}>標價</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : ''}`}>狀態</th>
                  <th className={`px-4 py-3 text-left ${darkMode ? 'text-gray-200' : ''}`}>操作</th>
                </tr>
              </thead>
              <tbody>
                {showAddForm && renderEditForm({ id: 'new' }, true)}
                {filteredArtworks.map((artwork) => (
                  <React.Fragment key={artwork.id}>
                    {editingId === artwork.id ? (
                      renderEditForm(artwork)
                    ) : (
                      <tr className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        <td className="px-4 py-3">
                          <div
                            className={`w-20 h-20 border-2 border-dashed ${darkMode ? 'border-gray-600 hover:border-blue-400' : 'border-gray-300 hover:border-blue-400'} rounded flex items-center justify-center overflow-hidden transition-colors cursor-pointer`}
                            onDrop={(e) => handleDrop(e, artwork.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => document.getElementById(`quick-upload-${artwork.id}`).click()}
                          >
                            {artwork.photo ? (
                              <img src={artwork.photo} alt={artwork.title} className="w-full h-full object-cover" />
                            ) : (
                              <Upload size={24} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                            )}
                            <input
                              id={`quick-upload-${artwork.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, artwork.id)}
                            />
                          </div>
                        </td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-200' : ''}`}>{artwork.number}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-200' : ''}`}>{artwork.artist}</td>
                        <td className={`px-4 py-3 font-medium ${darkMode ? 'text-gray-200' : ''}`}>{artwork.title}</td>
                        <td className={`px-4 py-3 max-w-xs ${darkMode ? 'text-gray-200' : ''}`}>
                          <p className="truncate">{artwork.concept}</p>
                        </td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-200' : ''}`}>{artwork.medium}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-200' : ''}`}>{artwork.size}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-200' : ''}`}>{artwork.price}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[artwork.status]}`}>
                            {artwork.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(artwork)}
                              className={`p-1 text-blue-600 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-100'} rounded transition-colors`}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(artwork.id)}
                              className={`p-1 text-red-600 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-red-100'} rounded transition-colors`}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* 作品列表 - 手機版卡片 */}
          <div className="md:hidden space-y-4">
            {showAddForm && (
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : ''}`}>新增作品</h3>
                {/* 編輯表單內容 */}
                <div className="space-y-3">
                  {/* 照片上傳 */}
                  <div>
                    <label className={`block ${fontSizeClasses[fontSize]} font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>作品照片</label>
                    <div
                      className={`border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer`}
                      onDrop={(e) => handleDrop(e, 'new')}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById(`upload-new`).click()}
                    >
                      {formData.photo ? (
                        <img src={formData.photo} alt="作品" className="max-h-32 mx-auto" />
                      ) : (
                        <div>
                          <Image className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>點擊或拖曳上傳</p>
                        </div>
                      )}
                      <input
                        id="upload-new"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'new')}
                      />
                    </div>
                  </div>
                  
                  {/* 其他欄位 */}
                  <input
                    type="text"
                    placeholder="編號"
                    value={formData.number || ''}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                  />
                  <input
                    type="text"
                    placeholder="藝術家"
                    value={formData.artist || ''}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                  />
                  <input
                    type="text"
                    placeholder="作品名稱"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                  />
                  <textarea
                    placeholder="創作理念"
                    value={formData.concept || ''}
                    onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                    rows="3"
                  />
                  <input
                    type="text"
                    placeholder="媒材"
                    value={formData.medium || ''}
                    onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                  />
                  <input
                    type="text"
                    placeholder="尺寸"
                    value={formData.size || ''}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                  />
                  <input
                    type="text"
                    placeholder="標價"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                  />
                  <select
                    value={formData.status || 'Available'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleCancel}
                      className={`flex-1 px-4 py-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} text-white rounded-md`}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAddSave}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                      儲存
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {filteredArtworks.map((artwork) => (
              <div key={artwork.id} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                {editingId === artwork.id ? (
                  // 編輯模式
                  <div className="space-y-3">
                    <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : ''}`}>編輯作品</h3>
                    {/* 照片上傳 */}
                    <div
                      className={`border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-4 text-center`}
                      onDrop={(e) => handleDrop(e, artwork.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById(`edit-upload-${artwork.id}`).click()}
                    >
                      {formData.photo ? (
                        <img src={formData.photo} alt="作品" className="max-h-32 mx-auto" />
                      ) : (
                        <div>
                          <Upload size={32} className={`mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <p className="mt-2 text-sm">點擊或拖曳上傳</p>
                        </div>
                      )}
                      <input
                        id={`edit-upload-${artwork.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, artwork.id)}
                      />
                    </div>
                    
                    {/* 編輯欄位 */}
                    <input
                      type="text"
                      placeholder="編號"
                      value={formData.number || ''}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                    />
                    <input
                      type="text"
                      placeholder="藝術家"
                      value={formData.artist || ''}
                      onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                    />
                    <input
                      type="text"
                      placeholder="作品名稱"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                    />
                    <textarea
                      placeholder="創作理念"
                      value={formData.concept || ''}
                      onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                      className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                      rows="3"
                    />
                    <input
                      type="text"
                      placeholder="媒材"
                      value={formData.medium || ''}
                      onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                      className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                    />
                    <input
                      type="text"
                      placeholder="尺寸"
                      value={formData.size || ''}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                    />
                    <input
                      type="text"
                      placeholder="標價"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                    />
                    <select
                      value={formData.status || 'Available'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className={`flex-1 px-4 py-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} text-white rounded-md`}
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md"
                      >
                        儲存
                      </button>
                    </div>
                  </div>
                ) : (
                  // 顯示模式
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className={`font-bold ${darkMode ? 'text-white' : ''}`}>{artwork.title}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{artwork.artist}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[artwork.status]}`}>
                        {artwork.status}
                      </span>
                    </div>
                    
                    {artwork.photo && (
                      <img src={artwork.photo} alt={artwork.title} className="w-full h-48 object-cover rounded mb-3" />
                    )}
                    
                    <div className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                      <p><span className="font-medium">編號：</span>{artwork.number}</p>
                      <p><span className="font-medium">媒材：</span>{artwork.medium}</p>
                      <p><span className="font-medium">尺寸：</span>{artwork.size}</p>
                      <p><span className="font-medium">標價：</span>{artwork.price}</p>
                      <p className="pt-2"><span className="font-medium">創作理念：</span><br/>{artwork.concept}</p>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleEdit(artwork)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md flex items-center justify-center gap-2"
                      >
                        <Edit2 size={16} />
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(artwork.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 使用說明 */}
          <div className={`mt-6 ${darkMode ? 'bg-blue-900' : 'bg-blue-50'} p-4 rounded-lg`}>
            <p className={`font-semibold mb-2 ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>💡 使用說明：</p>
            <div className={`grid md:grid-cols-2 gap-3 text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              <div>
                <p className="font-medium mb-1">基本操作：</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>點擊或拖曳圖片到虛線框內上傳照片</li>
                  <li>點擊編輯按鈕修改作品資料</li>
                  <li>使用搜尋框快速找到特定作品</li>
                  <li>調整字體大小或深色模式更舒適</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">資料管理：</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>匯出 Excel 可備份所有作品資料</li>
                  <li>匯入功能支援 Excel 和 CSV 檔案</li>
                  <li>列印功能可產生精美的作品目錄</li>
                  <li>雲端同步確保資料安全（需設定）</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Firebase 設定說明 */}
          <div className={`mt-4 ${darkMode ? 'bg-yellow-900' : 'bg-yellow-50'} p-4 rounded-lg`}>
            <p className={`font-semibold mb-2 ${darkMode ? 'text-yellow-100' : 'text-yellow-900'}`}>🔥 雲端資料庫設定：</p>
            <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-800'} mb-2`}>
              要啟用雲端同步功能，請按照以下步驟設定 Firebase：
            </p>
            <ol className={`list-decimal list-inside space-y-1 text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-800'} ml-2`}>
              <li>前往 <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a> 並建立新專案</li>
              <li>啟用 Firestore Database（選擇測試模式）</li>
              <li>在專案設定中取得您的設定資料</li>
              <li>將設定資料加入此系統即可開始同步</li>
            </ol>
            <button className={`mt-3 px-4 py-2 ${darkMode ? 'bg-yellow-700 hover:bg-yellow-600' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-md transition-colors flex items-center gap-2`}>
              <Database size={16} />
              設定雲端連線
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkListManager;