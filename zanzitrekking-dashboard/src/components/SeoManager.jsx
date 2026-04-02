
import  { useState ,useEffect } from 'react';
import _ from 'lodash';
import { IoMdImage } from "react-icons/io";

const SeoManager = ({ watch, setValue, data, onUpdate}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [image, setImage] = useState(null);
  const seoData = watch ? watch("seo") : data ;

  const tabs = [
    { id: 'general', label: 'General Options' },
    { id: 'openGraph', label: 'Open Graph' },
    { id: 'twitter', label: 'Twitter' },
  ];

  useEffect(() => {
    const currentFile = seoData?.[activeTab]?.image;

    if (!currentFile) {
      setImage(null);
      return;
    }

    // If it's already a string (URL from database), just show it
    if (typeof currentFile === 'string') {
      setImage(currentFile);
    } 
    // If it's a File object (newly uploaded), create a temporary URL
    else if (currentFile instanceof File) {
      const objectUrl = URL.createObjectURL(currentFile);
      setImage(objectUrl);

      // Memory Cleanup: prevent memory leaks
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [seoData, activeTab]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      const path = `seo.${activeTab}.image`;
      if (setValue) {
        setValue(path, file, { shouldValidate: true });
      } else if (onUpdate) {
        onUpdate(path, file);
      }
    }
  };

  const handleUpdate = (path, value) => {
    if (setValue) {
      setValue(path, value, { shouldValidate: true, shouldDirty: true });
    } else if (onUpdate) {
      onUpdate(path, value);
    }
  };
  
  const getTabLabel = (id) => (id === 'general' ? 'Seo' : _.capitalize(id));

  return (
    <div className=" mx-auto font-sans text-gray-700">
      <h2 className="text-sm font-bold text-gray-800 mb-2 px-0">Seo Manager</h2>

      <div className="bg-white border-2 border-primary-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          
          <div className="mb-6">
            <label className="block mb-2 text-sm text-gray-800">
              Allow search engines to show this service in search results?
            </label>
            <div>
              <select 
              value={seoData?.allowSearch}
              className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
              onChange={(e) => handleUpdate("seo.allowSearch", e.target.value)}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="flex border-b-2 border-primary-200">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm relative ${
                  activeTab === tab.id
                    ? 'bg-white border-t-2 border-l-2 border-r-2 border-primary-200 border-b-white -mb-[2px] text-secondary font-bold z-10 rounded-t-lg'
                    : 'text-primary-400 hover:text-secondary border-b-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 border-2 border-t-0 border-primary-200 rounded-b-lg bg-white">
            <div className="space-y-6">
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-800">
                  {getTabLabel(activeTab)} Title
                </label>
                <input
                  key={`${activeTab}-title`}
                  type="text"
                  placeholder="Seo Title"
                  value={seoData?.[activeTab]?.title || ""}
                  onChange={(e) => handleUpdate(`seo.${activeTab}.title`, e.target.value)}
                  className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-800">
                  {getTabLabel(activeTab)} Description
                </label>
                <textarea
                  key={`${activeTab}-desc`}
                  rows="4"
                  placeholder="Enter Description ..."
                  value={seoData?.[activeTab]?.description || ""}
                  onChange={(e) => handleUpdate(`seo.${activeTab}.description`, e.target.value)}
                  className="w-full rounded-lg border-2 border-primary-200 bg-white px-4 py-2.5 text-sm text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-800">
                  {activeTab === 'general' ? 'Featured Image' : `${getTabLabel(activeTab)} Image`}
                </label>
                
                <label className="group relative w-48 h-48 border-2 border-dashed border-primary-200 rounded-lg flex flex-col items-center justify-center bg-gray-50/50 overflow-hidden cursor-pointer transition-all hover:border-secondary">
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                  />

                  {image ? (
                    <>
                      <img 
                        src={image} 
                        alt="Preview" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      
                      {/* Hover Overlay with secondary color icon box */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="rounded-xl bg-secondary p-4 shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          <IoMdImage className="text-2xl text-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 text-text-light transition-all">
                      <div className="rounded-xl bg-secondary p-4 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                        <IoMdImage className="h-8 w-8 text-white" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 group-hover:text-secondary group-hover:opacity-100">
                        Upload Image
                      </span>
                    </div>
                  )}
                </label>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeoManager;